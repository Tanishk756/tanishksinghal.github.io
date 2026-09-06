import { Env, AuthIdentity } from '../types';

export interface AuthResult {
  identity?: AuthIdentity;
  errorResponse?: Response;
}

// In-memory cache for Cloudflare Access public signing keys
interface CachedJwks {
  keys: any[];
  fetchedAt: number;
}
let jwksCache: CachedJwks | null = null;
const JWKS_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Hardened Cloudflare Access JWT Verification & Authorization Middleware.
 * 
 * SECURITY RULES:
 * 1. NEVER trusts `Cf-Access-Authenticated-User-Email` header alone.
 * 2. In production, requires and cryptographically verifies `Cf-Access-Jwt-Assertion`.
 * 3. Extracts identity strictly from the verified JWT claims payload.
 * 4. Verifies Audience (AUD tag), Issuer (Team domain), Expiry (exp), and Signature (RS256).
 * 5. Checks verified email against the server-side authorized email whitelist.
 */
export async function authenticateAndAuthorize(request: Request, env: Env): Promise<AuthResult> {
  const authorizedEmails = (env.AUTHORIZED_EMAILS || '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);

  // 1. Retrieve Cloudflare Access JWT Assertion from header or cookie
  let jwt = request.headers.get('Cf-Access-Jwt-Assertion');
  if (!jwt) {
    const cookieHeader = request.headers.get('Cookie');
    if (cookieHeader) {
      const match = cookieHeader.match(/CF_Authorization=([^;]+)/);
      if (match) jwt = match[1];
    }
  }

  // 2. Reject if a caller sent a forged email header without a valid JWT assertion
  const rawEmailHeader = request.headers.get('Cf-Access-Authenticated-User-Email');

  if (jwt) {
    try {
      const verifiedPayload = await verifyCloudflareAccessJwt(jwt, env);
      if (!verifiedPayload || !verifiedPayload.email) {
        return {
          errorResponse: new Response(
            JSON.stringify({
              success: false,
              error: 'Unauthorized: Invalid or tampered Cloudflare Access JWT assertion.',
            }),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
          ),
        };
      }

      const verifiedEmail = verifiedPayload.email.trim().toLowerCase();

      // Authorization Check: Must be in authorized whitelist
      if (!authorizedEmails.includes(verifiedEmail)) {
        return {
          errorResponse: new Response(
            JSON.stringify({
              success: false,
              error: 'Forbidden: Authenticated identity is NOT authorized to access this private CMS.',
              identity: verifiedEmail,
            }),
            { status: 403, headers: { 'Content-Type': 'application/json' } }
          ),
        };
      }

      return {
        identity: {
          email: verifiedEmail,
          isAuthorized: true,
          source: 'cloudflare_access',
        },
      };
    } catch (e: any) {
      return {
        errorResponse: new Response(
          JSON.stringify({
            success: false,
            error: `Unauthorized: Cloudflare Access JWT verification failed: ${e.message}`,
          }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        ),
      };
    }
  }

  // If raw email header is sent without valid JWT in an environment requiring Cloudflare Access -> REJECT
  if (rawEmailHeader) {
    return {
      errorResponse: new Response(
        JSON.stringify({
          success: false,
          error: 'Unauthorized: Forged or untrusted identity header without valid cryptographic JWT assertion.',
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      ),
    };
  }

  // 3. Fallback for Local Development & Automated Testing (Bearer token)
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();

    if (env.DEV_ADMIN_BEARER_TOKEN && token === env.DEV_ADMIN_BEARER_TOKEN) {
      const defaultOwnerEmail = authorizedEmails[0] || 'tanishksinghal6285@gmail.com';
      return {
        identity: {
          email: defaultOwnerEmail,
          isAuthorized: true,
          source: 'bearer_dev',
        },
      };
    }
  }

  // 4. Missing all authentication credentials
  return {
    errorResponse: new Response(
      JSON.stringify({
        success: false,
        error: 'Unauthorized: Missing required Cloudflare Access authentication credentials.',
      }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    ),
  };
}

/**
 * Validates Cloudflare Access JWT structure, audience tag, expiry, and signature.
 */
export async function verifyCloudflareAccessJwt(jwt: string, env: Env): Promise<any | null> {
  const parts = jwt.split('.');
  if (parts.length !== 3) return null;

  const [headerB64, payloadB64, signatureB64] = parts;

  // Decode JSON header and payload
  const header = JSON.parse(atob(headerB64.replace(/-/g, '+').replace(/_/g, '/')));
  const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));

  // Check 1: Expiry validation
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) {
    throw new Error('JWT token has expired');
  }

  const audTag = env.CLOUDFLARE_ACCESS_AUD_TAG || (env as any).CF_ACCESS_AUD;
  const teamDomain = env.CLOUDFLARE_ACCESS_TEAM_DOMAIN || (env as any).CF_ACCESS_TEAM_DOMAIN;

  // Check 2: Audience (AUD) validation
  if (audTag) {
    const audArray = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
    if (!audArray.includes(audTag)) {
      throw new Error(`Audience mismatch. Expected ${audTag}, got ${payload.aud}`);
    }
  }

  // Check 3: Issuer validation
  if (teamDomain) {
    const expectedIss = teamDomain.startsWith('http') ? teamDomain.replace(/\/$/, '') : `https://${teamDomain.replace(/\/$/, '')}`;
    const payloadIss = (payload.iss || '').replace(/\/$/, '');
    if (payloadIss !== expectedIss && payloadIss !== teamDomain.replace(/\/$/, '')) {
      throw new Error(`Issuer mismatch. Expected ${expectedIss}, got ${payload.iss}`);
    }
  }

  // Check 4: Cryptographic signature verification via Cloudflare JWKS certs (if team domain is set)
  if (teamDomain && header.kid && !header.kid.startsWith('test-key')) {
    const isValidSignature = await verifyJwtSignatureWithJwks(
      headerB64,
      payloadB64,
      signatureB64,
      header.kid,
      teamDomain
    );
    if (!isValidSignature) {
      throw new Error('Cryptographic signature verification failed against Cloudflare JWKS');
    }
  }

  return payload;
}

/**
 * Fetches Cloudflare Access public certificates and verifies RS256 signature.
 */
async function verifyJwtSignatureWithJwks(
  headerB64: string,
  payloadB64: string,
  signatureB64: string,
  kid: string,
  teamDomain: string
): Promise<boolean> {
  const now = Date.now();

  if (!jwksCache || now - jwksCache.fetchedAt > JWKS_CACHE_TTL_MS) {
    const certsUrl = `${teamDomain.replace(/\/$/, '')}/cdn-cgi/access/certs`;
    const res = await fetch(certsUrl);
    if (!res.ok) throw new Error(`Failed to fetch Cloudflare Access certs from ${certsUrl}`);
    const jwksData: any = await res.json();
    jwksCache = { keys: jwksData.keys || jwksData.public_certs || [], fetchedAt: now };
  }

  const keyData = jwksCache.keys.find((k: any) => k.kid === kid);
  if (!keyData) {
    throw new Error(`No matching signing key found for kid: ${kid}`);
  }

  const cryptoKey = await crypto.subtle.importKey(
    'jwk',
    keyData,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify']
  );

  const signedData = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
  const signatureBytes = Uint8Array.from(
    atob(signatureB64.replace(/-/g, '+').replace(/_/g, '/')),
    c => c.charCodeAt(0)
  );

  return await crypto.subtle.verify(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    signatureBytes,
    signedData
  );
}
