import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface HeroZoneProps {
  reducedMotion?: boolean;
}

/**
 * Zone 00: Engineering Lab / Opening Vista
 * 
 * Dynamically adjusts sculpture position based on viewport width:
 * - Desktop: right-aligned [1.2, 0.75, 0] for balanced two-column composition.
 * - Mobile: elevated [0.1, 1.3, -1.2] for vertical stacking.
 */
export const HeroZone: React.FC<HeroZoneProps> = ({ reducedMotion = false }) => {
  const { viewport } = useThree();
  const isMobile = viewport.width < 5.0;

  const innerCoreRef = useRef<THREE.Group>(null);
  const orbitalRingRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (reducedMotion) return;
    const t = state.clock.elapsedTime;
    if (innerCoreRef.current) {
      innerCoreRef.current.rotation.y = t * 0.12;
      innerCoreRef.current.rotation.x = Math.sin(t * 0.15) * 0.06;
    }
    if (orbitalRingRef.current) {
      orbitalRingRef.current.rotation.z = -t * 0.18;
      orbitalRingRef.current.rotation.y = Math.cos(t * 0.2) * 0.1;
    }
  });

  const position: [number, number, number] = isMobile ? [0, -0.25, 0] : [0, -0.2, 0];
  const scale: [number, number, number] = isMobile ? [0.65, 0.65, 0.65] : [0.85, 0.85, 0.85];

  return (
    <group position={position} scale={scale}>
      {/* 1. ARCHITECTURAL FLOOR DATUM RINGS */}
      <group position={[0, 0.005, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.5, 1.515, 64]} />
          <meshBasicMaterial color="#e7e5e4" side={THREE.DoubleSide} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.9, 0.91, 48]} />
          <meshBasicMaterial color="#d6d3d1" side={THREE.DoubleSide} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.4, 0.41, 36]} />
          <meshBasicMaterial color="#c2410c" transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* 2. LOW-PROFILE KINETIC ENGINEERING CORE */}
      <group position={[0, 0.35, 0]}>
        {/* Orbital Precision Ring */}
        <group ref={orbitalRingRef}>
          <mesh>
            <torusGeometry args={[0.65, 0.008, 16, 48]} />
            <meshStandardMaterial color="#57534e" roughness={0.3} metalness={0.7} />
          </mesh>
        </group>

        {/* Inner Articulated Gimbal */}
        <group ref={innerCoreRef}>
          <mesh rotation={[Math.PI / 4, 0, 0]}>
            <torusGeometry args={[0.45, 0.006, 16, 48]} />
            <meshStandardMaterial color="#c2410c" roughness={0.2} metalness={0.6} />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.06, 24, 24]} />
            <meshStandardMaterial color="#141517" roughness={0.2} metalness={0.9} />
          </mesh>
        </group>

        {/* Ground Support Pedestal Mast */}
        <mesh position={[0, -0.18, 0]}>
          <cylinderGeometry args={[0.015, 0.03, 0.35, 16]} />
          <meshStandardMaterial color="#292524" roughness={0.4} metalness={0.8} />
        </mesh>
      </group>
    </group>
  );
};
