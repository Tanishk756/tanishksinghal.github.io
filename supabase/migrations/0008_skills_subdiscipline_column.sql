-- Migration: 0008_skills_subdiscipline_column.sql
-- Description: Add dedicated subdiscipline column to public.skills table and backfill from description

BEGIN;

ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS subdiscipline TEXT;

-- Backfill subdiscipline from description where applicable
UPDATE public.skills
SET subdiscipline = description
WHERE subdiscipline IS NULL AND description IS NOT NULL;

-- Keep description synced as fallback
UPDATE public.skills
SET description = subdiscipline
WHERE description IS NULL AND subdiscipline IS NOT NULL;

COMMIT;
