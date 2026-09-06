import { profileData } from '../content/profile';
import { allProjectsData } from '../content/projects';
import { researchData } from '../content/research';
import { publicationsData } from '../content/publications';
import { patentsData } from '../content/patents';
import { experienceData } from '../content/experience';
import { skillsData } from '../content/skills';
import { blogPostsData } from '../content/blog';
import { achievementsData } from '../content/achievements';
import { certificationsData } from '../content/certifications';
import { organizationsData } from '../content/organizations';
import { mediaRegistryData } from '../content/media';


import {
  ProfileSchema,
  ProjectSchema,
  ExperienceSchema,
  ResearchSchema,
  PublicationSchema,
  PatentSchema,
  SkillSchema,
  BlogSchema,
  AchievementSchema,
  CertificationSchema,
  OrganizationSchema,
  MediaSchema,
} from './schemas';
import { z } from 'zod';

export type ProfileData = z.infer<typeof ProfileSchema>;
export type ProjectData = z.infer<typeof ProjectSchema>;
export type ExperienceData = z.infer<typeof ExperienceSchema>;
export type ResearchData = z.infer<typeof ResearchSchema>;
export type PublicationData = z.infer<typeof PublicationSchema>;
export type PatentData = z.infer<typeof PatentSchema>;
export type SkillData = z.infer<typeof SkillSchema>;
export type BlogData = z.infer<typeof BlogSchema>;
export type AchievementData = z.infer<typeof AchievementSchema>;
export type CertificationData = z.infer<typeof CertificationSchema>;
export type OrganizationData = z.infer<typeof OrganizationSchema>;
export type MediaData = z.infer<typeof MediaSchema>;

export interface CMSStats {
  totalProjects: number;
  publishedProjects: number;
  draftProjects: number;
  totalResearch: number;
  totalPublications: number;
  totalPatents: number;
  totalExperience: number;
  totalBlogPosts: number;
  publishedBlogPosts: number;
  totalSkills: number;
  totalAchievements: number;
  totalCertifications: number;
  totalMedia: number;
  pendingVerifications: number;
}

import { cmsApiClient } from './apiClient';

export interface IContentStore {
  readonly backendType: 'LOCAL_DEVELOPMENT_STORE' | 'SUPABASE_BACKEND';
  getProfile(): ProfileData;
  saveProfile(data: ProfileData): void;

  getProjects(): ProjectData[];
  getProject(idOrSlug: string): ProjectData | undefined;
  saveProject(data: ProjectData): void;
  deleteProject(id: string): void;

  getResearch(): ResearchData[];
  getResearchItem(idOrSlug: string): ResearchData | undefined;
  saveResearch(data: ResearchData): void;
  deleteResearch(id: string): void;

  getPublications(): PublicationData[];
  getPublication(idOrSlug: string): PublicationData | undefined;
  savePublication(data: PublicationData): void;
  deletePublication(id: string): void;

  getPatents(): PatentData[];
  savePatent(data: PatentData): void;
  deletePatent(id: string): void;

  getExperience(): ExperienceData[];
  saveExperience(data: ExperienceData): void;
  deleteExperience(id: string): void;

  getSkills(): SkillData[];
  saveSkill(data: SkillData): void;
  deleteSkill(id: string): void;

  getBlogPosts(): BlogData[];
  getBlogPost(idOrSlug: string): BlogData | undefined;
  saveBlogPost(data: BlogData): void;
  deleteBlogPost(id: string): void;

  getAchievements(): AchievementData[];
  saveAchievement(data: AchievementData): void;
  deleteAchievement(id: string): void;

  getCertifications(): CertificationData[];
  saveCertification(data: CertificationData): void;
  deleteCertification(id: string): void;

  getOrganizations(): OrganizationData[];
  saveOrganization(data: OrganizationData): void;
  deleteOrganization(id: string): void;

  getMedia(): MediaData[];
  saveMedia(data: MediaData): void;
  deleteMedia(id: string): void;

  getStats(): CMSStats;
  exportJSON(): string;
  importJSON(jsonString: string): boolean;
  resetToDefaults(): void;
}

const STORAGE_KEYS = {
  PROFILE: 'ts_cms_profile',
  PROJECTS: 'ts_cms_projects',
  RESEARCH: 'ts_cms_research',
  PUBLICATIONS: 'ts_cms_publications',
  PATENTS: 'ts_cms_patents',
  EXPERIENCE: 'ts_cms_experience',
  SKILLS: 'ts_cms_skills',
  BLOG: 'ts_cms_blog',
  ACHIEVEMENTS: 'ts_cms_achievements',
  CERTIFICATIONS: 'ts_cms_certifications',
  ORGANIZATIONS: 'ts_cms_organizations',
  MEDIA: 'ts_cms_media',
};

class LocalStorageContentStore implements IContentStore {
  readonly backendType = 'LOCAL_DEVELOPMENT_STORE' as const;

  private getItem<T>(key: string, defaultValue: T): T {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return defaultValue;
      return JSON.parse(stored) as T;
    } catch {
      return defaultValue;
    }
  }

  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Failed to persist to localStorage key: ${key}`, e);
    }
  }

  getProfile(): ProfileData {
    return this.getItem<ProfileData>(STORAGE_KEYS.PROFILE, profileData as unknown as ProfileData);
  }

  saveProfile(data: ProfileData): void {
    ProfileSchema.parse(data);
    this.setItem(STORAGE_KEYS.PROFILE, data);
  }

  getProjects(): ProjectData[] {
    // Ensure all items have a default publicationStatus
    const defaults = (allProjectsData as unknown as ProjectData[]).map(p => ({
      ...p,
      publicationStatus: p.publicationStatus || 'published',
    }));
    return this.getItem<ProjectData[]>(STORAGE_KEYS.PROJECTS, defaults);
  }

  getProject(idOrSlug: string): ProjectData | undefined {
    return this.getProjects().find(p => p.id === idOrSlug || p.slug === idOrSlug);
  }

  saveProject(data: ProjectData): void {
    ProjectSchema.parse(data);
    const list = this.getProjects();
    const idx = list.findIndex(p => p.id === data.id);
    if (idx >= 0) {
      list[idx] = data;
    } else {
      list.push(data);
    }
    this.setItem(STORAGE_KEYS.PROJECTS, list);
  }

  deleteProject(id: string): void {
    const list = this.getProjects().filter(p => p.id !== id);
    this.setItem(STORAGE_KEYS.PROJECTS, list);
  }

  getResearch(): ResearchData[] {
    const defaults = (researchData as unknown as ResearchData[]).map(r => ({
      ...r,
      publicationStatus: r.publicationStatus || 'published',
    }));
    return this.getItem<ResearchData[]>(STORAGE_KEYS.RESEARCH, defaults);
  }

  getResearchItem(idOrSlug: string): ResearchData | undefined {
    return this.getResearch().find(r => r.id === idOrSlug || r.slug === idOrSlug);
  }

  saveResearch(data: ResearchData): void {
    ResearchSchema.parse(data);
    const list = this.getResearch();
    const idx = list.findIndex(r => r.id === data.id);
    if (idx >= 0) list[idx] = data;
    else list.push(data);
    this.setItem(STORAGE_KEYS.RESEARCH, list);
  }

  deleteResearch(id: string): void {
    const list = this.getResearch().filter(r => r.id !== id);
    this.setItem(STORAGE_KEYS.RESEARCH, list);
  }

  getPublications(): PublicationData[] {
    const defaults = (publicationsData as unknown as PublicationData[]).map(p => ({
      ...p,
      publicationStatus: p.publicationStatus || 'published',
    }));
    return this.getItem<PublicationData[]>(STORAGE_KEYS.PUBLICATIONS, defaults);
  }

  getPublication(idOrSlug: string): PublicationData | undefined {
    return this.getPublications().find(p => p.id === idOrSlug || p.slug === idOrSlug);
  }

  savePublication(data: PublicationData): void {
    PublicationSchema.parse(data);
    const list = this.getPublications();
    const idx = list.findIndex(p => p.id === data.id);
    if (idx >= 0) list[idx] = data;
    else list.push(data);
    this.setItem(STORAGE_KEYS.PUBLICATIONS, list);
  }

  deletePublication(id: string): void {
    const list = this.getPublications().filter(p => p.id !== id);
    this.setItem(STORAGE_KEYS.PUBLICATIONS, list);
  }

  getPatents(): PatentData[] {
    return this.getItem<PatentData[]>(STORAGE_KEYS.PATENTS, patentsData as unknown as PatentData[]);
  }

  savePatent(data: PatentData): void {
    PatentSchema.parse(data);
    const list = this.getPatents();
    const idx = list.findIndex(p => p.id === data.id);
    if (idx >= 0) list[idx] = data;
    else list.push(data);
    this.setItem(STORAGE_KEYS.PATENTS, list);
  }

  deletePatent(id: string): void {
    const list = this.getPatents().filter(p => p.id !== id);
    this.setItem(STORAGE_KEYS.PATENTS, list);
  }

  getExperience(): ExperienceData[] {
    return this.getItem<ExperienceData[]>(STORAGE_KEYS.EXPERIENCE, experienceData as unknown as ExperienceData[]);
  }

  saveExperience(data: ExperienceData): void {
    ExperienceSchema.parse(data);
    const list = this.getExperience();
    const idx = list.findIndex(e => e.id === data.id);
    if (idx >= 0) list[idx] = data;
    else list.push(data);
    this.setItem(STORAGE_KEYS.EXPERIENCE, list);
  }

  deleteExperience(id: string): void {
    const list = this.getExperience().filter(e => e.id !== id);
    this.setItem(STORAGE_KEYS.EXPERIENCE, list);
  }

  getSkills(): SkillData[] {
    return this.getItem<SkillData[]>(STORAGE_KEYS.SKILLS, skillsData as unknown as SkillData[]);
  }

  saveSkill(data: SkillData): void {
    SkillSchema.parse(data);
    const list = this.getSkills();
    const idx = list.findIndex(s => s.id === data.id);
    if (idx >= 0) list[idx] = data;
    else list.push(data);
    this.setItem(STORAGE_KEYS.SKILLS, list);
  }

  deleteSkill(id: string): void {
    const list = this.getSkills().filter(s => s.id !== id);
    this.setItem(STORAGE_KEYS.SKILLS, list);
  }

  getBlogPosts(): BlogData[] {
    return this.getItem<BlogData[]>(STORAGE_KEYS.BLOG, blogPostsData as unknown as BlogData[]);
  }

  getBlogPost(idOrSlug: string): BlogData | undefined {
    return this.getBlogPosts().find(b => b.id === idOrSlug || b.slug === idOrSlug);
  }

  saveBlogPost(data: BlogData): void {
    BlogSchema.parse(data);
    const list = this.getBlogPosts();
    const idx = list.findIndex(b => b.id === data.id);
    if (idx >= 0) list[idx] = data;
    else list.push(data);
    this.setItem(STORAGE_KEYS.BLOG, list);
  }

  deleteBlogPost(id: string): void {
    const list = this.getBlogPosts().filter(b => b.id !== id);
    this.setItem(STORAGE_KEYS.BLOG, list);
  }

  getAchievements(): AchievementData[] {
    return this.getItem<AchievementData[]>(STORAGE_KEYS.ACHIEVEMENTS, achievementsData as unknown as AchievementData[]);
  }

  saveAchievement(data: AchievementData): void {
    AchievementSchema.parse(data);
    const list = this.getAchievements();
    const idx = list.findIndex(a => a.id === data.id);
    if (idx >= 0) list[idx] = data;
    else list.push(data);
    this.setItem(STORAGE_KEYS.ACHIEVEMENTS, list);
  }

  deleteAchievement(id: string): void {
    const list = this.getAchievements().filter(a => a.id !== id);
    this.setItem(STORAGE_KEYS.ACHIEVEMENTS, list);
  }

  getCertifications(): CertificationData[] {
    return this.getItem<CertificationData[]>(STORAGE_KEYS.CERTIFICATIONS, certificationsData as unknown as CertificationData[]);
  }

  saveCertification(data: CertificationData): void {
    CertificationSchema.parse(data);
    const list = this.getCertifications();
    const idx = list.findIndex(c => c.id === data.id);
    if (idx >= 0) list[idx] = data;
    else list.push(data);
    this.setItem(STORAGE_KEYS.CERTIFICATIONS, list);
  }

  deleteCertification(id: string): void {
    const list = this.getCertifications().filter(c => c.id !== id);
    this.setItem(STORAGE_KEYS.CERTIFICATIONS, list);
  }

  getOrganizations(): OrganizationData[] {
    return this.getItem<OrganizationData[]>(STORAGE_KEYS.ORGANIZATIONS, organizationsData as unknown as OrganizationData[]);
  }

  saveOrganization(data: OrganizationData): void {
    OrganizationSchema.parse(data);
    const list = this.getOrganizations();
    const idx = list.findIndex(o => o.id === data.id);
    if (idx >= 0) list[idx] = data;
    else list.push(data);
    this.setItem(STORAGE_KEYS.ORGANIZATIONS, list);
  }

  deleteOrganization(id: string): void {
    const list = this.getOrganizations().filter(o => o.id !== id);
    this.setItem(STORAGE_KEYS.ORGANIZATIONS, list);
  }

  getMedia(): MediaData[] {
    return this.getItem<MediaData[]>(STORAGE_KEYS.MEDIA, mediaRegistryData as unknown as MediaData[]);
  }

  saveMedia(data: MediaData): void {
    MediaSchema.parse(data);
    const list = this.getMedia();
    const idx = list.findIndex(m => m.id === data.id);
    if (idx >= 0) list[idx] = data;
    else list.push(data);
    this.setItem(STORAGE_KEYS.MEDIA, list);
  }

  deleteMedia(id: string): void {
    const list = this.getMedia().filter(m => m.id !== id);
    this.setItem(STORAGE_KEYS.MEDIA, list);
  }

  getStats(): CMSStats {
    const projects = this.getProjects();
    const research = this.getResearch();
    const pubs = this.getPublications();
    const patents = this.getPatents();
    const experience = this.getExperience();
    const blog = this.getBlogPosts();
    const skills = this.getSkills();
    const achievements = this.getAchievements();
    const certs = this.getCertifications();
    const media = this.getMedia();

    // Count pending verifications across all content
    const allItems = [
      ...projects,
      ...research,
      ...pubs,
      ...patents,
      ...experience,
      ...blog,
      ...skills,
      ...achievements,
      ...certs,
      ...media,
    ];

    const pending = allItems.filter(
      item => item.verificationStatus === 'PROBABLE' || item.verificationStatus === 'UNVERIFIED'
    ).length;

    return {
      totalProjects: projects.length,
      publishedProjects: projects.filter(p => p.publicationStatus === 'published').length,
      draftProjects: projects.filter(p => p.publicationStatus === 'draft').length,
      totalResearch: research.length,
      totalPublications: pubs.length,
      totalPatents: patents.length,
      totalExperience: experience.length,
      totalBlogPosts: blog.length,
      publishedBlogPosts: blog.filter(b => b.publicationStatus === 'published').length,
      totalSkills: skills.length,
      totalAchievements: achievements.length,
      totalCertifications: certs.length,
      totalMedia: media.length,
      pendingVerifications: pending,
    };
  }

  exportJSON(): string {
    const payload = {
      profile: this.getProfile(),
      projects: this.getProjects(),
      research: this.getResearch(),
      publications: this.getPublications(),
      patents: this.getPatents(),
      experience: this.getExperience(),
      skills: this.getSkills(),
      blog: this.getBlogPosts(),
      achievements: this.getAchievements(),
      certifications: this.getCertifications(),
      organizations: this.getOrganizations(),
      media: this.getMedia(),
      exportedAt: new Date().toISOString(),
      cmsVersion: '1.0.0',
    };
    return JSON.stringify(payload, null, 2);
  }

  importJSON(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.profile) this.setItem(STORAGE_KEYS.PROFILE, parsed.profile);
      if (parsed.projects) this.setItem(STORAGE_KEYS.PROJECTS, parsed.projects);
      if (parsed.research) this.setItem(STORAGE_KEYS.RESEARCH, parsed.research);
      if (parsed.publications) this.setItem(STORAGE_KEYS.PUBLICATIONS, parsed.publications);
      if (parsed.patents) this.setItem(STORAGE_KEYS.PATENTS, parsed.patents);
      if (parsed.experience) this.setItem(STORAGE_KEYS.EXPERIENCE, parsed.experience);
      if (parsed.skills) this.setItem(STORAGE_KEYS.SKILLS, parsed.skills);
      if (parsed.blog) this.setItem(STORAGE_KEYS.BLOG, parsed.blog);
      if (parsed.achievements) this.setItem(STORAGE_KEYS.ACHIEVEMENTS, parsed.achievements);
      if (parsed.certifications) this.setItem(STORAGE_KEYS.CERTIFICATIONS, parsed.certifications);
      if (parsed.organizations) this.setItem(STORAGE_KEYS.ORGANIZATIONS, parsed.organizations);
      if (parsed.media) this.setItem(STORAGE_KEYS.MEDIA, parsed.media);
      return true;
    } catch (e) {
      console.error('Failed to import JSON', e);
      return false;
    }
  }

  resetToDefaults(): void {
    Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
  }
}

/**
 * Production-ready Supabase Content Store.
 * Directs all administrative CMS data operations to deployed Supabase Edge Functions.
 */
export class SupabaseContentStore implements IContentStore {
  readonly backendType = 'SUPABASE_BACKEND' as const;
  private localCache: LocalStorageContentStore;

  constructor() {
    this.localCache = new LocalStorageContentStore();
  }

  getProfile(): ProfileData {
    return this.localCache.getProfile();
  }

  saveProfile(data: ProfileData): void {
    ProfileSchema.parse(data);
    this.localCache.saveProfile(data);
    cmsApiClient.saveContentItem('profile', data).catch(err => {
      console.error('Failed to sync profile to Supabase backend:', err);
    });
  }

  getProjects(): ProjectData[] {
    return this.localCache.getProjects();
  }

  getProject(idOrSlug: string): ProjectData | undefined {
    return this.localCache.getProject(idOrSlug);
  }

  saveProject(data: ProjectData): void {
    ProjectSchema.parse(data);
    this.localCache.saveProject(data);
    cmsApiClient.saveContentItem('project', data).catch(err => {
      console.error('Failed to sync project to Supabase backend:', err);
    });
  }

  deleteProject(id: string): void {
    this.localCache.deleteProject(id);
    cmsApiClient.deleteContentItem('project', id).catch(err => {
      console.error('Failed to delete project from Supabase backend:', err);
    });
  }

  getResearch(): ResearchData[] {
    return this.localCache.getResearch();
  }

  getResearchItem(idOrSlug: string): ResearchData | undefined {
    return this.localCache.getResearchItem(idOrSlug);
  }

  saveResearch(data: ResearchData): void {
    ResearchSchema.parse(data);
    this.localCache.saveResearch(data);
    cmsApiClient.saveContentItem('research', data).catch(err => {
      console.error('Failed to sync research to Supabase backend:', err);
    });
  }

  deleteResearch(id: string): void {
    this.localCache.deleteResearch(id);
    cmsApiClient.deleteContentItem('research', id).catch(err => {
      console.error('Failed to delete research from Supabase backend:', err);
    });
  }

  getPublications(): PublicationData[] {
    return this.localCache.getPublications();
  }

  getPublication(idOrSlug: string): PublicationData | undefined {
    return this.localCache.getPublication(idOrSlug);
  }

  savePublication(data: PublicationData): void {
    PublicationSchema.parse(data);
    this.localCache.savePublication(data);
    cmsApiClient.saveContentItem('publication', data).catch(err => {
      console.error('Failed to sync publication to Supabase backend:', err);
    });
  }

  deletePublication(id: string): void {
    this.localCache.deletePublication(id);
    cmsApiClient.deleteContentItem('publication', id).catch(err => {
      console.error('Failed to delete publication from Supabase backend:', err);
    });
  }

  getPatents(): PatentData[] {
    return this.localCache.getPatents();
  }

  savePatent(data: PatentData): void {
    PatentSchema.parse(data);
    this.localCache.savePatent(data);
    cmsApiClient.saveContentItem('patent', data).catch(err => {
      console.error('Failed to sync patent to Supabase backend:', err);
    });
  }

  deletePatent(id: string): void {
    this.localCache.deletePatent(id);
    cmsApiClient.deleteContentItem('patent', id).catch(err => {
      console.error('Failed to delete patent from Supabase backend:', err);
    });
  }

  getExperience(): ExperienceData[] {
    return this.localCache.getExperience();
  }

  saveExperience(data: ExperienceData): void {
    ExperienceSchema.parse(data);
    this.localCache.saveExperience(data);
    cmsApiClient.saveContentItem('experience', data).catch(err => {
      console.error('Failed to sync experience to Supabase backend:', err);
    });
  }

  deleteExperience(id: string): void {
    this.localCache.deleteExperience(id);
    cmsApiClient.deleteContentItem('experience', id).catch(err => {
      console.error('Failed to delete experience from Supabase backend:', err);
    });
  }

  getSkills(): SkillData[] {
    return this.localCache.getSkills();
  }

  saveSkill(data: SkillData): void {
    SkillSchema.parse(data);
    this.localCache.saveSkill(data);
    cmsApiClient.saveContentItem('skill', data).catch(err => {
      console.error('Failed to sync skill to Supabase backend:', err);
    });
  }

  deleteSkill(id: string): void {
    this.localCache.deleteSkill(id);
    cmsApiClient.deleteContentItem('skill', id).catch(err => {
      console.error('Failed to delete skill from Supabase backend:', err);
    });
  }

  getBlogPosts(): BlogData[] {
    return this.localCache.getBlogPosts();
  }

  getBlogPost(idOrSlug: string): BlogData | undefined {
    return this.localCache.getBlogPost(idOrSlug);
  }

  saveBlogPost(data: BlogData): void {
    BlogSchema.parse(data);
    this.localCache.saveBlogPost(data);
    cmsApiClient.saveContentItem('blog', data).catch(err => {
      console.error('Failed to sync blog to Supabase backend:', err);
    });
  }

  deleteBlogPost(id: string): void {
    this.localCache.deleteBlogPost(id);
    cmsApiClient.deleteContentItem('blog', id).catch(err => {
      console.error('Failed to delete blog from Supabase backend:', err);
    });
  }

  getAchievements(): AchievementData[] {
    return this.localCache.getAchievements();
  }

  saveAchievement(data: AchievementData): void {
    AchievementSchema.parse(data);
    this.localCache.saveAchievement(data);
    cmsApiClient.saveContentItem('achievement', data).catch(err => {
      console.error('Failed to sync achievement to Supabase backend:', err);
    });
  }

  deleteAchievement(id: string): void {
    this.localCache.deleteAchievement(id);
    cmsApiClient.deleteContentItem('achievement', id).catch(err => {
      console.error('Failed to delete achievement from Supabase backend:', err);
    });
  }

  getCertifications(): CertificationData[] {
    return this.localCache.getCertifications();
  }

  saveCertification(data: CertificationData): void {
    CertificationSchema.parse(data);
    this.localCache.saveCertification(data);
    cmsApiClient.saveContentItem('certification', data).catch(err => {
      console.error('Failed to sync certification to Supabase backend:', err);
    });
  }

  deleteCertification(id: string): void {
    this.localCache.deleteCertification(id);
    cmsApiClient.deleteContentItem('certification', id).catch(err => {
      console.error('Failed to delete certification from Supabase backend:', err);
    });
  }

  getOrganizations(): OrganizationData[] {
    return this.localCache.getOrganizations();
  }

  saveOrganization(data: OrganizationData): void {
    OrganizationSchema.parse(data);
    this.localCache.saveOrganization(data);
    cmsApiClient.saveContentItem('organization', data).catch(err => {
      console.error('Failed to sync organization to Supabase backend:', err);
    });
  }

  deleteOrganization(id: string): void {
    this.localCache.deleteOrganization(id);
    cmsApiClient.deleteContentItem('organization', id).catch(err => {
      console.error('Failed to delete organization from Supabase backend:', err);
    });
  }

  getMedia(): MediaData[] {
    return this.localCache.getMedia();
  }

  saveMedia(data: MediaData): void {
    MediaSchema.parse(data);
    this.localCache.saveMedia(data);
    cmsApiClient.saveContentItem('media', data).catch(err => {
      console.error('Failed to sync media to Supabase backend:', err);
    });
  }

  deleteMedia(id: string): void {
    this.localCache.deleteMedia(id);
    cmsApiClient.deleteContentItem('media', id).catch(err => {
      console.error('Failed to delete media from Supabase backend:', err);
    });
  }

  getStats(): CMSStats {
    return this.localCache.getStats();
  }

  exportJSON(): string {
    return this.localCache.exportJSON();
  }

  importJSON(jsonString: string): boolean {
    return this.localCache.importJSON(jsonString);
  }

  resetToDefaults(): void {
    this.localCache.resetToDefaults();
  }
}

const CMS_BACKEND_MODE = (import.meta as any).env?.VITE_CMS_BACKEND || 'supabase';

// Default to SupabaseContentStore unless explicitly set to 'local'
export const contentStore: IContentStore =
  CMS_BACKEND_MODE === 'local' ? new LocalStorageContentStore() : new SupabaseContentStore();

