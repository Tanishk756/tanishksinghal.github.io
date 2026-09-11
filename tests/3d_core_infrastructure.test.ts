import { describe, it, expect } from 'vitest';
import {
  mapProjectCategoryToArchetype,
  CAMERA_PRESETS,
  THEME_PALETTE,
  WorldZone,
  VisualArchetype,
} from '../src/components/3d/core/types';

describe('Phase 2: Global 3D World Infrastructure & Archetype Mapping', () => {
  it('maps all canonical ProjectCategory types to valid 3D visual archetypes', () => {
    expect(mapProjectCategoryToArchetype('robotics')).toBe('wheeled-robot');
    expect(mapProjectCategoryToArchetype('autonomy')).toBe('robotic-arm');
    expect(mapProjectCategoryToArchetype('uav-aerospace')).toBe('uav-drone');
    expect(mapProjectCategoryToArchetype('space-systems')).toBe('cubesat-satellite');
    expect(mapProjectCategoryToArchetype('embedded')).toBe('embedded-pcb');
    expect(mapProjectCategoryToArchetype('ai-ml')).toBe('systems-pipeline');
    expect(mapProjectCategoryToArchetype('software-tools')).toBe('systems-pipeline');
    expect(mapProjectCategoryToArchetype('unknown-category')).toBe('wheeled-robot');
  });

  it('provides complete CameraPresets for all 5 world zones', () => {
    const zones: WorldZone[] = ['world-hub', 'robotics', 'aerospace', 'systems', 'electronics'];
    zones.forEach((zone) => {
      const preset = CAMERA_PRESETS[zone];
      expect(preset).toBeDefined();
      expect(preset.position).toHaveLength(3);
      expect(preset.target).toHaveLength(3);
      expect(preset.fov).toBeGreaterThan(20);
      expect(preset.fov).toBeLessThan(60);
      expect(preset.minPolarAngle).toBeDefined();
      expect(preset.maxPolarAngle).toBeDefined();
    });
  });

  it('adheres to the strict editorial color palette without cyberpunk neon or purple', () => {
    expect(THEME_PALETTE.background).toBe('#fbfaf7');
    expect(THEME_PALETTE.graphite).toBe('#141517');
    expect(THEME_PALETTE.terracotta).toBe('#c2410c');
    expect(THEME_PALETTE.stone).toBe('#8c827a');
    expect(THEME_PALETTE.paperSurface).toBe('#edeae4');

    // Verify forbidden colors are not used
    const paletteValues = Object.values(THEME_PALETTE);
    paletteValues.forEach((color) => {
      expect(color).not.toMatch(/#00ffff/i); // No cyan neon
      expect(color).not.toMatch(/#ff00ff/i); // No magenta neon
      expect(color).not.toMatch(/#8b5cf6/i); // No purple glow
    });
  });
});
