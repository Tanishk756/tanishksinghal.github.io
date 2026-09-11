import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ContactZoneProps {
  reducedMotion?: boolean;
}

/**
 * Zone 06: Transmission & Directory
 * 
 * Positioned at [0.0, 0.0, -62.0].
 */
export const ContactZone: React.FC<ContactZoneProps> = ({ reducedMotion = false }) => {
  const pulseRingRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (reducedMotion) return;
    const t = (state.clock.elapsedTime * 0.8) % 2.0;
    if (pulseRingRef.current) {
      const scale = 0.5 + t * 0.8;
      pulseRingRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group position={[0.0, 0.0, -62.0]}>
      {/* 1. TRANSMISSION BASE & DATUM FLOOR RING */}
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.5, 1.52, 48]} />
        <meshBasicMaterial color="#c2410c" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>

      <mesh position={[0, 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.8, 0.815, 36]} />
        <meshBasicMaterial color="#d6d3d1" side={THREE.DoubleSide} />
      </mesh>

      {/* 2. TRANSCEIVER MAST */}
      <mesh position={[0, 0.45, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.08, 0.9, 16]} />
        <meshStandardMaterial color="#1c1917" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* 3. TRANSMISSION EMITTER NUCLEUS */}
      <mesh position={[0, 0.95, 0]}>
        <sphereGeometry args={[0.07, 24, 24]} />
        <meshStandardMaterial color="#c2410c" roughness={0.2} metalness={0.7} />
      </mesh>

      {/* 4. PULSING RADIO FREQUENCY RINGS */}
      <group ref={pulseRingRef} position={[0, 0.95, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.3, 0.32, 32]} />
          <meshBasicMaterial color="#c2410c" transparent opacity={0.4} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* 5. CARDINAL ANTENNA STRUTS */}
      {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((rad, idx) => (
        <group key={idx} rotation={[0, rad, 0]}>
          <mesh position={[0.35, 0.25, 0]} rotation={[0, 0, -Math.PI / 4]}>
            <cylinderGeometry args={[0.006, 0.006, 0.7, 8]} />
            <meshStandardMaterial color="#78716c" metalness={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  );
};
