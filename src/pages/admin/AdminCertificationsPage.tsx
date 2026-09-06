import React, { useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { contentStore, CertificationData } from '../../cms/store';
import { CertificationSchema } from '../../cms/schemas';
import { TextInput, ArrayInput, ProvenanceEditor } from '../../components/admin/FormFields';
import { Plus, Trash2, CheckCircle2 } from 'lucide-react';

export const AdminCertificationsPage: React.FC = () => {
  const [certifications, setCertifications] = useState<CertificationData[]>(contentStore.getCertifications());
  const [editingItem, setEditingItem] = useState<CertificationData | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const handleStartCreate = () => {
    setEditingItem({
      id: `cert-${Date.now()}`,
      title: '',
      issuer: '',
      issueDate: new Date().getFullYear().toString(),
      credentialId: '',
      credentialUrl: '',
      skills: [],
      publicationStatus: 'published',
      source: 'USER_PROVIDED',
      sourceUrl: '',
      verificationStatus: 'USER_PROVIDED',
      lastVerified: new Date().toISOString().split('T')[0],
      notes: '',
    });
  };

  const handleSave = (item: CertificationData) => {
    try {
      CertificationSchema.parse(item);
      contentStore.saveCertification(item);
      setCertifications(contentStore.getCertifications());
      setEditingItem(null);
      setNotice('Certification credential saved.');
      setTimeout(() => setNotice(null), 3000);
    } catch (e: any) {
      alert(`Validation Error: ${e.errors?.[0]?.message || e.message}`);
    }
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Delete certification: "${title}"?`)) {
      contentStore.deleteCertification(id);
      setCertifications(contentStore.getCertifications());
    }
  };

  return (
    <AdminLayout
      title="Certifications & Verified Credentials"
      subtitle="Manage technical accreditations, verified certificates, and issuer credentials"
      action={
        <button
          onClick={handleStartCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-medium shadow-sm"
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

        {editingItem && (
          <div className="p-6 rounded-2xl bg-white border border-slate-300 shadow-lg space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-mono font-bold uppercase text-slate-900">Add / Edit Certificate</h3>
              <button onClick={() => setEditingItem(null)} className="text-xs text-slate-400">Close ✕</button>
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
                onClick={() => handleSave(editingItem)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-mono font-medium"
              >
                Save Credential
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {certifications.map((cert) => (
            <div key={cert.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-mono uppercase font-semibold text-slate-500">
                  {cert.issuer} · {cert.issueDate}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                    {cert.verificationStatus}
                  </span>
                  <button
                    onClick={() => handleDelete(cert.id, cert.title)}
                    className="p-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
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
              No verified certification records added yet.
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};
