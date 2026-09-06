import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { cmsApiClient } from '../../cms/apiClient';
import { AchievementData } from '../../cms/store';
import { AchievementSchema } from '../../cms/schemas';
import { TextInput, TextareaInput, SelectInput, ProvenanceEditor } from '../../components/admin/FormFields';
import { Plus, Edit, Trash2, CheckCircle2, Loader2, AlertCircle, RefreshCw, ShieldCheck } from 'lucide-react';

export const AdminAchievementsPage: React.FC = () => {
  const [achievements, setAchievements] = useState<AchievementData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<AchievementData | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await cmsApiClient.getContentList<AchievementData>('achievement');
      if (res.success && Array.isArray(res.data)) {
        const normalized = res.data.filter(Boolean).map((a: any) => ({
          ...a,
          id: String(a.id || `ach-${Date.now()}`),
          title: String(a.title || ''),
          organization: String(a.organization || ''),
          date: String(a.date || new Date().getFullYear().toString()),
          description: String(a.description || ''),
          category: (a.category || 'competition') as any,
          evidenceUrl: a.evidenceUrl || a.evidence_url || '',
          publicationStatus: (a.publicationStatus || a.publication_status || 'draft') as any,
          verificationStatus: (a.verificationStatus || a.verification_status || 'USER_PROVIDED') as any,
          source: String(a.source || 'USER_PROVIDED'),
          sourceUrl: String(a.sourceUrl || a.source_url || a.evidence_url || ''),
          lastVerified: String(a.lastVerified || a.last_verified || new Date().toISOString().split('T')[0]),
          notes: String(a.notes || a.verification_notes || ''),
        }));
        setAchievements(normalized);
      } else {
        setError(res.error || 'Failed to load achievements from Supabase.');
        setAchievements([]);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load achievements.');
      setAchievements([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStartCreate = () => {
    setIsNew(true);
    setEditingItem({
      id: `ach-${Date.now()}`,
      title: '',
      organization: '',
      date: new Date().getFullYear().toString(),
      description: '',
      category: 'competition',
      evidenceUrl: '',
      publicationStatus: 'draft',
      source: 'USER_PROVIDED',
      sourceUrl: '',
      verificationStatus: 'USER_PROVIDED',
      lastVerified: new Date().toISOString().split('T')[0],
      notes: '',
    });
  };

  const handleSave = async (item: AchievementData) => {
    try {
      AchievementSchema.parse(item);
      setSaving(true);
      const res = isNew
        ? await cmsApiClient.saveContentItem('achievement', item)
        : await cmsApiClient.updateContentItem('achievement', item.id, item);
      setSaving(false);

      if (!res.success) {
        alert(`Failed to save achievement: ${res.error || 'Unknown error'}`);
        return;
      }

      await loadAchievements();
      setEditingItem(null);
      setIsNew(false);
      setNotice('Achievement saved successfully in Supabase.');
      setTimeout(() => setNotice(null), 3000);
    } catch (e: any) {
      alert(`Validation Error: ${e.errors?.[0]?.message || e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Delete achievement: "${title}" from Supabase?`)) {
      setDeletingId(id);
      const res = await cmsApiClient.deleteContentItem('achievement', id);
      if (!res.success) {
        alert(`Failed to delete: ${res.error || 'Unknown error'}`);
      } else {
        await loadAchievements();
        setNotice(`Deleted "${title}".`);
        setTimeout(() => setNotice(null), 3000);
      }
      setDeletingId(null);
    }
  };

  return (
    <AdminLayout
      title="Honors & Achievements Registry"
      subtitle="Manage competition awards, hackathons, and scholarly recognitions with explicit verification"
      action={
        <button
          onClick={handleStartCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-medium shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Achievement</span>
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
              onClick={loadAchievements}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 text-[11px] font-semibold transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {editingItem && (
          <div className="p-6 rounded-2xl bg-white border border-slate-300 shadow-lg space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-mono font-bold uppercase text-slate-900">
                {isNew ? 'Add Honor' : 'Edit Honor'}
              </h3>
              <button onClick={() => setEditingItem(null)} className="text-xs text-slate-400 hover:text-slate-700">Close ✕</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextInput
                label="Honor / Award Title"
                value={editingItem.title}
                onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                required
              />
              <TextInput
                label="Awarding Organization"
                value={editingItem.organization}
                onChange={(e) => setEditingItem({ ...editingItem, organization: e.target.value })}
                required
              />
              <TextInput
                label="Year / Date"
                value={editingItem.date}
                onChange={(e) => setEditingItem({ ...editingItem, date: e.target.value })}
                required
              />
              <SelectInput
                label="Category"
                value={editingItem.category}
                onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value as any })}
                options={[
                  { value: 'competition', label: 'Competition' },
                  { value: 'hackathon', label: 'Hackathon' },
                  { value: 'scholarship', label: 'Scholarship' },
                  { value: 'academic', label: 'Academic Honor' },
                  { value: 'award', label: 'Industry Award' },
                ]}
                required
              />
            </div>

            <TextareaInput
              label="Description & Context"
              value={editingItem.description}
              onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
              required
              rows={2}
            />

            <TextInput
              label="Evidence / Credential Link"
              value={editingItem.evidenceUrl || ''}
              onChange={(e) => setEditingItem({ ...editingItem, evidenceUrl: e.target.value })}
              placeholder="https://..."
            />

            <ProvenanceEditor
              data={editingItem}
              onChange={(provenance) => setEditingItem({ ...editingItem, ...provenance })}
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-mono"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSave(editingItem)}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-mono font-medium disabled:opacity-50"
              >
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{saving ? 'Saving...' : 'Save Achievement'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <Loader2 className="w-6 h-6 animate-spin text-amber-500 mx-auto" />
            <p className="text-xs font-mono text-slate-500">Loading achievements from Supabase...</p>
          </div>
        )}

        {/* Achievements List */}
        {!loading && (
          <div className="space-y-4">
            {achievements.map((ach) => (
              <div key={ach.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono uppercase font-semibold text-slate-500">
                      {ach.category} · {ach.date}
                    </span>
                    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                      ach.publicationStatus === 'published' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {ach.publicationStatus || 'draft'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold inline-flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>{ach.verificationStatus}</span>
                    </span>
                    <button
                      onClick={() => {
                        setIsNew(false);
                        setEditingItem(ach);
                      }}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(ach.id, ach.title)}
                      disabled={deletingId === ach.id}
                      className="p-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 disabled:opacity-50 transition-colors"
                    >
                      {deletingId === ach.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <h3 className="text-base font-bold text-slate-900">{ach.title}</h3>
                <p className="text-xs text-slate-600 font-sans">{ach.description}</p>
              </div>
            ))}
            {achievements.length === 0 && (
              <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center text-xs font-mono text-slate-400">
                No records currently stored in Supabase.
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
