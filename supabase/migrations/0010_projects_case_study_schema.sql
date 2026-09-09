-- Migration: 0010_projects_case_study_schema.sql
-- Description: Align public.projects schema with canonical Engineering Case Study technical documentation fields

BEGIN;

-- 1. Add missing core identity & classification columns
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'robotics';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'in-progress';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS start_date TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS end_date TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS timeframe TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS role TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS organization TEXT;

-- 2. Add missing technical case study fields
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS problem TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS objective TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS solution TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS architecture TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS subsystems JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS hardware_specs JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS software_stack JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS results JSONB DEFAULT '[]'::jsonb;

-- 3. Add missing external repositories & artifacts columns
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS cover_image TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS docs_url TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS paper_url TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS evidence_url TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS verification_notes TEXT;

-- 4. Ensure publication_status check constraint exists and allows canonical states
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_publication_status_check;
ALTER TABLE public.projects ADD CONSTRAINT projects_publication_status_check 
  CHECK (publication_status IN ('draft', 'review', 'approved', 'published', 'archived'));

-- 5. Ensure verification_status check constraint exists and allows canonical states
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_verification_status_check;
ALTER TABLE public.projects ADD CONSTRAINT projects_verification_status_check 
  CHECK (verification_status IN ('USER_PROVIDED', 'GITHUB_VERIFIED', 'PUBLIC_WEB_VERIFIED', 'PROBABLE', 'UNVERIFIED'));

-- 6. Ensure status check constraint exists and allows valid project states
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_status_check;
ALTER TABLE public.projects ADD CONSTRAINT projects_status_check 
  CHECK (status IN ('completed', 'in-progress', 'prototype', 'research'));

COMMIT;
