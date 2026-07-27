import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { customerUploadsService } from '../services/customerUploadsService';
import { UploadSession } from '../types/customerUploads';
import { Search, Clock, Smartphone, Layers, AlertCircle, RefreshCw, Eye } from 'lucide-react';
import { toast } from 'sonner';

export function UploadSessionListPage() {
  const [sessions, setSessions] = useState<UploadSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const data = await customerUploadsService.adminListSessions({
        status: statusFilter || undefined,
        source: sourceFilter || undefined,
      });
      setSessions(data);
    } catch (err: any) {
      toast.error('Failed to load sessions: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [statusFilter, sourceFilter]);

  return (
    <div id="upload-sessions-list-page" className="space-y-6">
      <div>
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Operations & Sessions</span>
        <h1 className="text-2xl font-bold text-slate-900 mt-0.5">Upload Sessions</h1>
        <p className="text-xs text-slate-500 mt-1">Audit active user personalization pipelines before shopping cart conversions.</p>
      </div>

      {/* Filters panel */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-700 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="CONVERTED">Converted</option>
            <option value="EXPIRED">Expired</option>
            <option value="ABANDONED">Abandoned</option>
          </select>

          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-700 focus:outline-none"
          >
            <option value="">All Sources</option>
            <option value="WEBSITE">Website</option>
            <option value="ADMIN">Admin Panel</option>
            <option value="OFFLINE_ORDER">Offline Order</option>
          </select>
        </div>

        <button
          onClick={fetchSessions}
          className="p-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-600 hover:text-slate-800 cursor-pointer w-full sm:w-auto flex justify-center items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="text-xs font-semibold sm:hidden">Refresh Sessions</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500 font-semibold flex items-center justify-center gap-2">
          <RefreshCw className="h-5 w-5 animate-spin text-indigo-500" />
          <span>Loading upload sessions...</span>
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-xl shadow-sm">
          <p className="text-slate-400 font-semibold text-sm">No active customer upload sessions found.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                <th className="py-3 px-4">Session Token / ID</th>
                <th className="py-3 px-4">Product / Form Context</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4">Activity Time</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {sessions.map((session) => (
                <tr key={session.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 font-mono text-xs">{session.publicToken}</span>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {session.id}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-800 text-xs">Product: {session.productId || 'Unknown'}</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">Form Version: {session.formVersion || 1}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      session.status === 'ACTIVE'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : session.status === 'CONVERTED'
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-800'
                        : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}>
                      {session.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-xs font-semibold text-slate-600">
                    {session.source}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span>{new Date(session.lastActivityAt).toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      to={`/admin/upload-sessions/${session.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold rounded-lg transition-colors border border-slate-150"
                    >
                      <Eye className="h-3.5 w-3.5" /> Inspect
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
