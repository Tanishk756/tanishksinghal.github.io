import React from 'react';
import { getProductionExperience } from '../content/experience';
import { ShieldCheck } from 'lucide-react';

export const ExperiencePage: React.FC = () => {
  const experiences = getProductionExperience();

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
        {experiences.filter(e => ['EMPLOYMENT', 'INTERNSHIP', 'CONTRACT', 'FOUNDER'].includes(e.type)).length > 0 && (
          <div className="space-y-8">
            <h2 className="text-xs font-mono text-stone-500 uppercase tracking-widest pb-2 border-b border-paper-400">
              PROFESSIONAL & INDUSTRY PRACTICE
            </h2>
            <div className="space-y-12">
              {experiences.filter(e => ['EMPLOYMENT', 'INTERNSHIP', 'CONTRACT', 'FOUNDER'].includes(e.type)).map((exp) => (
                <div key={exp.id} className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-paper-300 last:border-0">
                  <div className="md:col-span-4 space-y-2">
                    <span className="text-3xl sm:text-4xl font-serifDisplay italic text-ink-900 block">
                      {exp.startDate} {exp.endDate ? `— ${exp.endDate}` : '— Present'}
                    </span>
                    <span className="text-xs font-mono text-stone-500 uppercase tracking-wider block">
                      {exp.location ? `${exp.location}${exp.workMode ? ` · ${exp.workMode}` : ''}` : exp.domain || exp.type}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-ink-700">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>{exp.verificationStatus}</span>
                    </span>
                  </div>
                  <div className="md:col-span-8 space-y-4">
                    <div>
                      <h3 className="text-2xl font-display font-bold text-ink-900">{exp.role}</h3>
                      <h4 className="text-base font-serifDisplay italic text-ink-700">{exp.organization}</h4>
                    </div>
                    {((Array.isArray(exp.description) && exp.description.length > 0) || (typeof exp.description === 'string' && exp.description.length > 0)) && (
                      <div className="space-y-2 text-sm text-ink-700 font-sans leading-relaxed">
                        {Array.isArray(exp.description) ? (
                          exp.description.map((p, pIdx) => <p key={pIdx}>{p}</p>)
                        ) : (
                          <p>{exp.description}</p>
                        )}
                      </div>
                    )}
                    {exp.technologies && exp.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {exp.technologies.map((t, tIdx) => (
                          <span key={tIdx} className="text-[11px] font-mono px-2.5 py-0.5 rounded-lg bg-paper-100 text-ink-700 border border-paper-300">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. Leadership, Community & Research */}
        {experiences.filter(e => !['EMPLOYMENT', 'INTERNSHIP', 'CONTRACT', 'FOUNDER'].includes(e.type)).length > 0 && (
          <div className="space-y-8">
            <h2 className="text-xs font-mono text-stone-500 uppercase tracking-widest pb-2 border-b border-paper-400">
              LEADERSHIP, TECHNICAL COMMUNITIES & RESEARCH
            </h2>
            <div className="space-y-12">
              {experiences.filter(e => !['EMPLOYMENT', 'INTERNSHIP', 'CONTRACT', 'FOUNDER'].includes(e.type)).map((exp) => (
                <div key={exp.id} className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-paper-300 last:border-0">
                  <div className="md:col-span-4 space-y-2">
                    <span className="text-3xl sm:text-4xl font-serifDisplay italic text-ink-900 block">
                      {exp.startDate} {exp.endDate ? `— ${exp.endDate}` : '— Present'}
                    </span>
                    <span className="text-xs font-mono text-stone-500 uppercase tracking-wider block">
                      {exp.type}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-ink-700">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>{exp.verificationStatus}</span>
                    </span>
                  </div>
                  <div className="md:col-span-8 space-y-4">
                    <div>
                      <h3 className="text-2xl font-display font-bold text-ink-900">{exp.role}</h3>
                      <h4 className="text-base font-serifDisplay italic text-ink-700">{exp.organization}</h4>
                    </div>
                    <div className="space-y-2 text-sm text-ink-700 font-sans leading-relaxed">
                      {Array.isArray(exp.description) ? (
                        exp.description.map((p, pIdx) => <p key={pIdx}>{p}</p>)
                      ) : (
                        <p>{exp.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {experiences.length === 0 && (
          <div className="p-16 text-center rounded-3xl bg-white border border-paper-400 text-xs font-mono text-stone-500 space-y-2">
            <div>Professional experience records are currently under verification.</div>
            <div className="text-[11px] text-stone-400">Canonical records will be populated upon direct owner confirmation.</div>
          </div>
        )}
      </div>

    </div>
  );
};
