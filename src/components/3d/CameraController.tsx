import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

interface CameraControllerProps {
  autoRotate?: boolean;
}

/**
 * Camera Controller with Damped Orbit & Restrained Cursor Parallax
 * Prevents disorienting rotations and keeps camera above the ground plane.
 */
export const CameraController: React.FC<CameraControllerProps> = ({ autoRotate = true }) => {
  const controlsRef = useRef<any>(null);
  const { pointer } = useThree();
  const targetOffset = useRef(new THREE.Vector3(0, 0.35, 0));

  useFrame(() => {
    // Subtle cursor parallax effect on target lookAt
    const parallaxX = pointer.x * 0.15;
    const parallaxY = pointer.y * 0.08;

    targetOffset.current.x += (parallaxX - targetOffset.current.x) * 0.05;
    targetOffset.current.y += (0.35 + parallaxY - targetOffset.current.y) * 0.05;

    if (controlsRef.current) {
      controlsRef.current.target.copy(targetOffset.current);
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      enableZoom={false}
      minPolarAngle={Math.PI / 4} // ~45 deg
      maxPolarAngle={Math.PI / 2.2} // ~80 deg
      rotateSpeed={0.6}
      dampingFactor={0.06}
      enableDamping={true}
      autoRotate={autoRotate}
      autoRotateSpeed={0.35}
    />
  );
};
