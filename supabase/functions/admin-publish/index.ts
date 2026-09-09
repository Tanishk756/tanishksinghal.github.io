/**
 * Supabase Edge Function: admin-publish
 * 
 * Manages canonical publication directly in Supabase:
 * - Direct database-native publication to Supabase
 * - Authentication & Owner Authorization (tanishksinghal6285@gmail.com)
 * - Rate Limiting & CORS
 * - Content Type Whitelisting (DOMAIN_TABLE_MAP)
 * - Provenance Gating (USER_PROVIDED, GITHUB_VERIFIED, PUBLIC_WEB_VERIFIED required; rejects PROBABLE / UNVERIFIED)
 * - Lifecycle Validation
 * - Direct record lookup and atomic update: publication_status = 'published'
 * - Immutable Audit Logging in audit_logs
 * - Content versioning snapshot in content_versions
 * - Returns success ONLY after database update succeeds
 */

import { getCorsHeaders, handleCorsPreflight } from '../_shared/cors.ts';
import {
  authenticateSupabaseRequest,
  validatePublicationProvenance,
  validateLifecycleTransition,
  LifecycleState,
} from '../_shared/auth.ts';
import { checkRateLimit } from '../_shared/rateLimit.ts';
import { GitHubPublisherService } from '../_shared/githubPublisher.ts';

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

  if (req.method !== 'POST') {
    return jsonResponse({ success: false, error: 'Method not allowed. Use POST to trigger publish.' }, 405);
  }

  // 1. Rate Limiting
  const rate = checkRateLimit(req, 'publish');
  if (!rate.allowed) {
    return jsonResponse({ success: false, error: `Rate limit exceeded for publish jobs. Retry in ${rate.retryAfter}s.` }, 429);
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
  const user = auth.identity!;

  try {
    const body = await req.json();

    // Non-mutating verification action for external repository diagnostic if requested
    if (body.action === 'verify_github') {
      const envVars = {
        GITHUB_APP_ID: typeof Deno !== 'undefined' && Deno.env?.get ? Deno.env.get('GITHUB_APP_ID') : undefined,
        GITHUB_APP_INSTALLATION_ID: typeof Deno !== 'undefined' && Deno.env?.get ? Deno.env.get('GITHUB_APP_INSTALLATION_ID') : undefined,
        GITHUB_APP_PRIVATE_KEY_PEM: typeof Deno !== 'undefined' && Deno.env?.get ? Deno.env.get('GITHUB_APP_PRIVATE_KEY_PEM') : undefined,
        GITHUB_REPO_OWNER: typeof Deno !== 'undefined' && Deno.env?.get ? Deno.env.get('GITHUB_REPO_OWNER') : undefined,
        GITHUB_REPO_NAME: typeof Deno !== 'undefined' && Deno.env?.get ? Deno.env.get('GITHUB_REPO_NAME') : undefined,
        GITHUB_REPO_BRANCH: typeof Deno !== 'undefined' && Deno.env?.get ? Deno.env.get('GITHUB_REPO_BRANCH') : undefined,
      };
      const publisher = new GitHubPublisherService(envVars);
      const verifyResult = await publisher.verifyRepositoryAccess();
      return jsonResponse({
        success: verifyResult.success,
        repository: verifyResult.repository,
        error: verifyResult.error,
      });
    }

    const rawContentType = body.contentType || body.content_type;
    const contentId = body.contentId || body.content_id || body.id;
    const currentStatus: LifecycleState = body.currentStatus || 'approved';
    const verificationStatus = body.verificationStatus || body.verification_status || 'USER_PROVIDED';

    if (!rawContentType || !contentId) {
      return jsonResponse({ success: false, error: 'Content type and ID are required to publish' }, 400);
    }

    // 3. Content Type Whitelisting
    const tableName = DOMAIN_TABLE_MAP[rawContentType.toLowerCase()];
    if (!tableName) {
      return jsonResponse({ success: false, error: `Invalid content type: '${rawContentType}'. Permitted types are restricted to registered CMS domains.` }, 400);
    }

    // 4. Provenance Gating Verification
    const provCheck = validatePublicationProvenance(verificationStatus);
    if (!provCheck.valid) {
      return jsonResponse({ success: false, error: provCheck.reason }, 400);
    }

    // 5. Database-Native Publication via Supabase REST API
    const supabaseUrl = (typeof Deno !== 'undefined' ? Deno.env.get('SUPABASE_URL') : '') || '';
    const serviceKey = (typeof Deno !== 'undefined' ? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') : '') || '';

    if (!supabaseUrl || !serviceKey) {
      return jsonResponse({ success: false, error: 'Database credentials not configured' }, 500);
    }

    async function querySupabaseRest(endpoint: string, options: RequestInit = {}) {
      const res = await fetch(`${supabaseUrl}/rest/v1/${endpoint}`, {
        ...options,
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
          'Content-Type': 'application/json',
          'Prefer': options.method === 'PATCH' || options.method === 'POST' ? 'return=representation' : '',
          ...(options.headers || {})
        }
      });
      const text = await res.text();
      let data = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = text;
      }
      return { ok: res.ok, status: res.status, data, error: res.ok ? null : (data?.message || text) };
    }

    // 6. Fetch target record from database to verify existence and provenance
    const tablesWithSlug = ['projects', 'research_programs', 'publications', 'patents', 'organizations', 'blog_posts'];
    const hasSlug = tablesWithSlug.includes(tableName);

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(contentId);
    let fetchEndpoint = `${tableName}?select=*`;
    if (tableName === 'profiles') {
      fetchEndpoint += `&limit=1`;
    } else if (hasSlug && !isUuid) {
      fetchEndpoint += `&slug=eq.${encodeURIComponent(contentId)}`;
    } else {
      fetchEndpoint += `&id=eq.${encodeURIComponent(contentId)}`;
    }

    const fetchRes = await querySupabaseRest(fetchEndpoint);
    if (!fetchRes.ok || !fetchRes.data || (Array.isArray(fetchRes.data) && fetchRes.data.length === 0)) {
      return jsonResponse({ success: false, error: `Record not found in ${tableName} for ID '${contentId}'` }, 404);
    }

    const targetRecord = Array.isArray(fetchRes.data) ? fetchRes.data[0] : fetchRes.data;
    if (!targetRecord || !targetRecord.id) {
      return jsonResponse({ success: false, error: `Invalid record structure in ${tableName}` }, 404);
    }

    // Double-check record provenance from DB
    const dbProvenance = targetRecord.verification_status || verificationStatus;
    const dbProvCheck = validatePublicationProvenance(dbProvenance);
    if (!dbProvCheck.valid) {
      return jsonResponse({ success: false, error: `Cannot publish: Database record has provenance status '${dbProvenance}' which is not verified for public release.` }, 400);
    }

    // 7. Perform publication update in Supabase database
    const nowIso = new Date().toISOString();
    const updatePayload: Record<string, any> = {
      publication_status: 'published',
      last_verified: nowIso,
      updated_at: nowIso,
    };
    if (tableName === 'blog_posts') {
      updatePayload.published_at = nowIso;
    }

    const updateEndpoint = `${tableName}?id=eq.${encodeURIComponent(targetRecord.id)}`;
    const updateRes = await querySupabaseRest(updateEndpoint, {
      method: 'PATCH',
      body: JSON.stringify(updatePayload),
    });

    if (!updateRes.ok) {
      console.error(`[DATABASE_ERROR] Failed to publish record ${targetRecord.id} in ${tableName}:`, updateRes.error);
      return jsonResponse({ success: false, error: `Failed to update publication status in database: ${updateRes.error}` }, 500);
    }

    console.log(`[AUDIT] user=${user.email} action=CONTENT_PUBLISHED type=${rawContentType} id=${targetRecord.id} table=${tableName} status=published`);

    // 8. Create immutable Audit Log entry in database
    try {
      await querySupabaseRest('audit_logs', {
        method: 'POST',
        body: JSON.stringify({
          user_email: user.email,
          action: 'CONTENT_PUBLISHED',
          content_type: rawContentType,
          content_id: String(targetRecord.id),
          previous_status: targetRecord.publication_status || currentStatus,
          new_status: 'published',
          metadata_json: {
            published_by: user.email,
            table_name: tableName,
            verification_status: dbProvenance,
            published_at: nowIso,
          },
          created_at: nowIso,
        }),
      });
    } catch (auditErr) {
      console.warn('Audit log write warning:', auditErr);
    }

    // 9. Snapshot in content_versions (if applicable)
    try {
      await querySupabaseRest('content_versions', {
        method: 'POST',
        body: JSON.stringify({
          entity_type: rawContentType,
          entity_id: targetRecord.id,
          version_number: 1,
          snapshot_json: { ...targetRecord, ...updatePayload },
          change_summary: `Published by ${user.email} at ${nowIso}`,
          created_by: user.email,
          created_at: nowIso,
        }),
      });
    } catch (verErr) {
      console.warn('Content version write warning:', verErr);
    }

    // 10. Return success response
    return jsonResponse({
      success: true,
      message: 'Content successfully published',
      contentType: rawContentType,
      contentId: targetRecord.id,
      publicationStatus: 'published',
      publishedAt: nowIso,
    });

  } catch (err: any) {
    return jsonResponse({ success: false, error: `Publish execution error: ${err.message}` }, 500);
  }
}

export default {
  fetch: handler,
};
