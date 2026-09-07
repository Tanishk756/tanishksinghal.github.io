/**
 * Supabase Edge Function: public-content
 * 
 * Public Read-Only Endpoint for Static Site & Verification:
 * - Read-only (GET requests only)
 * - STRICT PROVENANCE & LIFECYCLE ENFORCEMENT:
 *   - ONLY items with publication_status = 'published'
 *   - ONLY items with verification_status IN ('USER_PROVIDED', 'GITHUB_VERIFIED', 'PUBLIC_WEB_VERIFIED')
 *   - Quarantines 'PROBABLE' and 'UNVERIFIED'
 *   - Excludes drafts, reviews, approved-unpublished, and archived records.
 * - Deterministic response shape
 */

import { getCorsHeaders, handleCorsPreflight } from '../_shared/cors.ts';
import { checkRateLimit } from '../_shared/rateLimit.ts';

declare const Deno: any;

const DOMAIN_TABLE_MAP: Record<string, string> = {
  profile: 'profiles',
  profiles: 'profiles',
  education: 'education',
  experience: 'experience',
  project: 'projects',
  projects: 'projects',
  research: 'research_programs',
  research_programs: 'research_programs',
  publication: 'publications',
  publications: 'publications',
  patent: 'patents',
  patents: 'patents',
  achievement: 'achievements',
  achievements: 'achievements',
  certification: 'certifications',
  certifications: 'certifications',
  skill: 'skills',
  skills: 'skills',
  organization: 'organizations',
  organizations: 'organizations',
  blog: 'blog_posts',
  blog_posts: 'blog_posts',
};

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
    return jsonResponse({ success: false, error: 'Only GET is allowed for public content' }, 405);
  }

  const rate = checkRateLimit(req, 'general');
  if (!rate.allowed) {
    return jsonResponse({ success: false, error: 'Rate limit exceeded' }, 429);
  }

  const url = new URL(req.url);
  const rawType = url.searchParams.get('type') || '';
  const slug = url.searchParams.get('slug');
  const id = url.searchParams.get('id');

  if (!rawType) {
    return jsonResponse({ success: false, error: 'Content type parameter is required' }, 400);
  }

  const tableName = DOMAIN_TABLE_MAP[rawType.toLowerCase()];
  if (!tableName) {
    return jsonResponse({ success: false, error: `Invalid content type: ${rawType}` }, 400);
  }

  const supabaseUrl = (typeof Deno !== 'undefined' ? Deno.env.get('SUPABASE_URL') : '') || '';
  const anonKey = (typeof Deno !== 'undefined' ? Deno.env.get('SUPABASE_ANON_KEY') : '') || '';

  if (!supabaseUrl || !anonKey) {
    return jsonResponse({
      success: true,
      contentType: rawType,
      count: 0,
      data: slug || id ? null : [],
    });
  }

  try {
    // Strict REST query: publication_status = 'published' AND verification_status IN ('USER_PROVIDED', 'GITHUB_VERIFIED', 'PUBLIC_WEB_VERIFIED')
    const params = new URLSearchParams();
    params.set('publication_status', 'eq.published');
    params.set('verification_status', 'in.(USER_PROVIDED,GITHUB_VERIFIED,PUBLIC_WEB_VERIFIED)');

    if (slug) {
      params.set('slug', `eq.${slug}`);
    } else if (id) {
      params.set('id', `eq.${id}`);
    }

    const restEndpoint = `${supabaseUrl}/rest/v1/${tableName}?${params.toString()}`;
    const res = await fetch(restEndpoint, {
      method: 'GET',
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      return jsonResponse({ success: false, error: `Database error: ${errorText}` }, res.status);
    }

    const rows: any[] = await res.json();
    if (slug || id) {
      const single = rows.length > 0 ? rows[0] : null;
      return jsonResponse({
        success: true,
        contentType: rawType,
        count: single ? 1 : 0,
        data: single,
      });
    }

    return jsonResponse({
      success: true,
      contentType: rawType,
      count: rows.length,
      data: rows,
    });
  } catch (err: any) {
    return jsonResponse({ success: false, error: err.message || 'Internal error' }, 500);
  }
}

export default {
  fetch: handler,
};

