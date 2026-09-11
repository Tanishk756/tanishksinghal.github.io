import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { usePublicContent } from '../../../context/PublicContentContext';
import { ProjectCaseStudy } from '../../../types/content';
import { ImmersiveCanvas } from './ImmersiveCanvas';
import { SpatialTypographyOverlay } from './SpatialTypographyOverlay';
import { SpatialNavIndex } from './SpatialNavIndex';
import { WORLD_ZONES } from './cameraTimeline';
import { ArrowUpRight, Mail, Github, Linkedin, FileText } from 'lucide-react';

/**
 * Checks if WebGL is available in the current browser/device environment.
 */
function isWebGLSupported(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

/**
 * True Immersive 3D Engineering Portfolio World
 * 
 * The WebGL world owns the viewport on the homepage. Scroll choreography
 * physically flies the camera through an engineered universe of robotics,
 * autonomy, aerospace, research, and live project installations.
 * Includes quiet editorial loading and graceful non-WebGL fallback.
 */
export const ImmersiveWorld: React.FC = () => {
  const { profile, projects, isLoading, error } = usePublicContent();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hoveredProject, setHoveredProject] = useState<ProjectCaseStudy | null>(null);
  const [selectedProject, setSelectedProject] = useState<ProjectCaseStudy | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [webGLAvailable, setWebGLAvailable] = useState<boolean | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Check WebGL availability on mount
  useEffect(() => {
    setWebGLAvailable(isWebGLSupported());
  }, []);

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
      // Don't intercept when typing in inputs/textareas
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      const keyNum = parseInt(e.key, 10);
      if (!isNaN(keyNum) && keyNum >= 0 && keyNum < WORLD_ZONES.length) {
        jumpToZone(keyNum);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [jumpToZone]);

  // Clean cursor on unmount
  useEffect(() => {
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, []);

  // Quiet editorial loading state
  if (isLoading && !profile && projects.length === 0) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#fbfaf7] space-y-4">
        <div className="w-6 h-6 border-2 border-stone-300 border-t-stone-800 rounded-full animate-spin" />
        <span className="text-[11px] font-mono text-stone-500 uppercase tracking-widest">
          Loading Portfolio
        </span>
      </div>
    );
  }

  // Network / server error state
  if (error && !profile && projects.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fbfaf7] px-4 text-center space-y-4">
        <h1 className="text-3xl font-display font-bold text-ink-900">Tanishk Singhal</h1>
        <p className="text-sm font-sans text-stone-600">Engineering archive temporarily unavailable. Please try refreshing.</p>
        <Link to="/contact" className="text-xs font-mono text-terracotta underline uppercase tracking-wider">
          Contact Directly
        </Link>
      </div>
    );
  }

  // WebGL Fallback layout if device / browser does not support WebGL
  if (webGLAvailable === false) {
    return (
      <div className="min-h-screen bg-[#fbfaf7] text-ink-900 px-6 sm:px-12 py-16 max-w-5xl mx-auto space-y-16">
        <header className="flex items-center justify-between border-b border-stone-300/60 pb-6">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-ink-900" />
            <span className="font-mono text-xs font-bold uppercase tracking-widest">TANISHK SINGHAL</span>
          </div>
          <nav className="flex items-center gap-6 text-xs font-mono text-stone-600">
            <Link to="/about" className="hover:text-ink-900 uppercase underline">Biography</Link>
            <Link to="/projects" className="hover:text-ink-900 uppercase underline">Projects</Link>
            <Link to="/research" className="hover:text-ink-900 uppercase underline">Research</Link>
            <Link to="/contact" className="hover:text-ink-900 uppercase underline">Contact</Link>
          </nav>
        </header>

        <section className="space-y-4 max-w-2xl">
          <h1 className="text-4xl sm:text-6xl font-display font-extrabold tracking-tight uppercase leading-none">
            TANISHK SINGHAL
          </h1>
          <p className="text-lg font-serifDisplay italic text-ink-700">
            {profile?.headline || 'Robotics Researcher & Autonomous Systems Engineer'}
          </p>
          <p className="text-sm text-stone-600 leading-relaxed">
            {profile?.shortBio || 'Specializing in robotics manipulation, ROS 2 autonomous navigation, aerospace avionics, and real-time control.'}
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-xs font-mono uppercase tracking-widest text-terracotta font-bold">
            Engineering Projects Archive
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((p) => (
              <Link
                key={p.id}
                to={`/projects/${p.slug}`}
                className="group p-6 bg-white rounded-2xl border border-stone-200/80 hover:border-stone-400 transition-all space-y-3"
              >
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-stone-500 uppercase">{p.category}</span>
                  <span className="text-terracotta uppercase font-semibold">● {p.status}</span>
                </div>
                <h3 className="text-lg font-display font-bold text-ink-900 group-hover:text-terracotta transition-colors flex items-center justify-between">
                  <span>{p.title}</span>
                  <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                {p.tagline && <p className="text-xs text-stone-600 line-clamp-2">{p.tagline}</p>}
              </Link>
            ))}
          </div>
        </section>

        <footer className="pt-12 border-t border-stone-300/60 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-stone-500">
          <span>Tanishk Singhal — tanishksinghal.in</span>
          <div className="flex items-center gap-4">
            <a href="https://github.com/Tanishk756" target="_blank" rel="noreferrer" className="hover:text-ink-900 flex items-center gap-1">
              <Github className="w-3.5 h-3.5" /> GitHub
            </a>
            <a href="https://www.linkedin.com/in/tanishk-singhal" target="_blank" rel="noreferrer" className="hover:text-ink-900 flex items-center gap-1">
              <Linkedin className="w-3.5 h-3.5" /> LinkedIn
            </a>
            <Link to="/contact" className="hover:text-ink-900 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5" /> Contact
            </Link>
            <Link to="/resume" className="hover:text-ink-900 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" /> Resume
            </Link>
          </div>
        </footer>
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
