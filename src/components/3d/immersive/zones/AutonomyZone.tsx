import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { WheeledRobotArchetype } from '../../archetypes/WheeledRobotArchetype';

interface AutonomyZoneProps {
  reducedMotion?: boolean;
}

/**
 * Zone 02: Autonomous Systems & Nav2 Stack
 * 
 * Positioned at [-1.2, 0, -18.0] with right-hand space for narrative typography.
 */
export const AutonomyZone: React.FC<AutonomyZoneProps> = ({ reducedMotion = false }) => {
  const lidarBeamRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (reducedMotion) return;
    if (lidarBeamRef.current) {
      lidarBeamRef.current.rotation.y = state.clock.elapsedTime * 4.0;
    }
  });

  // Waypoint Path Spline
  const pathPoints = useMemo(() => [
    new THREE.Vector3(-0.8, 0.05, 1.2),
    new THREE.Vector3(-0.3, 0.05, 0.6),
    new THREE.Vector3(0.0, 0.05, 0.0),
    new THREE.Vector3(0.4, 0.05, -0.7),
    new THREE.Vector3(0.1, 0.05, -1.4),
  ], []);

  const curveGeo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(pathPoints);
    const pts = curve.getPoints(50);
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [pathPoints]);

  return (
    <group position={[-1.2, 0, -18.0]}>
      {/* 1. AUTONOMOUS MOBILE ROBOT (ROS 2 PLATFORM) */}
      <group position={[0, 0, 0]} rotation={[0, Math.PI / 6, 0]} scale={[1.1, 1.1, 1.1]}>
        <WheeledRobotArchetype reducedMotion={reducedMotion} />
      </group>

      {/* 2. ROTATING LIDAR PERCEPTION SCAN FAN */}
      <group ref={lidarBeamRef} position={[0, 0.42, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <coneGeometry args={[1.5, 0.01, 16, 1, true, 0, Math.PI / 4]} />
          <meshBasicMaterial color="#c2410c" transparent opacity={0.15} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[1.2, 0, 0]}>
          <boxGeometry args={[0.08, 0.005, 0.005]} />
          <meshBasicMaterial color="#c2410c" />
        </mesh>
      </group>

      {/* 3. 3D WAYPOINT NAVIGATION TRAJECTORY */}
      <primitive object={new THREE.Line(curveGeo, new THREE.LineBasicMaterial({ color: '#141517', transparent: true, opacity: 0.8 }))} />

      {/* 4. TRAJECTORY WAYPOINT PINS */}
      {pathPoints.map((pt, i) => (
        <group key={i} position={[pt.x, pt.y, pt.z]}>
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.02, 0.002, 0.1, 8]} />
            <meshBasicMaterial color={i === 2 ? '#c2410c' : '#78716c'} />
          </mesh>
          <mesh position={[0, 0.12, 0]}>
            <sphereGeometry args={[0.025, 12, 12]} />
            <meshBasicMaterial color={i === 2 ? '#c2410c' : '#141517'} />
          </mesh>
        </group>
      ))}

      {/* 5. SLAM COSTMAP MATRIX GRID ON FLOOR */}
      <group position={[0, 0.004, 0]}>
        {[-0.8, -0.4, 0, 0.4, 0.8].map((x, xi) =>
          [-0.8, -0.4, 0, 0.4, 0.8].map((z, zi) => (
            <mesh key={`${xi}-${zi}`} position={[x, 0, z]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.32, 0.32]} />
              <meshBasicMaterial
                color={(xi + zi) % 3 === 0 ? '#c2410c' : '#e7e5e4'}
                transparent
                opacity={(xi + zi) % 3 === 0 ? 0.25 : 0.4}
              />
            </mesh>
          ))
        )}
      </group>
    </group>
  );
};
