import React from 'react';
import { usePublicContent } from '../context/PublicContentContext';
import { Briefcase, LoaderCircle } from 'lucide-react';

export const ExperiencePage: React.FC = () => {
  const { experience: experiences, isLoading, error } = usePublicContent();

  if (isLoading && experiences.length === 0) {
    return (
      <div className="pt-32 pb-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <LoaderCircle className="w-8 h-8 animate-spin text-stone-400" />
        <p className="text-xs font-mono text-stone-500 uppercase tracking-widest">Loading Experience...</p>
      </div>
    );
  }

  if (error && experiences.length === 0) {
    return (
      <div className="pt-32 pb-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <h1 className="text-4xl font-display font-bold text-ink-900">Engineering Chronology</h1>
        <p className="text-sm font-sans text-stone-600">Content temporarily unavailable.</p>
      </div>
    );
  }

  const normalizeDesc = (desc: any): string[] => {
    if (!desc) return [];
    if (Array.isArray(desc)) {
      return desc.filter((p): p is string => typeof p === 'string' && p.trim().length > 0 && p !== '[]' && p !== 'null');
    }
    if (typeof desc === 'string') {
      const trimmed = desc.trim();
      if (trimmed === '[]' || trimmed === 'null' || trimmed.length === 0) return [];
      return [trimmed];
    }
    return [];
  };

  const industryRoles = experiences.filter(e => ['EMPLOYMENT', 'INTERNSHIP', 'CONTRACT', 'FOUNDER'].includes(e.type));
  const leadershipRoles = experiences.filter(e => !['EMPLOYMENT', 'INTERNSHIP', 'CONTRACT', 'FOUNDER'].includes(e.type));

  return (
    <div className="pt-24 pb-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      
      {/* Editorial Header */}
      <div className="space-y-4 pb-8 border-b border-paper-400">
        <div className="inline-flex items-center gap-2 text-xs font-mono text-stone-500 uppercase tracking-widest">
          <span>CATALOGUE // 05</span>
          <span>·</span>
          <span>CHRONOLOGY</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-display font-extrabold text-ink-900 tracking-tight">
          Engineering Chronology
        </h1>
        <p className="text-base sm:text-lg text-ink-600 font-serifDisplay italic max-w-2xl">
          Verified research roles, systems engineering responsibilities, and institutional practice.
        </p>
      </div>

      {/* Chronology Content */}
      <div className="space-y-16">
        {/* 1. Professional & Industry Roles */}
        {industryRoles.length > 0 && (
          <div className="space-y-8">
            <h2 className="text-xs font-mono text-stone-500 uppercase tracking-widest pb-2 border-b border-paper-400">
              PROFESSIONAL & INDUSTRY PRACTICE
            </h2>
            <div className="space-y-12">
              {industryRoles.map((exp, idx) => {
                const descList = normalizeDesc(exp.description);
                const techList = (Array.isArray(exp.technologies) ? exp.technologies : [])
                  .filter((t): t is string => typeof t === 'string' && t.trim().length > 0);

                return (
                  <div key={exp.id || idx} className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-paper-300 last:border-0">
                    <div className="md:col-span-4 space-y-2">
                      <span className="text-3xl sm:text-4xl font-serifDisplay italic text-ink-900 block">
                        {exp.startDate || ''} {exp.endDate ? `— ${exp.endDate}` : '— Present'}
                      </span>
                      <span className="text-xs font-mono text-stone-500 uppercase tracking-wider block">
                        {exp.location ? `${exp.location}${exp.workMode ? ` · ${exp.workMode}` : ''}` : exp.domain || exp.type}
                      </span>
                    </div>
                    <div className="md:col-span-8 space-y-4">
                      <div>
                        <h3 className="text-2xl font-display font-bold text-ink-900">{exp.role}</h3>
                        <h4 className="text-base font-serifDisplay italic text-ink-700">{exp.organization}</h4>
                      </div>
                      {descList.length > 0 && (
                        <div className="space-y-2 text-sm text-ink-700 font-sans leading-relaxed">
                          {descList.map((p, pIdx) => (
                            <p key={pIdx}>{p}</p>
                          ))}
                        </div>
                      )}
                      {techList.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {techList.map((t, tIdx) => (
                            <span key={tIdx} className="text-[11px] font-mono px-2.5 py-0.5 rounded-lg bg-paper-100 text-ink-700 border border-paper-300">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. Leadership, Community & Research */}
        {leadershipRoles.length > 0 && (
          <div className="space-y-8">
            <h2 className="text-xs font-mono text-stone-500 uppercase tracking-widest pb-2 border-b border-paper-400">
              LEADERSHIP, TECHNICAL COMMUNITIES & RESEARCH
            </h2>
            <div className="space-y-12">
              {leadershipRoles.map((exp, idx) => {
                const descList = normalizeDesc(exp.description);
                const techList = (Array.isArray(exp.technologies) ? exp.technologies : [])
                  .filter((t): t is string => typeof t === 'string' && t.trim().length > 0);

                return (
                  <div key={exp.id || idx} className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-paper-300 last:border-0">
                    <div className="md:col-span-4 space-y-2">
                      <span className="text-3xl sm:text-4xl font-serifDisplay italic text-ink-900 block">
                        {exp.startDate || ''} {exp.endDate ? `— ${exp.endDate}` : '— Present'}
                      </span>
                      <span className="text-xs font-mono text-stone-500 uppercase tracking-wider block">
                        {exp.type}
                      </span>
                    </div>
                    <div className="md:col-span-8 space-y-4">
                      <div>
                        <h3 className="text-2xl font-display font-bold text-ink-900">{exp.role}</h3>
                        <h4 className="text-base font-serifDisplay italic text-ink-700">{exp.organization}</h4>
                      </div>
                      {descList.length > 0 && (
                        <div className="space-y-2 text-sm text-ink-700 font-sans leading-relaxed">
                          {descList.map((p, pIdx) => (
                            <p key={pIdx}>{p}</p>
                          ))}
                        </div>
                      )}
                      {techList.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {techList.map((t, tIdx) => (
                            <span key={tIdx} className="text-[11px] font-mono px-2.5 py-0.5 rounded-lg bg-paper-100 text-ink-700 border border-paper-300">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {experiences.length === 0 && (
          <div className="p-16 rounded-3xl bg-white border border-paper-400 shadow-editorial text-center space-y-4 max-w-2xl mx-auto">
            <div className="w-10 h-10 rounded-full bg-paper-200 border border-paper-300 flex items-center justify-center mx-auto text-ink-800">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-display font-bold text-ink-900">Engineering Chronology Archive</h3>
            <p className="text-xs sm:text-sm text-ink-600 font-sans leading-relaxed">
              Professional experience, robotics engineering practice, and institutional research appointments will appear here.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
