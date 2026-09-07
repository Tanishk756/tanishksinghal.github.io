import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { cmsApiClient } from '../../cms/apiClient';
import { ResearchData } from '../../cms/store';
import { ResearchSchema } from '../../cms/schemas';
import { TextInput, TextareaInput, SelectInput } from '../../components/admin/FormFields';
import { Plus, Edit, Trash2, ShieldCheck, CheckCircle2, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

export const AdminResearchPage: React.FC = () => {
  const [researchList, setResearchList] = useState<ResearchData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<ResearchData | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadResearch();
  }, []);

  const loadResearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await cmsApiClient.getContentList<ResearchData>('research');
      if (res.success && Array.isArray(res.data)) {
        const normalized = res.data.filter(Boolean).map((r: any) => ({
          ...r,
          id: String(r.id || `res-${Date.now()}`),
          slug: String(r.slug || ''),
          title: String(r.title || ''),
          domain: String(r.domain || r.area || 'Robotics & Autonomy'),
          summary: String(r.summary || ''),
          problem: String(r.problem || r.research_question || ''),
          methodology: String(r.methodology || ''),
          status: (r.status || r.status_label || 'active') as any,
          publicationStatus: (r.publicationStatus || r.publication_status || 'draft') as any,
          verificationStatus: (r.verificationStatus || r.verification_status || 'USER_PROVIDED') as any,
          source: String(r.source || 'USER_PROVIDED'),
          sourceUrl: String(r.sourceUrl || r.source_url || r.evidence_url || ''),
          lastVerified: String(r.lastVerified || r.last_verified || new Date().toISOString().split('T')[0]),
          notes: String(r.notes || r.verification_notes || ''),
        }));
        setResearchList(normalized);
      } else {
        setError(res.error || 'Failed to load research programs from Supabase.');
        setResearchList([]);
      }
    } catch (e: any) {
      setError(e.message || 'Unexpected network error.');
      setResearchList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStartCreate = () => {
    setIsNew(true);
    setEditingItem({
      id: `res-${Date.now()}`,
      slug: '',
      title: '',
      domain: 'Robotics & Autonomous Systems',
      summary: '',
      problem: '',
      methodology: '',
      status: 'active',
      publicationStatus: 'draft',
      source: 'USER_PROVIDED',
      sourceUrl: '',
      verificationStatus: 'USER_PROVIDED',
      lastVerified: new Date().toISOString().split('T')[0],
      notes: '',
    });
  };

  const handleSave = async (item: ResearchData) => {
    try {
      const enriched: ResearchData = {
        ...item,
        verificationStatus: item.verificationStatus || 'USER_PROVIDED',
        source: item.source || 'USER_PROVIDED',
        publicationStatus: item.publicationStatus || 'draft',
        lastVerified: item.lastVerified || new Date().toISOString().split('T')[0],
      };
      ResearchSchema.parse(enriched);
      setSaving(true);
      
      const res = isNew
        ? await cmsApiClient.saveContentItem('research', enriched)
        : await cmsApiClient.updateContentItem('research', enriched.id, enriched);

      if (!res.success) {
        alert(`Supabase Error: ${res.error || 'Failed to save research record.'}`);
        setSaving(false);
        return;
      }

      await loadResearch();
      setEditingItem(null);
      setIsNew(false);
      setNotice('Research program saved successfully in Supabase.');
      setTimeout(() => setNotice(null), 3000);
    } catch (e: any) {
      alert(`Validation Error: ${e.errors?.[0]?.message || e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Delete research program: "${title}" from Supabase?`)) {
      setDeletingId(id);
      const res = await cmsApiClient.deleteContentItem('research', id);
      if (!res.success) {
        alert(`Failed to delete: ${res.error || 'Unknown error'}`);
      } else {
        await loadResearch();
        setNotice(`Deleted "${title}".`);
        setTimeout(() => setNotice(null), 3000);
      }
      setDeletingId(null);
    }
  };

  return (
    <AdminLayout
      title="Research Programs & Methodologies"
      subtitle="Manage formal robotics investigations, spatial formulations, and publication linkages"
      action={
        <button
          onClick={handleStartCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-medium shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Research Program</span>
        </button>
      }
    >
      <div className="space-y-6">
        {notice && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{notice}</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-mono flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={loadResearch}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 text-[11px] font-semibold transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Editor Modal / Inline Form */}
        {editingItem && (
          <div className="p-6 rounded-2xl bg-white border border-slate-300 shadow-lg space-y-5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 font-mono uppercase">
                {isNew ? 'Create Research Program' : `Edit Research: ${editingItem.title}`}
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="text-xs font-mono text-slate-400 hover:text-slate-700"
              >
                Close ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextInput
                label="Research Title"
                value={editingItem.title}
                onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                required
              />
              <TextInput
                label="Slug"
                value={editingItem.slug}
                onChange={(e) => setEditingItem({ ...editingItem, slug: e.target.value })}
                required
              />
              <TextInput
                label="Domain"
                value={editingItem.domain}
                onChange={(e) => setEditingItem({ ...editingItem, domain: e.target.value })}
                required
              />
              <SelectInput
                label="Status"
                value={editingItem.status}
                onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value as any })}
                options={[
                  { value: 'active', label: 'Active Investigation' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'preliminary', label: 'Preliminary' },
                  { value: 'theoretical', label: 'Theoretical Formulation' },
                ]}
                required
              />
            </div>

            <TextareaInput
              label="Summary"
              value={editingItem.summary}
              onChange={(e) => setEditingItem({ ...editingItem, summary: e.target.value })}
              required
              rows={2}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextareaInput
                label="Problem Statement"
                value={editingItem.problem}
                onChange={(e) => setEditingItem({ ...editingItem, problem: e.target.value })}
                required
                rows={3}
              />
              <TextareaInput
                label="Methodology & Algorithms"
                value={editingItem.methodology}
                onChange={(e) => setEditingItem({ ...editingItem, methodology: e.target.value })}
                required
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-mono"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSave(editingItem)}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-medium shadow-sm disabled:opacity-50"
              >
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{saving ? 'Saving to Supabase...' : 'Save Program'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <Loader2 className="w-6 h-6 animate-spin text-amber-500 mx-auto" />
            <p className="text-xs font-mono text-slate-500">Loading canonical research programs from Supabase...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && researchList.length === 0 && (
          <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <p className="text-xs font-mono text-slate-500 font-medium">No records currently stored in Supabase.</p>
            <p className="text-[11px] text-slate-400">Click &quot;New Research Program&quot; above to create a canonical draft record.</p>
          </div>
        )}

        {/* Research List */}
        {!loading && researchList.length > 0 && (
          <div className="space-y-4">
            {researchList.map((res) => (
              <div key={res.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-semibold">
                      {res.domain || 'Robotics'}
                    </span>
                    <span className="text-xs font-mono text-slate-400 font-semibold">
                      [{(res.status || 'active').toUpperCase()}]
                    </span>
                    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                      res.publicationStatus === 'published' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {res.publicationStatus || 'draft'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                        res.verificationStatus === 'USER_PROVIDED' || res.verificationStatus === 'PUBLIC_WEB_VERIFIED' || res.verificationStatus === 'GITHUB_VERIFIED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      <ShieldCheck className="w-3 h-3" />
                      <span>{res.verificationStatus}</span>
                    </span>
                    <button
                      onClick={() => {
                        setIsNew(false);
                        setEditingItem(res);
                      }}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(res.id, res.title)}
                      disabled={deletingId === res.id}
                      className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 disabled:opacity-50 transition-colors"
                      title="Delete"
                    >
                      {deletingId === res.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900">{res.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">{res.summary}</p>
              </div>
            ))}
          </div>
        )}

      </div>
    </AdminLayout>
  );
};
