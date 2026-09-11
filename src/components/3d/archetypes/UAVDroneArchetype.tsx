import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  chassisMaterial,
  shellMaterial,
  metalJointMaterial,
  opticalLensMaterial,
  terracottaMaterial,
  highlightMaterial,
} from '../core/materials';

interface UAVDroneArchetypeProps {
  isHovered?: boolean;
  isSelected?: boolean;
  reducedMotion?: boolean;
}

/**
 * Procedural UAV Quadrotor Archetype
 * 
 * Scaled, lightweight aerial platform representing autonomous UAV and aerial tracking projects
 * (e.g., AeroGuard, APEX-Track) with carbon arms, rotor blur discs, and gimbal camera.
 */
export const UAVDroneArchetype: React.FC<UAVDroneArchetypeProps> = ({
  isHovered = false,
  isSelected = false,
  reducedMotion = false,
}) => {
  const rootGroupRef = useRef<THREE.Group>(null);
  const rotorsRef = useRef<THREE.Group[]>([]);

  useFrame((state, delta) => {
    if (reducedMotion) return;

    // Gentle hovering motion
    if (rootGroupRef.current) {
      rootGroupRef.current.position.y = 0.5 + Math.sin(state.clock.elapsedTime * 2.0) * 0.04;
      rootGroupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 1.5) * 0.03;
    }

    // High-speed propeller spin
    rotorsRef.current.forEach((rotor, idx) => {
      if (rotor) {
        rotor.rotation.y += (idx % 2 === 0 ? 1 : -1) * delta * 18;
      }
    });
  });

  const activeMaterial = isSelected ? highlightMaterial : (isHovered ? terracottaMaterial : chassisMaterial);

  // Arm positions (X configuration)
  const armAngle = Math.PI / 4;
  const armLength = 0.55;
  const armOffsets = [
    { x: Math.cos(armAngle) * armLength, z: Math.sin(armAngle) * armLength, rot: armAngle },
    { x: -Math.cos(armAngle) * armLength, z: Math.sin(armAngle) * armLength, rot: -armAngle },
    { x: -Math.cos(armAngle) * armLength, z: -Math.sin(armAngle) * armLength, rot: armAngle },
    { x: Math.cos(armAngle) * armLength, z: -Math.sin(armAngle) * armLength, rot: -armAngle },
  ];

  return (
    <group ref={rootGroupRef} position={[0, 0.5, 0]}>
      {/* 1. CENTRAL AVIONICS MONOCOQUE FUSELAGE */}
      <mesh position={[0, 0.08, 0]} material={activeMaterial} castShadow>
        <boxGeometry args={[0.32, 0.12, 0.42]} />
      </mesh>

      {/* Top Shell Cover */}
      <mesh position={[0, 0.15, 0]} material={shellMaterial}>
        <boxGeometry args={[0.26, 0.04, 0.36]} />
      </mesh>

      {/* Status LED Beacon */}
      <mesh position={[0, 0.18, 0]} material={terracottaMaterial}>
        <sphereGeometry args={[0.025, 12, 12]} />
      </mesh>

      {/* 2. 4 QUADROTOR ARMS (X CONFIGURATION) */}
      {armOffsets.map((arm, idx) => (
        <group key={idx}>
          {/* Carbon Arm Tube */}
          <mesh
            position={[arm.x * 0.5, 0.07, arm.z * 0.5]}
            rotation={[0, -arm.rot + (idx === 1 || idx === 3 ? Math.PI / 2 : 0), 0]}
            material={chassisMaterial}
          >
            <boxGeometry args={[0.04, 0.03, armLength]} />
          </mesh>

          {/* Motor Pod Mount */}
          <mesh position={[arm.x, 0.1, arm.z]} material={metalJointMaterial} castShadow>
            <cylinderGeometry args={[0.045, 0.045, 0.07, 16]} />
          </mesh>

          {/* Propeller Blade Disc (Translucent motion blur) */}
          <group
            position={[arm.x, 0.145, arm.z]}
            ref={(el) => {
              if (el) rotorsRef.current[idx] = el;
            }}
          >
            <mesh>
              <cylinderGeometry args={[0.22, 0.22, 0.006, 24]} />
              <meshStandardMaterial
                color="#2a2c30"
                transparent
                opacity={0.35}
                roughness={0.8}
              />
            </mesh>
            {/* Visual Propeller Hub Blades */}
            <mesh material={metalJointMaterial}>
              <boxGeometry args={[0.42, 0.012, 0.03]} />
            </mesh>
          </group>
        </group>
      ))}

      {/* 3. FORWARD 2-AXIS SENSOR / GIMBAL CAMERA */}
      <group position={[0, 0.0, 0.22]}>
        <mesh material={metalJointMaterial}>
          <sphereGeometry args={[0.065, 16, 16]} />
        </mesh>
        {/* Optical Lens */}
        <mesh position={[0, 0, 0.05]} rotation={[Math.PI / 2, 0, 0]} material={opticalLensMaterial}>
          <cylinderGeometry args={[0.032, 0.032, 0.03, 16]} />
        </mesh>
      </group>

      {/* 4. LANDING SKIDS */}
      <mesh position={[0.14, -0.06, 0]} material={metalJointMaterial}>
        <boxGeometry args={[0.02, 0.16, 0.38]} />
      </mesh>
      <mesh position={[-0.14, -0.06, 0]} material={metalJointMaterial}>
        <boxGeometry args={[0.02, 0.16, 0.38]} />
      </mesh>
    </group>
  );
};
