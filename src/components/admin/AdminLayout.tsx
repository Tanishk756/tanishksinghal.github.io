import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  FolderGit2,
  BookOpen,
  FileText,
  Award,
  BadgeCheck,
  Wrench,
  FileCode2,
  Building2,
  Image as ImageIcon,
  ShieldCheck,
  Mail,
  Download,
  Upload,
  RotateCcw,
  ExternalLink,
  CheckCircle2,
  LogOut,
} from 'lucide-react';
import { contentStore } from '../../cms/store';
import { useAdminAuth } from '../../cms/AuthContext';
import { AdminAuthGuard } from './AdminAuthGuard';

export interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title, subtitle, action }) => {
  const [notice, setNotice] = useState<string | null>(null);
  const { user, signOut, isAuthenticated } = useAdminAuth();

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Contact Inquiries', path: '/admin/contact', icon: Mail },
    { label: 'Profile & Bio', path: '/admin/profile', icon: User },
    { label: 'Projects Archive', path: '/admin/projects', icon: FolderGit2 },
    { label: 'Research Programs', path: '/admin/research', icon: BookOpen },
    { label: 'Publications', path: '/admin/publications', icon: FileText },
    { label: 'Patents & IP', path: '/admin/patents', icon: ShieldCheck },
    { label: 'Engineering Timeline', path: '/admin/experience', icon: Building2 },
    { label: 'Skills Matrix', path: '/admin/skills', icon: Wrench },
    { label: 'Technical Blog', path: '/admin/blog', icon: FileCode2 },
    { label: 'Achievements', path: '/admin/achievements', icon: Award },
    { label: 'Certifications', path: '/admin/certifications', icon: BadgeCheck },
    { label: 'Organizations', path: '/admin/organizations', icon: Building2 },
    { label: 'Media Registry', path: '/admin/media', icon: ImageIcon },
  ];

  const handleExportJSON = () => {
    const jsonString = contentStore.exportJSON();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tanishk-singhal-content-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setNotice('Content snapshot exported successfully.');
    setTimeout(() => setNotice(null), 4000);
  };

  const handleImportJSON = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const text = await file.text();
      const success = contentStore.importJSON(text);
      if (success) {
        setNotice('Content imported successfully! Reloading...');
        setTimeout(() => window.location.reload(), 1500);
      } else {
        alert('Invalid JSON file. Please check file structure.');
      }
    };
    input.click();
  };

  const handleResetDefaults = () => {
    if (confirm('Are you sure you want to reset all content to default code module values? Custom edits in localStorage will be cleared.')) {
      contentStore.resetToDefaults();
      setNotice('Reset to module defaults completed.');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col md:flex-row">
        
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col justify-between shrink-0 border-r border-slate-800">
          <div>
            {/* Admin Header / Logo */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm tracking-tight">CMS ADMIN</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    SUPABASE
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">Tanishk Singhal Portfolio</p>
              </div>
            </div>

            {/* Navigation links */}
            <nav className="p-3 space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/admin'}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-slate-800 text-white font-semibold shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`
                  }
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Sidebar Footer Actions */}
          <div className="p-4 border-t border-slate-800 space-y-2 text-xs">
            {isAuthenticated && user && (
              <div className="pb-2 border-b border-slate-800 flex items-center justify-between">
                <div className="min-w-0 pr-2">
                  <p className="text-[10px] font-mono text-slate-400 truncate">{user.email}</p>
                </div>
                <button
                  onClick={() => signOut()}
                  title="Sign out of Admin CMS"
                  className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
            >
              <span className="inline-flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Public Website</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">Preview ↗</span>
            </Link>

            <div className="pt-2 flex gap-1">
              <button
                onClick={handleExportJSON}
                className="flex-1 inline-flex items-center justify-center gap-1.5 p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[11px] font-mono"
                title="Export all content to JSON file"
              >
                <Download className="w-3 h-3" />
                <span>Export</span>
              </button>
              <button
                onClick={handleImportJSON}
                className="flex-1 inline-flex items-center justify-center gap-1.5 p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[11px] font-mono"
                title="Import content from JSON file"
              >
                <Upload className="w-3 h-3" />
                <span>Import</span>
              </button>
              <button
                onClick={handleResetDefaults}
                className="p-2 rounded-lg bg-slate-800/80 hover:bg-rose-950/60 hover:text-rose-300 text-slate-400"
                title="Reset all content to original defaults"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 bg-slate-50">
          
          {/* Top Header Bar */}
          <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-30 shadow-xs">
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
              {subtitle && <p className="text-xs text-slate-500 font-sans mt-0.5">{subtitle}</p>}
            </div>

            <div className="flex items-center gap-3">
              <div className={`hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono border ${
                contentStore.backendType === 'LOCAL_DEVELOPMENT_STORE'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  contentStore.backendType === 'LOCAL_DEVELOPMENT_STORE' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
                }`} />
                <span>{contentStore.backendType === 'LOCAL_DEVELOPMENT_STORE' ? 'LOCAL DEV STORE (FALLBACK)' : 'SUPABASE BACKEND CONNECTED'}</span>
              </div>
              {action}
            </div>
          </header>

          {/* Global Toast Notice */}
          {notice && (
            <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-mono flex items-center justify-between shadow-sm animate-in fade-in duration-150">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {notice}
              </span>
              <button onClick={() => setNotice(null)} className="text-emerald-700 hover:text-emerald-950 font-bold">
                ×
              </button>
            </div>
          )}

          {/* Page Content Body */}
          <div className="p-6 max-w-6xl w-full mx-auto space-y-6">
            {children}
          </div>
        </main>

      </div>
    </AdminAuthGuard>
  );
};
