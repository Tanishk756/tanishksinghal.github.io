import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowRight, MoveRight } from 'lucide-react';
import { profileData } from '../../content/profile';
import { getProductionProjects } from '../../content/projects';

// Interactive Kinetic Canvas Centerpiece
const KineticCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 500);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 500);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // Mouse coordinates
    let mouse = { x: width / 2, y: height / 2, targetX: width / 2, targetY: height / 2 };
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
    };
    canvas.addEventListener('mousemove', handleMouseMove);

    // Topological Nodes
    const nodes: { x: number; y: number; baseX: number; baseY: number; vx: number; vy: number; radius: number }[] = [];
    const count = 38;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const dist = 110 + (i % 3) * 35;
      const x = width / 2 + Math.cos(angle) * dist;
      const y = height / 2 + Math.sin(angle) * dist;
      nodes.push({ x, y, baseX: x, baseY: y, vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4, radius: 2.5 + Math.random() * 2 });
    }

    let angleOffset = 0;

    const render = () => {
      // Smooth mouse follow
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      ctx.clearRect(0, 0, width, height);

      // Subtle ambient orbital glow
      const grad = ctx.createRadialGradient(width / 2, height / 2, 20, width / 2, height / 2, 240);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.04)');
      grad.addColorStop(0.5, 'rgba(120, 140, 180, 0.02)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, 240, 0, Math.PI * 2);
      ctx.fill();

      angleOffset += 0.003;

      // Update & Draw Nodes
      nodes.forEach((node, i) => {
        // Orbit motion
        const currentAngle = (i / count) * Math.PI * 2 + angleOffset;
        const dist = 110 + (i % 3) * 35;
        const targetX = width / 2 + Math.cos(currentAngle) * dist;
        const targetY = height / 2 + Math.sin(currentAngle) * dist;

        // Mouse displacement
        const dx = mouse.x - node.x;
        const dy = mouse.y - node.y;
        const distMouse = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 140;

        if (distMouse < maxDist) {
          const force = (1 - distMouse / maxDist) * 35;
          node.x = targetX - (dx / distMouse) * force;
          node.y = targetY - (dy / distMouse) * force;
        } else {
          node.x += (targetX - node.x) * 0.05;
          node.y += (targetY - node.y) * 0.05;
        }
      });

      // Draw Connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 85) {
            const alpha = (1 - dist / 85) * 0.25;
            ctx.strokeStyle = `rgba(220, 230, 255, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw Node points
      nodes.forEach((node) => {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw Core Pivot
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, 70, 0, Math.PI * 2);
      ctx.stroke();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative w-full h-[420px] sm:h-[500px] flex items-center justify-center">
      <canvas ref={canvasRef} className="w-full h-full cursor-crosshair" />
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="text-center space-y-1 bg-[#0a0b0e]/70 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/[0.08]">
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block">
            INTERACTIVE TOPOLOGY
          </span>
          <span className="text-xs font-sans text-zinc-200 font-medium">
            Hover to deform kinematic field
          </span>
        </div>
      </div>
    </div>
  );
};

export const DirectionADarkCinematic: React.FC = () => {
  const featuredProjects = getProductionProjects().slice(0, 2);

  return (
    <div className="bg-[#090a0d] text-zinc-100 min-h-screen selection:bg-zinc-100 selection:text-zinc-950 font-sans">
      
      {/* 1. Cinematic Hero Section */}
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        
        {/* Ambient subtle lighting */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-indigo-500/5 via-zinc-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
          
          {/* Left Column: Hero Narrative & Large Display Typography */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 space-y-8"
          >
            {/* Author / Identity Pill */}
            <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-medium">
                {profileData.displayName}
              </span>
              <span className="text-zinc-600">/</span>
              <span className="text-xs font-sans text-zinc-400">
                Robotics & Autonomous Systems
              </span>
            </div>

            {/* Oversized Statement Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-syne font-extrabold tracking-tight text-white leading-[1.04]">
              BUILDING INTELLIGENT SYSTEMS THAT MOVE FROM <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-zinc-300 to-zinc-500">RESEARCH</span> → <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-200 via-indigo-200 to-white">REAL WORLD.</span>
            </h1>

            {/* Sub-narrative */}
            <p className="text-base sm:text-lg text-zinc-400 max-w-xl font-sans leading-relaxed font-light">
              Engineering closed-loop autonomous navigation, ROS 2 multi-agent networks, embedded avionics, and edge intelligence.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/projects"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white text-zinc-950 font-sans font-semibold text-sm hover:bg-zinc-200 transition-all shadow-xl shadow-white/5 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>EXPLORE WORK</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/research"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-zinc-200 border border-white/[0.1] font-sans font-medium text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>RESEARCH & PAPERS</span>
                <ArrowUpRight className="w-4 h-4 text-zinc-400" />
              </Link>
            </div>

            {/* Disciplines Chips */}
            <div className="pt-6 border-t border-white/[0.07] flex flex-wrap gap-x-6 gap-y-2 text-xs font-mono text-zinc-400">
              <span>// ROBOTICS & ROS 2</span>
              <span>// PATH PLANNING & SLAM</span>
              <span>// EMBEDDED CONTROL</span>
              <span>// COMPUTER VISION</span>
            </div>
          </motion.div>

          {/* Right Column: Visual Kinetic Centerpiece */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 relative"
          >
            <div className="relative rounded-3xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/[0.08] p-4 backdrop-blur-xl shadow-2xl">
              <KineticCanvas />
            </div>
          </motion.div>

        </div>
      </section>

      {/* 2. First Content Transition: Selected Engineering Feature */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/[0.06]">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-400 block">
              01 / SELECTED SYSTEMS
            </span>
            <h2 className="text-3xl sm:text-4xl font-syne font-bold text-white">
              Autonomous Systems in Execution
            </h2>
          </div>
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 text-sm font-sans text-zinc-400 hover:text-white transition-colors group"
          >
            <span>View all engineering archives</span>
            <MoveRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Asymmetric Project Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {featuredProjects.map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.slug}`}
              className="group relative rounded-3xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.07] hover:border-white/[0.18] p-8 transition-all duration-300 flex flex-col justify-between space-y-8 overflow-hidden"
            >
              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                  <span className="uppercase tracking-wider">{project.category}</span>
                  <span>{project.startDate}</span>
                </div>
                <h3 className="text-2xl font-syne font-bold text-white group-hover:text-zinc-100 transition-colors">
                  {project.title}
                </h3>
                <p className="text-sm text-zinc-400 font-sans leading-relaxed">
                  {project.tagline}
                </p>
              </div>

              <div className="space-y-6 relative z-10">
                <div className="flex flex-wrap gap-2">
                  {project.subcategories.slice(0, 4).map((tech, tIdx) => (
                    <span
                      key={tIdx}
                      className="px-2.5 py-1 rounded-full text-xs font-mono bg-white/[0.04] text-zinc-300 border border-white/[0.06]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-xs font-mono font-medium text-zinc-300 group-hover:text-white transition-colors">
                  <span>EXPLORE CASE STUDY</span>
                  <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
};
