import React, { useMemo } from 'react';
import * as THREE from 'three';
import { THEME_PALETTE } from './types';

interface EngineeringEnvironmentProps {
  gridSize?: number;
  gridDivisions?: number;
  showTrajectory?: boolean;
  trajectoryPoints?: [number, number, number][];
}

/**
 * Shared Engineering Environment Primitives
 * 
 * Provides unified warm studio lighting and an architectural coordinate plane
 * across all 3D zones to guarantee visual consistency.
 */
export const EngineeringEnvironment: React.FC<EngineeringEnvironmentProps> = ({
  gridSize = 7,
  gridDivisions = 28,
  showTrajectory = true,
  trajectoryPoints,
}) => {
  // Default circular trajectory if custom points not specified
  const curvePoints = useMemo(() => {
    if (trajectoryPoints && trajectoryPoints.length > 1) {
      const v3s = trajectoryPoints.map(p => new THREE.Vector3(...p));
      const curve = new THREE.CatmullRomCurve3(v3s, true);
      return curve.getPoints(64);
    }
    const pts: THREE.Vector3[] = [];
    const count = 48;
    const radiusX = 2.1;
    const radiusZ = 1.6;
    for (let i = 0; i <= count; i++) {
      const theta = (i / count) * Math.PI * 2;
      pts.push(
        new THREE.Vector3(
          Math.cos(theta) * radiusX,
          0.005,
          Math.sin(theta) * radiusZ
        )
      );
    }
    return pts;
  }, [trajectoryPoints]);

  const trajectoryObject = useMemo(() => {
    if (!showTrajectory) return null;
    const geom = new THREE.BufferGeometry().setFromPoints(curvePoints);
    const mat = new THREE.LineDashedMaterial({
      color: THEME_PALETTE.terracotta,
      dashSize: 0.12,
      gapSize: 0.08,
      transparent: true,
      opacity: 0.35,
    });
    const line = new THREE.Line(geom, mat);
    line.computeLineDistances();
    return line;
  }, [showTrajectory, curvePoints]);

  const gridHelperObject = useMemo(() => {
    return new THREE.GridHelper(
      gridSize,
      gridDivisions,
      new THREE.Color(THEME_PALETTE.stone),
      new THREE.Color(THEME_PALETTE.gridLine)
    );
  }, [gridSize, gridDivisions]);

  return (
    <group>
      {/* 1. STUDIO LIGHTING */}
      <ambientLight intensity={0.7} color="#ffffff" />
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.1}
        color="#fffaf0"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={20}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
        shadow-bias={-0.0003}
      />
      <directionalLight position={[-4, 3, -3]} intensity={0.35} color="#e6f0ff" />
      <pointLight position={[0, 3.5, 0]} intensity={0.25} color="#ffffff" distance={8} />

      {/* 2. ARCHITECTURAL COORDINATE GRID */}
      <primitive object={gridHelperObject} />

      {/* 3. SOFT CONTACT SHADOW RECEIVER PLANE */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.002, 0]}
        receiveShadow
      >
        <planeGeometry args={[gridSize * 1.5, gridSize * 1.5]} />
        <shadowMaterial opacity={0.08} />
      </mesh>

      {/* 4. SUBTLE TRAJECTORY PATH VISUALIZATION */}
      {trajectoryObject && <primitive object={trajectoryObject} />}
    </group>
  );
};
