import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { UAVDroneArchetype } from '../../archetypes/UAVDroneArchetype';
import { CubeSatArchetype } from '../../archetypes/CubeSatArchetype';

interface AerospaceZoneProps {
  reducedMotion?: boolean;
}

/**
 * Zone 03: Aerospace & Space Systems
 * 
 * Positioned at [1.2, 1.2, -28.0] with left-hand space for narrative typography.
 */
export const AerospaceZone: React.FC<AerospaceZoneProps> = ({ reducedMotion = false }) => {
  const uavRef = useRef<THREE.Group>(null);
  const cubeSatRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (reducedMotion) return;
    const t = state.clock.elapsedTime;
    if (uavRef.current) {
      uavRef.current.position.y = 0.4 + Math.sin(t * 1.5) * 0.06;
      uavRef.current.rotation.z = Math.sin(t * 1.2) * 0.04;
    }
    if (cubeSatRef.current) {
      cubeSatRef.current.rotation.y = t * 0.2;
      cubeSatRef.current.rotation.x = Math.sin(t * 0.15) * 0.1;
    }
  });

  return (
    <group position={[1.2, 1.2, -28.0]}>
      {/* 1. HIGH-ALTITUDE UAV DRONE AIRFRAME */}
      <group ref={uavRef} position={[-0.6, 0.4, 0.4]} scale={[1.15, 1.15, 1.15]}>
        <UAVDroneArchetype reducedMotion={reducedMotion} />
        {/* Ground Projection Target Ring */}
        <group position={[0, -1.55, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.5, 0.52, 32]} />
            <meshBasicMaterial color="#c2410c" transparent opacity={0.5} side={THREE.DoubleSide} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.2, 0.21, 24]} />
            <meshBasicMaterial color="#78716c" transparent opacity={0.4} side={THREE.DoubleSide} />
          </mesh>
        </group>
      </group>

      {/* 2. 3U CUBESAT SATELLITE & ORBITAL PLANE */}
      <group ref={cubeSatRef} position={[0.9, 0.6, -0.3]} scale={[1.0, 1.0, 1.0]}>
        <CubeSatArchetype reducedMotion={reducedMotion} />
        {/* Orbital Inclination Coordinate Ring */}
        <mesh rotation={[Math.PI / 4, 0, 0]}>
          <torusGeometry args={[0.9, 0.005, 12, 48]} />
          <meshBasicMaterial color="#78716c" transparent opacity={0.4} />
        </mesh>
      </group>

      {/* 3. FLIGHT ALTITUDE DATUM ELEVATION LINES */}
      <mesh position={[-0.6, -0.4, 0.4]}>
        <cylinderGeometry args={[0.002, 0.002, 1.6, 8]} />
        <meshBasicMaterial color="#d6d3d1" transparent opacity={0.5} />
      </mesh>
    </group>
  );
};
