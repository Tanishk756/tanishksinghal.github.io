import React, { useMemo } from 'react';
import * as THREE from 'three';

/**
 * Engineering Grid & Coordinate Environment
 * Provides an architectural, CAD-inspired workspace background.
 */
export const EngineeringGrid: React.FC = () => {
  // Memoize grid helper to avoid recreating on re-renders
  const gridHelper = useMemo(() => {
    // 7x7 grid with 28 divisions matching portfolio stone & border tones
    const grid = new THREE.GridHelper(7, 28, 0x8c887b, 0xe5e2da);
    grid.position.y = 0;
    return grid;
  }, []);

  // Subtle decorative trajectory curve in the workspace
  const trajectoryLine = useMemo(() => {
    const trajectoryPoints = [
      new THREE.Vector3(0, 0.015, 0),
      new THREE.Vector3(0.6, 0.015, 0.8),
      new THREE.Vector3(1.5, 0.015, 0.5),
      new THREE.Vector3(1.2, 0.015, -1.0),
      new THREE.Vector3(-0.4, 0.015, -1.4),
      new THREE.Vector3(-1.2, 0.015, -0.4),
      new THREE.Vector3(-0.8, 0.015, 0.7),
      new THREE.Vector3(0, 0.015, 0),
    ];
    const curve = new THREE.CatmullRomCurve3(trajectoryPoints, true, 'centripetal');
    const points = curve.getPoints(100);
    const geom = new THREE.BufferGeometry().setFromPoints(points);

    const mat = new THREE.LineDashedMaterial({
      color: 0xc2410c, // Terracotta accent
      linewidth: 1,
      scale: 1,
      dashSize: 0.12,
      gapSize: 0.08,
      opacity: 0.35,
      transparent: true,
    });

    const line = new THREE.Line(geom, mat);
    line.computeLineDistances();
    return line;
  }, []);

  return (
    <group>
      {/* Coordinate Grid Planes */}
      <primitive object={gridHelper} />

      {/* Subtle Trajectory Path */}
      <primitive object={trajectoryLine} />

      {/* Soft Contact Shadow Floor Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]} receiveShadow>
        <planeGeometry args={[9, 9]} />
        <shadowMaterial opacity={0.14} />
      </mesh>

      {/* Coordinate Origin Indicator Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[0.07, 0.09, 24]} />
        <meshBasicMaterial color="#383a3f" opacity={0.4} transparent />
      </mesh>
    </group>
  );
};
