import { z } from 'zod';
import { SKILL_CATEGORIES } from '../constants/skills';

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
  id: z.string().optional(),
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
  publicationStatus: PublicationStatusSchema.optional().default('published'),
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
  id: z.string().optional().or(z.literal('')),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  title: z.string().min(1, 'Title is required'),
  tagline: z.string().min(1, 'Tagline is required'),
  category: z.enum(['robotics', 'autonomy', 'uav-aerospace', 'embedded', 'ai-ml', 'space-systems', 'software-tools']),
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
  workMode: z.enum(['on_site', 'hybrid', 'remote']).optional().or(z.literal('')).or(z.null()),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
  description: z.string().min(1, 'Description is required'),
  responsibilities: z.array(z.string()),
  achievements: z.array(z.string()).optional(),
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
  publicationStatus: PublicationStatusSchema.default('draft'),
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
  id: z.string().optional().or(z.literal('')),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  title: z.string().min(1, 'Title is required'),
  excerpt: z.string().min(1, 'Excerpt is required'),
  content: z.string().min(1, 'Content is required'),
  coverImage: z.string().optional(),
  publishedDate: z.string().min(1, 'Publish date is required'),
  updatedDate: z.string().optional(),
  readingTimeMinutes: z.number().int().min(1).default(5),
  category: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()),
  publicationStatus: PublicationStatusSchema.default('published'),
  relatedProjectIds: z.array(z.string()).optional(),
  relatedResearchIds: z.array(z.string()).optional(),
});

// 10. Skill Schema
export const SkillSchema = ProvenanceSchema.extend({
  id: z.string().min(1, 'ID is required'),
  name: z.string().min(1, 'Skill name is required'),
  category: z.enum(SKILL_CATEGORIES),
  subdiscipline: z.string().min(1, 'Subdiscipline is required'),
  verifiedCompetency: z.boolean().default(true),
  associatedProjectIds: z.array(z.string()).optional(),
  publicationStatus: PublicationStatusSchema.default('published').optional(),
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

// 15. Contact Submission Schemas
export const ContactSubmissionStatusSchema = z.enum(['new', 'read', 'replied', 'archived']);

export const ContactInquiryTypeSchema = z.enum([
  'Project / Engineering',
  'Research / Collaboration',
  'Speaking / Workshop',
  'Internship / Career',
  'Consulting',
  'Other',
]);

export const CreateContactSubmissionSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(120, 'Name cannot exceed 120 characters'),
  email: z.string().trim().email('Please enter a valid email address').max(254),
  organization: z.string().trim().max(160, 'Organization cannot exceed 160 characters').optional().or(z.literal('')),
  phone: z.string().trim().max(40, 'Phone number cannot exceed 40 characters').optional().or(z.literal('')),
  subject: z.string().trim().min(2, 'Subject must be at least 2 characters').max(200, 'Subject cannot exceed 200 characters'),
  inquiryType: ContactInquiryTypeSchema.optional().or(z.literal('')),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(5000, 'Message cannot exceed 5000 characters'),
  website: z.string().optional(), // Honeypot field
});

export const ContactSubmissionSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string(),
  organization: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  subject: z.string(),
  inquiry_type: z.string().nullable().optional(),
  message: z.string(),
  status: ContactSubmissionStatusSchema,
  email_notification_status: z.enum(['pending', 'sent', 'failed', 'skipped']).nullable().optional(),
  email_notification_sent_at: z.string().nullable().optional(),
  email_notification_error: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type ContactSubmission = z.infer<typeof ContactSubmissionSchema>;
export type CreateContactSubmissionInput = z.infer<typeof CreateContactSubmissionSchema>;

