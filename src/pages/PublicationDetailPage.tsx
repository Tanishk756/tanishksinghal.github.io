import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPublicationBySlug } from '../generated/publications';
import { Breadcrumbs } from '../components/layout/Breadcrumbs';
import { ArrowLeft, ArrowUpRight, ShieldCheck } from 'lucide-react';

export const PublicationDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const pub = slug ? getPublicationBySlug(slug) : undefined;

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
          {pub.verificationStatus && (
            <span className="inline-flex items-center gap-1 text-xs font-mono text-ink-800">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{pub.verificationStatus}</span>
            </span>
          )}
        </div>

        <h1 className="text-3xl sm:5xl font-display font-bold text-ink-900 leading-tight">
          {pub.title}
        </h1>

        <div className="p-6 rounded-2xl bg-white border border-paper-400 shadow-xs space-y-3 text-xs font-sans">
          {authors.length > 0 && (
            <div>
              <span className="text-[10px] font-mono uppercase text-stone-500 block mb-0.5">AUTHORS</span>
              <span className="font-semibold text-ink-900">{authors.join(', ')}</span>
            </div>
          )}
          <div>
            <span className="text-[10px] font-mono uppercase text-stone-500 block mb-0.5">VENUE / PUBLISHER</span>
            <span className="font-semibold text-ink-900">{pub.venue || 'Academic Publication'} {pub.publisher ? `(${pub.publisher})` : ''}</span>
          </div>
        </div>

        {pub.sourceUrl && (
          <div className="pt-2">
            <a
              href={pub.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-ink-900 text-paper-100 hover:bg-ink-800 text-xs font-sans uppercase tracking-wider"
            >
              <span>View On Google Scholar</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>

      {/* Abstract */}
      {pub.abstract && (
        <section className="p-8 rounded-3xl bg-white border border-paper-400 shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-ink-900">Abstract</h2>
          <p className="text-sm text-ink-700 font-sans leading-relaxed">
            {pub.abstract}
          </p>
        </section>
      )}

      {/* Keywords */}
      {keywords.length > 0 && (
        <section className="space-y-3">
          <span className="text-xs font-mono uppercase text-stone-500 tracking-wider block">
            INDEXED DISCIPLINARY KEYWORDS
          </span>
          <div className="flex flex-wrap gap-2">
            {keywords.map((k, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-full bg-paper-100 border border-paper-300 text-xs font-mono text-ink-800"
              >
                {k}
              </span>
            ))}
          </div>
        </section>
      )}

    </div>
  );
};

