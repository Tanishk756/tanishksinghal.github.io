import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Play, RotateCcw, ShieldCheck, Eye, Compass, Cpu, Navigation, Disc3 } from 'lucide-react';

interface SubsystemInfo {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SUBSYSTEMS: Record<string, SubsystemInfo> = {
  chassis: {
    id: 'chassis',
    name: 'CHASSIS',
    category: 'STRUCTURE',
    description: 'Lightweight monocoque chassis with modular subsystem mounting rails.',
    icon: ShieldCheck,
  },
  drive: {
    id: 'drive',
    name: 'DRIVE',
    category: 'ACTUATION',
    description: 'Four-wheel independent differential powertrain with high-traction terrain hubs.',
    icon: Disc3,
  },
  lidar: {
    id: 'lidar',
    name: 'LIDAR',
    category: 'PERCEPTION',
    description: '360° planar laser rangefinder for spatial mapping and obstacle avoidance.',
    icon: Compass,
  },
  camera: {
    id: 'camera',
    name: 'CAMERA',
    category: 'VISION',
    description: 'Forward-facing stereoscopic optical sensor for depth perception and visual odometry.',
    icon: Eye,
  },
  imu: {
    id: 'imu',
    name: 'IMU',
    category: 'ODOMETRY',
    description: '6-DOF inertial measurement unit tracking angular velocity and acceleration.',
    icon: Navigation,
  },
  navigation: {
    id: 'navigation',
    name: 'NAVIGATION',
    category: 'COMPUTE',
    description: 'Onboard edge compute module executing trajectory optimization and path planning.',
    icon: Cpu,
  },
};

export const RobotDigitalTwin: React.FC<{ className?: string }> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Interaction & Telemetry State
  const [hoveredSubsystem, setHoveredSubsystem] = useState<string | null>(null);
  const [selectedSubsystem, setSelectedSubsystem] = useState<string | null>(null);
  const [isAutonomyActive, setIsAutonomyActive] = useState(false);
  const [telemetry, setTelemetry] = useState({
    x: 0.0,
    y: 0.0,
    theta: 0,
    mode: 'MANUAL',
    target: 'IDLE',
  });
  const [hasWebGLError, setHasWebGLError] = useState(false);

  // References for animation loop coordination
  const isAutonomyRef = useRef(false);
  isAutonomyRef.current = isAutonomyActive;

  const hoveredRef = useRef<string | null>(null);
  hoveredRef.current = hoveredSubsystem;

  const selectedRef = useRef<string | null>(null);
  selectedRef.current = selectedSubsystem;

  const triggerResetRef = useRef<(() => void) | null>(null);
  const triggerAutonomyRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // Check WebGL availability
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) {
        setHasWebGLError(true);
        return;
      }
    } catch {
      setHasWebGLError(true);
      return;
    }

    // --- THREE.JS SCENE SETUP ---
    const scene = new THREE.Scene();
    scene.background = null; // transparent to inherit Light Editorial card background

    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 50);
    camera.position.set(3.8, 3.2, 4.2);
    camera.lookAt(0, 0.35, 0);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
    } catch {
      setHasWebGLError(true);
      return;
    }

    // --- LIGHTING (Warm Editorial Studio Setup) ---
    const ambientLight = new THREE.AmbientLight(0xfffdfa, 1.4);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xfff8ee, 2.2);
    mainLight.position.set(4, 7, 5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 15;
    mainLight.shadow.camera.left = -3;
    mainLight.shadow.camera.right = 3;
    mainLight.shadow.camera.top = 3;
    mainLight.shadow.camera.bottom = -3;
    mainLight.shadow.bias = -0.0005;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xe2ded4, 0.9);
    fillLight.position.set(-5, 3, -4);
    scene.add(fillLight);

    const topSoftLight = new THREE.PointLight(0xffeedd, 0.8, 8);
    topSoftLight.position.set(0, 3, 0);
    scene.add(topSoftLight);

    // --- MATERIALS (Editorial Palette) ---
    // Warm Stone Alabaster for Chassis
    const matChassis = new THREE.MeshStandardMaterial({
      color: 0xedeae4,
      roughness: 0.65,
      metalness: 0.15,
    });

    // Dark Technical Ink / Anodized Graphite
    const matInkMetal = new THREE.MeshStandardMaterial({
      color: 0x222428,
      roughness: 0.45,
      metalness: 0.6,
    });

    // Dark Wheel Rubber
    const matRubber = new THREE.MeshStandardMaterial({
      color: 0x1c1e20,
      roughness: 0.85,
      metalness: 0.05,
    });

    // Wheel Hub Rim
    const matWheelHub = new THREE.MeshStandardMaterial({
      color: 0xd2cec4,
      roughness: 0.4,
      metalness: 0.4,
    });

    // Restrained Terracotta Accent
    const matTerracotta = new THREE.MeshStandardMaterial({
      color: 0xc2410c,
      roughness: 0.4,
      metalness: 0.2,
    });

    // Camera Lens Glass
    const matLens = new THREE.MeshStandardMaterial({
      color: 0x0a0c0e,
      roughness: 0.1,
      metalness: 0.9,
    });

    // Sensor Indicator Status Dot
    const matStatusDot = new THREE.MeshBasicMaterial({
      color: 0xc2410c,
    });

    // Highlight Material for Hovered/Selected Subsystem (Refined Terracotta Tone)
    const matHighlight = new THREE.MeshStandardMaterial({
      color: 0xc2410c,
      roughness: 0.35,
      metalness: 0.2,
    });

    // --- PROCEDURAL AUTONOMOUS ROBOT MODEL ---
    const robotRoot = new THREE.Group();
    scene.add(robotRoot);

    const interactiveObjects: { mesh: THREE.Object3D; subsystemId: string; defaultMat: THREE.Material }[] = [];

    const registerMesh = (mesh: THREE.Mesh, subsystemId: string, defaultMat: THREE.Material) => {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = { subsystemId };
      interactiveObjects.push({ mesh, subsystemId, defaultMat });
    };

    // 1. CHASSIS GROUP
    const chassisGroup = new THREE.Group();
    robotRoot.add(chassisGroup);

    // Main Chassis Body Plate (Lower tub)
    const bodyGeometry = new THREE.BoxGeometry(0.95, 0.26, 1.35);
    const bodyMesh = new THREE.Mesh(bodyGeometry, matChassis);
    bodyMesh.position.y = 0.32;
    chassisGroup.add(bodyMesh);
    registerMesh(bodyMesh, 'chassis', matChassis);

    // Chassis Top Deck Plate
    const deckGeometry = new THREE.BoxGeometry(0.88, 0.04, 1.25);
    const deckMesh = new THREE.Mesh(deckGeometry, matInkMetal);
    deckMesh.position.y = 0.47;
    chassisGroup.add(deckMesh);
    registerMesh(deckMesh, 'chassis', matInkMetal);

    // Side Protective Bumpers / Rails
    const bumperGeom = new THREE.BoxGeometry(0.04, 0.14, 1.42);
    const leftBumper = new THREE.Mesh(bumperGeom, matInkMetal);
    leftBumper.position.set(0.49, 0.32, 0);
    chassisGroup.add(leftBumper);
    registerMesh(leftBumper, 'chassis', matInkMetal);

    const rightBumper = leftBumper.clone();
    rightBumper.position.set(-0.49, 0.32, 0);
    chassisGroup.add(rightBumper);
    registerMesh(rightBumper, 'chassis', matInkMetal);

    // Terracotta Accent Trim on Chassis Front
    const frontTrimGeom = new THREE.BoxGeometry(0.75, 0.03, 0.04);
    const frontTrim = new THREE.Mesh(frontTrimGeom, matTerracotta);
    frontTrim.position.set(0, 0.44, 0.68);
    chassisGroup.add(frontTrim);

    // 2. DRIVE SUBSYSTEM (4 Wheels & Axles)
    const wheelMeshes: THREE.Mesh[] = [];
    const wheelRadius = 0.22;
    const wheelWidth = 0.14;
    const wheelPositions = [
      { x: 0.58, y: wheelRadius, z: 0.42 },   // Front Left
      { x: -0.58, y: wheelRadius, z: 0.42 },  // Front Right
      { x: 0.58, y: wheelRadius, z: -0.42 },  // Rear Left
      { x: -0.58, y: wheelRadius, z: -0.42 }, // Rear Right
    ];

    const wheelGeom = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelWidth, 24);
    wheelGeom.rotateZ(Math.PI / 2);

    const hubGeom = new THREE.CylinderGeometry(wheelRadius * 0.55, wheelRadius * 0.55, wheelWidth + 0.01, 16);
    hubGeom.rotateZ(Math.PI / 2);

    const capGeom = new THREE.CylinderGeometry(wheelRadius * 0.22, wheelRadius * 0.22, wheelWidth + 0.02, 12);
    capGeom.rotateZ(Math.PI / 2);

    wheelPositions.forEach((pos) => {
      const singleWheelGroup = new THREE.Group();
      singleWheelGroup.position.set(pos.x, pos.y, pos.z);

      const tire = new THREE.Mesh(wheelGeom, matRubber);
      tire.castShadow = true;
      tire.receiveShadow = true;
      singleWheelGroup.add(tire);
      registerMesh(tire, 'drive', matRubber);

      const hub = new THREE.Mesh(hubGeom, matWheelHub);
      singleWheelGroup.add(hub);
      registerMesh(hub, 'drive', matWheelHub);

      const cap = new THREE.Mesh(capGeom, matTerracotta);
      singleWheelGroup.add(cap);

      robotRoot.add(singleWheelGroup);
      wheelMeshes.push(tire);
    });

    // 3. SENSOR MAST & LIDAR
    const mastGeom = new THREE.CylinderGeometry(0.025, 0.03, 0.38, 12);
    const mastMesh = new THREE.Mesh(mastGeom, matInkMetal);
    mastMesh.position.set(0, 0.68, -0.15);
    robotRoot.add(mastMesh);
    registerMesh(mastMesh, 'lidar', matInkMetal);

    const lidarBaseGeom = new THREE.CylinderGeometry(0.12, 0.13, 0.06, 24);
    const lidarBase = new THREE.Mesh(lidarBaseGeom, matInkMetal);
    lidarBase.position.set(0, 0.88, -0.15);
    robotRoot.add(lidarBase);
    registerMesh(lidarBase, 'lidar', matInkMetal);

    // Rotating LiDAR puck
    const lidarPuckGeom = new THREE.CylinderGeometry(0.11, 0.11, 0.08, 24);
    const lidarPuck = new THREE.Mesh(lidarPuckGeom, matChassis);
    lidarPuck.position.set(0, 0.94, -0.15);
    robotRoot.add(lidarPuck);
    registerMesh(lidarPuck, 'lidar', matChassis);

    // LiDAR optic slot accent
    const lidarSlotGeom = new THREE.BoxGeometry(0.04, 0.03, 0.12);
    const lidarSlot = new THREE.Mesh(lidarSlotGeom, matTerracotta);
    lidarSlot.position.set(0.07, 0.94, -0.15);
    lidarPuck.add(lidarSlot);

    // 4. FORWARD STEREO CAMERA MODULE
    const cameraMountGeom = new THREE.BoxGeometry(0.28, 0.1, 0.1);
    const cameraMount = new THREE.Mesh(cameraMountGeom, matInkMetal);
    cameraMount.position.set(0, 0.54, 0.62);
    robotRoot.add(cameraMount);
    registerMesh(cameraMount, 'camera', matInkMetal);

    const lensGeom = new THREE.CylinderGeometry(0.035, 0.035, 0.04, 16);
    lensGeom.rotateX(Math.PI / 2);

    const leftLens = new THREE.Mesh(lensGeom, matLens);
    leftLens.position.set(0.09, 0.54, 0.67);
    robotRoot.add(leftLens);
    registerMesh(leftLens, 'camera', matLens);

    const rightLens = new THREE.Mesh(lensGeom, matLens);
    rightLens.position.set(-0.09, 0.54, 0.67);
    robotRoot.add(rightLens);
    registerMesh(rightLens, 'camera', matLens);

    // 5. IMU HOUSING & NAVIGATION CORE
    const imuBoxGeom = new THREE.BoxGeometry(0.18, 0.06, 0.18);
    const imuBox = new THREE.Mesh(imuBoxGeom, matInkMetal);
    imuBox.position.set(0, 0.51, 0.15);
    robotRoot.add(imuBox);
    registerMesh(imuBox, 'imu', matInkMetal);

    const imuDotGeom = new THREE.SphereGeometry(0.02, 12, 12);
    const imuDot = new THREE.Mesh(imuDotGeom, matStatusDot);
    imuDot.position.set(0, 0.55, 0.15);
    robotRoot.add(imuDot);
    registerMesh(imuDot, 'imu', matStatusDot);

    const navCoreGeom = new THREE.BoxGeometry(0.35, 0.08, 0.35);
    const navCore = new THREE.Mesh(navCoreGeom, matChassis);
    navCore.position.set(0, 0.51, -0.28);
    robotRoot.add(navCore);
    registerMesh(navCore, 'navigation', matChassis);

    // --- ARCHITECTURAL GROUND GRID & ENVIRONMENT ---
    const gridHelper = new THREE.GridHelper(7, 28, 0x9ca3af, 0xe5e2db);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // Soft Shadow Receiver Floor
    const floorGeom = new THREE.PlaneGeometry(8, 8);
    const floorMat = new THREE.ShadowMaterial({ opacity: 0.14 });
    const floorMesh = new THREE.Mesh(floorGeom, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -0.001;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // --- AUTONOMOUS TRAJECTORY PATH & MARKERS ---
    // Smooth Catmull-Rom Trajectory Curve
    const trajectoryPoints = [
      new THREE.Vector3(0, 0.02, 0),
      new THREE.Vector3(0.6, 0.02, 0.8),
      new THREE.Vector3(1.5, 0.02, 0.5),
      new THREE.Vector3(1.2, 0.02, -1.0),
      new THREE.Vector3(-0.4, 0.02, -1.4),
      new THREE.Vector3(-1.2, 0.02, -0.4),
      new THREE.Vector3(-0.8, 0.02, 0.7),
      new THREE.Vector3(0, 0.02, 0),
    ];
    const trajectoryCurve = new THREE.CatmullRomCurve3(trajectoryPoints, true, 'centripetal');

    // Trajectory Path Line
    const pathPoints = trajectoryCurve.getPoints(120);
    const pathGeom = new THREE.BufferGeometry().setFromPoints(pathPoints);
    const pathMat = new THREE.LineDashedMaterial({
      color: 0xc2410c,
      linewidth: 1.5,
      scale: 1,
      dashSize: 0.12,
      gapSize: 0.08,
      opacity: 0,
      transparent: true,
    });
    const trajectoryLine = new THREE.Line(pathGeom, pathMat);
    trajectoryLine.computeLineDistances();
    scene.add(trajectoryLine);

    // Start Waypoint Ring (●)
    const startRingGeom = new THREE.RingGeometry(0.08, 0.12, 24);
    startRingGeom.rotateX(-Math.PI / 2);
    const startRingMat = new THREE.MeshBasicMaterial({
      color: 0x1c1e20,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7,
    });
    const startMarker = new THREE.Mesh(startRingGeom, startRingMat);
    startMarker.position.set(0, 0.015, 0);
    scene.add(startMarker);

    // Target Waypoint Ring (◎)
    const targetRingGeom = new THREE.RingGeometry(0.14, 0.18, 24);
    targetRingGeom.rotateX(-Math.PI / 2);
    const targetRingMat = new THREE.MeshBasicMaterial({
      color: 0xc2410c,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
    });
    const targetMarker = new THREE.Mesh(targetRingGeom, targetRingMat);
    scene.add(targetMarker);

    // --- ORBIT CONTROLS & CAMERA INTERPOLATION ---
    let spherical = new THREE.Spherical(5.8, Math.PI / 3.4, Math.PI / 4);
    let targetSpherical = new THREE.Spherical(5.8, Math.PI / 3.4, Math.PI / 4);
    const currentLookAt = new THREE.Vector3(0, 0.35, 0);

    let isDragging = false;
    let prevPointerX = 0;
    let prevPointerY = 0;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      prevPointerX = clientX;
      prevPointerY = clientY;
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      if (isDragging) {
        const deltaX = clientX - prevPointerX;
        const deltaY = clientY - prevPointerY;
        prevPointerX = clientX;
        prevPointerY = clientY;

        targetSpherical.theta -= deltaX * 0.008;
        targetSpherical.phi = Math.max(0.3, Math.min(Math.PI / 2 - 0.05, targetSpherical.phi - deltaY * 0.008));
      }

      // Raycasting for Subsystem Hover (Mouse only)
      if (!('touches' in e) && renderer && canvas) {
        const rect = canvas.getBoundingClientRect();
        const mouse = new THREE.Vector2(
          ((clientX - rect.left) / rect.width) * 2 - 1,
          -((clientY - rect.top) / rect.height) * 2 + 1
        );

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);

        const meshes = interactiveObjects.map(item => item.mesh);
        const intersects = raycaster.intersectObjects(meshes, false);

        if (intersects.length > 0) {
          const hitSubsystem = intersects[0].object.userData.subsystemId;
          setHoveredSubsystem(hitSubsystem);
        } else {
          setHoveredSubsystem(null);
        }
      }
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      targetSpherical.radius = Math.max(3.2, Math.min(8.0, targetSpherical.radius + e.deltaY * 0.004));
    };

    const onCanvasClick = (e: MouseEvent) => {
      if (renderer && canvas) {
        const rect = canvas.getBoundingClientRect();
        const mouse = new THREE.Vector2(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          -((e.clientY - rect.top) / rect.height) * 2 + 1
        );

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);

        const meshes = interactiveObjects.map(item => item.mesh);
        const intersects = raycaster.intersectObjects(meshes, false);

        if (intersects.length > 0) {
          const hitSubsystem = intersects[0].object.userData.subsystemId;
          setSelectedSubsystem(prev => (prev === hitSubsystem ? null : hitSubsystem));
        } else {
          setSelectedSubsystem(null);
        }
      }
    };

    // Attach interaction listeners to canvas
    canvas.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    canvas.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('click', onCanvasClick);

    // --- RESIZE HANDLER ---
    const handleResize = () => {
      if (!container || !renderer) return;
      const width = container.clientWidth;
      const height = container.clientHeight || width;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
    handleResize();

    // --- AUTONOMY & RESET ACTIONS ---
    let trajectoryProgress = 0;
    let isResetting = false;
    let resetProgress = 0;
    const initialPos = new THREE.Vector3(0, 0, 0);
    const initialYaw = 0;
    let currentYaw = 0;

    triggerAutonomyRef.current = () => {
      setIsAutonomyActive(true);
      isResetting = false;
    };

    triggerResetRef.current = () => {
      setIsAutonomyActive(false);
      isResetting = true;
      resetProgress = 0;
    };

    // --- ANIMATION LOOP & KINEMATIC SIMULATION ---
    let animationFrameId: number;
    let isVisible = true;
    let clock = new THREE.Clock();

    // IntersectionObserver to pause loop offscreen
    const intersectionObserver = new IntersectionObserver((entries) => {
      isVisible = entries[0].isIntersecting;
    });
    intersectionObserver.observe(container);

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!isVisible) return;

      const delta = Math.min(clock.getDelta(), 0.1);

      // 1. Subtle LiDAR Puck Spin
      lidarPuck.rotation.y += delta * 4.0;

      // 2. Subsystem Material Highlighting
      const activeHighlight = hoveredRef.current || selectedRef.current;
      interactiveObjects.forEach(({ mesh, subsystemId, defaultMat }) => {
        if (mesh instanceof THREE.Mesh) {
          if (activeHighlight === subsystemId) {
            mesh.material = matHighlight;
          } else {
            mesh.material = defaultMat;
          }
        }
      });

      // 3. Autonomous Trajectory Simulation
      if (isAutonomyRef.current) {
        // Fade in trajectory line and target marker
        pathMat.opacity = Math.min(0.8, pathMat.opacity + delta * 2.0);
        targetRingMat.opacity = Math.min(0.7, targetRingMat.opacity + delta * 2.0);

        // Advance along spline path
        trajectoryProgress = (trajectoryProgress + delta * 0.08) % 1.0;
        const currentPos = trajectoryCurve.getPointAt(trajectoryProgress);
        const tangent = trajectoryCurve.getTangentAt(trajectoryProgress).normalize();

        // Calculate differential-drive yaw angle
        const targetYaw = Math.atan2(tangent.x, tangent.z);
        // Smooth angle interpolation
        let angleDiff = targetYaw - currentYaw;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        currentYaw += angleDiff * Math.min(1.0, delta * 8.0);

        robotRoot.position.set(currentPos.x, 0, currentPos.z);
        robotRoot.rotation.y = currentYaw;

        // Rotate wheels with forward motion
        wheelMeshes.forEach(wheel => {
          wheel.rotation.x += delta * 6.0;
        });

        // Place target waypoint ahead on spline
        const targetLeadProgress = (trajectoryProgress + 0.2) % 1.0;
        const targetPos = trajectoryCurve.getPointAt(targetLeadProgress);
        targetMarker.position.set(targetPos.x, 0.015, targetPos.z);

        // Telemetry Update
        const yawDeg = Math.round((currentYaw * 180) / Math.PI) % 360;
        setTelemetry({
          x: parseFloat(currentPos.x.toFixed(2)),
          y: parseFloat((-currentPos.z).toFixed(2)),
          theta: yawDeg < 0 ? yawDeg + 360 : yawDeg,
          mode: 'AUTONOMOUS',
          target: 'LOCKED',
        });
      } else if (isResetting) {
        // Smooth interpolation back to origin
        resetProgress += delta * 2.5;
        const t = Math.min(1.0, resetProgress);

        robotRoot.position.lerp(initialPos, t);
        currentYaw += (initialYaw - currentYaw) * t;
        robotRoot.rotation.y = currentYaw;

        pathMat.opacity = Math.max(0, pathMat.opacity - delta * 3.0);
        targetRingMat.opacity = Math.max(0, targetRingMat.opacity - delta * 3.0);

        if (t >= 1.0) {
          isResetting = false;
          robotRoot.position.copy(initialPos);
          robotRoot.rotation.y = 0;
          currentYaw = 0;
          trajectoryProgress = 0;
          setTelemetry({
            x: 0.0,
            y: 0.0,
            theta: 0,
            mode: 'MANUAL',
            target: 'IDLE',
          });
        }
      } else {
        // Idle gentle breathing / slow orbit if not dragging
        if (!isDragging) {
          targetSpherical.theta += delta * 0.04;
        }
      }

      // 4. Smooth Camera Damping
      spherical.radius += (targetSpherical.radius - spherical.radius) * 0.08;
      spherical.phi += (targetSpherical.phi - spherical.phi) * 0.08;
      spherical.theta += (targetSpherical.theta - spherical.theta) * 0.08;

      camera.position.setFromSpherical(spherical);
      camera.position.add(currentLookAt);
      camera.lookAt(currentLookAt);

      renderer.render(scene, camera);
    };

    animate();

    // --- CLEANUP ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();

      canvas.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      canvas.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('click', onCanvasClick);

      // Dispose Geometries & Materials
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach(m => m.dispose());
          } else {
            obj.material?.dispose();
          }
        }
      });

      renderer.dispose();
    };
  }, []);

  const handleToggleAutonomy = useCallback(() => {
    if (isAutonomyActive) {
      triggerResetRef.current?.();
    } else {
      triggerAutonomyRef.current?.();
    }
  }, [isAutonomyActive]);

  const handleReset = useCallback(() => {
    triggerResetRef.current?.();
  }, []);

  // Display Subsystem Detail
  const activeSubsystemKey = hoveredSubsystem || selectedSubsystem;
  const activeSubsystem = activeSubsystemKey ? SUBSYSTEMS[activeSubsystemKey] : null;

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col justify-between w-full h-full min-h-[380px] sm:min-h-[440px] select-none ${className}`}
      aria-label="Interactive autonomous rover visualization. Drag to rotate. Use Run Autonomy to preview navigation."
    >
      {/* 1. TOP EDITORIAL HEADER BAR */}
      <div className="flex items-center justify-between px-2 pt-1 pb-2 border-b border-paper-300/80">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-terracotta animate-pulse" />
          <span className="text-[11px] font-mono font-semibold tracking-wider text-ink-900 uppercase">
            ROBOT 01 // AUTONOMOUS DIGITAL TWIN
          </span>
        </div>
        <span className="text-[10px] font-mono text-stone-500 hidden sm:inline-block">
          LIGHT EDITORIAL MODEL
        </span>
      </div>

      {/* 2. MAIN 3D CANVAS VIEWPORT / FALLBACK */}
      <div className="relative flex-1 w-full h-full min-h-[260px] flex items-center justify-center cursor-grab active:cursor-grabbing overflow-hidden">
        {hasWebGLError ? (
          /* Graceful 2D Schematic Fallback */
          <div className="flex flex-col items-center justify-center text-center p-6 space-y-3 bg-paper-100/50 rounded-2xl border border-paper-300">
            <div className="w-12 h-12 rounded-full bg-paper-200 border border-paper-400 flex items-center justify-center text-ink-900">
              <Navigation className="w-6 h-6 text-terracotta" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-mono font-semibold text-ink-900 uppercase tracking-wider">
                Autonomous Mobile Platform Schematic
              </h4>
              <p className="text-[11px] font-sans text-ink-600 max-w-xs">
                Kinematic mobile robot featuring 4-wheel differential drive, top planar LiDAR, forward stereo vision, and 6-DOF inertial odometry.
              </p>
            </div>
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            className="w-full h-full aspect-square touch-none outline-none"
          />
        )}

        {/* Dynamic Subsystem Technical Inspector Badge */}
        {activeSubsystem && (
          <div className="absolute top-3 right-3 max-w-[210px] p-2.5 rounded-xl bg-white/95 border border-paper-400 shadow-sm backdrop-blur-xs transition-all pointer-events-none animate-in fade-in duration-200">
            <div className="flex items-center gap-1.5 pb-1 border-b border-paper-200">
              <activeSubsystem.icon className="w-3.5 h-3.5 text-terracotta" />
              <span className="text-[11px] font-mono font-bold text-ink-900">
                {activeSubsystem.name}
              </span>
              <span className="text-[9px] font-mono text-stone-500 ml-auto">
                {activeSubsystem.category}
              </span>
            </div>
            <p className="text-[10px] font-sans text-ink-600 pt-1 leading-snug">
              {activeSubsystem.description}
            </p>
          </div>
        )}
      </div>

      {/* 3. BOTTOM MICRO-TELEMETRY & AUTONOMY CONTROLS */}
      <div className="pt-3 pb-1 border-t border-paper-300/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-[11px] font-mono">
        {/* Restrained Telemetry Readout */}
        <div className="flex items-center gap-3 text-stone-600">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-stone-500">POSE</span>
            <span className="font-semibold text-ink-900">
              X {telemetry.x.toFixed(2)} Y {telemetry.y.toFixed(2)} θ {telemetry.theta}°
            </span>
          </div>
          <span className="text-paper-400">/</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-stone-500">MODE</span>
            <span className={`font-semibold ${isAutonomyActive ? 'text-terracotta' : 'text-ink-900'}`}>
              {telemetry.mode}
            </span>
          </div>
        </div>

        {/* Interactive Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleAutonomy}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-mono font-semibold transition-all shadow-2xs active:scale-[0.98] cursor-pointer ${
              isAutonomyActive
                ? 'bg-ink-900 text-white hover:bg-ink-800'
                : 'bg-terracotta text-white hover:bg-terracotta/90'
            }`}
            title="Toggle autonomous path following"
          >
            <Play className={`w-3 h-3 ${isAutonomyActive ? 'fill-current' : ''}`} />
            <span>{isAutonomyActive ? 'PAUSE AUTONOMY' : 'RUN AUTONOMY'}</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white hover:bg-paper-200 border border-paper-400 text-ink-700 hover:text-ink-950 transition-colors shadow-2xs active:scale-[0.98] cursor-pointer"
            title="Reset rover to initial pose"
          >
            <RotateCcw className="w-3 h-3" />
            <span>RESET</span>
          </button>
        </div>
      </div>
    </div>
  );
};
