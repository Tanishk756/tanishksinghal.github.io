/**
 * Supabase Edge Function: admin-publish
 * 
 * Manages controlled publication workflow:
 * - 5-State Lifecycle Gating (Item must be in 'approved' state or transition through review -> approved)
 * - Provenance Gating (USER_PROVIDED, GITHUB_VERIFIED, PUBLIC_WEB_VERIFIED required)
 * - Phase 9 GitHub commit safety lock (Zero production GitHub commits without explicit approval)
 * - Transaction Safety & Failure Handling
 * - Immutable Audit Logging
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

    // Non-mutating verification action for Phase 9 infrastructure testing
    if (body.action === 'verify_github') {
      console.log('verify_github:start');
      const envVars = {
        GITHUB_APP_ID: typeof Deno !== 'undefined' && Deno.env?.get ? Deno.env.get('GITHUB_APP_ID') : undefined,
        GITHUB_APP_INSTALLATION_ID: typeof Deno !== 'undefined' && Deno.env?.get ? Deno.env.get('GITHUB_APP_INSTALLATION_ID') : undefined,
        GITHUB_APP_PRIVATE_KEY_PEM: typeof Deno !== 'undefined' && Deno.env?.get ? Deno.env.get('GITHUB_APP_PRIVATE_KEY_PEM') : undefined,
        GITHUB_REPO_OWNER: typeof Deno !== 'undefined' && Deno.env?.get ? Deno.env.get('GITHUB_REPO_OWNER') : undefined,
        GITHUB_REPO_NAME: typeof Deno !== 'undefined' && Deno.env?.get ? Deno.env.get('GITHUB_REPO_NAME') : undefined,
        GITHUB_REPO_BRANCH: typeof Deno !== 'undefined' && Deno.env?.get ? Deno.env.get('GITHUB_REPO_BRANCH') : undefined,
      };
      const publisher = new GitHubPublisherService(envVars);
      console.log('verify_github:publisher_created');
      console.log('verify_github:before_repository_check');
      const verifyResult = await publisher.verifyRepositoryAccess();
      console.log('verify_github:after_repository_check');
      return jsonResponse({
        success: verifyResult.success,
        repository: verifyResult.repository,
        error: verifyResult.error,
      });
    }

    const contentType = body.contentType || body.content_type;
    const contentId = body.contentId || body.content_id || body.id;
    const currentStatus: LifecycleState = body.currentStatus || 'approved';
    const verificationStatus = body.verificationStatus || body.verification_status || 'USER_PROVIDED';

    if (!contentType || !contentId) {
      return jsonResponse({ success: false, error: 'Content type and ID are required to publish' }, 400);
    }

    // 3. Lifecycle Transition Verification (Must be valid transition to 'published')
    const transitionCheck = validateLifecycleTransition(currentStatus, 'published');
    if (!transitionCheck.valid) {
      return jsonResponse({ success: false, error: transitionCheck.reason }, 400);
    }

    // 4. Provenance Gating Verification
    const provCheck = validatePublicationProvenance(verificationStatus);
    if (!provCheck.valid) {
      return jsonResponse({ success: false, error: provCheck.reason }, 400);
    }

    // 5. GitHub Publisher Service Execution
    const envVars = {
      GITHUB_APP_ID: typeof Deno !== 'undefined' && Deno.env?.get ? Deno.env.get('GITHUB_APP_ID') : undefined,
      GITHUB_APP_INSTALLATION_ID: typeof Deno !== 'undefined' && Deno.env?.get ? Deno.env.get('GITHUB_APP_INSTALLATION_ID') : undefined,
      GITHUB_APP_PRIVATE_KEY_PEM: typeof Deno !== 'undefined' && Deno.env?.get ? Deno.env.get('GITHUB_APP_PRIVATE_KEY_PEM') : undefined,
      GITHUB_REPO_OWNER: typeof Deno !== 'undefined' && Deno.env?.get ? Deno.env.get('GITHUB_REPO_OWNER') : undefined,
      GITHUB_REPO_NAME: typeof Deno !== 'undefined' && Deno.env?.get ? Deno.env.get('GITHUB_REPO_NAME') : undefined,
      GITHUB_REPO_BRANCH: typeof Deno !== 'undefined' && Deno.env?.get ? Deno.env.get('GITHUB_REPO_BRANCH') : undefined,
    };
    const publisher = new GitHubPublisherService(envVars);

    console.log(`[AUDIT] user=${user.email} action=PUBLISH_ATTEMPTED type=${contentType} id=${contentId}`);

    // Phase 9: Non-mutating credential check or safe dry-run
    const publishResult = await publisher.publishContentItem(contentType, contentId, user.email);

    // If publishing is locked or fails, return appropriate status without marking as published
    if (!publishResult.success) {
      console.log(`[AUDIT] user=${user.email} action=PUBLISH_BLOCKED_PHASE9 type=${contentType} id=${contentId} jobId=${publishResult.jobId} code=${publishResult.error}`);
      return jsonResponse(
        {
          success: false,
          error: publishResult.message,
          jobId: publishResult.jobId,
          code: publishResult.error,
        },
        publishResult.error === 'PHASE_9_COMMIT_BLOCKED' ? 200 : 502
      );
    }

    console.log(`[AUDIT] user=${user.email} action=PUBLISH_COMMITTED type=${contentType} id=${contentId} jobId=${publishResult.jobId} commitSha=${publishResult.commitSha}`);
    return jsonResponse({
      success: true,
      message: 'Content successfully published',
      jobId: publishResult.jobId,
      commitSha: publishResult.commitSha,
    });
  } catch (err: any) {
    return jsonResponse({ success: false, error: `Publish execution error: ${err.message}` }, 500);
  }
}

export default {
  fetch: handler,
};
