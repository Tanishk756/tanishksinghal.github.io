import React from 'react';
import { usePublicContent } from '../context/PublicContentContext';
import { Microscope, LoaderCircle } from 'lucide-react';

export const ResearchPage: React.FC = () => {
  const { research: researchItems, isLoading, error } = usePublicContent();

  if (isLoading && researchItems.length === 0) {
    return (
      <div className="pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <LoaderCircle className="w-8 h-8 animate-spin text-stone-400" />
        <p className="text-xs font-mono text-stone-500 uppercase tracking-widest">Loading Research...</p>
      </div>
    );
  }

  if (error && researchItems.length === 0) {
    return (
      <div className="pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <h1 className="text-4xl font-display font-bold text-ink-900">Research Programs & Inquiries</h1>
        <p className="text-sm font-sans text-stone-600">Content temporarily unavailable.</p>
      </div>
    );
  }

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
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-6">
                  <div>
                    <span className="text-xs font-mono uppercase text-stone-500 tracking-wider block mb-2">
                      EXECUTIVE ABSTRACT
                    </span>
                    <p className="text-sm text-ink-700 font-sans leading-relaxed">
                      {prog.summary}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs font-mono uppercase text-stone-500 tracking-wider block mb-2">
                      METHODOLOGICAL TOPOLOGY
                    </span>
                    <p className="text-xs sm:text-sm text-ink-600 font-sans leading-relaxed">
                      {prog.methodology}
                    </p>
                  </div>
                </div>

                <div className="lg:col-span-4 p-6 rounded-2xl bg-paper-100 border border-paper-300 space-y-4">
                  <span className="text-xs font-mono uppercase text-stone-500 tracking-wider block">
                    KEY CONTRIBUTIONS
                  </span>
                  <ul className="space-y-2 text-xs text-ink-700 font-sans">
                    {contributions.map((c, cIdx) => (
                      <li key={cIdx} className="flex items-start gap-2">
                        <span className="text-stone-400">•</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
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
            <h3 className="text-xl font-display font-bold text-ink-900">Research Inquiry Ledger</h3>
            <p className="text-xs sm:text-sm text-ink-600 font-sans leading-relaxed">
              Active research programs and technical formulation notes will be published here upon verification.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
