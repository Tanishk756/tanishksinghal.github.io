import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  chassisMaterial,
  shellMaterial,
  rubberMaterial,
  metalJointMaterial,
  opticalLensMaterial,
  terracottaMaterial,
  highlightMaterial,
} from '../core/materials';

interface WheeledRobotArchetypeProps {
  isHovered?: boolean;
  isSelected?: boolean;
  reducedMotion?: boolean;
}

/**
 * Procedural Wheeled Ground Robot Archetype
 * 
 * Scaled autonomous mobile robot platform representing ROS 2 autonomous navigation,
 * OpenROBO, and kinematics projects.
 */
export const WheeledRobotArchetype: React.FC<WheeledRobotArchetypeProps> = ({
  isHovered = false,
  isSelected = false,
  reducedMotion = false,
}) => {
  const lidarRef = useRef<THREE.Group>(null);
  const wheelsRef = useRef<THREE.Mesh[]>([]);

  useFrame((_, delta) => {
    if (reducedMotion) return;

    // Continuous LiDAR sensor spin
    if (lidarRef.current) {
      lidarRef.current.rotation.y += delta * 2.8;
    }

    // Subtle idle wheel oscillation
    wheelsRef.current.forEach((wheel, idx) => {
      if (wheel) {
        wheel.rotation.x += delta * (idx % 2 === 0 ? 0.6 : -0.6);
      }
    });
  });

  const activeChassisMaterial = isSelected ? highlightMaterial : (isHovered ? terracottaMaterial : chassisMaterial);

  // Wheel positions: FL, FR, RL, RR
  const wheelConfigs = [
    { x: 0.32, y: 0.08, z: 0.22 },
    { x: -0.32, y: 0.08, z: 0.22 },
    { x: 0.32, y: 0.08, z: -0.22 },
    { x: -0.32, y: 0.08, z: -0.22 },
  ];

  return (
    <group position={[0, 0.1, 0]}>
      {/* 1. CHASSIS MONOCOQUE BASE */}
      <mesh position={[0, 0.14, 0]} material={activeChassisMaterial} castShadow>
        <boxGeometry args={[0.54, 0.14, 0.68]} />
      </mesh>

      {/* Top Alabaster Shell Panel */}
      <mesh position={[0, 0.22, 0]} material={shellMaterial}>
        <boxGeometry args={[0.48, 0.04, 0.62]} />
      </mesh>

      {/* Terracotta Power / Status Switch */}
      <mesh position={[0.16, 0.25, 0.16]} material={terracottaMaterial}>
        <cylinderGeometry args={[0.02, 0.02, 0.03, 12]} />
      </mesh>

      {/* 2. 4 INDEPENDENT ALL-TERRAIN DRIVE WHEELS */}
      {wheelConfigs.map((cfg, idx) => (
        <group key={idx} position={[cfg.x, cfg.y, cfg.z]}>
          <mesh
            rotation={[0, 0, Math.PI / 2]}
            material={rubberMaterial}
            castShadow
            ref={(el) => {
              if (el) wheelsRef.current[idx] = el;
            }}
          >
            <cylinderGeometry args={[0.12, 0.12, 0.08, 20]} />
          </mesh>
          {/* Wheel Hub Plate */}
          <mesh rotation={[0, 0, Math.PI / 2]} material={metalJointMaterial}>
            <cylinderGeometry args={[0.06, 0.06, 0.085, 12]} />
          </mesh>
        </group>
      ))}

      {/* 3. SENSOR MAST & ROTATING LIDAR PUCK */}
      <group position={[0, 0.25, 0.05]}>
        {/* Mast Pedestal */}
        <mesh position={[0, 0.06, 0]} material={chassisMaterial}>
          <cylinderGeometry args={[0.03, 0.04, 0.12, 12]} />
        </mesh>

        {/* Rotating LiDAR Puck */}
        <group ref={lidarRef} position={[0, 0.14, 0]}>
          <mesh material={metalJointMaterial} castShadow>
            <cylinderGeometry args={[0.075, 0.075, 0.06, 20]} />
          </mesh>
          {/* Scanning Laser Emitter Slit */}
          <mesh position={[0, 0, 0.07]} material={terracottaMaterial}>
            <boxGeometry args={[0.035, 0.02, 0.015]} />
          </mesh>
        </group>
      </group>

      {/* 4. FORWARD STEREO OPTICAL CAMERAS */}
      <group position={[0, 0.16, 0.35]}>
        <mesh material={metalJointMaterial}>
          <boxGeometry args={[0.26, 0.04, 0.03]} />
        </mesh>
        <mesh position={[0.09, 0, 0.02]} rotation={[Math.PI / 2, 0, 0]} material={opticalLensMaterial}>
          <cylinderGeometry args={[0.022, 0.022, 0.02, 12]} />
        </mesh>
        <mesh position={[-0.09, 0, 0.02]} rotation={[Math.PI / 2, 0, 0]} material={opticalLensMaterial}>
          <cylinderGeometry args={[0.022, 0.022, 0.02, 12]} />
        </mesh>
      </group>
    </group>
  );
};
