import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { cmsApiClient } from '../../cms/apiClient';
import { SkillData } from '../../cms/store';
import { SkillSchema } from '../../cms/schemas';
import { TextInput, SelectInput } from '../../components/admin/FormFields';
import { Plus, Trash2, Loader2, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

export const AdminSkillsPage: React.FC = () => {
  const [skills, setSkills] = useState<SkillData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await cmsApiClient.getContentList<SkillData>('skill');
      if (res.success && Array.isArray(res.data)) {
        const normalized = res.data.filter(Boolean).map((s: any) => ({
          ...s,
          id: String(s.id || `skill-${Date.now()}`),
          name: String(s.name || ''),
          category: String(s.category || 'Robotics & Control') as any,
          subdiscipline: String(s.subdiscipline || ''),
          verifiedCompetency: Boolean(s.verifiedCompetency ?? s.verified_competency ?? true),
          publicationStatus: (s.publicationStatus || s.publication_status || 'draft') as any,
          verificationStatus: (s.verificationStatus || s.verification_status || 'USER_PROVIDED') as any,
          source: String(s.source || 'USER_PROVIDED'),
          sourceUrl: String(s.sourceUrl || s.source_url || s.evidence_url || ''),
          lastVerified: String(s.lastVerified || s.last_verified || new Date().toISOString().split('T')[0]),
          notes: String(s.notes || s.verification_notes || ''),
        }));
        setSkills(normalized);
      } else {
        setError(res.error || 'Failed to load skills from Supabase.');
        setSkills([]);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load skills.');
      setSkills([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    try {
      SkillSchema.parse(newSkill);
      setSaving(true);
      const res = await cmsApiClient.saveContentItem('skill', newSkill);
      setSaving(false);

      if (!res.success) {
        alert(`Failed to add skill: ${res.error || 'Unknown error'}`);
        return;
      }

      await loadSkills();
      setNotice(`Added skill: "${newSkill.name}".`);
      setTimeout(() => setNotice(null), 3000);
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

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const res = await cmsApiClient.deleteContentItem('skill', id);
    if (!res.success) {
      alert(`Failed to delete skill: ${res.error || 'Unknown error'}`);
    } else {
      await loadSkills();
    }
    setDeletingId(null);
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
              onClick={loadSkills}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 text-[11px] font-semibold transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Quick Add Skill Form */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-xs font-mono font-bold uppercase text-slate-800 tracking-wider pb-2 border-b border-slate-100">
            Add New Verified Competency (Draft)
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
            disabled={saving}
            onClick={handleAdd}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-medium shadow-sm disabled:opacity-50 transition-all"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            <span>{saving ? 'Adding to Supabase...' : 'Add Skill'}</span>
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <Loader2 className="w-6 h-6 animate-spin text-amber-500 mx-auto" />
            <p className="text-xs font-mono text-slate-500">Loading skills from Supabase...</p>
          </div>
        )}

        {/* Categorized Skills Inventory */}
        {!loading && (
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
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900">{s.name}</span>
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded font-bold bg-emerald-50 text-emerald-700">
                              {s.verificationStatus}
                            </span>
                          </div>
                          <span className="text-[11px] font-mono text-slate-500 block">{s.subdiscipline}</span>
                        </div>
                        <button
                          onClick={() => handleDelete(s.id)}
                          disabled={deletingId === s.id}
                          className="text-slate-400 hover:text-rose-600 p-1 disabled:opacity-50"
                          title="Delete"
                        >
                          {deletingId === s.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    ))}
                    {catSkills.length === 0 && (
                      <div className="text-xs text-slate-400 italic py-2">No skills in this category.</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
