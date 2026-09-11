import React, { useMemo } from 'react';
import { ProjectCaseStudy } from '../../../types/content';
import { EngineeringEnvironment } from '../core/EngineeringEnvironment';
import { CameraDirector } from '../core/CameraDirector';
import { ProjectStation } from './ProjectStation';

interface ProjectHangarSceneProps {
  projects: ProjectCaseStudy[];
  selectedProject: ProjectCaseStudy | null;
  hoveredProjectId: string | null;
  onSelect: (project: ProjectCaseStudy | null) => void;
  onHover: (id: string | null) => void;
  reducedMotion: boolean;
}

/**
 * 3D Project Hangar Scene Composition
 * 
 * Arranges dynamic project stations across the engineering floor with
 * camera focus tracking and coordinate environment primitives.
 */
export const ProjectHangarScene: React.FC<ProjectHangarSceneProps> = ({
  projects,
  selectedProject,
  hoveredProjectId,
  onSelect,
  onHover,
  reducedMotion,
}) => {
  // Compute spatial station positions in an open semicircle / workbench row
  const stationLayouts = useMemo(() => {
    const total = projects.length;
    if (total === 0) return [];
    if (total === 1) return [{ x: 0, z: 0 }];

    const radius = Math.min(1.9 + total * 0.25, 3.0);
    const startAngle = -Math.PI * 0.52;
    const endAngle = Math.PI * 0.52;
    const angleStep = (endAngle - startAngle) / Math.max(total - 1, 1);

    return projects.map((_, i) => {
      const angle = startAngle + i * angleStep;
      return {
        x: Math.sin(angle) * radius,
        z: -Math.cos(angle) * radius * 0.65 + 0.2,
      };
    });
  }, [projects]);

  // Selected station position for camera focus
  const selectedIndex = selectedProject
    ? projects.findIndex((p) => p.id === selectedProject.id)
    : -1;
  const focusTarget: [number, number, number] | null =
    selectedIndex >= 0 && stationLayouts[selectedIndex]
      ? [stationLayouts[selectedIndex].x, 0.4, stationLayouts[selectedIndex].z]
      : null;

  return (
    <>
      {/* 1. SHARED ENGINEERING ENVIRONMENT & COORDINATE GRID */}
      <EngineeringEnvironment gridSize={14} gridDivisions={42} showTrajectory={false} />

      {/* 2. GLOBAL CAMERA DIRECTOR */}
      <CameraDirector
        zone="world-hub"
        focusTarget={focusTarget}
        enableZoom={false}
        reducedMotion={reducedMotion}
        autoRotate={!selectedProject && !hoveredProjectId}
        autoRotateSpeed={0.25}
      />

      {/* 3. DYNAMIC PROJECT WORKBENCH STATIONS */}
      {projects.map((project, idx) => {
        const layout = stationLayouts[idx] || { x: 0, z: 0 };
        return (
          <ProjectStation
            key={project.id || idx}
            project={project}
            position={[layout.x, 0, layout.z]}
            isHovered={hoveredProjectId === project.id}
            isSelected={selectedProject?.id === project.id}
            reducedMotion={reducedMotion}
            onHover={onHover}
            onSelect={onSelect}
          />
        );
      })}
    </>
  );
};
