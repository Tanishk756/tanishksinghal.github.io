import { execSync } from 'child_process';
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

const sql = `
SELECT 
  json_build_object(
    'profiles', (SELECT coalesce(json_agg(r), '[]'::json) FROM (SELECT * FROM public.profiles) r),
    'education', (SELECT coalesce(json_agg(r), '[]'::json) FROM (SELECT * FROM public.education ORDER BY display_order) r),
    'experience', (SELECT coalesce(json_agg(r), '[]'::json) FROM (SELECT * FROM public.experience ORDER BY display_order) r),
    'projects', (SELECT coalesce(json_agg(r), '[]'::json) FROM (SELECT * FROM public.projects ORDER BY display_order) r),
    'research_programs', (SELECT coalesce(json_agg(r), '[]'::json) FROM (SELECT * FROM public.research_programs ORDER BY display_order) r),
    'publications', (SELECT coalesce(json_agg(r), '[]'::json) FROM (SELECT * FROM public.publications ORDER BY display_order) r),
    'patents', (SELECT coalesce(json_agg(r), '[]'::json) FROM (SELECT * FROM public.patents ORDER BY display_order) r),
    'achievements', (SELECT coalesce(json_agg(r), '[]'::json) FROM (SELECT * FROM public.achievements ORDER BY display_order) r),
    'certifications', (SELECT coalesce(json_agg(r), '[]'::json) FROM (SELECT * FROM public.certifications ORDER BY display_order) r),
    'skills', (SELECT coalesce(json_agg(r), '[]'::json) FROM (SELECT * FROM public.skills ORDER BY display_order) r),
    'organizations', (SELECT coalesce(json_agg(r), '[]'::json) FROM (SELECT * FROM public.organizations ORDER BY display_order) r),
    'blog_posts', (SELECT coalesce(json_agg(r), '[]'::json) FROM (SELECT * FROM public.blog_posts ORDER BY display_order) r),
    'quarantined_records', (SELECT coalesce(json_agg(r), '[]'::json) FROM (SELECT * FROM public.quarantined_records ORDER BY quarantined_at) r),
    'contact_submissions_count', (SELECT count(*) FROM public.contact_submissions)
  ) as data;
`;

const output = execSync(
  `npx supabase db query --linked "${sql.replace(/\n/g, ' ').replace(/"/g, '\\"')}"`,
  { encoding: 'utf8' }
);

const fullJson = output.substring(output.indexOf('{'), output.lastIndexOf('}') + 1);
const parsed = JSON.parse(fullJson);
const dbData = parsed.rows[0].data;

console.log('================================================================');
console.log('      CANONICAL VERIFIED PORTFOLIO AUDIT (ZERO PROBABLE/UNVERIFIED) ');
console.log('================================================================\n');

const validStatuses = ['USER_PROVIDED', 'GITHUB_VERIFIED', 'PUBLIC_WEB_VERIFIED'];

const domains = [
  { name: 'profiles', source: [profileData], table: 'profiles' },
  { name: 'education', source: educationData, table: 'education' },
  { name: 'experience', source: experienceData, table: 'experience' },
  { name: 'projects', source: projectsData, table: 'projects' },
  { name: 'research_programs', source: researchData, table: 'research_programs' },
  { name: 'publications', source: publicationsData, table: 'publications' },
  { name: 'patents', source: patentsData, table: 'patents' },
  { name: 'achievements', source: achievementsData, table: 'achievements' },
  { name: 'certifications', source: certificationsData, table: 'certifications' },
  { name: 'skills', source: skillsData, table: 'skills' },
  { name: 'organizations', source: organizationsData, table: 'organizations' },
  { name: 'blog_posts', source: blogPostsData, table: 'blog_posts' },
];

const auditTable = domains.map(d => {
  const verifiedSource = d.source.filter((s: any) => validStatuses.includes(s.verificationStatus || 'USER_PROVIDED'));
  const unverifiedSource = d.source.filter((s: any) => !validStatuses.includes(s.verificationStatus || 'USER_PROVIDED'));
  const dbRows = dbData[d.table] || [];
  
  const nonDraft = dbRows.filter((r: any) => r.publication_status !== 'draft');
  const nonVerifiedInCanonical = dbRows.filter((r: any) => !validStatuses.includes(r.verification_status));
  
  return {
    Domain: d.name,
    'Verified Source Count': verifiedSource.length,
    'Unverified/Probable Source': unverifiedSource.length,
    'Canonical DB Count': dbRows.length,
    'All Verified?': nonVerifiedInCanonical.length === 0 ? 'YES ✅ (100%)' : `FAIL ❌ (${nonVerifiedInCanonical.length} invalid)`,
    'All Draft?': nonDraft.length === 0 ? 'YES ✅ (100%)' : `FAIL ❌ (${nonDraft.length} non-draft)`,
    'Reconciliation': verifiedSource.length === dbRows.length && nonVerifiedInCanonical.length === 0 ? 'PERFECT ✅' : 'MISMATCH ❌'
  };
});

console.table(auditTable);

console.log('\n--- CANONICAL EXPERIENCE TABLE (VERIFIED ONLY) ---');
console.table(dbData['experience'].map((e: any) => ({
  id: e.id,
  organization: e.organization,
  role_title: e.role_title,
  category: e.category,
  start_date: e.start_date,
  end_date: e.end_date,
  is_current: e.is_current,
  verification_status: e.verification_status,
  publication_status: e.publication_status
})));

console.log('\n--- QUARANTINED RECORDS STORE (ISOLATED FROM CANONICAL DB) ---');
console.table(dbData['quarantined_records'].map((q: any) => ({
  id: q.id,
  original_domain: q.original_domain,
  title_or_name: q.title_or_name,
  verification_status: q.verification_status,
  quarantine_reason: q.quarantine_reason
})));

console.log('\n--- CONTACT SUBMISSIONS INTEGRITY ---');
console.log(`Total Contact Submissions in Database: ${dbData['contact_submissions_count']} (Expected: 0 synthetic records)`);
