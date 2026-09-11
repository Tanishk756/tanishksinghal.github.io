import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  chassisMaterial,
  metalJointMaterial,
  opticalLensMaterial,
  terracottaMaterial,
  highlightMaterial,
  copperTraceMaterial,
} from '../core/materials';

interface CubeSatArchetypeProps {
  isHovered?: boolean;
  isSelected?: boolean;
  reducedMotion?: boolean;
}

/**
 * Procedural 3U CubeSat Satellite Archetype
 * 
 * Scaled space-systems model representing nanosatellites, orbital payloads,
 * and CubeSat research projects (e.g., Hex-Star) with solar arrays and antenna.
 */
export const CubeSatArchetype: React.FC<CubeSatArchetypeProps> = ({
  isHovered = false,
  isSelected = false,
  reducedMotion = false,
}) => {
  const satelliteGroupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (reducedMotion) return;
    if (satelliteGroupRef.current) {
      // Gentle orbital axial rotation
      satelliteGroupRef.current.rotation.y += delta * 0.4;
      satelliteGroupRef.current.rotation.x = Math.sin(Date.now() * 0.001) * 0.08;
    }
  });

  const activeFrameMaterial = isSelected ? highlightMaterial : (isHovered ? terracottaMaterial : chassisMaterial);

  return (
    <group ref={satelliteGroupRef} position={[0, 0.45, 0]}>
      {/* 1. 3U ANODIZED ALUMINUM BUS BODY */}
      <mesh material={activeFrameMaterial} castShadow>
        <boxGeometry args={[0.3, 0.65, 0.3]} />
      </mesh>

      {/* Internal Avionics Core Stack (Glimpsed through rails) */}
      <mesh position={[0, 0, 0]} material={metalJointMaterial}>
        <boxGeometry args={[0.26, 0.6, 0.26]} />
      </mesh>

      {/* 2. DUAL DEPLOYABLE SOLAR PANEL WINGS */}
      {/* Right Solar Wing */}
      <group position={[0.42, 0, 0]}>
        <mesh material={metalJointMaterial}>
          <boxGeometry args={[0.5, 0.55, 0.015]} />
        </mesh>
        {/* Photovoltaic Cell Inset */}
        <mesh position={[0, 0, 0.01]} material={copperTraceMaterial}>
          <boxGeometry args={[0.46, 0.51, 0.005]} />
        </mesh>
        {/* Hinge Bracket */}
        <mesh position={[-0.26, 0, 0]} material={metalJointMaterial}>
          <cylinderGeometry args={[0.02, 0.02, 0.5, 12]} />
        </mesh>
      </group>

      {/* Left Solar Wing */}
      <group position={[-0.42, 0, 0]}>
        <mesh material={metalJointMaterial}>
          <boxGeometry args={[0.5, 0.55, 0.015]} />
        </mesh>
        {/* Photovoltaic Cell Inset */}
        <mesh position={[0, 0, 0.01]} material={copperTraceMaterial}>
          <boxGeometry args={[0.46, 0.51, 0.005]} />
        </mesh>
        {/* Hinge Bracket */}
        <mesh position={[0.26, 0, 0]} material={metalJointMaterial}>
          <cylinderGeometry args={[0.02, 0.02, 0.5, 12]} />
        </mesh>
      </group>

      {/* 3. NADIR EARTH-OBSERVATION PAYLOAD SENSOR APERTURE */}
      <group position={[0, -0.34, 0]}>
        <mesh material={metalJointMaterial}>
          <cylinderGeometry args={[0.07, 0.08, 0.06, 16]} />
        </mesh>
        <mesh position={[0, -0.03, 0]} material={opticalLensMaterial}>
          <circleGeometry args={[0.055, 16]} />
        </mesh>
      </group>

      {/* 4. TOP MONOPOLE / PATCH ANTENNA ARRAY */}
      <group position={[0, 0.34, 0]}>
        <mesh position={[0.06, 0.12, 0.06]} material={metalJointMaterial}>
          <cylinderGeometry args={[0.006, 0.006, 0.24, 8]} />
        </mesh>
        <mesh position={[-0.06, 0.08, -0.06]} material={metalJointMaterial}>
          <cylinderGeometry args={[0.006, 0.006, 0.16, 8]} />
        </mesh>
      </group>
    </group>
  );
};
