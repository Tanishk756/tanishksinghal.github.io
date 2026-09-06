export function applySecurityHeaders(headers: Headers): Headers {
  const newHeaders = new Headers(headers);

  // Content Security Policy tailored for private API and admin origin
  newHeaders.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data: https:; connect-src 'self' https:; frame-ancestors 'none';"
  );

  // HTTP Strict Transport Security
  newHeaders.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  // Prevent MIME-sniffing
  newHeaders.set('X-Content-Type-Options', 'nosniff');

  // Clickjacking protection
  newHeaders.set('X-Frame-Options', 'DENY');

  // Referrer policy
  newHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions policy
  newHeaders.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');

  return newHeaders;
}
