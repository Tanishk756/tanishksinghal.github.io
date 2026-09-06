/**
 * Hardened Restrictive CORS Configuration for Supabase Edge Functions.
 * 
 * Explicit Allow-list Only:
 * - https://tanishk756.github.io
 * - https://admin.tanishksinghal.com
 * - http://localhost:5173
 * - http://localhost:4173
 * - http://127.0.0.1:5173
 * - http://127.0.0.1:4173
 * 
 * Wildcard (*) and arbitrary port patterns are strictly forbidden.
 */

const ALLOWED_ORIGINS = [
  'https://tanishk756.github.io',
  'https://admin.tanishksinghal.com',
  'http://localhost:5173',
  'http://localhost:4173',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:4173',
];

export function getCorsHeaders(request: Request): Record<string, string> {
  const rawOrigin = request.headers.get('Origin') || request.headers.get('origin') || '';
  const origin = rawOrigin.replace(/\/$/, '').toLowerCase();

  const isAllowed = ALLOWED_ORIGINS.some((allowed) => allowed.toLowerCase() === origin);

  const reqHeaders =
    request.headers.get('Access-Control-Request-Headers') ||
    'authorization, apikey, x-client-info, content-type, prefer, x-requested-with, accept, range';

  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': reqHeaders,
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin, Access-Control-Request-Headers',
  };

  if (isAllowed && rawOrigin) {
    headers['Access-Control-Allow-Origin'] = rawOrigin;
    headers['Access-Control-Allow-Credentials'] = 'true';
  } else if (!rawOrigin) {
    headers['Access-Control-Allow-Origin'] = 'http://localhost:5173';
  }

  return headers;
}

export function handleCorsPreflight(request: Request): Response | null {
  if (request.method === 'OPTIONS') {
    const rawOrigin = request.headers.get('Origin') || request.headers.get('origin') || '';
    const origin = rawOrigin.replace(/\/$/, '').toLowerCase();

    const isAllowed = ALLOWED_ORIGINS.some((allowed) => allowed.toLowerCase() === origin) || !rawOrigin;

    if (!isAllowed && rawOrigin) {
      return new Response(JSON.stringify({ error: 'CORS origin not allowed' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(null, {
      status: 204,
      headers: getCorsHeaders(request),
    });
  }
  return null;
}
