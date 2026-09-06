import React, { useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { contentStore, AchievementData } from '../../cms/store';
import { AchievementSchema } from '../../cms/schemas';
import { TextInput, TextareaInput, SelectInput, ProvenanceEditor } from '../../components/admin/FormFields';
import { Plus, Trash2, CheckCircle2 } from 'lucide-react';


export const AdminAchievementsPage: React.FC = () => {
  const [achievements, setAchievements] = useState<AchievementData[]>(contentStore.getAchievements());
  const [editingItem, setEditingItem] = useState<AchievementData | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const handleStartCreate = () => {
    setEditingItem({
      id: `ach-${Date.now()}`,
      title: '',
      organization: '',
      date: new Date().getFullYear().toString(),
      description: '',
      category: 'competition',
      evidenceUrl: '',
      publicationStatus: 'published',
      source: 'USER_PROVIDED',
      sourceUrl: '',
      verificationStatus: 'USER_PROVIDED',
      lastVerified: new Date().toISOString().split('T')[0],
      notes: '',
    });
  };

  const handleSave = (item: AchievementData) => {
    try {
      AchievementSchema.parse(item);
      contentStore.saveAchievement(item);
      setAchievements(contentStore.getAchievements());
      setEditingItem(null);
      setNotice('Achievement saved.');
      setTimeout(() => setNotice(null), 3000);
    } catch (e: any) {
      alert(`Validation Error: ${e.errors?.[0]?.message || e.message}`);
    }
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Delete achievement: "${title}"?`)) {
      contentStore.deleteAchievement(id);
      setAchievements(contentStore.getAchievements());
    }
  };

  return (
    <AdminLayout
      title="Honors & Achievements Registry"
      subtitle="Manage competition awards, hackathons, and scholarly recognitions with explicit verification"
      action={
        <button
          onClick={handleStartCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-medium shadow-sm"
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

        {editingItem && (
          <div className="p-6 rounded-2xl bg-white border border-slate-300 shadow-lg space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-mono font-bold uppercase text-slate-900">Add / Edit Honor</h3>
              <button onClick={() => setEditingItem(null)} className="text-xs text-slate-400">Close ✕</button>
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
                onClick={() => handleSave(editingItem)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-mono font-medium"
              >
                Save Achievement
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {achievements.map((ach) => (
            <div key={ach.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-mono uppercase font-semibold text-slate-500">
                  {ach.category} · {ach.date}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                    {ach.verificationStatus}
                  </span>
                  <button
                    onClick={() => handleDelete(ach.id, ach.title)}
                    className="p-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <h3 className="text-base font-bold text-slate-900">{ach.title}</h3>
              <p className="text-xs text-slate-600 font-sans">{ach.description}</p>
            </div>
          ))}
          {achievements.length === 0 && (
            <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center text-xs font-mono text-slate-400">
              No verified achievements added yet.
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};
