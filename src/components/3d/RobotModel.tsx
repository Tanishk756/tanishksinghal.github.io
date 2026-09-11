import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { SubsystemId } from './types';

interface RobotModelProps {
  hoveredSubsystem: SubsystemId | null;
  selectedSubsystem: SubsystemId | null;
  onHover: (id: SubsystemId | null) => void;
  onSelect: (id: SubsystemId) => void;
}

/**
 * Procedural 3D Mobile Autonomous Robot Platform
 * Built from lightweight geometric primitives with editorial materials.
 */
export const RobotModel: React.FC<RobotModelProps> = ({
  hoveredSubsystem,
  selectedSubsystem,
  onHover,
  onSelect,
}) => {
  const robotGroupRef = useRef<THREE.Group | null>(null);
  const lidarPuckRef = useRef<THREE.Group | null>(null);

  const activeHighlight = hoveredSubsystem || selectedSubsystem;

  // --- EDITORIAL MATERIALS ---
  const materials = useMemo(() => {
    return {
      chassis: new THREE.MeshStandardMaterial({
        color: '#edeae4', // Warm stone alabaster
        roughness: 0.65,
        metalness: 0.15,
      }),
      inkMetal: new THREE.MeshStandardMaterial({
        color: '#222428', // Dark technical graphite
        roughness: 0.45,
        metalness: 0.6,
      }),
      rubber: new THREE.MeshStandardMaterial({
        color: '#1c1e20', // Dark tire rubber
        roughness: 0.85,
        metalness: 0.05,
      }),
      wheelHub: new THREE.MeshStandardMaterial({
        color: '#d2cec4', // Wheel hub rim
        roughness: 0.4,
        metalness: 0.4,
      }),
      terracotta: new THREE.MeshStandardMaterial({
        color: '#c2410c', // Terracotta accent
        roughness: 0.4,
        metalness: 0.2,
      }),
      lens: new THREE.MeshStandardMaterial({
        color: '#0a0c0e', // Optical camera glass
        roughness: 0.1,
        metalness: 0.9,
      }),
      statusDot: new THREE.MeshBasicMaterial({
        color: '#c2410c', // LED status dot
      }),
      highlight: new THREE.MeshStandardMaterial({
        color: '#c2410c', // Interactive highlight
        roughness: 0.35,
        metalness: 0.2,
      }),
    };
  }, []);

  // Frame update: Continuous LiDAR puck spin & subtle suspension breathing
  useFrame((state, delta) => {
    // 1. Rotate LiDAR scanner
    if (lidarPuckRef.current) {
      lidarPuckRef.current.rotation.y += delta * 2.5;
    }

    // 2. Subtle idle micro-breathing
    if (robotGroupRef.current) {
      robotGroupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.4) * 0.008;
    }
  });

  // Pointer event helpers
  const handlePointerOver = (id: SubsystemId) => (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    document.body.style.cursor = 'pointer';
    onHover(id);
  };

  const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    document.body.style.cursor = 'auto';
    onHover(null);
  };

  const handleClick = (id: SubsystemId) => (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect(id);
  };

  const getMat = (id: SubsystemId, defaultMat: THREE.Material) => {
    return activeHighlight === id ? materials.highlight : defaultMat;
  };

  // Wheel positions (Front-Left, Front-Right, Rear-Left, Rear-Right)
  const wheelRadius = 0.22;
  const wheelWidth = 0.14;
  const wheelPositions = [
    { x: 0.58, y: wheelRadius, z: 0.42 },
    { x: -0.58, y: wheelRadius, z: 0.42 },
    { x: 0.58, y: wheelRadius, z: -0.42 },
    { x: -0.58, y: wheelRadius, z: -0.42 },
  ];

  return (
    <group ref={robotGroupRef} position={[0, 0, 0]}>
      
      {/* 1. CHASSIS SUBSYSTEM */}
      <group
        onPointerOver={handlePointerOver('chassis')}
        onPointerOut={handlePointerOut}
        onClick={handleClick('chassis')}
      >
        {/* Main Monocoque Tub */}
        <mesh position={[0, 0.32, 0]} castShadow receiveShadow material={getMat('chassis', materials.chassis)}>
          <boxGeometry args={[0.95, 0.26, 1.35]} />
        </mesh>

        {/* Chassis Top Deck Plate */}
        <mesh position={[0, 0.47, 0]} castShadow receiveShadow material={getMat('chassis', materials.inkMetal)}>
          <boxGeometry args={[0.88, 0.04, 1.25]} />
        </mesh>

        {/* Left Protective Rail */}
        <mesh position={[0.49, 0.32, 0]} castShadow receiveShadow material={getMat('chassis', materials.inkMetal)}>
          <boxGeometry args={[0.04, 0.14, 1.42]} />
        </mesh>

        {/* Right Protective Rail */}
        <mesh position={[-0.49, 0.32, 0]} castShadow receiveShadow material={getMat('chassis', materials.inkMetal)}>
          <boxGeometry args={[0.04, 0.14, 1.42]} />
        </mesh>

        {/* Front Terracotta Trim Accent */}
        <mesh position={[0, 0.44, 0.68]} castShadow receiveShadow material={materials.terracotta}>
          <boxGeometry args={[0.75, 0.03, 0.04]} />
        </mesh>
      </group>

      {/* 2. DRIVE SUBSYSTEM (4 Independent Wheels) */}
      <group
        onPointerOver={handlePointerOver('drive')}
        onPointerOut={handlePointerOut}
        onClick={handleClick('drive')}
      >
        {wheelPositions.map((pos, idx) => (
          <group key={idx} position={[pos.x, pos.y, pos.z]}>
            {/* Tire Rubber */}
            <mesh
              rotation={[0, 0, Math.PI / 2]}
              castShadow
              receiveShadow
              material={getMat('drive', materials.rubber)}
            >
              <cylinderGeometry args={[wheelRadius, wheelRadius, wheelWidth, 24]} />
            </mesh>

            {/* Hub Rim */}
            <mesh
              rotation={[0, 0, Math.PI / 2]}
              castShadow
              receiveShadow
              material={getMat('drive', materials.wheelHub)}
            >
              <cylinderGeometry args={[wheelRadius * 0.55, wheelRadius * 0.55, wheelWidth + 0.01, 16]} />
            </mesh>

            {/* Axle Center Cap */}
            <mesh
              rotation={[0, 0, Math.PI / 2]}
              castShadow
              material={materials.terracotta}
            >
              <cylinderGeometry args={[wheelRadius * 0.22, wheelRadius * 0.22, wheelWidth + 0.02, 12]} />
            </mesh>
          </group>
        ))}
      </group>

      {/* 3. SENSOR MAST & 360° LIDAR SUBSYSTEM */}
      <group
        onPointerOver={handlePointerOver('lidar')}
        onPointerOut={handlePointerOut}
        onClick={handleClick('lidar')}
      >
        {/* Support Mast */}
        <mesh position={[0, 0.68, -0.15]} castShadow receiveShadow material={getMat('lidar', materials.inkMetal)}>
          <cylinderGeometry args={[0.025, 0.03, 0.38, 12]} />
        </mesh>

        {/* LiDAR Base Mount */}
        <mesh position={[0, 0.88, -0.15]} castShadow receiveShadow material={getMat('lidar', materials.inkMetal)}>
          <cylinderGeometry args={[0.12, 0.13, 0.06, 24]} />
        </mesh>

        {/* Rotating LiDAR Puck Group */}
        <group ref={lidarPuckRef} position={[0, 0.94, -0.15]}>
          <mesh castShadow receiveShadow material={getMat('lidar', materials.chassis)}>
            <cylinderGeometry args={[0.11, 0.11, 0.08, 24]} />
          </mesh>

          {/* Optical Slot Indicator */}
          <mesh position={[0.07, 0, 0]} material={materials.terracotta}>
            <boxGeometry args={[0.04, 0.03, 0.1]} />
          </mesh>
        </group>
      </group>

      {/* 4. FORWARD STEREO CAMERA SUBSYSTEM */}
      <group
        onPointerOver={handlePointerOver('camera')}
        onPointerOut={handlePointerOut}
        onClick={handleClick('camera')}
      >
        {/* Mount Bracket */}
        <mesh position={[0, 0.54, 0.62]} castShadow receiveShadow material={getMat('camera', materials.inkMetal)}>
          <boxGeometry args={[0.28, 0.1, 0.1]} />
        </mesh>

        {/* Left Lens */}
        <mesh position={[0.09, 0.54, 0.67]} rotation={[Math.PI / 2, 0, 0]} castShadow material={getMat('camera', materials.lens)}>
          <cylinderGeometry args={[0.035, 0.035, 0.04, 16]} />
        </mesh>

        {/* Right Lens */}
        <mesh position={[-0.09, 0.54, 0.67]} rotation={[Math.PI / 2, 0, 0]} castShadow material={getMat('camera', materials.lens)}>
          <cylinderGeometry args={[0.035, 0.035, 0.04, 16]} />
        </mesh>
      </group>

      {/* 5. 6-DOF IMU SUBSYSTEM */}
      <group
        onPointerOver={handlePointerOver('imu')}
        onPointerOut={handlePointerOut}
        onClick={handleClick('imu')}
      >
        {/* Housing */}
        <mesh position={[0, 0.51, 0.15]} castShadow receiveShadow material={getMat('imu', materials.inkMetal)}>
          <boxGeometry args={[0.18, 0.06, 0.18]} />
        </mesh>

        {/* Telemetry Status Dot */}
        <mesh position={[0, 0.55, 0.15]} material={materials.statusDot}>
          <sphereGeometry args={[0.02, 12, 12]} />
        </mesh>
      </group>

      {/* 6. ONBOARD COMPUTE MODULE */}
      <group
        onPointerOver={handlePointerOver('compute')}
        onPointerOut={handlePointerOut}
        onClick={handleClick('compute')}
      >
        <mesh position={[0, 0.51, -0.28]} castShadow receiveShadow material={getMat('compute', materials.chassis)}>
          <boxGeometry args={[0.35, 0.08, 0.35]} />
        </mesh>
      </group>

    </group>
  );
};
