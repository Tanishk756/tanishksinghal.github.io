import React from 'react';
import { Canvas } from '@react-three/fiber';
import { ProjectCaseStudy } from '../../../types/content';
import { ImmersiveEnvironment } from './ImmersiveEnvironment';
import { ImmersiveCameraRig } from './ImmersiveCameraRig';
import { HeroZone } from './zones/HeroZone';
import { RoboticsZone } from './zones/RoboticsZone';
import { AutonomyZone } from './zones/AutonomyZone';
import { AerospaceZone } from './zones/AerospaceZone';
import { ResearchZone } from './zones/ResearchZone';
import { ProjectsZone } from './zones/ProjectsZone';
import { ContactZone } from './zones/ContactZone';

interface ImmersiveCanvasProps {
  scrollProgress: number;
  projects: ProjectCaseStudy[];
  selectedProjectSlug?: string | null;
  onHoverProject?: (project: ProjectCaseStudy | null) => void;
  onSelectProject?: (project: ProjectCaseStudy) => void;
  mousePos?: { x: number; y: number };
  reducedMotion?: boolean;
}

export const ImmersiveCanvas: React.FC<ImmersiveCanvasProps> = ({
  scrollProgress,
  projects,
  selectedProjectSlug = null,
  onHoverProject,
  onSelectProject,
  mousePos = { x: 0, y: 0 },
  reducedMotion = false,
}) => {
  return (
    <div className="fixed inset-0 w-full h-full pointer-events-auto z-0 select-none">
      <Canvas
        shadows
        camera={{ position: [0, 1.25, 4.5], fov: 38, near: 0.1, far: 120 }}
        dpr={typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 1.5) : 1}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          alpha: false,
        }}
        onCreated={({ gl }) => {
          gl.setClearColor('#fbfaf7', 1);
        }}
      >
        {/* 1. CAMERA RIG WITH SCROLL-DRIVEN TIMELINE */}
        <ImmersiveCameraRig
          scrollProgress={scrollProgress}
          mousePos={mousePos}
          reducedMotion={reducedMotion}
        />

        {/* 2. ARCHITECTURAL ENVIRONMENT & LIGHTING */}
        <ImmersiveEnvironment />

        {/* 3. CONTINUOUS SPATIAL ENGINEERING ZONES */}
        <HeroZone reducedMotion={reducedMotion} />
        <RoboticsZone reducedMotion={reducedMotion} />
        <AutonomyZone reducedMotion={reducedMotion} />
        <AerospaceZone reducedMotion={reducedMotion} />
        <ResearchZone reducedMotion={reducedMotion} />
        <ProjectsZone
          projects={projects}
          selectedProjectSlug={selectedProjectSlug}
          onHoverProject={onHoverProject}
          onSelectProject={onSelectProject}
          reducedMotion={reducedMotion}
        />
        <ContactZone reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  );
};
