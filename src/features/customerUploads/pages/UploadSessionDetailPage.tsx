import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { customerUploadsService } from '../services/customerUploadsService';
import { UploadSession, CustomerUpload } from '../types/customerUploads';
import { ImagePreviewCard } from '../components/ImagePreviewCard';
import { ArrowLeft, Clock, Monitor, ShieldCheck, Tag, Info, ShieldAlert, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export function UploadSessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<UploadSession | null>(null);
  const [uploads, setUploads] = useState<CustomerUpload[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSessionDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await customerUploadsService.adminGetSession(id);
      setSession(data.session);
      setUploads(data.uploads);
    } catch (err: any) {
      toast.error('Failed to load session details: ' + err.message);
      navigate('/admin/upload-sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessionDetails();
  }, [id]);

  const handleToggleProtect = async (upload: CustomerUpload) => {
    try {
      const updated = await customerUploadsService.adminToggleProtect(
        upload.id,
        !upload.isAdminProtected,
        !upload.isAdminProtected ? 'Admin locked' : undefined
      );
      setUploads((prev) => prev.map((u) => (u.id === upload.id ? updated : u)));
      toast.success(updated.isAdminProtected ? 'File protected against automatic cleanup' : 'File protection removed');
    } catch (err: any) {
      toast.error('Failed to update protection state: ' + err.message);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-slate-500 font-semibold">Loading session inspection...</div>;
  }

  if (!session) {
    return <div className="text-center py-20 text-red-500 font-semibold">Session not found.</div>;
  }

  return (
    <div id="upload-session-detail-page" className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/upload-sessions" className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 shadow-sm">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Session Inspector</span>
          <h1 className="text-2xl font-bold text-slate-900 mt-0.5">Session: {session.publicToken}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left main area: uploads grid */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">Session Assets</h3>
            {uploads.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                No files have been uploaded during this session yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {uploads.map((upload) => (
                  <div key={upload.id} className="flex flex-col h-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <Link to={`/admin/customer-uploads/${upload.id}`} className="block flex-1">
                      <ImagePreviewCard upload={upload} showDelete={false} />
                    </Link>
                    <div className="p-2.5 border-t border-slate-100 flex items-center justify-between bg-slate-50 text-[11px]">
                      <Link
                        to={`/admin/customer-uploads/${upload.id}`}
                        className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
                      >
                        Inspect
                      </Link>
                      <button
                        onClick={() => handleToggleProtect(upload)}
                        className={`p-1 rounded hover:bg-slate-200 transition-colors cursor-pointer ${
                          upload.isAdminProtected ? 'text-indigo-600 bg-indigo-50 border border-indigo-150' : 'text-slate-400'
                        }`}
                        title={upload.isAdminProtected ? 'Protected' : 'Protect File'}
                      >
                        <ShieldCheck className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Area: diagnostics */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">Diagnostic Data</h3>
            <div className="space-y-3.5">
              <div className="flex justify-between items-center text-xs py-1 border-b border-slate-100 last:border-none">
                <span className="font-semibold text-slate-500">Session ID</span>
                <span className="font-bold text-slate-800 font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded">{session.id}</span>
              </div>
              <div className="flex justify-between items-center text-xs py-1 border-b border-slate-100 last:border-none">
                <span className="font-semibold text-slate-500">Source Channel</span>
                <span className="font-bold text-slate-800">{session.source}</span>
              </div>
              <div className="flex justify-between items-center text-xs py-1 border-b border-slate-100 last:border-none">
                <span className="font-semibold text-slate-500">Status</span>
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  session.status === 'ACTIVE'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}>
                  {session.status}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs py-1 border-b border-slate-100 last:border-none">
                <span className="font-semibold text-slate-500">Target Product</span>
                <span className="font-bold text-slate-800">{session.productId || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center text-xs py-1 border-b border-slate-100 last:border-none">
                <span className="font-semibold text-slate-500">Form Version</span>
                <span className="font-bold text-slate-800">{session.formVersion || 1}</span>
              </div>
              <div className="flex justify-between items-center text-xs py-1 border-b border-slate-100 last:border-none">
                <span className="font-semibold text-slate-500">Anonymous ID</span>
                <span className="font-bold text-slate-800 font-mono text-[10px] truncate max-w-[120px]" title={session.anonymousSessionId || ''}>
                  {session.anonymousSessionId || 'None'}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs py-1 border-b border-slate-100 last:border-none">
                <span className="font-semibold text-slate-500">Expires At</span>
                <div className="flex items-center gap-1 font-bold text-slate-800">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  <span>{new Date(session.expiresAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
