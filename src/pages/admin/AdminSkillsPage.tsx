import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { cmsApiClient } from '../../cms/apiClient';
import { SkillData } from '../../cms/store';
import { SkillSchema } from '../../cms/schemas';
import { SKILL_CATEGORIES, isSkillCategory } from '../../constants/skills';
import { TextInput, SelectInput } from '../../components/admin/FormFields';
import {
  Save,
  Trash2,
  Loader2,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  Globe,
  EyeOff,
  Edit2,
  X,
} from 'lucide-react';

export const AdminSkillsPage: React.FC = () => {
  const [skills, setSkills] = useState<SkillData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const emptySkill: SkillData = {
    id: `skill-${Date.now()}`,
    name: '',
    category: 'Robotics & Control',
    subdiscipline: '',
    verifiedCompetency: true,
    publicationStatus: 'draft',
    source: 'USER_PROVIDED',
    sourceUrl: '',
    verificationStatus: 'USER_PROVIDED',
    lastVerified: new Date().toISOString().split('T')[0],
    notes: '',
  };

  const [formSkill, setFormSkill] = useState<SkillData>(emptySkill);

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
          category: (isSkillCategory(s.category) ? s.category : 'Robotics & Control') as any,
          subdiscipline: String(s.subdiscipline || s.description || ''),
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

  const handleSaveDraft = async () => {
    try {
      const skillToSave: SkillData = {
        ...formSkill,
        publicationStatus: 'draft',
        verificationStatus: formSkill.verificationStatus || 'USER_PROVIDED',
        source: formSkill.source || 'USER_PROVIDED',
        lastVerified: formSkill.lastVerified || new Date().toISOString().split('T')[0],
      };

      const parseResult = SkillSchema.safeParse(skillToSave);
      if (!parseResult.success) {
        setError(`Validation Error: ${parseResult.error.issues[0]?.message || 'Invalid skill data'}`);
        return;
      }

      setSaving(true);
      setError(null);

      const res = editingId
        ? await cmsApiClient.updateContentItem('skill', editingId, skillToSave)
        : await cmsApiClient.saveContentItem('skill', skillToSave);

      if (!res.success) {
        setError(`Failed to save draft: ${res.error || 'Unknown database error'}`);
        return;
      }

      await loadSkills();
      setNotice(editingId ? `Updated draft for "${formSkill.name}".` : `Saved draft for "${formSkill.name}".`);
      setTimeout(() => setNotice(null), 3500);

      setEditingId(null);
      setFormSkill({
        ...emptySkill,
        id: `skill-${Date.now()}`,
      });
    } catch (e: any) {
      setError(`Save Error: ${e.errors?.[0]?.message || e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async (skillToPublish?: SkillData) => {
    const targetSkill = skillToPublish || formSkill;
    const isDirectFromList = Boolean(skillToPublish);
    const targetId = isDirectFromList ? skillToPublish!.id : editingId;

    try {
      const enriched: SkillData = {
        ...targetSkill,
        publicationStatus: 'approved',
        verificationStatus: targetSkill.verificationStatus || 'USER_PROVIDED',
        source: targetSkill.source || 'USER_PROVIDED',
        lastVerified: targetSkill.lastVerified || new Date().toISOString().split('T')[0],
      };

      const parseResult = SkillSchema.safeParse(enriched);
      if (!parseResult.success) {
        setError(`Validation Error: ${parseResult.error.issues[0]?.message || 'Invalid skill data'}`);
        return;
      }

      setPublishingId(targetSkill.id || 'form');
      setError(null);

      // 1. Save or update pre-publish record as approved
      const saveRes = targetId
        ? await cmsApiClient.updateContentItem('skill', targetId, enriched, 'approved')
        : await cmsApiClient.saveContentItem('skill', enriched);

      if (!saveRes.success) {
        setError(`Failed to prepare skill for publishing: ${saveRes.error || 'Database error'}`);
        setPublishingId(null);
        return;
      }

      const publishTargetId = saveRes.id || targetId || targetSkill.id;

      // 2. Trigger canonical publication workflow
      const pubRes = await cmsApiClient.publishContentItem(
        'skill',
        publishTargetId,
        'approved',
        enriched.verificationStatus
      );

      if (!pubRes.success) {
        setError(`Publish Error: ${pubRes.error || 'Failed to publish skill'}`);
      } else {
        await loadSkills();
        setNotice(`Skill "${targetSkill.name}" is now publicly visible.`);
        setTimeout(() => setNotice(null), 3500);

        if (!isDirectFromList) {
          setEditingId(null);
          setFormSkill({
            ...emptySkill,
            id: `skill-${Date.now()}`,
          });
        }
      }
    } catch (e: any) {
      setError(`Publish Exception: ${e.message}`);
    } finally {
      setPublishingId(null);
    }
  };

  const handleUnpublish = async (skill: SkillData) => {
    setPublishingId(skill.id);
    setError(null);
    try {
      const unpubPayload = {
        ...skill,
        publicationStatus: 'draft',
        currentStatus: 'published',
        targetStatus: 'draft',
      };

      const res = await cmsApiClient.updateContentItem('skill', skill.id, unpubPayload);
      if (!res.success) {
        setError(`Failed to unpublish skill: ${res.error || 'Unknown error'}`);
      } else {
        await loadSkills();
        setNotice(`Skill "${skill.name}" unpublished and returned to draft.`);
        setTimeout(() => setNotice(null), 3500);
      }
    } catch (e: any) {
      setError(`Unpublish Error: ${e.message}`);
    } finally {
      setPublishingId(null);
    }
  };

  const handleStartEdit = (skill: SkillData) => {
    setEditingId(skill.id);
    setFormSkill({
      ...skill,
      category: (isSkillCategory(skill.category) ? skill.category : 'Robotics & Control') as any,
      subdiscipline: skill.subdiscipline || (skill as any).description || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormSkill({
      ...emptySkill,
      id: `skill-${Date.now()}`,
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this skill record?')) {
      return;
    }

    setDeletingId(id);
    const res = await cmsApiClient.deleteContentItem('skill', id);
    if (!res.success) {
      setError(`Failed to delete skill: ${res.error || 'Unknown error'}`);
    } else {
      await loadSkills();
      setNotice('Skill record deleted.');
      setTimeout(() => setNotice(null), 3000);
      if (editingId === id) {
        handleCancelEdit();
      }
    }
    setDeletingId(null);
  };

  return (
    <AdminLayout
      title="Skills & Competencies Matrix"
      subtitle="Manage verified disciplines, tooling, algorithmic proficiencies with explicit draft and publication controls"
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

        {/* Competency Form */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-mono font-bold uppercase text-slate-800 tracking-wider">
              {editingId ? `Edit Competency: "${formSkill.name}"` : 'Add New Verified Competency'}
            </h3>
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="inline-flex items-center gap-1 text-xs font-mono text-slate-500 hover:text-slate-800"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel Edit</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <TextInput
              label="Skill / Tooling Name"
              value={formSkill.name}
              onChange={(e) => setFormSkill({ ...formSkill, name: e.target.value })}
              placeholder="e.g. ROS 2 (Humble)"
              required
            />
            <SelectInput
              label="Category"
              value={formSkill.category}
              onChange={(e) => setFormSkill({ ...formSkill, category: e.target.value as any })}
              options={SKILL_CATEGORIES.map((c) => ({ value: c, label: c }))}
              required
            />
            <TextInput
              label="Subdiscipline / Focus"
              value={formSkill.subdiscipline}
              onChange={(e) => setFormSkill({ ...formSkill, subdiscipline: e.target.value })}
              placeholder="e.g. Node Architecture, Kinematics"
              required
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              disabled={saving || Boolean(publishingId)}
              onClick={handleSaveDraft}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-mono font-semibold shadow-xs disabled:opacity-50 transition-all"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? 'Saving Draft...' : 'Save Draft'}</span>
            </button>

            <button
              type="button"
              disabled={saving || Boolean(publishingId)}
              onClick={() => handlePublish()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-mono font-semibold shadow-sm disabled:opacity-50 transition-all"
            >
              {publishingId === (formSkill.id || 'form') ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Globe className="w-4 h-4" />
              )}
              <span>{publishingId === (formSkill.id || 'form') ? 'Publishing...' : 'Publish'}</span>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <Loader2 className="w-6 h-6 animate-spin text-amber-500 mx-auto" />
            <p className="text-xs font-mono text-slate-500">Loading skills from Supabase...</p>
          </div>
        )}

        {/* Categorized Skills Inventory (Deterministic 7 Categories) */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SKILL_CATEGORIES.map((cat, idx) => {
              const catSkills = skills.filter((s) => s.category === cat);
              return (
                <div key={cat} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-slate-400 font-bold">0{idx + 1} //</span>
                      <h4 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider">{cat}</h4>
                    </div>
                    <span className="text-xs font-mono text-slate-400">({catSkills.length})</span>
                  </div>

                  <div className="space-y-2.5">
                    {catSkills.map((s) => {
                      const isPublished = s.publicationStatus === 'published';
                      const isItemPublishing = publishingId === s.id;
                      const isItemDeleting = deletingId === s.id;

                      return (
                        <div
                          key={s.id}
                          className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-slate-900">{s.name}</span>
                              <span
                                className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                                  isPublished
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                                }`}
                              >
                                {isPublished ? 'PUBLISHED' : 'DRAFT'}
                              </span>
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded font-bold bg-slate-100 text-slate-600">
                                {s.verificationStatus}
                              </span>
                            </div>
                            <span className="text-[11px] font-mono text-slate-500 block truncate">
                              {s.subdiscipline || 'General Competency'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 self-end sm:self-auto">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(s)}
                              className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-mono font-medium flex items-center gap-1 transition-colors"
                              title="Edit Skill"
                            >
                              <Edit2 className="w-3 h-3 text-slate-500" />
                              <span>Edit</span>
                            </button>

                            {isPublished ? (
                              <button
                                type="button"
                                disabled={isItemPublishing}
                                onClick={() => handleUnpublish(s)}
                                className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-[11px] font-mono font-medium flex items-center gap-1 disabled:opacity-50 transition-colors"
                                title="Unpublish Skill"
                              >
                                {isItemPublishing ? (
                                  <Loader2 className="w-3 h-3 animate-spin text-amber-600" />
                                ) : (
                                  <EyeOff className="w-3 h-3 text-amber-600" />
                                )}
                                <span>Unpublish</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled={isItemPublishing}
                                onClick={() => handlePublish(s)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[11px] font-mono font-medium flex items-center gap-1 disabled:opacity-50 transition-colors"
                                title="Publish Skill"
                              >
                                {isItemPublishing ? (
                                  <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />
                                ) : (
                                  <Globe className="w-3 h-3 text-emerald-600" />
                                )}
                                <span>Publish</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDelete(s.id)}
                              disabled={isItemDeleting}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-50 transition-colors"
                              title="Delete Skill"
                            >
                              {isItemDeleting ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {catSkills.length === 0 && (
                      <div className="text-xs text-slate-400 italic py-3 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                        No skills in this category.
                      </div>
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
