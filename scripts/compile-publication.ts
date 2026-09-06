import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

interface PublishedDataset {
  profiles: any[];
  education: any[];
  experience: any[];
  projects: any[];
  research_programs: any[];
  publications: any[];
  patents: any[];
  achievements: any[];
  certifications: any[];
  skills: any[];
  organizations: any[];
  blog_posts: any[];
}

export function filterEligibleRecords<T extends { publication_status?: string; verification_status?: string }>(records: T[]): T[] {
  const allowedProvenance = ['USER_PROVIDED', 'GITHUB_VERIFIED', 'PUBLIC_WEB_VERIFIED'];
  return (records || []).filter(
    r => r.publication_status === 'published' && allowedProvenance.includes(r.verification_status || '')
  );
}

export function fetchPublishedData(): PublishedDataset {
  const allowed = "('USER_PROVIDED', 'GITHUB_VERIFIED', 'PUBLIC_WEB_VERIFIED')";
  const sql = `
    SELECT json_build_object(
      'profiles', (SELECT coalesce(json_agg(r), '[]'::json) FROM (SELECT * FROM public.profiles WHERE publication_status = 'published' AND verification_status IN ${allowed} ORDER BY id) r),
      'education', (SELECT coalesce(json_agg(r), '[]'::json) FROM (SELECT * FROM public.education WHERE publication_status = 'published' AND verification_status IN ${allowed} ORDER BY display_order, id) r),
      'experience', (SELECT coalesce(json_agg(r), '[]'::json) FROM (SELECT * FROM public.experience WHERE publication_status = 'published' AND verification_status IN ${allowed} ORDER BY display_order, id) r),
      'projects', (SELECT coalesce(json_agg(r), '[]'::json) FROM (SELECT * FROM public.projects WHERE publication_status = 'published' AND verification_status IN ${allowed} ORDER BY display_order, slug) r),
      'research_programs', (SELECT coalesce(json_agg(r), '[]'::json) FROM (SELECT * FROM public.research_programs WHERE publication_status = 'published' AND verification_status IN ${allowed} ORDER BY display_order, slug) r),
      'publications', (SELECT coalesce(json_agg(r), '[]'::json) FROM (SELECT * FROM public.publications WHERE publication_status = 'published' AND verification_status IN ${allowed} ORDER BY display_order, slug) r),
      'patents', (SELECT coalesce(json_agg(r), '[]'::json) FROM (SELECT * FROM public.patents WHERE publication_status = 'published' AND verification_status IN ${allowed} ORDER BY display_order, slug) r),
      'achievements', (SELECT coalesce(json_agg(r), '[]'::json) FROM (SELECT * FROM public.achievements WHERE publication_status = 'published' AND verification_status IN ${allowed} ORDER BY display_order, id) r),
      'certifications', (SELECT coalesce(json_agg(r), '[]'::json) FROM (SELECT * FROM public.certifications WHERE publication_status = 'published' AND verification_status IN ${allowed} ORDER BY display_order, id) r),
      'skills', (SELECT coalesce(json_agg(r), '[]'::json) FROM (SELECT * FROM public.skills WHERE publication_status = 'published' AND verification_status IN ${allowed} ORDER BY display_order, name) r),
      'organizations', (SELECT coalesce(json_agg(r), '[]'::json) FROM (SELECT * FROM public.organizations WHERE publication_status = 'published' AND verification_status IN ${allowed} ORDER BY display_order, id) r),
      'blog_posts', (SELECT coalesce(json_agg(r), '[]'::json) FROM (SELECT * FROM public.blog_posts WHERE publication_status = 'published' AND verification_status IN ${allowed} ORDER BY display_order, slug) r)
    ) as data;
  `;

  const output = execSync(
    `npx supabase db query --linked "${sql.replace(/\n/g, ' ').replace(/"/g, '\\"')}"`,
    { encoding: 'utf8' }
  );

  const fullJson = output.substring(output.indexOf('{'), output.lastIndexOf('}') + 1);
  const parsed = JSON.parse(fullJson);
  return parsed.rows[0].data;
}

export function normalizeStringArray(val: any): string[] {
  if (!val) return [];
  if (Array.isArray(val)) {
    return val
      .flatMap(v => normalizeStringArray(v))
      .filter(v => typeof v === 'string' && v.trim().length > 0 && v !== '[]' && v !== 'null');
  }
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (trimmed === '[]' || trimmed === 'null' || trimmed.length === 0) return [];
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return normalizeStringArray(parsed);
      } catch {}
    }
    return [trimmed];
  }
  return [];
}

export function compileCanonicalFiles(dataset: PublishedDataset, outputDir: string) {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const cleanProfiles = filterEligibleRecords(dataset.profiles);
  const cleanEducation = filterEligibleRecords(dataset.education);
  const cleanExperience = filterEligibleRecords(dataset.experience);
  const cleanProjects = filterEligibleRecords(dataset.projects);
  const cleanResearch = filterEligibleRecords(dataset.research_programs);
  const cleanPublications = filterEligibleRecords(dataset.publications);
  const cleanPatents = filterEligibleRecords(dataset.patents);
  const cleanAchievements = filterEligibleRecords(dataset.achievements);
  const cleanCertifications = filterEligibleRecords(dataset.certifications);
  const cleanSkills = filterEligibleRecords(dataset.skills);
  const cleanOrganizations = filterEligibleRecords(dataset.organizations);
  const cleanBlogPosts = filterEligibleRecords(dataset.blog_posts);

  const generatedFiles: string[] = [];

  // 1. Profile
  const profile = cleanProfiles[0] || {};
  const profileTs = `// @generated by Supabase Master CMS Compiler (Deterministic)
// Canonical Single Source of Truth: public.profiles

import { Profile } from '../types/content';

export const profileData: Profile = ${JSON.stringify({
  fullName: profile.full_name || 'Tanishk Singhal',
  displayName: profile.display_name || 'Tanishk Singhal',
  headline: profile.headline || 'Robotics Researcher & Systems Engineer',
  subheadline: 'Building autonomous robotic systems, closed-loop ROS 2 control nodes, embedded firmware, and intelligent machine learning pipelines.',
  shortBio: profile.short_bio || '',
  longBio: typeof profile.long_bio === 'string' ? profile.long_bio.split('\n\n') : (profile.long_bio || []),
  location: profile.location || 'India',
  email: profile.email || 'Tanishksinghal6285@gmail.com',
  avatarUrl: profile.profile_image_url || profile.avatar_url || 'https://avatars.githubusercontent.com/u/132895444?v=4',
  resumeUrl: profile.resume_url || '/resume',
  socials: {
    github: profile.github_url || 'https://github.com/tanishk756',
    linkedin: profile.linkedin_url || 'https://www.linkedin.com/in/tanishk-singhal-/',
    googleScholar: profile.google_scholar_url || 'https://scholar.google.com/citations?user=4o_Dc0wAAAAJ&hl=en',
    researchGate: profile.researchgate_url || 'https://www.researchgate.net/profile/Tanishk-Singhal',
  },
  keyStats: [
    { label: "Engineering Focus", value: "Autonomy", sublabel: "Kinematics & Control" },
    { label: "Core Environment", value: "ROS 2", sublabel: "Nodes & Interfaces" },
    { label: "Computational Domain", value: "Perception", sublabel: "Spatial Navigation" },
    { label: "Research Focus", value: "Systems", sublabel: "Physical & Cyber-Physical" }
  ],
  source: 'Supabase Canonical single-source-of-truth',
  verificationStatus: profile.verification_status || 'USER_PROVIDED',
  lastVerified: profile.last_verified || new Date().toISOString()
}, null, 2)};
`;
  fs.writeFileSync(path.join(outputDir, 'profile.ts'), profileTs, 'utf8');
  generatedFiles.push('profile.ts');

  // 2. Education
  const educationTs = `// @generated by Supabase Master CMS Compiler (Deterministic)
// Canonical Single Source of Truth: public.education

import { EducationItem } from '../types/content';

export const educationData: EducationItem[] = ${JSON.stringify(
  cleanEducation.map(e => ({
    id: e.id,
    institution: e.institution,
    program: e.degree || e.field,
    degree: e.degree || e.field,
    fieldOfStudy: e.field_of_study || e.field || e.degree,
    startDate: e.start_date,
    endDate: e.end_date,
    grade: e.grade || undefined,
    location: e.location || undefined,
    description: e.description || undefined,
    publicEligibility: true,
    source: 'Supabase Canonical single-source-of-truth',
    verificationStatus: e.verification_status || 'USER_PROVIDED',
    lastVerified: e.last_verified,
  })),
  null,
  2
)};

export function getProductionEducation(): EducationItem[] {
  return educationData;
}
`;
  fs.writeFileSync(path.join(outputDir, 'education.ts'), educationTs, 'utf8');
  generatedFiles.push('education.ts');

  // 3. Experience
  const experienceTs = `// @generated by Supabase Master CMS Compiler (Deterministic)
// Canonical Single Source of Truth: public.experience

import { ExperienceItem } from '../types/content';

export const experienceData: ExperienceItem[] = ${JSON.stringify(
  cleanExperience.map(exp => ({
    id: exp.id,
    slug: (exp.organization || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    organization: exp.organization,
    role: exp.role_title || exp.role,
    type: 'EMPLOYMENT',
    startDate: exp.start_date,
    endDate: exp.end_date || 'Present',
    current: exp.is_current ?? true,
    isCurrent: exp.is_current ?? true,
    location: exp.location || 'India',
    workMode: exp.work_mode === 'on_site' ? 'On-site' : (exp.work_mode === 'hybrid' ? 'Hybrid' : 'Remote'),
    domain: 'Robotics & AI',
    description: normalizeStringArray(exp.description),
    technologies: normalizeStringArray(exp.technologies),
    source: 'Supabase Canonical single-source-of-truth',
    verificationStatus: exp.verification_status || 'USER_PROVIDED',
    publicEligibility: true,
    lastVerified: exp.last_verified,
  })),
  null,
  2
)};

export function getProductionExperience(): ExperienceItem[] {
  return experienceData;
}
`;
  fs.writeFileSync(path.join(outputDir, 'experience.ts'), experienceTs, 'utf8');
  generatedFiles.push('experience.ts');

  // 4. Projects
  const mapProjectCategory = (cat: string) => {
    const l = (cat || '').toLowerCase();
    if (l.includes('robot')) return 'robotics';
    if (l.includes('autonom') || l.includes('path')) return 'autonomy';
    if (l.includes('uav') || l.includes('aero')) return 'uav-aerospace';
    if (l.includes('embed') || l.includes('firmware')) return 'embedded';
    if (l.includes('ai') || l.includes('machine') || l.includes('ml')) return 'ai-ml';
    return 'robotics';
  };

  const projectsTs = `// @generated by Supabase Master CMS Compiler (Deterministic)
// Canonical Single Source of Truth: public.projects

import { ProjectCaseStudy } from '../types/content';

export const projectsData: ProjectCaseStudy[] = ${JSON.stringify(
  cleanProjects.map(p => ({
    id: p.slug,
    slug: p.slug,
    title: p.title,
    tagline: p.subtitle || p.overview || p.title,
    category: mapProjectCategory(p.category),
    subcategories: normalizeStringArray(p.software_stack),
    status: 'completed',
    featured: p.featured || false,
    startDate: p.timeframe || '2024',
    role: 'Developer',
    organization: 'Open Source Robotics',
    coverBadge: p.category || 'Robotics',
    problem: p.problem || 'Autonomous tracking and control coordination in robotics.',
    objective: p.overview || p.title,
    approach: p.solution || p.overview || p.title,
    architectureDescription: p.architecture || '',
    subsystems: p.subsystems || [],
    hardwareStack: normalizeStringArray(p.hardware_specs),
    softwareStack: normalizeStringArray(p.software_stack),
    algorithms: normalizeStringArray(p.algorithms),
    challenges: (p.challenges || []).map((c: any) => typeof c === 'string' ? { challenge: c, rootCause: '', solution: '', outcome: '' } : c),
    results: { summary: Array.isArray(p.results) ? p.results : [] },
    lessonsLearned: normalizeStringArray(p.limitations),
    futureWork: normalizeStringArray(p.future_work),
    githubUrl: p.github_url || undefined,
    source: 'Supabase Canonical single-source-of-truth',
    verificationStatus: p.verification_status || 'GITHUB_VERIFIED',
    lastVerified: p.last_verified,
  })),
  null,
  2
)};

export function getProductionProjects(): ProjectCaseStudy[] {
  return projectsData;
}

export function getProjectBySlug(slug: string): ProjectCaseStudy | undefined {
  return projectsData.find(p => p.slug === slug || p.id === slug);
}
`;
  fs.writeFileSync(path.join(outputDir, 'projects.ts'), projectsTs, 'utf8');
  generatedFiles.push('projects.ts');

  // 5. Research Programs
  const researchTs = `// @generated by Supabase Master CMS Compiler (Deterministic)
// Canonical Single Source of Truth: public.research_programs

import { ResearchItem } from '../types/content';

export const researchData: ResearchItem[] = ${JSON.stringify(
  cleanResearch.map(r => ({
    id: r.slug,
    slug: r.slug,
    title: r.title,
    domain: r.research_area || r.area || 'Robotics & Control',
    organization: 'Autonomous Systems Research',
    collaborators: normalizeStringArray(r.collaborators),
    dateRange: '2023 — Present',
    summary: r.summary || r.title,
    methodology: r.methodology || r.approach || 'Empirical formulation and simulation evaluation.',
    contributions: normalizeStringArray(r.key_contribution || r.contribution || r.contributions || [r.title]),
    source: 'Supabase Canonical single-source-of-truth',
    verificationStatus: r.verification_status || 'USER_PROVIDED',
    lastVerified: r.last_verified,
  })),
  null,
  2
)};

export function getProductionResearch(): ResearchItem[] {
  return researchData;
}
`;
  fs.writeFileSync(path.join(outputDir, 'research.ts'), researchTs, 'utf8');
  generatedFiles.push('research.ts');

  // 6. Publications
  const publicationsTs = `// @generated by Supabase Master CMS Compiler (Deterministic)
// Canonical Single Source of Truth: public.publications

import { PublicationItem } from '../types/content';

export const publicationsData: PublicationItem[] = ${JSON.stringify(
  cleanPublications.map(pub => ({
    id: pub.slug,
    slug: pub.slug,
    title: pub.title,
    authors: normalizeStringArray(pub.authors).length > 0 ? normalizeStringArray(pub.authors) : ['Tanishk Singhal'],
    venue: pub.venue,
    year: pub.year || 2024,
    abstract: pub.abstract,
    keywords: normalizeStringArray(pub.keywords),
    doi: pub.doi || undefined,
    pdfUrl: pub.pdf_asset_url || pub.pdf_url || undefined,
    doiUrl: pub.doi ? ('https://doi.org/' + pub.doi) : undefined,
    status: 'published',
    source: 'Supabase Canonical single-source-of-truth',
    verificationStatus: pub.verification_status || 'USER_PROVIDED',
    lastVerified: pub.last_verified,
  })),
  null,
  2
)};

export function getProductionPublications(): PublicationItem[] {
  return publicationsData;
}

export function getPublicationBySlug(slug: string): PublicationItem | undefined {
  return publicationsData.find(p => p.slug === slug || p.id === slug);
}
`;
  fs.writeFileSync(path.join(outputDir, 'publications.ts'), publicationsTs, 'utf8');
  generatedFiles.push('publications.ts');

  // 7. Patents (Empty Domain handling)
  const patentsTs = `// @generated by Supabase Master CMS Compiler (Deterministic)
// Canonical Single Source of Truth: public.patents

import { PatentItem } from '../types/content';

export const patentsData: PatentItem[] = ${JSON.stringify(cleanPatents || [], null, 2)};

export function getProductionPatents(): PatentItem[] {
  return patentsData;
}

export function getPatentBySlug(slug: string): PatentItem | undefined {
  return patentsData.find(p => p.slug === slug || p.id === slug);
}
`;
  fs.writeFileSync(path.join(outputDir, 'patents.ts'), patentsTs, 'utf8');
  generatedFiles.push('patents.ts');

  // 8. Achievements (Empty Domain handling)
  const achievementsTs = `// @generated by Supabase Master CMS Compiler (Deterministic)
// Canonical Single Source of Truth: public.achievements

import { AchievementItem } from '../types/content';

export const achievementsData: AchievementItem[] = ${JSON.stringify(cleanAchievements || [], null, 2)};

export function getProductionAchievements(): AchievementItem[] {
  return achievementsData;
}
`;
  fs.writeFileSync(path.join(outputDir, 'achievements.ts'), achievementsTs, 'utf8');
  generatedFiles.push('achievements.ts');

  // 9. Certifications (Empty Domain handling)
  const certificationsTs = `// @generated by Supabase Master CMS Compiler (Deterministic)
// Canonical Single Source of Truth: public.certifications

import { CertificationItem } from '../types/content';

export const certificationsData: CertificationItem[] = ${JSON.stringify(cleanCertifications || [], null, 2)};

export function getProductionCertifications(): CertificationItem[] {
  return certificationsData;
}
`;
  fs.writeFileSync(path.join(outputDir, 'certifications.ts'), certificationsTs, 'utf8');
  generatedFiles.push('certifications.ts');

  // 10. Skills
  const mapSkillCategory = (cat: string) => {
    const l = (cat || '').toLowerCase();
    if (l.includes('robot') || l.includes('control')) return 'Robotics & Control';
    if (l.includes('autonom')) return 'Autonomous Systems';
    if (l.includes('ai') || l.includes('machine') || l.includes('ml')) return 'AI & ML';
    if (l.includes('embed') || l.includes('firmware')) return 'Firmware & Embedded';
    if (l.includes('circuit') || l.includes('hardware') || l.includes('electronic')) return 'Hardware & Circuits';
    if (l.includes('space') || l.includes('uav')) return 'Space Systems & UAV';
    return 'Software & Tools';
  };

  const skillsTs = `// @generated by Supabase Master CMS Compiler (Deterministic)
// Canonical Single Source of Truth: public.skills

import { SkillItem } from '../types/content';

export const skillsData: SkillItem[] = ${JSON.stringify(
  cleanSkills.map(sk => ({
    name: sk.name,
    category: mapSkillCategory(sk.category),
    level: 'proficient' as const,
    highlight: sk.highlight || false,
  })),
  null,
  2
)};

export function getProductionSkills(): SkillItem[] {
  return skillsData;
}
`;
  fs.writeFileSync(path.join(outputDir, 'skills.ts'), skillsTs, 'utf8');
  generatedFiles.push('skills.ts');

  // 11. Organizations
  const organizationsTs = `// @generated by Supabase Master CMS Compiler (Deterministic)
// Canonical Single Source of Truth: public.organizations

import { OrganizationItem } from '../types/content';

export const organizationsData: OrganizationItem[] = ${JSON.stringify(
  cleanOrganizations.map(org => ({
    id: org.id,
    name: org.name,
    type: 'company',
    role: org.role,
    relationshipType: 'EMPLOYMENT',
    startDate: org.start_date || undefined,
    endDate: org.end_date || undefined,
    dateRange: org.start_date + ' — ' + (org.end_date || 'Present'),
    description: org.description || undefined,
    source: 'Supabase Canonical single-source-of-truth',
    verificationStatus: org.verification_status || 'USER_PROVIDED',
    publicEligibility: true,
    lastVerified: org.last_verified,
  })),
  null,
  2
)};

export function getProductionOrganizations(): OrganizationItem[] {
  return organizationsData;
}
`;
  fs.writeFileSync(path.join(outputDir, 'organizations.ts'), organizationsTs, 'utf8');
  generatedFiles.push('organizations.ts');

  // 12. Blog Posts
  const blogTs = `// @generated by Supabase Master CMS Compiler (Deterministic)
// Canonical Single Source of Truth: public.blog_posts

import { BlogPost } from '../types/content';

export const blogPostsData: BlogPost[] = ${JSON.stringify(
  cleanBlogPosts.map(bp => ({
    id: bp.slug,
    slug: bp.slug,
    title: bp.title,
    excerpt: bp.excerpt,
    author: bp.author || 'Tanishk Singhal',
    publishedDate: bp.published_at || '2024-11-15',
    readingTimeMinutes: bp.reading_time_minutes || 6,
    categories: [bp.category || 'Robotics'],
    tags: normalizeStringArray(bp.tags),
    content: bp.content || bp.body,
    source: 'Supabase Canonical single-source-of-truth',
    verificationStatus: bp.verification_status || 'GITHUB_VERIFIED',
    lastVerified: bp.last_verified,
  })),
  null,
  2
)};

export function getProductionBlogPosts(): BlogPost[] {
  return blogPostsData;
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPostsData.find(b => b.slug === slug || b.id === slug);
}
`;
  fs.writeFileSync(path.join(outputDir, 'blog.ts'), blogTs, 'utf8');
  generatedFiles.push('blog.ts');

  // 13. Barrel Index
  const indexTs = `// @generated by Supabase Master CMS Compiler (Deterministic)
export * from './profile';
export * from './education';
export * from './experience';
export * from './projects';
export * from './research';
export * from './publications';
export * from './patents';
export * from './achievements';
export * from './certifications';
export * from './skills';
export * from './organizations';
export * from './blog';
`;
  fs.writeFileSync(path.join(outputDir, 'index.ts'), indexTs, 'utf8');
  generatedFiles.push('index.ts');

  return generatedFiles;
}

// CLI Execution
console.log('Fetching canonical records from Supabase...');
const data = fetchPublishedData();
const outPath = path.join(process.cwd(), 'src/generated');
const files = compileCanonicalFiles(data, outPath);
console.log(`\nSuccessfully compiled ${files.length} deterministic artifacts to ${outPath}:`);
files.forEach(f => console.log(` - ${f}`));
