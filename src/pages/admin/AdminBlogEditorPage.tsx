import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { BlogData } from '../../cms/store';
import { cmsApiClient } from '../../cms/apiClient';
import { BlogSchema } from '../../cms/schemas';
import { TextInput, TextareaInput, ArrayInput, ProvenanceEditor } from '../../components/admin/FormFields';
import { Save, ArrowLeft, Eye, CheckCircle2, AlertCircle, Info, Loader2 } from 'lucide-react';
import { ZodIssue } from 'zod';

const defaultNewPost: BlogData = {
  id: `blog-${Date.now()}`,
  slug: '',
  title: '',
  excerpt: '',
  content: `# Technical Architecture & Implementation Notes\n\nWrite your technical article in Markdown here.\n\n## Introduction\n\nExplain the context, algorithms, and core engineering principles.\n\n\`\`\`cpp\n// C++ / ROS 2 Code snippet\n#include <rclcpp/rclcpp.hpp>\n\`\`\`\n`,
  publishedDate: new Date().toISOString().split('T')[0],
  readingTimeMinutes: 5,
  category: 'Robotics & Control',
  tags: ['ROS 2', 'C++', 'Kinematics'],
  featured: false,
  publicationStatus: 'draft',
  source: 'USER_PROVIDED',
  sourceUrl: '',
  verificationStatus: 'USER_PROVIDED',
  lastVerified: new Date().toISOString().split('T')[0],
  notes: 'Created via Blog CMS Editor',
};

export const AdminBlogEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const [formData, setFormData] = useState<BlogData>(defaultNewPost);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [publishMessage, setPublishMessage] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    if (!isNew && id) {
      loadPost(id);
    }
  }, [id, isNew]);

  const loadPost = async (postId: string) => {
    setLoading(true);
    const res = await cmsApiClient.getContentItem<BlogData>('blog', postId);
    if (res.success && res.data) {
      setFormData(res.data);
    } else {
      alert(`Blog post not found: ${postId}`);
      navigate('/admin/blog');
    }
    setLoading(false);
  };

  const handleSave = async (publishState?: 'draft' | 'approved' | 'archived') => {
    const dataToSave = {
      ...formData,
      publicationStatus: publishState || (formData.publicationStatus === 'published' ? 'approved' : formData.publicationStatus) || 'draft',
    };

    const result = BlogSchema.safeParse(dataToSave);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err: ZodIssue) => {
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
    const res = await cmsApiClient.saveContentItem('blog', dataToSave);
    setSaving(false);

    if (!res.success) {
      alert(`Failed to save blog post to Supabase: ${res.error || 'Unknown error'}`);
      return;
    }

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      navigate('/admin/blog');
    }, 1000);
  };

  const handlePublishToWebsite = async () => {
    const dataToSave = {
      ...formData,
      publicationStatus: 'approved' as const,
    };
    const result = BlogSchema.safeParse(dataToSave);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err: ZodIssue) => {
        if (err.path[0]) fieldErrors[String(err.path[0])] = err.message;
      });
      setErrors(fieldErrors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setErrors({});
    setPublishing(true);
    const saveRes = await cmsApiClient.saveContentItem('blog', dataToSave);
    if (!saveRes.success) {
      setPublishing(false);
      alert(`Failed to save blog post before publishing: ${saveRes.error}`);
      return;
    }
    setFormData(dataToSave);

    setPublishMessage(null);
    try {
      const pubRes = await cmsApiClient.publishContentItem(
        'blog',
        formData.id,
        'approved',
        formData.verificationStatus || 'USER_PROVIDED'
      );
      setPublishing(false);
      if (pubRes.status === 'PHASE_9_COMMIT_BLOCKED' || pubRes.error?.includes('PHASE_9_COMMIT_BLOCKED') || !pubRes.success) {
        setPublishMessage("Publication is currently locked (Phase 9 Safety Lock). Content remains Approved in Supabase.");
      } else {
        setPublishMessage(`Published successfully to GitHub (Commit: ${pubRes.commitSha || 'verified'})`);
      }
    } catch {
      setPublishing(false);
      setPublishMessage("Publication is currently locked. Content remains Approved in Supabase.");
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const updates: Partial<BlogData> = { title };
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
      title={isNew ? 'Write Technical Article' : `Edit Article: ${formData.title}`}
      subtitle="Markdown content authoring with code blocks, references, and categorization"
      action={
        <div className="flex items-center gap-2">
          <Link
            to="/admin/blog"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-mono"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </Link>

          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-mono border border-slate-300 shadow-xs"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{showPreview ? 'Edit Mode' : 'Live Preview'}</span>
          </button>

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
          <span className="text-xs font-mono text-slate-500">Loading article from Supabase...</span>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
          className="space-y-6"
        >
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
              <span>Validation errors:</span>
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
            <span>Article saved successfully!</span>
          </div>
        )}

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput
              label="Article Title"
              value={formData.title}
              onChange={handleTitleChange}
              error={errors.title}
              required
            />
            <TextInput
              label="Slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              error={errors.slug}
              required
            />
          </div>

          <TextInput
            label="Excerpt / Abstract"
            value={formData.excerpt}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            error={errors.excerpt}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <TextInput
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            />
            <TextInput
              label="Published Date"
              value={formData.publishedDate}
              onChange={(e) => setFormData({ ...formData, publishedDate: e.target.value })}
              required
            />
            <TextInput
              label="Reading Time (Minutes)"
              type="number"
              value={formData.readingTimeMinutes.toString()}
              onChange={(e) => setFormData({ ...formData, readingTimeMinutes: parseInt(e.target.value) || 5 })}
              required
            />
          </div>

          <ArrayInput
            label="Tags & Keywords"
            values={formData.tags}
            onChange={(tags) => setFormData({ ...formData, tags })}
            placeholder="e.g. ROS 2, Micro-ROS, A*, Control"
          />
        </div>

        {/* Markdown Editor / Preview Split View */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-xs font-mono font-bold uppercase text-slate-800 tracking-wider pb-2 border-b border-slate-100">
            Markdown Content Body
          </h3>

          {!showPreview ? (
            <TextareaInput
              label="Markdown / MDX Source"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              error={errors.content}
              rows={16}
              className="font-mono text-xs leading-relaxed"
              required
            />
          ) : (
            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 min-h-[300px] prose prose-slate max-w-none text-xs leading-relaxed font-sans">
              <pre className="whitespace-pre-wrap font-sans">{formData.content}</pre>
            </div>
          )}
        </div>

        <ProvenanceEditor
          data={formData}
          onChange={(provenance) => setFormData((prev) => ({ ...prev, ...provenance }))}
        />
      </form>
      )}
    </AdminLayout>
  );
};
