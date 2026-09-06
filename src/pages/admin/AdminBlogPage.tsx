import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { BlogData } from '../../cms/store';
import { cmsApiClient } from '../../cms/apiClient';
import { Plus, Edit, Trash2, Eye, Loader2, AlertCircle } from 'lucide-react';

export const AdminBlogPage: React.FC = () => {
  const [blogPosts, setBlogPosts] = useState<BlogData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadBlogPosts();
  }, []);

  const loadBlogPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await cmsApiClient.getContentList<BlogData>('blog');
      if (!response.success) {
        setError(response.error || 'Failed to load blog posts from Supabase.');
        setBlogPosts([]);
      } else {
        const list = Array.isArray(response.data) ? response.data.filter(Boolean) : [];
        setBlogPosts(list);
      }
    } catch (err: any) {
      setError(err?.message || 'Unexpected error fetching blog posts.');
      setBlogPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Delete blog post: "${title}"?`)) {
      setDeletingId(id);
      const res = await cmsApiClient.deleteContentItem('blog', id);
      if (!res.success) {
        alert(`Failed to delete blog post from Supabase: ${res.error || 'Unknown error'}`);
      } else {
        await loadBlogPosts();
      }
      setDeletingId(null);
    }
  };

  const handleStatusChange = async (post: BlogData, newStatus: 'draft' | 'published' | 'archived') => {
    const updated = { ...post, publicationStatus: newStatus };
    const res = await cmsApiClient.saveContentItem('blog', updated);
    if (!res.success) {
      alert(`Failed to update blog post status in Supabase: ${res.error || 'Unknown error'}`);
    } else {
      await loadBlogPosts();
    }
  };

  return (
    <AdminLayout
      title="Technical Engineering Notebook & Blog"
      subtitle="Write, edit, and publish technical markdown articles backed by Supabase"
      action={
        <Link
          to="/admin/blog/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-medium shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Write Article</span>
        </Link>
      }
    >
      <div className="space-y-6">
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-mono flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={loadBlogPosts}
              className="px-3 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded font-semibold"
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="p-12 rounded-2xl bg-white border border-slate-200 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
            <span className="text-xs font-mono text-slate-500">Loading technical articles from Supabase...</span>
          </div>
        ) : (
          <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono uppercase text-[10px]">
                <tr>
                  <th className="p-4">Title & Slug</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Reading Time</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {blogPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-slate-900 text-sm">{post.title}</div>
                      <div className="text-[11px] font-mono text-slate-500">/blog/{post.slug}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-mono uppercase font-semibold text-slate-700">
                        {post.category}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-slate-500">{post.publishedDate}</td>
                    <td className="p-4 font-mono text-slate-500">{post.readingTimeMinutes} min</td>
                    <td className="p-4">
                      <select
                        value={post.publicationStatus || 'draft'}
                        onChange={(e) => handleStatusChange(post, e.target.value as any)}
                        className={`text-xs font-mono font-semibold rounded-lg px-2 py-1 border outline-none ${
                          post.publicationStatus === 'published'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : post.publicationStatus === 'approved'
                            ? 'bg-blue-50 text-blue-800 border-blue-300'
                            : post.publicationStatus === 'draft'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-slate-100 text-slate-600 border-slate-300'
                        }`}
                      >
                        <option value="draft">DRAFT</option>
                        <option value="approved">APPROVED</option>
                        <option value="published">PUBLISHED</option>
                        <option value="archived">ARCHIVED</option>
                      </select>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <Link
                        to={`/blog/${post.slug}`}
                        target="_blank"
                        className="inline-flex items-center p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                        title="View"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                      <Link
                        to={`/admin/blog/${post.id}/edit`}
                        className="inline-flex items-center p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white"
                        title="Edit"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(post.id, post.title)}
                        disabled={deletingId === post.id}
                        className="inline-flex items-center p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 disabled:opacity-50"
                        title="Delete"
                      >
                        {deletingId === post.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {blogPosts.length === 0 && !loading && (
              <div className="p-8 text-center text-slate-400 text-xs font-mono">
                No records currently stored in Supabase.
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
