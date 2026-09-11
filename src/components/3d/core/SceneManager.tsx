import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Navigation } from 'lucide-react';

interface SceneManagerProps {
  children: React.ReactNode;
  className?: string;
  cameraPosition?: [number, number, number];
  cameraFov?: number;
  fallbackTitle?: string;
  fallbackSubtitle?: string;
  ariaLabel?: string;
}

/**
 * Unified Scene Manager & Canvas Lifecycle Wrapper
 * 
 * Manages WebGL context verification, off-screen rendering suspension (0 FPS),
 * device pixel ratio bounds, and graceful 2D architectural schematic fallbacks.
 */
export const SceneManager: React.FC<SceneManagerProps> = ({
  children,
  className = '',
  cameraPosition = [3.8, 3.0, 4.2],
  cameraFov = 38,
  fallbackTitle = 'Autonomous Systems Engineering Lab',
  fallbackSubtitle = 'WebGL acceleration unavailable. Displaying static engineering schematic.',
  ariaLabel = 'Interactive 3D Engineering Environment',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hasWebGLError, setHasWebGLError] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // 1. WebGL Hardware Capability Detection
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

  // 2. Viewport Visibility Tracking (Zero FPS Offscreen Pause)
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

  // 2D Architectural Schematic Fallback
  if (hasWebGLError) {
    return (
      <div
        ref={containerRef}
        className={`relative flex flex-col justify-between w-full h-full min-h-[340px] select-none p-4 rounded-2xl bg-paper-100 border border-paper-300 ${className}`}
        role="region"
        aria-label={`${ariaLabel} (2D Schematic Mode)`}
      >
        <div className="flex items-center justify-between pb-2 border-b border-paper-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-stone-400" />
            <span className="text-[11px] font-mono font-semibold tracking-wider text-ink-900 uppercase">
              {fallbackTitle}
            </span>
          </div>
          <span className="text-[10px] font-mono text-stone-500">2D SCHEMATIC MODE</span>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-3 text-center">
          <div className="w-12 h-12 rounded-full bg-paper-200 border border-paper-300 flex items-center justify-center text-ink-800">
            <Navigation className="w-5 h-5 text-terracotta" />
          </div>
          <span className="text-xs font-mono font-semibold text-ink-900 uppercase tracking-wider">
            {fallbackTitle}
          </span>
          <span className="text-[11px] font-mono text-stone-500 max-w-xs">
            {fallbackSubtitle}
          </span>
        </div>

        <div className="pt-2 border-t border-paper-300 flex items-center justify-between text-[10px] font-mono text-stone-500">
          <span>COORDINATE: ROS 2 COMPLIANT</span>
          <span>STATIC ARCHITECTURE</span>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[300px] select-none ${className}`}
      aria-label={ariaLabel}
    >
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: cameraPosition, fov: cameraFov }}
        frameloop={isVisible ? 'always' : 'never'}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        className="w-full h-full"
      >
        {children}
      </Canvas>
    </div>
  );
};
