# ARCHITECTURE DEPRECATION NOTICE — Cloudflare Backend

> **Status: ARCHIVED / DEPRECATED**
> **Canonical Production Backend:** Supabase (PostgreSQL + RLS + Supabase Edge Functions)

### Architecture Context
This directory (`backend/`) contains the initial Cloudflare Workers + D1 prototype implementation.
As of the production migration, the entire portfolio backend is canonically hosted on **Supabase**:
- **Database & RLS**: PostgreSQL schemas and row-level security in `supabase/migrations/`
- **Serverless API**: Deno Edge Functions in `supabase/functions/` (`contact-submit`, `admin-contact`, `admin-content`, `admin-publish`, `admin-audit`, `admin-media`, `public-content`)
- **Authentication**: Supabase Auth with JWT and RBAC

This directory is preserved for migration provenance and historical reference, but is not actively executed by the production application.
