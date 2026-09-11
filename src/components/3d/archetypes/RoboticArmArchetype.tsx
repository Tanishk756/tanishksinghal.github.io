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
  const shoulderRef = useRef<THREE.Group>(null);
  const elbowRef = useRef<THREE.Group>(null);
  const wristRef = useRef<THREE.Group>(null);
  const leftFingerRef = useRef<THREE.Mesh>(null);
  const rightFingerRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (reducedMotion) return;
    const t = state.clock.elapsedTime;
    
    // Coordinated kinematic sequence
    if (baseTurntableRef.current) {
      baseTurntableRef.current.rotation.y = Math.sin(t * 0.5) * 0.38;
    }
    if (shoulderRef.current) {
      shoulderRef.current.rotation.z = Math.sin(t * 0.5 + 0.4) * 0.14;
    }
    if (elbowRef.current) {
      elbowRef.current.rotation.z = -Math.cos(t * 0.5) * 0.18;
    }
    if (wristRef.current) {
      wristRef.current.rotation.x = Math.sin(t * 1.0) * 0.22;
    }
    if (leftFingerRef.current && rightFingerRef.current) {
      const gripOffset = (Math.sin(t * 1.2) + 1) * 0.008;
      leftFingerRef.current.position.x = -0.04 - gripOffset;
      rightFingerRef.current.position.x = 0.04 + gripOffset;
    }
  });

  const activeMaterial = isSelected ? highlightMaterial : (isHovered ? terracottaMaterial : chassisMaterial);

  // Helper component for coordinate frame triad (X: Terracotta, Y: Charcoal, Z: Slate)
  const CoordinateFrame: React.FC<{ size?: number }> = ({ size = 0.12 }) => (
    <group>
      {/* X-axis (Terracotta) */}
      <mesh position={[size / 2, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <cylinderGeometry args={[0.003, 0.003, size, 6]} />
        <meshBasicMaterial color="#c2410c" />
      </mesh>
      {/* Y-axis (Charcoal) */}
      <mesh position={[0, size / 2, 0]}>
        <cylinderGeometry args={[0.003, 0.003, size, 6]} />
        <meshBasicMaterial color="#141517" />
      </mesh>
      {/* Z-axis (Stone) */}
      <mesh position={[0, 0, size / 2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.003, 0.003, size, 6]} />
        <meshBasicMaterial color="#78716c" />
      </mesh>
    </group>
  );

  return (
    <group position={[0, 0, 0]}>
      {/* 1. BASE MOUNTING FLANGE & FRAME O0 */}
      <mesh position={[0, 0.04, 0]} material={metalJointMaterial} castShadow>
        <cylinderGeometry args={[0.22, 0.26, 0.08, 24]} />
      </mesh>
      <group position={[0, 0.08, 0]}>
        <CoordinateFrame size={0.15} />
      </group>

      {/* 2. ROTATING TURNTABLE WAIST (JOINT 1) */}
      <group ref={baseTurntableRef} position={[0, 0.08, 0]}>
        <mesh position={[0, 0.08, 0]} material={activeMaterial}>
          <cylinderGeometry args={[0.16, 0.18, 0.16, 20]} />
        </mesh>

        {/* 3. SHOULDER JOINT & LINK 1 (JOINT 2) */}
        <group ref={shoulderRef} position={[0, 0.18, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]} material={metalJointMaterial}>
            <cylinderGeometry args={[0.09, 0.09, 0.18, 18]} />
          </mesh>
          {/* Upper Arm Beam */}
          <mesh position={[0, 0.22, 0]} material={chassisMaterial} castShadow>
            <boxGeometry args={[0.11, 0.44, 0.1]} />
          </mesh>

          {/* 4. ELBOW JOINT & LINK 2 (JOINT 3 & FRAME O3) */}
          <group ref={elbowRef} position={[0, 0.44, 0]}>
            <mesh rotation={[0, 0, Math.PI / 2]} material={metalJointMaterial}>
              <cylinderGeometry args={[0.075, 0.075, 0.16, 18]} />
            </mesh>
            <group position={[0, 0, 0.1]}>
              <CoordinateFrame size={0.12} />
            </group>

            {/* Forearm Beam */}
            <mesh position={[0.12, 0.16, 0]} rotation={[0, 0, -Math.PI / 6]} material={chassisMaterial}>
              <boxGeometry args={[0.08, 0.36, 0.08]} />
            </mesh>

            {/* 5. WRIST & END EFFECTOR (JOINT 4, 5, 6 & TCP FRAME) */}
            <group ref={wristRef} position={[0.22, 0.32, 0]}>
              <mesh material={metalJointMaterial}>
                <sphereGeometry args={[0.06, 16, 16]} />
              </mesh>
              {/* Gripper Base */}
              <mesh position={[0, 0.06, 0]} material={activeMaterial}>
                <boxGeometry args={[0.12, 0.03, 0.06]} />
              </mesh>
              {/* Left Actuated Finger */}
              <mesh ref={leftFingerRef} position={[-0.04, 0.11, 0]} material={metalJointMaterial}>
                <boxGeometry args={[0.018, 0.08, 0.03]} />
              </mesh>
              {/* Right Actuated Finger */}
              <mesh ref={rightFingerRef} position={[0.04, 0.11, 0]} material={metalJointMaterial}>
                <boxGeometry args={[0.018, 0.08, 0.03]} />
              </mesh>
              {/* Terracotta Sensor Point & Tool Center Point (TCP) Coordinate Frame */}
              <mesh position={[0, 0.075, 0.035]} material={terracottaMaterial}>
                <sphereGeometry args={[0.015, 8, 8]} />
              </mesh>
              <group position={[0, 0.15, 0]}>
                <CoordinateFrame size={0.1} />
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
};
