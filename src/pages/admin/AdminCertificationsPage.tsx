import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { cmsApiClient } from '../../cms/apiClient';
import { CertificationData } from '../../cms/store';
import { CertificationSchema } from '../../cms/schemas';
import { TextInput, ArrayInput } from '../../components/admin/FormFields';
import { Plus, Edit, Trash2, CheckCircle2, Loader2, AlertCircle, RefreshCw, ShieldCheck } from 'lucide-react';

export const AdminCertificationsPage: React.FC = () => {
  const [certifications, setCertifications] = useState<CertificationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<CertificationData | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadCertifications();
  }, []);

  const loadCertifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await cmsApiClient.getContentList<CertificationData>('certification');
      if (res.success && Array.isArray(res.data)) {
        const normalized = res.data.filter(Boolean).map((c: any) => ({
          ...c,
          id: String(c.id || `cert-${Date.now()}`),
          title: String(c.title || ''),
          issuer: String(c.issuer || ''),
          issueDate: String(c.issueDate || c.issue_date || new Date().getFullYear().toString()),
          credentialId: c.credentialId || c.credential_id || '',
          credentialUrl: c.credentialUrl || c.credential_url || '',
          skills: Array.isArray(c.skills) ? c.skills.filter(Boolean).map(String) : [],
          publicationStatus: (c.publicationStatus || c.publication_status || 'draft') as any,
          verificationStatus: (c.verificationStatus || c.verification_status || 'USER_PROVIDED') as any,
          source: String(c.source || 'USER_PROVIDED'),
          sourceUrl: String(c.sourceUrl || c.source_url || c.evidence_url || ''),
          lastVerified: String(c.lastVerified || c.last_verified || new Date().toISOString().split('T')[0]),
          notes: String(c.notes || c.verification_notes || ''),
        }));
        setCertifications(normalized);
      } else {
        setError(res.error || 'Failed to load certifications from Supabase.');
        setCertifications([]);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load certifications.');
      setCertifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStartCreate = () => {
    setIsNew(true);
    setEditingItem({
      id: `cert-${Date.now()}`,
      title: '',
      issuer: '',
      issueDate: new Date().getFullYear().toString(),
      credentialId: '',
      credentialUrl: '',
      skills: [],
      publicationStatus: 'draft',
      source: 'USER_PROVIDED',
      sourceUrl: '',
      verificationStatus: 'USER_PROVIDED',
      lastVerified: new Date().toISOString().split('T')[0],
      notes: '',
    });
  };

  const handleSave = async (item: CertificationData) => {
    try {
      const enriched: CertificationData = {
        ...item,
        verificationStatus: item.verificationStatus || 'USER_PROVIDED',
        source: item.source || 'USER_PROVIDED',
        publicationStatus: item.publicationStatus || 'draft',
        lastVerified: item.lastVerified || new Date().toISOString().split('T')[0],
      };
      CertificationSchema.parse(enriched);
      setSaving(true);
      const res = isNew
        ? await cmsApiClient.saveContentItem('certification', enriched)
        : await cmsApiClient.updateContentItem('certification', enriched.id, enriched);
      setSaving(false);

      if (!res.success) {
        alert(`Failed to save credential: ${res.error || 'Unknown error'}`);
        return;
      }

      await loadCertifications();
      setEditingItem(null);
      setIsNew(false);
      setNotice('Certification credential saved successfully in Supabase.');
      setTimeout(() => setNotice(null), 3000);
    } catch (e: any) {
      alert(`Validation Error: ${e.errors?.[0]?.message || e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Delete certification: "${title}" from Supabase?`)) {
      setDeletingId(id);
      const res = await cmsApiClient.deleteContentItem('certification', id);
      if (!res.success) {
        alert(`Failed to delete: ${res.error || 'Unknown error'}`);
      } else {
        await loadCertifications();
        setNotice(`Deleted "${title}".`);
        setTimeout(() => setNotice(null), 3000);
      }
      setDeletingId(null);
    }
  };

  return (
    <AdminLayout
      title="Certifications & Verified Credentials"
      subtitle="Manage technical accreditations, verified certificates, and issuer credentials"
      action={
        <button
          onClick={handleStartCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-medium shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Credential</span>
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
              onClick={loadCertifications}
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
                {isNew ? 'Add Certificate' : 'Edit Certificate'}
              </h3>
              <button onClick={() => setEditingItem(null)} className="text-xs text-slate-400 hover:text-slate-700">Close ✕</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextInput
                label="Certification Title"
                value={editingItem.title}
                onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                required
              />
              <TextInput
                label="Issuer Organization"
                value={editingItem.issuer}
                onChange={(e) => setEditingItem({ ...editingItem, issuer: e.target.value })}
                required
              />
              <TextInput
                label="Issue Date"
                value={editingItem.issueDate}
                onChange={(e) => setEditingItem({ ...editingItem, issueDate: e.target.value })}
                required
              />
              <TextInput
                label="Credential ID"
                value={editingItem.credentialId || ''}
                onChange={(e) => setEditingItem({ ...editingItem, credentialId: e.target.value })}
              />
            </div>

            <TextInput
              label="Verification URL"
              value={editingItem.credentialUrl || ''}
              onChange={(e) => setEditingItem({ ...editingItem, credentialUrl: e.target.value })}
              placeholder="https://..."
            />

            <ArrayInput
              label="Associated Skills & Disciplines"
              values={editingItem.skills || []}
              onChange={(skills) => setEditingItem({ ...editingItem, skills })}
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
                <span>{saving ? 'Saving...' : 'Save Credential'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <Loader2 className="w-6 h-6 animate-spin text-amber-500 mx-auto" />
            <p className="text-xs font-mono text-slate-500">Loading certifications from Supabase...</p>
          </div>
        )}

        {/* Certifications List */}
        {!loading && (
          <div className="space-y-4">
            {certifications.map((cert) => (
              <div key={cert.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono uppercase font-semibold text-slate-500">
                      {cert.issuer} · {cert.issueDate}
                    </span>
                    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                      cert.publicationStatus === 'published' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {cert.publicationStatus || 'draft'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold inline-flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>{cert.verificationStatus}</span>
                    </span>
                    <button
                      onClick={() => {
                        setIsNew(false);
                        setEditingItem(cert);
                      }}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(cert.id, cert.title)}
                      disabled={deletingId === cert.id}
                      className="p-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 disabled:opacity-50 transition-colors"
                    >
                      {deletingId === cert.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <h3 className="text-base font-bold text-slate-900">{cert.title}</h3>
                {cert.credentialUrl && (
                  <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-slate-600 underline">
                    Verify Credential ↗
                  </a>
                )}
              </div>
            ))}
            {certifications.length === 0 && (
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
