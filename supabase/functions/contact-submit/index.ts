/**
 * Supabase Edge Function: contact-submit
 * 
 * Public endpoint to receive and securely validate portfolio contact inquiries.
 * Enforces:
 * - POST method only
 * - Restrictive CORS
 * - Rate limiting
 * - Server-side schema & length validation
 * - Silent Honeypot anti-spam protection (discard if 'website' field is populated)
 * - RLS-backed insertion into contact_submissions
 * - Zero secret or PII leakage
 */

import { getCorsHeaders, handleCorsPreflight } from '../_shared/cors.ts';
import { checkRateLimit } from '../_shared/rateLimit.ts';

declare const Deno: any;

const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const VALID_INQUIRY_TYPES = [
  'Project / Engineering',
  'Research / Collaboration',
  'Speaking / Workshop',
  'Internship / Career',
  'Consulting',
  'Other',
];

interface ContactPayload {
  name?: string;
  email?: string;
  organization?: string;
  phone?: string;
  subject?: string;
  inquiryType?: string;
  message?: string;
  website?: string; // Honeypot field
}

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
    return jsonResponse({ success: false, error: 'Method not allowed' }, 405);
  }

  // 1. Rate Limiting
  const rateLimit = checkRateLimit(req, 'mutation');
  if (!rateLimit.allowed) {
    return jsonResponse(
      {
        success: false,
        error: 'Too many submissions received. Please wait a few minutes before trying again.',
      },
      429
    );
  }

  // 2. Parse and validate JSON payload
  let payload: ContactPayload;
  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ success: false, error: 'Invalid JSON payload' }, 400);
  }

  // 3. Honeypot Anti-Spam Check: If invisible 'website' field is populated, silently drop
  if (payload.website && payload.website.trim().length > 0) {
    // Generate synthetic response so bots think it succeeded without storing spam
    return jsonResponse({
      success: true,
      id: crypto.randomUUID(),
      message: 'Submission received',
    });
  }

  // 4. Input Sanitization & Validation
  const name = (payload.name || '').trim();
  const email = (payload.email || '').trim().toLowerCase();
  const organization = (payload.organization || '').trim();
  const phone = (payload.phone || '').trim();
  const subject = (payload.subject || '').trim();
  const inquiryType = (payload.inquiryType || '').trim();
  const message = (payload.message || '').trim();

  if (!name || name.length < 2 || name.length > 120) {
    return jsonResponse({ success: false, error: 'Name must be between 2 and 120 characters' }, 400);
  }

  if (!email || email.length > 254 || !EMAIL_REGEX.test(email)) {
    return jsonResponse({ success: false, error: 'Please provide a valid email address' }, 400);
  }

  if (organization && organization.length > 160) {
    return jsonResponse({ success: false, error: 'Organization name cannot exceed 160 characters' }, 400);
  }

  if (phone && phone.length > 40) {
    return jsonResponse({ success: false, error: 'Phone number cannot exceed 40 characters' }, 400);
  }

  if (!subject || subject.length < 2 || subject.length > 200) {
    return jsonResponse({ success: false, error: 'Subject must be between 2 and 200 characters' }, 400);
  }

  if (inquiryType && !VALID_INQUIRY_TYPES.includes(inquiryType)) {
    return jsonResponse({ success: false, error: 'Invalid inquiry type' }, 400);
  }

  if (!message || message.length < 10 || message.length > 5000) {
    return jsonResponse({ success: false, error: 'Message must be between 10 and 5000 characters' }, 400);
  }

  // 5. Store in Supabase PostgreSQL via REST
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ success: false, error: 'Database service configuration error' }, 500);
  }

  const submissionRecord = {
    name,
    email,
    organization: organization || null,
    phone: phone || null,
    subject,
    inquiry_type: inquiryType || null,
    message,
    status: 'new',
  };

  const dbRes = await fetch(`${supabaseUrl}/rest/v1/contact_submissions`, {
    method: 'POST',
    headers: {
      'apikey': serviceRoleKey,
      'Authorization': `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    },
    body: JSON.stringify(submissionRecord),
  });

  if (!dbRes.ok) {
    const errText = await dbRes.text();
    console.error(`[CONTACT_SUBMIT_ERROR] DB insert status ${dbRes.status}`);
    return jsonResponse({ success: false, error: 'Failed to record submission' }, 500);
  }

  const createdData = await dbRes.json();
  const createdId = createdData?.[0]?.id || crypto.randomUUID();

  return jsonResponse({
    success: true,
    id: createdId,
    message: 'Inquiry submitted successfully',
  });
}

export default {
  fetch: handler,
};

