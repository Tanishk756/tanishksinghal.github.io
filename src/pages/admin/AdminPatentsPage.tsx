import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { cmsApiClient } from '../../cms/apiClient';
import { PatentData } from '../../cms/store';
import { PatentSchema } from '../../cms/schemas';
import { TextInput, TextareaInput, SelectInput, ArrayInput, ProvenanceEditor } from '../../components/admin/FormFields';
import { Plus, Edit, Trash2, ShieldCheck, CheckCircle2, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

export const AdminPatentsPage: React.FC = () => {
  const [patents, setPatents] = useState<PatentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<PatentData | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadPatents();
  }, []);

  const loadPatents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await cmsApiClient.getContentList<PatentData>('patent');
      if (res.success && Array.isArray(res.data)) {
        const normalized = res.data.filter(Boolean).map((p: any) => ({
          ...p,
          id: String(p.id || `pat-${Date.now()}`),
          slug: String(p.slug || ''),
          title: String(p.title || ''),
          inventors: Array.isArray(p.inventors) ? p.inventors.filter(Boolean).map(String) : ['Tanishk Singhal'],
          jurisdiction: String(p.jurisdiction || 'India / International'),
          status: (p.status || 'in-preparation') as any,
          publicationStatus: (p.publicationStatus || p.publication_status || 'draft') as any,
          abstract: String(p.abstract || ''),
          patentNumber: p.patentNumber || p.patent_number || '',
          filingDate: p.filingDate || p.filing_date || '',
          source: String(p.source || 'USER_PROVIDED'),
          sourceUrl: String(p.sourceUrl || p.source_url || p.evidence_url || ''),
          verificationStatus: (p.verificationStatus || p.verification_status || 'USER_PROVIDED') as any,
          lastVerified: String(p.lastVerified || p.last_verified || new Date().toISOString().split('T')[0]),
          notes: String(p.notes || p.verification_notes || ''),
        }));
        setPatents(normalized);
      } else {
        setError(res.error || 'Failed to load patents from Supabase.');
        setPatents([]);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load patents.');
      setPatents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStartCreate = () => {
    setIsNew(true);
    setEditingItem({
      id: `pat-${Date.now()}`,
      slug: '',
      title: '',
      inventors: ['Tanishk Singhal'],
      jurisdiction: 'India / International',
      status: 'in-preparation',
      publicationStatus: 'draft',
      abstract: '',
      source: 'USER_PROVIDED',
      sourceUrl: '',
      verificationStatus: 'USER_PROVIDED',
      lastVerified: new Date().toISOString().split('T')[0],
      notes: '',
    });
  };

  const handleSave = async (item: PatentData) => {
    try {
      PatentSchema.parse(item);
      setSaving(true);
      const res = isNew
        ? await cmsApiClient.saveContentItem('patent', item)
        : await cmsApiClient.updateContentItem('patent', item.id, item);
      setSaving(false);

      if (!res.success) {
        alert(`Failed to save patent: ${res.error || 'Unknown error'}`);
        return;
      }

      await loadPatents();
      setEditingItem(null);
      setIsNew(false);
      setNotice('Patent record saved successfully in Supabase.');
      setTimeout(() => setNotice(null), 3000);
    } catch (e: any) {
      alert(`Validation Error: ${e.errors?.[0]?.message || e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Delete patent record: "${title}" from Supabase?`)) {
      setDeletingId(id);
      const res = await cmsApiClient.deleteContentItem('patent', id);
      if (!res.success) {
        alert(`Failed to delete: ${res.error || 'Unknown error'}`);
      } else {
        await loadPatents();
        setNotice(`Deleted "${title}".`);
        setTimeout(() => setNotice(null), 3000);
      }
      setDeletingId(null);
    }
  };

  return (
    <AdminLayout
      title="Intellectual Property & Patents Management"
      subtitle="Manage patent filings, disclosures, and patent application numbers with strict provenance"
      action={
        <button
          onClick={handleStartCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-medium shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Patent Entry</span>
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
              onClick={loadPatents}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 text-[11px] font-semibold transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {editingItem && (
          <div className="p-6 rounded-2xl bg-white border border-slate-300 shadow-lg space-y-5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 font-mono uppercase">
                {isNew ? 'New Patent Entry' : `Edit Patent: ${editingItem.title}`}
              </h3>
              <button onClick={() => setEditingItem(null)} className="text-xs font-mono text-slate-400 hover:text-slate-700">
                Close ✕
              </button>
            </div>

            <TextInput
              label="Invention Title"
              value={editingItem.title}
              onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <TextInput
                label="Slug"
                value={editingItem.slug}
                onChange={(e) => setEditingItem({ ...editingItem, slug: e.target.value })}
                required
              />
              <SelectInput
                label="Status"
                value={editingItem.status}
                onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value as any })}
                options={[
                  { value: 'in-preparation', label: 'In Preparation' },
                  { value: 'provisional', label: 'Provisional' },
                  { value: 'filed', label: 'Filed / Pending' },
                  { value: 'granted', label: 'Granted' },
                ]}
                required
              />
              <TextInput
                label="Jurisdiction"
                value={editingItem.jurisdiction}
                onChange={(e) => setEditingItem({ ...editingItem, jurisdiction: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextInput
                label="Patent / Application Identifier (if granted/filed)"
                value={editingItem.patentNumber || ''}
                onChange={(e) => setEditingItem({ ...editingItem, patentNumber: e.target.value })}
                placeholder="e.g. 202411000000"
              />
              <TextInput
                label="Filing Date"
                value={editingItem.filingDate || ''}
                onChange={(e) => setEditingItem({ ...editingItem, filingDate: e.target.value })}
                placeholder="YYYY-MM-DD"
              />
            </div>

            <ArrayInput
              label="Inventors"
              values={editingItem.inventors}
              onChange={(inventors) => setEditingItem({ ...editingItem, inventors })}
            />

            <TextareaInput
              label="Invention Abstract"
              value={editingItem.abstract}
              onChange={(e) => setEditingItem({ ...editingItem, abstract: e.target.value })}
              required
              rows={3}
            />

            <ProvenanceEditor
              data={editingItem}
              onChange={(provenance) => setEditingItem({ ...editingItem, ...provenance })}
            />

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
                <span>{saving ? 'Saving to Supabase...' : 'Save Entry'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <Loader2 className="w-6 h-6 animate-spin text-amber-500 mx-auto" />
            <p className="text-xs font-mono text-slate-500">Loading patents from Supabase...</p>
          </div>
        )}

        {/* Patents List */}
        {!loading && (
          <div className="space-y-4">
            {patents.map((pat) => (
              <div key={pat.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono uppercase font-semibold text-slate-500">
                      {pat.jurisdiction} · {(pat.status || 'in-preparation').toUpperCase()}
                    </span>
                    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                      pat.publicationStatus === 'published' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {pat.publicationStatus || 'draft'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                        pat.verificationStatus === 'USER_PROVIDED' || pat.verificationStatus === 'PUBLIC_WEB_VERIFIED' || pat.verificationStatus === 'GITHUB_VERIFIED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      <ShieldCheck className="w-3 h-3" />
                      <span>{pat.verificationStatus}</span>
                    </span>
                    <button
                      onClick={() => {
                        setIsNew(false);
                        setEditingItem(pat);
                      }}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(pat.id, pat.title)}
                      disabled={deletingId === pat.id}
                      className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 disabled:opacity-50 transition-colors"
                      title="Delete"
                    >
                      {deletingId === pat.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <h3 className="text-base font-bold text-slate-900">{pat.title}</h3>
                <p className="text-xs text-slate-600 font-sans">{pat.abstract}</p>
              </div>
            ))}
            {patents.length === 0 && (
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
