import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  pcbSubstrateMaterial,
  copperTraceMaterial,
  metalJointMaterial,
  terracottaMaterial,
  highlightMaterial,
  chassisMaterial,
} from '../core/materials';

interface PCBArchetypeProps {
  isHovered?: boolean;
  isSelected?: boolean;
  reducedMotion?: boolean;
}

/**
 * Procedural Embedded PCB Board Archetype
 * 
 * Scaled electronics board representing embedded systems, firmware,
 * and hardware design projects with FR4 substrate, copper traces, and MCU IC.
 */
export const PCBArchetype: React.FC<PCBArchetypeProps> = ({
  isHovered = false,
  isSelected = false,
  reducedMotion = false,
}) => {
  const pcbGroupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (reducedMotion) return;
    if (pcbGroupRef.current) {
      pcbGroupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.12;
    }
  });

  const activeSubstrate = isSelected ? highlightMaterial : (isHovered ? terracottaMaterial : pcbSubstrateMaterial);

  return (
    <group ref={pcbGroupRef} position={[0, 0.25, 0]}>
      {/* 1. MULTI-LAYER FR4 SUBSTRATE BOARD */}
      <mesh material={activeSubstrate} castShadow>
        <boxGeometry args={[0.7, 0.02, 0.5]} />
      </mesh>

      {/* 2. CENTRAL QFP/BGA MAIN PROCESSOR MCU */}
      <group position={[0, 0.02, 0]}>
        <mesh material={chassisMaterial}>
          <boxGeometry args={[0.22, 0.025, 0.22]} />
        </mesh>
        {/* Silicon Die Inset / Status Dot */}
        <mesh position={[0.07, 0.015, 0.07]} material={copperTraceMaterial}>
          <cylinderGeometry args={[0.01, 0.01, 0.005, 8]} />
        </mesh>
      </group>

      {/* 3. COPPER TRACE ROUTING STRIPS */}
      <mesh position={[0.18, 0.012, 0]} material={copperTraceMaterial}>
        <boxGeometry args={[0.24, 0.002, 0.03]} />
      </mesh>
      <mesh position={[-0.18, 0.012, 0.1]} material={copperTraceMaterial}>
        <boxGeometry args={[0.22, 0.002, 0.02]} />
      </mesh>
      <mesh position={[0, 0.012, -0.16]} material={copperTraceMaterial}>
        <boxGeometry args={[0.4, 0.002, 0.02]} />
      </mesh>

      {/* 4. SMD PASSIVE COMPONENTS & CAPACITORS */}
      {[-0.22, -0.12, 0.12, 0.22].map((x, i) => (
        <mesh key={i} position={[x, 0.02, -0.12]} material={metalJointMaterial}>
          <boxGeometry args={[0.04, 0.02, 0.025]} />
        </mesh>
      ))}

      {/* 5. GPIO / SERIAL PIN HEADER ROW */}
      <group position={[0, 0.03, 0.2]}>
        {[-0.25, -0.15, -0.05, 0.05, 0.15, 0.25].map((x, i) => (
          <mesh key={i} position={[x, 0.02, 0]} material={copperTraceMaterial}>
            <cylinderGeometry args={[0.008, 0.008, 0.06, 8]} />
          </mesh>
        ))}
      </group>

      {/* 6. CORNER MOUNTING STANDOFF HOLES */}
      {[
        [0.3, 0.2],
        [-0.3, 0.2],
        [0.3, -0.2],
        [-0.3, -0.2],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.012, z]} material={metalJointMaterial}>
          <cylinderGeometry args={[0.025, 0.025, 0.022, 12]} />
        </mesh>
      ))}
    </group>
  );
};
