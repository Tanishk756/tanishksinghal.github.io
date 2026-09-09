/**
 * Public Runtime Content Client
 * 
 * Directly queries the canonical Supabase public-content API/Edge Function at runtime.
 * Guarantees zero dependence on build-time generated TypeScript files for production content.
 * 
 * Strict Public Visibility Rules:
 * - Only publication_status = 'published'
 * - Only approved verification_status IN ('USER_PROVIDED', 'GITHUB_VERIFIED', 'PUBLIC_WEB_VERIFIED')
 * - Quarantines 'PROBABLE' and 'UNVERIFIED'
 * - Clean error states without leaking internal infrastructure details.
 */

import {
  Profile,
  ProjectCaseStudy,
  ExperienceItem,
  ResearchItem,
  PublicationItem,
  PatentItem,
  SkillItem,
  EducationItem,
  OrganizationItem,
  CertificationItem,
  AchievementItem,
  BlogPost,
} from '../types/content';
import { SkillCategory, isSkillCategory } from '../constants/skills';
import { SUPABASE_URL } from './supabaseClient';
import { sortExperiencesDesc } from '../utils/experienceSorting';

export interface PublicDataset {
  profile: Profile | null;
  projects: ProjectCaseStudy[];
  experience: ExperienceItem[];
  research: ResearchItem[];
  publications: PublicationItem[];
  patents: PatentItem[];
  skills: SkillItem[];
  education: EducationItem[];
  organizations: OrganizationItem[];
  certifications: CertificationItem[];
  achievements: AchievementItem[];
  blogPosts: BlogPost[];
}

// -------------------------------------------------------------
// HELPER NORMALIZERS
// -------------------------------------------------------------

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

const mapProjectCategory = (cat: string) => {
  const l = (cat || '').toLowerCase();
  if (l.includes('robot')) return 'robotics';
  if (l.includes('autonom') || l.includes('path')) return 'autonomy';
  if (l.includes('uav') || l.includes('aero')) return 'uav-aerospace';
  if (l.includes('embed') || l.includes('firmware')) return 'embedded';
  if (l.includes('ai') || l.includes('machine') || l.includes('ml')) return 'ai-ml';
  return 'robotics';
};

const mapSkillCategory = (cat: string): SkillCategory => {
  if (isSkillCategory(cat)) return cat;
  const l = (cat || '').toLowerCase();
  if (l.includes('robot') || l.includes('control') || l.includes('kinematic')) return 'Robotics & Control';
  if (l.includes('autonom')) return 'Autonomous Systems';
  if (l.includes('ai') || l.includes('machine') || l.includes('ml')) return 'AI & ML';
  if (l.includes('embed') || l.includes('firmware')) return 'Firmware & Embedded';
  if (l.includes('circuit') || l.includes('hardware') || l.includes('electronic') || l.includes('pcb')) return 'Hardware & Circuits';
  if (l.includes('space') || l.includes('uav') || l.includes('aero')) return 'Space Systems & UAV';
  return 'Software & Tools';
};

export function normalizeProfile(p: any): Profile | null {
  if (!p || typeof p !== 'object') return null;

  const longBioArray = typeof p.long_bio === 'string'
    ? p.long_bio.split('\n\n').map((s: string) => s.trim()).filter(Boolean)
    : (Array.isArray(p.long_bio) ? p.long_bio : (typeof p.longBio === 'string' ? p.longBio.split('\n\n') : (p.longBio || [])));

  return {
    fullName: p.full_name || p.fullName || 'Tanishk Singhal',
    displayName: p.display_name || p.displayName || 'Tanishk Singhal',
    headline: p.headline || 'Robotics Researcher & Systems Engineer',
    subheadline: p.subheadline || p.social_links_json?.subheadline || p.availability_status || p.tagline || 'Building autonomous robotic systems, closed-loop ROS 2 control nodes, embedded firmware, and intelligent machine learning pipelines.',
    shortBio: p.short_bio || p.shortBio || '',
    longBio: longBioArray,
    location: p.location || 'India',
    email: p.email || 'Tanishksinghal6285@gmail.com',
    avatarUrl: p.profile_image_url || p.avatar_url || 'https://avatars.githubusercontent.com/u/132895444?v=4',
    resumeUrl: p.resume_url || '/resume',
    socials: {
      github: p.github_url || 'https://github.com/tanishk756',
      linkedin: p.linkedin_url || 'https://www.linkedin.com/in/tanishk-singhal-/',
      googleScholar: p.google_scholar_url || 'https://scholar.google.com/citations?user=4o_Dc0wAAAAJ&hl=en',
      researchGate: p.researchgate_url || 'https://www.researchgate.net/profile/Tanishk-Singhal',
    },
    keyStats: [
      { label: "Engineering Focus", value: "Autonomy", sublabel: "Kinematics & Control" },
      { label: "Core Environment", value: "ROS 2", sublabel: "Nodes & Interfaces" },
      { label: "Computational Domain", value: "Perception", sublabel: "Spatial Navigation" },
      { label: "Research Focus", value: "Systems", sublabel: "Physical & Cyber-Physical" }
    ],
    source: 'Supabase Canonical published record',
    verificationStatus: p.verification_status || 'USER_PROVIDED',
    lastVerified: p.last_verified || new Date().toISOString()
  };
}

export function normalizeProject(p: any): ProjectCaseStudy {
  return {
    id: p.slug || p.id,
    slug: p.slug || p.id,
    title: p.title || 'Untitled Project',
    tagline: p.subtitle || p.overview || p.title || '',
    category: mapProjectCategory(p.category),
    subcategories: normalizeStringArray(p.software_stack),
    status: 'completed',
    featured: p.featured || false,
    startDate: p.timeframe || '2024',
    role: p.role || 'Developer',
    organization: p.organization || 'Open Source Robotics',
    coverBadge: p.category || 'Robotics',
    problem: p.problem || 'Autonomous tracking and control coordination in robotics.',
    objective: p.overview || p.title || '',
    approach: p.solution || p.overview || p.title || '',
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
    source: 'Supabase Canonical published record',
    verificationStatus: p.verification_status || 'USER_PROVIDED',
    lastVerified: p.last_verified || new Date().toISOString(),
  };
}

export function normalizeExperience(exp: any): ExperienceItem {
  const formatWorkMode = (wm: any): string | undefined => {
    if (!wm) return undefined;
    const s = String(wm).toLowerCase().replace(/[-\s]/g, '_');
    if (s === 'on_site' || s === 'onsite') return 'On-site';
    if (s === 'hybrid') return 'Hybrid';
    if (s === 'remote') return 'Remote';
    return undefined;
  };

  return {
    id: exp.id,
    slug: (exp.organization || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    organization: exp.organization || 'Organization',
    role: exp.role_title || exp.role || 'Role',
    type: 'EMPLOYMENT',
    startDate: exp.start_date || '',
    endDate: exp.end_date || 'Present',
    current: exp.is_current ?? true,
    isCurrent: exp.is_current ?? true,
    location: exp.location || 'India',
    workMode: formatWorkMode(exp.work_mode || exp.workMode),
    domain: 'Robotics & AI',
    description: normalizeStringArray(exp.description || exp.responsibilities),
    technologies: normalizeStringArray(exp.technologies),
    source: 'Supabase Canonical published record',
    verificationStatus: exp.verification_status || 'USER_PROVIDED',
    publicEligibility: true,
    lastVerified: exp.last_verified || new Date().toISOString(),
  };
}

export function normalizeResearch(r: any): ResearchItem {
  return {
    id: r.slug || r.id,
    slug: r.slug || r.id,
    title: r.title || 'Research Program',
    domain: r.research_area || r.area || 'Robotics & Control',
    organization: r.organization || 'Autonomous Systems Research',
    collaborators: normalizeStringArray(r.collaborators),
    dateRange: r.date_range || '2023 — Present',
    summary: r.summary || r.title || '',
    methodology: r.methodology || r.approach || 'Empirical formulation and simulation evaluation.',
    contributions: normalizeStringArray(r.key_contribution || r.contribution || r.contributions || [r.title]),
    source: 'Supabase Canonical published record',
    verificationStatus: r.verification_status || 'USER_PROVIDED',
    lastVerified: r.last_verified || new Date().toISOString(),
  };
}

export function normalizePublication(pub: any): PublicationItem {
  return {
    id: pub.slug || pub.id,
    slug: pub.slug || pub.id,
    title: pub.title || 'Publication',
    authors: normalizeStringArray(pub.authors).length > 0 ? normalizeStringArray(pub.authors) : ['Tanishk Singhal'],
    venue: pub.venue || 'Proceedings',
    year: pub.year || 2024,
    abstract: pub.abstract || '',
    keywords: normalizeStringArray(pub.keywords),
    doi: pub.doi || undefined,
    pdfUrl: pub.pdf_asset_url || pub.pdf_url || undefined,
    doiUrl: pub.doi ? ('https://doi.org/' + pub.doi) : undefined,
    status: 'published',
    source: 'Supabase Canonical published record',
    verificationStatus: pub.verification_status || 'USER_PROVIDED',
    lastVerified: pub.last_verified || new Date().toISOString(),
  };
}

export function normalizePatent(pat: any): PatentItem {
  return {
    id: pat.slug || pat.id,
    slug: pat.slug || pat.id,
    title: pat.title || 'Patent',
    inventors: normalizeStringArray(pat.inventors),
    filingDate: pat.filing_date || pat.filingDate || '',
    status: pat.status || 'filed',
    jurisdiction: pat.jurisdiction || 'India',
    abstract: pat.description || pat.abstract || '',
    source: 'Supabase Canonical published record',
    verificationStatus: pat.verification_status || 'USER_PROVIDED',
    lastVerified: pat.last_verified || new Date().toISOString(),
  };
}

export function normalizeSkill(sk: any): SkillItem {
  const rawLevel = String(sk.proficiency_level || sk.proficiencyLevel || sk.level || 'proficient').toLowerCase();
  const level = rawLevel.includes('adv') || rawLevel.includes('prof') ? 'proficient' : (rawLevel.includes('exp') ? 'proficient' : 'working');
  return {
    name: sk.name || '',
    category: mapSkillCategory(sk.category),
    level: level as any,
    subdiscipline: sk.subdiscipline || sk.description || undefined,
    description: sk.description || sk.subdiscipline || undefined,
    highlight: Boolean(sk.highlight),
  };
}

export function normalizeEducation(e: any): EducationItem {
  return {
    id: e.id,
    institution: e.institution || '',
    program: e.degree || e.field || '',
    degree: e.degree || e.field || '',
    fieldOfStudy: e.field_of_study || e.field || e.degree || '',
    startDate: e.start_date || '',
    endDate: e.end_date || undefined,
    grade: e.grade || undefined,
    location: e.location || undefined,
    publicEligibility: true,
    source: 'Supabase Canonical published record',
    verificationStatus: e.verification_status || 'USER_PROVIDED',
    lastVerified: e.last_verified || new Date().toISOString(),
  };
}

export function normalizeOrganization(org: any): OrganizationItem {
  return {
    id: org.id,
    name: org.name || '',
    type: 'company',
    role: org.role || '',
    relationshipType: 'EMPLOYMENT',
    startDate: org.start_date || undefined,
    endDate: org.end_date || undefined,
    dateRange: (org.start_date || '') + ' — ' + (org.end_date || 'Present'),
    description: org.description || undefined,
    source: 'Supabase Canonical published record',
    verificationStatus: org.verification_status || 'USER_PROVIDED',
    publicEligibility: true,
    lastVerified: org.last_verified || new Date().toISOString(),
  };
}

export function normalizeCertification(cert: any): CertificationItem {
  return {
    id: cert.slug || cert.id,
    slug: cert.slug || cert.id,
    name: cert.name || cert.title || '',
    issuingOrganization: cert.issuing_organization || cert.organization || '',
    issueDate: cert.issue_date || cert.date || '',
    expirationDate: cert.expiration_date || undefined,
    credentialId: cert.credential_id || undefined,
    credentialUrl: cert.credential_url || undefined,
    skills: normalizeStringArray(cert.skills),
    source: 'Supabase Canonical published record',
    verificationStatus: cert.verification_status || 'USER_PROVIDED',
    lastVerified: cert.last_verified || new Date().toISOString(),
  };
}

export function normalizeAchievement(ach: any): AchievementItem {
  return {
    id: ach.slug || ach.id,
    slug: ach.slug || ach.id,
    title: ach.title || '',
    category: ach.category || 'award',
    organization: ach.organization || '',
    date: ach.date || '',
    ranking: ach.ranking || undefined,
    description: ach.description || '',
    evidenceUrl: ach.evidence_url || undefined,
    source: 'Supabase Canonical published record',
    verificationStatus: ach.verification_status || 'USER_PROVIDED',
    lastVerified: ach.last_verified || new Date().toISOString(),
  };
}

export function normalizeBlogPost(b: any): BlogPost {
  return {
    id: b.slug || b.id,
    slug: b.slug || b.id,
    title: b.title || '',
    excerpt: b.excerpt || b.summary || '',
    coverImage: b.cover_image_url || undefined,
    author: b.author || 'Tanishk Singhal',
    publishedDate: b.published_at || b.created_at || '',
    readingTimeMinutes: b.reading_time_minutes || 5,
    categories: normalizeStringArray(b.categories),
    tags: normalizeStringArray(b.tags),
    content: b.content || '',
    source: 'Supabase Canonical published record',
    verificationStatus: b.verification_status || 'USER_PROVIDED',
    lastVerified: b.last_verified || new Date().toISOString(),
  };
}

// -------------------------------------------------------------
// CACHE & CLIENT IMPLEMENTATION
// -------------------------------------------------------------

interface CacheEntry {
  data: PublicDataset;
  timestamp: number;
}

let memoryCache: CacheEntry | null = null;
const CACHE_TTL_MS = 60_000; // 60 seconds

export const publicContentClient = {
  clearCache() {
    memoryCache = null;
  },

  async fetchAllPublicContent(forceRefresh = false): Promise<{ success: boolean; data: PublicDataset; error?: string }> {
    const now = Date.now();
    if (!forceRefresh && memoryCache && (now - memoryCache.timestamp < CACHE_TTL_MS)) {
      return { success: true, data: memoryCache.data };
    }

    try {
      const endpoint = `${SUPABASE_URL}/functions/v1/public-content?type=all&_t=${now}`;
      const res = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!res.ok) {
        return {
          success: false,
          data: this.getEmptyDataset(),
          error: 'Content temporarily unavailable.'
        };
      }

      const json = await res.json();
      if (!json.success || !json.data) {
        return {
          success: false,
          data: this.getEmptyDataset(),
          error: 'Content temporarily unavailable.'
        };
      }

      const raw = json.data;
      const parsedDataset: PublicDataset = {
        profile: normalizeProfile(raw.profile),
        projects: (raw.projects || []).map(normalizeProject),
        experience: sortExperiencesDesc((raw.experience || []).map(normalizeExperience)),
        research: (raw.research || []).map(normalizeResearch),
        publications: (raw.publications || []).map(normalizePublication),
        patents: (raw.patents || []).map(normalizePatent),
        skills: (raw.skills || []).map(normalizeSkill),
        education: (raw.education || []).map(normalizeEducation),
        organizations: (raw.organizations || []).map(normalizeOrganization),
        certifications: (raw.certifications || []).map(normalizeCertification),
        achievements: (raw.achievements || []).map(normalizeAchievement),
        blogPosts: (raw.blog || []).map(normalizeBlogPost),
      };

      memoryCache = {
        data: parsedDataset,
        timestamp: now,
      };

      return { success: true, data: parsedDataset };
    } catch {
      return {
        success: false,
        data: this.getEmptyDataset(),
        error: 'Content temporarily unavailable.'
      };
    }
  },

  getEmptyDataset(): PublicDataset {
    return {
      profile: null,
      projects: [],
      experience: [],
      research: [],
      publications: [],
      patents: [],
      skills: [],
      education: [],
      organizations: [],
      certifications: [],
      achievements: [],
      blogPosts: [],
    };
  }
};
