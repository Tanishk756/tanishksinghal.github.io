import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="pt-32 pb-32 max-w-3xl mx-auto px-4 sm:px-6 text-center space-y-6">
      <span className="text-xs font-mono uppercase text-stone-500 tracking-widest block">
        ERROR // 404
      </span>
      <h1 className="text-4xl sm:text-6xl font-display font-extrabold text-ink-900 tracking-tight">
        Document Not Found
      </h1>
      <p className="text-base text-ink-600 font-serifDisplay italic max-w-md mx-auto">
        The requested archival route does not exist or has been relocated.
      </p>
      <div className="pt-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-ink-900 text-paper-100 hover:bg-ink-800 text-xs font-sans uppercase tracking-wider shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Overview</span>
        </Link>
      </div>
    </div>
  );
};
