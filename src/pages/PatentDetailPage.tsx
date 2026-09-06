import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductionPatents } from '../generated/patents';
import { Breadcrumbs } from '../components/layout/Breadcrumbs';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export const PatentDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const patents = getProductionPatents();
  const patent = patents.find(p => p.slug === slug || p.id === slug);

  if (!patent) {
    return (
      <div className="pt-32 pb-24 max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
        <h1 className="text-3xl font-display font-bold text-ink-900">Patent Record Not Found</h1>
        <p className="text-sm text-ink-600 font-sans">The requested patent disclosure could not be located in the verified archive.</p>
        <Link
          to="/patents"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-ink-900 text-paper-100 text-xs font-sans uppercase"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Patents</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <Breadcrumbs items={[{ label: 'Patents & IP', path: '/patents' }, { label: patent.title }]} />

      <div className="space-y-6 pb-8 border-b border-paper-400">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase text-stone-500 tracking-widest">
            PATENT DISCLOSURE // {patent.status.toUpperCase()}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-mono text-ink-800">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{patent.verificationStatus}</span>
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-display font-bold text-ink-900 leading-tight">
          {patent.title}
        </h1>

        <div className="p-6 rounded-2xl bg-white border border-paper-400 shadow-xs space-y-2 text-xs font-sans">
          <div>
            <span className="text-[10px] font-mono uppercase text-stone-500 block">INVENTORS</span>
            <span className="font-semibold text-ink-900">{patent.inventors.join(', ')}</span>
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase text-stone-500 block">JURISDICTION</span>
            <span className="font-semibold text-ink-900">{patent.jurisdiction}</span>
          </div>
        </div>
      </div>

      <section className="p-8 rounded-3xl bg-white border border-paper-400 shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-ink-900">Technical Abstract</h2>
        <p className="text-sm text-ink-700 font-sans leading-relaxed">{patent.abstract}</p>
      </section>
    </div>
  );
};
