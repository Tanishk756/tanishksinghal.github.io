import React, { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { WheeledRobotArchetype } from '../../archetypes/WheeledRobotArchetype';

interface AutonomyZoneProps {
  reducedMotion?: boolean;
}

/**
  * Zone 02: Autonomous Systems & Nav2 Stack
  */
export const AutonomyZone: React.FC<AutonomyZoneProps> = ({ reducedMotion = false }) => {
  const { viewport } = useThree();
  const isMobile = viewport.width < 5.0;
  const lidarBeamRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (reducedMotion) return;
    if (lidarBeamRef.current) {
      lidarBeamRef.current.rotation.y = state.clock.elapsedTime * 3.5;
    }
  });

  // Waypoint Path Spline for Autonomous Rover
  const pathPoints = useMemo(() => [
    new THREE.Vector3(-1.4, 0.05, 3.5),   // Entry from Zone 01 transition
    new THREE.Vector3(-0.6, 0.05, 1.8),
    new THREE.Vector3(0.0, 0.05, 0.0),    // Current Robot Pose
    new THREE.Vector3(0.5, 0.05, -1.5),   // Local planner avoidance
    new THREE.Vector3(0.2, 0.05, -3.2),   // Waypoint 4
    new THREE.Vector3(-0.2, 0.05, -4.8),  // Transition towards Aerospace Launch Datum
  ], []);

  const curveGeo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(pathPoints);
    const pts = curve.getPoints(50);
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [pathPoints]);

  const position: [number, number, number] = isMobile ? [0, -0.15, -18.0] : [-0.8, 0, -18.0];
  const scale: [number, number, number] = isMobile ? [0.85, 0.85, 0.85] : [1.15, 1.15, 1.15];

  return (
    <group position={position}>
      {/* 1. AUTONOMOUS MOBILE ROBOT (ROS 2 PLATFORM) */}
      <group position={[0, 0, 0]} rotation={[0, Math.PI / 8, 0]} scale={[1.15, 1.15, 1.15]}>
        <WheeledRobotArchetype reducedMotion={reducedMotion} />
      </group>

      {/* 2. ROTATING 360° LIDAR PERCEPTION SCAN FAN */}
      <group ref={lidarBeamRef} position={[0, 0.42, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <coneGeometry args={[1.8, 0.01, 16, 1, true, 0, Math.PI / 3]} />
          <meshBasicMaterial color="#c2410c" transparent opacity={0.14} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[1.4, 0, 0]}>
          <boxGeometry args={[0.1, 0.005, 0.005]} />
          <meshBasicMaterial color="#c2410c" />
        </mesh>
      </group>

      {/* 3. 3D WAYPOINT NAVIGATION TRAJECTORY */}
      <primitive
        object={new THREE.Line(curveGeo, new THREE.LineBasicMaterial({ color: '#141517', transparent: true, opacity: 0.85 }))}
      />

      {/* 4. TRAJECTORY WAYPOINT PINS & COORDINATE ANNOTATIONS */}
      {pathPoints.map((pt, i) => (
        <group key={i} position={[pt.x, pt.y, pt.z]}>
          <mesh position={[0, 0.04, 0]}>
            <cylinderGeometry args={[0.015, 0.002, 0.08, 8]} />
            <meshBasicMaterial color={i === 2 ? '#c2410c' : '#78716c'} />
          </mesh>
          <mesh position={[0, 0.09, 0]}>
            <sphereGeometry args={[0.022, 12, 12]} />
            <meshBasicMaterial color={i === 2 ? '#c2410c' : '#141517'} />
          </mesh>
        </group>
      ))}

      {/* 5. SPATIAL OBSTACLES DETECTED BY SLAM */}
      <group position={[0.9, 0.12, -1.0]}>
        <mesh>
          <boxGeometry args={[0.25, 0.24, 0.25]} />
          <meshBasicMaterial color="#e7e5e4" wireframe />
        </mesh>
      </group>
      <group position={[-1.1, 0.1, -0.6]}>
        <mesh>
          <cylinderGeometry args={[0.12, 0.12, 0.2, 12]} />
          <meshBasicMaterial color="#e7e5e4" wireframe />
        </mesh>
      </group>

      {/* 6. SLAM COSTMAP MATRIX GRID ON FLOOR */}
      <group position={[0, 0.004, 0]}>
        {[-0.9, -0.45, 0, 0.45, 0.9].map((x, xi) =>
          [-0.9, -0.45, 0, 0.45, 0.9].map((z, zi) => (
            <mesh key={`${xi}-${zi}`} position={[x, 0, z]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.38, 0.38]} />
              <meshBasicMaterial
                color={(xi + zi) % 3 === 0 ? '#c2410c' : '#e7e5e4'}
                transparent
                opacity={(xi + zi) % 3 === 0 ? 0.22 : 0.4}
              />
            </mesh>
          ))
        )}
      </group>

      {/* 7. AUTONOMY -> AEROSPACE ASCENSION DATUM (At Z: -4.8 / Global Z: -22.8) */}
      <group position={[-0.2, 0, -4.8]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.5, 0.52, 32]} />
          <meshBasicMaterial color="#c2410c" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
        {/* Vertical Launch Axis Vector leading up towards UAV */}
        <mesh position={[0, 1.2, 0]}>
          <cylinderGeometry args={[0.003, 0.003, 2.4, 8]} />
          <meshBasicMaterial color="#d6d3d1" transparent opacity={0.5} />
        </mesh>
      </group>
    </group>
  );
};
