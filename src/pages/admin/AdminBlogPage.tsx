import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { contentStore, BlogData } from '../../cms/store';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';


export const AdminBlogPage: React.FC = () => {
  const [blogPosts, setBlogPosts] = useState<BlogData[]>(contentStore.getBlogPosts());

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Delete blog post: "${title}"?`)) {
      contentStore.deleteBlogPost(id);
      setBlogPosts(contentStore.getBlogPosts());
    }
  };

  const handleStatusChange = (post: BlogData, newStatus: 'draft' | 'published' | 'archived') => {
    const updated = { ...post, publicationStatus: newStatus };
    contentStore.saveBlogPost(updated);
    setBlogPosts(contentStore.getBlogPosts());
  };

  return (
    <AdminLayout
      title="Technical Engineering Notebook & Blog"
      subtitle="Write, edit, and publish technical markdown articles, algorithmic deep dives, and tutorials"
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
                      value={post.publicationStatus || 'published'}
                      onChange={(e) => handleStatusChange(post, e.target.value as any)}
                      className={`text-xs font-mono font-semibold rounded-lg px-2 py-1 border outline-none ${
                        post.publicationStatus === 'published'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : post.publicationStatus === 'draft'
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : 'bg-slate-100 text-slate-600 border-slate-300'
                      }`}
                    >
                      <option value="published">PUBLISHED</option>
                      <option value="draft">DRAFT</option>
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
                      className="inline-flex items-center p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {blogPosts.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-xs font-mono">
              No technical articles written yet.
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};
