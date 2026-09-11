import React from 'react';
import { VisualArchetype } from '../core/types';
import { UAVDroneArchetype } from './UAVDroneArchetype';
import { CubeSatArchetype } from './CubeSatArchetype';
import { WheeledRobotArchetype } from './WheeledRobotArchetype';
import { RoboticArmArchetype } from './RoboticArmArchetype';
import { PCBArchetype } from './PCBArchetype';
import { SystemsPipelineArchetype } from './SystemsPipelineArchetype';

interface ArchetypeFactoryProps {
  archetype: VisualArchetype;
  isHovered?: boolean;
  isSelected?: boolean;
  reducedMotion?: boolean;
  scale?: number;
}

/**
 * Universal 3D Archetype Factory
 * 
 * Dynamically instantiates the appropriate procedural 3D model according
 * to the project's visual archetype classification.
 */
export const ArchetypeFactory: React.FC<ArchetypeFactoryProps> = ({
  archetype,
  isHovered = false,
  isSelected = false,
  reducedMotion = false,
  scale = 1.0,
}) => {
  return (
    <group scale={[scale, scale, scale]}>
      {(() => {
        switch (archetype) {
          case 'uav-drone':
            return (
              <UAVDroneArchetype
                isHovered={isHovered}
                isSelected={isSelected}
                reducedMotion={reducedMotion}
              />
            );
          case 'cubesat-satellite':
            return (
              <CubeSatArchetype
                isHovered={isHovered}
                isSelected={isSelected}
                reducedMotion={reducedMotion}
              />
            );
          case 'robotic-arm':
            return (
              <RoboticArmArchetype
                isHovered={isHovered}
                isSelected={isSelected}
                reducedMotion={reducedMotion}
              />
            );
          case 'embedded-pcb':
            return (
              <PCBArchetype
                isHovered={isHovered}
                isSelected={isSelected}
                reducedMotion={reducedMotion}
              />
            );
          case 'systems-pipeline':
            return (
              <SystemsPipelineArchetype
                isHovered={isHovered}
                isSelected={isSelected}
                reducedMotion={reducedMotion}
              />
            );
          case 'wheeled-robot':
          case 'humanoid':
          default:
            return (
              <WheeledRobotArchetype
                isHovered={isHovered}
                isSelected={isSelected}
                reducedMotion={reducedMotion}
              />
            );
        }
      })()}
    </group>
  );
};
