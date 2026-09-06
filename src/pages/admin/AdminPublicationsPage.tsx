import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { cmsApiClient } from '../../cms/apiClient';
import { PublicationData } from '../../cms/store';
import { PublicationSchema } from '../../cms/schemas';
import { TextInput, TextareaInput, SelectInput, ArrayInput, ProvenanceEditor } from '../../components/admin/FormFields';
import { Plus, Edit, Trash2, ShieldCheck, CheckCircle2, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

export const AdminPublicationsPage: React.FC = () => {
  const [publications, setPublications] = useState<PublicationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<PublicationData | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadPublications();
  }, []);

  const loadPublications = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await cmsApiClient.getContentList<PublicationData>('publication');
      if (res.success && Array.isArray(res.data)) {
        const normalized = res.data.filter(Boolean).map((p: any) => ({
          ...p,
          id: String(p.id || `pub-${Date.now()}`),
          slug: String(p.slug || ''),
          title: String(p.title || ''),
          authors: Array.isArray(p.authors) ? p.authors.filter(Boolean).map(String) : ['Tanishk Singhal'],
          year: Number(p.year) || new Date().getFullYear(),
          venue: String(p.venue || ''),
          publicationType: (p.publicationType || p.publication_type || 'journal') as any,
          status: (p.status || 'published') as any,
          publicationStatus: (p.publicationStatus || p.publication_status || 'draft') as any,
          abstract: String(p.abstract || ''),
          keywords: Array.isArray(p.keywords) ? p.keywords.filter(Boolean).map(String) : [],
          publisher: String(p.publisher || ''),
          doi: String(p.doi || ''),
          pdfUrl: String(p.pdfUrl || p.pdf_url || ''),
          externalUrl: String(p.externalUrl || p.external_url || p.doi_url || p.scholar_url || ''),
          source: String(p.source || 'USER_PROVIDED'),
          sourceUrl: String(p.sourceUrl || p.source_url || p.evidence_url || ''),
          verificationStatus: (p.verificationStatus || p.verification_status || 'USER_PROVIDED') as any,
          lastVerified: String(p.lastVerified || p.last_verified || new Date().toISOString().split('T')[0]),
          notes: String(p.notes || p.verification_notes || ''),
        }));
        setPublications(normalized);
      } else {
        setError(res.error || 'Failed to load publications from Supabase.');
        setPublications([]);
      }
    } catch (e: any) {
      setError(e.message || 'Unexpected network error.');
      setPublications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStartCreate = () => {
    setIsNew(true);
    setEditingItem({
      id: `pub-${Date.now()}`,
      slug: '',
      title: '',
      authors: ['Tanishk Singhal'],
      year: new Date().getFullYear(),
      venue: '',
      publicationType: 'journal',
      status: 'under-review',
      publicationStatus: 'draft',
      abstract: '',
      keywords: [],
      publisher: '',
      doi: '',
      pdfUrl: '',
      externalUrl: '',
      source: 'USER_PROVIDED',
      sourceUrl: '',
      verificationStatus: 'USER_PROVIDED',
      lastVerified: new Date().toISOString().split('T')[0],
      notes: '',
    });
  };

  const handleSave = async (item: PublicationData) => {
    try {
      PublicationSchema.parse(item);
      setSaving(true);
      
      const res = isNew
        ? await cmsApiClient.saveContentItem('publication', item)
        : await cmsApiClient.updateContentItem('publication', item.id, item);

      if (!res.success) {
        alert(`Supabase Error: ${res.error || 'Failed to save publication record.'}`);
        setSaving(false);
        return;
      }

      await loadPublications();
      setEditingItem(null);
      setIsNew(false);
      setNotice('Publication record saved successfully in Supabase.');
      setTimeout(() => setNotice(null), 3000);
    } catch (e: any) {
      alert(`Validation Error: ${e.errors?.[0]?.message || e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Delete publication record: "${title}" from Supabase?`)) {
      setDeletingId(id);
      const res = await cmsApiClient.deleteContentItem('publication', id);
      if (!res.success) {
        alert(`Failed to delete: ${res.error || 'Unknown error'}`);
      } else {
        await loadPublications();
        setNotice(`Deleted "${title}".`);
        setTimeout(() => setNotice(null), 3000);
      }
      setDeletingId(null);
    }
  };

  return (
    <AdminLayout
      title="Scholarly Publications & Papers Database"
      subtitle="Manage candidate preprints, journal articles, citation metadata, and verification provenance"
      action={
        <button
          onClick={handleStartCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-medium shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Publication</span>
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
              onClick={loadPublications}
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
                {isNew ? 'Add Publication Record' : `Edit Publication: ${editingItem.title}`}
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="text-xs font-mono text-slate-400 hover:text-slate-700"
              >
                Close ✕
              </button>
            </div>

            <TextInput
              label="Publication Title"
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
              <TextInput
                label="Publication Year"
                type="number"
                value={editingItem.year.toString()}
                onChange={(e) => setEditingItem({ ...editingItem, year: parseInt(e.target.value) || new Date().getFullYear() })}
                required
              />
              <SelectInput
                label="Type"
                value={editingItem.publicationType}
                onChange={(e) => setEditingItem({ ...editingItem, publicationType: e.target.value as any })}
                options={[
                  { value: 'journal', label: 'Journal Article' },
                  { value: 'conference', label: 'Conference Paper' },
                  { value: 'preprint', label: 'Preprint / arXiv' },
                  { value: 'workshop', label: 'Workshop Paper' },
                  { value: 'book-chapter', label: 'Book Chapter' },
                ]}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextInput
                label="Venue / Journal Name"
                value={editingItem.venue}
                onChange={(e) => setEditingItem({ ...editingItem, venue: e.target.value })}
                required
              />
              <TextInput
                label="Publisher (if known)"
                value={editingItem.publisher || ''}
                onChange={(e) => setEditingItem({ ...editingItem, publisher: e.target.value })}
                placeholder="e.g. Taylor & Francis, IEEE, Springer"
              />
            </div>

            <ArrayInput
              label="Authors List"
              values={editingItem.authors}
              onChange={(authors) => setEditingItem({ ...editingItem, authors })}
              placeholder="e.g. Tanishk Singhal, Collaborator Name"
            />

            <TextareaInput
              label="Abstract"
              value={editingItem.abstract}
              onChange={(e) => setEditingItem({ ...editingItem, abstract: e.target.value })}
              required
              rows={3}
            />

            <ArrayInput
              label="Keywords"
              values={editingItem.keywords}
              onChange={(keywords) => setEditingItem({ ...editingItem, keywords })}
              placeholder="e.g. UAV, Wireless Power Harvesting, Digital Twin"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextInput
                label="DOI (only if confirmed)"
                value={editingItem.doi || ''}
                onChange={(e) => setEditingItem({ ...editingItem, doi: e.target.value })}
                placeholder="10.xxxx/..."
              />
              <TextInput
                label="External URL / Repository Link"
                value={editingItem.externalUrl || ''}
                onChange={(e) => setEditingItem({ ...editingItem, externalUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>

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
                <span>{saving ? 'Saving to Supabase...' : 'Save Publication'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <Loader2 className="w-6 h-6 animate-spin text-amber-500 mx-auto" />
            <p className="text-xs font-mono text-slate-500">Loading canonical publications from Supabase...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && publications.length === 0 && (
          <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <p className="text-xs font-mono text-slate-500 font-medium">No records currently stored in Supabase.</p>
            <p className="text-[11px] text-slate-400">Click &quot;New Publication&quot; above to create a canonical draft record.</p>
          </div>
        )}

        {/* Publication Records List */}
        {!loading && publications.length > 0 && (
          <div className="space-y-4">
            {publications.map((pub) => (
              <div key={pub.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                      {pub.year || new Date().getFullYear()} · {(pub.publicationType || 'journal').toUpperCase()}
                    </span>
                    <span className="text-xs font-mono text-slate-500">{pub.venue}</span>
                    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                      pub.publicationStatus === 'published' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {pub.publicationStatus || 'draft'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                        pub.verificationStatus === 'PUBLIC_WEB_VERIFIED' || pub.verificationStatus === 'USER_PROVIDED' || pub.verificationStatus === 'GITHUB_VERIFIED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      <ShieldCheck className="w-3 h-3" />
                      <span>{pub.verificationStatus}</span>
                    </span>
                    <button
                      onClick={() => {
                        setIsNew(false);
                        setEditingItem(pub);
                      }}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(pub.id, pub.title)}
                      disabled={deletingId === pub.id}
                      className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 disabled:opacity-50 transition-colors"
                      title="Delete"
                    >
                      {deletingId === pub.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900">{pub.title}</h3>
                <p className="text-xs font-mono text-slate-500">
                  Authors: {Array.isArray(pub.authors) ? pub.authors.join(', ') : ''}
                </p>
                <p className="text-xs text-slate-600 font-sans line-clamp-2">{pub.abstract}</p>
              </div>
            ))}
          </div>
        )}

      </div>
    </AdminLayout>
  );
};
