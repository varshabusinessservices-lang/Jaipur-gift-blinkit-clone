import { useState, useEffect } from 'react';
import { apiClient } from '../../../lib/axios';
import { toast } from 'sonner';
import { Monitor, Smartphone, Globe, LogOut, ShieldAlert, CheckCircle, RefreshCw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';

interface Session {
  id: string;
  userAgent: string;
  ipAddress: string | null;
  createdAt: string;
  lastActivityAt: string | null;
  expiresAt: string;
  isCurrent: boolean;
}

export function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRevoking, setIsRevoking] = useState(false);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const fetchSessions = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/admin/security/sessions');
      if (res.data.success) {
        setSessions(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load active sessions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleRevoke = async (id: string) => {
    if (!window.confirm('Are you sure you want to terminate this session?')) return;
    try {
      const res = await apiClient.delete(`/admin/security/sessions/${id}`);
      if (res.data.success) {
        toast.success('Session terminated');
        fetchSessions();
      }
    } catch (err) {
      toast.error('Failed to revoke session');
    }
  };

  const handleRevokeAllOthers = async () => {
    if (!window.confirm('Are you sure you want to log out all other devices?')) return;
    setIsRevoking(true);
    try {
      const res = await apiClient.post('/admin/security/sessions/revoke-all-others');
      if (res.data.success) {
        toast.success('All other sessions revoked successfully');
        fetchSessions();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to revoke other sessions');
    } finally {
      setIsRevoking(false);
    }
  };

  const handleLogoutAll = async () => {
    if (!window.confirm('WARNING: You will be logged out from ALL devices including this one. Continue?')) return;
    setIsRevoking(true);
    try {
      const res = await apiClient.post('/admin/security/sessions/logout-all');
      if (res.data.success) {
        toast.success('Logged out from all devices');
        logout();
        navigate('/admin/login');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to logout from all devices');
    } finally {
      setIsRevoking(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link to="/admin/profile" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 mb-1 inline-block">&larr; Back to Profile</Link>
          <h1 className="text-2xl font-bold text-slate-900">Active Sessions & Device Security</h1>
          <p className="mt-1 text-sm text-slate-500">Monitor and manage all active login sessions associated with your Super Admin account.</p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={fetchSessions} 
            disabled={isLoading}
            className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
            title="Refresh Sessions"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          {sessions.length > 1 && (
            <button 
              onClick={handleRevokeAllOthers} 
              disabled={isRevoking}
              className="px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
            >
              Log out all other devices
            </button>
          )}

          <button 
            onClick={handleLogoutAll} 
            disabled={isRevoking}
            className="px-3 py-2 border border-red-200 rounded-lg text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
          >
            Log out everywhere
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Monitor className="h-4 w-4 text-indigo-600" />
            Active Devices ({sessions.length})
          </h3>
          <span className="text-xs text-slate-500">Sessions automatically expire after inactivity</span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto text-indigo-600 mb-2" />
            Loading active session tokens...
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">No active sessions found.</div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {sessions.map((session) => {
              const isMobile = session.userAgent?.toLowerCase().includes('mobile') || session.userAgent?.toLowerCase().includes('android') || session.userAgent?.toLowerCase().includes('iphone');
              return (
                <li key={session.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl shrink-0 ${session.isCurrent ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                      {isMobile ? <Smartphone className="h-6 w-6" /> : <Monitor className="h-6 w-6" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-slate-900">
                          {session.userAgent ? session.userAgent.split(' ').slice(0, 4).join(' ') : 'Unknown Device'}
                        </p>
                        {session.isCurrent && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle className="h-3 w-3" /> Current Device
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center text-xs text-slate-500 gap-3 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Globe className="h-3.5 w-3.5 text-slate-400" /> IP: {session.ipAddress || 'Protected'}
                        </span>
                        <span>&bull;</span>
                        <span>Logged in: {new Date(session.createdAt).toLocaleDateString()}</span>
                        <span>&bull;</span>
                        <span>Last active: {new Date(session.lastActivityAt || session.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>

                  {!session.isCurrent ? (
                    <button 
                      onClick={() => handleRevoke(session.id)} 
                      className="text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors flex items-center gap-1 shrink-0 self-start sm:self-center cursor-pointer"
                    >
                      <LogOut className="h-3.5 w-3.5" /> Terminate Session
                    </button>
                  ) : (
                    <span className="text-xs font-medium text-slate-400 shrink-0 self-start sm:self-center">Active Now</span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800 flex items-start gap-3">
        <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-amber-900 mb-0.5">Session Security Policy</p>
          <p>Revoking a session will immediately invalidate its refresh token. The user on that device will be prompted to re-authenticate upon their next request.</p>
        </div>
      </div>
    </div>
  );
}
