import { execSync } from 'child_process';
import { profileData } from '../src/content/profile';
import { educationData } from '../src/content/education';
import { experienceData } from '../src/content/experience';
import { projectsData } from '../src/content/projects';
import { researchData } from '../src/content/research';
import { publicationsData } from '../src/content/publications';
import { skillsData } from '../src/content/skills';
import { organizationsData } from '../src/content/organizations';
import { blogPostsData } from '../src/content/blog';

const sql = `
SELECT 
  json_build_object(
    'profiles', (SELECT coalesce(json_agg(r), '[]'::json) FROM (SELECT * FROM public.profiles) r),
    'education', (SELECT coalesce(json_agg(r), '[]'::json) FROM (SELECT * FROM public.education ORDER BY display_order) r),
    'experience', (SELECT coalesce(json_agg(r), '[]'::json) FROM (SELECT * FROM public.experience ORDER BY display_order) r),
    'projects', (SELECT coalesce(json_agg(r), '[]'::json) FROM (SELECT * FROM public.projects ORDER BY display_order) r),
    'research_programs', (SELECT coalesce(json_agg(r), '[]'::json) FROM (SELECT * FROM public.research_programs ORDER BY display_order) r),
    'publications', (SELECT coalesce(json_agg(r), '[]'::json) FROM (SELECT * FROM public.publications ORDER BY display_order) r),
    'skills', (SELECT coalesce(json_agg(r), '[]'::json) FROM (SELECT * FROM public.skills ORDER BY display_order) r),
    'organizations', (SELECT coalesce(json_agg(r), '[]'::json) FROM (SELECT * FROM public.organizations ORDER BY display_order) r),
    'blog_posts', (SELECT coalesce(json_agg(r), '[]'::json) FROM (SELECT * FROM public.blog_posts ORDER BY display_order) r)
  ) as data;
`;

const output = execSync(
  `npx supabase db query --linked "${sql.replace(/\n/g, ' ').replace(/"/g, '\\"')}"`,
  { encoding: 'utf8' }
);

const fullJson = output.substring(output.indexOf('{'), output.lastIndexOf('}') + 1);
const parsed = JSON.parse(fullJson);
const dbData = parsed.rows[0].data;

console.log('=== FIELD LEVEL AUDIT DETAILS ===\n');

// 1. Profile Audit
console.log('--- 1. PROFILES AUDIT ---');
const dbProfile = dbData['profiles'][0];
console.log({
  sourceFullName: profileData.fullName,
  dbFullName: dbProfile.full_name,
  sourceEmail: profileData.email,
  dbEmail: dbProfile.email,
  sourceLocation: profileData.location,
  dbLocation: dbProfile.location,
  sourceHeadline: profileData.headline,
  dbHeadline: dbProfile.headline,
  sourceVerification: profileData.verificationStatus,
  dbVerification: dbProfile.verification_status,
  dbStatus: dbProfile.publication_status
});

// 2. Education Audit
console.log('\n--- 2. EDUCATION AUDIT ---');
educationData.forEach((edu, idx) => {
  const d = dbData['education'][idx];
  console.log(`[Education ${idx + 1}] ${edu.institution}:`, {
    institution: d.institution === edu.institution ? 'MATCH' : `MISMATCH (${d.institution} vs ${edu.institution})`,
    degree: d.degree === edu.degree ? 'MATCH' : `MISMATCH (${d.degree} vs ${edu.degree})`,
    dates: `${d.start_date} - ${d.end_date}` === `${edu.startDate} - ${edu.endDate}` ? 'MATCH' : `MISMATCH`,
    provenance: d.verification_status === (edu.verificationStatus || 'USER_PROVIDED') ? 'MATCH' : 'MISMATCH',
    status: d.publication_status
  });
});

// 3. Experience Audit
console.log('\n--- 3. EXPERIENCE AUDIT ---');
experienceData.forEach((exp, idx) => {
  const d = dbData['experience'][idx];
  console.log(`[Experience ${idx + 1}] ${exp.organization} (${exp.role}):`, {
    organization: d.organization === exp.organization ? 'MATCH' : `MISMATCH`,
    role_title: d.role_title === exp.role ? 'MATCH' : `MISMATCH (${d.role_title} vs ${exp.role})`,
    dates: `${d.start_date} - ${d.end_date}` === `${exp.startDate} - ${exp.endDate}` ? 'MATCH' : `MISMATCH`,
    is_current: d.is_current === (exp.isCurrent || false) ? 'MATCH' : `MISMATCH`,
    provenance: d.verification_status === (exp.verificationStatus || 'USER_PROVIDED') ? 'MATCH' : `MISMATCH (${d.verification_status} vs ${exp.verificationStatus})`,
    status: d.publication_status
  });
});

// 4. Projects Audit
console.log('\n--- 4. PROJECTS AUDIT ---');
projectsData.forEach((proj, idx) => {
  const d = dbData['projects'][idx];
  console.log(`[Project ${idx + 1}] ${proj.title} (slug: ${proj.slug}):`, {
    slug: d.slug === proj.slug ? 'MATCH' : 'MISMATCH',
    title: d.title === proj.title ? 'MATCH' : 'MISMATCH',
    provenance: d.verification_status === (proj.verificationStatus || 'GITHUB_VERIFIED') ? 'MATCH' : 'MISMATCH',
    status: d.publication_status
  });
});

// 5. Research Programs Audit
console.log('\n--- 5. RESEARCH PROGRAMS AUDIT ---');
researchData.forEach((prog, idx) => {
  const d = dbData['research_programs'][idx];
  console.log(`[Research ${idx + 1}] ${prog.title}:`, {
    title: d.title === prog.title ? 'MATCH' : 'MISMATCH',
    area: (d.research_area || d.area) === (prog.area || 'Robotics & Control Systems') ? 'MATCH' : 'MISMATCH',
    status: d.publication_status
  });
});

// 6. Publications Audit
console.log('\n--- 6. PUBLICATIONS AUDIT ---');
publicationsData.forEach((pub, idx) => {
  const d = dbData['publications'][idx];
  console.log(`[Publication ${idx + 1}] ${pub.title}:`, {
    title: d.title === pub.title ? 'MATCH' : 'MISMATCH',
    venue: d.venue === pub.venue ? 'MATCH' : 'MISMATCH',
    status: d.publication_status
  });
});
