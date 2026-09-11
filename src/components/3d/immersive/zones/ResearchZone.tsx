import React from 'react';
import { SystemsPipelineArchetype } from '../../archetypes/SystemsPipelineArchetype';
import { PCBArchetype } from '../../archetypes/PCBArchetype';

interface ResearchZoneProps {
  reducedMotion?: boolean;
}

/**
 * Zone 04: Systems Architecture & Research
 * 
 * Positioned at [-1.0, 0.6, -38.0] with right-hand space for narrative typography.
 */
export const ResearchZone: React.FC<ResearchZoneProps> = ({ reducedMotion = false }) => {
  return (
    <group position={[-1.5, 0.6, -58.0]}>
      {/* 1. DISTRIBUTED SYSTEMS PIPELINE NODE GRAPH */}
      <group position={[-0.5, 0.3, 0]} scale={[1.0, 1.0, 1.0]}>
        <SystemsPipelineArchetype reducedMotion={reducedMotion} />
      </group>

      {/* 2. REAL-TIME EMBEDDED PCB HARDWARE PLATFORM */}
      <group position={[0.4, 0.0, -0.2]} rotation={[-Math.PI / 4, Math.PI / 6, 0]} scale={[0.8, 0.8, 0.8]}>
        <PCBArchetype reducedMotion={reducedMotion} />
      </group>

      {/* 3. HARDWARE-IN-THE-LOOP INTERCONNECT DATA BUS */}
      <mesh position={[-0.05, 0.15, -0.1]} rotation={[0, 0, Math.PI / 4]}>
        <cylinderGeometry args={[0.004, 0.004, 0.8, 8]} />
        <meshBasicMaterial color="#c2410c" transparent opacity={0.6} />
      </mesh>
    </group>
  );
};
