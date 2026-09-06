export interface Env {
  DB: D1Database;
  ENVIRONMENT: string;
  ALLOWED_ORIGIN: string;
  AUTHORIZED_EMAILS: string;
  GITHUB_REPO_OWNER: string;
  GITHUB_REPO_NAME: string;
  GITHUB_REPO_BRANCH: string;
  RATE_LIMIT_MAX_REQUESTS?: string;
  RATE_LIMIT_WINDOW_SECONDS?: string;

  // Server-Side Secrets (Configured via `wrangler secret put`)
  GITHUB_APP_ID?: string;
  GITHUB_APP_INSTALLATION_ID?: string;
  GITHUB_APP_PRIVATE_KEY_PEM?: string;
  CLOUDFLARE_ACCESS_TEAM_DOMAIN?: string;
  CLOUDFLARE_ACCESS_AUD_TAG?: string;
  DEV_ADMIN_BEARER_TOKEN?: string;
}

export interface AuthIdentity {
  email: string;
  isAuthorized: boolean;
  source: 'cloudflare_access' | 'bearer_dev';
}

export interface ContentItemRow {
  id: string;
  content_type: string;
  slug: string | null;
  title: string;
  summary: string | null;
  data_json: string;
  publication_status: 'draft' | 'published' | 'archived';
  verification_status: 'USER_PROVIDED' | 'GITHUB_VERIFIED' | 'PUBLIC_WEB_VERIFIED' | 'PROBABLE' | 'UNVERIFIED';
  source: string;
  source_url: string | null;
  last_verified: string;
  provenance_notes: string | null;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface MediaRow {
  id: string;
  filename: string;
  title: string;
  alt_text: string;
  caption: string | null;
  media_type: string;
  access_level: 'public' | 'private' | 'draft';
  storage_path: string;
  mime_type: string | null;
  size_bytes: number | null;
  associated_content_type: string | null;
  associated_content_id: string | null;
  verification_status: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface AuditLogRow {
  id: string;
  user_email: string;
  action: string;
  content_type: string;
  content_id: string;
  previous_status: string | null;
  new_status: string | null;
  metadata_json: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
  meta?: {
    timestamp: string;
    version: string;
  };
}
