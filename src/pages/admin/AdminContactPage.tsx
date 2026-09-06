import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { cmsApiClient } from '../../cms/apiClient';
import { ContactSubmission } from '../../cms/schemas';
import { Mail, Trash2, Clock, Eye, RefreshCw, X, AlertCircle } from 'lucide-react';

export const AdminContactPage: React.FC = () => {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const fetchSubmissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await cmsApiClient.getContactSubmissions(
        statusFilter !== 'all' ? { status: statusFilter } : {}
      );
      if (res.success && res.data) {
        setSubmissions(res.data);
      } else {
        setError(res.error || 'Failed to load inquiries.');
      }
    } catch {
      setError('Error communicating with backend service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [statusFilter]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setActionLoading(true);
    try {
      const res = await cmsApiClient.updateContactSubmissionStatus(id, newStatus);
      if (res.success) {
        setSubmissions((prev) =>
          prev.map((s) => (s.id === id ? { ...s, status: newStatus as any } : s))
        );
        if (selectedSubmission && selectedSubmission.id === id) {
          setSelectedSubmission((prev) => (prev ? { ...prev, status: newStatus as any } : null));
        }
      } else {
        alert(res.error || 'Failed to update submission status.');
      }
    } catch {
      alert('Error updating status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this submission?')) return;
    setActionLoading(true);
    try {
      const res = await cmsApiClient.deleteContactSubmission(id);
      if (res.success) {
        setSubmissions((prev) => prev.filter((s) => s.id !== id));
        if (selectedSubmission?.id === id) {
          setSelectedSubmission(null);
        }
      } else {
        alert(res.error || 'Failed to delete submission.');
      }
    } catch {
      alert('Error deleting submission.');
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = submissions.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.organization && s.organization.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.inquiry_type && s.inquiry_type.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-[10px] font-mono uppercase tracking-wider font-semibold">New</span>;
      case 'read':
        return <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-mono uppercase tracking-wider font-semibold">Read</span>;
      case 'replied':
        return <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono uppercase tracking-wider font-semibold">Replied</span>;
      case 'archived':
        return <span className="px-2.5 py-1 rounded-full bg-slate-200 text-slate-700 text-[10px] font-mono uppercase tracking-wider font-semibold">Archived</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 text-[10px] font-mono uppercase tracking-wider">{status}</span>;
    }
  };

  return (
    <AdminLayout
      title="Contact Inquiries"
      subtitle="Manage and review inbound dialogue, research inquiries, and project proposals"
      action={
        <button
          onClick={fetchSubmissions}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-mono font-medium transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      }
    >
      <div className="space-y-6">
        
        {/* Controls Bar */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-4 items-center justify-between">
          <input
            type="text"
            placeholder="Search inquiries by name, email, organization, subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-96 px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-sans outline-none focus:border-slate-900"
          />

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {['all', 'new', 'read', 'replied', 'archived'].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors whitespace-nowrap ${
                  statusFilter === tab
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Submissions List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400 font-mono text-xs">
              Loading inquiries...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-400 font-mono text-xs">
              No inquiries found matching criteria.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filtered.map((sub) => (
                <div
                  key={sub.id}
                  onClick={() => setSelectedSubmission(sub)}
                  className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 cursor-pointer transition-colors ${
                    sub.status === 'new' ? 'bg-blue-50/20' : ''
                  }`}
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      {getStatusBadge(sub.status)}
                      {sub.inquiry_type && (
                        <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {sub.inquiry_type}
                        </span>
                      )}
                      <span className="text-xs text-slate-400 font-mono">
                        {new Date(sub.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 truncate">
                      {sub.subject}
                    </h3>

                    <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap">
                      <span className="font-semibold text-slate-900">{sub.name}</span>
                      <span>·</span>
                      <span className="font-mono text-slate-500">{sub.email}</span>
                      {sub.organization && (
                        <>
                          <span>·</span>
                          <span className="text-slate-600 truncate max-w-xs">{sub.organization}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSubmission(sub);
                      }}
                      className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {getStatusBadge(selectedSubmission.status)}
                  {selectedSubmission.inquiry_type && (
                    <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {selectedSubmission.inquiry_type}
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-slate-900 font-display">
                  {selectedSubmission.subject}
                </h2>
              </div>

              <button
                onClick={() => setSelectedSubmission(null)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm font-sans">
              
              {/* Sender Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                <div className="space-y-1">
                  <div className="text-slate-400 font-mono uppercase text-[10px]">From</div>
                  <div className="font-semibold text-slate-900">{selectedSubmission.name}</div>
                  <div className="font-mono text-slate-600">{selectedSubmission.email}</div>
                </div>

                <div className="space-y-1">
                  <div className="text-slate-400 font-mono uppercase text-[10px]">Organization & Phone</div>
                  <div className="text-slate-800">{selectedSubmission.organization || 'Not provided'}</div>
                  <div className="font-mono text-slate-600">{selectedSubmission.phone || 'Not provided'}</div>
                </div>

                <div className="sm:col-span-2 pt-2 border-t border-slate-200 flex items-center gap-2 text-slate-500 text-[11px] font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Received: {new Date(selectedSubmission.created_at).toLocaleString()}</span>
                </div>
              </div>

              {/* Message Body */}
              <div className="space-y-2">
                <div className="text-xs font-mono uppercase text-slate-500 tracking-wider">
                  Inquiry Message
                </div>
                <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-200 text-slate-800 leading-relaxed whitespace-pre-wrap font-sans text-sm">
                  {selectedSubmission.message}
                </div>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <a
                  href={`mailto:${selectedSubmission.email}?subject=Re: ${encodeURIComponent(selectedSubmission.subject)}`}
                  onClick={() => handleUpdateStatus(selectedSubmission.id, 'replied')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono uppercase tracking-wider font-semibold transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Reply via Email</span>
                </a>

                {selectedSubmission.status === 'new' && (
                  <button
                    disabled={actionLoading}
                    onClick={() => handleUpdateStatus(selectedSubmission.id, 'read')}
                    className="px-3 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-mono uppercase tracking-wider transition-colors"
                  >
                    Mark Read
                  </button>
                )}

                {selectedSubmission.status !== 'archived' && (
                  <button
                    disabled={actionLoading}
                    onClick={() => handleUpdateStatus(selectedSubmission.id, 'archived')}
                    className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-mono uppercase tracking-wider transition-colors"
                  >
                    Archive
                  </button>
                )}
              </div>

              <button
                disabled={actionLoading}
                onClick={() => handleDelete(selectedSubmission.id)}
                className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                title="Delete Submission"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}
    </AdminLayout>
  );
};
