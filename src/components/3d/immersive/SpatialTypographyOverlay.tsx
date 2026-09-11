import React from 'react';
import { Link } from 'react-router-dom';
import { WORLD_ZONES } from './cameraTimeline';
import { ProjectCaseStudy, Profile } from '../../../types/content';
import { ArrowRight, ArrowUpRight, Github, Linkedin, Mail, FileText } from 'lucide-react';

interface SpatialTypographyOverlayProps {
  scrollProgress: number;
  profile?: Profile | null;
  hoveredProject?: ProjectCaseStudy | null;
  selectedProject?: ProjectCaseStudy | null;
  onClearSelectedProject?: () => void;
  onJumpToZone?: (zoneIndex: number) => void;
}

/**
 * Spatial Typography Overlay
 * 
 * Renders monumental, clean editorial typography synchronized to the 3D camera timeline.
 * Responsive typography scaling gracefully across Desktop, Tablet, and Mobile.
 */
export const SpatialTypographyOverlay: React.FC<SpatialTypographyOverlayProps> = ({
  scrollProgress,
  profile: _profile,
  hoveredProject = null,
  selectedProject = null,
  onClearSelectedProject,
  onJumpToZone,
}) => {
  const getZoneOpacity = (start: number, end: number) => {
    const fadeWindow = 0.04;
    if (scrollProgress < start - fadeWindow || scrollProgress > end + fadeWindow) return 0;
    if (scrollProgress < start) return (scrollProgress - (start - fadeWindow)) / fadeWindow;
    if (scrollProgress > end) return (end + fadeWindow - scrollProgress) / fadeWindow;
    return 1;
  };

  const heroOpacity = getZoneOpacity(WORLD_ZONES[0].progressStart, WORLD_ZONES[0].progressEnd);
  const roboticsOpacity = getZoneOpacity(WORLD_ZONES[1].progressStart, WORLD_ZONES[1].progressEnd);
  const autonomyOpacity = getZoneOpacity(WORLD_ZONES[2].progressStart, WORLD_ZONES[2].progressEnd);
  const aerospaceOpacity = getZoneOpacity(WORLD_ZONES[3].progressStart, WORLD_ZONES[3].progressEnd);
  const researchOpacity = getZoneOpacity(WORLD_ZONES[4].progressStart, WORLD_ZONES[4].progressEnd);
  const projectsOpacity = getZoneOpacity(WORLD_ZONES[5].progressStart, WORLD_ZONES[5].progressEnd);
  const contactOpacity = getZoneOpacity(WORLD_ZONES[6].progressStart, WORLD_ZONES[6].progressEnd);

  const activeProject = selectedProject || hoveredProject;

  return (
    <div className="fixed inset-0 pointer-events-none z-10 flex flex-col justify-between p-4 sm:p-10 lg:p-14">
      
      {/* 1. TOP HEADER / BRAND IDENTITY */}
      <header className="flex items-center justify-between w-full max-w-7xl mx-auto pointer-events-auto">
        <Link
          to="/"
          className="group flex items-center gap-2 text-ink-900 hover:text-ink-600 transition-colors"
          onClick={() => onJumpToZone && onJumpToZone(0)}
        >
          <span className="w-2 h-2 rounded-full bg-ink-900 group-hover:bg-terracotta transition-colors" />
          <span className="font-mono text-[11px] sm:text-xs font-semibold tracking-widest uppercase">
            TANISHK SINGHAL
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-3 sm:gap-6 text-[10px] sm:text-xs font-mono text-stone-600">
          <Link
            to="/about"
            className="hidden sm:inline-block hover:text-ink-900 transition-colors uppercase tracking-wider underline underline-offset-4"
          >
            Biography
          </Link>
          <Link
            to="/projects"
            className="hover:text-ink-900 transition-colors uppercase tracking-wider underline underline-offset-4"
          >
            Projects
          </Link>
          <Link
            to="/research"
            className="hidden sm:inline-block hover:text-ink-900 transition-colors uppercase tracking-wider underline underline-offset-4"
          >
            Research
          </Link>
          <Link
            to="/contact"
            className="hover:text-ink-900 transition-colors uppercase tracking-wider underline underline-offset-4"
          >
            Contact
          </Link>
        </div>
      </header>

      {/* 2. DYNAMIC SPATIAL NARRATIVE SECTIONS */}
      <div className="relative w-full max-w-7xl mx-auto flex-1 flex items-center my-auto">
        
        {/* --- ZONE 00: OPENING HERO --- */}
        {heroOpacity > 0.01 && (
          <div
            style={{
              opacity: heroOpacity,
              transform: `translateY(${(1 - heroOpacity) * -20}px)`,
            }}
            className="w-full flex flex-col items-center text-center space-y-3 pointer-events-auto transition-transform duration-100 ease-out mt-4 sm:mt-8 mb-auto"
          >
            {/* Monumental Headline with clean visual field */}
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold tracking-tight text-ink-900 uppercase leading-none">
                TANISHK SINGHAL
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-ink-700 font-serifDisplay italic tracking-normal max-w-xl mx-auto">
                Robotics Researcher & Autonomous Systems Engineer
              </p>
            </div>
          </div>
        )}

        {/* --- ZONE 01: ROBOTICS & MANIPULATION --- */}
        {roboticsOpacity > 0.01 && (
          <div
            style={{
              opacity: roboticsOpacity,
              transform: `translateY(${(1 - roboticsOpacity) * 20}px)`,
            }}
            className="space-y-3 sm:space-y-4 max-w-md pointer-events-auto transition-transform duration-100 ease-out bg-paper-50/85 sm:bg-transparent backdrop-blur-xs sm:backdrop-blur-none p-4 sm:p-0 rounded-2xl sm:rounded-none border border-paper-300/50 sm:border-none shadow-xs sm:shadow-none"
          >
            <span className="text-[11px] font-mono text-terracotta uppercase tracking-widest block font-semibold">
              Robotics & Manipulation
            </span>
            <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-ink-900 tracking-tight leading-none">
              Kinematics & Articulation
            </h2>
            <p className="text-xs sm:text-sm text-ink-600 font-sans leading-relaxed">
              Closed-loop inverse kinematics, multi-axis serial arm trajectory generation, precision joint control, and real-time actuator telemetry.
            </p>
            <div className="pt-1">
              <Link
                to="/projects"
                className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-ink-900 hover:text-terracotta uppercase tracking-wider"
              >
                <span>View Robotics Projects</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* --- ZONE 02: AUTONOMOUS SYSTEMS --- */}
        {autonomyOpacity > 0.01 && (
          <div
            style={{
              opacity: autonomyOpacity,
              transform: `translateY(${(1 - autonomyOpacity) * 20}px)`,
            }}
            className="space-y-3 sm:space-y-4 max-w-md ml-auto mr-0 sm:mr-12 text-right pointer-events-auto transition-transform duration-100 ease-out bg-paper-50/85 sm:bg-transparent backdrop-blur-xs sm:backdrop-blur-none p-4 sm:p-0 rounded-2xl sm:rounded-none border border-paper-300/50 sm:border-none shadow-xs sm:shadow-none"
          >
            <span className="text-[11px] font-mono text-terracotta uppercase tracking-widest block font-semibold">
              Autonomous Systems
            </span>
            <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-ink-900 tracking-tight leading-none">
              ROS 2 & Nav2 Autonomy
            </h2>
            <p className="text-xs sm:text-sm text-ink-600 font-sans leading-relaxed">
              Differential-drive platforms, real-time LiDAR SLAM, costmap layer fusion, dynamic obstacle avoidance, and global waypoint planning.
            </p>
            <div className="pt-1 flex justify-end">
              <Link
                to="/projects"
                className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-ink-900 hover:text-terracotta uppercase tracking-wider"
              >
                <span>Explore Autonomy Work</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* --- ZONE 03: AEROSPACE & SPACE --- */}
        {aerospaceOpacity > 0.01 && (
          <div
            style={{
              opacity: aerospaceOpacity,
              transform: `translateY(${(1 - aerospaceOpacity) * 20}px)`,
            }}
            className="space-y-3 sm:space-y-4 max-w-md pointer-events-auto transition-transform duration-100 ease-out bg-paper-50/85 sm:bg-transparent backdrop-blur-xs sm:backdrop-blur-none p-4 sm:p-0 rounded-2xl sm:rounded-none border border-paper-300/50 sm:border-none shadow-xs sm:shadow-none"
          >
            <span className="text-[11px] font-mono text-terracotta uppercase tracking-widest block font-semibold">
              Aerospace & Space Systems
            </span>
            <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-ink-900 tracking-tight leading-none">
              UAV Avionics & CubeSat
            </h2>
            <p className="text-xs sm:text-sm text-ink-600 font-sans leading-relaxed">
              Autonomous quadrotor flight control, target pursuit kinematics, and modular 3U CubeSat satellite power architecture and telemetry subsystems.
            </p>
            <div className="pt-1">
              <Link
                to="/projects"
                className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-ink-900 hover:text-terracotta uppercase tracking-wider"
              >
                <span>View Aerospace Case Studies</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* --- ZONE 04: SYSTEMS & RESEARCH --- */}
        {researchOpacity > 0.01 && (
          <div
            style={{
              opacity: researchOpacity,
              transform: `translateY(${(1 - researchOpacity) * 20}px)`,
            }}
            className="space-y-3 sm:space-y-4 max-w-md mx-auto text-center pointer-events-auto transition-transform duration-100 ease-out"
          >
            <span className="text-[11px] font-mono text-terracotta uppercase tracking-widest block font-semibold">
              Systems Architecture & Research
            </span>
            <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-ink-900 tracking-tight leading-none">
              Perception-to-Action
            </h2>
            <p className="text-xs sm:text-sm text-ink-600 font-sans leading-relaxed max-w-md mx-auto">
              Perception-to-action sensor fusion, edge AI/ML tensor acceleration, and rigorous hardware-in-the-loop validation frameworks.
            </p>
            <div className="pt-1 flex justify-center">
              <Link
                to="/research"
                className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-ink-900 hover:text-terracotta uppercase tracking-wider"
              >
                <span>Explore Research Programs</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* --- ZONE 05: FEATURED PROJECTS --- */}
        {projectsOpacity > 0.01 && (
          <div
            style={{
              opacity: projectsOpacity,
              transform: `translateY(${(1 - projectsOpacity) * 20}px)`,
            }}
            className="w-full pointer-events-auto flex flex-col items-center text-center space-y-3 transition-transform duration-100 ease-out mt-4 sm:mt-6 mb-auto"
          >
            <div className="space-y-1">
              <span className="text-[11px] font-mono text-terracotta uppercase tracking-widest block font-semibold">
                Featured Engineering Work
              </span>
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-display font-extrabold text-ink-900 tracking-tight">
                Authentic Case Studies
              </h2>
              <p className="text-[11px] sm:text-xs font-mono text-stone-500">
                Select an engineering project to inspect details
              </p>
            </div>

            {/* Contextual Minimal Placard when a project is hovered or clicked */}
            {activeProject && (
              <div className="w-full max-w-md p-5 sm:p-6 rounded-2xl bg-white/95 backdrop-blur-md border border-paper-400 shadow-editorial text-left space-y-2.5 transition-all animate-fade-in mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] sm:text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-paper-200 border border-paper-300 text-ink-800 uppercase font-medium">
                    {activeProject.category}
                  </span>
                  <span className="text-[10px] font-mono text-terracotta uppercase font-bold">
                    ● {activeProject.status}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-display font-bold text-ink-900">
                  {activeProject.title}
                </h3>
                {activeProject.tagline && (
                  <p className="text-xs sm:text-sm font-serifDisplay italic text-ink-700">
                    "{activeProject.tagline}"
                  </p>
                )}
                <div className="pt-2 flex items-center justify-between border-t border-paper-200">
                  <Link
                    to={`/projects/${activeProject.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-ink-900 hover:text-terracotta uppercase tracking-wider"
                  >
                    <span>View Case Study</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  {onClearSelectedProject && selectedProject && (
                    <button
                      onClick={onClearSelectedProject}
                      className="text-[10px] font-mono text-stone-400 hover:text-ink-900 uppercase"
                    >
                      Deselect
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- ZONE 06: CONTACT & COLLABORATION --- */}
        {contactOpacity > 0.01 && (
          <div
            style={{
              opacity: contactOpacity,
              transform: `translateY(${(1 - contactOpacity) * 20}px)`,
            }}
            className="space-y-4 sm:space-y-6 max-w-lg mx-auto text-center pointer-events-auto transition-transform duration-100 ease-out"
          >
            <span className="text-[11px] font-mono text-terracotta uppercase tracking-widest block font-bold">
              Contact & Inquiries
            </span>
            <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-ink-900 tracking-tight leading-none">
              Initiate Collaboration
            </h2>
            <p className="text-xs sm:text-sm text-ink-600 font-sans leading-relaxed">
              Available for advanced robotics research programs, autonomous system engineering, embedded hardware design, and academic inquiries.
            </p>

            {/* Verified Direct Channels */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-ink-900 text-paper-100 hover:bg-ink-800 text-xs font-sans font-semibold tracking-wide uppercase transition-all shadow-sm"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Send Message</span>
              </Link>
              <a
                href="https://github.com/Tanishk756"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white/90 border border-paper-400 text-ink-800 hover:bg-paper-100 text-xs font-mono uppercase tracking-wider transition-all"
              >
                <Github className="w-3.5 h-3.5" />
                <span>GitHub</span>
              </a>
              <a
                href="https://www.linkedin.com/in/tanishk-singhal"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white/90 border border-paper-400 text-ink-800 hover:bg-paper-100 text-xs font-mono uppercase tracking-wider transition-all"
              >
                <Linkedin className="w-3.5 h-3.5" />
                <span>LinkedIn</span>
              </a>
              <Link
                to="/resume"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white/90 border border-paper-400 text-ink-800 hover:bg-paper-100 text-xs font-mono uppercase tracking-wider transition-all"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>CV / Resume</span>
              </Link>
            </div>
          </div>
        )}

      </div>

      {/* 3. BOTTOM FOOTER BAR & SCROLL PROMPT */}
      <footer className="flex items-center justify-between w-full max-w-7xl mx-auto pointer-events-auto text-[10px] sm:text-[11px] font-mono text-stone-500">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-terracotta animate-ping" />
          <span>PORTFOLIO PROGRESS: {Math.round(scrollProgress * 100)}%</span>
        </div>

        {scrollProgress < 0.1 && (
          <div className="flex items-center gap-1.5 text-ink-900 animate-bounce">
            <span className="uppercase tracking-widest text-[10px] font-bold">Scroll to Explore</span>
            <span>↓</span>
          </div>
        )}

        <div className="hidden sm:flex items-center gap-4">
          <span>New Delhi, India</span>
        </div>
      </footer>
    </div>
  );
};
