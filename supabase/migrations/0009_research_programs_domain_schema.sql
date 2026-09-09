-- Migration: 0009_research_programs_domain_schema.sql
-- Description: Align public.research_programs schema with canonical Research Program domain, problem, and publication workflow fields

BEGIN;

-- 1. Add domain column if not exists
ALTER TABLE public.research_programs ADD COLUMN IF NOT EXISTS domain TEXT;

-- 2. Populate domain from existing research_area or fallback
UPDATE public.research_programs
SET domain = COALESCE(research_area, 'Robotics & Autonomous Systems')
WHERE domain IS NULL;

-- 3. Add problem column if not exists
ALTER TABLE public.research_programs ADD COLUMN IF NOT EXISTS problem TEXT;

-- 4. Populate problem from existing research_question
UPDATE public.research_programs
SET problem = COALESCE(research_question, '')
WHERE problem IS NULL;

-- 5. Ensure publication_status check constraint exists and allows canonical states
ALTER TABLE public.research_programs DROP CONSTRAINT IF EXISTS research_programs_publication_status_check;
ALTER TABLE public.research_programs ADD CONSTRAINT research_programs_publication_status_check 
  CHECK (publication_status IN ('draft', 'review', 'approved', 'published', 'archived'));

-- 6. Ensure verification_status check constraint exists and allows canonical states
ALTER TABLE public.research_programs DROP CONSTRAINT IF EXISTS research_programs_verification_status_check;
ALTER TABLE public.research_programs ADD CONSTRAINT research_programs_verification_status_check 
  CHECK (verification_status IN ('USER_PROVIDED', 'GITHUB_VERIFIED', 'PUBLIC_WEB_VERIFIED', 'PROBABLE', 'UNVERIFIED'));

COMMIT;
