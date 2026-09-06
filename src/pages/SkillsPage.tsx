import React from 'react';
import { getProductionSkills } from '../generated/skills';
import { ShieldCheck } from 'lucide-react';

export const SkillsPage: React.FC = () => {
  const skills = getProductionSkills();

  const categories = [
    'Robotics & Control',
    'AI & ML',
    'Firmware & Embedded',
    'Hardware & Circuits',
    'Software & Tools',
  ] as const;

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
          Categorized engineering disciplines, algorithmic frameworks, middleware tooling, and verified technical proficiencies.
        </p>
      </div>

      {/* Categorized Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((cat, idx) => {
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
                        <span className="text-[11px] font-mono text-stone-500 uppercase">{s.level}</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        VERIFIED
                      </span>
                    </div>
                  ))}
                  {catSkills.length === 0 && (
                    <div className="text-xs text-stone-400 italic py-4 text-center">
                      No skills populated in this category.
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-paper-200 flex items-center gap-1 text-[10px] font-mono text-stone-400">
                <ShieldCheck className="w-3 h-3 text-ink-600" />
                <span>Verified through code artifacts</span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
