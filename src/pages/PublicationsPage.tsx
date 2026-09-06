import React from 'react';
import { Link } from 'react-router-dom';
import { getProductionPublications } from '../generated/publications';
import { ArrowUpRight, ShieldCheck, BookOpen } from 'lucide-react';

export const PublicationsPage: React.FC = () => {
  const productionPublications = getProductionPublications();
  const publications = Array.isArray(productionPublications)
    ? productionPublications.filter(Boolean)
    : [];

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
                {pub.verificationStatus && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-ink-700">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>{pub.verificationStatus}</span>
                  </span>
                )}
              </div>

              <div className="space-y-3">
                <Link to={`/publications/${pub.slug}`} className="group">
                  <h2 className="text-2xl font-display font-bold text-ink-900 group-hover:text-ink-700 transition-colors">
                    {pub.title}
                  </h2>
                </Link>
                {authors.length > 0 && (
                  <div className="text-xs font-mono text-ink-800">
                    Authors: {authors.join(', ')}
                  </div>
                )}
                {pub.abstract && (
                  <p className="text-xs sm:text-sm text-ink-600 font-sans leading-relaxed">
                    {pub.abstract}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <div className="flex flex-wrap gap-1.5">
                  {keywords.map((k, kIdx) => (
                    <span
                      key={kIdx}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-paper-100 text-stone-600 border border-paper-300"
                    >
                      {k}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    to={`/publications/${pub.slug}`}
                    className="text-xs font-sans font-semibold uppercase text-ink-900 hover:text-ink-700"
                  >
                    View Details →
                  </Link>
                  {pub.sourceUrl && (
                    <a
                      href={pub.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-mono text-ink-600 hover:text-ink-900"
                    >
                      <span>Google Scholar</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {publications.length === 0 && (
          <div className="p-16 rounded-3xl bg-white border border-paper-400 shadow-editorial text-center space-y-4 max-w-2xl mx-auto">
            <div className="w-10 h-10 rounded-full bg-paper-200 border border-paper-300 flex items-center justify-center mx-auto text-ink-800">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-display font-bold text-ink-900">Scholarly Bibliography Archive</h3>
            <p className="text-xs sm:text-sm text-ink-600 font-sans leading-relaxed">
              Academic publications, conference papers, and research preprints are currently undergoing peer-review indexing and will be catalogued here once authenticated.
            </p>
            <div className="text-[11px] font-mono text-stone-400 uppercase pt-2">
              PEER-REVIEW ARCHIVE
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

