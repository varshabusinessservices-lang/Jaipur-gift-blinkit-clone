import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { customerUploadsService } from '../services/customerUploadsService';
import { CustomerUpload } from '../types/customerUploads';
import { ArrowLeft, Shield, ShieldCheck, Clock, FileText, Layout, Info, AlertTriangle, Eye, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export function CustomerUploadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [upload, setUpload] = useState<CustomerUpload | null>(null);
  const [loading, setLoading] = useState(true);
  const [protectionReason, setProtectionReason] = useState('');
  const [isUpdatingProtect, setIsUpdatingProtect] = useState(false);

  const loadUploadDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await customerUploadsService.adminListUploads({ search: id });
      const found = data.uploads.find((u) => u.id === id);
      if (!found) {
        toast.error('Customer upload file not found');
        navigate('/admin/customer-uploads');
        return;
      }
      setUpload(found);
      setProtectionReason(found.protectionReason || '');
    } catch (err: any) {
      toast.error('Failed to load file details: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUploadDetails();
  }, [id]);

  const handleToggleProtect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!upload) return;

    try {
      setIsUpdatingProtect(true);
      const updated = await customerUploadsService.adminToggleProtect(
        upload.id,
        !upload.isAdminProtected,
        !upload.isAdminProtected ? protectionReason || 'Protected by Admin' : undefined
      );
      setUpload(updated);
      toast.success(updated.isAdminProtected ? 'File locked against auto-purging.' : 'File safety lock removed.');
    } catch (err: any) {
      toast.error('Failed to modify file protection lock: ' + err.message);
    } finally {
      setIsUpdatingProtect(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-slate-500 font-semibold">Loading upload details...</div>;
  }

  if (!upload) {
    return <div className="text-center py-20 text-red-500 font-semibold">File not found.</div>;
  }

  const validationResult = upload.validationResultJson ? JSON.parse(upload.validationResultJson) : null;
  const isImg = upload.mimeType?.startsWith('image/');
  const imageUrl = upload.signedUrl || `/api/v1/customer-uploads/view/${upload.id}`;

  return (
    <div id="customer-upload-detail-page" className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/customer-uploads" className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 shadow-sm">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Asset Inspector</span>
          <h1 className="text-2xl font-bold text-slate-900 mt-0.5">{upload.originalFileName}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Preview and validations */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">File Preview</h3>
            <div className="relative aspect-video max-h-[400px] w-full bg-slate-50 border border-slate-150 rounded-lg flex items-center justify-center overflow-hidden">
              {isImg ? (
                <img
                  src={imageUrl}
                  alt={upload.originalFileName}
                  className="object-contain w-full h-full"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-8">
                  <FileText className="h-20 w-20 text-slate-300 mb-4" />
                  <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">{upload.extension} Document</span>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <a
                href={imageUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors border border-slate-200"
              >
                <Eye className="h-4 w-4" /> Open In New Tab
              </a>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">Quality Validation Checks</h3>
            {validationResult ? (
              <div className="space-y-3">
                <div className={`flex items-start gap-3 p-4 rounded-xl border ${validationResult.valid ? 'bg-green-50 border-green-150 text-green-800' : 'bg-amber-50 border-amber-150 text-amber-800'}`}>
                  {validationResult.valid ? <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600 mt-0.5" /> : <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />}
                  <div>
                    <h4 className="font-bold text-sm">{validationResult.valid ? 'All quality assertions passed' : 'Quality issues detected'}</h4>
                    <p className="text-xs mt-0.5">{validationResult.valid ? 'This file has high-fidelity dimensions and standard layout suitable for luxury engraving.' : 'The asset fails standard quality checkmarks, which may result in poor printing.'}</p>
                  </div>
                </div>

                {validationResult.flags && validationResult.flags.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Validation Warnings</p>
                    {validationResult.flags.map((flag: string, idx: number) => (
                      <div key={idx} className="p-2.5 bg-slate-50 rounded-lg border border-slate-150 text-xs font-semibold text-slate-700 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                        <span>{flag.replace(/_/g, ' ')}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No validations recorded for this file type.</p>
            )}
          </div>
        </div>

        {/* Right Column: Metadata and Lock Manager */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">Asset Metadata</h3>
            <div className="space-y-3.5">
              <div className="flex justify-between items-center text-xs py-1 border-b border-slate-100 last:border-none">
                <span className="font-semibold text-slate-500">Upload ID</span>
                <span className="font-bold text-slate-800 font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded">{upload.id}</span>
              </div>
              <div className="flex justify-between items-center text-xs py-1 border-b border-slate-100 last:border-none">
                <span className="font-semibold text-slate-500">Session ID</span>
                <span className="font-bold text-indigo-600 font-mono text-[10px] bg-indigo-50 px-1.5 py-0.5 rounded">
                  <Link to={`/admin/upload-sessions/${upload.uploadSessionId}`}>
                    {upload.uploadSessionId}
                  </Link>
                </span>
              </div>
              <div className="flex justify-between items-center text-xs py-1 border-b border-slate-100 last:border-none">
                <span className="font-semibold text-slate-500">Mime Type</span>
                <span className="font-bold text-slate-800">{upload.mimeType}</span>
              </div>
              <div className="flex justify-between items-center text-xs py-1 border-b border-slate-100 last:border-none">
                <span className="font-semibold text-slate-500">Role</span>
                <span className="font-bold text-slate-800">{upload.uploadRole}</span>
              </div>
              <div className="flex justify-between items-center text-xs py-1 border-b border-slate-100 last:border-none">
                <span className="font-semibold text-slate-500">Lifecycle Status</span>
                <span className="font-bold text-slate-800 uppercase text-[10px] bg-slate-200 px-1.5 py-0.5 rounded">{upload.lifecycleStatus}</span>
              </div>
              {upload.width && upload.height && (
                <div className="flex justify-between items-center text-xs py-1 border-b border-slate-100 last:border-none">
                  <span className="font-semibold text-slate-500">Dimensions</span>
                  <span className="font-bold text-slate-800">{upload.width} x {upload.height} px</span>
                </div>
              )}
              <div className="flex justify-between items-center text-xs py-1 border-b border-slate-100 last:border-none">
                <span className="font-semibold text-slate-500">Created At</span>
                <span className="font-bold text-slate-800">{new Date(upload.createdAt).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">Safety Protection Lock</h3>
            <p className="text-xs text-slate-500">Protected files bypass the retention and cleanup jobs completely, guaranteeing they are never purged.</p>

            <form onSubmit={handleToggleProtect} className="space-y-3">
              {!upload.isAdminProtected && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Reason for protecting (optional)</label>
                  <input
                    type="text"
                    value={protectionReason}
                    onChange={(e) => setProtectionReason(e.target.value)}
                    placeholder="e.g. VIP client, custom order mock"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 focus:outline-none"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isUpdatingProtect}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold rounded-lg shadow-sm border transition-colors cursor-pointer ${
                  upload.isAdminProtected
                    ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white border-transparent'
                }`}
              >
                {upload.isAdminProtected ? (
                  <>
                    <Shield className="h-4 w-4" /> Remove Safety Lock
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" /> Apply Safety Lock
                  </>
                )}
              </button>
            </form>

            {upload.isAdminProtected && upload.protectionReason && (
              <div className="p-2.5 bg-indigo-50 border border-indigo-100 text-indigo-800 rounded-lg text-xs">
                <p className="font-bold">Lock Reason:</p>
                <p className="text-[11px] mt-0.5">"{upload.protectionReason}"</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
