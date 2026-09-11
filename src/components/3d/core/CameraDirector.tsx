import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { WorldZone, CAMERA_PRESETS, CameraPreset } from './types';

interface CameraDirectorProps {
  zone?: WorldZone;
  customPreset?: CameraPreset;
  focusTarget?: [number, number, number] | null;
  enableZoom?: boolean;
  reducedMotion?: boolean;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
}

/**
 * Global Camera Director & State Machine
 * 
 * Provides cinematic, damped orbital navigation with customizable zone presets,
 * focus targets, constrained polar rotation, and cursor parallax.
 */
export const CameraDirector: React.FC<CameraDirectorProps> = ({
  zone = 'world-hub',
  customPreset,
  focusTarget,
  enableZoom = false,
  reducedMotion = false,
  autoRotate = false,
  autoRotateSpeed = 0.35,
}) => {
  const controlsRef = useRef<any>(null);
  const { camera, pointer } = useThree();

  const activePreset = customPreset || CAMERA_PRESETS[zone] || CAMERA_PRESETS['world-hub'];
  const targetPos = useRef(new THREE.Vector3(...activePreset.position));
  const targetLookAt = useRef(
    focusTarget ? new THREE.Vector3(...focusTarget) : new THREE.Vector3(...activePreset.target)
  );

  useEffect(() => {
    targetPos.current.set(...activePreset.position);
    if (focusTarget) {
      targetLookAt.current.set(...focusTarget);
    } else {
      targetLookAt.current.set(...activePreset.target);
    }
  }, [zone, customPreset, focusTarget, activePreset]);

  useFrame((_, delta) => {
    if (reducedMotion) return;

    // Damped interpolation towards active preset
    const step = Math.min(delta * 3.5, 0.15);
    camera.position.lerp(targetPos.current, step);

    if (controlsRef.current) {
      controlsRef.current.target.lerp(targetLookAt.current, step);
      
      // Subtle cursor parallax effect
      const parallaxFactor = 0.08;
      controlsRef.current.target.x += (pointer.x * parallaxFactor - (controlsRef.current.target.x - targetLookAt.current.x)) * step;
      controlsRef.current.target.y += (pointer.y * parallaxFactor - (controlsRef.current.target.y - targetLookAt.current.y)) * step;
      
      controlsRef.current.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.06}
      enableZoom={enableZoom}
      enablePan={false}
      minPolarAngle={activePreset.minPolarAngle ?? Math.PI / 4}
      maxPolarAngle={activePreset.maxPolarAngle ?? (Math.PI / 180) * 80}
      autoRotate={autoRotate && !reducedMotion}
      autoRotateSpeed={autoRotateSpeed}
      makeDefault
    />
  );
};
