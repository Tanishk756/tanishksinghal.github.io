/**
 * Supabase Edge Function: admin-contact
 * 
 * Protected management endpoint for viewing and updating contact inquiries.
 * Enforces:
 * - Supabase Auth Bearer JWT validation
 * - Authorized Admin Whitelist (Tanishksinghal6285@gmail.com)
 * - Status transition updates: new -> read -> replied -> archived
 * - Structured audit logging (CONTACT_VIEWED, CONTACT_MARKED_READ, CONTACT_MARKED_REPLIED, CONTACT_ARCHIVED)
 * - Zero PII or message content in audit logs
 * - Restrictive CORS
 */

import { getCorsHeaders, handleCorsPreflight } from '../_shared/cors.ts';
import { authenticateSupabaseRequest } from '../_shared/auth.ts';
import { checkRateLimit } from '../_shared/rateLimit.ts';

declare const Deno: any;

const VALID_STATUSES = ['new', 'read', 'replied', 'archived'];

async function handler(req: Request): Promise<Response> {
  const preflight = handleCorsPreflight(req);
  if (preflight) return preflight;

  const corsHeaders = getCorsHeaders(req);
  const jsonResponse = (data: any, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  // 1. Authenticate and Authorize Request
  const auth = await authenticateSupabaseRequest(req);
  if (auth.errorResponse) {
    const res = auth.errorResponse;
    const body = await res.text();
    return new Response(body, {
      status: res.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // 2. Rate limiting for admin operations
  const adminEmail = auth.userEmail || 'unknown';
  const rateLimit = checkRateLimit(req, 'general');
  if (!rateLimit.allowed) {
    return jsonResponse({ success: false, error: 'Admin rate limit exceeded' }, 429);
  }

  const method = req.method;
  const url = new URL(req.url);
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ success: false, error: 'Database service configuration error' }, 500);
  }

  const dbHeaders = {
    'apikey': serviceRoleKey,
    'Authorization': `Bearer ${serviceRoleKey}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
  };

  // --- GET: List or View Contact Submissions ---
  if (method === 'GET') {
    const id = url.searchParams.get('id');
    const statusFilter = url.searchParams.get('status');
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);

    if (id) {
      // Single submission fetch
      const res = await fetch(`${supabaseUrl}/rest/v1/contact_submissions?id=eq.${encodeURIComponent(id)}`, {
        headers: dbHeaders,
      });
      if (!res.ok) {
        return jsonResponse({ success: false, error: 'Failed to fetch submission' }, res.status);
      }
      const data = await res.json();
      if (!data || data.length === 0) {
        return jsonResponse({ success: false, error: 'Submission not found' }, 404);
      }

      // Safe Audit Log
      console.log(`[AUDIT] Action: CONTACT_VIEWED, Actor: ${adminEmail}, ID: ${id}`);

      return jsonResponse({ success: true, data: data[0] });
    }

    // List submissions
    let queryUrl = `${supabaseUrl}/rest/v1/contact_submissions?select=*&order=created_at.desc&limit=${limit}&offset=${offset}`;
    if (statusFilter && VALID_STATUSES.includes(statusFilter)) {
      queryUrl += `&status=eq.${encodeURIComponent(statusFilter)}`;
    }

    const res = await fetch(queryUrl, { headers: dbHeaders });
    if (!res.ok) {
      return jsonResponse({ success: false, error: 'Failed to list submissions' }, res.status);
    }
    const data = await res.json();
    return jsonResponse({ success: true, data, count: data.length });
  }

  // --- PUT: Update Submission Status ---
  if (method === 'PUT' || method === 'PATCH') {
    const id = url.searchParams.get('id');
    if (!id) {
      return jsonResponse({ success: false, error: 'Submission ID is required' }, 400);
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return jsonResponse({ success: false, error: 'Invalid JSON body' }, 400);
    }

    const newStatus = body.status;
    if (!newStatus || !VALID_STATUSES.includes(newStatus)) {
      return jsonResponse(
        {
          success: false,
          error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
        },
        400
      );
    }

    const updateRes = await fetch(`${supabaseUrl}/rest/v1/contact_submissions?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: dbHeaders,
      body: JSON.stringify({ status: newStatus }),
    });

    if (!updateRes.ok) {
      return jsonResponse({ success: false, error: 'Failed to update submission status' }, updateRes.status);
    }

    const updatedData = await updateRes.json();
    if (!updatedData || updatedData.length === 0) {
      return jsonResponse({ success: false, error: 'Submission not found' }, 404);
    }

    // Audit Log for status change
    let actionType = 'CONTACT_STATUS_UPDATED';
    if (newStatus === 'read') actionType = 'CONTACT_MARKED_READ';
    if (newStatus === 'replied') actionType = 'CONTACT_MARKED_REPLIED';
    if (newStatus === 'archived') actionType = 'CONTACT_ARCHIVED';

    console.log(`[AUDIT] Action: ${actionType}, Actor: ${adminEmail}, ID: ${id}, Status: ${newStatus}`);

    // Insert into audit_logs table
    await fetch(`${supabaseUrl}/rest/v1/audit_logs`, {
      method: 'POST',
      headers: dbHeaders,
      body: JSON.stringify({
        action: actionType,
        actor: adminEmail,
        content_type: 'contact_submission',
        content_id: id,
        diff: { status: newStatus },
      }),
    }).catch((e) => console.error('[AUDIT_INSERT_ERROR]', e));

    return jsonResponse({ success: true, data: updatedData[0] });
  }

  // --- DELETE: Remove / Archive Submission ---
  if (method === 'DELETE') {
    const id = url.searchParams.get('id');
    if (!id) {
      return jsonResponse({ success: false, error: 'Submission ID is required' }, 400);
    }

    const delRes = await fetch(`${supabaseUrl}/rest/v1/contact_submissions?id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: dbHeaders,
    });

    if (!delRes.ok) {
      return jsonResponse({ success: false, error: 'Failed to delete submission' }, delRes.status);
    }

    console.log(`[AUDIT] Action: CONTACT_DELETED, Actor: ${adminEmail}, ID: ${id}`);

    await fetch(`${supabaseUrl}/rest/v1/audit_logs`, {
      method: 'POST',
      headers: dbHeaders,
      body: JSON.stringify({
        action: 'CONTACT_DELETED',
        actor: adminEmail,
        content_type: 'contact_submission',
        content_id: id,
        diff: null,
      }),
    }).catch((e) => console.error('[AUDIT_INSERT_ERROR]', e));

    return jsonResponse({ success: true, message: 'Submission deleted successfully' });
  }

  return jsonResponse({ success: false, error: 'Method not allowed' }, 405);
}

export default {
  fetch: handler,
};

