import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { customerUploadsService } from '../services/customerUploadsService';
import { CustomerUpload } from '../types/customerUploads';
import { ImagePreviewCard } from '../components/ImagePreviewCard';
import { Search, SlidersHorizontal, Trash2, Calendar, FileText, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export function CustomerUploadsListPage() {
  const [uploads, setUploads] = useState<CustomerUpload[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [totalCount, setTotalCount] = useState(0);

  const fetchUploads = async () => {
    try {
      setLoading(true);
      const data = await customerUploadsService.adminListUploads({
        search: search || undefined,
        lifecycleStatus: statusFilter || undefined,
        uploadRole: roleFilter || undefined,
      });
      setUploads(data.uploads);
      setTotalCount(data.total);
    } catch (err: any) {
      toast.error('Failed to load uploads: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUploads();
  }, [search, statusFilter, roleFilter]);

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

  return (
    <div id="customer-uploads-list-page" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Operations & Assets</span>
          <h1 className="text-2xl font-bold text-slate-900 mt-0.5">Customer Uploads</h1>
          <p className="text-xs text-slate-500 mt-1">Manage, protect, and audit personalized customer assets and photos.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/upload-sessions"
            className="px-4 py-2 text-xs font-semibold bg-white border border-slate-200 text-slate-700 rounded-lg hover:text-slate-900 shadow-sm hover:bg-slate-50 transition-colors"
          >
            Upload Sessions
          </Link>
          <Link
            to="/admin/customer-uploads/cleanup"
            className="px-4 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm transition-colors"
          >
            Cleanup Manager
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center gap-3">
          <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Total Uploaded Files</p>
            <p className="text-lg font-bold text-slate-800">{totalCount}</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center gap-3">
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Validated Assets</p>
            <p className="text-lg font-bold text-emerald-700">
              {uploads.filter((u) => u.lifecycleStatus === 'VALIDATED').length}
            </p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center gap-3">
          <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Low Quality Warning</p>
            <p className="text-lg font-bold text-amber-700">
              {uploads.filter((u) => u.lifecycleStatus === 'VALIDATION_FAILED').length}
            </p>
          </div>
        </div>
      </div>

      {/* Filter panel */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search files by ID, name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-700 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="VALIDATED">Validated</option>
            <option value="VALIDATION_FAILED">Validation Failed</option>
            <option value="TEMPORARY">Temporary</option>
            <option value="ORDER_ATTACHED">Order Attached</option>
            <option value="PURGED">Purged</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-700 focus:outline-none"
          >
            <option value="">All Roles</option>
            <option value="MAIN_PHOTO">Main Photo</option>
            <option value="SUPPORTING_PHOTO">Supporting Photo</option>
            <option value="LOGO">Logo</option>
            <option value="QR_IMAGE">QR Image</option>
            <option value="DOCUMENT">Document</option>
          </select>

          <button
            onClick={fetchUploads}
            className="p-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-600 hover:text-slate-800 cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500 font-semibold flex items-center justify-center gap-2">
          <RefreshCw className="h-5 w-5 animate-spin text-indigo-500" />
          <span>Loading customer uploads...</span>
        </div>
      ) : uploads.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-xl shadow-sm">
          <p className="text-slate-400 font-semibold text-sm">No uploads match the specified filter criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {uploads.map((upload) => (
            <div key={upload.id} className="flex flex-col h-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <Link to={`/admin/customer-uploads/${upload.id}`} className="block flex-1">
                <ImagePreviewCard upload={upload} showDelete={false} />
              </Link>
              <div className="p-3 border-t border-slate-100 flex items-center justify-between bg-slate-50">
                <Link
                  to={`/admin/customer-uploads/${upload.id}`}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
                >
                  Inspect details
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
  );
}
