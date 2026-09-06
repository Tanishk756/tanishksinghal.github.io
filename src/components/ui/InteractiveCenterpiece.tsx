import React, { useRef, useEffect, useState } from 'react';

/**
 * Interactive Spatial Kinematic Sculpture (Light Editorial Centerpiece)
 * 
 * An interactive, mathematical multi-axis spatial lattice reflecting robotics kinematics,
 * coordinate transformations, and orbital geometry.
 * 
 * Aesthetic: Crisp architectural line art, restrained stone/ink hues, subtle cursor-reactive inertia.
 * Strictly avoids: Neon glowing effects, HUD telemetry, and gaming-style particle noise.
 */
export const InteractiveCenterpiece: React.FC<{ className?: string }> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    // Smooth lerp physics
    let currentRotX = 0;
    let currentRotY = 0;

    const render = () => {
      time += 0.008;
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      ctx.clearRect(0, 0, width, height);

      // Interpolate towards mouse target
      currentRotX += (mousePos.targetY * 0.45 - currentRotX) * 0.05;
      currentRotY += (mousePos.targetX * 0.45 - currentRotY) * 0.05;

      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) * 0.36;

      ctx.save();
      ctx.translate(centerX, centerY);

      // Base background concentric coordinate rings (hairline)
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(20, 21, 23, 0.06)';
      ctx.beginPath();
      ctx.arc(0, 0, radius * 1.15, 0, Math.PI * 2);
      ctx.arc(0, 0, radius * 0.85, 0, Math.PI * 2);
      ctx.arc(0, 0, radius * 0.55, 0, Math.PI * 2);
      ctx.stroke();

      // Cardinal axis guides
      ctx.strokeStyle = 'rgba(20, 21, 23, 0.04)';
      ctx.beginPath();
      ctx.moveTo(-radius * 1.25, 0);
      ctx.lineTo(radius * 1.25, 0);
      ctx.moveTo(0, -radius * 1.25);
      ctx.lineTo(0, radius * 1.25);
      ctx.stroke();

      // 3D Rotating Coordinate Rings (Kinematic Multi-Axis Gyroscope)
      const numRings = 5;
      for (let i = 0; i < numRings; i++) {
        const ringFactor = (i + 1) / numRings;
        const currentRadius = radius * ringFactor;
        const angleOffset = (i * Math.PI) / numRings + time * (i % 2 === 0 ? 1 : -0.7);

        const rotX = currentRotX + Math.sin(time + i) * 0.15;
        const rotY = currentRotY + angleOffset;

        ctx.beginPath();
        const segments = 64;
        const points: { x: number; y: number; z: number }[] = [];

        for (let j = 0; j <= segments; j++) {
          const theta = (j / segments) * Math.PI * 2;
          // Unrotated ring point on X-Z plane
          const x0 = Math.cos(theta) * currentRadius;
          const y0 = Math.sin(theta) * currentRadius * Math.sin(rotX);
          const z0 = Math.sin(theta) * currentRadius * Math.cos(rotX);

          // Rotate around Y axis
          const x1 = x0 * Math.cos(rotY) + z0 * Math.sin(rotY);
          const y1 = y0;
          const z1 = -x0 * Math.sin(rotY) + z0 * Math.cos(rotY);

          points.push({ x: x1, y: y1, z: z1 });
        }

        // Draw ring path
        ctx.strokeStyle = i === 2
          ? 'rgba(20, 21, 23, 0.35)'
          : i % 2 === 0
          ? 'rgba(20, 21, 23, 0.18)'
          : 'rgba(20, 21, 23, 0.1)';
        ctx.lineWidth = i === 2 ? 1.25 : 1;

        ctx.beginPath();
        for (let j = 0; j < points.length; j++) {
          const p = points[j];
          if (j === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.closePath();
        ctx.stroke();

        // Node intersection joints
        if (i > 1) {
          const nodeIdx = Math.floor((time * 20 + i * 15) % points.length);
          const node = points[nodeIdx];
          if (node) {
            ctx.fillStyle = '#141517';
            ctx.beginPath();
            ctx.arc(node.x, node.y, 2.5, 0, Math.PI * 2);
            ctx.fill();

            // Subtle node projection line
            ctx.strokeStyle = 'rgba(20, 21, 23, 0.12)';
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(node.x, node.y + (node.z > 0 ? 12 : -12));
            ctx.stroke();
          }
        }
      }

      // Centerpiece Origin Node
      ctx.fillStyle = '#141517';
      ctx.beginPath();
      ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, [mousePos]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMousePos(prev => ({ ...prev, targetX: x, targetY: y }));
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePos(prev => ({ ...prev, targetX: 0, targetY: 0 }));
  };

  return (
    <div
      className={`relative flex items-center justify-center cursor-crosshair select-none ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full max-w-[540px] max-h-[540px] aspect-square"
      />
      
      {/* Editorial Origin Annotation */}
      <div className={`absolute bottom-3 left-3 text-[10px] font-mono uppercase transition-opacity duration-300 ${
        isHovered ? 'opacity-80 text-ink-900' : 'opacity-40 text-stone-500'
      }`}>
        <span className="tracking-widest">FIG 01 // KINEMATIC COORD SYSTEM</span>
      </div>
    </div>
  );
};
