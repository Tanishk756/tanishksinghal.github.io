import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowUpRight, ArrowRight, Layers, Compass, BrainCircuit, Cpu } from 'lucide-react';
import { getProductionProjects } from '../../content/projects';

// 3D Spatial Tilt Container
const SpatialHeroCard: React.FC = () => {
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['12deg', '-12deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-12deg', '12deg']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      className="relative w-full h-[460px] rounded-3xl bg-gradient-to-br from-[#161b26]/90 to-[#0e121a]/95 border border-white/[0.1] p-8 shadow-2xl backdrop-blur-xl flex flex-col justify-between overflow-hidden group cursor-pointer"
    >
      {/* 3D Depth Lighting Grid */}
      <div
        style={{ transform: 'translateZ(20px)' }}
        className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-teal-500/5 opacity-80 pointer-events-none"
      />

      {/* Floating Header */}
      <div style={{ transform: 'translateZ(40px)' }} className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-teal-400" />
          <span className="text-xs font-mono uppercase tracking-wider text-zinc-300">
            SPATIAL NODE MATRIX
          </span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-zinc-400">
          PERSPECTIVE TRACKING
        </span>
      </div>

      {/* 3D Layered Domain Nodes */}
      <div style={{ transform: 'translateZ(60px)' }} className="space-y-4 my-auto relative z-10">
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md flex items-center justify-between transition-transform duration-200 group-hover:translate-x-1">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-300">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-space font-semibold text-white">Closed-Loop Navigation</div>
              <div className="text-[11px] font-mono text-zinc-400">ROS 2 & A* Global Planner</div>
            </div>
          </div>
          <span className="text-xs font-mono text-teal-400">ACTIVE</span>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md flex items-center justify-between transition-transform duration-200 group-hover:translate-x-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-300">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-space font-semibold text-white">Edge Predictive Models</div>
              <div className="text-[11px] font-mono text-zinc-400">Machine Learning & Analytics</div>
            </div>
          </div>
          <span className="text-xs font-mono text-indigo-400">BENCHMARKED</span>
        </div>
      </div>

      {/* Floating Base Action */}
      <div style={{ transform: 'translateZ(30px)' }} className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-zinc-400 relative z-10">
        <span>INTERACTIVE PERSPECTIVE</span>
        <span className="text-zinc-200">HOVER TO TILT 3D PLANE</span>
      </div>
    </motion.div>
  );
};

export const DirectionCHybridSpatial: React.FC = () => {
  const featuredProjects = getProductionProjects().slice(0, 2);

  return (
    <div className="bg-[#0b0e14] text-zinc-100 min-h-screen selection:bg-teal-400 selection:text-black font-sans">
      
      {/* 1. Hero Section: Spatial Depth & Dynamic Perspective */}
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          
          {/* Left Hero Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 space-y-8"
          >
            {/* Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-mono">
              <Cpu className="w-3.5 h-3.5" />
              <span>SPATIAL & AUTONOMOUS ENGINEERING</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-space font-bold text-white tracking-tight leading-[1.05]">
              ENGINEERING AUTONOMY & INTELLIGENT SYSTEMS FROM THE GROUND UP.
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-zinc-400 max-w-xl font-sans leading-relaxed font-light">
              Bridging mathematical robotics formulations with real-world embedded software, spatial trajectory generation, and multi-robot autonomy.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/projects"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-teal-400 text-zinc-950 font-space font-semibold text-sm hover:bg-teal-300 transition-all shadow-lg shadow-teal-500/20 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>EXPLORE SYSTEMS</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/research"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 border border-white/[0.1] font-space font-medium text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>RESEARCH INITIATIVES</span>
                <ArrowUpRight className="w-4 h-4 text-zinc-400" />
              </Link>
            </div>
          </motion.div>

          {/* Right Column: 3D Spatial Tilt Centerpiece */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5"
          >
            <SpatialHeroCard />
          </motion.div>

        </div>
      </section>

      {/* 2. First Content Transition: Spatial Project Cards */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/[0.06]">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-teal-400 block">
              // 01 ARCHIVED WORK
            </span>
            <h2 className="text-3xl sm:text-4xl font-space font-bold text-white">
              Selected Autonomous Engineering
            </h2>
          </div>
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 text-sm font-space text-zinc-400 hover:text-white transition-colors"
          >
            <span>Browse all archives</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {featuredProjects.map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.slug}`}
              className="group rounded-3xl bg-[#121620]/80 hover:bg-[#161c29] border border-white/[0.08] hover:border-teal-500/40 p-8 transition-all duration-300 flex flex-col justify-between space-y-8 hover:shadow-2xl hover:shadow-black/60 hover:-translate-y-1"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-mono text-teal-400">
                  <span className="uppercase">{project.category}</span>
                  <span className="text-zinc-400">{project.startDate}</span>
                </div>
                <h3 className="text-2xl font-space font-bold text-white group-hover:text-teal-300 transition-colors">
                  {project.title}
                </h3>
                <p className="text-sm text-zinc-400 font-sans leading-relaxed">
                  {project.tagline}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/[0.06] text-xs font-mono">
                <span className="text-zinc-400">ROS 2 / C++ / PYTHON</span>
                <span className="inline-flex items-center gap-1 text-teal-400 group-hover:translate-x-1 transition-transform">
                  <span>OPEN CASE STUDY</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
};
