import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { contentStore, CMSStats } from '../../cms/store';
import {
  FolderGit2,
  BookOpen,
  FileText,
  FileCode2,
  ShieldCheck,
  Plus,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<CMSStats>(contentStore.getStats());
  const projects = contentStore.getProjects();
  const publications = contentStore.getPublications();

  useEffect(() => {
    setStats(contentStore.getStats());
  }, []);

  return (
    <AdminLayout
      title="CMS Overview & Governance Dashboard"
      subtitle="Manage portfolio structured data, publication statuses, and verification provenance"
    >
      <div className="space-y-8">
        
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-mono uppercase font-semibold">Engineering Projects</span>
              <FolderGit2 className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">{stats.totalProjects}</span>
              <span className="text-xs font-mono text-emerald-600 font-medium">({stats.publishedProjects} Published)</span>
            </div>
            <div className="text-[11px] text-slate-500 font-sans">
              {stats.draftProjects} draft or in-progress records
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-mono uppercase font-semibold">Research Programs</span>
              <BookOpen className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">{stats.totalResearch}</span>
              <span className="text-xs font-mono text-slate-500">Active Disciplines</span>
            </div>
            <div className="text-[11px] text-slate-500 font-sans">
              Closed-loop control, navigation & ML
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-mono uppercase font-semibold">Publications & Papers</span>
              <FileText className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">{stats.totalPublications}</span>
              <span className="text-xs font-mono text-slate-500">Scholarly Entries</span>
            </div>
            <div className="text-[11px] text-slate-500 font-sans">
              Includes preprints & candidate papers
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-mono uppercase font-semibold">Verification Audit Queue</span>
              <ShieldCheck className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-amber-600">{stats.pendingVerifications}</span>
              <span className="text-xs font-mono text-amber-700 font-medium">Pending Review</span>
            </div>
            <div className="text-[11px] text-slate-500 font-sans">
              Quarantined items marked PROBABLE/UNVERIFIED
            </div>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider">
            Quick Actions & Operations
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/admin/projects/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-medium shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Project Case Study</span>
            </Link>
            <Link
              to="/admin/blog/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-mono font-medium border border-slate-300 transition-all"
            >
              <FileCode2 className="w-4 h-4" />
              <span>Write Technical Article</span>
            </Link>
            <Link
              to="/admin/profile"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-mono font-medium border border-slate-300 transition-all"
            >
              <span>Update Profile & Social Anchors</span>
            </Link>
          </div>
        </div>

        {/* Recent Records & Provenance Status Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Projects Governance */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Recent Projects</h3>
              <Link to="/admin/projects" className="text-xs font-mono text-slate-600 hover:text-slate-900">
                View all ({projects.length}) →
              </Link>
            </div>
            <div className="space-y-3">
              {projects.slice(0, 4).map((p) => (
                <div key={p.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-xs text-slate-900">{p.title}</div>
                    <div className="text-[11px] font-mono text-slate-500">{p.category} · {p.startDate}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                      p.verificationStatus === 'USER_PROVIDED' || p.verificationStatus === 'GITHUB_VERIFIED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {p.verificationStatus}
                    </span>
                    <Link
                      to={`/admin/projects/${p.id}/edit`}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 text-xs"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Research & Publications Governance */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Scholarly & Research Candidates</h3>
              <Link to="/admin/publications" className="text-xs font-mono text-slate-600 hover:text-slate-900">
                View all ({publications.length}) →
              </Link>
            </div>
            <div className="space-y-3">
              {publications.slice(0, 4).map((pub) => (
                <div key={pub.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="max-w-[70%]">
                    <div className="font-semibold text-xs text-slate-900 truncate">{pub.title}</div>
                    <div className="text-[11px] font-mono text-slate-500">{pub.venue} · {pub.year}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                      pub.verificationStatus === 'PUBLIC_WEB_VERIFIED' || pub.verificationStatus === 'USER_PROVIDED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {pub.verificationStatus}
                    </span>
                    <Link
                      to={`/admin/publications`}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 text-xs"
                    >
                      Manage
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </AdminLayout>
  );
};
