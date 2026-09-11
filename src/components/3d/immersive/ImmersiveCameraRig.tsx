import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { interpolateCameraState } from './cameraTimeline';

interface ImmersiveCameraRigProps {
  scrollProgress: number;
  mousePos?: { x: number; y: number };
  reducedMotion?: boolean;
}

export const ImmersiveCameraRig: React.FC<ImmersiveCameraRigProps> = ({
  scrollProgress,
  mousePos = { x: 0, y: 0 },
  reducedMotion = false,
}) => {
  const { camera } = useThree();
  const currentPos = useRef(new THREE.Vector3(0, 1.8, 5.0));
  const currentTarget = useRef(new THREE.Vector3(0, 0.6, 0.0));
  const targetPos = useRef(new THREE.Vector3());
  const targetLook = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    // 1. Calculate desired camera state from scroll progress
    const { fov } = interpolateCameraState(
      scrollProgress,
      targetPos.current,
      targetLook.current
    );

    // 2. Add subtle parallax offset from mouse (damped)
    if (!reducedMotion) {
      targetPos.current.x += mousePos.x * 0.18;
      targetPos.current.y += mousePos.y * 0.12;
    }

    // 3. Smooth damping towards target (lerp factor based on frame delta)
    const lerpFactor = Math.min(1, delta * (reducedMotion ? 12 : 5));
    currentPos.current.lerp(targetPos.current, lerpFactor);
    currentTarget.current.lerp(targetLook.current, lerpFactor);

    // 4. Apply to Three.js camera
    camera.position.copy(currentPos.current);
    camera.lookAt(currentTarget.current);

    if (camera instanceof THREE.PerspectiveCamera) {
      if (Math.abs(camera.fov - fov) > 0.01) {
        camera.fov = THREE.MathUtils.lerp(camera.fov, fov, lerpFactor);
        camera.updateProjectionMatrix();
      }
    }
  });

  return null;
};
