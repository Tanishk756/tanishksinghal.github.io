import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  chassisMaterial,
  metalJointMaterial,
  terracottaMaterial,
  highlightMaterial,
} from '../core/materials';

interface RoboticArmArchetypeProps {
  isHovered?: boolean;
  isSelected?: boolean;
  reducedMotion?: boolean;
}

/**
 * Procedural Articulated Robotic Arm Archetype
 * 
 * Scaled 6-DOF serial manipulator representing autonomy and robotic kinematics projects.
 */
export const RoboticArmArchetype: React.FC<RoboticArmArchetypeProps> = ({
  isHovered = false,
  isSelected = false,
  reducedMotion = false,
}) => {
  const baseTurntableRef = useRef<THREE.Group>(null);
  const wristRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (reducedMotion) return;
    if (baseTurntableRef.current) {
      baseTurntableRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.7) * 0.35;
    }
    if (wristRef.current) {
      wristRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 1.4) * 0.2;
    }
  });

  const activeMaterial = isSelected ? highlightMaterial : (isHovered ? terracottaMaterial : chassisMaterial);

  return (
    <group position={[0, 0, 0]}>
      {/* 1. BASE MOUNTING FLANGE */}
      <mesh position={[0, 0.04, 0]} material={metalJointMaterial} castShadow>
        <cylinderGeometry args={[0.22, 0.26, 0.08, 20]} />
      </mesh>

      {/* 2. ROTATING TURNTABLE WAIST */}
      <group ref={baseTurntableRef} position={[0, 0.08, 0]}>
        <mesh position={[0, 0.08, 0]} material={activeMaterial}>
          <cylinderGeometry args={[0.16, 0.18, 0.16, 16]} />
        </mesh>

        {/* 3. SHOULDER JOINT & LINK 1 */}
        <group position={[0, 0.18, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]} material={metalJointMaterial}>
            <cylinderGeometry args={[0.09, 0.09, 0.18, 16]} />
          </mesh>
          {/* Upper Arm Beam */}
          <mesh position={[0, 0.22, 0]} material={chassisMaterial} castShadow>
            <boxGeometry args={[0.11, 0.44, 0.1]} />
          </mesh>

          {/* 4. ELBOW JOINT & LINK 2 */}
          <group position={[0, 0.44, 0]}>
            <mesh rotation={[0, 0, Math.PI / 2]} material={metalJointMaterial}>
              <cylinderGeometry args={[0.075, 0.075, 0.16, 16]} />
            </mesh>
            {/* Forearm Beam */}
            <mesh position={[0.12, 0.16, 0]} rotation={[0, 0, -Math.PI / 6]} material={chassisMaterial}>
              <boxGeometry args={[0.08, 0.36, 0.08]} />
            </mesh>

            {/* 5. WRIST & 2-FINGER GRIPPER */}
            <group ref={wristRef} position={[0.22, 0.32, 0]}>
              <mesh material={metalJointMaterial}>
                <sphereGeometry args={[0.06, 12, 12]} />
              </mesh>
              {/* Gripper Base */}
              <mesh position={[0, 0.06, 0]} material={activeMaterial}>
                <boxGeometry args={[0.12, 0.03, 0.06]} />
              </mesh>
              {/* Left Finger */}
              <mesh position={[-0.04, 0.11, 0]} material={metalJointMaterial}>
                <boxGeometry args={[0.018, 0.08, 0.03]} />
              </mesh>
              {/* Right Finger */}
              <mesh position={[0.04, 0.11, 0]} material={metalJointMaterial}>
                <boxGeometry args={[0.018, 0.08, 0.03]} />
              </mesh>
              {/* Terracotta Sensor Point */}
              <mesh position={[0, 0.075, 0.035]} material={terracottaMaterial}>
                <sphereGeometry args={[0.015, 8, 8]} />
              </mesh>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
};
