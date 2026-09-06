import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProjectBySlug } from '../generated/projects';
import { Breadcrumbs } from '../components/layout/Breadcrumbs';
import { ArrowLeft, ArrowUpRight, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export const ProjectDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const project = slug ? getProjectBySlug(slug) : undefined;

  if (!project) {
    return (
      <div className="pt-32 pb-24 max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
        <h1 className="text-3xl font-display font-bold text-ink-900">Case Study Not Found</h1>
        <p className="text-sm text-ink-600 font-sans">The requested project case study could not be located in the archive.</p>
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-ink-900 text-paper-100 text-xs font-sans uppercase"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Projects</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      
      {/* Breadcrumb Navigation */}
      <Breadcrumbs items={[{ label: 'Engineering Projects', path: '/projects' }, { label: project.title }]} />

      {/* 1. Header & Monograph Identity */}
      <div className="space-y-6 pb-8 border-b border-paper-400">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <span className="text-xs font-mono uppercase tracking-widest text-stone-500">
            CASE STUDY MONOGRAPH // {project.category.toUpperCase()}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-paper-100 border border-paper-300 text-xs font-mono text-ink-800">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{project.verificationStatus}</span>
          </span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-display font-extrabold text-ink-900 tracking-tight leading-[1.05]">
          {project.title}
        </h1>

        <p className="text-xl sm:text-2xl text-ink-700 font-serifDisplay italic leading-relaxed">
          "{project.tagline}"
        </p>

        {/* Metadata Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 rounded-2xl bg-white border border-paper-400 shadow-xs text-xs font-sans">
          <div>
            <span className="text-[10px] font-mono uppercase text-stone-500 block mb-1">ROLE</span>
            <span className="font-semibold text-ink-900">{project.role}</span>
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase text-stone-500 block mb-1">TIMELINE</span>
            <span className="font-semibold text-ink-900">{project.startDate}</span>
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase text-stone-500 block mb-1">STATUS</span>
            <span className="font-semibold text-ink-900 uppercase">{project.status}</span>
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase text-stone-500 block mb-1">SOURCE</span>
            <span className="font-semibold text-ink-900 truncate block">{project.source}</span>
          </div>
        </div>

        {/* Action Links */}
        {project.githubUrl && (
          <div className="pt-2">
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-ink-900 text-paper-100 hover:bg-ink-800 text-xs font-sans uppercase tracking-wider transition-colors shadow-xs"
            >
              <span>View Source Repository</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>

      {/* 2. Problem Formulation & Objective */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 rounded-3xl bg-white border border-paper-400 shadow-xs space-y-3">
          <span className="text-xs font-mono uppercase text-stone-500 tracking-wider block">
            01 // PROBLEM FORMULATION
          </span>
          <h2 className="text-xl font-bold text-ink-900">The Core Technical Hurdle</h2>
          <p className="text-xs sm:text-sm text-ink-600 font-sans leading-relaxed">
            {project.problem}
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white border border-paper-400 shadow-xs space-y-3">
          <span className="text-xs font-mono uppercase text-stone-500 tracking-wider block">
            02 // ENGINEERING OBJECTIVE
          </span>
          <h2 className="text-xl font-bold text-ink-900">Target Benchmark Criteria</h2>
          <p className="text-xs sm:text-sm text-ink-600 font-sans leading-relaxed">
            {project.objective}
          </p>
        </div>
      </section>

      {/* 3. Subsystems Anatomy */}
      <section className="space-y-6">
        <div className="space-y-1 pb-4 border-b border-paper-400">
          <span className="text-xs font-mono uppercase text-stone-500 tracking-wider block">
            03 // SYSTEM TOPOLOGY & SUB-MODULES
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-ink-900">
            Subsystem Architecture
          </h2>
        </div>

        <p className="text-sm text-ink-700 font-sans leading-relaxed">
          {project.architectureDescription}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {(project.subsystems || []).map((sub, sIdx) => (
            <div key={sIdx} className="p-6 rounded-2xl bg-white border border-paper-400 shadow-xs space-y-3">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-paper-100 text-ink-800 uppercase font-medium">
                {sub.category}
              </span>
              <h3 className="text-base font-bold text-ink-900">{sub.name}</h3>
              <p className="text-xs text-ink-600 font-sans leading-relaxed">{sub.description}</p>
              <div className="pt-2 border-t border-paper-200 space-y-1">
                {sub.specs.map((spec, spIdx) => (
                  <div key={spIdx} className="text-[11px] font-mono text-stone-500">
                    • {spec}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Engineering Challenges & Root Cause Resolutions */}
      <section className="space-y-6">
        <div className="space-y-1 pb-4 border-b border-paper-400">
          <span className="text-xs font-mono uppercase text-stone-500 tracking-wider block">
            04 // DEBUGGING & EMPIRICAL RESOLUTION
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-ink-900">
            Critical Failure Modes & Solutions
          </h2>
        </div>

        <div className="space-y-6">
          {project.challenges.map((c, cIdx) => (
            <div key={cIdx} className="p-8 rounded-3xl bg-white border border-paper-400 shadow-xs space-y-4">
              <h3 className="text-lg font-bold text-ink-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-editorial-terracotta" />
                <span>{c.challenge}</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-sans">
                <div className="p-4 rounded-xl bg-paper-100 border border-paper-300 space-y-1">
                  <span className="font-mono text-[10px] uppercase text-stone-500 font-bold block">ROOT CAUSE</span>
                  <p className="text-ink-700 leading-relaxed">{c.rootCause}</p>
                </div>
                <div className="p-4 rounded-xl bg-paper-100 border border-paper-300 space-y-1">
                  <span className="font-mono text-[10px] uppercase text-stone-500 font-bold block">ENGINEERING FIX</span>
                  <p className="text-ink-700 leading-relaxed">{c.solution}</p>
                </div>
              </div>
              <div className="pt-2 flex items-center gap-2 text-xs font-mono text-ink-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Outcome: {c.outcome}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Empirical Results & Lessons Learned */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 rounded-3xl bg-white border border-paper-400 shadow-xs space-y-4">
          <span className="text-xs font-mono uppercase text-stone-500 tracking-wider block">
            05 // EMPIRICAL BENCHMARKS & SUMMARY
          </span>
          <h3 className="text-xl font-bold text-ink-900">Empirical Verification</h3>
          
          {project.results?.metrics && project.results.metrics.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 pt-2">
              {project.results.metrics.map((m, mIdx) => (
                <div key={mIdx} className="p-4 rounded-xl bg-paper-100 border border-paper-300">
                  <span className="text-2xl font-bold text-ink-900 block">{m.value}</span>
                  <span className="text-[11px] font-mono text-stone-500">{m.label} ({m.unit})</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-paper-100 border border-paper-300 space-y-2 text-xs font-sans text-ink-700">
              <div className="font-mono text-[10px] uppercase text-stone-500 font-bold">VERIFICATION STATUS</div>
              <p className="leading-relaxed">
                Hardware validation logs and quantified runtime benchmarks will be appended upon execution of physical test trials.
              </p>
            </div>
          )}

          {project.results?.summary && project.results.summary.length > 0 && (
            <div className="pt-2 space-y-1.5 text-xs text-ink-600 font-sans">
              {project.results.summary.map((s, sIdx) => (
                <p key={sIdx}>• {s}</p>
              ))}
            </div>
          )}
        </div>

        <div className="p-8 rounded-3xl bg-white border border-paper-400 shadow-xs space-y-4">
          <span className="text-xs font-mono uppercase text-stone-500 tracking-wider block">
            06 // ARCHITECTURAL TAKEAWAYS
          </span>
          <h3 className="text-xl font-bold text-ink-900">Lessons Learned</h3>
          <ul className="space-y-2 text-xs text-ink-700 font-sans leading-relaxed">
            {(project.lessonsLearned || []).map((l, lIdx) => (
              <li key={lIdx} className="flex items-start gap-2">
                <span className="text-stone-400">•</span>
                <span>{l}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 6. Provenance & Verification Ledger */}
      <section className="p-6 rounded-2xl bg-paper-100 border border-paper-300 text-xs font-mono text-stone-600 space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-bold text-ink-900 uppercase">PROVENANCE & AUDIT TRAIL</span>
          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold">
            {project.verificationStatus}
          </span>
        </div>
        <p>Source Record: {project.source} {project.sourceUrl && `(${project.sourceUrl})`}</p>
        <p>Last Verified: {project.lastVerified} | Notes: {project.notes}</p>
      </section>

    </div>
  );
};
