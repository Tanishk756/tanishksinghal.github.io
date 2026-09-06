import React, { useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { contentStore, ResearchData } from '../../cms/store';
import { ResearchSchema } from '../../cms/schemas';
import { TextInput, TextareaInput, SelectInput, ProvenanceEditor } from '../../components/admin/FormFields';
import { Plus, Edit, Trash2, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const AdminResearchPage: React.FC = () => {
  const [researchList, setResearchList] = useState<ResearchData[]>(contentStore.getResearch());
  const [editingItem, setEditingItem] = useState<ResearchData | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const handleStartCreate = () => {
    setIsNew(true);
    setEditingItem({
      id: `res-${Date.now()}`,
      slug: '',
      title: '',
      domain: 'Autonomous Systems',
      summary: '',
      problem: '',
      methodology: '',
      status: 'active',
      publicationStatus: 'published',
      source: 'USER_PROVIDED',
      sourceUrl: '',
      verificationStatus: 'USER_PROVIDED',
      lastVerified: new Date().toISOString().split('T')[0],
      notes: '',
    });
  };

  const handleSave = (item: ResearchData) => {
    try {
      ResearchSchema.parse(item);
      contentStore.saveResearch(item);
      setResearchList(contentStore.getResearch());
      setEditingItem(null);
      setIsNew(false);
      setNotice('Research program saved successfully.');
      setTimeout(() => setNotice(null), 3000);
    } catch (e: any) {
      alert(`Validation Error: ${e.errors?.[0]?.message || e.message}`);
    }
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Delete research program: "${title}"?`)) {
      contentStore.deleteResearch(id);
      setResearchList(contentStore.getResearch());
    }
  };

  return (
    <AdminLayout
      title="Research Programs & Methodologies"
      subtitle="Manage formal robotics investigations, spatial formulations, and publication linkages"
      action={
        <button
          onClick={handleStartCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-medium shadow-sm"
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
                onClick={() => handleSave(editingItem)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-medium shadow-sm"
              >
                Save Program
              </button>
            </div>
          </div>
        )}

        {/* Research List */}
        <div className="space-y-4">
          {researchList.map((res) => (
            <div key={res.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-semibold">
                    {res.domain}
                  </span>
                  <span className="text-xs font-mono text-slate-400 font-semibold">[{res.status.toUpperCase()}]</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                      res.verificationStatus === 'USER_PROVIDED' || res.verificationStatus === 'PUBLIC_WEB_VERIFIED'
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
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                    title="Edit"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(res.id, res.title)}
                    className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900">{res.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">{res.summary}</p>
            </div>
          ))}
        </div>

      </div>
    </AdminLayout>
  );
};
