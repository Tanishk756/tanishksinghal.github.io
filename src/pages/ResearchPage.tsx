import React from 'react';
import { getProductionResearch } from '../generated/research';
import { ArrowUpRight, ShieldCheck, Microscope } from 'lucide-react';

export const ResearchPage: React.FC = () => {
  const productionResearch = getProductionResearch();
  const researchItems = Array.isArray(productionResearch)
    ? productionResearch.filter(Boolean)
    : [];

  return (
    <div className="pt-24 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      
      {/* Editorial Header */}
      <div className="space-y-4 pb-8 border-b border-paper-400">
        <div className="inline-flex items-center gap-2 text-xs font-mono text-stone-500 uppercase tracking-widest">
          <span>CATALOGUE // 02</span>
          <span>·</span>
          <span>RESEARCH PROGRAMS</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-display font-extrabold text-ink-900 tracking-tight">
          Research Programs & Inquiries
        </h1>
        <p className="text-base sm:text-lg text-ink-600 font-serifDisplay italic max-w-2xl">
          Investigating continuous heading error models, multi-agent pursuit dynamics, real-time telemetry pipelines, and computational perception.
        </p>
      </div>

      {/* Research Ledger Archive */}
      <div className="space-y-12">
        {researchItems.map((prog, idx) => {
          const contributions = (Array.isArray(prog.contributions) ? prog.contributions : [])
            .filter((c): c is string => typeof c === 'string' && c.trim().length > 0);

          return (
            <div
              key={prog.id || idx}
              className="p-8 sm:p-12 rounded-3xl bg-white border border-paper-400 shadow-editorial space-y-8"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-paper-300 gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-3xl sm:text-4xl font-serifDisplay italic text-stone-400">
                    0{idx + 1}
                  </span>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-display font-bold text-ink-900">
                      {prog.title}
                    </h2>
                    <span className="text-xs font-mono text-stone-500 uppercase tracking-wider">
                      {prog.domain} {prog.dateRange ? `· ${prog.dateRange}` : ''}
                    </span>
                  </div>
                </div>

                {prog.verificationStatus && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-paper-100 border border-paper-300 text-[11px] font-mono text-ink-800">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{prog.verificationStatus}</span>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8 space-y-6">
                  {prog.summary && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono uppercase text-stone-500 font-bold block">
                        EXECUTIVE SUMMARY
                      </span>
                      <p className="text-sm text-ink-700 font-sans leading-relaxed">
                        {prog.summary}
                      </p>
                    </div>
                  )}

                  {prog.methodology && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono uppercase text-stone-500 font-bold block">
                        METHODOLOGY & EXPERIMENTAL FORMULATION
                      </span>
                      <p className="text-xs sm:text-sm text-ink-600 font-sans leading-relaxed">
                        {prog.methodology}
                      </p>
                    </div>
                  )}
                </div>

                <div className="lg:col-span-4 p-6 rounded-2xl bg-paper-100 border border-paper-300 space-y-4">
                  <span className="text-[10px] font-mono uppercase text-stone-500 font-bold block">
                    KEY CONTRIBUTIONS & BENCHMARKS
                  </span>
                  {contributions.length > 0 ? (
                    <ul className="space-y-2 text-xs text-ink-800 font-sans leading-relaxed">
                      {contributions.map((c, cIdx) => (
                        <li key={cIdx} className="flex items-start gap-2">
                          <span className="text-stone-400">•</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-xs text-stone-500 italic">Contributions recorded in experimental notes.</div>
                  )}

                  {prog.sourceUrl && (
                    <div className="pt-2 border-t border-paper-200">
                      <a
                        href={prog.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-mono text-ink-900 font-medium"
                      >
                        <span>Repository Reference</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {researchItems.length === 0 && (
          <div className="p-16 rounded-3xl bg-white border border-paper-400 shadow-editorial text-center space-y-4 max-w-2xl mx-auto">
            <div className="w-10 h-10 rounded-full bg-paper-200 border border-paper-300 flex items-center justify-center mx-auto text-ink-800">
              <Microscope className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-display font-bold text-ink-900">Research Programs Registry</h3>
            <p className="text-xs sm:text-sm text-ink-600 font-sans leading-relaxed">
              Formal research inquiries, algorithmic kinematic formulation programs, and experimental benchmarks will be catalogued here once verified.
            </p>
            <div className="text-[11px] font-mono text-stone-400 uppercase pt-2">
              CANONICAL RESEARCH ARCHIVE
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

