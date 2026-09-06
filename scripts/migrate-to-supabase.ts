import fs from 'fs';
import path from 'path';
import { profileData } from '../src/content/profile';
import { educationData } from '../src/content/education';
import { experienceData } from '../src/content/experience';
import { projectsData } from '../src/content/projects';
import { researchData } from '../src/content/research';
import { publicationsData } from '../src/content/publications';
import { patentsData } from '../src/content/patents';
import { achievementsData } from '../src/content/achievements';
import { certificationsData } from '../src/content/certifications';
import { skillsData } from '../src/content/skills';
import { organizationsData } from '../src/content/organizations';
import { blogPostsData } from '../src/content/blog';

function escapeSql(str: any): string {
  if (str === null || str === undefined) return 'NULL';
  if (typeof str === 'boolean') return str ? 'true' : 'false';
  if (typeof str === 'number') return String(str);
  if (typeof str === 'object') {
    return `'${JSON.stringify(str).replace(/'/g, "''")}'::jsonb`;
  }
  return `'${String(str).replace(/'/g, "''")}'`;
}

const sqlStatements: string[] = [
  '-- Data Migration from Static TypeScript files to Master Supabase CMS tables (All as DRAFT)',
  'BEGIN;'
];

// 1. Profile
sqlStatements.push(`
INSERT INTO public.profiles (
  full_name, display_name, headline, short_bio, long_bio, location, email,
  profile_image_url, resume_url, github_url, linkedin_url, google_scholar_url, researchgate_url,
  publication_status, verification_status, last_verified
) VALUES (
  ${escapeSql(profileData.fullName)},
  ${escapeSql(profileData.displayName)},
  ${escapeSql(profileData.headline)},
  ${escapeSql(profileData.shortBio)},
  ${escapeSql(Array.isArray(profileData.longBio) ? profileData.longBio.join('\n\n') : profileData.longBio)},
  ${escapeSql(profileData.location)},
  ${escapeSql(profileData.email)},
  ${escapeSql(profileData.avatarUrl)},
  ${escapeSql(profileData.resumeUrl)},
  ${escapeSql(profileData.socials?.github)},
  ${escapeSql(profileData.socials?.linkedin)},
  ${escapeSql(profileData.socials?.googleScholar)},
  ${escapeSql(profileData.socials?.researchGate)},
  'draft',
  ${escapeSql(profileData.verificationStatus || 'USER_PROVIDED')},
  ${escapeSql(profileData.lastVerified ? new Date(profileData.lastVerified).toISOString() : new Date().toISOString())}
) ON CONFLICT DO NOTHING;
`);

// 2. Education
educationData.forEach((edu, idx) => {
  sqlStatements.push(`
INSERT INTO public.education (
  institution, degree, field, start_date, end_date, is_current, grade, location, description,
  display_order, publication_status, verification_status, last_verified
) VALUES (
  ${escapeSql(edu.institution)},
  ${escapeSql(edu.degree)},
  ${escapeSql(edu.fieldOfStudy || edu.degree)},
  ${escapeSql(edu.startDate)},
  ${escapeSql(edu.endDate)},
  ${escapeSql(edu.isCurrent || false)},
  ${escapeSql(edu.grade)},
  ${escapeSql(edu.location)},
  ${escapeSql(edu.description)},
  ${idx},
  'draft',
  ${escapeSql(edu.verificationStatus || 'USER_PROVIDED')},
  ${escapeSql(edu.lastVerified ? new Date(edu.lastVerified).toISOString() : new Date().toISOString())}
) ON CONFLICT DO NOTHING;
  `);
});

// 3. Experience
experienceData.forEach((exp, idx) => {
  sqlStatements.push(`
INSERT INTO public.experience (
  organization, role, category, start_date, end_date, is_current, location, summary,
  responsibilities, technologies, evidence_url, display_order, publication_status,
  verification_status, last_verified
) VALUES (
  ${escapeSql(exp.organization)},
  ${escapeSql(exp.role)},
  'employment',
  ${escapeSql(exp.startDate)},
  ${escapeSql(exp.endDate)},
  ${escapeSql(exp.isCurrent || false)},
  ${escapeSql(exp.location)},
  ${escapeSql(exp.description)},
  ${escapeSql(exp.responsibilities || [])},
  ${escapeSql(exp.technologies || [])},
  ${escapeSql(exp.sourceUrl)},
  ${idx},
  'draft',
  ${escapeSql(exp.verificationStatus || 'USER_PROVIDED')},
  ${escapeSql(exp.lastVerified ? new Date(exp.lastVerified).toISOString() : new Date().toISOString())}
) ON CONFLICT DO NOTHING;
  `);
});

// 4. Projects
projectsData.forEach((proj, idx) => {
  sqlStatements.push(`
INSERT INTO public.projects (
  slug, title, subtitle, category, timeframe, overview, problem, solution,
  architecture, subsystems, hardware_specs, software_stack, algorithms,
  challenges, results, limitations, future_work, github_url, cover_image,
  featured, display_order, publication_status, verification_status, last_verified
) VALUES (
  ${escapeSql(proj.slug)},
  ${escapeSql(proj.title)},
  ${escapeSql(proj.tagline)},
  ${escapeSql(proj.category)},
  ${escapeSql(proj.startDate)},
  ${escapeSql(proj.approach || proj.objective || proj.problem || proj.title)},
  ${escapeSql(proj.problem)},
  ${escapeSql(proj.approach)},
  ${escapeSql(proj.architectureDescription)},
  ${escapeSql(proj.subsystems || [])},
  ${escapeSql(proj.hardwareStack || [])},
  ${escapeSql(proj.softwareStack || [])},
  ${escapeSql(proj.algorithms || [])},
  ${escapeSql(proj.challenges || [])},
  ${escapeSql(proj.results?.summary || [])},
  ${escapeSql(proj.lessonsLearned || [])},
  ${escapeSql(proj.futureWork || [])},
  ${escapeSql(proj.githubUrl)},
  ${escapeSql(proj.coverImage)},
  ${proj.featured ? 'true' : 'false'},
  ${idx},
  'draft',
  ${escapeSql(proj.verificationStatus || 'GITHUB_VERIFIED')},
  ${escapeSql(proj.lastVerified ? new Date(proj.lastVerified).toISOString() : new Date().toISOString())}
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  overview = EXCLUDED.overview;
  `);
});

// 5. Research Programs
researchData.forEach((prog, idx) => {
  sqlStatements.push(`
INSERT INTO public.research_programs (
  slug, title, area, summary, research_question, methodology, contribution,
  status_label, collaborators, display_order, publication_status,
  verification_status, last_verified
) VALUES (
  ${escapeSql(prog.slug)},
  ${escapeSql(prog.title)},
  ${escapeSql(prog.area || 'Robotics & Control Systems')},
  ${escapeSql(prog.summary || prog.description || prog.title)},
  ${escapeSql(prog.objectives?.[0] || prog.title)},
  ${escapeSql(prog.methodology || prog.approach)},
  ${escapeSql(prog.impact || prog.contribution)},
  ${escapeSql(prog.status || 'Active')},
  ${escapeSql(prog.collaborators || [])},
  ${idx},
  'draft',
  ${escapeSql(prog.verificationStatus || 'USER_PROVIDED')},
  ${escapeSql(prog.lastVerified ? new Date(prog.lastVerified).toISOString() : new Date().toISOString())}
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary;
  `);
});

// 6. Publications
publicationsData.forEach((pub, idx) => {
  sqlStatements.push(`
INSERT INTO public.publications (
  slug, title, authors, venue, publication_type, year, date, doi,
  abstract, keywords, pdf_url, doi_url, scholar_url, researchgate_url,
  display_order, publication_status, verification_status, last_verified
) VALUES (
  ${escapeSql(pub.slug || `pub-${idx + 1}`)},
  ${escapeSql(pub.title)},
  ${escapeSql(pub.authors || ['Tanishk Singhal'])},
  ${escapeSql(pub.venue)},
  ${escapeSql(pub.type || 'Peer-Reviewed Conference')},
  ${escapeSql(pub.year || 2024)},
  ${escapeSql(pub.date)},
  ${escapeSql(pub.doi)},
  ${escapeSql(pub.abstract || pub.description || pub.title)},
  ${escapeSql(pub.keywords || pub.tags || [])},
  ${escapeSql(pub.pdfUrl)},
  ${escapeSql(pub.doi ? `https://doi.org/${pub.doi}` : null)},
  ${escapeSql(pub.scholarUrl)},
  ${escapeSql(pub.researchGateUrl)},
  ${idx},
  'draft',
  ${escapeSql(pub.verificationStatus || 'USER_PROVIDED')},
  ${escapeSql(pub.lastVerified ? new Date(pub.lastVerified).toISOString() : new Date().toISOString())}
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  abstract = EXCLUDED.abstract;
  `);
});

// 7. Patents
patentsData.forEach((pat, idx) => {
  sqlStatements.push(`
INSERT INTO public.patents (
  slug, title, inventors, application_number, patent_number, jurisdiction,
  filing_date, publication_date, status, assignee, description, registry_url,
  display_order, publication_status, verification_status, last_verified
) VALUES (
  ${escapeSql(pat.slug || `patent-${idx + 1}`)},
  ${escapeSql(pat.title)},
  ${escapeSql(pat.inventors || ['Tanishk Singhal'])},
  ${escapeSql(pat.applicationNumber || 'IN-PENDING')},
  ${escapeSql(pat.patentNumber)},
  ${escapeSql(pat.jurisdiction || 'India (IN)')},
  ${escapeSql(pat.filingDate || '2024')},
  ${escapeSql(pat.publicationDate)},
  ${escapeSql(pat.status || 'Published / Pending Examination')},
  ${escapeSql(pat.assignee)},
  ${escapeSql(pat.abstract || pat.description || pat.title)},
  ${escapeSql(pat.registryUrl || pat.sourceUrl)},
  ${idx},
  'draft',
  ${escapeSql(pat.verificationStatus || 'USER_PROVIDED')},
  ${escapeSql(pat.lastVerified ? new Date(pat.lastVerified).toISOString() : new Date().toISOString())}
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description;
  `);
});

// 8. Achievements
achievementsData.forEach((ach, idx) => {
  sqlStatements.push(`
INSERT INTO public.achievements (
  title, issuer, date, category, description, evidence_url,
  display_order, publication_status, verification_status, last_verified
) VALUES (
  ${escapeSql(ach.title)},
  ${escapeSql(ach.issuer || ach.organization || 'Awarding Body')},
  ${escapeSql(ach.date || ach.year || '2024')},
  ${escapeSql(ach.category || 'Honor')},
  ${escapeSql(ach.description || ach.title)},
  ${escapeSql(ach.evidenceUrl || ach.sourceUrl)},
  ${idx},
  'draft',
  ${escapeSql(ach.verificationStatus || 'USER_PROVIDED')},
  ${escapeSql(ach.lastVerified ? new Date(ach.lastVerified).toISOString() : new Date().toISOString())}
) ON CONFLICT DO NOTHING;
  `);
});

// 9. Certifications
certificationsData.forEach((cert, idx) => {
  sqlStatements.push(`
INSERT INTO public.certifications (
  name, issuing_organization, credential_id, issue_date, expiry_date,
  verification_url, description, display_order, publication_status,
  verification_status, last_verified
) VALUES (
  ${escapeSql(cert.name || cert.title)},
  ${escapeSql(cert.issuer || cert.organization || 'Issuing Authority')},
  ${escapeSql(cert.credentialId)},
  ${escapeSql(cert.issueDate || cert.date || '2024')},
  ${escapeSql(cert.expiryDate)},
  ${escapeSql(cert.verificationUrl || cert.url)},
  ${escapeSql(cert.description)},
  ${idx},
  'draft',
  ${escapeSql(cert.verificationStatus || 'USER_PROVIDED')},
  ${escapeSql(cert.lastVerified ? new Date(cert.lastVerified).toISOString() : new Date().toISOString())}
) ON CONFLICT DO NOTHING;
  `);
});

// 10. Skills
skillsData.forEach((sk, idx) => {
  sqlStatements.push(`
INSERT INTO public.skills (
  category, name, description, years_experience, display_order,
  publication_status, verification_status, last_verified
) VALUES (
  ${escapeSql(sk.category || 'Programming & Software')},
  ${escapeSql(sk.name)},
  ${escapeSql(sk.description)},
  ${sk.yearsExperience || null},
  ${idx},
  'draft',
  ${escapeSql(sk.verificationStatus || 'USER_PROVIDED')},
  ${escapeSql(sk.lastVerified ? new Date(sk.lastVerified).toISOString() : new Date().toISOString())}
) ON CONFLICT DO NOTHING;
  `);
});

// 11. Organizations
organizationsData.forEach((org, idx) => {
  sqlStatements.push(`
INSERT INTO public.organizations (
  name, role, type, start_date, end_date, is_current, location, description,
  official_url, display_order, publication_status, verification_status, last_verified
) VALUES (
  ${escapeSql(org.name)},
  ${escapeSql(org.role || 'Member')},
  ${escapeSql(org.type || 'Academic')},
  ${escapeSql(org.startDate || '2024')},
  ${escapeSql(org.endDate)},
  ${escapeSql(org.isCurrent || false)},
  ${escapeSql(org.location)},
  ${escapeSql(org.description)},
  ${escapeSql(org.url || org.officialUrl)},
  ${idx},
  'draft',
  ${escapeSql(org.verificationStatus || 'USER_PROVIDED')},
  ${escapeSql(org.lastVerified ? new Date(org.lastVerified).toISOString() : new Date().toISOString())}
) ON CONFLICT DO NOTHING;
  `);
});

// 12. Blog Posts
blogPostsData.forEach((bp, idx) => {
  sqlStatements.push(`
INSERT INTO public.blog_posts (
  slug, title, excerpt, body, cover_image, tags, category, author,
  reading_time_minutes, seo_title, seo_description, display_order,
  publication_status, verification_status, last_verified
) VALUES (
  ${escapeSql(bp.slug)},
  ${escapeSql(bp.title)},
  ${escapeSql(bp.excerpt || bp.summary || bp.title)},
  ${escapeSql(bp.content || bp.body || bp.excerpt || bp.title)},
  ${escapeSql(bp.coverImage)},
  ${escapeSql(bp.tags || [])},
  ${escapeSql(bp.category || 'Engineering')},
  ${escapeSql(bp.author || 'Tanishk Singhal')},
  ${bp.readingTime || 5},
  ${escapeSql(bp.title)},
  ${escapeSql(bp.excerpt)},
  ${idx},
  'draft',
  ${escapeSql(bp.verificationStatus || 'USER_PROVIDED')},
  ${escapeSql(bp.lastVerified ? new Date(bp.lastVerified).toISOString() : new Date().toISOString())}
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  body = EXCLUDED.body;
  `);
});

sqlStatements.push('COMMIT;');

const outPath = path.join(process.cwd(), 'supabase/migrations/0005_seed_static_content_as_draft.sql');
fs.writeFileSync(outPath, sqlStatements.join('\n\n'), 'utf8');
console.log(`Generated migration SQL at ${outPath}`);
