-- Migration: 0007_canonical_skills_taxonomy.sql
-- Description: Align public.skills table category data and check constraint with the canonical 7-category taxonomy

BEGIN;

-- 1. Safely drop the legacy category check constraint
ALTER TABLE public.skills DROP CONSTRAINT IF EXISTS skills_category_check;

-- 2. Deterministically map existing draft records to canonical categories
UPDATE public.skills
SET category = 'Robotics & Control'
WHERE category IN ('Robotics', 'Robotics & Autonomous Systems', 'Control Systems & Kinematics', 'Control Systems');

UPDATE public.skills
SET category = 'AI & ML'
WHERE category IN ('AI / ML', 'AI & Machine Learning');

UPDATE public.skills
SET category = 'Firmware & Embedded'
WHERE category IN ('Embedded Systems', 'Embedded Systems & Firmware', 'Firmware');

UPDATE public.skills
SET category = 'Hardware & Circuits'
WHERE name IN (
  'Circuit Prototyping & Debugging',
  'PCB Design Fundamentals',
  'Sensor & Actuator Calibration',
  'Power Distribution Basics'
) OR category IN ('Electronics', 'CAD / Engineering Tools', 'CAD & Engineering Tools');

UPDATE public.skills
SET category = 'Software & Tools'
WHERE category IN ('Programming', 'Programming & Software', 'Tools & Protocols', 'General')
  AND category NOT IN ('Hardware & Circuits');

UPDATE public.skills
SET category = 'Space Systems & UAV'
WHERE category IN ('UAVs', 'Aerospace');

-- Fallback for any unmapped category
UPDATE public.skills
SET category = 'Software & Tools'
WHERE category NOT IN (
  'Robotics & Control',
  'Autonomous Systems',
  'AI & ML',
  'Firmware & Embedded',
  'Hardware & Circuits',
  'Space Systems & UAV',
  'Software & Tools'
);

-- 3. Add canonical 7-category check constraint
ALTER TABLE public.skills ADD CONSTRAINT skills_category_check CHECK (
  category IN (
    'Robotics & Control',
    'Autonomous Systems',
    'AI & ML',
    'Firmware & Embedded',
    'Hardware & Circuits',
    'Space Systems & UAV',
    'Software & Tools'
  )
);

COMMIT;
