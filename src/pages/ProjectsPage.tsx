import React, { Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { usePublicContent } from '../context/PublicContentContext';
import { ArrowRight, ArrowUpRight, FolderGit2, LoaderCircle } from 'lucide-react';

const LazyProjectHangar = lazy(() =>
  import('../components/3d/projects/ProjectHangar').then((m) => ({ default: m.ProjectHangar }))
);

export const ProjectsPage: React.FC = () => {
  const { projects, isLoading, error } = usePublicContent();

  if (isLoading && projects.length === 0) {
    return (
      <div className="pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <LoaderCircle className="w-8 h-8 animate-spin text-stone-400" />
        <p className="text-xs font-mono text-stone-500 uppercase tracking-widest">Loading Projects...</p>
      </div>
    );
  }

  if (error && projects.length === 0) {
    return (
      <div className="pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <h1 className="text-3xl font-display font-bold text-ink-900">Engineering Case Studies</h1>
        <p className="text-sm font-sans text-stone-600">Content temporarily unavailable.</p>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      
      {/* Editorial Header */}
      <div className="space-y-4 pb-8 border-b border-paper-400">
        <div className="inline-flex items-center gap-2 text-xs font-mono text-stone-500 uppercase tracking-widest">
          <span>CATALOGUE // 01</span>
          <span>·</span>
          <span>SYSTEMS ARCHIVE</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-display font-extrabold text-ink-900 tracking-tight">
          Engineering Case Studies
        </h1>
        <p className="text-base sm:text-lg text-ink-600 font-serifDisplay italic max-w-2xl">
          Detailed technical monographs formulating problem statements, subsystem topologies, root-cause resolutions, and verified implementations.
        </p>
      </div>

      {/* 3D Interactive Project Hangar Discovery Layer */}
      {projects.length > 0 && (
        <section aria-label="Interactive 3D Project Discovery Hangar" className="w-full">
          <Suspense
            fallback={
              <div className="w-full min-h-[460px] sm:min-h-[520px] rounded-3xl bg-white border border-paper-400 p-8 flex flex-col items-center justify-center space-y-3">
                <LoaderCircle className="w-6 h-6 animate-spin text-stone-400" />
                <span className="text-xs font-mono text-stone-500 uppercase tracking-wider">
                  INITIALIZING 3D PROJECT WORKSPACE...
                </span>
              </div>
            }
          >
            <LazyProjectHangar projects={projects} />
          </Suspense>
        </section>
      )}

      {/* Case Studies Rhythmic Ledger */}
      <div className="space-y-12">
        {projects.map((project, idx) => {
          const subcategories = (Array.isArray(project.subcategories) ? project.subcategories : [])
            .filter((s): s is string => typeof s === 'string' && s.trim().length > 0);

          return (
            <div
              key={project.id || idx}
              className="p-8 sm:p-12 rounded-3xl bg-white border border-paper-400 shadow-editorial hover:shadow-editorial-hover transition-all duration-300 space-y-8"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-paper-300 gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-3xl sm:text-4xl font-serifDisplay italic text-stone-400">
                    0{idx + 1}
                  </span>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-display font-bold text-ink-900">
                      {project.title}
                    </h2>
                    <span className="text-xs font-mono text-stone-500 uppercase tracking-wider">
                      {project.category} · {project.startDate}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8 space-y-4">
                  <p className="text-sm sm:text-base text-ink-700 font-sans leading-relaxed">
                    {project.tagline}
                  </p>
                  <p className="text-xs text-ink-600 font-sans leading-relaxed">
                    {project.problem}
                  </p>

                  {/* Subcategories tags */}
                  {subcategories.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {subcategories.map((sub, sIdx) => (
                        <span
                          key={sIdx}
                          className="text-[11px] font-mono px-2.5 py-0.5 rounded-lg bg-paper-100 text-ink-700 border border-paper-300"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="lg:col-span-4 p-5 rounded-2xl bg-paper-100 border border-paper-300 space-y-3">
                  <div className="text-[11px] font-mono uppercase text-stone-500 tracking-wider">
                    ROLE & METHODOLOGY
                  </div>
                  <div className="text-xs font-sans text-ink-800 font-medium">
                    {project.role}
                  </div>
                  <div className="pt-3 border-t border-paper-200 flex flex-col gap-2">
                    <Link
                      to={`/projects/${project.slug}`}
                      className="inline-flex items-center justify-between px-4 py-2 rounded-xl bg-ink-900 text-paper-100 hover:bg-ink-800 text-xs font-sans font-medium uppercase tracking-wider transition-colors"
                    >
                      <span>Read Monograph</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-between px-4 py-1.5 text-xs font-mono text-ink-600 hover:text-ink-900"
                      >
                        <span>Repository ↗</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {projects.length === 0 && (
          <div className="p-16 rounded-3xl bg-white border border-paper-400 shadow-editorial text-center space-y-4 max-w-2xl mx-auto">
            <div className="w-10 h-10 rounded-full bg-paper-200 border border-paper-300 flex items-center justify-center mx-auto text-ink-800">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-display font-bold text-ink-900">Systems & Projects Archive</h3>
            <p className="text-xs sm:text-sm text-ink-600 font-sans leading-relaxed">
              Curated engineering case studies and robotics monographs will be indexed here.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
