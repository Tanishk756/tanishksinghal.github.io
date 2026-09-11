export type SubsystemId = 'chassis' | 'drive' | 'lidar' | 'camera' | 'imu' | 'compute';

export interface SubsystemInfo {
  id: SubsystemId;
  name: string;
  category: string;
  description: string;
}

export const SUBSYSTEMS: Record<SubsystemId, SubsystemInfo> = {
  chassis: {
    id: 'chassis',
    name: 'CHASSIS & FRAME',
    category: 'STRUCTURE',
    description: 'Lightweight monocoque chassis structure with modular subsystem mounting rails and low center-of-gravity ballast distribution.',
  },
  drive: {
    id: 'drive',
    name: '4WD DIFFERENTIAL DRIVE',
    category: 'ACTUATION',
    description: 'Four-wheel independent high-torque hub powertrain configured for skid-steer and differential kinematics.',
  },
  lidar: {
    id: 'lidar',
    name: '360° PLANAR LIDAR',
    category: 'PERCEPTION',
    description: 'Continuous laser rangefinder scanning the horizontal plane for real-time 2D/3D point cloud mapping and obstacle detection.',
  },
  camera: {
    id: 'camera',
    name: 'STEREO OPTICAL SENSOR',
    category: 'VISION',
    description: 'Dual-lens stereoscopic camera array providing depth estimation, feature extraction, and visual odometry telemetry.',
  },
  imu: {
    id: 'imu',
    name: '6-DOF INERTIAL CORE',
    category: 'ODOMETRY',
    description: 'High-frequency 6-axis gyroscope and accelerometer tracking angular orientation and acceleration for state estimation.',
  },
  compute: {
    id: 'compute',
    name: 'ONBOARD CONTROLLER',
    category: 'COMPUTE',
    description: 'Embedded edge processing core running ROS 2 nodes, trajectory tracking, kinematics solvers, and sensor fusion pipelines.',
  },
};
