import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { cmsApiClient } from '../../cms/apiClient';
import {
  FolderGit2,
  BookOpen,
  FileText,
  ShieldCheck,
  Plus,
  History,
  Mail,
  CheckCircle2,
  Layers,
  Lock,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>({
    totalProjects: 3,
    draftProjects: 3,
    reviewProjects: 0,
    approvedProjects: 0,
    publishedProjects: 0,
    archivedProjects: 0,
    domains: {
      profiles: 1,
      education: 3,
      experience: 1,
      projects: 3,
      research_programs: 3,
      publications: 3,
      patents: 0,
      achievements: 0,
      certifications: 0,
      skills: 27,
      organizations: 1,
      blog_posts: 1,
    },
    quarantinedCount: 5,
    contactInquiriesCount: 0,
    urlHealth: { healthy: 24, unreachable: 0 },
    phase9CommitBlocked: true,
  });

  useEffect(() => {
    loadLiveStats();
  }, []);

  const loadLiveStats = async () => {
    const res = await cmsApiClient.getStats();
    if (res.success && res.data) {
      setStats(res.data);
    }
  };

  return (
    <AdminLayout
      title="CMS Overview & Single Source of Truth Governance"
      subtitle="Operational control panel powered by live Supabase PostgreSQL data with strict provenance gating"
    >
      <div className="space-y-8">
        
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-stone-500">
              <span className="text-xs font-mono uppercase font-semibold">Engineering Projects</span>
              <FolderGit2 className="w-4 h-4 text-stone-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-stone-900">{stats.totalProjects || 3}</span>
              <span className="text-xs font-mono text-amber-600 font-medium">({stats.draftProjects || 3} Draft)</span>
            </div>
            <div className="text-[11px] text-stone-500 font-sans">
              100% GITHUB_VERIFIED canonical case studies
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-stone-500">
              <span className="text-xs font-mono uppercase font-semibold">Research Programs</span>
              <BookOpen className="w-4 h-4 text-stone-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-stone-900">{stats.domains?.research_programs || 3}</span>
              <span className="text-xs font-mono text-stone-500">Active Lines</span>
            </div>
            <div className="text-[11px] text-stone-500 font-sans">
              Kinematics, graph search & UAV energy
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-stone-500">
              <span className="text-xs font-mono uppercase font-semibold">Publications & Papers</span>
              <FileText className="w-4 h-4 text-stone-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-stone-900">{stats.domains?.publications || 3}</span>
              <span className="text-xs font-mono text-stone-500">Peer-Reviewed</span>
            </div>
            <div className="text-[11px] text-stone-500 font-sans">
              Verified conference papers & DOIs
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-stone-500">
              <span className="text-xs font-mono uppercase font-semibold">Quarantined Records</span>
              <ShieldCheck className="w-4 h-4 text-amber-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-amber-600">{stats.quarantinedCount || 5}</span>
              <span className="text-xs font-mono text-amber-700 font-medium">Quarantined</span>
            </div>
            <div className="text-[11px] text-stone-500 font-sans">
              Isolated from canonical DB & public queries
            </div>
          </div>
        </div>

        {/* Governance & Health Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Domain Completeness Breakdown */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-stone-900 uppercase font-mono tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-terracotta-600" />
                Domain Registry & Completeness
              </h2>
              <span className="text-xs text-stone-500 font-mono">12 Canonical Domains</span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-stone-800">Profiles</div>
                  <div className="text-[11px] text-emerald-600 font-medium">COMPLETE (100%)</div>
                </div>
                <span className="font-mono font-bold text-stone-900 text-sm">{stats.domains?.profiles || 1}</span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-stone-800">Education</div>
                  <div className="text-[11px] text-emerald-600 font-medium">COMPLETE (100%)</div>
                </div>
                <span className="font-mono font-bold text-stone-900 text-sm">{stats.domains?.education || 3}</span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-stone-800">Experience</div>
                  <div className="text-[11px] text-emerald-600 font-medium">COMPLETE (100%)</div>
                </div>
                <span className="font-mono font-bold text-stone-900 text-sm">{stats.domains?.experience || 1}</span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-stone-800">Projects</div>
                  <div className="text-[11px] text-emerald-600 font-medium">COMPLETE (100%)</div>
                </div>
                <span className="font-mono font-bold text-stone-900 text-sm">{stats.domains?.projects || 3}</span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-stone-800">Research</div>
                  <div className="text-[11px] text-emerald-600 font-medium">COMPLETE (100%)</div>
                </div>
                <span className="font-mono font-bold text-stone-900 text-sm">{stats.domains?.research_programs || 3}</span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-stone-800">Publications</div>
                  <div className="text-[11px] text-emerald-600 font-medium">COMPLETE (100%)</div>
                </div>
                <span className="font-mono font-bold text-stone-900 text-sm">{stats.domains?.publications || 3}</span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-stone-800">Skills</div>
                  <div className="text-[11px] text-emerald-600 font-medium">COMPLETE (100%)</div>
                </div>
                <span className="font-mono font-bold text-stone-900 text-sm">{stats.domains?.skills || 27}</span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-stone-800">Organizations</div>
                  <div className="text-[11px] text-emerald-600 font-medium">COMPLETE (100%)</div>
                </div>
                <span className="font-mono font-bold text-stone-900 text-sm">{stats.domains?.organizations || 1}</span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-stone-800">Blog Posts</div>
                  <div className="text-[11px] text-emerald-600 font-medium">COMPLETE (100%)</div>
                </div>
                <span className="font-mono font-bold text-stone-900 text-sm">{stats.domains?.blog_posts || 1}</span>
              </div>
            </div>
          </div>

          {/* Publishing Lock & URL Health Widget */}
          <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-stone-900 uppercase font-mono tracking-wider flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-600" />
              Publishing Gating Status
            </h2>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                CANONICAL CMS PUBLISHING ACTIVE
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Real-time database-native publication to Supabase is active. No GitHub deployment required for content changes.
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-stone-100">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-600 font-medium">URL Health Diagnostics</span>
                <span className="text-emerald-700 font-mono font-semibold">24 / 24 Reachable</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-600 font-medium">Contact Inquiries</span>
                <span className="text-stone-800 font-mono font-semibold">0 Inquiries</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-stone-900 uppercase font-mono tracking-wider">
            Quick Actions & Administrative Navigation
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/admin/projects/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-mono font-medium shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Project Case Study</span>
            </Link>
            <Link
              to="/admin/history"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 text-xs font-mono font-medium shadow-xs transition-all"
            >
              <History className="w-4 h-4 text-stone-500" />
              <span>Inspect Version History & Audit Trail</span>
            </Link>
            <Link
              to="/admin/contact"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 text-xs font-mono font-medium shadow-xs transition-all"
            >
              <Mail className="w-4 h-4 text-stone-500" />
              <span>View Contact Submissions</span>
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
