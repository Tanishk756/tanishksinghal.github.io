import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useThree } from '@react-three/fiber';
import { ProjectCaseStudy } from '../../../../types/content';
import { mapProjectCategoryToArchetype, VisualArchetype } from '../../core/types';
import { ArchetypeFactory } from '../../archetypes/ArchetypeFactory';

interface ProjectsZoneProps {
  projects: ProjectCaseStudy[];
  selectedProjectSlug?: string | null;
  onHoverProject?: (project: ProjectCaseStudy | null) => void;
  onSelectProject?: (project: ProjectCaseStudy) => void;
  reducedMotion?: boolean;
}

/**
 * Zone 05: Spatial Project Installations
 * 
 * Arranges authentic published Supabase project records into 3D spatial installations
 * with deterministic archetype mapping and responsive viewport framing.
 */
export const ProjectsZone: React.FC<ProjectsZoneProps> = ({
  projects,
  selectedProjectSlug = null,
  onHoverProject,
  onSelectProject,
  reducedMotion = false,
}) => {
  const navigate = useNavigate();
  const { viewport } = useThree();
  const isMobile = viewport.width < 5.0;

  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);

  const total = projects.length;
  const projectNodes = projects.map((project, idx) => {
    const archetype: VisualArchetype = mapProjectCategoryToArchetype(project.category);
    const spread = isMobile ? 1.35 : 2.2;
    const offset = total > 1 ? (idx - (total - 1) / 2) * spread : 0;
    const depthCurve = Math.abs(offset) * (isMobile ? 0.2 : 0.3);
    const x = offset;
    const y = 0.35;
    const z = -depthCurve;

    return {
      project,
      archetype,
      position: [x, y, z] as [number, number, number],
    };
  });

  return (
    <group position={[0.0, 0.0, -72.0]}>
      {/* Installation Boundary Ring on Floor */}
      <mesh position={[0, 0.003, -0.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[5.2, 5.22, 64]} />
        <meshBasicMaterial color="#e7e5e4" />
      </mesh>

      {/* Spatial Project Nodes */}
      {projectNodes.map(({ project, archetype, position }, idx) => {
        const isHovered = hoveredSlug === project.slug;
        const isSelected = selectedProjectSlug === project.slug;

        const handlePointerOver = (e: any) => {
          e.stopPropagation();
          setHoveredSlug(project.slug);
          if (onHoverProject) onHoverProject(project);
        };

        const handlePointerOut = () => {
          setHoveredSlug(null);
          if (onHoverProject) onHoverProject(null);
        };

        const handleClick = (e: any) => {
          e.stopPropagation();
          if (onSelectProject) {
            onSelectProject(project);
          } else {
            navigate(`/projects/${project.slug}`);
          }
        };

        return (
          <group
            key={project.id || project.slug || idx}
            position={position}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
            onClick={handleClick}
          >
            {/* 1. FLOOR PEDESTAL & COORDINATE RETICLE */}
            <group position={[0, -0.34, 0]}>
              <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[0.5, 32]} />
                <meshBasicMaterial
                  color={isHovered || isSelected ? '#c2410c' : '#f5f5f4'}
                  transparent
                  opacity={isHovered || isSelected ? 0.2 : 0.6}
                />
              </mesh>
              <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.5, 0.515, 32]} />
                <meshBasicMaterial color={isHovered || isSelected ? '#c2410c' : '#d6d3d1'} />
              </mesh>
              {/* Low-profile Pedestal Disc */}
              <mesh position={[0, 0.03, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[0.3, 0.35, 0.06, 24]} />
                <meshStandardMaterial
                  color={isHovered || isSelected ? '#292524' : '#1c1917'}
                  roughness={0.4}
                />
              </mesh>
            </group>

            {/* 2. DYNAMIC 3D ARCHETYPE */}
            <group position={[0, 0.05, 0]} scale={[isMobile ? 0.85 : 1.0, isMobile ? 0.85 : 1.0, isMobile ? 0.85 : 1.0]}>
              <ArchetypeFactory
                archetype={archetype}
                isHovered={isHovered}
                isSelected={isSelected}
                reducedMotion={reducedMotion}
              />
            </group>

            {/* 3. SUBTLE COORDINATE BEACON PIN */}
            <group position={[0, 0.65, 0]}>
              <mesh position={[0, 0, 0]}>
                <sphereGeometry args={[0.02, 12, 12]} />
                <meshBasicMaterial color={isHovered || isSelected ? '#c2410c' : '#78716c'} />
              </mesh>
            </group>
          </group>
        );
      })}
    </group>
  );
};
