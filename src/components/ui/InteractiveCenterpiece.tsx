import React, { Suspense, lazy } from 'react';
import { Navigation } from 'lucide-react';

const LazyRobotDigitalTwin = lazy(() =>
  import('../3d/RobotDigitalTwin').then(module => ({ default: module.RobotDigitalTwin }))
);

const CenterpieceFallback: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    className={`relative flex flex-col justify-between w-full h-full min-h-[380px] sm:min-h-[440px] select-none ${className}`}
  >
    <div className="flex items-center justify-between px-2 pt-1 pb-2 border-b border-paper-300/80">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-terracotta" />
        <span className="text-[11px] font-mono font-semibold tracking-wider text-ink-900 uppercase">
          ROBOT 01 // AUTONOMOUS DIGITAL TWIN
        </span>
      </div>
      <span className="text-[10px] font-mono text-stone-500 hidden sm:inline-block">
        INITIALIZING 3D ENGINE...
      </span>
    </div>

    <div className="flex-1 w-full flex flex-col items-center justify-center p-6 space-y-3">
      <div className="w-12 h-12 rounded-full bg-paper-200 border border-paper-400 flex items-center justify-center text-ink-900 animate-pulse">
        <Navigation className="w-6 h-6 text-terracotta" />
      </div>
      <div className="space-y-1 text-center">
        <span className="text-xs font-mono font-semibold text-ink-900 uppercase tracking-wider block">
          Loading Robotic Digital Twin
        </span>
        <span className="text-[11px] font-mono text-stone-500">
          Mounting spatial physics & kinematics pipeline
        </span>
      </div>
    </div>

    <div className="pt-3 pb-1 border-t border-paper-300/80 flex items-center justify-between text-[11px] font-mono text-stone-500">
      <span>POSE: X 0.00 Y 0.00 θ 0°</span>
      <span>MODE: MANUAL</span>
    </div>
  </div>
);

/**
 * Signature Interactive 3D Robot Digital Twin Hero Centerpiece
 * 
 * Replaces legacy static coordinate figure with a procedural, interactive
 * 3D autonomous mobile robot platform reflecting robotics research,
 * perception subsystems, and trajectory simulation.
 */
export const InteractiveCenterpiece: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <Suspense fallback={<CenterpieceFallback className={className} />}>
      <LazyRobotDigitalTwin className={className} />
    </Suspense>
  );
};

