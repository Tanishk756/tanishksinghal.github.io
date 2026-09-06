import { Env } from './types';
import { handleCors } from './middleware/cors';
import { applySecurityHeaders } from './middleware/securityHeaders';
import { handleApiRequest } from './router';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const { headers: corsHeaders, isPreflight } = handleCors(request, env);

    // Handle CORS preflight request
    if (isPreflight) {
      const response = new Response(null, { status: 204, headers: corsHeaders });
      return new Response(response.body, {
        status: response.status,
        headers: applySecurityHeaders(response.headers),
      });
    }

    try {
      // Execute request through API router
      const response = await handleApiRequest(request, env, url);

      // Merge CORS and security headers into the final response
      const finalHeaders = new Headers(response.headers);
      corsHeaders.forEach((value, key) => finalHeaders.set(key, value));

      const securedHeaders = applySecurityHeaders(finalHeaders);

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: securedHeaders,
      });
    } catch (err: any) {
      console.error('Unhandled Worker Exception:', err);

      const errorHeaders = applySecurityHeaders(
        new Headers({
          'Content-Type': 'application/json',
        })
      );
      corsHeaders.forEach((value, key) => errorHeaders.set(key, value));

      return new Response(
        JSON.stringify({
          success: false,
          error: 'Internal Server Error',
          message: env.ENVIRONMENT === 'development' ? err.message : undefined,
          timestamp: new Date().toISOString(),
        }),
        {
          status: 500,
          headers: errorHeaders,
        }
      );
    }
  },
};
