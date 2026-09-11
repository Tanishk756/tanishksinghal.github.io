import React, { useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RoboticArmArchetype } from '../../archetypes/RoboticArmArchetype';

interface RoboticsZoneProps {
  reducedMotion?: boolean;
}

/**
 * Zone 01: Robotics Studio & Kinematics
 * 
 * Positioned at [1.1, 0, -8.0] with left-hand space for narrative typography.
 */
export const RoboticsZone: React.FC<RoboticsZoneProps> = ({ reducedMotion = false }) => {
  const { viewport } = useThree();
  const isMobile = viewport.width < 5.0;

  const curvePoints = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const segments = 40;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      const x = Math.sin(theta) * 0.45;
      const y = 0.35 + Math.sin(theta * 2) * 0.12;
      const z = Math.cos(theta) * 0.35;
      points.push(new THREE.Vector3(x, y, z));
    }
    return points;
  }, []);

  const curveGeo = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(curvePoints);
  }, [curvePoints]);

  // Transitional ground corridor spline connecting Zone 01 (Robotics Z: -14) -> Zone 02 (Autonomy Z: -28)
  const transitionPathGeo = useMemo(() => {
    const pts = [
      new THREE.Vector3(0, 0.008, 0),        // At base of Robotic Arm (Z: -14)
      new THREE.Vector3(-0.5, 0.008, -3.5),  // Arcing outward
      new THREE.Vector3(-1.2, 0.008, -7.5),  // Traversing boundary
      new THREE.Vector3(-1.5, 0.008, -11.0), // Merging with rover waypoint corridor
      new THREE.Vector3(-1.6, 0.008, -14.0), // Linking directly to Wheeled Robot origin (Z: -28)
    ];
    const curve = new THREE.CatmullRomCurve3(pts);
    return new THREE.BufferGeometry().setFromPoints(curve.getPoints(50));
  }, []);

  const position: [number, number, number] = isMobile ? [0.25, 0.1, -16.0] : [1.2, 0, -16.0];
  const scale: [number, number, number] = isMobile ? [0.95, 0.95, 0.95] : [1.1, 1.1, 1.1];

  return (
    <group position={position} scale={scale}>
      {/* 1. WORKSPACE WORK-ENVELOPE FLOOR MARKING */}
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.75, 0.77, 36]} />
        <meshBasicMaterial color="#e7e5e4" side={THREE.DoubleSide} />
      </mesh>

      {/* Degree Ticks & Coordinate Alignment Radial Lines */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <group key={deg}>
            <mesh position={[Math.cos(rad) * 0.76, 0.006, Math.sin(rad) * 0.76]}>
              <circleGeometry args={[0.015, 8]} />
              <meshBasicMaterial color={deg === 0 || deg === 180 ? '#c2410c' : '#a8a29e'} />
            </mesh>
            {/* Radial Datum Whisker */}
            <mesh
              position={[Math.cos(rad) * 0.82, 0.005, Math.sin(rad) * 0.82]}
              rotation={[-Math.PI / 2, 0, rad]}
            >
              <planeGeometry args={[0.08, 0.002]} />
              <meshBasicMaterial color="#d6d3d1" />
            </mesh>
          </group>
        );
      })}

      {/* 2. ARTICULATED 6-DOF ROBOTIC MANIPULATOR */}
      <group position={[0, 0, 0]} scale={[1.15, 1.15, 1.15]}>
        <RoboticArmArchetype reducedMotion={reducedMotion} />
      </group>

      {/* 3. 3D END-EFFECTOR TRAJECTORY TOOL-PATH */}
      <primitive
        object={new THREE.Line(curveGeo, new THREE.LineBasicMaterial({ color: '#c2410c', transparent: true, opacity: 0.75 }))}
        position={[0, 0.2, 0]}
      />

      {/* 4. TRAJECTORY WAYPOINT NODES */}
      {curvePoints.filter((_, idx) => idx % 8 === 0).map((pt, i) => (
        <mesh key={i} position={[pt.x, pt.y + 0.2, pt.z]}>
          <sphereGeometry args={[0.02, 12, 12]} />
          <meshBasicMaterial color="#141517" />
        </mesh>
      ))}

      {/* 5. ROBOTICS -> AUTONOMY PHYSICAL TRANSITIONAL PATH LINE */}
      <primitive
        object={new THREE.Line(transitionPathGeo, new THREE.LineDashedMaterial({ color: '#c2410c', dashSize: 0.2, gapSize: 0.1, transparent: true, opacity: 0.6 }))}
      />
    </group>
  );
};
