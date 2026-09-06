-- ==============================================================================
-- 0004_master_portfolio_schema.sql: Normalized Personal CMS & Single Source of Truth
-- ==============================================================================
-- Extends the initial schema with typed domain tables, provenance tracking,
-- polymorphic content relationships, content versioning, and strict RLS.

-- 1. PROFILES TABLE (Canonical Personal Identity & Verification Anchors)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL CHECK (char_length(trim(full_name)) >= 2 AND char_length(full_name) <= 120),
    display_name TEXT NOT NULL CHECK (char_length(trim(display_name)) >= 2 AND char_length(display_name) <= 80),
    headline TEXT NOT NULL CHECK (char_length(trim(headline)) >= 5 AND char_length(headline) <= 250),
    short_bio TEXT NOT NULL CHECK (char_length(trim(short_bio)) >= 10 AND char_length(short_bio) <= 600),
    long_bio TEXT,
    location TEXT NOT NULL CHECK (char_length(trim(location)) >= 2 AND char_length(location) <= 120),
    email TEXT NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND char_length(email) <= 254),
    phone TEXT,
    avatar_url TEXT,
    resume_url TEXT,
    github_url TEXT,
    linkedin_url TEXT,
    google_scholar_url TEXT,
    researchgate_url TEXT,
    website_url TEXT,
    availability_status TEXT DEFAULT 'Open to select research and robotics engineering collaborations',
    publication_status TEXT NOT NULL DEFAULT 'draft' CHECK (publication_status IN ('draft', 'review', 'approved', 'published', 'archived')),
    verification_status TEXT NOT NULL DEFAULT 'USER_PROVIDED' CHECK (verification_status IN ('USER_PROVIDED', 'GITHUB_VERIFIED', 'PUBLIC_WEB_VERIFIED', 'PROBABLE', 'UNVERIFIED')),
    last_verified TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. EDUCATION TABLE
CREATE TABLE IF NOT EXISTS public.education (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution TEXT NOT NULL CHECK (char_length(trim(institution)) >= 2 AND char_length(institution) <= 160),
    degree TEXT NOT NULL CHECK (char_length(trim(degree)) >= 2 AND char_length(degree) <= 160),
    field TEXT NOT NULL CHECK (char_length(trim(field)) >= 2 AND char_length(field) <= 160),
    start_date TEXT NOT NULL,
    end_date TEXT,
    is_current BOOLEAN NOT NULL DEFAULT false,
    grade TEXT,
    grade_type TEXT,
    location TEXT,
    description TEXT,
    credential_url TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    publication_status TEXT NOT NULL DEFAULT 'draft' CHECK (publication_status IN ('draft', 'review', 'approved', 'published', 'archived')),
    verification_status TEXT NOT NULL DEFAULT 'USER_PROVIDED' CHECK (verification_status IN ('USER_PROVIDED', 'GITHUB_VERIFIED', 'PUBLIC_WEB_VERIFIED', 'PROBABLE', 'UNVERIFIED')),
    verification_notes TEXT,
    last_verified TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. EXPERIENCE TABLE
CREATE TABLE IF NOT EXISTS public.experience (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization TEXT NOT NULL CHECK (char_length(trim(organization)) >= 2 AND char_length(organization) <= 160),
    role TEXT NOT NULL CHECK (char_length(trim(role)) >= 2 AND char_length(role) <= 160),
    category TEXT NOT NULL DEFAULT 'employment' CHECK (category IN ('employment', 'internship', 'apprenticeship', 'committee', 'volunteering', 'entrepreneurship', 'self-employed', 'community')),
    employment_type TEXT DEFAULT 'Full-time',
    start_date TEXT NOT NULL,
    end_date TEXT,
    is_current BOOLEAN NOT NULL DEFAULT false,
    location TEXT,
    work_mode TEXT DEFAULT 'On-site' CHECK (work_mode IN ('On-site', 'Hybrid', 'Remote')),
    summary TEXT,
    responsibilities JSONB DEFAULT '[]'::jsonb,
    technologies JSONB DEFAULT '[]'::jsonb,
    evidence_url TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    publication_status TEXT NOT NULL DEFAULT 'draft' CHECK (publication_status IN ('draft', 'review', 'approved', 'published', 'archived')),
    verification_status TEXT NOT NULL DEFAULT 'USER_PROVIDED' CHECK (verification_status IN ('USER_PROVIDED', 'GITHUB_VERIFIED', 'PUBLIC_WEB_VERIFIED', 'PROBABLE', 'UNVERIFIED')),
    verification_notes TEXT,
    last_verified TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. PROJECTS TABLE (Engineering Case Studies)
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL CHECK (char_length(trim(slug)) >= 2 AND char_length(slug) <= 120),
    title TEXT NOT NULL CHECK (char_length(trim(title)) >= 2 AND char_length(title) <= 200),
    subtitle TEXT,
    category TEXT NOT NULL DEFAULT 'Autonomous Systems',
    timeframe TEXT,
    overview TEXT NOT NULL CHECK (char_length(trim(overview)) >= 10),
    problem TEXT,
    objectives JSONB DEFAULT '[]'::jsonb,
    solution TEXT,
    architecture TEXT,
    subsystems JSONB DEFAULT '[]'::jsonb,
    hardware_specs JSONB DEFAULT '[]'::jsonb,
    software_stack JSONB DEFAULT '[]'::jsonb,
    firmware_specs JSONB DEFAULT '[]'::jsonb,
    algorithms JSONB DEFAULT '[]'::jsonb,
    tools JSONB DEFAULT '[]'::jsonb,
    technologies JSONB DEFAULT '[]'::jsonb,
    challenges JSONB DEFAULT '[]'::jsonb,
    results JSONB DEFAULT '[]'::jsonb,
    limitations JSONB DEFAULT '[]'::jsonb,
    future_work JSONB DEFAULT '[]'::jsonb,
    github_url TEXT,
    demo_url TEXT,
    docs_url TEXT,
    cover_image TEXT,
    media_gallery JSONB DEFAULT '[]'::jsonb,
    featured BOOLEAN NOT NULL DEFAULT false,
    display_order INTEGER NOT NULL DEFAULT 0,
    publication_status TEXT NOT NULL DEFAULT 'draft' CHECK (publication_status IN ('draft', 'review', 'approved', 'published', 'archived')),
    verification_status TEXT NOT NULL DEFAULT 'USER_PROVIDED' CHECK (verification_status IN ('USER_PROVIDED', 'GITHUB_VERIFIED', 'PUBLIC_WEB_VERIFIED', 'PROBABLE', 'UNVERIFIED')),
    verification_notes TEXT,
    last_verified TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. RESEARCH PROGRAMS TABLE
CREATE TABLE IF NOT EXISTS public.research_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL CHECK (char_length(trim(slug)) >= 2 AND char_length(slug) <= 120),
    title TEXT NOT NULL CHECK (char_length(trim(title)) >= 2 AND char_length(title) <= 200),
    area TEXT NOT NULL CHECK (char_length(trim(area)) >= 2 AND char_length(area) <= 160),
    summary TEXT NOT NULL CHECK (char_length(trim(summary)) >= 10),
    research_question TEXT,
    methodology TEXT,
    contribution TEXT,
    status_label TEXT DEFAULT 'Active Exploration',
    collaborators JSONB DEFAULT '[]'::jsonb,
    evidence_url TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    publication_status TEXT NOT NULL DEFAULT 'draft' CHECK (publication_status IN ('draft', 'review', 'approved', 'published', 'archived')),
    verification_status TEXT NOT NULL DEFAULT 'USER_PROVIDED' CHECK (verification_status IN ('USER_PROVIDED', 'GITHUB_VERIFIED', 'PUBLIC_WEB_VERIFIED', 'PROBABLE', 'UNVERIFIED')),
    verification_notes TEXT,
    last_verified TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. PUBLICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.publications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL CHECK (char_length(trim(slug)) >= 2 AND char_length(slug) <= 120),
    title TEXT NOT NULL CHECK (char_length(trim(title)) >= 2 AND char_length(title) <= 300),
    authors JSONB NOT NULL DEFAULT '[]'::jsonb,
    venue TEXT NOT NULL CHECK (char_length(trim(venue)) >= 2 AND char_length(venue) <= 200),
    publication_type TEXT NOT NULL DEFAULT 'Peer-Reviewed Conference' CHECK (publication_type IN ('Peer-Reviewed Conference', 'Journal Article', 'Workshop Paper', 'Preprint', 'Technical Report', 'Patent Filing')),
    year INTEGER NOT NULL,
    date TEXT,
    doi TEXT,
    abstract TEXT NOT NULL CHECK (char_length(trim(abstract)) >= 10),
    keywords JSONB DEFAULT '[]'::jsonb,
    pdf_url TEXT,
    doi_url TEXT,
    scholar_url TEXT,
    researchgate_url TEXT,
    citation_count INTEGER,
    display_order INTEGER NOT NULL DEFAULT 0,
    publication_status TEXT NOT NULL DEFAULT 'draft' CHECK (publication_status IN ('draft', 'review', 'approved', 'published', 'archived')),
    verification_status TEXT NOT NULL DEFAULT 'USER_PROVIDED' CHECK (verification_status IN ('USER_PROVIDED', 'GITHUB_VERIFIED', 'PUBLIC_WEB_VERIFIED', 'PROBABLE', 'UNVERIFIED')),
    verification_notes TEXT,
    last_verified TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. PATENTS TABLE
CREATE TABLE IF NOT EXISTS public.patents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL CHECK (char_length(trim(slug)) >= 2 AND char_length(slug) <= 120),
    title TEXT NOT NULL CHECK (char_length(trim(title)) >= 2 AND char_length(title) <= 300),
    inventors JSONB NOT NULL DEFAULT '[]'::jsonb,
    application_number TEXT NOT NULL,
    patent_number TEXT,
    jurisdiction TEXT NOT NULL DEFAULT 'India (IN)',
    filing_date TEXT NOT NULL,
    publication_date TEXT,
    status TEXT NOT NULL DEFAULT 'Published / Pending Examination' CHECK (status IN ('Filed', 'Published / Pending Examination', 'Granted', 'Under Review', 'Abandoned')),
    assignee TEXT,
    description TEXT NOT NULL CHECK (char_length(trim(description)) >= 10),
    registry_url TEXT,
    evidence_url TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    publication_status TEXT NOT NULL DEFAULT 'draft' CHECK (publication_status IN ('draft', 'review', 'approved', 'published', 'archived')),
    verification_status TEXT NOT NULL DEFAULT 'USER_PROVIDED' CHECK (verification_status IN ('USER_PROVIDED', 'GITHUB_VERIFIED', 'PUBLIC_WEB_VERIFIED', 'PROBABLE', 'UNVERIFIED')),
    verification_notes TEXT,
    last_verified TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. ACHIEVEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL CHECK (char_length(trim(title)) >= 2 AND char_length(title) <= 200),
    issuer TEXT NOT NULL CHECK (char_length(trim(issuer)) >= 2 AND char_length(issuer) <= 160),
    date TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Honor' CHECK (category IN ('Honor', 'Award', 'Hackathon', 'Fellowship', 'Scholarship', 'Recognition')),
    description TEXT NOT NULL CHECK (char_length(trim(description)) >= 10),
    evidence_url TEXT,
    certificate_url TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    publication_status TEXT NOT NULL DEFAULT 'draft' CHECK (publication_status IN ('draft', 'review', 'approved', 'published', 'archived')),
    verification_status TEXT NOT NULL DEFAULT 'USER_PROVIDED' CHECK (verification_status IN ('USER_PROVIDED', 'GITHUB_VERIFIED', 'PUBLIC_WEB_VERIFIED', 'PROBABLE', 'UNVERIFIED')),
    verification_notes TEXT,
    last_verified TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. CERTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL CHECK (char_length(trim(name)) >= 2 AND char_length(name) <= 200),
    issuing_organization TEXT NOT NULL CHECK (char_length(trim(issuing_organization)) >= 2 AND char_length(issuing_organization) <= 160),
    credential_id TEXT,
    issue_date TEXT NOT NULL,
    expiry_date TEXT,
    verification_url TEXT,
    certificate_file TEXT,
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    publication_status TEXT NOT NULL DEFAULT 'draft' CHECK (publication_status IN ('draft', 'review', 'approved', 'published', 'archived')),
    verification_status TEXT NOT NULL DEFAULT 'USER_PROVIDED' CHECK (verification_status IN ('USER_PROVIDED', 'GITHUB_VERIFIED', 'PUBLIC_WEB_VERIFIED', 'PROBABLE', 'UNVERIFIED')),
    verification_notes TEXT,
    last_verified TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. SKILLS TABLE
CREATE TABLE IF NOT EXISTS public.skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL CHECK (category IN ('Robotics & Autonomous Systems', 'AI & Machine Learning', 'Embedded Systems & Firmware', 'Control Systems & Kinematics', 'Programming & Software', 'CAD & Engineering Tools', 'Tools & Protocols')),
    name TEXT NOT NULL CHECK (char_length(trim(name)) >= 1 AND char_length(name) <= 100),
    description TEXT,
    years_experience NUMERIC(4,1),
    evidence_urls JSONB DEFAULT '[]'::jsonb,
    display_order INTEGER NOT NULL DEFAULT 0,
    publication_status TEXT NOT NULL DEFAULT 'draft' CHECK (publication_status IN ('draft', 'review', 'approved', 'published', 'archived')),
    verification_status TEXT NOT NULL DEFAULT 'USER_PROVIDED' CHECK (verification_status IN ('USER_PROVIDED', 'GITHUB_VERIFIED', 'PUBLIC_WEB_VERIFIED', 'PROBABLE', 'UNVERIFIED')),
    verification_notes TEXT,
    last_verified TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 11. ORGANIZATIONS TABLE
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL CHECK (char_length(trim(name)) >= 2 AND char_length(name) <= 160),
    role TEXT NOT NULL CHECK (char_length(trim(role)) >= 2 AND char_length(role) <= 160),
    type TEXT NOT NULL DEFAULT 'Academic' CHECK (type IN ('Academic', 'Industry', 'Research Lab', 'Open Source', 'Student Team', 'Professional Society')),
    start_date TEXT NOT NULL,
    end_date TEXT,
    is_current BOOLEAN NOT NULL DEFAULT false,
    location TEXT,
    description TEXT,
    official_url TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    publication_status TEXT NOT NULL DEFAULT 'draft' CHECK (publication_status IN ('draft', 'review', 'approved', 'published', 'archived')),
    verification_status TEXT NOT NULL DEFAULT 'USER_PROVIDED' CHECK (verification_status IN ('USER_PROVIDED', 'GITHUB_VERIFIED', 'PUBLIC_WEB_VERIFIED', 'PROBABLE', 'UNVERIFIED')),
    verification_notes TEXT,
    last_verified TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 12. BLOG POSTS TABLE
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL CHECK (char_length(trim(slug)) >= 2 AND char_length(slug) <= 120),
    title TEXT NOT NULL CHECK (char_length(trim(title)) >= 2 AND char_length(title) <= 200),
    excerpt TEXT NOT NULL CHECK (char_length(trim(excerpt)) >= 10 AND char_length(excerpt) <= 500),
    body TEXT NOT NULL CHECK (char_length(trim(body)) >= 20),
    cover_image TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    category TEXT DEFAULT 'Engineering',
    author TEXT NOT NULL DEFAULT 'Tanishk Singhal',
    reading_time_minutes INTEGER DEFAULT 5,
    seo_title TEXT,
    seo_description TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    publication_status TEXT NOT NULL DEFAULT 'draft' CHECK (publication_status IN ('draft', 'review', 'approved', 'published', 'archived')),
    verification_status TEXT NOT NULL DEFAULT 'USER_PROVIDED' CHECK (verification_status IN ('USER_PROVIDED', 'GITHUB_VERIFIED', 'PUBLIC_WEB_VERIFIED', 'PROBABLE', 'UNVERIFIED')),
    verification_notes TEXT,
    last_verified TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 13. CONTENT RELATIONSHIPS (Polymorphic Junctions)
CREATE TABLE IF NOT EXISTS public.content_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_type TEXT NOT NULL,
    source_id UUID NOT NULL,
    target_type TEXT NOT NULL,
    target_id UUID NOT NULL,
    relationship_type TEXT NOT NULL DEFAULT 'related',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unq_relationship UNIQUE (source_type, source_id, target_type, target_id, relationship_type)
);

CREATE INDEX IF NOT EXISTS idx_rel_source ON public.content_relationships(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_rel_target ON public.content_relationships(target_type, target_id);

-- 14. CONTENT VERSIONS TABLE (Immutable Snapshots for History & Rollback)
CREATE TABLE IF NOT EXISTS public.content_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    version_number INTEGER NOT NULL,
    snapshot_json JSONB NOT NULL,
    change_summary TEXT,
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_versions_entity ON public.content_versions(entity_type, entity_id, version_number DESC);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) FOR ALL MASTER CONTENT TABLES
-- ==============================================================================

DO $$
DECLARE
    t text;
    tables text[] := ARRAY[
        'profiles', 'education', 'experience', 'projects', 'research_programs',
        'publications', 'patents', 'achievements', 'certifications', 'skills',
        'organizations', 'blog_posts', 'content_relationships', 'content_versions'
    ];
BEGIN
    FOREACH t IN ARRAY tables
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);

        -- Public Read: Published items only (or relationships/versions)
        IF t = 'content_versions' THEN
            EXECUTE format('
                DROP POLICY IF EXISTS "Public cannot select content versions" ON public.%I;
                CREATE POLICY "Public cannot select content versions" ON public.%I FOR SELECT TO anon USING (false);
            ', t, t);
        ELSIF t = 'content_relationships' THEN
            EXECUTE format('
                DROP POLICY IF EXISTS "Public can select content relationships" ON public.%I;
                CREATE POLICY "Public can select content relationships" ON public.%I FOR SELECT TO anon USING (true);
            ', t, t);
        ELSE
            EXECUTE format('
                DROP POLICY IF EXISTS "Public can select published items" ON public.%I;
                CREATE POLICY "Public can select published items" ON public.%I FOR SELECT TO anon 
                USING (publication_status = ''published'');
            ', t, t);
        END IF;

        -- Admin Full Access: Authenticated Owner Only
        EXECUTE format('
            DROP POLICY IF EXISTS "Admin has full access" ON public.%I;
            CREATE POLICY "Admin has full access" ON public.%I FOR ALL TO authenticated
            USING (lower(coalesce(auth.jwt() ->> ''email'', '''')) = ''tanishksinghal6285@gmail.com'')
            WITH CHECK (lower(coalesce(auth.jwt() ->> ''email'', '''')) = ''tanishksinghal6285@gmail.com'');
        ', t, t);
    END LOOP;
END $$;
