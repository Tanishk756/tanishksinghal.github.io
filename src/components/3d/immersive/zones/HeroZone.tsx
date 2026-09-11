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

  const outerRingRef = useRef<THREE.Group>(null);
  const midRingRef = useRef<THREE.Group>(null);
  const innerRingRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (reducedMotion) return;
    const t = state.clock.elapsedTime;
    if (outerRingRef.current) {
      outerRingRef.current.rotation.y = t * 0.15;
      outerRingRef.current.rotation.x = Math.sin(t * 0.2) * 0.1;
    }
    if (midRingRef.current) {
      midRingRef.current.rotation.z = -t * 0.22;
      midRingRef.current.rotation.y = Math.cos(t * 0.25) * 0.15;
    }
    if (innerRingRef.current) {
      innerRingRef.current.rotation.x = t * 0.3;
      innerRingRef.current.rotation.z = Math.sin(t * 0.3) * 0.2;
    }
  });

  const position: [number, number, number] = isMobile ? [0, 0.95, -0.2] : [0, 0.85, 0];
  const scale: [number, number, number] = isMobile ? [0.72, 0.72, 0.72] : [1.0, 1.0, 1.0];

  return (
    <group position={position} scale={scale}>
      {/* 1. ORIGIN DATUM RING ON FLOOR */}
      <group position={[0, -0.74, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.2, 1.22, 48]} />
          <meshBasicMaterial color="#d6d3d1" side={THREE.DoubleSide} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.6, 0.615, 36]} />
          <meshBasicMaterial color="#c2410c" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* 2. MATHEMATICAL KINEMATIC GYROSCOPE SCULPTURE */}
      <group ref={outerRingRef}>
        <mesh>
          <torusGeometry args={[1.05, 0.012, 16, 64]} />
          <meshStandardMaterial color="#141517" roughness={0.3} metalness={0.8} />
        </mesh>
      </group>

      <group ref={midRingRef}>
        <mesh>
          <torusGeometry args={[0.8, 0.01, 16, 64]} />
          <meshStandardMaterial color="#57534e" roughness={0.3} metalness={0.7} />
        </mesh>
      </group>

      <group ref={innerRingRef}>
        <mesh>
          <torusGeometry args={[0.55, 0.008, 16, 48]} />
          <meshStandardMaterial color="#c2410c" roughness={0.2} metalness={0.6} />
        </mesh>
      </group>

      {/* 3. CENTRAL MONUMENTAL NUCLEUS */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.07, 24, 24]} />
        <meshStandardMaterial color="#141517" roughness={0.2} metalness={0.9} />
      </mesh>

      {/* 4. COORDINATE AXIS CROSS-HAIRS */}
      <group>
        <mesh position={[0.65, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <cylinderGeometry args={[0.004, 0.004, 0.35, 8]} />
          <meshBasicMaterial color="#c2410c" />
        </mesh>
        <mesh position={[0, 0.65, 0]}>
          <cylinderGeometry args={[0.004, 0.004, 0.35, 8]} />
          <meshBasicMaterial color="#141517" />
        </mesh>
        <mesh position={[0, 0, 0.65]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.004, 0.004, 0.35, 8]} />
          <meshBasicMaterial color="#78716c" />
        </mesh>
      </group>
    </group>
  );
};
