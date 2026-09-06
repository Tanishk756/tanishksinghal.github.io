import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { contentStore, ProjectData } from '../../cms/store';
import { Plus, Edit, Trash2, Eye, ShieldCheck } from 'lucide-react';


export const AdminProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<ProjectData[]>(contentStore.getProjects());
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete project: "${title}"?`)) {
      contentStore.deleteProject(id);
      setProjects(contentStore.getProjects());
    }
  };

  const handleStatusChange = (project: ProjectData, newStatus: 'draft' | 'published' | 'archived') => {
    const updated = { ...project, publicationStatus: newStatus };
    contentStore.saveProject(updated);
    setProjects(contentStore.getProjects());
  };

  const filtered = projects.filter((p) => {
    const matchesStatus = statusFilter === 'all' || p.publicationStatus === statusFilter;
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.tagline.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <AdminLayout
      title="Engineering Projects Management"
      subtitle="Create, edit, archive, and audit deep-dive engineering case studies"
      action={
        <Link
          to="/admin/projects/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-medium shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </Link>
      }
    >
      <div className="space-y-6">
        
        {/* Filter Controls Bar */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-4 items-center justify-between">
          <input
            type="text"
            placeholder="Search projects by title, category, keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-80 px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-sans outline-none focus:border-slate-900"
          />

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-500 uppercase">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-sans bg-white outline-none focus:border-slate-900"
            >
              <option value="all">All ({projects.length})</option>
              <option value="published">Published ({projects.filter(p => p.publicationStatus === 'published').length})</option>
              <option value="draft">Draft ({projects.filter(p => p.publicationStatus === 'draft').length})</option>
              <option value="archived">Archived ({projects.filter(p => p.publicationStatus === 'archived').length})</option>
            </select>
          </div>
        </div>

        {/* Project List Table */}
        <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono uppercase text-[10px]">
                <tr>
                  <th className="p-4">Title & Slug</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Provenance</th>
                  <th className="p-4">Publication</th>
                  <th className="p-4">Year</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-slate-900 text-sm">{p.title}</div>
                      <div className="text-[11px] font-mono text-slate-500">/projects/{p.slug}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-mono uppercase font-semibold text-slate-700">
                        {p.category}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                          p.verificationStatus === 'USER_PROVIDED' || p.verificationStatus === 'GITHUB_VERIFIED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        <ShieldCheck className="w-3 h-3" />
                        <span>{p.verificationStatus}</span>
                      </span>
                    </td>
                    <td className="p-4">
                      <select
                        value={p.publicationStatus || 'published'}
                        onChange={(e) => handleStatusChange(p, e.target.value as any)}
                        className={`text-xs font-mono font-semibold rounded-lg px-2 py-1 border outline-none ${
                          p.publicationStatus === 'published'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : p.publicationStatus === 'draft'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-slate-100 text-slate-600 border-slate-300'
                        }`}
                      >
                        <option value="published">PUBLISHED</option>
                        <option value="draft">DRAFT</option>
                        <option value="archived">ARCHIVED</option>
                      </select>
                    </td>
                    <td className="p-4 font-mono text-slate-500">{p.startDate}</td>
                    <td className="p-4 text-right space-x-2">
                      <Link
                        to={`/projects/${p.slug}`}
                        target="_blank"
                        className="inline-flex items-center p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                        title="View on public site"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                      <Link
                        to={`/admin/projects/${p.id}/edit`}
                        className="inline-flex items-center p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white"
                        title="Edit project details"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(p.id, p.title)}
                        className="inline-flex items-center p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
                        title="Delete project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-xs font-mono">
                No matching projects found.
              </div>
            )}
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};
