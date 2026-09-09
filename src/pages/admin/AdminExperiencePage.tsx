import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { cmsApiClient } from '../../cms/apiClient';
import { ExperienceData } from '../../cms/store';
import { ExperienceSchema } from '../../cms/schemas';
import { TextInput, TextareaInput, ArrayInput } from '../../components/admin/FormFields';
import { Plus, Edit, Trash2, ShieldCheck, CheckCircle2, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

export const AdminExperiencePage: React.FC = () => {
  const [experiences, setExperiences] = useState<ExperienceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<ExperienceData | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadExperiences();
  }, []);

  const loadExperiences = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await cmsApiClient.getContentList<ExperienceData>('experience');
      if (res.success && Array.isArray(res.data)) {
        const normalized = res.data.filter(Boolean).map((e: any) => ({
          ...e,
          id: String(e.id || `exp-${Date.now()}`),
          organization: String(e.organization || e.company || ''),
          role: String(e.role || e.role_title || ''),
          employmentType: String(e.employmentType || e.employment_type || 'Full-time'),
          location: String(e.location || ''),
          startDate: String(e.startDate || e.start_date || new Date().getFullYear().toString()),
          endDate: e.endDate || e.end_date ? String(e.endDate || e.end_date) : undefined,
          current: Boolean(e.current || e.is_current),
          description: String(e.description || e.summary || ''),
          responsibilities: Array.isArray(e.responsibilities) ? e.responsibilities.filter(Boolean).map(String) : [],
          achievements: Array.isArray(e.achievements) ? e.achievements.filter(Boolean).map(String) : [],
          technologies: Array.isArray(e.technologies) ? e.technologies.filter(Boolean).map(String) : [],
          publicationStatus: (e.publicationStatus || e.publication_status || 'draft') as any,
          verificationStatus: (e.verificationStatus || e.verification_status || 'USER_PROVIDED') as any,
          source: String(e.source || 'USER_PROVIDED'),
          sourceUrl: String(e.sourceUrl || e.source_url || e.evidence_url || ''),
          lastVerified: String(e.lastVerified || e.last_verified || new Date().toISOString().split('T')[0]),
          notes: String(e.notes || e.verification_notes || ''),
        }));
        setExperiences(normalized);
      } else {
        setError(res.error || 'Failed to load experience records from Supabase.');
        setExperiences([]);
      }
    } catch (e: any) {
      setError(e.message || 'Unexpected network error.');
      setExperiences([]);
    } finally {
      setLoading(false);
    }
  };

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
      publicationStatus: 'draft',
      source: 'USER_PROVIDED',
      sourceUrl: '',
      verificationStatus: 'USER_PROVIDED',
      lastVerified: new Date().toISOString().split('T')[0],
      notes: '',
    });
  };

  const handleSave = async (item: ExperienceData) => {
    try {
      const enriched: ExperienceData = {
        ...item,
        verificationStatus: item.verificationStatus || 'USER_PROVIDED',
        source: item.source || 'USER_PROVIDED',
        publicationStatus: item.publicationStatus || 'draft',
        lastVerified: item.lastVerified || new Date().toISOString().split('T')[0],
      };
      ExperienceSchema.parse(enriched);
      setSaving(true);
      
      const res = isNew
        ? await cmsApiClient.saveContentItem('experience', enriched)
        : await cmsApiClient.updateContentItem('experience', enriched.id, enriched);

      if (!res.success) {
        alert(`Supabase Error: ${res.error || 'Failed to save experience record.'}`);
        setSaving(false);
        return;
      }

      await loadExperiences();
      setEditingItem(null);
      setIsNew(false);
      setNotice('Experience role saved successfully in Supabase.');
      setTimeout(() => setNotice(null), 3000);
    } catch (e: any) {
      alert(`Validation Error: ${e.errors?.[0]?.message || e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, org: string) => {
    if (confirm(`Delete experience: "${org}" from Supabase?`)) {
      setDeletingId(id);
      const res = await cmsApiClient.deleteContentItem('experience', id);
      if (!res.success) {
        alert(`Failed to delete: ${res.error || 'Unknown error'}`);
      } else {
        await loadExperiences();
        setNotice(`Deleted "${org}".`);
        setTimeout(() => setNotice(null), 3000);
      }
      setDeletingId(null);
    }
  };

  return (
    <AdminLayout
      title="Engineering Experience Timeline"
      subtitle="Manage formal engineering roles, research labs, contributions, and verified employment anchors"
      action={
        <button
          onClick={handleStartCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-medium shadow-sm transition-all"
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

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-mono flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={loadExperiences}
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
                {isNew ? 'New Experience Role' : `Edit: ${editingItem.role} at ${editingItem.organization}`}
              </h3>
              <button onClick={() => setEditingItem(null)} className="text-xs font-mono text-slate-400 hover:text-slate-700">
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
                <span>{saving ? 'Saving to Supabase...' : 'Save Role'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <Loader2 className="w-6 h-6 animate-spin text-amber-500 mx-auto" />
            <p className="text-xs font-mono text-slate-500">Loading canonical experience timeline from Supabase...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && experiences.length === 0 && (
          <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <p className="text-xs font-mono text-slate-500 font-medium">No records currently stored in Supabase.</p>
            <p className="text-[11px] text-slate-400">Click &quot;New Experience&quot; above to create a canonical draft record.</p>
          </div>
        )}

        {/* Experience List */}
        {!loading && experiences.length > 0 && (
          <div className="space-y-4">
            {experiences.map((exp) => (
              <div key={exp.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">{exp.role}</h3>
                      <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                        exp.publicationStatus === 'published' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {exp.publicationStatus || 'draft'}
                      </span>
                    </div>
                    <div className="text-xs font-mono text-slate-500">{exp.organization} · {exp.startDate} – {exp.endDate || 'Present'}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                        exp.verificationStatus === 'USER_PROVIDED' || exp.verificationStatus === 'PUBLIC_WEB_VERIFIED' || exp.verificationStatus === 'GITHUB_VERIFIED'
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
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(exp.id, exp.organization)}
                      disabled={deletingId === exp.id}
                      className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 disabled:opacity-50 transition-colors"
                      title="Delete"
                    >
                      {deletingId === exp.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-600 font-sans">{exp.description}</p>
                {Array.isArray(exp.technologies) && exp.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {exp.technologies.map((t, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-mono text-slate-600">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
