import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';

/**
 * Architectural Engineering Environment
 * 
 * Provides an expansive floor grid, subtle spatial coordinate dividers,
 * atmospheric depth fog, and balanced studio lighting.
 */
export const ImmersiveEnvironment: React.FC = () => {
  const { scene } = useThree();

  // Set background and atmospheric fog for continuous depth
  useMemo(() => {
    scene.background = new THREE.Color('#fbfaf7');
    scene.fog = new THREE.FogExp2('#fbfaf7', 0.032);
  }, [scene]);

  return (
    <group>
      {/* 1. STUDIO LIGHTING RIG */}
      <ambientLight intensity={1.2} color="#ffffff" />
      
      {/* Warm Key Light */}
      <directionalLight
        position={[10, 18, 12]}
        intensity={1.5}
        color="#fffaf2"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0001}
      />
      
      {/* Cool Slate Fill Light */}
      <directionalLight
        position={[-12, 10, -20]}
        intensity={0.7}
        color="#e2e8f0"
      />

      {/* Under-Glow Bounce Light */}
      <directionalLight
        position={[0, -5, -30]}
        intensity={0.3}
        color="#f1f5f9"
      />

      {/* 2. INFINITE ARCHITECTURAL FLOOR GRID */}
      <group position={[0, -0.01, -30]}>
        <gridHelper
          args={[100, 100, '#c2410c', '#e7e5e4']}
          position={[0, 0, 0]}
        />
      </group>

      {/* 3. CARDINAL SPATIAL GUIDES & AXIS MARKERS */}
      <group position={[0, 0, 0]}>
        {/* Longitudinal Centerline */}
        <mesh position={[0, 0.001, -30]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.04, 80]} />
          <meshBasicMaterial color="#d6d3d1" transparent opacity={0.4} />
        </mesh>

        {/* Zone Latitude Dividers */}
        {[-4, -13, -23, -33, -44, -56].map((z, i) => (
          <group key={i} position={[0, 0.002, z]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[18, 0.02]} />
              <meshBasicMaterial color="#e7e5e4" transparent opacity={0.6} />
            </mesh>
            {/* Coordinate Marker Dots */}
            {[-6, -3, 0, 3, 6].map((x, j) => (
              <mesh key={j} position={[x, 0.005, 0]}>
                <circleGeometry args={[0.03, 12]} />
                <meshBasicMaterial color={j === 2 ? '#c2410c' : '#a8a29e'} />
              </mesh>
            ))}
          </group>
        ))}
      </group>
    </group>
  );
};
