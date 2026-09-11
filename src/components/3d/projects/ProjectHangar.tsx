import React, { useState, useCallback, useMemo } from 'react';
import { ProjectCaseStudy } from '../../../types/content';
import { SceneManager } from '../core/SceneManager';
import { ZonePortalCard } from '../core/ZonePortalCard';
import { ProjectHangarScene } from './ProjectHangarScene';
import { RotateCcw, Compass } from 'lucide-react';

interface ProjectHangarProps {
  projects: ProjectCaseStudy[];
  className?: string;
  onSelectProject?: (project: ProjectCaseStudy | null) => void;
}

/**
 * 3D Interactive Projects Gallery & Engineering Hangar Container
 * 
 * Top-level component rendering the 3D project discovery workspace over
 * live Supabase dataset records with responsive camera controls and zone overlays.
 */
export const ProjectHangar: React.FC<ProjectHangarProps> = ({
  projects,
  className = '',
  onSelectProject,
}) => {
  const [selectedProject, setSelectedProject] = useState<ProjectCaseStudy | null>(null);
  const [hoveredProjectId, setHoveredProjectId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Extract available unique categories from actual live records
  const categories = useMemo(() => {
    const cats = new Set(projects.map((p) => p.category).filter(Boolean));
    return ['all', ...Array.from(cats)];
  }, [projects]);

  // Filter projects if category is selected
  const filteredProjects = useMemo(() => {
    if (selectedCategory === 'all') return projects;
    return projects.filter((p) => p.category === selectedCategory);
  }, [projects, selectedCategory]);

  const handleSelect = useCallback(
    (project: ProjectCaseStudy | null) => {
      setSelectedProject(project);
      if (onSelectProject) onSelectProject(project);
    },
    [onSelectProject]
  );

  const handleHover = useCallback((id: string | null) => {
    setHoveredProjectId(id);
  }, []);

  // Active project for contextual inspection card
  const activeProject = useMemo(() => {
    if (selectedProject) return selectedProject;
    if (hoveredProjectId) return projects.find((p) => p.id === hoveredProjectId) || null;
    return null;
  }, [selectedProject, hoveredProjectId, projects]);

  const inspectorPayload = useMemo(() => {
    if (!activeProject) return null;
    return {
      id: activeProject.id,
      title: activeProject.title,
      category: activeProject.category,
      description: activeProject.tagline || activeProject.problem?.slice(0, 140) + '...',
      routeUrl: `/projects/${activeProject.slug}`,
      actionLabel: 'EXPLORE CASE STUDY',
      specs: activeProject.subcategories?.slice(0, 3) || [],
    };
  }, [activeProject]);

  return (
    <div
      className={`relative flex flex-col justify-between w-full h-full min-h-[460px] sm:min-h-[520px] rounded-3xl bg-white border border-paper-400 shadow-editorial overflow-hidden select-none ${className}`}
      role="region"
      aria-label="3D Interactive Engineering Project Hangar"
    >
      {/* 1. EDITORIAL WORKSPACE HEADER & FILTER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-3.5 border-b border-paper-300 bg-white/80 backdrop-blur-sm gap-3 z-10">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-terracotta animate-pulse" />
          <span className="text-xs font-mono font-bold tracking-wider text-ink-900 uppercase">
            ENGINEERING SYSTEMS HANGAR // 3D WORKSPACE
          </span>
        </div>

        {/* Category Filters & Camera Reset */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <div className="flex items-center gap-1.5 p-0.5 rounded-xl bg-paper-100 border border-paper-300">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setSelectedProject(null);
                }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-all ${
                  selectedCategory === cat
                    ? 'bg-ink-900 text-paper-100 font-semibold shadow-xs'
                    : 'text-stone-500 hover:text-ink-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {selectedProject && (
            <button
              onClick={() => handleSelect(null)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-paper-200 border border-paper-400 hover:bg-paper-300 text-ink-900 text-[10px] font-mono uppercase tracking-wider transition-colors"
              aria-label="Return camera to hangar overview"
            >
              <RotateCcw className="w-3 h-3 text-terracotta" />
              <span>RETURN TO HANGAR</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. REAL THREE.JS / R3F 3D CANVAS */}
      <div className="relative flex-1 w-full h-full min-h-[360px]">
        <SceneManager
          className="w-full h-full"
          cameraPosition={[0, 2.8, 3.9]}
          cameraFov={36}
          fallbackTitle="Engineering Systems Archive"
          fallbackSubtitle="WebGL acceleration unavailable. Use the technical monographs ledger below."
          ariaLabel="3D Engineering Systems Hangar"
        >
          <ProjectHangarScene
            projects={filteredProjects}
            selectedProject={selectedProject}
            hoveredProjectId={hoveredProjectId}
            onSelect={handleSelect}
            onHover={handleHover}
            reducedMotion={false}
          />
        </SceneManager>

        {/* 3. CONTEXTUAL PROJECT INSPECTION & DISCOVERY OVERLAY */}
        <ZonePortalCard
          payload={inspectorPayload}
          onClose={() => handleSelect(null)}
        />
      </div>

      {/* 4. SUBTLE EDITORIAL FOOTER METADATA */}
      <div className="px-6 py-2.5 border-t border-paper-300 bg-paper-100/60 flex items-center justify-between text-[10px] font-mono text-stone-500">
        <div className="flex items-center gap-2">
          <Compass className="w-3 h-3 text-terracotta" />
          <span>STATIONS: {filteredProjects.length} ACTIVE WORKBENCHES</span>
        </div>
        <span className="hidden sm:inline-block">
          CLICK STATION TO FOCUS // HOVER TO PREVIEW // VIEW MONOGRAPH TO READ
        </span>
      </div>
    </div>
  );
};
