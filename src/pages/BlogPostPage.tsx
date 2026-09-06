import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBlogPostBySlug } from '../content/blog';
import { Breadcrumbs } from '../components/layout/Breadcrumbs';
import { ArrowLeft, Clock, Calendar, ShieldCheck } from 'lucide-react';

export const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getBlogPostBySlug(slug) : undefined;

  if (!post) {
    return (
      <div className="pt-32 pb-24 max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
        <h1 className="text-3xl font-display font-bold text-ink-900">Article Not Found</h1>
        <p className="text-sm text-ink-600 font-sans">The requested article could not be located in the journal archive.</p>
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-ink-900 text-paper-100 text-xs font-sans uppercase"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Journal</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-24 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      
      <Breadcrumbs items={[{ label: 'Technical Journal', path: '/blog' }, { label: post.title }]} />

      {/* Header */}
      <div className="space-y-6 pb-8 border-b border-paper-400">
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-stone-500">
          <span className="uppercase tracking-widest">{post.categories?.[0] || 'Technical Note'}</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{post.publishedDate}</span>
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{post.readingTimeMinutes} min read</span>
            </span>
          </div>
        </div>

        <h1 className="text-3xl sm:text-5xl font-display font-bold text-ink-900 leading-tight">
          {post.title}
        </h1>

        <p className="text-lg text-ink-700 font-serifDisplay italic leading-relaxed">
          "{post.excerpt}"
        </p>

        <div className="flex flex-wrap gap-2 pt-2">
          {post.tags.map((tag, idx) => (
            <span
              key={idx}
              className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-paper-100 border border-paper-300 text-ink-700"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Article Markdown Body */}
      <article className="prose prose-slate max-w-none font-sans text-sm sm:text-base text-ink-800 leading-relaxed space-y-6">
        <div className="whitespace-pre-wrap leading-relaxed space-y-4">
          {post.content}
        </div>
      </article>

      {/* Footer / Provenance */}
      <div className="p-6 rounded-2xl bg-paper-100 border border-paper-300 text-xs font-mono text-stone-600 flex items-center justify-between">
        <span>AUTHOR: Tanishk Singhal</span>
        <span className="inline-flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>{post.verificationStatus}</span>
        </span>
      </div>

    </div>
  );
};
