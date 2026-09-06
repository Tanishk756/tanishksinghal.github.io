-- Supabase PostgreSQL Schema for Tanishk Singhal Portfolio Private CMS
-- Version: 0001_initial_schema.sql
-- Supports 5-State Content Lifecycle: DRAFT -> REVIEW -> APPROVED -> PUBLISHED -> ARCHIVED
-- Provenance gating, polymorphic media registry, immutable audit logs, and publication jobs

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================================================
-- 1. ADMIN AUTHORIZATION TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Pre-seed designated administrator
INSERT INTO admin_users (email, role)
VALUES ('tanishksinghal6285@gmail.com', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Helper SQL function to check if current user is an authorized admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users
    WHERE LOWER(email) = LOWER(COALESCE(auth.jwt() ->> 'email', ''))
  ) OR LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'tanishksinghal6285@gmail.com';
$$;

-- ====================================================================
-- 2. CONTENT ITEMS TABLE (5-State Lifecycle & Provenance Gating)
-- ====================================================================
CREATE TABLE IF NOT EXISTS content_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  content_type TEXT NOT NULL,          -- 'project', 'research', 'publication', 'patent', 'experience', 'skill', 'blog', 'achievement', 'certification', 'organization', 'profile'
  slug TEXT UNIQUE,
  title TEXT NOT NULL,
  summary TEXT,
  data_json JSONB NOT NULL,             -- Validated JSON payload
  publication_status TEXT NOT NULL DEFAULT 'draft' CHECK (
    publication_status IN ('draft', 'review', 'approved', 'published', 'archived')
  ),
  verification_status TEXT NOT NULL DEFAULT 'USER_PROVIDED' CHECK (
    verification_status IN ('USER_PROVIDED', 'GITHUB_VERIFIED', 'PUBLIC_WEB_VERIFIED', 'PROBABLE', 'UNVERIFIED')
  ),
  source TEXT NOT NULL,
  source_url TEXT,
  last_verified TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  provenance_notes TEXT,
  created_by TEXT NOT NULL,
  updated_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_content_type_status ON content_items(content_type, publication_status);
CREATE INDEX IF NOT EXISTS idx_content_slug ON content_items(slug);
CREATE INDEX IF NOT EXISTS idx_content_verification ON content_items(verification_status);
CREATE INDEX IF NOT EXISTS idx_content_updated_at ON content_items(updated_at DESC);

-- ====================================================================
-- 3. MEDIA REGISTRY TABLE (Private/Draft vs Public Asset Isolation)
-- ====================================================================
CREATE TABLE IF NOT EXISTS media_registry (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  filename TEXT NOT NULL,
  title TEXT NOT NULL,
  alt_text TEXT NOT NULL,
  caption TEXT,
  media_type TEXT NOT NULL CHECK (
    media_type IN ('image', 'diagram', 'cad', 'pcb', 'document', 'video')
  ),
  access_level TEXT NOT NULL DEFAULT 'private' CHECK (
    access_level IN ('public', 'private', 'draft')
  ),
  storage_path TEXT NOT NULL,         -- Supabase Storage bucket object path
  mime_type TEXT,
  size_bytes BIGINT,
  associated_content_type TEXT,
  associated_content_id TEXT,
  verification_status TEXT NOT NULL DEFAULT 'USER_PROVIDED' CHECK (
    verification_status IN ('USER_PROVIDED', 'GITHUB_VERIFIED', 'PUBLIC_WEB_VERIFIED', 'PROBABLE', 'UNVERIFIED')
  ),
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_access ON media_registry(access_level);
CREATE INDEX IF NOT EXISTS idx_media_content ON media_registry(associated_content_type, associated_content_id);

-- ====================================================================
-- 4. COMPREHENSIVE AUDIT TRAIL TABLE (Immutable Ledger)
-- ====================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_email TEXT NOT NULL,
  action TEXT NOT NULL,               -- e.g. 'CONTENT_CREATED', 'LIFECYCLE_CHANGED', 'PUBLISH_TRIGGERED', etc.
  content_type TEXT NOT NULL,
  content_id TEXT NOT NULL,
  previous_status TEXT,
  new_status TEXT,
  metadata_json JSONB,                -- Contextual diff summary (NO secret material)
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_content ON audit_logs(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_email);

-- Prevent any modification or deletion of audit logs (Immutability guarantee)
CREATE OR REPLACE FUNCTION enforce_audit_immutability()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'Audit log entries are immutable and cannot be updated or deleted.';
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_immutability ON audit_logs;
CREATE TRIGGER trg_audit_immutability
BEFORE UPDATE OR DELETE ON audit_logs
FOR EACH ROW
EXECUTE FUNCTION enforce_audit_immutability();

-- ====================================================================
-- 5. GITHUB PUBLICATION JOBS TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS publish_jobs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  triggered_by TEXT NOT NULL,
  content_type TEXT NOT NULL,
  content_id TEXT NOT NULL,
  git_commit_sha TEXT,
  git_commit_message TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'committed', 'failed', 'blocked_phase9')),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_publish_jobs_created ON publish_jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_publish_jobs_content ON publish_jobs(content_type, content_id);

-- ====================================================================
-- 6. PUBLIC CONTENT QUERY HELPER (Strict Provenance Enforced)
-- ====================================================================
CREATE OR REPLACE FUNCTION get_public_content(p_content_type TEXT)
RETURNS SETOF content_items
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT *
  FROM content_items
  WHERE content_type = p_content_type
    AND publication_status = 'published'
    AND verification_status IN ('USER_PROVIDED', 'GITHUB_VERIFIED', 'PUBLIC_WEB_VERIFIED')
  ORDER BY created_at DESC;
$$;

-- ====================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

-- A. Admin Users Table RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users read policy"
ON admin_users
FOR SELECT
USING (is_admin());

-- B. Content Items Table RLS
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;

-- Public (anon) users: ONLY published + verified items
CREATE POLICY "Public read verified published content only"
ON content_items
FOR SELECT
TO anon, authenticated
USING (
  publication_status = 'published'
  AND verification_status IN ('USER_PROVIDED', 'GITHUB_VERIFIED', 'PUBLIC_WEB_VERIFIED')
);

-- Admin users: full access to all statuses (draft, review, approved, published, archived)
CREATE POLICY "Admin full access on content_items"
ON content_items
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- C. Media Registry Table RLS
ALTER TABLE media_registry ENABLE ROW LEVEL SECURITY;

-- Public (anon) users: ONLY public access level + verified items
CREATE POLICY "Public read verified public media only"
ON media_registry
FOR SELECT
TO anon, authenticated
USING (
  access_level = 'public'
  AND verification_status IN ('USER_PROVIDED', 'GITHUB_VERIFIED', 'PUBLIC_WEB_VERIFIED')
);

-- Admin users: full media management access
CREATE POLICY "Admin full access on media_registry"
ON media_registry
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- D. Audit Logs Table RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Public users: Zero access
-- Admin users: Read-only access
CREATE POLICY "Admin read audit_logs"
ON audit_logs
FOR SELECT
TO authenticated
USING (is_admin());

-- Insert permitted by service role or admin functions
CREATE POLICY "Admin insert audit_logs"
ON audit_logs
FOR INSERT
TO authenticated, service_role
WITH CHECK (true);

-- E. Publish Jobs Table RLS
ALTER TABLE publish_jobs ENABLE ROW LEVEL SECURITY;

-- Public users: Zero access
-- Admin users: Read and mutate publish jobs
CREATE POLICY "Admin manage publish_jobs"
ON publish_jobs
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());
