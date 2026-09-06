import React from 'react';
import { Link } from 'react-router-dom';
import { InteractiveCenterpiece } from '../components/ui/InteractiveCenterpiece';
import { getProductionProjects } from '../generated/projects';
import { getProductionResearch } from '../generated/research';
import { getProductionPublications } from '../generated/publications';
import { getProductionBlogPosts } from '../generated/blog';
import { ArrowUpRight, ArrowRight, ShieldCheck, CornerDownRight } from 'lucide-react';

export const HomePage: React.FC = () => {
  const featuredProjects = getProductionProjects().slice(0, 3);
  const researchItems = getProductionResearch().slice(0, 2);
  const publications = getProductionPublications().slice(0, 2);
  const blogPosts = getProductionBlogPosts().slice(0, 2);

  return (
    <div className="pt-24 pb-24 space-y-32">
      
      {/* 1. HERO SECTION: Monumental Editorial Statement & Interactive Sculpture */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left: Monumental Typographic Narrative */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-paper-200 border border-paper-400 text-ink-700 text-xs font-mono uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-ink-900" />
                <span>ENGINEERING & ROBOTICS RESEARCH</span>
              </div>

              <h1 className="text-5xl sm:text-7xl lg:text-8xl font-display font-extrabold tracking-tight text-ink-900 leading-[0.95]">
                TANISHK<br />
                <span className="font-serifDisplay italic font-normal text-ink-700">Singhal</span>
              </h1>
            </div>

            <p className="text-xl sm:text-2xl text-ink-700 font-serifDisplay italic leading-relaxed max-w-xl">
              "Building intelligent systems that move from rigorous mathematical formulation to real-world deployment."
            </p>

            <p className="text-sm sm:text-base text-ink-600 font-sans leading-relaxed max-w-xl">
              Robotics researcher and systems engineer focusing on autonomous mobile navigation, closed-loop ROS 2 kinematic control, embedded firmware architectures, and applied machine learning pipelines.
            </p>

            {/* Quick CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/projects"
                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-ink-900 text-paper-100 hover:bg-ink-800 text-xs font-sans font-semibold tracking-wide uppercase transition-all shadow-sm active:scale-[0.98]"
              >
                <span>EXPLORE CASE STUDIES</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-paper-400 text-ink-800 hover:bg-paper-100 text-xs font-sans font-semibold tracking-wide uppercase transition-all shadow-xs"
              >
                <span>BACKGROUND & BIO</span>
              </Link>
            </div>

            {/* Verification Notice */}
            <div className="pt-4 flex items-center gap-2 text-xs font-mono text-stone-500">
              <ShieldCheck className="w-4 h-4 text-ink-800" />
              <span>Source-verified repository models with reproducible benchmarks</span>
            </div>
          </div>

          {/* Right: Interactive Kinematic Sculpture Centerpiece */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-md p-6 rounded-3xl bg-white border border-paper-400 shadow-editorial">
              <InteractiveCenterpiece className="w-full aspect-square" />
            </div>
          </div>

        </div>
      </section>

      {/* 2. CURATED CASE STUDIES INDEX (Asymmetric Rhythmic Layout) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 border-b border-paper-400 gap-4">
          <div className="space-y-1">
            <span className="text-xs font-mono text-stone-500 uppercase tracking-widest block">
              SECTION 01 // SELECTED WORK
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-ink-900 tracking-tight">
              Engineering Case Studies
            </h2>
          </div>
          <Link
            to="/projects"
            className="inline-flex items-center gap-1.5 text-xs font-sans font-semibold uppercase tracking-wider text-ink-900 hover:text-ink-600 transition-colors"
          >
            <span>View Full Archive</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Case Studies Rhythmic Index */}
        <div className="space-y-16">
          {featuredProjects.map((project, idx) => (
            <div
              key={project.id}
              className={`grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-8 sm:p-12 rounded-3xl bg-white border border-paper-400 shadow-editorial transition-all duration-300 hover:shadow-editorial-hover ${
                idx % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}
            >
              {/* Index Number & Summary */}
              <div className="lg:col-span-6 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-paper-300">
                  <span className="text-3xl sm:text-4xl font-serifDisplay italic text-stone-400">
                    0{idx + 1}
                  </span>
                  <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-paper-200 border border-paper-300 text-ink-800 uppercase font-medium">
                    {project.category}
                  </span>
                </div>

                <div className="space-y-3">
                  <h3 className="text-2xl sm:text-3xl font-display font-bold text-ink-900 tracking-tight">
                    {project.title}
                  </h3>
                  <p className="text-sm text-ink-600 font-sans leading-relaxed">
                    {project.tagline}
                  </p>
                </div>

                {/* Subdiscipline tags */}
                <div className="flex flex-wrap gap-2">
                  {project.subcategories.map((sub, sIdx) => (
                    <span
                      key={sIdx}
                      className="text-[11px] font-mono px-2.5 py-0.5 rounded-lg bg-paper-100 text-ink-700 border border-paper-300"
                    >
                      {sub}
                    </span>
                  ))}
                </div>

                <div className="pt-4 flex items-center gap-4">
                  <Link
                    to={`/projects/${project.slug}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-ink-900 text-paper-100 hover:bg-ink-800 text-xs font-sans font-medium uppercase tracking-wider transition-all"
                  >
                    <span>Read Monograph</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-mono text-ink-600 hover:text-ink-900"
                    >
                      <span>Repository</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>

              {/* Technical Specifications Card */}
              <div className="lg:col-span-6 p-6 rounded-2xl bg-paper-100 border border-paper-300 space-y-4">
                <div className="text-xs font-mono text-stone-500 uppercase tracking-wider pb-2 border-b border-paper-300">
                  SYSTEM ARCHITECTURE SNAPSHOT
                </div>
                <p className="text-xs text-ink-700 font-sans leading-relaxed">
                  {project.problem}
                </p>
                <div className="pt-2 border-t border-paper-200 flex items-center justify-between text-[11px] font-mono text-stone-500">
                  <span>Role: {project.role}</span>
                  <span>Year: {project.startDate}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. RESEARCH LEDGER & PUBLICATIONS ARCHIVE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Research Ledger */}
          <div className="lg:col-span-7 space-y-8">
            <div className="flex items-end justify-between pb-4 border-b border-paper-400">
              <div className="space-y-1">
                <span className="text-xs font-mono text-stone-500 uppercase tracking-widest block">
                  SECTION 02 // RESEARCH
                </span>
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-ink-900">
                  Research Programs
                </h2>
              </div>
              <Link to="/research" className="text-xs font-mono text-ink-700 hover:text-ink-950">
                All Programs →
              </Link>
            </div>

            <div className="space-y-6">
              {researchItems.map((prog, rIdx) => (
                <div key={prog.id} className="p-6 rounded-2xl bg-white border border-paper-400 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between text-xs font-mono text-stone-500">
                    <span>PROGRAM 0{rIdx + 1}</span>
                    <span className="text-ink-800 font-semibold">{prog.domain}</span>
                  </div>
                  <h3 className="text-lg font-bold text-ink-900">{prog.title}</h3>
                  <p className="text-xs text-ink-600 font-sans leading-relaxed">{prog.summary}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Scholarly Bibliography */}
          <div className="lg:col-span-5 space-y-8">
            <div className="flex items-end justify-between pb-4 border-b border-paper-400">
              <div className="space-y-1">
                <span className="text-xs font-mono text-stone-500 uppercase tracking-widest block">
                  SECTION 03 // PAPERS
                </span>
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-ink-900">
                  Publications
                </h2>
              </div>
              <Link to="/publications" className="text-xs font-mono text-ink-700 hover:text-ink-950">
                Bibliography →
              </Link>
            </div>

            <div className="space-y-4">
              {publications.map((pub) => (
                <div key={pub.id} className="p-5 rounded-2xl bg-white border border-paper-400 space-y-2 shadow-xs">
                  <span className="text-[10px] font-mono text-stone-500 uppercase">
                    {pub.venue} · {pub.year}
                  </span>
                  <h4 className="text-sm font-bold text-ink-900 leading-snug">{pub.title}</h4>
                  <p className="text-xs text-ink-600 font-sans line-clamp-2">{pub.abstract}</p>
                </div>
              ))}
              {publications.length === 0 && (
                <div className="p-6 rounded-2xl bg-white border border-paper-400 text-xs font-mono text-stone-500 space-y-1">
                  <div className="text-ink-900 font-bold uppercase">Awaiting Verified Records</div>
                  <p className="font-sans text-stone-500">Peer-reviewed publications will appear here upon authenticated release.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* 4. TECHNICAL WRITING & ESSAYS PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-end justify-between pb-4 border-b border-paper-400">
          <div className="space-y-1">
            <span className="text-xs font-mono text-stone-500 uppercase tracking-widest block">
              SECTION 04 // WRITING
            </span>
            <h2 className="text-3xl font-display font-bold text-ink-900">
              Technical Journal & Thoughts
            </h2>
          </div>
          <Link to="/blog" className="text-xs font-mono text-ink-700 hover:text-ink-950">
            All Articles →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {blogPosts.map((post) => (
            <Link
              key={post.id}
              to={`/blog/${post.slug}`}
              className="p-8 rounded-3xl bg-white border border-paper-400 shadow-editorial hover:shadow-editorial-hover transition-all space-y-4 block group"
            >
              <div className="flex items-center justify-between text-xs font-mono text-stone-500">
                <span>{post.categories?.[0] || 'Technical Note'}</span>
                <span>{post.publishedDate}</span>
              </div>
              <h3 className="text-xl font-bold text-ink-900 group-hover:text-ink-700 transition-colors">
                {post.title}
              </h3>
              <p className="text-xs text-ink-600 font-sans leading-relaxed line-clamp-2">
                {post.excerpt}
              </p>
              <div className="pt-2 flex items-center gap-1.5 text-xs font-mono text-ink-900 font-medium">
                <span>Read Article</span>
                <CornerDownRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. MINIMAL CONFIDENT CLOSING STATEMENT */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 pt-12">
        <div className="p-12 sm:p-16 rounded-3xl bg-white border border-paper-400 shadow-editorial space-y-6">
          <span className="text-xs font-mono text-stone-500 uppercase tracking-widest block">
            COLLABORATION & INQUIRIES
          </span>
          <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-ink-900 tracking-tight max-w-2xl mx-auto">
            Interested in autonomous systems, robotics research, or technical collaboration?
          </h2>
          <p className="text-sm text-ink-600 max-w-md mx-auto font-sans leading-relaxed">
            Open to scholarly dialogue, research discussions, and challenging robotics engineering problems.
          </p>
          <div className="pt-4">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-ink-900 text-paper-100 hover:bg-ink-800 text-xs font-sans font-semibold uppercase tracking-wider transition-all shadow-sm active:scale-[0.98]"
            >
              <span>INITIATE CONTACT</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};
