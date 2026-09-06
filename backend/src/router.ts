import { Env } from './types';
import { DatabaseService } from './services/db';
import { GitHubPublisherService } from './services/githubPublisher';
import { authenticateAndAuthorize } from './middleware/auth';
import { checkRateLimit } from './middleware/rateLimit';

export async function handleApiRequest(
  request: Request,
  env: Env,
  url: URL
): Promise<Response> {
  const dbService = new DatabaseService(env.DB);
  const path = url.pathname;
  const method = request.method;

  const json = (data: any, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });

  // 1. Health check endpoint (Public)
  if (path === '/api/health' && method === 'GET') {
    return json({
      success: true,
      status: 'operational',
      environment: env.ENVIRONMENT,
      timestamp: new Date().toISOString(),
    });
  }

  // 2. Public Read-Only Endpoint for Static Site Verification
  // STRICT PROVENANCE ENFORCEMENT: Excludes drafts and unverified records
  if (path.startsWith('/api/public/content/') && method === 'GET') {
    const segments = path.split('/').filter(Boolean);
    const contentType = segments[3];
    if (!contentType) return json({ success: false, error: 'Content type required' }, 400);

    const items = await dbService.getContentList(contentType, 'published', true);
    return json({ success: true, count: items.length, data: items });
  }

  // --- ALL ADMIN / CMS API ENDPOINTS REQUIRE CRYPTOGRAPHIC AUTHENTICATION ---
  const auth = await authenticateAndAuthorize(request, env);
  if (auth.errorResponse) {
    return auth.errorResponse;
  }
  const user = auth.identity!;

  // 3. Admin CMS Stats
  if (path === '/api/stats' && method === 'GET') {
    const rateLimit = checkRateLimit(request, env, 'general');
    if (!rateLimit.allowed) {
      return json({ success: false, error: `Rate limit exceeded. Retry in ${rateLimit.retryAfter}s.` }, 429);
    }
    const stats = await dbService.getStats();
    return json({ success: true, data: stats });
  }

  // 4. Audit Log Inspection
  if (path === '/api/audit-logs' && method === 'GET') {
    const rateLimit = checkRateLimit(request, env, 'general');
    if (!rateLimit.allowed) {
      return json({ success: false, error: `Rate limit exceeded. Retry in ${rateLimit.retryAfter}s.` }, 429);
    }
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);
    const logs = await dbService.getAuditLogs(limit, offset);
    return json({ success: true, count: logs.length, data: logs });
  }

  // 5. JSON Export Snapshot
  if (path === '/api/export' && method === 'GET') {
    const rateLimit = checkRateLimit(request, env, 'general');
    if (!rateLimit.allowed) {
      return json({ success: false, error: `Rate limit exceeded. Retry in ${rateLimit.retryAfter}s.` }, 429);
    }

    const domains = [
      'project', 'research', 'publication', 'patent',
      'experience', 'skill', 'blog', 'achievement',
      'certification', 'organization', 'profile'
    ];
    const exportData: Record<string, any> = {};

    for (const d of domains) {
      exportData[d] = await dbService.getContentList(d, undefined, false);
    }

    await dbService.recordAuditLog({
      userEmail: user.email,
      action: 'SNAPSHOT_EXPORTED',
      contentType: 'system',
      contentId: 'full-snapshot',
      previousStatus: null,
      newStatus: null,
    });

    return json({
      success: true,
      exportedAt: new Date().toISOString(),
      exportedBy: user.email,
      data: exportData,
    });
  }

  // 6. Content CRUD Routes: /api/content/:type
  if (path.startsWith('/api/content/')) {
    const segments = path.split('/').filter(Boolean);
    const contentType = segments[2];
    const idOrSlug = segments[3];
    const subAction = segments[4];

    if (!contentType) {
      return json({ success: false, error: 'Content type is required' }, 400);
    }

    // A. List items of a given domain
    if (!idOrSlug && method === 'GET') {
      const rateLimit = checkRateLimit(request, env, 'general');
      if (!rateLimit.allowed) {
        return json({ success: false, error: `Rate limit exceeded. Retry in ${rateLimit.retryAfter}s.` }, 429);
      }
      const statusFilter = url.searchParams.get('status') || undefined;
      const items = await dbService.getContentList(contentType, statusFilter, false);
      return json({ success: true, count: items.length, data: items });
    }

    // B. Get single item by ID or Slug
    if (idOrSlug && !subAction && method === 'GET') {
      const rateLimit = checkRateLimit(request, env, 'general');
      if (!rateLimit.allowed) {
        return json({ success: false, error: `Rate limit exceeded. Retry in ${rateLimit.retryAfter}s.` }, 429);
      }
      const item = await dbService.getContentItem(contentType, idOrSlug, false);
      if (!item) return json({ success: false, error: 'Item not found' }, 404);
      return json({ success: true, data: item });
    }

    // C. Create new content item
    if (!idOrSlug && method === 'POST') {
      const rateLimit = checkRateLimit(request, env, 'mutation');
      if (!rateLimit.allowed) {
        return json({ success: false, error: `Rate limit exceeded. Retry in ${rateLimit.retryAfter}s.` }, 429);
      }
      const body: any = await request.json();
      const result = await dbService.saveContentItem(contentType, body, user.email);
      return json({ success: true, id: result.id, isNew: result.isNew, message: 'Content created' }, 201);
    }

    // D. Update existing content item
    if (idOrSlug && !subAction && method === 'PUT') {
      const rateLimit = checkRateLimit(request, env, 'mutation');
      if (!rateLimit.allowed) {
        return json({ success: false, error: `Rate limit exceeded. Retry in ${rateLimit.retryAfter}s.` }, 429);
      }
      const body: any = await request.json();
      body.id = idOrSlug;
      const result = await dbService.saveContentItem(contentType, body, user.email);
      return json({ success: true, id: result.id, message: 'Content updated' });
    }

    // E. Delete content item
    if (idOrSlug && !subAction && method === 'DELETE') {
      const rateLimit = checkRateLimit(request, env, 'mutation');
      if (!rateLimit.allowed) {
        return json({ success: false, error: `Rate limit exceeded. Retry in ${rateLimit.retryAfter}s.` }, 429);
      }
      const deleted = await dbService.deleteContentItem(idOrSlug, user.email);
      if (!deleted) return json({ success: false, error: 'Item not found' }, 404);
      return json({ success: true, message: 'Content deleted' });
    }

    // F. Lifecycle Action: Publish (Transactional Failure Safety Enforced)
    if (idOrSlug && subAction === 'publish' && method === 'POST') {
      const rateLimit = checkRateLimit(request, env, 'publish');
      if (!rateLimit.allowed) {
        return json({ success: false, error: `Rate limit exceeded for publish jobs. Retry in ${rateLimit.retryAfter}s.` }, 429);
      }

      // Step 1: Pre-check item existence
      const item = await dbService.getContentItem(contentType, idOrSlug, false);
      if (!item) return json({ success: false, error: 'Item not found' }, 404);

      // Step 2: Trigger GitHub App commit
      const publisher = new GitHubPublisherService(env, dbService);
      const publishResult = await publisher.publishDomainToGitHub(contentType, idOrSlug, user.email);

      // Step 3: Failure safety check - If GitHub commit fails, DO NOT mark as published
      if (!publishResult.success) {
        return json(
          {
            success: false,
            error: `Publishing transaction failed: ${publishResult.message}`,
            jobId: publishResult.jobId,
          },
          502
        );
      }

      // Step 4: GitHub commit succeeded -> Now mark as published in D1 database
      await dbService.setPublicationStatus(idOrSlug, 'published', user.email);

      return json({
        success: true,
        message: 'Content successfully published and committed to repository',
        commitSha: publishResult.commitSha,
        jobId: publishResult.jobId,
      });
    }

    // G. Lifecycle Action: Archive
    if (idOrSlug && subAction === 'archive' && method === 'POST') {
      const rateLimit = checkRateLimit(request, env, 'mutation');
      if (!rateLimit.allowed) {
        return json({ success: false, error: `Rate limit exceeded. Retry in ${rateLimit.retryAfter}s.` }, 429);
      }
      const updated = await dbService.setPublicationStatus(idOrSlug, 'archived', user.email);
      if (!updated) return json({ success: false, error: 'Item not found' }, 404);
      return json({ success: true, message: 'Content marked as archived' });
    }
  }

  return json({ success: false, error: `Route not found: ${method} ${path}` }, 404);
}
