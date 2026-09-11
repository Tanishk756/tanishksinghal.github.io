import * as THREE from 'three';
import { CameraKeyframe, ZoneDefinition } from './types';

export const WORLD_ZONES: ZoneDefinition[] = [
  {
    id: 'hero',
    index: '00',
    title: 'TANISHK SINGHAL',
    subtitle: 'ROBOTICS & AUTONOMOUS SYSTEMS',
    description: 'Robotics researcher and systems engineer focusing on autonomous mobile navigation, closed-loop kinematics, embedded firmware, and applied machine learning pipelines.',
    progressStart: 0.0,
    progressEnd: 0.14,
    cameraKeyframe: {
      progress: 0.0,
      position: new THREE.Vector3(0, 1.25, 5.0),
      target: new THREE.Vector3(0.0, 0.2, 0.0),
      fov: 38,
    },
    ctaText: 'EXPLORE CASE STUDIES',
    ctaLink: '/projects',
  },
  {
    id: 'robotics',
    index: '01',
    title: 'ROBOTICS & MANIPULATION',
    subtitle: '6-DOF KINEMATICS & ARTICULATION',
    description: 'Multi-axis serial arm trajectory generation, forward and inverse kinematics solvers, precision joint actuators, and hardware-in-the-loop validation.',
    progressStart: 0.15,
    progressEnd: 0.31,
    cameraKeyframe: {
      progress: 0.23,
      position: new THREE.Vector3(-0.9, 1.35, -5.5),
      target: new THREE.Vector3(0.8, 0.75, -8.0),
      fov: 38,
    },
    ctaText: 'VIEW ROBOTICS MONOGRAPHS',
    ctaLink: '/projects',
  },
  {
    id: 'autonomy',
    index: '02',
    title: 'AUTONOMOUS NAVIGATION',
    subtitle: 'ROS 2 NAV2 & LIDAR SLAM',
    description: 'Differential-drive mobile robots, real-time 2D/3D LiDAR odometry, costmap generation, dynamic obstacle avoidance, and global/local path planners.',
    progressStart: 0.32,
    progressEnd: 0.47,
    cameraKeyframe: {
      progress: 0.40,
      position: new THREE.Vector3(0.9, 1.25, -15.5),
      target: new THREE.Vector3(-0.8, 0.55, -18.0),
      fov: 38,
    },
    ctaText: 'EXPLORE AUTONOMY STACK',
    ctaLink: '/projects',
  },
  {
    id: 'aerospace',
    index: '03',
    title: 'AEROSPACE & SPACE SYSTEMS',
    subtitle: 'UAV AVIONICS & CUBESAT SATELLITES',
    description: 'High-altitude autonomous quadrotor flight control, target pursuit kinematics, and 3U CubeSat satellite power architecture and telemetry subsystems.',
    progressStart: 0.48,
    progressEnd: 0.63,
    cameraKeyframe: {
      progress: 0.55,
      position: new THREE.Vector3(-0.6, 2.3, -25.5),
      target: new THREE.Vector3(0.8, 1.5, -28.0),
      fov: 38,
    },
    ctaText: 'VIEW AEROSPACE CASE STUDIES',
    ctaLink: '/projects',
  },
  {
    id: 'research',
    index: '04',
    title: 'SYSTEMS & RESEARCH',
    subtitle: 'PERCEPTION-TO-ACTION TOPOLOGY',
    description: 'Closed-loop multi-modal sensor fusion, edge AI/ML tensor optimization, real-time deterministic pipelines, and peer-reviewed technical publications.',
    progressStart: 0.64,
    progressEnd: 0.77,
    cameraKeyframe: {
      progress: 0.70,
      position: new THREE.Vector3(0.4, 1.3, -35.2),
      target: new THREE.Vector3(-1.0, 0.8, -38.0),
      fov: 38,
    },
    ctaText: 'EXPLORE RESEARCH PROGRAMS',
    ctaLink: '/research',
  },
  {
    id: 'projects',
    index: '05',
    title: 'SPATIAL PROJECT ARCHIVE',
    subtitle: 'LIVE REPOSITORY CASE STUDIES',
    description: 'Authentic engineering monographs formulating problem statements, subsystem topologies, and verified real-world implementations.',
    progressStart: 0.78,
    progressEnd: 0.91,
    cameraKeyframe: {
      progress: 0.85,
      position: new THREE.Vector3(0.0, 1.8, -46.5),
      target: new THREE.Vector3(0.0, 0.7, -50.0),
      fov: 42,
    },
    ctaText: 'OPEN FULL CATALOGUE',
    ctaLink: '/projects',
  },
  {
    id: 'contact',
    index: '06',
    title: 'COMMUNICATION & DIRECTORY',
    subtitle: 'COLLABORATION & TRANSMISSION',
    description: 'Available for advanced robotics research programs, autonomous system engineering, embedded hardware design, and academic inquiries.',
    progressStart: 0.92,
    progressEnd: 1.0,
    cameraKeyframe: {
      progress: 0.96,
      position: new THREE.Vector3(0.0, 1.2, -59.0),
      target: new THREE.Vector3(0.0, 0.8, -62.0),
      fov: 36,
    },
    ctaText: 'INITIATE CONTACT',
    ctaLink: '/contact',
  },
];

const KEYFRAMES: CameraKeyframe[] = WORLD_ZONES.map((z) => z.cameraKeyframe);

/**
 * Deterministically interpolates camera position and lookAt target based on continuous scroll progress (0..1).
 */
export function interpolateCameraState(
  progress: number,
  outPos: THREE.Vector3,
  outTarget: THREE.Vector3
): { fov: number; activeZoneIndex: number } {
  const clampedProgress = Math.max(0, Math.min(1, progress));

  // Find surrounding keyframes
  let idx = 0;
  for (let i = 0; i < KEYFRAMES.length - 1; i++) {
    if (clampedProgress >= KEYFRAMES[i].progress && clampedProgress <= KEYFRAMES[i + 1].progress) {
      idx = i;
      break;
    }
  }

  const k1 = KEYFRAMES[idx];
  const k2 = KEYFRAMES[Math.min(idx + 1, KEYFRAMES.length - 1)];

  const span = k2.progress - k1.progress;
  const localT = span > 0.0001 ? (clampedProgress - k1.progress) / span : 0;
  
  // Smooth hermite / cosine ease for fluid camera traveling
  const smoothT = localT * localT * (3 - 2 * localT);

  outPos.lerpVectors(k1.position, k2.position, smoothT);
  outTarget.lerpVectors(k1.target, k2.target, smoothT);

  const fov1 = k1.fov ?? 38;
  const fov2 = k2.fov ?? 38;
  const fov = fov1 + (fov2 - fov1) * smoothT;

  // Find active zone for typography sync
  let activeZoneIndex = 0;
  for (let i = 0; i < WORLD_ZONES.length; i++) {
    if (clampedProgress >= WORLD_ZONES[i].progressStart && clampedProgress <= WORLD_ZONES[i].progressEnd) {
      activeZoneIndex = i;
      break;
    }
  }

  return { fov, activeZoneIndex };
}
