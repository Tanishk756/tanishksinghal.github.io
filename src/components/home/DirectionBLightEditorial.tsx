import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, MoveRight } from 'lucide-react';
import { profileData } from '../../generated/profile';
import { getProductionProjects } from '../../generated/projects';

export const DirectionBLightEditorial: React.FC = () => {
  const featuredProjects = getProductionProjects().slice(0, 2);

  return (
    <div className="bg-[#fbfaf7] text-[#141517] min-h-screen selection:bg-zinc-900 selection:text-white font-sans">
      
      {/* 1. Hero Section: Editorial Gallery & Oversized Typography */}
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-[#e5e2da]">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left / Main Editorial Narrative */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-8 space-y-8"
          >
            {/* Editorial Eyebrow */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono uppercase tracking-widest text-[#73716b] font-medium">
                EST. {profileData.displayName.toUpperCase()}
              </span>
              <span className="text-[#ccc8be] font-mono">/</span>
              <span className="text-xs font-mono uppercase tracking-widest text-[#73716b]">
                SYSTEMS & ROBOTICS RESEARCH
              </span>
            </div>

            {/* Oversized Mixed-Type Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-sans font-medium tracking-tight text-[#141517] leading-[1.08]">
              Building intelligent systems that move from <span className="font-serifDisplay italic text-[#141517] font-normal">research</span> to the <span className="underline decoration-1 underline-offset-8 decoration-[#a8a49a]">physical world.</span>
            </h1>

            {/* Description */}
            <p className="text-lg text-[#52504a] max-w-2xl font-sans leading-relaxed font-light">
              A personal engineering platform exploring autonomous spatial navigation, closed-loop kinematics, ROS 2 multi-agent networks, and predictive machine learning.
            </p>

            {/* Editorial Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link
                to="/projects"
                className="inline-flex items-center gap-3 px-7 py-3.5 rounded-full bg-[#141517] text-[#fbfaf7] font-sans font-medium text-sm hover:bg-[#2c2d30] transition-colors shadow-sm"
              >
                <span>EXPLORE WORK</span>
                <MoveRight className="w-4 h-4" />
              </Link>
              <Link
                to="/research"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-transparent hover:bg-[#eeebe3] text-[#141517] border border-[#d6d2c7] font-sans font-medium text-sm transition-colors"
              >
                <span>RESEARCH PROGRAM</span>
                <ArrowUpRight className="w-4 h-4 text-[#73716b]" />
              </Link>
            </div>
          </motion.div>

          {/* Right Column: Architectural Spec Card & Spatial Geometry */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-4 space-y-4"
          >
            {/* Minimalist Spec Card */}
            <div className="rounded-2xl bg-white border border-[#e5e2da] p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#f0ede6]">
                <span className="text-xs font-mono uppercase tracking-wider text-[#73716b]">
                  CORE DISCIPLINES
                </span>
                <span className="text-[11px] font-mono text-[#141517] font-semibold">
                  (04)
                </span>
              </div>

              <div className="space-y-3 text-xs font-mono text-[#383733]">
                <div className="flex items-center justify-between py-1.5 border-b border-[#f7f5f0]">
                  <span>01. Autonomous Navigation</span>
                  <span className="text-[#8c887f]">A* / Dijkstra / SLAM</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-[#f7f5f0]">
                  <span>02. Robotics Middleware</span>
                  <span className="text-[#8c887f]">ROS 2 Humble / Nodes</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-[#f7f5f0]">
                  <span>03. Predictive Modeling</span>
                  <span className="text-[#8c887f]">Scikit / Edge AI</span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span>04. Embedded Firmware</span>
                  <span className="text-[#8c887f]">Serial / Microcontrollers</span>
                </div>
              </div>

              <div className="pt-2 text-[11px] font-sans text-[#73716b] leading-relaxed">
                All systems documented with reproducible source repositories and mathematical methodologies.
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* 2. First Content Transition: Magazine-Style Project Index */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-[#73716b] block">
              CATALOGUE / 2024—2026
            </span>
            <h2 className="text-3xl sm:text-4xl font-sans font-bold text-[#141517]">
              Engineering Case Studies
            </h2>
          </div>
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 text-sm font-sans font-medium text-[#141517] hover:text-[#52504a] transition-colors"
          >
            <span>Complete index ({getProductionProjects().length})</span>
            <MoveRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Editorial Project Rows */}
        <div className="space-y-6">
          {featuredProjects.map((project, idx) => (
            <Link
              key={project.id}
              to={`/projects/${project.slug}`}
              className="group block rounded-2xl bg-white hover:bg-[#f5f3ed] border border-[#e5e2da] hover:border-[#cbc6b8] p-8 transition-all duration-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-1 text-sm font-mono text-[#8c887f]">
                  0{idx + 1}
                </div>
                <div className="md:col-span-5 space-y-1">
                  <h3 className="text-xl sm:text-2xl font-sans font-bold text-[#141517] group-hover:text-[#2c2d30] transition-colors">
                    {project.title}
                  </h3>
                  <span className="text-xs font-mono uppercase text-[#73716b]">
                    {project.category} · {project.startDate}
                  </span>
                </div>
                <div className="md:col-span-4 text-xs font-sans text-[#52504a] leading-relaxed">
                  {project.tagline}
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-[#141517] group-hover:underline">
                    <span>READ STUDY</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
};
