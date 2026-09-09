import { SkillCategory } from '../constants/skills';

export type ProvenanceStatus = 
  | 'USER_PROVIDED' 
  | 'GITHUB_VERIFIED' 
  | 'PUBLIC_WEB_VERIFIED' 
  | 'PROBABLE' 
  | 'UNVERIFIED';

export interface ProvenanceRecord {
  source: string;
  sourceUrl?: string;
  verificationStatus: ProvenanceStatus;
  lastVerified: string; // ISO format YYYY-MM-DD
  notes?: string;
}

// 1. Profile Model
export interface Profile extends ProvenanceRecord {
  fullName: string;
  displayName: string;
  headline: string;
  subheadline: string;
  shortBio: string;
  longBio: string[];
  location: string;
  email: string;
  avatarUrl: string;
  resumeUrl?: string;
  socials: {
    github: string;
    linkedin?: string;
    googleScholar?: string;
    researchGate?: string;
    xTwitter?: string;
    youtube?: string;
  };
  keyStats: {
    label: string;
    value: string;
    sublabel?: string;
  }[];
}

// 2. Project Case Study Model
export type ProjectCategory = 
  | 'robotics' 
  | 'autonomy' 
  | 'uav-aerospace' 
  | 'embedded' 
  | 'ai-ml' 
  | 'space-systems'
  | 'software-tools';

export interface SubsystemBlock {
  name: string;
  category: 'hardware' | 'firmware' | 'software' | 'algorithm' | 'telemetry';
  specs: string[];
  description: string;
}

export interface ChallengeItem {
  challenge: string;
  rootCause?: string;
  solution: string;
  outcome: string;
}

export interface ProjectCaseStudy extends ProvenanceRecord {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  category: ProjectCategory;
  subcategories: string[];
  status: 'completed' | 'in-progress' | 'prototype' | 'research';
  featured: boolean;
  startDate: string;
  endDate?: string;
  role: string;
  organization?: string;
  collaborators?: string[];
  
  // Executive Overview
  problem: string;
  objective: string;
  approach: string;
  
  // System Breakdown
  architectureDescription?: string;
  subsystems?: SubsystemBlock[];
  hardwareStack?: string[];
  softwareStack?: string[];
  algorithms?: string[];
  
  // Challenges & Resolutions
  challenges: ChallengeItem[];
  
  // Results
  results: {
    metrics?: { label: string; value: string; unit?: string }[];
    summary: string[];
  };
  
  lessonsLearned?: string[];
  futureWork?: string[];
  
  // Media & Links
  coverBadge: string;
  coverImage?: string;
  gallery?: { url: string; caption: string; type: 'image' | 'video' | 'schematic' }[];
  cadUrl?: string;
  pcbUrl?: string;
  docsUrl?: string;
  githubUrl?: string;
  demoUrl?: string;
  paperUrl?: string;
}

// 3. Publication Model
export interface PublicationItem extends ProvenanceRecord {
  id: string;
  slug: string;
  title: string;
  authors: string[];
  authorPosition?: string;
  venue: string;
  publisher?: string;
  year: number;
  publicationDate?: string;
  abstract: string;
  doi?: string;
  doiUrl?: string;
  paperUrl?: string;
  pdfUrl?: string;
  citationsCount?: number;
  keywords: string[];
  associatedProjectSlug?: string;
  status: 'published' | 'accepted' | 'under-review' | 'pre-print';
}

// 4. Patent Model
export interface PatentItem extends ProvenanceRecord {
  id: string;
  slug: string;
  title: string;
  patentNumber?: string;
  applicationNumber?: string;
  inventors: string[];
  filingDate: string;
  publicationDate?: string;
  status: 'granted' | 'filed' | 'published' | 'provisional';
  jurisdiction: string;
  assignee?: string;
  abstract: string;
  claimsSummary?: string[];
  patentUrl?: string;
  pdfUrl?: string;
  associatedProjectSlug?: string;
}

// 5. Research Program Model
export interface ResearchItem extends ProvenanceRecord {
  id: string;
  slug: string;
  title: string;
  domain: string;
  organization: string;
  collaborators: string[];
  dateRange?: string;
  summary: string;
  methodology: string;
  contributions: string[];
  associatedPublicationSlugs?: string[];
}

// 6. Experience Model
export type ExperienceCategory =
  | 'EMPLOYMENT'
  | 'INTERNSHIP'
  | 'CONTRACT'
  | 'FOUNDER'
  | 'LEADERSHIP'
  | 'STUDENT_ORGANIZATION'
  | 'TECHNICAL_COMMUNITY'
  | 'MEMBERSHIP'
  | 'VOLUNTEER'
  | 'RESEARCH_COLLABORATION';

export interface ExperienceItem extends ProvenanceRecord {
  id: string;
  slug: string;
  role: string;
  organization: string;
  type: ExperienceCategory;
  organizationUrl?: string;
  location?: string;
  workMode?: 'On-site' | 'Hybrid' | 'Remote' | string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  isCurrent?: boolean;
  domain?: string;
  description: string[] | string;
  responsibilities?: string[];
  achievements?: string[];
  technologies?: string[];
  publicEligibility?: boolean;
}

// 7. Education Model
export interface EducationItem extends ProvenanceRecord {
  id: string;
  institution: string;
  program: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate: string;
  endDate?: string;
  grade?: string;
  location?: string;
  highlights?: string[];
  publicEligibility?: boolean;
}

// 8. Achievement Model
export interface AchievementItem extends ProvenanceRecord {
  id: string;
  slug: string;
  title: string;
  category: 'competition' | 'award' | 'hackathon' | 'recognition';
  organization: string;
  date: string;
  ranking?: string;
  description: string;
  evidenceUrl?: string;
  associatedProjectSlug?: string;
}

// 9. Certification Model
export interface CertificationItem extends ProvenanceRecord {
  id: string;
  slug: string;
  name: string;
  issuingOrganization: string;
  issueDate: string;
  expirationDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  skills: string[];
}

// 10. Skill Model
export interface SkillItem {
  name: string;
  category: SkillCategory;
  level: 'proficient' | 'working' | 'exploring';
  subdiscipline?: string;
  description?: string;
  highlight?: boolean;
}

// 11. Blog Post Model
export interface BlogPost extends ProvenanceRecord {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage?: string;
  author: string;
  publishedDate: string;
  updatedDate?: string;
  readingTimeMinutes: number;
  categories: string[];
  tags: string[];
  content: string; // Markdown formatted
  relatedProjectSlugs?: string[];
  relatedResearchSlugs?: string[];
}

// 12. Currently Building Model
export interface CurrentlyBuildingItem extends ProvenanceRecord {
  id: string;
  title: string;
  category: string;
  status: 'active-development' | 'testing' | 'prototyping';
  description: string;
  currentMilestone: string;
  technologies: string[];
}

// 13. Organization Model
export type OrganizationType =
  | 'company'
  | 'startup'
  | 'student-society'
  | 'technical-community'
  | 'university'
  | 'research-lab'
  | 'non-profit';

export interface OrganizationItem extends ProvenanceRecord {
  id: string;
  name: string;
  type: OrganizationType;
  role: string;
  relationshipType?: ExperienceCategory;
  dateRange: string;
  startDate?: string;
  endDate?: string;
  websiteUrl?: string;
  description?: string;
  publicEligibility?: boolean;
}

// 14. Media Reference Model
export interface MediaItem {
  id: string;
  title: string;
  type: 'image' | 'diagram' | 'document' | 'video';
  url: string;
  altText: string;
  tags: string[];
  source?: string;
  ownerLicenseStatus?: string;
  attribution?: string;
  isPublic?: boolean;
  associatedEntityId?: string;
}

// 15. Copyright / Intellectual Property Model
export interface CopyrightItem extends ProvenanceRecord {
  id: string;
  slug: string;
  title: string;
  type: 'software-copyright' | 'literary-work' | 'artistic-work' | 'other';
  registrationNumber?: string;
  filingDate?: string;
  registrationDate?: string;
  status: 'registered' | 'filed' | 'under-review' | 'pending';
  authors: string[];
  description: string;
  certificateUrl?: string;
}

// 16. Language Model
export interface LanguageItem extends ProvenanceRecord {
  id: string;
  language: string;
  proficiency: 'native' | 'fluent' | 'professional' | 'working' | 'elementary';
  notes?: string;
}

