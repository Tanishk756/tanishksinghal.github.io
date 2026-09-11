import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { DigitalTwinScene } from './DigitalTwinScene';
import { SubsystemId, SUBSYSTEMS } from './types';
import { X, ShieldCheck, Compass, Eye, Disc3, Navigation, Cpu } from 'lucide-react';

const SUBSYSTEM_ICONS: Record<SubsystemId, React.ComponentType<{ className?: string }>> = {
  chassis: ShieldCheck,
  drive: Disc3,
  lidar: Compass,
  camera: Eye,
  imu: Navigation,
  compute: Cpu,
};

interface RobotDigitalTwinProps {
  className?: string;
}

export const RobotDigitalTwin: React.FC<RobotDigitalTwinProps> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredSubsystem, setHoveredSubsystem] = useState<SubsystemId | null>(null);
  const [selectedSubsystem, setSelectedSubsystem] = useState<SubsystemId | null>(null);
  const [hasWebGLError, setHasWebGLError] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  // 1. WebGL Capability Check
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setHasWebGLError(true);
      }
    } catch {
      setHasWebGLError(true);
    }
  }, []);

  // 2. Prefers Reduced Motion Detection
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // 3. Viewport Visibility Tracking (Pause R3F loop when off-screen)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        setIsVisible(entries[0]?.isIntersecting ?? true);
      },
      { threshold: 0.05 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleSelect = useCallback((id: SubsystemId) => {
    setSelectedSubsystem((prev) => (prev === id ? null : id));
  }, []);

  const handleHover = useCallback((id: SubsystemId | null) => {
    setHoveredSubsystem(id);
  }, []);

  // Active Subsystem for contextual display
  const activeSubsystemKey = hoveredSubsystem || selectedSubsystem;
  const activeSubsystem = activeSubsystemKey ? SUBSYSTEMS[activeSubsystemKey] : null;
  const SubsystemIcon = activeSubsystemKey ? SUBSYSTEM_ICONS[activeSubsystemKey] : null;

  // WebGL Fallback View
  if (hasWebGLError) {
    return (
      <div
        ref={containerRef}
        className={`relative flex flex-col justify-between w-full h-full min-h-[380px] sm:min-h-[440px] select-none p-4 rounded-2xl bg-paper-100 border border-paper-300 ${className}`}
      >
        <div className="flex items-center justify-between pb-2 border-b border-paper-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-stone-400" />
            <span className="text-[11px] font-mono font-semibold tracking-wider text-ink-900 uppercase">
              ROBOT 01 // DIGITAL TWIN
            </span>
          </div>
          <span className="text-[10px] font-mono text-stone-500">2D SCHEMATIC MODE</span>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-3 text-center">
          <div className="w-12 h-12 rounded-full bg-paper-200 border border-paper-300 flex items-center justify-center text-ink-800">
            <Navigation className="w-5 h-5 text-terracotta" />
          </div>
          <span className="text-xs font-mono font-semibold text-ink-900 uppercase tracking-wider">
            Autonomous Mobile Robot Platform
          </span>
          <span className="text-[11px] font-mono text-stone-500 max-w-xs">
            WebGL acceleration unavailable. Displaying static platform architecture.
          </span>
        </div>

        <div className="pt-2 border-t border-paper-300 flex items-center justify-between text-[10px] font-mono text-stone-500">
          <span>MODEL: AM-01</span>
          <span>ROS 2 COMPATIBLE</span>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col justify-between w-full h-full min-h-[380px] sm:min-h-[440px] select-none ${className}`}
      aria-label="Interactive 3D Autonomous Mobile Robot Digital Twin. Click or drag to rotate and inspect subsystems."
    >
      {/* 1. EDITORIAL HEADER BAR */}
      <div className="flex items-center justify-between px-2 pt-1 pb-2 border-b border-paper-300/80 pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-terracotta animate-pulse" />
          <span className="text-[11px] font-mono font-semibold tracking-wider text-ink-900 uppercase">
            ROBOT 01 // AUTONOMOUS DIGITAL TWIN
          </span>
        </div>
        <span className="text-[10px] font-mono text-stone-500 hidden sm:inline-block">
          3D INTERACTIVE MODEL
        </span>
      </div>

      {/* 2. REAL REACT THREE FIBER 3D CANVAS */}
      <div className="relative flex-1 w-full h-full min-h-[300px]">
        <Canvas
          shadows
          dpr={[1, 2]}
          camera={{ position: [3.8, 3.0, 4.2], fov: 38 }}
          frameloop={isVisible ? 'always' : 'never'}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
          }}
          className="w-full h-full"
        >
          <DigitalTwinScene
            hoveredSubsystem={hoveredSubsystem}
            selectedSubsystem={selectedSubsystem}
            onHover={handleHover}
            onSelect={handleSelect}
            reducedMotion={reducedMotion}
          />
        </Canvas>

        {/* 3. RESTRAINED EDITORIAL SUBSYSTEM INSPECTOR (Hover / Selection) */}
        {activeSubsystem && (
          <div className="absolute top-3 right-3 max-w-[240px] sm:max-w-[260px] p-3.5 rounded-2xl bg-white/95 backdrop-blur-md border border-paper-400 shadow-editorial transition-all animate-fadeIn z-10">
            <div className="flex items-start justify-between gap-2 pb-1.5 border-b border-paper-300">
              <div className="flex items-center gap-2">
                {SubsystemIcon && <SubsystemIcon className="w-3.5 h-3.5 text-terracotta" />}
                <span className="text-[11px] font-mono font-bold text-ink-900 uppercase tracking-tight">
                  {activeSubsystem.name}
                </span>
              </div>
              {selectedSubsystem && (
                <button
                  onClick={() => setSelectedSubsystem(null)}
                  className="text-stone-400 hover:text-ink-900 transition-colors p-0.5"
                  aria-label="Close subsystem detail"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="pt-2 space-y-1">
              <span className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded bg-paper-200 text-stone-600 uppercase">
                {activeSubsystem.category}
              </span>
              <p className="text-[11px] font-sans text-ink-700 leading-snug pt-1">
                {activeSubsystem.description}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 4. SUBTLE EDITORIAL FOOTER METADATA */}
      <div className="pt-2 pb-1 border-t border-paper-300/80 flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-stone-500 pointer-events-none">
        <span className="truncate">MODEL: AM-01 // ROS 2 // 360° LIDAR</span>
        <span className="hidden sm:inline-block text-stone-400">DRAG TO ROTATE // CLICK TO INSPECT</span>
      </div>
    </div>
  );
};
