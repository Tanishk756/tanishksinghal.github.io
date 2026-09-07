import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePublicContent } from '../context/PublicContentContext';
import { Breadcrumbs } from '../components/layout/Breadcrumbs';
import { ArrowLeft, ArrowUpRight, LoaderCircle } from 'lucide-react';

export const PublicationDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { getPublicationBySlug, isLoading } = usePublicContent();
  const pub = slug ? getPublicationBySlug(slug) : undefined;

  if (isLoading && !pub) {
    return (
      <div className="pt-32 pb-24 max-w-4xl mx-auto px-4 sm:px-6 text-center flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <LoaderCircle className="w-8 h-8 animate-spin text-stone-400" />
        <p className="text-xs font-mono text-stone-500 uppercase tracking-widest">Loading Publication...</p>
      </div>
    );
  }

  if (!pub) {
    return (
      <div className="pt-32 pb-24 max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
        <h1 className="text-3xl font-display font-bold text-ink-900">Publication Not Found</h1>
        <p className="text-sm text-ink-600 font-sans">The requested publication record could not be found in the archive.</p>
        <Link
          to="/publications"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-ink-900 text-paper-100 text-xs font-sans uppercase"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Publications</span>
        </Link>
      </div>
    );
  }

  const authors = (Array.isArray(pub.authors) ? pub.authors : [])
    .filter((a): a is string => typeof a === 'string' && a.trim().length > 0);
  const keywords = (Array.isArray(pub.keywords) ? pub.keywords : [])
    .filter((k): k is string => typeof k === 'string' && k.trim().length > 0);

  return (
    <div className="pt-24 pb-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      
      <Breadcrumbs items={[{ label: 'Publications', path: '/publications' }, { label: pub.title }]} />

      <div className="space-y-6 pb-8 border-b border-paper-400">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase text-stone-500 tracking-widest">
            SCHOLARLY ENTRY // {pub.year || 'Archive'}
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-display font-bold text-ink-900 leading-tight">
          {pub.title}
        </h1>

        <div className="p-6 rounded-2xl bg-white border border-paper-400 shadow-xs space-y-3 text-xs font-sans">
          {authors.length > 0 && (
            <div>
              <span className="text-[10px] font-mono uppercase text-stone-500 block mb-0.5">AUTHORS</span>
              <span className="font-semibold text-ink-900">{authors.join(', ')}</span>
            </div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 border-t border-paper-200">
            <div>
              <span className="text-[10px] font-mono uppercase text-stone-500 block mb-0.5">VENUE</span>
              <span className="text-ink-800">{pub.venue}</span>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-stone-500 block mb-0.5">YEAR</span>
              <span className="text-ink-800">{pub.year}</span>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-stone-500 block mb-0.5">STATUS</span>
              <span className="text-ink-800 uppercase">{pub.status}</span>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="flex flex-wrap items-center gap-4 pt-2">
          {pub.doiUrl && (
            <a
              href={pub.doiUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-ink-900 text-paper-100 text-xs font-sans uppercase tracking-wider"
            >
              <span>View DOI Entry</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          )}
          {pub.pdfUrl && (
            <a
              href={pub.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-paper-200 border border-paper-400 text-ink-900 text-xs font-sans uppercase tracking-wider"
            >
              <span>Download Manuscript (PDF)</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Abstract */}
      <section className="space-y-4">
        <h2 className="text-xs font-mono uppercase text-stone-500 tracking-widest">
          ABSTRACT & PROBLEM STATEMENT
        </h2>
        <div className="p-8 rounded-3xl bg-white border border-paper-400 shadow-xs">
          <p className="text-sm sm:text-base text-ink-700 font-sans leading-relaxed">
            {pub.abstract}
          </p>
        </div>
      </section>

      {/* Keywords */}
      {keywords.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-xs font-mono uppercase text-stone-500 tracking-widest">
            TOPICAL KEYWORDS
          </h3>
          <div className="flex flex-wrap gap-2">
            {keywords.map((kw, idx) => (
              <span
                key={idx}
                className="text-xs font-mono px-3 py-1 rounded-lg bg-paper-100 text-ink-800 border border-paper-300"
              >
                {kw}
              </span>
            ))}
          </div>
        </section>
      )}

    </div>
  );
};
