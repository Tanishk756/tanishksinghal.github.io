import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { MediaData } from '../../cms/store';
import { cmsApiClient } from '../../cms/apiClient';
import { MediaSchema } from '../../cms/schemas';
import { TextInput, TextareaInput, SelectInput, ProvenanceEditor } from '../../components/admin/FormFields';
import { Plus, Trash2, Image, FileText, Cpu, Video, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

export const AdminMediaPage: React.FC = () => {
  const [mediaItems, setMediaItems] = useState<MediaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<MediaData | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await cmsApiClient.getContentList<MediaData>('media');
      if (!response.success) {
        setError(response.error || 'Failed to load media from Supabase.');
        setMediaItems([]);
      } else {
        const list = Array.isArray(response.data) ? response.data.filter(Boolean) : [];
        setMediaItems(list);
      }
    } catch (err: any) {
      setError(err?.message || 'Unexpected network exception while fetching media.');
      setMediaItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStartCreate = () => {
    setEditingItem({
      id: `media-${Date.now()}`,
      filename: '',
      title: '',
      altText: '',
      caption: '',
      type: 'image',
      url: '',
      associatedContentType: 'project',
      associatedContentId: '',
      source: 'USER_PROVIDED',
      sourceUrl: '',
      verificationStatus: 'USER_PROVIDED',
      lastVerified: new Date().toISOString().split('T')[0],
      notes: '',
    });
  };

  const handleSave = async (item: MediaData) => {
    try {
      MediaSchema.parse(item);
      setSaving(true);
      const res = await cmsApiClient.saveContentItem('media', item);
      if (!res.success) {
        alert(`Failed to save media asset to Supabase: ${res.error || 'Unknown error'}`);
        setSaving(false);
        return;
      }
      await loadMedia();
      setEditingItem(null);
      setNotice('Media asset registered successfully in Supabase.');
      setTimeout(() => setNotice(null), 3000);
    } catch (e: any) {
      alert(`Validation Error: ${e.errors?.[0]?.message || e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Remove media item: "${title}"?`)) {
      setDeletingId(id);
      const res = await cmsApiClient.deleteContentItem('media', id);
      if (!res.success) {
        alert(`Failed to delete media asset from Supabase: ${res.error || 'Unknown error'}`);
      } else {
        await loadMedia();
      }
      setDeletingId(null);
    }
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="w-4 h-4 text-blue-600" />;
      case 'diagram':
      case 'cad':
      case 'pcb':
        return <Cpu className="w-4 h-4 text-amber-600" />;
      case 'video':
        return <Video className="w-4 h-4 text-purple-600" />;
      default:
        return <FileText className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <AdminLayout
      title="Media & Visual Asset Registry"
      subtitle="Structured media catalog backed by Supabase storage abstraction"
      action={
        <button
          onClick={handleStartCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-medium shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Register Media</span>
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
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-mono flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={loadMedia}
              className="px-3 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded font-semibold"
            >
              Retry
            </button>
          </div>
        )}

        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-mono">
          <span className="font-bold">Storage Abstraction:</span> Media records reference relative paths or future CDN/GitHub release asset URLs. Supabase data layer preserves clean migration boundaries to GitHub Releases / Object storage.
        </div>

        {editingItem && (
          <div className="p-6 rounded-2xl bg-white border border-slate-300 shadow-lg space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-mono font-bold uppercase text-slate-900">Register / Edit Media Asset</h3>
              <button onClick={() => setEditingItem(null)} className="text-xs text-slate-400">Close ✕</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextInput
                label="Asset Title"
                value={editingItem.title}
                onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                required
              />
              <TextInput
                label="Filename"
                value={editingItem.filename}
                onChange={(e) => setEditingItem({ ...editingItem, filename: e.target.value })}
                placeholder="e.g. quadrotor_pcb_schematic.png"
                required
              />
              <TextInput
                label="Asset URL or Path"
                value={editingItem.url}
                onChange={(e) => setEditingItem({ ...editingItem, url: e.target.value })}
                placeholder="/assets/cad/... or https://cdn..."
                required
              />
              <SelectInput
                label="Media Type"
                value={editingItem.type}
                onChange={(e) => setEditingItem({ ...editingItem, type: e.target.value as any })}
                options={[
                  { value: 'image', label: 'Image / Photo' },
                  { value: 'diagram', label: 'System Diagram' },
                  { value: 'cad', label: 'CAD / Mechanical Model' },
                  { value: 'pcb', label: 'PCB / Hardware Schematic' },
                  { value: 'document', label: 'PDF / Document' },
                  { value: 'video', label: 'Video Clip' },
                ]}
                required
              />
              <TextInput
                label="Alt Text (Accessibility)"
                value={editingItem.altText}
                onChange={(e) => setEditingItem({ ...editingItem, altText: e.target.value })}
                required
              />
              <TextInput
                label="Associated Content ID (Project/Research ID)"
                value={editingItem.associatedContentId || ''}
                onChange={(e) => setEditingItem({ ...editingItem, associatedContentId: e.target.value })}
                placeholder="e.g. quadrotor-flight-controller"
              />
            </div>

            <TextareaInput
              label="Caption / Technical Description"
              value={editingItem.caption || ''}
              onChange={(e) => setEditingItem({ ...editingItem, caption: e.target.value })}
              rows={2}
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
                disabled={saving}
                onClick={() => handleSave(editingItem)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-mono font-medium disabled:opacity-50 inline-flex items-center gap-2"
              >
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{saving ? 'Saving...' : 'Save Media Record'}</span>
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="p-12 rounded-2xl bg-white border border-slate-200 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
            <span className="text-xs font-mono text-slate-500">Loading media registry from Supabase...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mediaItems.map((item) => (
              <div key={item.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-1.5 font-mono text-xs uppercase text-slate-600 font-medium">
                      {getMediaIcon(item.type)}
                      <span>{item.type}</span>
                    </div>
                    <div className="flex items-center gap-1">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                      {item.verificationStatus}
                    </span>
                  </div>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                  <p className="text-xs font-mono text-slate-500 truncate">{item.filename}</p>
                  {item.caption && <p className="text-xs text-slate-600 line-clamp-2">{item.caption}</p>}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400">
                    {item.associatedContentId ? `Ref: ${item.associatedContentId}` : 'Standalone'}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingItem(item)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-mono"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id, item.title)}
                      disabled={deletingId === item.id}
                      className="p-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 disabled:opacity-50"
                    >
                      {deletingId === item.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {mediaItems.length === 0 && !loading && (
              <div className="col-span-full p-8 rounded-2xl bg-white border border-slate-200 text-center text-xs font-mono text-slate-400">
                No records currently stored in Supabase.
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
