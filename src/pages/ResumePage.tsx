import React, { useMemo } from 'react';
import { usePublicContent } from '../context/PublicContentContext';
import { Printer, LoaderCircle } from 'lucide-react';
import { sortExperiencesDesc } from '../utils/experienceSorting';

export const ResumePage: React.FC = () => {
  const { profile, experience: rawExperiences, skills, projects, education, isLoading, error } = usePublicContent();

  const experiences = useMemo(() => sortExperiencesDesc(rawExperiences), [rawExperiences]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading && !profile && experiences.length === 0) {
    return (
      <div className="pt-32 pb-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <LoaderCircle className="w-8 h-8 animate-spin text-stone-400" />
        <p className="text-xs font-mono text-stone-500 uppercase tracking-widest">Loading Resume...</p>
      </div>
    );
  }

  if (error && !profile && experiences.length === 0) {
    return (
      <div className="pt-32 pb-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <h1 className="text-2xl font-display font-bold text-ink-900">Curriculum Vitae</h1>
        <p className="text-sm font-sans text-stone-600">Content temporarily unavailable.</p>
      </div>
    );
  }

  const profileData = profile || {
    fullName: 'Tanishk Singhal',
    displayName: 'Tanishk Singhal',
    headline: 'Robotics Researcher & Systems Engineer',
    subheadline: '',
    shortBio: '',
    longBio: [],
    location: 'India',
    email: 'Tanishksinghal6285@gmail.com',
    avatarUrl: '',
    socials: { github: 'https://github.com/tanishk756', linkedin: '', googleScholar: '', researchGate: '' },
    keyStats: [],
    source: '',
    verificationStatus: 'USER_PROVIDED' as const,
    lastVerified: '',
  };

  return (
    <div className="pt-24 pb-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      
      {/* Action Bar (Hidden on print) */}
      <div className="flex items-center justify-between pb-6 border-b border-paper-400 print:hidden">
        <div>
          <span className="text-xs font-mono uppercase text-stone-500 tracking-widest block">
            DOCUMENT // CURRICULUM VITAE
          </span>
          <h1 className="text-2xl font-display font-bold text-ink-900">
            Curriculum Vitae
          </h1>
        </div>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ink-900 text-paper-100 hover:bg-ink-800 text-xs font-sans uppercase tracking-wider"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print / Save PDF</span>
        </button>
      </div>

      {/* CV Printable Paper Card */}
      <div className="p-8 sm:p-12 rounded-3xl bg-white border border-paper-400 shadow-editorial space-y-10 font-sans print:p-0 print:border-0 print:shadow-none">
        
        {/* Header */}
        <div className="space-y-3 pb-8 border-b border-paper-300">
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-ink-900 tracking-tight">
            {profileData.fullName}
          </h2>
          <div className="text-sm text-ink-700 font-serifDisplay italic">
            {profileData.headline}
          </div>
          <div className="flex flex-wrap gap-4 text-xs font-mono text-stone-600 pt-2">
            {profileData.email && <span>Email: {profileData.email}</span>}
            {profileData.location && (
              <>
                <span>·</span>
                <span>Location: {profileData.location}</span>
              </>
            )}
            {profileData.socials?.github && (
              <>
                <span>·</span>
                <a href={profileData.socials.github} target="_blank" rel="noopener noreferrer" className="text-ink-900 hover:underline">
                  GitHub Profile
                </a>
              </>
            )}
          </div>
        </div>

        {/* Executive Summary */}
        {profileData.shortBio && (
          <div className="space-y-2">
            <h3 className="text-xs font-mono uppercase font-bold text-stone-500 tracking-wider">
              EXECUTIVE SUMMARY
            </h3>
            <p className="text-xs sm:text-sm text-ink-700 leading-relaxed">
              {profileData.shortBio}
            </p>
          </div>
        )}

        {/* Professional Experience */}
        {experiences.filter(e => ['EMPLOYMENT', 'INTERNSHIP', 'CONTRACT', 'FOUNDER'].includes(e.type)).length > 0 && (
          <div className="space-y-6">
            <h3 className="text-xs font-mono uppercase font-bold text-stone-500 tracking-wider">
              PROFESSIONAL & INDUSTRY EXPERIENCE
            </h3>
            <div className="space-y-6">
              {experiences.filter(e => ['EMPLOYMENT', 'INTERNSHIP', 'CONTRACT', 'FOUNDER'].includes(e.type)).map((exp) => (
                <div key={exp.id} className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between text-xs">
                    <div>
                      <span className="font-bold text-ink-900 text-sm">{exp.role}</span>
                      <span className="text-stone-500 ml-2">· {exp.organization}</span>
                      {exp.location && (
                        <span className="text-stone-400 text-[11px] ml-2">
                          ({exp.location}{exp.workMode ? ` · ${exp.workMode}` : ''})
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-stone-500">{exp.startDate} {exp.endDate ? `— ${exp.endDate}` : '— Present'}</span>
                  </div>
                  {((Array.isArray(exp.description) && exp.description.length > 0) || (typeof exp.description === 'string' && exp.description.length > 0)) && (
                    <div className="text-xs text-ink-600 leading-relaxed">
                      {Array.isArray(exp.description) ? exp.description[0] : exp.description}
                    </div>
                  )}
                  {exp.responsibilities && (
                    <ul className="space-y-1 text-xs text-ink-700 pl-4 list-disc">
                      {exp.responsibilities.slice(0, 3).map((r, rIdx) => (
                        <li key={rIdx}>{r}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Leadership & Technical Community */}
        {experiences.filter(e => !['EMPLOYMENT', 'INTERNSHIP', 'CONTRACT', 'FOUNDER'].includes(e.type)).length > 0 && (
          <div className="space-y-6">
            <h3 className="text-xs font-mono uppercase font-bold text-stone-500 tracking-wider">
              LEADERSHIP & TECHNICAL COMMUNITY
            </h3>
            <div className="space-y-6">
              {experiences.filter(e => !['EMPLOYMENT', 'INTERNSHIP', 'CONTRACT', 'FOUNDER'].includes(e.type)).map((exp) => (
                <div key={exp.id} className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between text-xs">
                    <div>
                      <span className="font-bold text-ink-900 text-sm">{exp.role}</span>
                      <span className="text-stone-500 ml-2">· {exp.organization}</span>
                    </div>
                    <span className="font-mono text-stone-500">{exp.startDate} {exp.endDate ? `— ${exp.endDate}` : '— Present'}</span>
                  </div>
                  <div className="text-xs text-ink-600 leading-relaxed">
                    {Array.isArray(exp.description) ? exp.description[0] : exp.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key Engineering Projects */}
        {projects.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xs font-mono uppercase font-bold text-stone-500 tracking-wider">
              KEY ENGINEERING CASE STUDIES
            </h3>
            <div className="space-y-4">
              {projects.map((proj) => (
                <div key={proj.id} className="space-y-1 text-xs">
                  <div className="flex items-baseline justify-between">
                    <span className="font-bold text-ink-900">{proj.title}</span>
                    <span className="font-mono text-stone-500">{proj.startDate}</span>
                  </div>
                  <p className="text-ink-600">{proj.tagline}</p>
                  {proj.subcategories && proj.subcategories.length > 0 && (
                    <div className="font-mono text-[11px] text-stone-500">
                      Technologies: {proj.subcategories.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education & Academic Credentials */}
        {education.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xs font-mono uppercase font-bold text-stone-500 tracking-wider">
              ACADEMIC BACKGROUND & EDUCATION
            </h3>
            <div className="space-y-4">
              {education.map((edu) => (
                <div key={edu.id} className="space-y-1 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between">
                    <span className="font-bold text-ink-900">{edu.institution}</span>
                    <span className="font-mono text-stone-500">{edu.startDate} {edu.endDate ? `— ${edu.endDate}` : ''}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between text-ink-700">
                    <span>{edu.program}</span>
                    {edu.grade && <span className="font-mono text-stone-600">Grade: {edu.grade}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Technical Skills Inventory */}
        {skills.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase font-bold text-stone-500 tracking-wider">
              TECHNICAL DISCIPLINES & TOOLING
            </h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((s, sIdx) => (
                <span key={sIdx} className="px-2.5 py-1 rounded bg-paper-100 border border-paper-300 text-xs font-mono text-ink-800">
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
