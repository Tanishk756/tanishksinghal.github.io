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
      uavRef.current.position.y = 1.25 + Math.sin(t * 1.5) * 0.05;
      uavRef.current.rotation.z = Math.sin(t * 1.2) * 0.04;
      uavRef.current.rotation.y = Math.sin(t * 0.8) * 0.08;
    }
    if (cubeSatRef.current) {
      cubeSatRef.current.rotation.y = t * 0.2;
      cubeSatRef.current.rotation.x = Math.sin(t * 0.15) * 0.12;
      cubeSatRef.current.position.y = 2.2 + Math.sin(t * 0.5) * 0.04;
    }
  });

  return (
    <group position={[0.8, 0, -42.0]}>
      {/* 1. HIGH-ALTITUDE UAV DRONE AIRFRAME (MID-AIR SPATIAL LAYER) */}
      <group ref={uavRef} position={[-0.4, 1.25, 0.4]} scale={[1.2, 1.2, 1.2]}>
        <UAVDroneArchetype reducedMotion={reducedMotion} />
        {/* Optical Target Tracking Crosshair Frame */}
        <group position={[0, -0.15, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.08, 0.085, 16]} />
            <meshBasicMaterial color="#c2410c" />
          </mesh>
        </group>
      </group>

      {/* Ground Projection Target Ring Directly Below UAV */}
      <group position={[-0.4, 0.005, 0.4]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.6, 0.62, 32]} />
          <meshBasicMaterial color="#c2410c" transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.25, 0.26, 24]} />
          <meshBasicMaterial color="#78716c" transparent opacity={0.4} side={THREE.DoubleSide} />
        </mesh>
        {/* Vertical Altitude Line */}
        <mesh position={[0, 0.62, 0]}>
          <cylinderGeometry args={[0.002, 0.002, 1.25, 8]} />
          <meshBasicMaterial color="#d6d3d1" transparent opacity={0.5} />
        </mesh>
      </group>

      {/* 2. 3U CUBESAT SATELLITE (UPPER ORBITAL SPATIAL LAYER) */}
      <group ref={cubeSatRef} position={[1.1, 2.2, -0.6]} scale={[1.05, 1.05, 1.05]}>
        <CubeSatArchetype reducedMotion={reducedMotion} />
        {/* Orbital Inclination Coordinate Ring */}
        <mesh rotation={[Math.PI / 3, 0.2, 0]}>
          <torusGeometry args={[0.95, 0.004, 12, 48]} />
          <meshBasicMaterial color="#78716c" transparent opacity={0.45} />
        </mesh>
      </group>

      {/* Altitude Reference Scale Marks on the Vertical Axis */}
      {[0.4, 0.8, 1.2, 1.6, 2.0].map((alt) => (
        <mesh key={alt} position={[-0.4, alt, 0.4]}>
          <boxGeometry args={[0.04, 0.002, 0.04]} />
          <meshBasicMaterial color="#a8a29e" />
        </mesh>
      ))}
    </group>
  );
};
