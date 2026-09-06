-- ==============================================================================
-- 0002_contact_submissions.sql: Migration for Private Contact & Inquiries System
-- ==============================================================================

-- 1. Create contact_submissions table
CREATE TABLE IF NOT EXISTS public.contact_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL CHECK (char_length(trim(name)) >= 2 AND char_length(name) <= 120),
    email TEXT NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND char_length(email) <= 254),
    organization TEXT CHECK (organization IS NULL OR char_length(organization) <= 160),
    phone TEXT CHECK (phone IS NULL OR char_length(phone) <= 40),
    subject TEXT NOT NULL CHECK (char_length(trim(subject)) >= 2 AND char_length(subject) <= 200),
    inquiry_type TEXT CHECK (
        inquiry_type IS NULL OR inquiry_type IN (
            'Project / Engineering',
            'Research / Collaboration',
            'Speaking / Workshop',
            'Internship / Career',
            'Consulting',
            'Other'
        )
    ),
    message TEXT NOT NULL CHECK (char_length(trim(message)) >= 10 AND char_length(message) <= 5000),
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Indexes for efficient administration and filtering
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON public.contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON public.contact_submissions(created_at DESC);

-- 3. Row Level Security (RLS)
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Anonymous / Public users may insert contact submissions via public API
CREATE POLICY "Public may submit contact inquiries"
    ON public.contact_submissions
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Anonymous / Public users are strictly forbidden from reading submissions
CREATE POLICY "Public cannot select contact submissions"
    ON public.contact_submissions
    FOR SELECT
    TO anon
    USING (false);

-- Only authenticated authorized administrator may view contact submissions
CREATE POLICY "Admin can view contact submissions"
    ON public.contact_submissions
    FOR SELECT
    TO authenticated
    USING (
        lower(coalesce(auth.jwt() ->> 'email', '')) = 'tanishksinghal6285@gmail.com'
    );

-- Only authenticated authorized administrator may update submission status
CREATE POLICY "Admin can update contact submissions"
    ON public.contact_submissions
    FOR UPDATE
    TO authenticated
    USING (
        lower(coalesce(auth.jwt() ->> 'email', '')) = 'tanishksinghal6285@gmail.com'
    )
    WITH CHECK (
        lower(coalesce(auth.jwt() ->> 'email', '')) = 'tanishksinghal6285@gmail.com'
    );

-- Only authenticated authorized administrator may delete contact submissions
CREATE POLICY "Admin can delete contact submissions"
    ON public.contact_submissions
    FOR DELETE
    TO authenticated
    USING (
        lower(coalesce(auth.jwt() ->> 'email', '')) = 'tanishksinghal6285@gmail.com'
    );

-- 4. Trigger to maintain updated_at
CREATE OR REPLACE FUNCTION public.handle_contact_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_contact_submissions_updated_at ON public.contact_submissions;
CREATE TRIGGER trg_contact_submissions_updated_at
    BEFORE UPDATE ON public.contact_submissions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_contact_updated_at();
