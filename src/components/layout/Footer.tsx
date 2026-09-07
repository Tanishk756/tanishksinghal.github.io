import React from 'react';
import { Link } from 'react-router-dom';
import { Github, ArrowUp } from 'lucide-react';
import { profileData } from '../../generated/profile';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-paper-200 border-t border-paper-400 text-xs font-sans text-ink-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        
        {/* Main Footer Sitemap Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-14 border-b border-paper-400">
          
          {/* Identity & Scope (2 cols) */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <span className="font-sans font-bold text-base tracking-tight text-ink-900">
                {profileData.fullName.toUpperCase()}
              </span>
            </div>

            <p className="text-ink-600 text-xs leading-relaxed font-sans max-w-sm font-light">
              Autonomous robotics researcher and systems engineer. Specializing in ROS 2 node architecture, algorithmic path planning, closed-loop kinematics, and edge predictive intelligence.
            </p>
          </div>

          {/* Systems & Engineering */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-semibold text-ink-900 uppercase tracking-widest-tech">
              Systems
            </h4>
            <ul className="space-y-2 text-ink-600">
              <li>
                <Link to="/projects" className="hover:text-ink-900 transition-colors">
                  Engineering Projects
                </Link>
              </li>
              <li>
                <Link to="/skills" className="hover:text-ink-900 transition-colors">
                  Skills & Competencies
                </Link>
              </li>
              <li>
                <Link to="/experience" className="hover:text-ink-900 transition-colors">
                  Engineering Timeline
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-ink-900 transition-colors">
                  About & Philosophy
                </Link>
              </li>
            </ul>
          </div>

          {/* Research & Intellectual Property */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-semibold text-ink-900 uppercase tracking-widest-tech">
              Research & IP
            </h4>
            <ul className="space-y-2 text-ink-600">
              <li>
                <Link to="/research" className="hover:text-ink-900 transition-colors">
                  Research Programs
                </Link>
              </li>
              <li>
                <Link to="/publications" className="hover:text-ink-900 transition-colors">
                  Publications
                </Link>
              </li>
              <li>
                <Link to="/patents" className="hover:text-ink-900 transition-colors">
                  Patents & Filings
                </Link>
              </li>
              <li>
                <Link to="/achievements" className="hover:text-ink-900 transition-colors">
                  Achievements
                </Link>
              </li>
              <li>
                <Link to="/certifications" className="hover:text-ink-900 transition-colors">
                  Certifications
                </Link>
              </li>
            </ul>
          </div>

          {/* Verified Channels */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-semibold text-ink-900 uppercase tracking-widest-tech">
              Channels
            </h4>
            <ul className="space-y-2 text-ink-600">
              <li>
                <Link to="/contact" className="hover:text-ink-900 transition-colors">
                  Direct Dispatch
                </Link>
              </li>
              <li>
                <Link to="/resume" className="hover:text-ink-900 transition-colors">
                  Curriculum Vitae
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-ink-900 transition-colors">
                  Engineering Notebook
                </Link>
              </li>
              <li>
                <a
                  href={profileData.socials.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-ink-900 transition-colors inline-flex items-center gap-1"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>GitHub @Tanishk756</span>
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Metadata & Datum Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-stone-500">
          <div className="flex flex-wrap items-center gap-3">
            <span>© {new Date().getFullYear()} TANISHK SINGHAL</span>
            <span className="opacity-40">/</span>
            <span>ALL RIGHTS RESERVED</span>
            <span className="opacity-40">/</span>
            <span className="text-stone-600">tanishksinghal.in</span>
          </div>

          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-paper-300 text-ink-700 hover:text-ink-950 border border-paper-400 transition-colors shadow-sm"
            title="Return to top"
          >
            <span>RETURN TO TOP</span>
            <ArrowUp className="w-3 h-3" />
          </button>
        </div>

      </div>
    </footer>
  );
};


