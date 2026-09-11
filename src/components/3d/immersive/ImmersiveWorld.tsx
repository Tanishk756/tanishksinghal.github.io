import React, { useState, useEffect, useRef, useCallback } from 'react';
import { usePublicContent } from '../../../context/PublicContentContext';
import { ProjectCaseStudy } from '../../../types/content';
import { ImmersiveCanvas } from './ImmersiveCanvas';
import { SpatialTypographyOverlay } from './SpatialTypographyOverlay';
import { SpatialNavIndex } from './SpatialNavIndex';
import { WORLD_ZONES } from './cameraTimeline';
import { LoaderCircle } from 'lucide-react';

/**
 * True Immersive 3D Engineering Portfolio World
 * 
 * The WebGL world owns the viewport on the homepage. Scroll choreography
 * physically flies the camera through an engineered universe of robotics,
 * autonomy, aerospace, research, and live project installations.
 */
export const ImmersiveWorld: React.FC = () => {
  const { profile, projects, isLoading, error } = usePublicContent();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hoveredProject, setHoveredProject] = useState<ProjectCaseStudy | null>(null);
  const [selectedProject, setSelectedProject] = useState<ProjectCaseStudy | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Check reduced motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Window scroll handler
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? Math.min(1, Math.max(0, scrollY / maxScroll)) : 0;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Mouse move handler for damped parallax
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;
    setMousePos({ x, y });
  }, []);

  // Smooth jump to zone
  const jumpToZone = useCallback((zoneIndex: number) => {
    const zone = WORLD_ZONES[zoneIndex];
    if (!zone) return;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const targetY = zone.progressStart * maxScroll;
    window.scrollTo({
      top: targetY,
      behavior: 'smooth',
    });
  }, []);

  // Keyboard zone navigation (keys 0..6)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keyNum = parseInt(e.key, 10);
      if (!isNaN(keyNum) && keyNum >= 0 && keyNum < WORLD_ZONES.length) {
        jumpToZone(keyNum);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [jumpToZone]);

  if (isLoading && !profile && projects.length === 0) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-paper-100 space-y-4">
        <LoaderCircle className="w-8 h-8 animate-spin text-stone-400" />
        <span className="text-xs font-mono text-stone-500 uppercase tracking-widest">
          INITIALIZING 3D WORLD ARCHITECTURE...
        </span>
      </div>
    );
  }

  if (error && !profile && projects.length === 0) {
    return (
      <div className="pt-32 pb-24 max-w-7xl mx-auto px-4 text-center space-y-4">
        <h1 className="text-3xl font-display font-bold text-ink-900">Engineering Portfolio</h1>
        <p className="text-sm font-sans text-stone-600">Content temporarily unavailable.</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full bg-[#fbfaf7]"
    >
      {/* 1. FIXED FULL-SCREEN THREE.JS WEBGL CANVAS */}
      <ImmersiveCanvas
        scrollProgress={scrollProgress}
        projects={projects}
        selectedProjectSlug={selectedProject?.slug || null}
        onHoverProject={setHoveredProject}
        onSelectProject={setSelectedProject}
        mousePos={mousePos}
        reducedMotion={prefersReducedMotion}
      />

      {/* 2. SPATIAL EDITORIAL TYPOGRAPHY OVERLAY */}
      <SpatialTypographyOverlay
        scrollProgress={scrollProgress}
        profile={profile}
        hoveredProject={hoveredProject}
        selectedProject={selectedProject}
        onClearSelectedProject={() => setSelectedProject(null)}
        onJumpToZone={jumpToZone}
      />

      {/* 3. MINIMAL FLOATING SPATIAL INDEX */}
      <SpatialNavIndex
        scrollProgress={scrollProgress}
        onJumpToZone={jumpToZone}
      />

      {/* 4. SCROLL DRIVE TRACK (Invisible container creating natural scroll height) */}
      <div className="w-full h-[700vh] pointer-events-none" aria-hidden="true" />

      {/* 5. ACCESSIBLE SEMANTIC HTML CONTENT FOR SCREEN READERS & SEO */}
      <div className="sr-only">
        <h1>Tanishk Singhal — Robotics & Autonomous Systems</h1>
        <p>{profile?.headline || 'Robotics researcher and systems engineer'}</p>
        <h2>Spatial Engineering Zones</h2>
        {WORLD_ZONES.map((zone) => (
          <section key={zone.id}>
            <h3>{zone.title}</h3>
            <h4>{zone.subtitle}</h4>
            <p>{zone.description}</p>
          </section>
        ))}
        <h2>Published Project Case Studies</h2>
        <ul>
          {projects.map((p) => (
            <li key={p.id}>
              <a href={`/projects/${p.slug}`}>
                {p.title} — {p.category} ({p.status})
              </a>
              <p>{p.tagline}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
