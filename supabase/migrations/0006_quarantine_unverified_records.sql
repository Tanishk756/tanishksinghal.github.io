-- ==============================================================================
-- 0006_quarantine_unverified_records.sql
-- Strictly isolates unverified, probable, and synthetic records from canonical tables.
-- ==============================================================================

-- 1. Create Quarantine Storage Table
CREATE TABLE IF NOT EXISTS public.quarantined_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_domain TEXT NOT NULL,
    original_id TEXT,
    title_or_name TEXT NOT NULL,
    record_payload JSONB NOT NULL,
    verification_status TEXT NOT NULL CHECK (verification_status IN ('PROBABLE', 'UNVERIFIED')),
    quarantine_reason TEXT NOT NULL,
    quarantined_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.quarantined_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Quarantined records admin only" ON public.quarantined_records;
CREATE POLICY "Quarantined records admin only" ON public.quarantined_records
FOR ALL TO authenticated
USING (lower(coalesce(auth.jwt() ->> 'email', '')) = 'tanishksinghal6285@gmail.com')
WITH CHECK (lower(coalesce(auth.jwt() ->> 'email', '')) = 'tanishksinghal6285@gmail.com');

-- 2. Move PROBABLE Experience records to quarantine and delete from canonical experience
INSERT INTO public.quarantined_records (original_domain, original_id, title_or_name, record_payload, verification_status, quarantine_reason)
SELECT 
    'experience',
    id::text,
    organization || ' - ' || role_title,
    to_jsonb(e),
    verification_status,
    'Unverified/Probable experience record quarantined pending explicit owner authorization'
FROM public.experience e
WHERE verification_status IN ('PROBABLE', 'UNVERIFIED') OR organization ILIKE '%Independent Open Source Robotics%';

DELETE FROM public.experience 
WHERE verification_status IN ('PROBABLE', 'UNVERIFIED') OR organization ILIKE '%Independent Open Source Robotics%';

-- 3. Move PROBABLE Organizations records to quarantine and delete from canonical organizations
INSERT INTO public.quarantined_records (original_domain, original_id, title_or_name, record_payload, verification_status, quarantine_reason)
SELECT 
    'organizations',
    id::text,
    name || ' (' || coalesce(role, '') || ')',
    to_jsonb(o),
    verification_status,
    'Unverified/Probable organization record quarantined pending explicit owner authorization'
FROM public.organizations o
WHERE verification_status IN ('PROBABLE', 'UNVERIFIED');

DELETE FROM public.organizations 
WHERE verification_status IN ('PROBABLE', 'UNVERIFIED');

-- 4. Clean synthetic/test contact submissions
DELETE FROM public.contact_submissions 
WHERE email = 'tanishksinghal6285@gmail.com' AND subject = 'Research';

-- 5. Add strict CHECK constraint to canonical experience and organizations tables
-- Ensure NO probable/unverified records can ever be inserted into canonical tables
ALTER TABLE public.experience DROP CONSTRAINT IF EXISTS experience_verification_status_check;
ALTER TABLE public.experience ADD CONSTRAINT experience_verification_status_check 
CHECK (verification_status IN ('USER_PROVIDED', 'GITHUB_VERIFIED', 'PUBLIC_WEB_VERIFIED'));

ALTER TABLE public.organizations DROP CONSTRAINT IF EXISTS organizations_verification_status_check;
ALTER TABLE public.organizations ADD CONSTRAINT organizations_verification_status_check 
CHECK (verification_status IN ('USER_PROVIDED', 'GITHUB_VERIFIED', 'PUBLIC_WEB_VERIFIED'));
