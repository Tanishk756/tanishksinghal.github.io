-- Cloudflare D1 Database Schema for Tanishk Singhal Portfolio CMS
-- Supports full content lifecycle: DRAFT -> PUBLISHED -> ARCHIVED
-- Strict provenance metadata, relationship links, and comprehensive audit trails

-- 1. Main Content Table (Multi-domain polymorphic storage with typed JSON data)
CREATE TABLE IF NOT EXISTS content_items (
  id TEXT PRIMARY KEY,
  content_type TEXT NOT NULL,          -- 'project', 'research', 'publication', 'patent', 'experience', 'skill', 'blog', 'achievement', 'certification', 'organization', 'profile'
  slug TEXT UNIQUE,
  title TEXT NOT NULL,
  summary TEXT,
  data_json TEXT NOT NULL,             -- Full Zod-validated JSON payload
  publication_status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'published', 'archived'
  verification_status TEXT NOT NULL DEFAULT 'USER_PROVIDED', -- 'USER_PROVIDED', 'GITHUB_VERIFIED', 'PUBLIC_WEB_VERIFIED', 'PROBABLE', 'UNVERIFIED'
  source TEXT NOT NULL,
  source_url TEXT,
  last_verified TEXT NOT NULL,
  provenance_notes TEXT,
  created_by TEXT NOT NULL,
  updated_by TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP
);

-- Index for high-performance querying by domain type and publication status
CREATE INDEX IF NOT EXISTS idx_content_type_status ON content_items(content_type, publication_status);
CREATE INDEX IF NOT EXISTS idx_content_slug ON content_items(slug);
CREATE INDEX IF NOT EXISTS idx_content_verification ON content_items(verification_status);

-- 2. Media Registry Table (Private/Draft vs Public Asset Isolation)
CREATE TABLE IF NOT EXISTS media_registry (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  title TEXT NOT NULL,
  alt_text TEXT NOT NULL,
  caption TEXT,
  media_type TEXT NOT NULL,           -- 'image', 'diagram', 'cad', 'pcb', 'document', 'video'
  access_level TEXT NOT NULL DEFAULT 'private', -- 'public', 'private', 'draft'
  storage_path TEXT NOT NULL,         -- R2 key / GitHub path / CDN URL
  mime_type TEXT,
  size_bytes INTEGER,
  associated_content_type TEXT,
  associated_content_id TEXT,
  verification_status TEXT NOT NULL DEFAULT 'USER_PROVIDED',
  created_by TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_media_access ON media_registry(access_level);
CREATE INDEX IF NOT EXISTS idx_media_content ON media_registry(associated_content_type, associated_content_id);

-- 3. Comprehensive Audit Trail Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  user_email TEXT NOT NULL,
  action TEXT NOT NULL,               -- e.g. 'PROJECT_CREATED', 'PROJECT_UPDATED', 'PROJECT_PUBLISHED', 'PROJECT_ARCHIVED', 'PUBLICATION_UPDATED', etc.
  content_type TEXT NOT NULL,
  content_id TEXT NOT NULL,
  previous_status TEXT,
  new_status TEXT,
  metadata_json TEXT,                 -- Contextual diff summary (never contains secrets)
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_content ON audit_logs(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_email);

-- 4. GitHub Publication Jobs Table
CREATE TABLE IF NOT EXISTS publish_jobs (
  id TEXT PRIMARY KEY,
  triggered_by TEXT NOT NULL,
  content_type TEXT NOT NULL,
  content_id TEXT NOT NULL,
  git_commit_sha TEXT,
  git_commit_message TEXT,
  status TEXT NOT NULL,               -- 'pending', 'committed', 'failed'
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);
