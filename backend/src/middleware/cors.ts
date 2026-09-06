import { Env } from '../types';

export function handleCors(request: Request, env: Env): { headers: Headers; isPreflight: boolean } {
  const origin = request.headers.get('Origin');
  const headers = new Headers();

  const allowedOrigins = [
    env.ALLOWED_ORIGIN,
    'http://localhost:5173', // Local development admin origin
    'http://127.0.0.1:5173',
  ].filter(Boolean);

  const isAllowed = origin && allowedOrigins.includes(origin);

  if (isAllowed && origin) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Access-Control-Allow-Credentials', 'true');
    headers.set(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS'
    );
    headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With, Cf-Access-Jwt-Assertion, Cf-Access-Authenticated-User-Email'
    );
    headers.set('Access-Control-Max-Age', '86400');
  }

  const isPreflight = request.method === 'OPTIONS';

  return { headers, isPreflight };
}
