import React from 'react';
import { usePublicContent } from '../context/PublicContentContext';
import { Info, LoaderCircle } from 'lucide-react';

export const AchievementsPage: React.FC = () => {
  const { achievements, isLoading, error } = usePublicContent();

  if (isLoading && achievements.length === 0) {
    return (
      <div className="pt-32 pb-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <LoaderCircle className="w-8 h-8 animate-spin text-stone-400" />
        <p className="text-xs font-mono text-stone-500 uppercase tracking-widest">Loading Achievements...</p>
      </div>
    );
  }

  if (error && achievements.length === 0) {
    return (
      <div className="pt-32 pb-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <h1 className="text-4xl font-display font-bold text-ink-900">Honors & Achievements</h1>
        <p className="text-sm font-sans text-stone-600">Content temporarily unavailable.</p>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      
      {/* Editorial Header */}
      <div className="space-y-4 pb-8 border-b border-paper-400">
        <div className="inline-flex items-center gap-2 text-xs font-mono text-stone-500 uppercase tracking-widest">
          <span>CATALOGUE // 07</span>
          <span>·</span>
          <span>HONORS & RECOGNITIONS</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-display font-extrabold text-ink-900 tracking-tight">
          Honors & Achievements
        </h1>
        <p className="text-base sm:text-lg text-ink-600 font-serifDisplay italic max-w-2xl">
          Verified academic recognitions, hackathons, and robotics competition awards.
        </p>
      </div>

      {/* Archive Ledger */}
      <div className="space-y-8">
        {achievements.map((ach, idx) => (
          <div
            key={ach.id || idx}
            className="p-8 sm:p-10 rounded-3xl bg-white border border-paper-400 shadow-editorial space-y-3"
          >
            <div className="flex items-center justify-between pb-3 border-b border-paper-300">
              <span className="text-xs font-mono text-stone-500 uppercase">
                HONOR 0{idx + 1} · {ach.category.toUpperCase()} · {ach.date}
              </span>
            </div>

            <h2 className="text-2xl font-display font-bold text-ink-900">{ach.title}</h2>
            <div className="text-xs font-mono text-stone-600">Awarded by: {ach.organization}</div>
            <p className="text-xs sm:text-sm text-ink-600 font-sans leading-relaxed">{ach.description}</p>
          </div>
        ))}

        {achievements.length === 0 && (
          <div className="p-16 rounded-3xl bg-white border border-paper-400 shadow-editorial text-center space-y-4 max-w-2xl mx-auto">
            <div className="w-10 h-10 rounded-full bg-paper-200 border border-paper-300 flex items-center justify-center mx-auto text-ink-800">
              <Info className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-display font-bold text-ink-900">Honors Registry</h3>
            <p className="text-xs sm:text-sm text-ink-600 font-sans leading-relaxed">
              Competition rankings, hackathon awards, and scholarly recognitions will be published here upon release.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
