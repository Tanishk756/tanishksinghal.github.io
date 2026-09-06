import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { ProjectData } from '../../cms/store';
import { cmsApiClient } from '../../cms/apiClient';
import { ProjectSchema } from '../../cms/schemas';
import {
  TextInput,
  TextareaInput,
  SelectInput,
  ArrayInput,
  ProvenanceEditor,
} from '../../components/admin/FormFields';
import { Save, ArrowLeft, Eye, CheckCircle2, AlertCircle, Info, Loader2 } from 'lucide-react';

const defaultNewProject: ProjectData = {
  id: `proj-${Date.now()}`,
  slug: '',
  title: '',
  tagline: '',
  category: 'robotics',
  subcategories: ['ROS 2', 'C++'],
  status: 'in-progress',
  publicationStatus: 'draft',
  featured: false,
  startDate: new Date().getFullYear().toString(),
  role: 'Lead Systems Engineer',
  overview: '',
  problem: '',
  objective: '',
  architecture: '',
  hardware: '',
  software: '',
  algorithms: '',
  implementation: '',
  challenges: '',
  results: '',
  lessonsLearned: '',
  futureWork: '',
  githubUrl: '',
  demoUrl: '',
  paperUrl: '',
  verificationStatus: 'USER_PROVIDED',
  lastVerified: new Date().toISOString().split('T')[0],
  source: 'Author Self-Reported Specification',
  sourceUrl: '',
  notes: '',
};

export const AdminProjectEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [formData, setFormData] = useState<ProjectData>(defaultNewProject);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [publishMessage, setPublishMessage] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isNew && id) {
      loadProject(id);
    }
  }, [id, isNew]);

  const loadProject = async (projectId: string) => {
    setLoading(true);
    const res = await cmsApiClient.getContentItem<ProjectData>('project', projectId);
    if (res.success && res.data) {
      const p: any = res.data;
      setFormData({
        ...p,
        id: String(p.id || projectId),
        slug: String(p.slug || ''),
        title: String(p.title || ''),
        tagline: String(p.tagline || p.subtitle || ''),
        category: (p.category || 'robotics') as any,
        subcategories: Array.isArray(p.subcategories) ? p.subcategories : (Array.isArray(p.tools) ? p.tools : []),
        status: (p.status || 'in-progress') as any,
        publicationStatus: (p.publicationStatus || p.publication_status || 'draft') as any,
        featured: Boolean(p.featured),
        startDate: String(p.startDate || p.start_date || p.timeframe || new Date().getFullYear().toString()),
        role: String(p.role || ''),
        overview: String(p.overview || ''),
        problem: String(p.problem || ''),
        objective: String(p.objective || p.solution || ''),
        architecture: String(p.architecture || ''),
        githubUrl: String(p.githubUrl || p.github_url || ''),
        demoUrl: String(p.demoUrl || p.demo_url || ''),
        paperUrl: String(p.paperUrl || p.docs_url || ''),
        verificationStatus: (p.verificationStatus || p.verification_status || 'USER_PROVIDED') as any,
        source: String(p.source || 'USER_PROVIDED'),
        sourceUrl: String(p.sourceUrl || p.source_url || p.evidence_url || ''),
        lastVerified: String(p.lastVerified || p.last_verified || new Date().toISOString().split('T')[0]),
        notes: String(p.notes || p.verification_notes || ''),
      });
    } else {
      alert(`Project not found in Supabase: ${projectId}`);
      navigate('/admin/projects');
    }
    setLoading(false);
  };

  const handleSave = async (publishState?: 'draft' | 'approved' | 'archived') => {
    const dataToSave = {
      ...formData,
      publicationStatus: publishState || (formData.publicationStatus === 'published' ? 'approved' : formData.publicationStatus) || 'draft',
    };

    const result = ProjectSchema.safeParse(dataToSave);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err: any) => {
        if (err.path[0]) {
          fieldErrors[String(err.path[0])] = err.message;
        }
      });
      setErrors(fieldErrors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setErrors({});
    setSaving(true);

    const res = isNew
      ? await cmsApiClient.saveContentItem('project', dataToSave)
      : await cmsApiClient.updateContentItem('project', dataToSave.id, dataToSave);

    setSaving(false);

    if (!res.success) {
      alert(`Failed to save project to Supabase: ${res.error || 'Unknown error'}`);
      return;
    }

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      navigate('/admin/projects');
    }, 1200);
  };

  const handlePublishToWebsite = async () => {
    const dataToSave = {
      ...formData,
      publicationStatus: 'approved' as const,
    };
    const result = ProjectSchema.safeParse(dataToSave);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err: any) => {
        if (err.path[0]) fieldErrors[String(err.path[0])] = err.message;
      });
      setErrors(fieldErrors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setErrors({});
    setPublishing(true);
    const saveRes = await cmsApiClient.saveContentItem('project', dataToSave);
    if (!saveRes.success) {
      setPublishing(false);
      alert(`Failed to save project before publishing: ${saveRes.error}`);
      return;
    }
    setFormData(dataToSave);

    setPublishMessage(null);
    try {
      const pubRes = await cmsApiClient.publishContentItem(
        'project',
        formData.id,
        'approved',
        formData.verificationStatus || 'USER_PROVIDED'
      );
      setPublishing(false);
      if (pubRes.status === 'PHASE_9_COMMIT_BLOCKED' || pubRes.error?.includes('PHASE_9_COMMIT_BLOCKED') || !pubRes.success) {
        setPublishMessage("Publication is currently locked (Phase 9 Safety Lock). Content remains Approved.");
      } else {
        setPublishMessage(`Published successfully to GitHub (Commit: ${pubRes.commitSha || 'verified'})`);
      }
    } catch {
      setPublishing(false);
      setPublishMessage("Publication is currently locked. Content remains Approved.");
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const updates: Partial<ProjectData> = { title };
    if (isNew && !formData.slug) {
      updates.slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  return (
    <AdminLayout
      title={isNew ? 'Create New Engineering Project' : `Edit Project: ${formData.title}`}
      subtitle="Complete deep case study structure, technical sub-systems, and verification provenance"
      action={
        <div className="flex items-center gap-2">
          <Link
            to="/admin/projects"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-mono"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Cancel</span>
          </Link>

          {!isNew && (
            <Link
              to={`/projects/${formData.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-mono border border-slate-300 shadow-xs"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </Link>
          )}

          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave('draft')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-900 text-xs font-mono font-medium shadow-xs disabled:opacity-50"
          >
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave('approved')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-mono font-medium shadow-xs disabled:opacity-50"
          >
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Approve Content</span>
          </button>

          <button
            type="button"
            disabled={publishing || saving}
            onClick={handlePublishToWebsite}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-medium shadow-sm disabled:opacity-50"
          >
            {publishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{publishing ? 'Publishing...' : 'Publish to Website'}</span>
          </button>
        </div>
      }
    >
      {loading ? (
        <div className="p-12 rounded-2xl bg-white border border-slate-200 text-center flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
          <span className="text-xs font-mono text-slate-500">Loading project from Supabase...</span>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
          className="space-y-8"
        >
        {/* Error / Success Banner */}
        {publishMessage && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-mono flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{publishMessage}</span>
          </div>
        )}

        {Object.keys(errors).length > 0 && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-mono space-y-1">
            <div className="flex items-center gap-2 font-bold text-rose-800">
              <AlertCircle className="w-4 h-4" />
              <span>Validation failed. Please correct the following fields:</span>
            </div>
            <ul className="list-disc pl-5 space-y-0.5">
              {Object.entries(errors).map(([field, msg]) => (
                <li key={field}>
                  <strong>{field}:</strong> {msg}
                </li>
              ))}
            </ul>
          </div>
        )}

        {savedSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-mono flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Project saved successfully! Redirecting to archive...</span>
          </div>
        )}

        {/* 1. Core Metadata */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-5">
          <h3 className="text-xs font-mono font-bold uppercase text-slate-800 tracking-wider pb-2 border-b border-slate-100">
            1. Core Identity & Classification
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput
              label="Project Title"
              value={formData.title}
              onChange={handleTitleChange}
              error={errors.title}
              placeholder="e.g. Autonomous Closed-Loop Pursuit Node"
              required
            />
            <TextInput
              label="URL Slug (Unique)"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              error={errors.slug}
              placeholder="e.g. turtle-chase"
              description="Must be lowercase alphanumeric with hyphens only"
              required
            />
          </div>

          <TextInput
            label="Tagline / Executive Summary"
            value={formData.tagline}
            onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
            error={errors.tagline}
            placeholder="Single sentence engineering objective & outcome..."
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SelectInput
              label="Engineering Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
              options={[
                { value: 'robotics', label: 'Robotics & Control' },
                { value: 'autonomy', label: 'Autonomous Navigation' },
                { value: 'uav-aerospace', label: 'UAV & Aerospace' },
                { value: 'embedded', label: 'Embedded & Firmware' },
                { value: 'ai-ml', label: 'Artificial Intelligence & ML' },
                { value: 'space-systems', label: 'CubeSat & Space Systems' },
              ]}
              required
            />
            <SelectInput
              label="Project Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              options={[
                { value: 'completed', label: 'Completed' },
                { value: 'in-progress', label: 'In Progress' },
                { value: 'prototype', label: 'Prototype' },
                { value: 'research', label: 'Research' },
              ]}
              required
            />
            <TextInput
              label="Start Date / Year"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              placeholder="e.g. 2024"
              required
            />
          </div>

          <ArrayInput
            label="Technologies & Subdisciplines"
            values={formData.subcategories}
            onChange={(subcategories) => setFormData({ ...formData, subcategories })}
            placeholder="e.g. ROS 2, Python, C++, A*, SLAM"
            description="Add key frameworks, algorithms, and hardware components"
          />
        </div>

        {/* 2. Deep-Dive Case Study Content */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-5">
          <h3 className="text-xs font-mono font-bold uppercase text-slate-800 tracking-wider pb-2 border-b border-slate-100">
            2. Case Study Technical Documentation
          </h3>

          <TextareaInput
            label="Executive Overview"
            value={formData.overview}
            onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
            error={errors.overview}
            placeholder="High-level engineering overview of the system..."
            required
            rows={3}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextareaInput
              label="Problem Statement"
              value={formData.problem}
              onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
              error={errors.problem}
              placeholder="What technical hurdle or research question does this solve?"
              required
              rows={3}
            />
            <TextareaInput
              label="Engineering Objective"
              value={formData.objective}
              onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
              error={errors.objective}
              placeholder="Target specifications, benchmarks, and functional constraints..."
              required
              rows={3}
            />
          </div>

          <TextareaInput
            label="System Architecture & Subsystems"
            value={formData.architecture}
            onChange={(e) => setFormData({ ...formData, architecture: e.target.value })}
            error={errors.architecture}
            placeholder="Detailed node topology, data flow, telemetry schemas..."
            required
            rows={4}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextareaInput
              label="Hardware & Actuation Specs"
              value={formData.hardware || ''}
              onChange={(e) => setFormData({ ...formData, hardware: e.target.value })}
              placeholder="Microcontrollers, sensors, compute modules, power..."
              rows={3}
            />
            <TextareaInput
              label="Software & Algorithms"
              value={formData.software || ''}
              onChange={(e) => setFormData({ ...formData, software: e.target.value })}
              placeholder="Middleware, kinematic solvers, neural architectures..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextareaInput
              label="Engineering Challenges & Root Causes"
              value={formData.challenges || ''}
              onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
              placeholder="Failure modes encountered, debugging, resolution fixes..."
              rows={3}
            />
            <TextareaInput
              label="Empirical Results & Benchmarks"
              value={formData.results || ''}
              onChange={(e) => setFormData({ ...formData, results: e.target.value })}
              placeholder="Execution latency, convergence rate, precision metrics..."
              rows={3}
            />
          </div>
        </div>

        {/* 3. Links & References */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-xs font-mono font-bold uppercase text-slate-800 tracking-wider pb-2 border-b border-slate-100">
            3. External Repositories & Artifacts
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <TextInput
              label="GitHub Repository URL"
              value={formData.githubUrl || ''}
              onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
              error={errors.githubUrl}
              placeholder="https://github.com/Tanishk756/..."
            />
            <TextInput
              label="Live Demo / CAD / Simulation URL"
              value={formData.demoUrl || ''}
              onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })}
              error={errors.demoUrl}
              placeholder="https://..."
            />
            <TextInput
              label="Scholarly Paper / Technical Document URL"
              value={formData.paperUrl || ''}
              onChange={(e) => setFormData({ ...formData, paperUrl: e.target.value })}
              error={errors.paperUrl}
              placeholder="https://..."
            />
          </div>
        </div>

        {/* 4. Data Provenance & Verification */}
        <ProvenanceEditor
          data={formData}
          onChange={(provenance) => setFormData((prev) => ({ ...prev, ...provenance }))}
        />
      </form>
      )}
    </AdminLayout>
  );
};
