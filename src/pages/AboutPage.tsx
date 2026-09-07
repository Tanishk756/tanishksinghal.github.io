import React from 'react';
import { profileData } from '../generated/profile';
import { getProductionOrganizations } from '../generated/organizations';
import { getProductionEducation } from '../generated/education';
import { Github, Mail, Linkedin } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const organizations = getProductionOrganizations();
  const education = getProductionEducation();

  return (
    <div className="pt-24 pb-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
      
      {/* 1. Header & Portrait Section */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center pb-12 border-b border-paper-400">
        <div className="md:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-stone-500 uppercase tracking-widest">
            <span>BIOGRAPHICAL ESSAY</span>
            <span>·</span>
            <span>BACKGROUND</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-display font-extrabold text-ink-900 tracking-tight leading-[1.05]">
            {profileData.subheadline || profileData.headline}
          </h1>

          <p className="text-xl font-serifDisplay italic text-ink-700 leading-relaxed">
            "{profileData.headline}"
          </p>

          <p className="text-sm sm:text-base text-ink-600 font-sans leading-relaxed">
            {profileData.shortBio}
          </p>
        </div>

        {/* Portrait / Avatar Frame */}
        <div className="md:col-span-5 flex justify-center">
          <div className="w-64 sm:w-72 p-4 rounded-3xl bg-white border border-paper-400 shadow-editorial space-y-3">
            <div className="aspect-square rounded-2xl overflow-hidden bg-paper-200">
              <img
                src={profileData.avatarUrl}
                alt={profileData.fullName}
                className="w-full h-full object-cover grayscale contrast-110"
              />
            </div>
            <div className="text-center pt-1">
              <div className="text-xs font-mono text-ink-900 font-bold uppercase">{profileData.fullName}</div>
              <div className="text-[11px] font-mono text-stone-500">{profileData.location}</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Narrative Bio & Engineering Philosophy */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-12">
        <div className="md:col-span-4 space-y-2">
          <span className="text-xs font-mono text-stone-500 uppercase tracking-widest block">
            PHILOSOPHY & APPROACH
          </span>
          <h2 className="text-2xl font-display font-bold text-ink-900">
            From First Principles to Real Deployment
          </h2>
        </div>

        <div className="md:col-span-8 space-y-6 text-sm text-ink-700 font-sans leading-relaxed">
          {Array.isArray(profileData.longBio) && profileData.longBio.length > 0 ? (
            profileData.longBio.map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))
          ) : (
            <p>{profileData.shortBio}</p>
          )}
        </div>
      </section>

      {/* 3. Education Chronology */}
      <section className="space-y-6 pt-6 border-t border-paper-300">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-stone-500 uppercase tracking-widest block">
            ACADEMIC BACKGROUND
          </span>
        </div>

        <div className="space-y-4">
          {education.map((edu) => (
            <div key={edu.id} className="p-6 rounded-2xl bg-white border border-paper-400 shadow-xs space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-xs font-mono text-stone-500 uppercase">
                  {edu.startDate} — {edu.endDate}
                </span>
                {edu.grade && (
                  <span className="text-xs font-mono text-ink-800 bg-paper-100 px-2.5 py-0.5 rounded border border-paper-300">
                    Grade: {edu.grade}
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-ink-900">{edu.institution}</h3>
              <div className="text-xs font-sans text-ink-800 font-medium">{edu.program}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Institutional Affiliations */}
      <section className="space-y-6 pt-6 border-t border-paper-300">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-stone-500 uppercase tracking-widest block">
            ORGANIZATIONAL AFFILIATIONS
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {organizations.map((org) => (
            <div key={org.id} className="p-6 rounded-2xl bg-white border border-paper-400 shadow-xs space-y-2">
              <span className="text-[10px] font-mono text-stone-500 uppercase">{org.dateRange}</span>
              <h3 className="text-base font-bold text-ink-900">{org.name}</h3>
              <div className="text-xs font-mono text-ink-800">{org.role}</div>
            </div>
          ))}
          {organizations.length === 0 && (
            <div className="col-span-full p-8 text-center rounded-2xl bg-white border border-paper-400 text-xs font-mono text-stone-500">
              Institutional affiliations are awaiting final user verification.
            </div>
          )}
        </div>
      </section>

      {/* 5. Professional Channels Strip */}
      <section className="p-8 rounded-3xl bg-white border border-paper-400 shadow-editorial flex flex-wrap items-center justify-between gap-6">
        <div>
          <h3 className="text-lg font-bold text-ink-900">Professional Channels</h3>
          <p className="text-xs text-stone-500 font-mono">{profileData.fullName} · {profileData.email}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href={profileData.socials.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-paper-100 hover:bg-paper-200 text-xs font-mono text-ink-900 border border-paper-300"
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub</span>
          </a>
          {profileData.socials.linkedin && (
            <a
              href={profileData.socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-paper-100 hover:bg-paper-200 text-xs font-mono text-ink-900 border border-paper-300"
            >
              <Linkedin className="w-3.5 h-3.5" />
              <span>LinkedIn</span>
            </a>
          )}
          <a
            href={`mailto:${profileData.email}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ink-900 text-paper-100 text-xs font-mono"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Direct Email</span>
          </a>
        </div>
      </section>

    </div>
  );
};
