import React from 'react';
import { profileData } from '../content/profile';
import { Mail, Github, Linkedin, ArrowUpRight, MapPin } from 'lucide-react';

export const ContactPage: React.FC = () => {
  return (
    <div className="pt-24 pb-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      
      {/* Header */}
      <div className="space-y-4 pb-8 border-b border-paper-400">
        <div className="inline-flex items-center gap-2 text-xs font-mono text-stone-500 uppercase tracking-widest">
          <span>CONTACT & INQUIRIES</span>
          <span>·</span>
          <span>CHANNELS</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-display font-extrabold text-ink-900 tracking-tight">
          Initiate Dialogue
        </h1>
        <p className="text-lg sm:text-xl text-ink-600 font-serifDisplay italic max-w-xl">
          "Open to engineering discussions, autonomous systems research, and challenging technical collaboration."
        </p>
      </div>

      {/* Primary Contact Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        
        {/* Email Direct */}
        <div className="p-8 rounded-3xl bg-white border border-paper-400 shadow-editorial space-y-6 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-full bg-paper-100 border border-paper-300 flex items-center justify-center text-ink-900">
              <Mail className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-ink-900">Direct Email</h2>
            <p className="text-xs text-ink-600 font-sans leading-relaxed">
              For research inquiries, project proposals, and scholarly questions.
            </p>
          </div>

          <div>
            <a
              href={`mailto:${profileData.email}`}
              className="inline-flex items-center justify-between w-full px-5 py-3 rounded-full bg-ink-900 text-paper-100 hover:bg-ink-800 text-xs font-sans uppercase tracking-wider font-semibold transition-all shadow-xs"
            >
              <span>{profileData.email}</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* GitHub Engineering */}
        <div className="p-8 rounded-3xl bg-white border border-paper-400 shadow-editorial space-y-6 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-full bg-paper-100 border border-paper-300 flex items-center justify-center text-ink-900">
              <Github className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-ink-900">GitHub Profile</h2>
            <p className="text-xs text-ink-600 font-sans leading-relaxed">
              Review open-source robotics control packages, algorithms, and models.
            </p>
          </div>

          <div>
            <a
              href={profileData.socials.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-between w-full px-5 py-3 rounded-full bg-paper-100 hover:bg-paper-200 border border-paper-300 text-ink-900 text-xs font-sans uppercase tracking-wider font-semibold transition-all"
            >
              <span>github.com/Tanishk756</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </div>

      </div>

      {/* Additional Profiles Strip */}
      <div className="p-8 rounded-3xl bg-white border border-paper-400 shadow-xs space-y-4">
        <div className="text-xs font-mono uppercase text-stone-500 tracking-wider">
          ADDITIONAL VERIFIED ANCHORS
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
          {profileData.socials.linkedin && (
            <a
              href={profileData.socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-2xl bg-paper-100 border border-paper-200 hover:border-paper-400 flex items-center justify-between group transition-colors"
            >
              <div className="flex items-center gap-2">
                <Linkedin className="w-4 h-4 text-ink-800" />
                <span className="font-semibold text-ink-900">LinkedIn Profile</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-ink-900" />
            </a>
          )}

          <div className="p-4 rounded-2xl bg-paper-100 border border-paper-200 flex items-center gap-2 text-stone-600">
            <MapPin className="w-4 h-4 text-ink-800" />
            <span>Location: {profileData.location}</span>
          </div>
        </div>
      </div>

    </div>
  );
};
