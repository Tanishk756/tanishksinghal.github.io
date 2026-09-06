import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  to?: string;
  path?: string; // Support either to or path
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-mono text-stone-500 py-3 mb-6 border-b border-paper-300">
      <Link 
        to="/" 
        className="flex items-center gap-1 text-stone-500 hover:text-ink-900 transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
        <span>OVERVIEW</span>
      </Link>

      {items.map((item, idx) => {
        const linkTarget = item.to || item.path;
        return (
          <React.Fragment key={idx}>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            {linkTarget ? (
              <Link 
                to={linkTarget} 
                className="text-stone-500 hover:text-ink-900 transition-colors uppercase"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-ink-900 font-semibold uppercase truncate max-w-xs sm:max-w-md">
                {item.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
