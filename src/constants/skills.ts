/**
 * Canonical Skills & Competencies Taxonomy
 * Single Source of Truth for the entire application (Database, Zod Schema, Admin CMS, and Public Frontend).
 *
 * CANONICAL ORDER:
 * 01. Robotics & Control
 * 02. Autonomous Systems
 * 03. AI & ML
 * 04. Firmware & Embedded
 * 05. Hardware & Circuits
 * 06. Space Systems & UAV
 * 07. Software & Tools
 */

export const SKILL_CATEGORIES = [
  'Robotics & Control',
  'Autonomous Systems',
  'AI & ML',
  'Firmware & Embedded',
  'Hardware & Circuits',
  'Space Systems & UAV',
  'Software & Tools',
] as const;

export type SkillCategory = (typeof SKILL_CATEGORIES)[number];

export function isSkillCategory(val: unknown): val is SkillCategory {
  return typeof val === 'string' && (SKILL_CATEGORIES as readonly string[]).includes(val);
}

export interface SkillCategoryMeta {
  index: number;
  numberPrefix: string;
  name: SkillCategory;
  description: string;
}

export const SKILL_CATEGORY_METADATA: Record<SkillCategory, SkillCategoryMeta> = {
  'Robotics & Control': {
    index: 1,
    numberPrefix: '01',
    name: 'Robotics & Control',
    description: 'Closed-loop feedback dynamics, proportional/integral steering, ROS 2 node architecture, and coordinate transformations (TF2).',
  },
  'Autonomous Systems': {
    index: 2,
    numberPrefix: '02',
    name: 'Autonomous Systems',
    description: 'Deterministic graph traversal (A*, Dijkstra), obstacle avoidance, sensor-fusion perception, and autonomous state machine coordination.',
  },
  'AI & ML': {
    index: 3,
    numberPrefix: '03',
    name: 'AI & ML',
    description: 'Machine learning pipelines, computer vision, regression, classification, supervised learning, and algorithmic modeling in NumPy/Scikit-Learn.',
  },
  'Firmware & Embedded': {
    index: 4,
    numberPrefix: '04',
    name: 'Firmware & Embedded',
    description: 'Embedded C/C++, microcontroller interfaces, real-time sensor polling, interrupt handling, and serial communication protocols (UART, SPI, I2C).',
  },
  'Hardware & Circuits': {
    index: 5,
    numberPrefix: '05',
    name: 'Hardware & Circuits',
    description: 'Circuit prototyping, schematic capture, PCB layout fundamentals, actuator driver design, and power distribution subsystems.',
  },
  'Space Systems & UAV': {
    index: 6,
    numberPrefix: '06',
    name: 'Space Systems & UAV',
    description: 'UAV avionics, telemetry links, multi-source RF/photovoltaic energy harvesting architectures, and aerospace flight electronics.',
  },
  'Software & Tools': {
    index: 7,
    numberPrefix: '07',
    name: 'Software & Tools',
    description: 'Linux systems engineering, Git collaborative workflows, CI/CD pipelines, technical documentation, and computational mathematics.',
  },
};
