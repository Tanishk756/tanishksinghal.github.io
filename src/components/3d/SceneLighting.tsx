import React from 'react';

/**
 * Warm Editorial Studio Lighting
 * Designed to accentuate mechanical geometry without harsh reflections or sci-fi glare.
 */
export const SceneLighting: React.FC = () => {
  return (
    <>
      {/* Warm Ambient Fill */}
      <ambientLight intensity={1.4} color="#fffdfa" />

      {/* Main Studio Key Light with Soft Shadow Map */}
      <directionalLight
        position={[4, 7, 5]}
        intensity={2.2}
        color="#fff8ee"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={15}
        shadow-camera-left={-3}
        shadow-camera-right={3}
        shadow-camera-top={3}
        shadow-camera-bottom={-3}
        shadow-bias={-0.0005}
      />

      {/* Soft Secondary Fill Light */}
      <directionalLight
        position={[-5, 3, -4]}
        intensity={0.9}
        color="#e2ded4"
      />

      {/* Gentle Overhead Rim Accent */}
      <pointLight
        position={[0, 3.5, 0]}
        intensity={0.6}
        distance={8}
        color="#ffeee0"
      />
    </>
  );
};
