import React from 'react';
import { Link } from 'react-router-dom';
import { usePublicContent } from '../context/PublicContentContext';
import { ArrowUpRight, BookOpen, LoaderCircle } from 'lucide-react';

export const PublicationsPage: React.FC = () => {
  const { publications, isLoading, error } = usePublicContent();

  if (isLoading && publications.length === 0) {
    return (
      <div className="pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <LoaderCircle className="w-8 h-8 animate-spin text-stone-400" />
        <p className="text-xs font-mono text-stone-500 uppercase tracking-widest">Loading Publications...</p>
      </div>
    );
  }

  if (error && publications.length === 0) {
    return (
      <div className="pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <h1 className="text-4xl font-display font-bold text-ink-900">Publications & Preprints</h1>
        <p className="text-sm font-sans text-stone-600">Content temporarily unavailable.</p>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      
      {/* Editorial Header */}
      <div className="space-y-4 pb-8 border-b border-paper-400">
        <div className="inline-flex items-center gap-2 text-xs font-mono text-stone-500 uppercase tracking-widest">
          <span>CATALOGUE // 03</span>
          <span>·</span>
          <span>SCHOLARLY BIBLIOGRAPHY</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-display font-extrabold text-ink-900 tracking-tight">
          Publications & Preprints
        </h1>
        <p className="text-base sm:text-lg text-ink-600 font-serifDisplay italic max-w-2xl">
          Peer-reviewed articles, conference proceedings, preprints, and academic contributions.
        </p>
      </div>

      {/* Bibliography Entries */}
      <div className="space-y-8">
        {publications.map((pub, idx) => {
          const authors = (Array.isArray(pub.authors) ? pub.authors : [])
            .filter((a): a is string => typeof a === 'string' && a.trim().length > 0);
          const keywords = (Array.isArray(pub.keywords) ? pub.keywords : [])
            .filter((k): k is string => typeof k === 'string' && k.trim().length > 0);

          return (
            <div
              key={pub.id || idx}
              className="p-8 sm:p-10 rounded-3xl bg-white border border-paper-400 shadow-editorial space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-paper-300 gap-2">
                <span className="text-xs font-mono text-stone-500 uppercase">
                  ENTRY 0{idx + 1} · {pub.venue || 'Publication'} {pub.year ? `· ${pub.year}` : ''}
                </span>
              </div>

              <div className="space-y-3">
                <Link to={`/publications/${pub.slug}`} className="group">
                  <h2 className="text-2xl font-display font-bold text-ink-900 group-hover:text-ink-700 transition-colors">
                    {pub.title}
                  </h2>
                </Link>
                {authors.length > 0 && (
                  <p className="text-xs font-mono text-stone-600">
                    {authors.join(', ')}
                  </p>
                )}
                <p className="text-xs sm:text-sm text-ink-700 font-sans leading-relaxed">
                  {pub.abstract}
                </p>
              </div>

              {keywords.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {keywords.map((kw, kIdx) => (
                    <span
                      key={kIdx}
                      className="text-[11px] font-mono px-2.5 py-0.5 rounded-lg bg-paper-100 text-ink-700 border border-paper-300"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              )}

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  to={`/publications/${pub.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-ink-900 hover:text-ink-600"
                >
                  <span>Monograph Details →</span>
                </Link>
                {pub.doiUrl && (
                  <a
                    href={pub.doiUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-mono text-stone-500 hover:text-ink-900"
                  >
                    <span>DOI Reference</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          );
        })}

        {publications.length === 0 && (
          <div className="p-16 rounded-3xl bg-white border border-paper-400 shadow-editorial text-center space-y-4 max-w-2xl mx-auto">
            <div className="w-10 h-10 rounded-full bg-paper-200 border border-paper-300 flex items-center justify-center mx-auto text-ink-800">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-display font-bold text-ink-900">Scholarly Publication Archive</h3>
            <p className="text-xs sm:text-sm text-ink-600 font-sans leading-relaxed">
              Peer-reviewed papers, workshop contributions, and preprint manuscripts will appear here upon authenticated release.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
