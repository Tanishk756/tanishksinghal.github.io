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
  const navZones = [
    { label: 'Robotics', index: 1 },
    { label: 'Autonomy', index: 2 },
    { label: 'Aerospace', index: 3 },
    { label: 'Research', index: 4 },
    { label: 'Projects', index: 5 },
    { label: 'Contact', index: 6 },
  ];

  return (
    <nav
      aria-label="Portfolio Navigation Index"
      className="fixed right-6 top-1/2 -translate-y-1/2 z-20 hidden md:flex flex-col items-end gap-3 pointer-events-auto select-none"
    >
      {navZones.map(({ label, index }) => {
        const zone = WORLD_ZONES[index];
        const isActive =
          scrollProgress >= zone.progressStart && scrollProgress <= zone.progressEnd;

        return (
          <button
            key={zone.id}
            onClick={() => onJumpToZone(index)}
            className="group flex items-center gap-2.5 text-right py-1 transition-all"
          >
            {/* Zone Label */}
            <span
              className={`text-[11px] font-mono tracking-wider transition-colors ${
                isActive
                  ? 'text-ink-900 font-bold opacity-100'
                  : 'text-stone-400 group-hover:text-ink-800 opacity-60 group-hover:opacity-100'
              }`}
            >
              0{index} {label}
            </span>

            {/* Indicator Tick */}
            <span
              className={`h-px transition-all ${
                isActive
                  ? 'w-5 bg-terracotta'
                  : 'w-2 bg-stone-300 group-hover:w-3.5 group-hover:bg-ink-800'
              }`}
            />
          </button>
        );
      })}
    </nav>
  );
};
