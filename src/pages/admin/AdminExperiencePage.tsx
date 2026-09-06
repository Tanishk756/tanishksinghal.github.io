import React, { useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { contentStore, ExperienceData } from '../../cms/store';
import { ExperienceSchema } from '../../cms/schemas';
import { TextInput, TextareaInput, ArrayInput, ProvenanceEditor } from '../../components/admin/FormFields';
import { Plus, Edit, Trash2, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const AdminExperiencePage: React.FC = () => {
  const [experiences, setExperiences] = useState<ExperienceData[]>(contentStore.getExperience());
  const [editingItem, setEditingItem] = useState<ExperienceData | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const handleStartCreate = () => {
    setIsNew(true);
    setEditingItem({
      id: `exp-${Date.now()}`,
      organization: '',
      role: '',
      employmentType: 'Full-time / Research',
      location: '',
      startDate: new Date().getFullYear().toString(),
      current: false,
      description: '',
      responsibilities: [],
      achievements: [],
      technologies: [],
      publicationStatus: 'published',
      source: 'USER_PROVIDED',
      sourceUrl: '',
      verificationStatus: 'USER_PROVIDED',
      lastVerified: new Date().toISOString().split('T')[0],
      notes: '',
    });
  };

  const handleSave = (item: ExperienceData) => {
    try {
      ExperienceSchema.parse(item);
      contentStore.saveExperience(item);
      setExperiences(contentStore.getExperience());
      setEditingItem(null);
      setIsNew(false);
      setNotice('Experience role saved.');
      setTimeout(() => setNotice(null), 3000);
    } catch (e: any) {
      alert(`Validation Error: ${e.errors?.[0]?.message || e.message}`);
    }
  };

  const handleDelete = (id: string, org: string) => {
    if (confirm(`Delete experience: "${org}"?`)) {
      contentStore.deleteExperience(id);
      setExperiences(contentStore.getExperience());
    }
  };

  return (
    <AdminLayout
      title="Engineering Experience Timeline"
      subtitle="Manage formal engineering roles, research labs, contributions, and verified employment anchors"
      action={
        <button
          onClick={handleStartCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-medium shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Experience</span>
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
          <div className="p-6 rounded-2xl bg-white border border-slate-300 shadow-lg space-y-5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 font-mono uppercase">
                {isNew ? 'New Experience Role' : `Edit: ${editingItem.role} at ${editingItem.organization}`}
              </h3>
              <button onClick={() => setEditingItem(null)} className="text-xs font-mono text-slate-400">
                Close ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextInput
                label="Organization / Lab Name"
                value={editingItem.organization}
                onChange={(e) => setEditingItem({ ...editingItem, organization: e.target.value })}
                required
              />
              <TextInput
                label="Role Title"
                value={editingItem.role}
                onChange={(e) => setEditingItem({ ...editingItem, role: e.target.value })}
                required
              />
              <TextInput
                label="Location"
                value={editingItem.location}
                onChange={(e) => setEditingItem({ ...editingItem, location: e.target.value })}
                required
              />
              <TextInput
                label="Employment Type"
                value={editingItem.employmentType}
                onChange={(e) => setEditingItem({ ...editingItem, employmentType: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextInput
                label="Start Date"
                value={editingItem.startDate}
                onChange={(e) => setEditingItem({ ...editingItem, startDate: e.target.value })}
                required
              />
              <TextInput
                label="End Date (leave blank if current)"
                value={editingItem.endDate || ''}
                onChange={(e) => setEditingItem({ ...editingItem, endDate: e.target.value })}
                placeholder="e.g. Present, or 2025"
              />
            </div>

            <TextareaInput
              label="Overview & Scope"
              value={editingItem.description}
              onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
              required
              rows={2}
            />

            <ArrayInput
              label="Key Responsibilities"
              values={editingItem.responsibilities}
              onChange={(responsibilities) => setEditingItem({ ...editingItem, responsibilities })}
              placeholder="e.g. Architected ROS 2 nodes for multi-agent swarm..."
            />

            <ArrayInput
              label="Technologies Used"
              values={editingItem.technologies}
              onChange={(technologies) => setEditingItem({ ...editingItem, technologies })}
              placeholder="e.g. ROS 2, C++, Python, Gazebo, STM32"
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
                onClick={() => handleSave(editingItem)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-medium shadow-sm"
              >
                Save Role
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {experiences.map((exp) => (
            <div key={exp.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{exp.role}</h3>
                  <div className="text-xs font-mono text-slate-500">{exp.organization} · {exp.startDate} – {exp.endDate || 'Present'}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                      exp.verificationStatus === 'USER_PROVIDED' || exp.verificationStatus === 'PUBLIC_WEB_VERIFIED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    <ShieldCheck className="w-3 h-3" />
                    <span>{exp.verificationStatus}</span>
                  </span>
                  <button
                    onClick={() => {
                      setIsNew(false);
                      setEditingItem(exp);
                    }}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(exp.id, exp.organization)}
                    className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-600 font-sans">{exp.description}</p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {exp.technologies.map((t, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-mono text-slate-600">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};
