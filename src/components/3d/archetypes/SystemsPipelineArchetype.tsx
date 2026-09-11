import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  chassisMaterial,
  metalJointMaterial,
  terracottaMaterial,
  highlightMaterial,
  opticalLensMaterial,
} from '../core/materials';

interface SystemsPipelineArchetypeProps {
  isHovered?: boolean;
  isSelected?: boolean;
  reducedMotion?: boolean;
}

/**
 * Procedural Systems Pipeline 3D Archetype
 * 
 * Scaled 3D node-graph representing AI/ML models, computer vision systems,
 * and software architectures (e.g., APEX-Track, Vision System).
 */
export const SystemsPipelineArchetype: React.FC<SystemsPipelineArchetypeProps> = ({
  isHovered = false,
  isSelected = false,
  reducedMotion = false,
}) => {
  const rootRef = useRef<THREE.Group>(null);
  const nodesRef = useRef<THREE.Mesh[]>([]);

  useFrame((state) => {
    if (reducedMotion) return;
    if (rootRef.current) {
      rootRef.current.position.y = 0.35 + Math.sin(state.clock.elapsedTime * 1.5) * 0.03;
    }
    // Subtle node pulsing
    nodesRef.current.forEach((node, idx) => {
      if (node) {
        const s = 1.0 + Math.sin(state.clock.elapsedTime * 3.0 + idx) * 0.08;
        node.scale.set(s, s, s);
      }
    });
  });

  const activeMaterial = isSelected ? highlightMaterial : (isHovered ? terracottaMaterial : chassisMaterial);

  // Node positions: Perception, Fusion, Planning, Execution
  const nodes = [
    { x: -0.4, y: 0.1, z: 0.2, label: 'PERCEPTION' },
    { x: -0.15, y: 0.25, z: -0.1, label: 'ESTIMATION' },
    { x: 0.15, y: 0.15, z: 0.15, label: 'PLANNING' },
    { x: 0.4, y: 0.3, z: -0.15, label: 'CONTROL' },
  ];

  return (
    <group ref={rootRef} position={[0, 0.3, 0]}>
      {/* 1. INTERCONNECTED PIPELINE NODES */}
      {nodes.map((n, idx) => (
        <group key={idx} position={[n.x, n.y, n.z]}>
          <mesh
            material={idx === 0 ? opticalLensMaterial : activeMaterial}
            castShadow
            ref={(el) => {
              if (el) nodesRef.current[idx] = el;
            }}
          >
            <octahedronGeometry args={[0.09, 0]} />
          </mesh>
          {/* Inner Core Indicator */}
          <mesh material={terracottaMaterial}>
            <sphereGeometry args={[0.035, 8, 8]} />
          </mesh>
        </group>
      ))}

      {/* 2. CONNECTING SIGNAL TRACE BARS */}
      {nodes.slice(0, nodes.length - 1).map((n, idx) => {
        const next = nodes[idx + 1];
        const midX = (n.x + next.x) / 2;
        const midY = (n.y + next.y) / 2;
        const midZ = (n.z + next.z) / 2;
        const len = Math.sqrt(
          Math.pow(next.x - n.x, 2) + Math.pow(next.y - n.y, 2) + Math.pow(next.z - n.z, 2)
        );

        return (
          <group key={idx} position={[midX, midY, midZ]}>
            <mesh material={metalJointMaterial}>
              <boxGeometry args={[len, 0.015, 0.015]} />
            </mesh>
          </group>
        );
      })}

      {/* 3. BASELINE PEDESTAL GRID */}
      <mesh position={[0, -0.08, 0]} material={metalJointMaterial}>
        <cylinderGeometry args={[0.45, 0.5, 0.04, 24]} />
      </mesh>
    </group>
  );
};
