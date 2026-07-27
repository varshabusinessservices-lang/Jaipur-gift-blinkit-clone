import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { customerUploadsService } from '../services/customerUploadsService';
import { CustomerUploadCleanupRun } from '../types/customerUploads';
import { ArrowLeft, Play, ShieldAlert, Sparkles, Clock, Layers, ShieldCheck, RefreshCw, Eye } from 'lucide-react';
import { toast } from 'sonner';

export function CleanupManagerPage() {
  const [history, setHistory] = useState<CustomerUploadCleanupRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [dryRun, setDryRun] = useState(true);
  const [runningJob, setRunningJob] = useState(false);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await customerUploadsService.adminGetCleanupHistory();
      setHistory(data);
    } catch (err: any) {
      toast.error('Failed to load cleanup logs: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleRunCleanup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setRunningJob(true);
      const run = await customerUploadsService.adminTriggerCleanup(dryRun);
      toast.success(
        run.dryRun
          ? `Dry run finished! Scanned: ${run.scannedCount}, Eligible to purge: ${run.eligibleCount}`
          : `Live cleanup executed! Successfully purged: ${run.purgedCount} temporary files.`
      );
      await loadHistory();
    } catch (err: any) {
      toast.error('Cleanup operation failed: ' + err.message);
    } finally {
      setRunningJob(false);
    }
  };

  return (
    <div id="cleanup-manager-page" className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/customer-uploads" className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 shadow-sm">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Operations & Lifecycle</span>
          <h1 className="text-2xl font-bold text-slate-900 mt-0.5">Lifecycle Retention Cleanup</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left main area: triggering run */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">Trigger Manual Run</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            The cleanup job runs automatically, soft-deleting and purging expired files after their configurable retention periods.
            You can trigger a manual run to immediately scan the storage directory.
          </p>

          <form onSubmit={handleRunCleanup} className="space-y-4 pt-2">
            <div className="flex items-start gap-2.5 p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-800 text-xs">
              <ShieldCheck className="h-4 w-4 shrink-0 text-indigo-500 mt-0.5" />
              <span>
                Protected files (safety-locked) and active order-attached files are completely bypassed during both dry runs and active purging.
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800">Dry Run Mode</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Scans and reports count without making database changes</span>
              </div>
              <input
                type="checkbox"
                checked={dryRun}
                onChange={(e) => setDryRun(e.target.checked)}
                className="w-5 h-5 accent-indigo-600 rounded text-indigo-600"
              />
            </div>

            <button
              type="submit"
              disabled={runningJob}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              {runningJob ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Processing database run...</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  <span>Execute {dryRun ? 'Dry Run' : 'Active Purge'}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Area: history table */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Cleanup Execution Logs</h3>
            <button onClick={loadHistory} className="text-xs font-bold text-indigo-600 hover:text-indigo-800">
              Refresh History
            </button>
          </div>

          {loading ? (
            <div className="text-center py-10 text-slate-500 font-semibold flex items-center justify-center gap-1.5">
              <RefreshCw className="h-4 w-4 animate-spin text-indigo-500" />
              <span>Loading log files...</span>
            </div>
          ) : history.length === 0 ? (
            <p className="text-xs text-slate-400">No cleanup execution history recorded.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Scanned</th>
                    <th className="py-2.5 px-3 text-amber-600">Eligible</th>
                    <th className="py-2.5 px-3 text-red-600">Purged</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.map((run) => (
                    <tr key={run.id} className="hover:bg-slate-50/40">
                      <td className="py-3 px-3 font-semibold text-slate-900">
                        {new Date(run.startedAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide border ${
                          run.dryRun
                            ? 'bg-slate-50 border-slate-200 text-slate-500'
                            : 'bg-red-50 border-red-200 text-red-700'
                        }`}>
                          {run.dryRun ? 'Dry Run' : 'Active Live'}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-600">{run.scannedCount}</td>
                      <td className="py-3 px-3 font-mono font-bold text-amber-600">{run.eligibleCount}</td>
                      <td className="py-3 px-3 font-mono font-bold text-red-600">{run.purgedCount}</td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wide uppercase border ${
                          run.status === 'COMPLETED'
                            ? 'bg-green-50 border-green-200 text-green-800'
                            : 'bg-red-50 border-red-200 text-red-800'
                        }`}>
                          {run.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
