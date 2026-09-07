import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
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
import { publicContentClient, PublicDataset } from '../cms/publicContentClient';

export interface PublicContentContextValue {
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
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  getProjectBySlug: (slug: string) => ProjectCaseStudy | undefined;
  getBlogPostBySlug: (slug: string) => BlogPost | undefined;
  getPublicationBySlug: (slug: string) => PublicationItem | undefined;
  getPatentBySlug: (slug: string) => PatentItem | undefined;
}

const PublicContentContext = createContext<PublicContentContextValue | null>(null);

export const PublicContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dataset, setDataset] = useState<PublicDataset>(() => publicContentClient.getEmptyDataset());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadContent = useCallback(async (forceRefresh = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await publicContentClient.fetchAllPublicContent(forceRefresh);
      if (res.success) {
        setDataset(res.data);
      } else {
        setError(res.error || 'Content temporarily unavailable.');
      }
    } catch {
      setError('Content temporarily unavailable.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContent(false);
  }, [loadContent]);

  const refresh = useCallback(async () => {
    await loadContent(true);
  }, [loadContent]);

  const getProjectBySlug = useCallback((slug: string) => {
    return dataset.projects.find(p => p.slug === slug || p.id === slug);
  }, [dataset.projects]);

  const getBlogPostBySlug = useCallback((slug: string) => {
    return dataset.blogPosts.find(b => b.slug === slug || b.id === slug);
  }, [dataset.blogPosts]);

  const getPublicationBySlug = useCallback((slug: string) => {
    return dataset.publications.find(p => p.slug === slug || p.id === slug);
  }, [dataset.publications]);

  const getPatentBySlug = useCallback((slug: string) => {
    return dataset.patents.find(p => p.slug === slug || p.id === slug);
  }, [dataset.patents]);

  const value = useMemo<PublicContentContextValue>(() => ({
    profile: dataset.profile,
    projects: dataset.projects,
    experience: dataset.experience,
    research: dataset.research,
    publications: dataset.publications,
    patents: dataset.patents,
    skills: dataset.skills,
    education: dataset.education,
    organizations: dataset.organizations,
    certifications: dataset.certifications,
    achievements: dataset.achievements,
    blogPosts: dataset.blogPosts,
    isLoading,
    error,
    refresh,
    getProjectBySlug,
    getBlogPostBySlug,
    getPublicationBySlug,
    getPatentBySlug,
  }), [
    dataset,
    isLoading,
    error,
    refresh,
    getProjectBySlug,
    getBlogPostBySlug,
    getPublicationBySlug,
    getPatentBySlug,
  ]);

  return (
    <PublicContentContext.Provider value={value}>
      {children}
    </PublicContentContext.Provider>
  );
};

export const usePublicContent = (): PublicContentContextValue => {
  const context = useContext(PublicContentContext);
  if (!context) {
    throw new Error('usePublicContent must be used within a PublicContentProvider');
  }
  return context;
};
