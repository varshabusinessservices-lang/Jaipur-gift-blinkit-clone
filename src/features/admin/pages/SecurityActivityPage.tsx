import { useState, useEffect } from 'react';
import { apiClient } from '../../../lib/axios';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { ShieldAlert, LogIn, LogOut, Key, User, Mail, Shield, RefreshCw, Search, Monitor, Filter } from 'lucide-react';

interface ActivityLog {
  id: string;
  action: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export function SecurityActivityPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL');

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/admin/security/activity');
      if (res.data.success) {
        setLogs(res.data.data);
        setFilteredLogs(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load security logs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    let result = logs;

    if (selectedFilter !== 'ALL') {
      result = result.filter(l => l.action.includes(selectedFilter));
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(l => 
        l.action.toLowerCase().includes(term) ||
        (l.ipAddress && l.ipAddress.toLowerCase().includes(term)) ||
        (l.userAgent && l.userAgent.toLowerCase().includes(term))
      );
    }

    setFilteredLogs(result);
  }, [searchTerm, selectedFilter, logs]);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'LOGIN_SUCCESS': return <LogIn className="h-5 w-5 text-emerald-600" />;
      case 'FAILED_LOGIN': return <ShieldAlert className="h-5 w-5 text-red-600" />;
      case 'LOGOUT': return <LogOut className="h-5 w-5 text-slate-500" />;
      case 'PASSWORD_CHANGED':
      case 'PASSWORD_OTP_REQUESTED':
      case 'PASSWORD_OTP_VERIFIED': return <Key className="h-5 w-5 text-indigo-600" />;
      case 'EMAIL_CHANGE_INITIATED':
      case 'EMAIL_CHANGED':
      case 'OLD_EMAIL_VERIFIED':
      case 'NEW_EMAIL_VERIFIED': return <Mail className="h-5 w-5 text-indigo-600" />;
      case 'PROFILE_UPDATED':
      case 'AVATAR_ADDED':
      case 'AVATAR_REMOVED': return <User className="h-5 w-5 text-indigo-600" />;
      case 'SESSION_REVOKED':
      case 'ALL_SESSIONS_REVOKED':
      case 'OTHER_SESSIONS_REVOKED': return <Monitor className="h-5 w-5 text-amber-600" />;
      default: return <Shield className="h-5 w-5 text-slate-500" />;
    }
  };

  const getActionLabel = (action: string) => {
    return action.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  };

  const getBadgeClass = (action: string) => {
    if (action.includes('SUCCESS') || action.includes('CHANGED') || action.includes('VERIFIED')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (action.includes('FAILED') || action.includes('REVOKED')) {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    return 'bg-slate-50 text-slate-700 border-slate-200';
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link to="/admin/profile" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 mb-1 inline-block">&larr; Back to Profile</Link>
          <h1 className="text-2xl font-bold text-slate-900">Security Audit Logs</h1>
          <p className="mt-1 text-sm text-slate-500">Comprehensive security events, login attempts, password changes, and active session revocations.</p>
        </div>

        <button 
          onClick={fetchLogs} 
          disabled={isLoading}
          className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors self-start sm:self-auto"
          title="Refresh Activity"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
          <input 
            type="text"
            placeholder="Search activity..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-slate-400 shrink-0" />
          <select 
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700"
          >
            <option value="ALL">All Actions</option>
            <option value="LOGIN">Logins</option>
            <option value="PASSWORD">Password Changes</option>
            <option value="EMAIL">Email Updates</option>
            <option value="SESSION">Session Revocations</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto text-indigo-600 mb-2" />
            Loading security logs...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">No matching security events found.</div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {filteredLogs.map((log) => (
              <li key={log.id} className="p-5 flex items-start sm:items-center gap-4 hover:bg-slate-50/50 transition-colors">
                <div className="p-2.5 rounded-xl bg-slate-100 shrink-0 mt-0.5 sm:mt-0">
                  {getActionIcon(log.action)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold border ${getBadgeClass(log.action)}`}>
                      {getActionLabel(log.action)}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(log.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>

                  <div className="mt-1.5 flex items-center text-xs text-slate-500 gap-3 flex-wrap">
                    <span>IP: <strong className="font-mono text-slate-700">{log.ipAddress || 'Protected'}</strong></span>
                    <span>&bull;</span>
                    <span className="truncate max-w-md" title={log.userAgent || ''}>
                      {log.userAgent || 'Unknown Device'}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
