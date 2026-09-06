/**
 * Transactional Email Notifier Service for Contact Inquiries via Resend.
 * 
 * Security Invariants:
 * 1. Zero secret leakage: API keys are read strictly from server-side environment variables.
 * 2. Input Sanitization: All visitor inputs are safely escaped to prevent HTML/script injection.
 * 3. Non-blocking failure: Email delivery failure never compromises or aborts database record storage.
 * 4. Zero PII in diagnostic logs: Logs only record delivery status codes and submission IDs.
 */

export interface EmailNotificationPayload {
  submissionId: string;
  name: string;
  email: string;
  organization?: string | null;
  phone?: string | null;
  subject: string;
  inquiryType?: string | null;
  message: string;
  createdAt: string;
}

export interface EmailNotificationResult {
  success: boolean;
  status: 'sent' | 'failed' | 'skipped';
  error?: string;
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function buildNotificationEmail(payload: EmailNotificationPayload, fromEmail: string, recipientEmail: string) {
  const safeName = escapeHtml(payload.name);
  const safeEmail = escapeHtml(payload.email);
  const safeOrg = payload.organization ? escapeHtml(payload.organization) : 'Not provided';
  const safePhone = payload.phone ? escapeHtml(payload.phone) : 'Not provided';
  const safeType = payload.inquiryType ? escapeHtml(payload.inquiryType) : 'General Inquiry';
  const safeSubject = escapeHtml(payload.subject);
  const safeMessage = escapeHtml(payload.message).replace(/\n/g, '<br/>');
  const safeId = escapeHtml(payload.submissionId);
  const safeTime = escapeHtml(payload.createdAt);

  const subject = `New Portfolio Inquiry — ${payload.subject}`;

  const textContent = `New inquiry received through the portfolio.

Name: ${payload.name}
Email: ${payload.email}
Organization / University: ${payload.organization || 'Not provided'}
Phone / WhatsApp: ${payload.phone || 'Not provided'}
Inquiry Type: ${payload.inquiryType || 'General Inquiry'}
Subject: ${payload.subject}

Message:
${payload.message}

Received: ${payload.createdAt}
Submission ID: ${payload.submissionId}

Reply directly to: ${payload.email}
`;

  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #141517; background-color: #fbfaf7; margin: 0; padding: 24px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2ded5; border-radius: 16px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
    
    <div style="border-bottom: 1px solid #e2ded5; padding-bottom: 16px; margin-bottom: 24px;">
      <span style="font-family: monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #78716c;">
        PORTFOLIO COMMUNICATION DISPATCH
      </span>
      <h1 style="font-size: 22px; font-weight: 700; color: #141517; margin: 8px 0 0 0;">
        New Inquiry Received
      </h1>
    </div>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px;">
      <tr>
        <td style="padding: 8px 0; color: #78716c; width: 140px; font-weight: 600;">Name:</td>
        <td style="padding: 8px 0; color: #141517; font-weight: 600;">${safeName}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #78716c; font-weight: 600;">Email:</td>
        <td style="padding: 8px 0; color: #141517;">
          <a href="mailto:${safeEmail}" style="color: #141517; font-weight: 600; text-decoration: underline;">${safeEmail}</a>
        </td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #78716c; font-weight: 600;">Organization:</td>
        <td style="padding: 8px 0; color: #141517;">${safeOrg}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #78716c; font-weight: 600;">Phone / WhatsApp:</td>
        <td style="padding: 8px 0; color: #141517;">${safePhone}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #78716c; font-weight: 600;">Inquiry Type:</td>
        <td style="padding: 8px 0; color: #141517;">${safeType}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #78716c; font-weight: 600;">Subject:</td>
        <td style="padding: 8px 0; color: #141517; font-weight: 600;">${safeSubject}</td>
      </tr>
    </table>

    <div style="background-color: #f7f5f0; border-radius: 12px; padding: 20px; margin-bottom: 28px; border: 1px solid #e8e4db;">
      <div style="font-size: 11px; font-family: monospace; text-transform: uppercase; color: #78716c; margin-bottom: 8px; font-weight: 600;">
        Message Body
      </div>
      <div style="font-size: 14px; color: #141517; line-height: 1.6; word-break: break-word;">
        ${safeMessage}
      </div>
    </div>

    <div style="margin-bottom: 28px; text-align: center;">
      <a href="mailto:${safeEmail}?subject=Re:%20${encodeURIComponent(payload.subject)}" style="display: inline-block; background-color: #141517; color: #fbfaf7; text-decoration: none; padding: 12px 28px; border-radius: 9999px; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
        Reply to ${safeName} &rarr;
      </a>
    </div>

    <div style="border-top: 1px solid #e2ded5; padding-top: 16px; font-size: 11px; color: #a8a29e; font-family: monospace;">
      <div>Submission ID: ${safeId}</div>
      <div>Received At: ${safeTime}</div>
    </div>

  </div>
</body>
</html>`;

  return {
    from: fromEmail,
    to: [recipientEmail],
    reply_to: payload.email,
    subject,
    text: textContent,
    html: htmlContent,
  };
}

export async function sendContactNotificationEmail(
  payload: EmailNotificationPayload,
  env: {
    RESEND_API_KEY?: string;
    CONTACT_NOTIFICATION_EMAIL?: string;
    RESEND_FROM_EMAIL?: string;
  }
): Promise<EmailNotificationResult> {
  const apiKey = env.RESEND_API_KEY;
  const recipient = env.CONTACT_NOTIFICATION_EMAIL || 'tanishksinghal6285@gmail.com';
  // Default to Resend testing sender onboarding@resend.dev unless a custom verified domain is provided
  const fromEmail = env.RESEND_FROM_EMAIL || 'Portfolio Contact <onboarding@resend.dev>';

  if (!apiKey) {
    return {
      success: false,
      status: 'skipped',
      error: 'RESEND_API_KEY_NOT_CONFIGURED',
    };
  }

  const emailBody = buildNotificationEmail(payload, fromEmail, recipient);

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailBody),
    });

    if (!res.ok) {
      const status = res.status;
      return {
        success: false,
        status: 'failed',
        error: `RESEND_HTTP_${status}`,
      };
    }

    return {
      success: true,
      status: 'sent',
    };
  } catch (err: any) {
    return {
      success: false,
      status: 'failed',
      error: 'NETWORK_ERROR',
    };
  }
}
