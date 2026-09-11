import React from 'react';
import { ProjectCaseStudy } from '../../../types/content';
import { mapProjectCategoryToArchetype } from '../core/types';
import { ArchetypeFactory } from '../archetypes/ArchetypeFactory';
import { metalJointMaterial, terracottaMaterial, highlightMaterial, shellMaterial } from '../core/materials';

interface ProjectStationProps {
  project: ProjectCaseStudy;
  position: [number, number, number];
  isHovered: boolean;
  isSelected: boolean;
  reducedMotion: boolean;
  onHover: (id: string | null) => void;
  onSelect: (project: ProjectCaseStudy) => void;
}

/**
 * 3D Project Workbench Station
 * 
 * Individual architectural pedestal in the engineering hangar hosting a project's
 * 3D visual archetype, coordinate ring, and raycast hit boundary.
 */
export const ProjectStation: React.FC<ProjectStationProps> = ({
  project,
  position,
  isHovered,
  isSelected,
  reducedMotion,
  onHover,
  onSelect,
}) => {
  const archetype = mapProjectCategoryToArchetype(project.category);

  return (
    <group
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(project.id);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onHover(null);
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(project);
      }}
    >
      {/* 1. WORKBENCH PEDESTAL PLATFORM */}
      <mesh position={[0, 0.05, 0]} material={isSelected ? highlightMaterial : (isHovered ? terracottaMaterial : shellMaterial)} receiveShadow castShadow>
        <cylinderGeometry args={[0.75, 0.82, 0.1, 32]} />
      </mesh>

      {/* Pedestal Coordinate Accent Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.105, 0]}>
        <ringGeometry args={[0.7, 0.74, 32]} />
        <meshBasicMaterial color={isSelected ? '#ea580c' : (isHovered ? '#c2410c' : '#8c827a')} />
      </mesh>

      {/* 2. STATION INDEX PLAQUE CYLINDER */}
      <mesh position={[0, 0.02, 0.8]} material={metalJointMaterial}>
        <boxGeometry args={[0.28, 0.04, 0.08]} />
      </mesh>

      {/* 3. DYNAMIC PROJECT 3D ARCHETYPE */}
      <group position={[0, 0.1, 0]}>
        <ArchetypeFactory
          archetype={archetype}
          isHovered={isHovered}
          isSelected={isSelected}
          reducedMotion={reducedMotion}
          scale={1.05}
        />
      </group>
    </group>
  );
};
