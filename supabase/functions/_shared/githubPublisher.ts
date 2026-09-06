/**
 * GitHub App Publisher Service for Supabase Edge Functions.
 * 
 * ARCHITECTURAL SAFETY IN PHASE 9:
 * 1. Implements cryptographic GitHub App RS256 JWT generation and token exchange.
 * 2. Verifies repository read-access safely without performing commits.
 * 3. STRICT PHASE 9 GUARD: All tree creations, file updates, and commit mutations
 *    are structurally BLOCKED until explicit owner approval in a subsequent phase.
 * 4. Zero secret leakage: GitHub private keys and installation tokens are NEVER
 *    included in responses, logs, or client-facing objects.
 */

export interface GitHubPublishResult {
  success: boolean;
  jobId: string;
  commitSha?: string;
  message: string;
  error?: string;
}

export class GitHubPublisherService {
  private appId: string;
  private installationId: string;
  private privateKeyPem: string;
  private repoOwner: string;
  private repoName: string;
  private repoBranch: string;

  constructor(env: Record<string, string | undefined>) {
    this.appId = env.GITHUB_APP_ID || '';
    this.installationId = env.GITHUB_APP_INSTALLATION_ID || '';
    this.privateKeyPem = env.GITHUB_APP_PRIVATE_KEY_PEM || '';
    this.repoOwner = env.GITHUB_REPO_OWNER || 'Tanishk756';
    this.repoName = env.GITHUB_REPO_NAME || 'tanishksinghal.github.io';
    this.repoBranch = env.GITHUB_REPO_BRANCH || 'main';
  }

  hasCredentials(): boolean {
    return Boolean(this.appId && this.installationId && this.privateKeyPem);
  }

  /**
   * Non-mutating verification of GitHub App credentials and repository connectivity.
   */
  async verifyRepositoryAccess(): Promise<{ success: boolean; repository?: string; error?: string }> {
    if (!this.hasCredentials()) {
      return { success: false, error: 'Missing GitHub App server-side credentials' };
    }

    try {
      const installationToken = await this.getInstallationAccessToken();
      const res = await fetch(`https://api.github.com/repos/${this.repoOwner}/${this.repoName}`, {
        headers: {
          'Authorization': `Bearer ${installationToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Tanishk-Portfolio-Supabase-CMS',
        },
      });

      if (!res.ok) {
        return { success: false, error: `GitHub API error: HTTP ${res.status}` };
      }

      const repoData = await res.json();
      return {
        success: true,
        repository: repoData.full_name,
      };
    } catch (err: any) {
      return {
        success: false,
        error: `Failed to verify repository access: ${err.message}`,
      };
    }
  }

  /**
   * Executes publication workflow with Phase 9 commit prohibition safety guard.
   */
  async publishContentItem(
    contentType: string,
    contentId: string,
    triggeredBy: string
  ): Promise<GitHubPublishResult> {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    if (!this.hasCredentials()) {
      return {
        success: false,
        jobId,
        message: 'Publishing failed: GitHub App credentials are not configured in server environment.',
        error: 'MISSING_CREDENTIALS',
      };
    }

    // STRICT PHASE 9 PROHIBITION: Do NOT perform repository commits or pushes
    return {
      success: false,
      jobId,
      message: 'GitHub publishing is structurally locked during Phase 9 infrastructure migration. Zero mutations permitted without explicit owner sign-off.',
      error: 'PHASE_9_COMMIT_BLOCKED',
    };
  }

  /**
   * Generates a GitHub App JWT and exchanges it for an installation access token.
   */
  private async getInstallationAccessToken(): Promise<string> {
    const jwt = await this.generateAppJwt();
    const res = await fetch(
      `https://api.github.com/app/installations/${this.installationId}/access_tokens`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwt}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Tanishk-Portfolio-Supabase-CMS',
        },
      }
    );

    if (!res.ok) {
      throw new Error(`GitHub App installation token exchange failed with HTTP ${res.status}`);
    }

    const data = await res.json();
    return data.token;
  }

  /**
   * Generates a RS256 JWT for GitHub App authentication.
   */
  async generateAppJwt(): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    const header = { alg: 'RS256', typ: 'JWT' };
    const payload = {
      iat: now - 60,
      exp: now + 10 * 60,
      iss: this.appId,
    };

    const headerB64 = this.base64UrlEncode(JSON.stringify(header));
    const payloadB64 = this.base64UrlEncode(JSON.stringify(payload));
    const dataToSign = new TextEncoder().encode(`${headerB64}.${payloadB64}`);

    const privateKey = await this.importPrivateKey(this.privateKeyPem);
    const signature = await crypto.subtle.sign(
      'RSASSA-PKCS1-v1_5',
      privateKey,
      dataToSign
    );

    const signatureB64 = this.base64UrlEncode(
      String.fromCharCode(...new Uint8Array(signature))
    );

    return `${headerB64}.${payloadB64}.${signatureB64}`;
  }

  /**
   * Imports a PKCS#1 or PKCS#8 RSA private key PEM into Web Crypto CryptoKey.
   */
  async importPrivateKey(pem: string): Promise<CryptoKey> {
    const isPkcs1 = pem.includes('BEGIN RSA PRIVATE KEY');
    const cleanPem = pem
      .replace(/-----BEGIN (?:RSA )?PRIVATE KEY-----/g, '')
      .replace(/-----END (?:RSA )?PRIVATE KEY-----/g, '')
      .replace(/\s+/g, '');

    if (!cleanPem) {
      throw new Error('Invalid private key: empty PEM content');
    }

    let binary: string;
    try {
      binary = atob(cleanPem);
    } catch {
      throw new Error('Invalid private key: malformed base64 encoding');
    }

    let bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    // If the key is in PKCS#1 format, wrap it in PKCS#8 ASN.1 structure
    if (isPkcs1) {
      bytes = this.convertPkcs1ToPkcs8(bytes);
    }

    return await crypto.subtle.importKey(
      'pkcs8',
      bytes.buffer as ArrayBuffer,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['sign']
    );
  }

  /**
   * Wraps PKCS#1 RSAPrivateKey DER into PKCS#8 PrivateKeyInfo ASN.1 structure.
   */
  private convertPkcs1ToPkcs8(pkcs1: Uint8Array): Uint8Array {
    const version = [0x02, 0x01, 0x00];
    const algoId = [0x30, 0x0d, 0x06, 0x09, 0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x01, 0x05, 0x00];
    const octetLen = this.encodeDerLength(pkcs1.length);
    const octetString = new Uint8Array([0x04, ...octetLen, ...pkcs1]);
    
    const inner = new Uint8Array([...version, ...algoId, ...octetString]);
    const seqLen = this.encodeDerLength(inner.length);
    return new Uint8Array([0x30, ...seqLen, ...inner]);
  }

  /**
   * Helper to encode variable-length ASN.1 DER length field.
   */
  private encodeDerLength(len: number): number[] {
    if (len < 128) return [len];
    if (len <= 255) return [0x81, len];
    if (len <= 65535) return [0x82, (len >> 8) & 0xff, len & 0xff];
    return [0x83, (len >> 16) & 0xff, (len >> 8) & 0xff, len & 0xff];
  }

  private base64UrlEncode(str: string): string {
    return btoa(str)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }
}
