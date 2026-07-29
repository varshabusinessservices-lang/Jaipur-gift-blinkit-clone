import React, { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/axios';
import { RefreshCcw, Download, FileText, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export function ExportHistoryPage() {
  const [exportsList, setExportsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExports = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/admin/reports/exports');
      const json = res.data.success ? res.data.data : res.data;
      setExportsList(json.exports || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load export history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExports();
  }, []);

  const handleDownload = async (id: string, moduleName: string) => {
    try {
      const res = await apiClient.get(`/admin/reports/exports/${id}/download`, {
        responseType: 'blob'
      });
      const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${moduleName.toLowerCase()}-export-${id.slice(0, 8)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert('Download failed: ' + (err.message || 'Unknown error'));
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Export History</h1>
          <p className="text-sm text-slate-500">Track and download previously generated spreadsheet export reports</p>
        </div>
        <button onClick={fetchExports} className="p-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm" title="Refresh">
          <RefreshCcw className="h-4 w-4" />
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Export ID</th>
                <th className="py-3 px-4">Module</th>
                <th className="py-3 px-4">Format</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created At</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">Loading export history...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-red-500">Error: {error}</td>
                </tr>
              ) : exportsList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">No export jobs found. Click "Export Excel" on any report page to generate one.</td>
                </tr>
              ) : (
                exportsList.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs text-slate-500">{job.id.slice(0, 8)}...</td>
                    <td className="py-3 px-4 font-medium text-slate-900">{job.module}</td>
                    <td className="py-3 px-4 text-slate-600">{job.exportType}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        job.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' :
                        job.status === 'PENDING' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {job.status === 'COMPLETED' && <CheckCircle2 className="h-3.5 w-3.5" />}
                        {job.status === 'PENDING' && <Clock className="h-3.5 w-3.5" />}
                        {job.status === 'FAILED' && <AlertCircle className="h-3.5 w-3.5" />}
                        {job.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-xs">{new Date(job.createdAt).toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">
                      {job.status === 'COMPLETED' && (
                        <button
                          onClick={() => handleDownload(job.id, job.module)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-medium transition-colors"
                        >
                          <Download className="h-3.5 w-3.5" /> Download
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
