-- ==============================================================================
-- 0003_contact_email_notifications.sql: Email Notification Status Tracking
-- ==============================================================================

ALTER TABLE public.contact_submissions 
    ADD COLUMN IF NOT EXISTS email_notification_status TEXT DEFAULT 'pending' CHECK (email_notification_status IN ('pending', 'sent', 'failed', 'skipped')),
    ADD COLUMN IF NOT EXISTS email_notification_sent_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS email_notification_error TEXT;

CREATE INDEX IF NOT EXISTS idx_contact_submissions_notification_status 
    ON public.contact_submissions(email_notification_status);
