import React, { useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { contentStore, SkillData } from '../../cms/store';
import { SkillSchema } from '../../cms/schemas';
import { TextInput, SelectInput } from '../../components/admin/FormFields';
import { Plus, Trash2 } from 'lucide-react';


export const AdminSkillsPage: React.FC = () => {
  const [skills, setSkills] = useState<SkillData[]>(contentStore.getSkills());
  const [newSkill, setNewSkill] = useState<SkillData>({
    id: `skill-${Date.now()}`,
    name: '',
    category: 'Robotics & Control',
    subdiscipline: '',
    verifiedCompetency: true,
    source: 'USER_PROVIDED',
    sourceUrl: '',
    verificationStatus: 'USER_PROVIDED',
    lastVerified: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const handleAdd = () => {
    try {
      SkillSchema.parse(newSkill);
      contentStore.saveSkill(newSkill);
      setSkills(contentStore.getSkills());
      setNewSkill({
        id: `skill-${Date.now()}`,
        name: '',
        category: 'Robotics & Control',
        subdiscipline: '',
        verifiedCompetency: true,
        source: 'USER_PROVIDED',
        sourceUrl: '',
        verificationStatus: 'USER_PROVIDED',
        lastVerified: new Date().toISOString().split('T')[0],
        notes: '',
      });
    } catch (e: any) {
      alert(`Validation error: ${e.errors?.[0]?.message || e.message}`);
    }
  };

  const handleDelete = (id: string) => {
    contentStore.deleteSkill(id);
    setSkills(contentStore.getSkills());
  };

  const categories = [
    'Robotics & Control',
    'AI & ML',
    'Firmware & Embedded',
    'Hardware & Circuits',
    'Software & Tools',
  ] as const;

  return (
    <AdminLayout
      title="Skills & Competencies Matrix"
      subtitle="Manage verified disciplines, tooling, algorithmic proficiencies without arbitrary percentage bars"
    >
      <div className="space-y-8">
        {/* Quick Add Skill Form */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-xs font-mono font-bold uppercase text-slate-800 tracking-wider pb-2 border-b border-slate-100">
            Add New Verified Competency
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <TextInput
              label="Skill / Tooling Name"
              value={newSkill.name}
              onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
              placeholder="e.g. ROS 2 (Humble)"
              required
            />
            <SelectInput
              label="Category"
              value={newSkill.category}
              onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value as any })}
              options={categories.map((c) => ({ value: c, label: c }))}
              required
            />
            <TextInput
              label="Subdiscipline / Focus"
              value={newSkill.subdiscipline}
              onChange={(e) => setNewSkill({ ...newSkill, subdiscipline: e.target.value })}
              placeholder="e.g. Node Architecture, Kinematics"
              required
            />
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-medium shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Skill</span>
          </button>
        </div>

        {/* Categorized Skills Inventory */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((cat) => {
            const catSkills = skills.filter((s) => s.category === cat);
            return (
              <div key={cat} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h4 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider">{cat}</h4>
                  <span className="text-xs font-mono text-slate-400">({catSkills.length})</span>
                </div>
                <div className="space-y-2">
                  {catSkills.map((s) => (
                    <div key={s.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-slate-900">{s.name}</span>
                        <span className="text-[11px] font-mono text-slate-500 block">{s.subdiscipline}</span>
                      </div>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {catSkills.length === 0 && (
                    <div className="text-xs text-slate-400 italic py-2">No skills added in this category.</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
};
