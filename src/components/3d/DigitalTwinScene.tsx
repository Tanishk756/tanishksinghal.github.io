import React from 'react';
import { SceneLighting } from './SceneLighting';
import { EngineeringGrid } from './EngineeringGrid';
import { RobotModel } from './RobotModel';
import { CameraController } from './CameraController';
import { SubsystemId } from './types';

interface DigitalTwinSceneProps {
  hoveredSubsystem: SubsystemId | null;
  selectedSubsystem: SubsystemId | null;
  onHover: (id: SubsystemId | null) => void;
  onSelect: (id: SubsystemId) => void;
  reducedMotion?: boolean;
}

/**
 * Top-level React Three Fiber Scene for the Robot Digital Twin
 */
export const DigitalTwinScene: React.FC<DigitalTwinSceneProps> = ({
  hoveredSubsystem,
  selectedSubsystem,
  onHover,
  onSelect,
  reducedMotion = false,
}) => {
  return (
    <>
      {/* Studio Lighting */}
      <SceneLighting />

      {/* Coordinate Grid & Ground Plane */}
      <EngineeringGrid />

      {/* Procedural Mobile Robot */}
      <RobotModel
        hoveredSubsystem={hoveredSubsystem}
        selectedSubsystem={selectedSubsystem}
        onHover={onHover}
        onSelect={onSelect}
      />

      {/* Orbit & Parallax Controls */}
      <CameraController autoRotate={!reducedMotion} />
    </>
  );
};
