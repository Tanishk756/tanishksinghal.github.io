import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { OrganizationData } from '../../cms/store';
import { cmsApiClient } from '../../cms/apiClient';
import { OrganizationSchema } from '../../cms/schemas';
import { TextInput, TextareaInput } from '../../components/admin/FormFields';
import { Plus, Trash2, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

export const AdminOrganizationsPage: React.FC = () => {
  const [organizations, setOrganizations] = useState<OrganizationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<OrganizationData | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await cmsApiClient.getContentList<OrganizationData>('organization');
      if (!response.success) {
        setError(response.error || 'Failed to load organizations from Supabase.');
        setOrganizations([]);
      } else {
        const list = Array.isArray(response.data) ? response.data.filter(Boolean) : [];
        setOrganizations(list);
      }
    } catch (err: any) {
      setError(err?.message || 'Unexpected network exception while fetching organizations.');
      setOrganizations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStartCreate = () => {
    setEditingItem({
      id: `org-${Date.now()}`,
      name: '',
      role: '',
      period: new Date().getFullYear().toString(),
      description: '',
      url: '',
      publicationStatus: 'draft',
      source: 'USER_PROVIDED',
      sourceUrl: '',
      verificationStatus: 'USER_PROVIDED',
      lastVerified: new Date().toISOString().split('T')[0],
      notes: '',
    });
  };

  const handleSave = async (item: OrganizationData) => {
    try {
      const enriched: OrganizationData = {
        ...item,
        verificationStatus: item.verificationStatus || 'USER_PROVIDED',
        source: item.source || 'USER_PROVIDED',
        publicationStatus: item.publicationStatus || 'draft',
        lastVerified: item.lastVerified || new Date().toISOString().split('T')[0],
      };
      OrganizationSchema.parse(enriched);
      setSaving(true);
      const res = await cmsApiClient.saveContentItem('organization', enriched);
      if (!res.success) {
        alert(`Failed to save organization to Supabase: ${res.error || 'Unknown error'}`);
        setSaving(false);
        return;
      }
      await loadOrganizations();
      setEditingItem(null);
      setNotice('Organization record saved to Supabase.');
      setTimeout(() => setNotice(null), 3000);
    } catch (e: any) {
      alert(`Validation Error: ${e.errors?.[0]?.message || e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Delete organization: "${name}"?`)) {
      setDeletingId(id);
      const res = await cmsApiClient.deleteContentItem('organization', id);
      if (!res.success) {
        alert(`Failed to delete organization from Supabase: ${res.error || 'Unknown error'}`);
      } else {
        await loadOrganizations();
      }
      setDeletingId(null);
    }
  };

  return (
    <AdminLayout
      title="Organizations & Affiliations"
      subtitle="Manage research labs, student initiatives, institutions, and affiliations in Supabase"
      action={
        <button
          onClick={handleStartCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-medium shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Organization</span>
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
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-mono flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={loadOrganizations}
              className="px-3 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded font-semibold"
            >
              Retry
            </button>
          </div>
        )}

        {editingItem && (
          <div className="p-6 rounded-2xl bg-white border border-slate-300 shadow-lg space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-mono font-bold uppercase text-slate-900">Add / Edit Organization</h3>
              <button onClick={() => setEditingItem(null)} className="text-xs text-slate-400">Close ✕</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextInput
                label="Organization / Laboratory Name"
                value={editingItem.name}
                onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                required
              />
              <TextInput
                label="Role / Title"
                value={editingItem.role}
                onChange={(e) => setEditingItem({ ...editingItem, role: e.target.value })}
                required
              />
              <TextInput
                label="Period / Duration"
                value={editingItem.period}
                onChange={(e) => setEditingItem({ ...editingItem, period: e.target.value })}
                required
              />
              <TextInput
                label="Organization Website URL"
                value={editingItem.url || ''}
                onChange={(e) => setEditingItem({ ...editingItem, url: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <TextareaInput
              label="Description & Contribution"
              value={editingItem.description}
              onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
              required
              rows={2}
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
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-mono font-medium disabled:opacity-50 inline-flex items-center gap-2"
              >
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{saving ? 'Saving...' : 'Save Organization'}</span>
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="p-12 rounded-2xl bg-white border border-slate-200 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
            <span className="text-xs font-mono text-slate-500">Loading organizations from Supabase...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {organizations.map((org) => (
              <div key={org.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-mono uppercase font-semibold text-slate-500">
                    {org.role} · {org.period}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold uppercase">
                      {org.publicationStatus || 'draft'}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                      {org.verificationStatus}
                    </span>
                    <button
                      onClick={() => handleDelete(org.id, org.name)}
                      disabled={deletingId === org.id}
                      className="p-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 disabled:opacity-50"
                    >
                      {deletingId === org.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <h3 className="text-base font-bold text-slate-900">{org.name}</h3>
                <p className="text-xs text-slate-600 font-sans">{org.description}</p>
              </div>
            ))}
            {organizations.length === 0 && !loading && (
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
