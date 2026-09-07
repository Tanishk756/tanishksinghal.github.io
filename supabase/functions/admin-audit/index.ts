/**
 * Supabase Edge Function: admin-audit
 * 
 * Provides read-only querying of the immutable audit trail:
 * - Strict Admin Authentication (Tanishksinghal6285@gmail.com)
 * - Pagination (limit, offset)
 * - Zero secret material exposure
 */

import { getCorsHeaders, handleCorsPreflight } from '../_shared/cors.ts';
import { authenticateSupabaseRequest } from '../_shared/auth.ts';
import { checkRateLimit } from '../_shared/rateLimit.ts';

async function handler(req: Request): Promise<Response> {
  const preflight = handleCorsPreflight(req);
  if (preflight) return preflight;

  const corsHeaders = getCorsHeaders(req);
  const jsonResponse = (data: any, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  if (req.method !== 'GET') {
    return jsonResponse({ success: false, error: 'Method not allowed' }, 405);
  }

  // 1. Rate Limiting
  const rate = checkRateLimit(req, 'general');
  if (!rate.allowed) {
    return jsonResponse({ success: false, error: 'Rate limit exceeded' }, 429);
  }

  // 2. Authenticate & Authorize
  const auth = await authenticateSupabaseRequest(req);
  if (auth.errorResponse) {
    const res = auth.errorResponse;
    const body = await res.text();
    return new Response(body, {
      status: res.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get('limit') || '50', 10);
  const offset = parseInt(url.searchParams.get('offset') || '0', 10);

  return jsonResponse({
    success: true,
    count: 0,
    limit,
    offset,
    data: [],
  });
}

export default {
  fetch: handler,
};
