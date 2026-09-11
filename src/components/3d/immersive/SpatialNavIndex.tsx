import React from 'react';
import { WORLD_ZONES } from './cameraTimeline';

interface SpatialNavIndexProps {
  scrollProgress: number;
  onJumpToZone: (zoneIndex: number) => void;
}

/**
 * Minimal Spatial Navigation Index
 * 
 * Floating vertical index enabling instant camera flight across the 3D world zones.
 */
export const SpatialNavIndex: React.FC<SpatialNavIndexProps> = ({
  scrollProgress,
  onJumpToZone,
}) => {
  return (
    <nav
      aria-label="3D Spatial Zone Index"
      className="fixed right-6 top-1/2 -translate-y-1/2 z-20 hidden md:flex flex-col items-end gap-3 pointer-events-auto select-none"
    >
      {WORLD_ZONES.map((zone, idx) => {
        const isActive =
          scrollProgress >= zone.progressStart && scrollProgress <= zone.progressEnd;

        return (
          <button
            key={zone.id}
            onClick={() => onJumpToZone(idx)}
            className="group flex items-center gap-3 text-right py-1 transition-all"
          >
            {/* Zone Label */}
            <span
              className={`text-[10px] font-mono uppercase tracking-widest transition-colors ${
                isActive
                  ? 'text-ink-900 font-bold opacity-100'
                  : 'text-stone-400 group-hover:text-ink-700 opacity-60 group-hover:opacity-100'
              }`}
            >
              {zone.index} // {zone.id.toUpperCase()}
            </span>

            {/* Indicator Tick */}
            <span
              className={`h-px transition-all ${
                isActive
                  ? 'w-6 bg-terracotta'
                  : 'w-2 bg-stone-300 group-hover:w-4 group-hover:bg-ink-900'
              }`}
            />
          </button>
        );
      })}
    </nav>
  );
};
