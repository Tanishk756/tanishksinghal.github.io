import React, { useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { contentStore, PublicationData } from '../../cms/store';
import { PublicationSchema } from '../../cms/schemas';
import { TextInput, TextareaInput, SelectInput, ArrayInput, ProvenanceEditor } from '../../components/admin/FormFields';
import { Plus, Edit, Trash2, ShieldCheck, CheckCircle2 } from 'lucide-react';


export const AdminPublicationsPage: React.FC = () => {
  const [publications, setPublications] = useState<PublicationData[]>(contentStore.getPublications());
  const [editingItem, setEditingItem] = useState<PublicationData | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const handleStartCreate = () => {
    setIsNew(true);
    setEditingItem({
      id: `pub-${Date.now()}`,
      slug: '',
      title: '',
      authors: ['Tanishk Singhal'],
      year: new Date().getFullYear(),
      venue: '',
      publicationType: 'journal',
      status: 'under-review',
      publicationStatus: 'published',
      abstract: '',
      keywords: [],
      publisher: '',
      doi: '',
      pdfUrl: '',
      externalUrl: '',
      source: 'USER_PROVIDED',
      sourceUrl: '',
      verificationStatus: 'USER_PROVIDED',
      lastVerified: new Date().toISOString().split('T')[0],
      notes: '',
    });
  };

  const handleSave = (item: PublicationData) => {
    try {
      PublicationSchema.parse(item);
      contentStore.savePublication(item);
      setPublications(contentStore.getPublications());
      setEditingItem(null);
      setIsNew(false);
      setNotice('Publication record saved successfully.');
      setTimeout(() => setNotice(null), 3000);
    } catch (e: any) {
      alert(`Validation Error: ${e.errors?.[0]?.message || e.message}`);
    }
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Delete publication record: "${title}"?`)) {
      contentStore.deletePublication(id);
      setPublications(contentStore.getPublications());
    }
  };

  return (
    <AdminLayout
      title="Scholarly Publications & Papers Database"
      subtitle="Manage candidate preprints, journal articles, citation metadata, and verification provenance"
      action={
        <button
          onClick={handleStartCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-medium shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Publication</span>
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
                {isNew ? 'Add Publication Record' : `Edit Publication: ${editingItem.title}`}
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="text-xs font-mono text-slate-400 hover:text-slate-700"
              >
                Close ✕
              </button>
            </div>

            <TextInput
              label="Publication Title"
              value={editingItem.title}
              onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <TextInput
                label="Slug"
                value={editingItem.slug}
                onChange={(e) => setEditingItem({ ...editingItem, slug: e.target.value })}
                required
              />
              <TextInput
                label="Publication Year"
                type="number"
                value={editingItem.year.toString()}
                onChange={(e) => setEditingItem({ ...editingItem, year: parseInt(e.target.value) || new Date().getFullYear() })}
                required
              />
              <SelectInput
                label="Type"
                value={editingItem.publicationType}
                onChange={(e) => setEditingItem({ ...editingItem, publicationType: e.target.value as any })}
                options={[
                  { value: 'journal', label: 'Journal Article' },
                  { value: 'conference', label: 'Conference Paper' },
                  { value: 'preprint', label: 'Preprint / arXiv' },
                  { value: 'workshop', label: 'Workshop Paper' },
                  { value: 'book-chapter', label: 'Book Chapter' },
                ]}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextInput
                label="Venue / Journal Name"
                value={editingItem.venue}
                onChange={(e) => setEditingItem({ ...editingItem, venue: e.target.value })}
                required
              />
              <TextInput
                label="Publisher (if known)"
                value={editingItem.publisher || ''}
                onChange={(e) => setEditingItem({ ...editingItem, publisher: e.target.value })}
                placeholder="e.g. Taylor & Francis, IEEE, Springer"
              />
            </div>

            <ArrayInput
              label="Authors List"
              values={editingItem.authors}
              onChange={(authors) => setEditingItem({ ...editingItem, authors })}
              placeholder="e.g. Tanishk Singhal, Collaborator Name"
            />

            <TextareaInput
              label="Abstract"
              value={editingItem.abstract}
              onChange={(e) => setEditingItem({ ...editingItem, abstract: e.target.value })}
              required
              rows={3}
            />

            <ArrayInput
              label="Keywords"
              values={editingItem.keywords}
              onChange={(keywords) => setEditingItem({ ...editingItem, keywords })}
              placeholder="e.g. UAV, Wireless Power Harvesting, Digital Twin"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextInput
                label="DOI (only if confirmed)"
                value={editingItem.doi || ''}
                onChange={(e) => setEditingItem({ ...editingItem, doi: e.target.value })}
                placeholder="10.xxxx/..."
              />
              <TextInput
                label="External URL / Repository Link"
                value={editingItem.externalUrl || ''}
                onChange={(e) => setEditingItem({ ...editingItem, externalUrl: e.target.value })}
                placeholder="https://..."
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
                Save Publication
              </button>
            </div>
          </div>
        )}

        {/* Publication Records List */}
        <div className="space-y-4">
          {publications.map((pub) => (
            <div key={pub.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                    {pub.year} · {pub.publicationType.toUpperCase()}
                  </span>
                  <span className="text-xs font-mono text-slate-500">{pub.venue}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                      pub.verificationStatus === 'PUBLIC_WEB_VERIFIED' || pub.verificationStatus === 'USER_PROVIDED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    <ShieldCheck className="w-3 h-3" />
                    <span>{pub.verificationStatus}</span>
                  </span>
                  <button
                    onClick={() => {
                      setIsNew(false);
                      setEditingItem(pub);
                    }}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                    title="Edit"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(pub.id, pub.title)}
                    className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900">{pub.title}</h3>
              <p className="text-xs font-mono text-slate-500">Authors: {pub.authors.join(', ')}</p>
              <p className="text-xs text-slate-600 font-sans line-clamp-2">{pub.abstract}</p>
            </div>
          ))}
        </div>

      </div>
    </AdminLayout>
  );
};
