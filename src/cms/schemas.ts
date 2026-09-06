import { z } from 'zod';

// 1. Provenance Schema
export const ProvenanceSchema = z.object({
  source: z.string().min(1, 'Source name is required'),
  sourceUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  verificationStatus: z.enum([
    'USER_PROVIDED',
    'GITHUB_VERIFIED',
    'PUBLIC_WEB_VERIFIED',
    'PROBABLE',
    'UNVERIFIED'
  ]),
  lastVerified: z.string().min(1, 'Verification date is required'),
  notes: z.string().optional(),
});

// 2. Publication / Content Lifecycle Status
export const PublicationStatusSchema = z.enum(['draft', 'review', 'approved', 'published', 'archived']);

// 3. Profile Schema
export const ProfileSchema = ProvenanceSchema.extend({
  fullName: z.string().min(1, 'Full name is required'),
  displayName: z.string().min(1, 'Display name is required'),
  headline: z.string().min(1, 'Headline is required'),
  subheadline: z.string().min(1, 'Subheadline is required'),
  shortBio: z.string().min(1, 'Short bio is required'),
  longBio: z.union([z.string(), z.array(z.string())]).optional(),
  location: z.string().min(1, 'Location is required'),
  email: z.string().email('Must be a valid email address'),
  websiteUrl: z.string().url().optional().or(z.literal('')),
  profileImage: z.string().optional(),
  socials: z.object({
    github: z.string().url('Must be a valid URL'),
    linkedin: z.string().url().optional().or(z.literal('')),
    googleScholar: z.string().url().optional().or(z.literal('')),
    researchGate: z.string().url().optional().or(z.literal('')),
    orcid: z.string().optional(),
    twitter: z.string().optional(),
  }),
});

// 4. Project Schema
export const ProjectSchema = ProvenanceSchema.extend({
  id: z.string().min(1, 'ID is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  title: z.string().min(1, 'Title is required'),
  tagline: z.string().min(1, 'Tagline is required'),
  category: z.enum(['robotics', 'autonomy', 'uav-aerospace', 'embedded', 'ai-ml', 'space-systems']),
  subcategories: z.array(z.string()),
  status: z.enum(['completed', 'in-progress', 'prototype', 'research']),
  publicationStatus: PublicationStatusSchema.default('published'),
  featured: z.boolean().default(false),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  role: z.string().min(1, 'Role is required'),
  organization: z.string().optional(),
  collaborators: z.array(z.string()).optional(),
  
  overview: z.string().min(1, 'Overview is required'),
  problem: z.string().min(1, 'Problem statement is required'),
  objective: z.string().min(1, 'Objective is required'),
  architecture: z.string().min(1, 'Architecture description is required'),
  hardware: z.string().optional(),
  software: z.string().optional(),
  algorithms: z.string().optional(),
  implementation: z.string().optional(),
  challenges: z.string().optional(),
  results: z.string().optional(),
  lessonsLearned: z.string().optional(),
  futureWork: z.string().optional(),
  
  githubUrl: z.string().url().optional().or(z.literal('')),
  demoUrl: z.string().url().optional().or(z.literal('')),
  paperUrl: z.string().url().optional().or(z.literal('')),
  relatedResearchIds: z.array(z.string()).optional(),
  relatedPublicationIds: z.array(z.string()).optional(),
});

// 5. Experience Schema
export const ExperienceSchema = ProvenanceSchema.extend({
  id: z.string().min(1, 'ID is required'),
  organization: z.string().min(1, 'Organization is required'),
  role: z.string().min(1, 'Role is required'),
  employmentType: z.string().min(1, 'Employment type is required'),
  location: z.string().min(1, 'Location is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
  description: z.string().min(1, 'Description is required'),
  responsibilities: z.array(z.string()),
  achievements: z.array(z.string()),
  technologies: z.array(z.string()),
  associatedProjectIds: z.array(z.string()).optional(),
  publicationStatus: PublicationStatusSchema.default('published'),
});

// 6. Research Program Schema
export const ResearchSchema = ProvenanceSchema.extend({
  id: z.string().min(1, 'ID is required'),
  slug: z.string().min(1, 'Slug is required'),
  title: z.string().min(1, 'Title is required'),
  domain: z.string().min(1, 'Domain is required'),
  summary: z.string().min(1, 'Summary is required'),
  problem: z.string().min(1, 'Problem is required'),
  methodology: z.string().min(1, 'Methodology is required'),
  findings: z.string().optional(),
  status: z.enum(['active', 'completed', 'preliminary', 'theoretical']),
  publicationStatus: PublicationStatusSchema.default('published'),
  associatedProjectIds: z.array(z.string()).optional(),
  associatedPublicationIds: z.array(z.string()).optional(),
});

// 7. Publication Schema
export const PublicationSchema = ProvenanceSchema.extend({
  id: z.string().min(1, 'ID is required'),
  slug: z.string().min(1, 'Slug is required'),
  title: z.string().min(1, 'Title is required'),
  authors: z.array(z.string()).min(1, 'At least one author is required'),
  year: z.number().int().min(1900).max(2100),
  venue: z.string().min(1, 'Venue is required'),
  publicationType: z.enum(['journal', 'conference', 'preprint', 'workshop', 'book-chapter']),
  status: z.enum(['published', 'accepted', 'under-review', 'in-preparation']),
  publicationStatus: PublicationStatusSchema.default('published'),
  abstract: z.string().min(1, 'Abstract is required'),
  keywords: z.array(z.string()),
  publisher: z.string().optional(),
  doi: z.string().optional(),
  pdfUrl: z.string().url().optional().or(z.literal('')),
  externalUrl: z.string().url().optional().or(z.literal('')),
  associatedProjectIds: z.array(z.string()).optional(),
  associatedResearchIds: z.array(z.string()).optional(),
});

// 8. Patent Schema
export const PatentSchema = ProvenanceSchema.extend({
  id: z.string().min(1, 'ID is required'),
  slug: z.string().min(1, 'Slug is required'),
  title: z.string().min(1, 'Title is required'),
  inventors: z.array(z.string()).min(1, 'At least one inventor is required'),
  patentNumber: z.string().optional(),
  applicationNumber: z.string().optional(),
  filingDate: z.string().optional(),
  status: z.enum(['filed', 'granted', 'provisional', 'in-preparation']),
  publicationStatus: PublicationStatusSchema.default('published'),
  abstract: z.string().min(1, 'Abstract is required'),
  jurisdiction: z.string().min(1, 'Jurisdiction is required'),
  externalUrl: z.string().url().optional().or(z.literal('')),
});

// 9. Blog Post Schema
export const BlogSchema = ProvenanceSchema.extend({
  id: z.string().min(1, 'ID is required'),
  slug: z.string().min(1, 'Slug is required'),
  title: z.string().min(1, 'Title is required'),
  excerpt: z.string().min(1, 'Excerpt is required'),
  content: z.string().min(1, 'Content is required'),
  coverImage: z.string().optional(),
  publishedDate: z.string().min(1, 'Publish date is required'),
  updatedDate: z.string().optional(),
  readingTimeMinutes: z.number().int().min(1).default(5),
  category: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()),
  featured: z.boolean().default(false),
  publicationStatus: PublicationStatusSchema.default('published'),
  relatedProjectIds: z.array(z.string()).optional(),
  relatedResearchIds: z.array(z.string()).optional(),
});

// 10. Skill Schema
export const SkillSchema = ProvenanceSchema.extend({
  id: z.string().min(1, 'ID is required'),
  name: z.string().min(1, 'Skill name is required'),
  category: z.enum([
    'Robotics & Control',
    'AI & ML',
    'Firmware & Embedded',
    'Hardware & Circuits',
    'Software & Tools'
  ]),
  subdiscipline: z.string().min(1, 'Subdiscipline is required'),
  verifiedCompetency: z.boolean().default(true),
  associatedProjectIds: z.array(z.string()).optional(),
});

// 11. Achievement Schema
export const AchievementSchema = ProvenanceSchema.extend({
  id: z.string().min(1, 'ID is required'),
  title: z.string().min(1, 'Title is required'),
  organization: z.string().min(1, 'Organization is required'),
  date: z.string().min(1, 'Date is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.enum(['competition', 'hackathon', 'scholarship', 'academic', 'award']),
  evidenceUrl: z.string().url().optional().or(z.literal('')),
  publicationStatus: PublicationStatusSchema.default('published'),
});

// 12. Certification Schema
export const CertificationSchema = ProvenanceSchema.extend({
  id: z.string().min(1, 'ID is required'),
  title: z.string().min(1, 'Title is required'),
  issuer: z.string().min(1, 'Issuer is required'),
  issueDate: z.string().min(1, 'Issue date is required'),
  expiryDate: z.string().optional(),
  credentialId: z.string().optional(),
  credentialUrl: z.string().url().optional().or(z.literal('')),
  skills: z.array(z.string()).optional(),
  publicationStatus: PublicationStatusSchema.default('published'),
});

// 13. Organization Schema
export const OrganizationSchema = ProvenanceSchema.extend({
  id: z.string().min(1, 'ID is required'),
  name: z.string().min(1, 'Organization name is required'),
  role: z.string().min(1, 'Role is required'),
  period: z.string().min(1, 'Period is required'),
  description: z.string().min(1, 'Description is required'),
  url: z.string().url().optional().or(z.literal('')),
  publicationStatus: PublicationStatusSchema.default('published'),
});

// 14. Media Registry Schema
export const MediaSchema = ProvenanceSchema.extend({
  id: z.string().min(1, 'ID is required'),
  filename: z.string().min(1, 'Filename is required'),
  title: z.string().min(1, 'Title is required'),
  altText: z.string().min(1, 'Alt text is required'),
  caption: z.string().optional(),
  type: z.enum(['image', 'diagram', 'cad', 'pcb', 'document', 'video']),
  url: z.string().min(1, 'URL/path is required'),
  associatedContentType: z.string().optional(),
  associatedContentId: z.string().optional(),
});
