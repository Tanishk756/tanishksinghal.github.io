import React from 'react';
import { usePublicContent } from '../context/PublicContentContext';
import { SKILL_CATEGORIES } from '../constants/skills';
import { LoaderCircle } from 'lucide-react';

export const SkillsPage: React.FC = () => {
  const { skills, isLoading, error } = usePublicContent();


  if (isLoading && skills.length === 0) {
    return (
      <div className="pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <LoaderCircle className="w-8 h-8 animate-spin text-stone-400" />
        <p className="text-xs font-mono text-stone-500 uppercase tracking-widest">Loading Competencies...</p>
      </div>
    );
  }

  if (error && skills.length === 0) {
    return (
      <div className="pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <h1 className="text-4xl font-display font-bold text-ink-900">Competencies & Tools</h1>
        <p className="text-sm font-sans text-stone-600">Content temporarily unavailable.</p>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      
      {/* Editorial Header */}
      <div className="space-y-4 pb-8 border-b border-paper-400">
        <div className="inline-flex items-center gap-2 text-xs font-mono text-stone-500 uppercase tracking-widest">
          <span>CATALOGUE // 06</span>
          <span>·</span>
          <span>DISCIPLINE TAXONOMY</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-display font-extrabold text-ink-900 tracking-tight">
          Competencies & Tools
        </h1>
        <p className="text-base sm:text-lg text-ink-600 font-serifDisplay italic max-w-2xl">
          Categorized engineering disciplines, algorithmic frameworks, middleware tooling, and technical proficiencies.
        </p>
      </div>

      {/* Categorized Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {SKILL_CATEGORIES.map((cat, idx) => {
          const catSkills = skills.filter((s) => s.category === cat);

          return (
            <div
              key={cat}
              className="p-8 rounded-3xl bg-white border border-paper-400 shadow-editorial space-y-6 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-paper-300">
                  <span className="text-xs font-mono text-stone-500 uppercase">
                    0{idx + 1} // {cat}
                  </span>
                  <span className="text-xs font-mono text-ink-800">
                    ({catSkills.length})
                  </span>
                </div>

                <div className="space-y-3">
                  {catSkills.map((s, sIdx) => (
                    <div
                      key={sIdx}
                      className="p-3 rounded-xl bg-paper-100 border border-paper-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-ink-900 block">{s.name}</span>
                        <span className="text-[11px] font-mono text-stone-500">
                          {s.subdiscipline || (s as any).description || s.level || 'General'}
                        </span>
                      </div>
                    </div>
                  ))}
                  {catSkills.length === 0 && (
                    <div className="text-xs text-stone-400 italic py-4 text-center">
                      No skills populated in this category.
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
