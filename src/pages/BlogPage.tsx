import React from 'react';
import { Link } from 'react-router-dom';
import { usePublicContent } from '../context/PublicContentContext';
import { CornerDownRight, LoaderCircle, BookOpen } from 'lucide-react';

export const BlogPage: React.FC = () => {
  const { blogPosts: posts, isLoading, error } = usePublicContent();

  if (isLoading && posts.length === 0) {
    return (
      <div className="pt-32 pb-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <LoaderCircle className="w-8 h-8 animate-spin text-stone-400" />
        <p className="text-xs font-mono text-stone-500 uppercase tracking-widest">Loading Journal...</p>
      </div>
    );
  }

  if (error && posts.length === 0) {
    return (
      <div className="pt-32 pb-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <h1 className="text-4xl font-display font-bold text-ink-900">Articles & Notes</h1>
        <p className="text-sm font-sans text-stone-600">Content temporarily unavailable.</p>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      
      {/* Editorial Header */}
      <div className="space-y-4 pb-8 border-b border-paper-400">
        <div className="inline-flex items-center gap-2 text-xs font-mono text-stone-500 uppercase tracking-widest">
          <span>CATALOGUE // 09</span>
          <span>·</span>
          <span>TECHNICAL JOURNAL</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-display font-extrabold text-ink-900 tracking-tight">
          Articles & Notes
        </h1>
        <p className="text-base sm:text-lg text-ink-600 font-serifDisplay italic max-w-2xl">
          Deep dives into robotics middleware, closed-loop kinematics, simulation architectures, and applied research.
        </p>
      </div>

      {/* Articles Index */}
      <div className="space-y-12">
        {posts.map((post, idx) => (
          <Link
            key={post.id || idx}
            to={`/blog/${post.slug}`}
            className="p-8 sm:p-12 rounded-3xl bg-white border border-paper-400 shadow-editorial hover:shadow-editorial-hover transition-all duration-300 block space-y-6 group"
          >
            <div className="flex items-center justify-between pb-4 border-b border-paper-300 text-xs font-mono text-stone-500">
              <span className="font-serifDisplay italic text-2xl text-stone-400">0{idx + 1}</span>
              <div className="flex items-center gap-3">
                <span className="uppercase">{post.categories?.[0] || 'Technical Note'}</span>
                {post.publishedDate && (
                  <>
                    <span>·</span>
                    <span>{post.publishedDate}</span>
                  </>
                )}
                {post.readingTimeMinutes && (
                  <>
                    <span>·</span>
                    <span>{post.readingTimeMinutes} min read</span>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-ink-900 group-hover:text-ink-700 transition-colors">
                {post.title}
              </h2>
              <p className="text-sm text-ink-600 font-sans leading-relaxed">
                {post.excerpt}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="flex flex-wrap gap-1.5">
                {(post.tags || []).map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    className="text-[11px] font-mono px-2.5 py-0.5 rounded-lg bg-paper-100 text-ink-700 border border-paper-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="inline-flex items-center gap-1.5 text-xs font-sans font-semibold uppercase text-ink-900 group-hover:text-ink-700">
                <span>Read Article</span>
                <CornerDownRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </Link>
        ))}

        {posts.length === 0 && (
          <div className="p-16 rounded-3xl bg-white border border-paper-400 shadow-editorial text-center space-y-4 max-w-2xl mx-auto">
            <div className="w-10 h-10 rounded-full bg-paper-200 border border-paper-300 flex items-center justify-center mx-auto text-ink-800">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-display font-bold text-ink-900">Technical Journal & Notes</h3>
            <p className="text-xs sm:text-sm text-ink-600 font-sans leading-relaxed">
              Technical articles, research commentaries, and engineering notes will be published here upon release.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
