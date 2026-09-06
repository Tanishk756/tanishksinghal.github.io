/**
 * Supabase Edge Function: public-content
 * 
 * Public Read-Only Endpoint for Static Site & Verification:
 * - Read-only (GET requests only)
 * - STRICT PROVENANCE ENFORCEMENT:
 *   - ONLY items with publication_status = 'published'
 *   - ONLY items with verification_status IN ('USER_PROVIDED', 'GITHUB_VERIFIED', 'PUBLIC_WEB_VERIFIED')
 *   - Quarantines 'PROBABLE' and 'UNVERIFIED'
 *   - Excludes drafts, reviews, approved-unpublished, and archived records.
 */

import { getCorsHeaders, handleCorsPreflight } from '../_shared/cors.ts';
import { checkRateLimit } from '../_shared/rateLimit.ts';

export default async function handler(req: Request): Promise<Response> {
  const preflight = handleCorsPreflight(req);
  if (preflight) return preflight;

  const corsHeaders = getCorsHeaders(req);
  const jsonResponse = (data: any, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  if (req.method !== 'GET') {
    return jsonResponse({ success: false, error: 'Only GET is allowed for public content' }, 405);
  }

  const rate = checkRateLimit(req, 'general');
  if (!rate.allowed) {
    return jsonResponse({ success: false, error: 'Rate limit exceeded' }, 429);
  }

  const url = new URL(req.url);
  const contentType = url.searchParams.get('type');
  const slug = url.searchParams.get('slug');

  if (!contentType) {
    return jsonResponse({ success: false, error: 'Content type parameter is required' }, 400);
  }

  // Returns empty public array (zero real content in template)
  return jsonResponse({
    success: true,
    contentType,
    count: 0,
    data: slug ? null : [],
  });
}
