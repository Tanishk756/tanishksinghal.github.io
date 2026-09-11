import React from 'react';
import { Link } from 'react-router-dom';
import { X, ArrowRight } from 'lucide-react';
import { InteractiveInspectionPayload } from './types';

interface ZonePortalCardProps {
  payload: InteractiveInspectionPayload | null;
  onClose?: () => void;
  className?: string;
}

/**
 * Compact Editorial Inspector & Zone Portal Overlay
 * 
 * Displays contextual technical information without obstructing the 3D scene,
 * providing direct discovery links to authentic Supabase project case studies.
 */
export const ZonePortalCard: React.FC<ZonePortalCardProps> = ({
  payload,
  onClose,
  className = '',
}) => {
  if (!payload) return null;

  return (
    <div
      className={`absolute top-3 right-3 max-w-[260px] sm:max-w-[280px] p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-paper-400 shadow-editorial transition-all animate-fadeIn z-10 select-none ${className}`}
      role="region"
      aria-label={`Inspection detail for ${payload.title}`}
    >
      <div className="flex items-start justify-between gap-2 pb-2 border-b border-paper-300">
        <div className="space-y-0.5">
          <span className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded bg-paper-200 text-stone-600 uppercase">
            {payload.category}
          </span>
          <h4 className="text-xs font-mono font-bold text-ink-900 uppercase tracking-tight pt-1">
            {payload.title}
          </h4>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-ink-900 transition-colors p-1"
            aria-label="Close inspector panel"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="pt-2 space-y-2.5">
        <p className="text-[11px] font-sans text-ink-700 leading-snug">
          {payload.description}
        </p>

        {payload.specs && payload.specs.length > 0 && (
          <div className="space-y-1 pt-1 border-t border-paper-200">
            {payload.specs.slice(0, 2).map((spec, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[10px] font-mono text-stone-500">
                <span className="w-1 h-1 rounded-full bg-terracotta" />
                <span className="truncate">{spec}</span>
              </div>
            ))}
          </div>
        )}

        {payload.routeUrl && (
          <div className="pt-1">
            <Link
              to={payload.routeUrl}
              className="inline-flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg bg-ink-900 text-paper-100 hover:bg-ink-800 text-[10px] font-mono font-medium uppercase tracking-wider transition-colors"
            >
              <span>{payload.actionLabel || 'VIEW CASE STUDY'}</span>
              <ArrowRight className="w-3 h-3 text-terracotta" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
