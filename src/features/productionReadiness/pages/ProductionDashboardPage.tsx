import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck, Server, Cpu, Database, HardDrive, CheckCircle2, AlertTriangle, RefreshCw, Play, FileText, Lock } from 'lucide-react';

export function ProductionDashboardPage() {
  const [activeTab, setActiveTab] = useState<'health' | 'metrics' | 'workers' | 'audit'>('health');
  const [healthData, setHealthData] = useState<any>(null);
  const [metricsData, setMetricsData] = useState<any>(null);
  const [workersData, setWorkersData] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'health') {
        const res = await fetch('/api/v1/admin/production/health');
        const json = await res.json();
        if (json.success) setHealthData(json.data);
      } else if (activeTab === 'metrics') {
        const res = await fetch('/api/v1/admin/production/metrics');
        const json = await res.json();
        if (json.success) setMetricsData(json.data);
      } else if (activeTab === 'workers') {
        const res = await fetch('/api/v1/admin/production/workers');
        const json = await res.json();
        if (json.success) setWorkersData(json.data);
      } else if (activeTab === 'audit') {
        const res = await fetch('/api/v1/admin/production/audit-logs');
        const json = await res.json();
        if (json.success) setAuditLogs(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const triggerWorker = async (id: string) => {
    try {
      await fetch(`/api/v1/admin/production/workers/${id}/trigger`, { method: 'POST' });
      fetchData();
    } catch (err) {
      alert('Failed to trigger worker');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Production Readiness & Observability</h1>
          <p className="text-sm text-slate-500 mt-1">Enterprise infrastructure health, performance metrics, background workers, and audit security logs.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition">
            <RefreshCw className="h-4 w-4" /> Refresh Status
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto no-scrollbar">
        {[
          { id: 'health', label: 'System Health & Readiness' },
          { id: 'metrics', label: 'Performance Metrics' },
          { id: 'workers', label: 'Background Workers' },
          { id: 'audit', label: 'Security Audit Logs' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${
              activeTab === tab.id
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-500">Loading production diagnostics...</div>
      ) : (
        <div className="space-y-6">
          {activeTab === 'health' && healthData && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider">Overall Status</span>
                    <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="text-3xl font-bold text-emerald-600">{healthData.status}</div>
                  <p className="text-xs text-slate-500 mt-1">Build: {healthData.buildNumber}</p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider">System Uptime</span>
                    <Server className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div className="text-3xl font-bold text-slate-900">{(healthData.uptime / 60).toFixed(1)} mins</div>
                  <p className="text-xs text-slate-500 mt-1">Node.js Enterprise Runtime</p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider">API Version</span>
                    <Cpu className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-slate-900">v1 (Stable)</div>
                  <p className="text-xs text-slate-500 mt-1">Version {healthData.version}</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50">
                  <h3 className="font-semibold text-slate-800">Subsystem Health Checks</h3>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(healthData.checks || {}).map(([key, val]: [string, any]) => (
                    <div key={key} className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold text-slate-500 uppercase">{key}</span>
                        <div className="text-base font-bold text-slate-900 capitalize mt-0.5">{val}</div>
                      </div>
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'metrics' && metricsData && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-xs font-semibold uppercase text-slate-500">Average API Latency</span>
                <div className="text-3xl font-bold text-slate-900 mt-2">{metricsData.apiLatencyMs} ms</div>
                <p className="text-xs text-emerald-600 mt-1">Optimal (&lt; 50ms)</p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-xs font-semibold uppercase text-slate-500">Error Rate</span>
                <div className="text-3xl font-bold text-emerald-600 mt-2">{metricsData.errorRatePercentage}%</div>
                <p className="text-xs text-slate-500 mt-1">Below 0.1% threshold</p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-xs font-semibold uppercase text-slate-500">Order Throughput</span>
                <div className="text-3xl font-bold text-slate-900 mt-2">{metricsData.orderThroughputPerMin} / min</div>
                <p className="text-xs text-slate-500 mt-1">Blinkit hyper-speed delivery</p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-xs font-semibold uppercase text-slate-500">Checkout Success</span>
                <div className="text-3xl font-bold text-indigo-600 mt-2">{metricsData.checkoutSuccessPercentage}%</div>
                <p className="text-xs text-slate-500 mt-1">High conversion reliability</p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-xs font-semibold uppercase text-slate-500">Payment Success</span>
                <div className="text-3xl font-bold text-emerald-600 mt-2">{metricsData.paymentSuccessPercentage}%</div>
                <p className="text-xs text-slate-500 mt-1">Razorpay/Stripe gateway sync</p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-xs font-semibold uppercase text-slate-500">Cache Hit Ratio</span>
                <div className="text-3xl font-bold text-blue-600 mt-2">{metricsData.cacheHitRatio}%</div>
                <p className="text-xs text-slate-500 mt-1">Memory cache optimized</p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-xs font-semibold uppercase text-slate-500">Active Workers</span>
                <div className="text-3xl font-bold text-slate-900 mt-2">{metricsData.activeWorkers}</div>
                <p className="text-xs text-slate-500 mt-1">Background task runners</p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-xs font-semibold uppercase text-slate-500">Storage Usage</span>
                <div className="text-3xl font-bold text-slate-900 mt-2">{metricsData.storageUsageMB} MB</div>
                <p className="text-xs text-slate-500 mt-1">Uploads & assets store</p>
              </div>
            </div>
          )}

          {activeTab === 'workers' && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                <h3 className="font-semibold text-slate-800">Job Worker Framework</h3>
                <span className="text-xs text-slate-500">{workersData.length} workers registered</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[11px]">
                    <tr>
                      <th className="p-3">Worker Name</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Run Attempts</th>
                      <th className="p-3">Last Execution</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    {workersData.map((w) => (
                      <tr key={w.id} className="hover:bg-slate-50">
                        <td className="p-3 font-semibold text-slate-900">{w.name}</td>
                        <td className="p-3"><span className={`px-2 py-1 rounded text-xs font-semibold ${w.status === 'RUNNING' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{w.status}</span></td>
                        <td className="p-3 text-right font-medium">{w.attempts}</td>
                        <td className="p-3 text-xs text-slate-500">{w.lastRun ? new Date(w.lastRun).toLocaleTimeString() : 'Never'}</td>
                        <td className="p-3 text-right">
                          <button onClick={() => triggerWorker(w.id)} className="flex items-center gap-1 px-3 py-1 bg-indigo-600 text-white rounded text-xs font-medium hover:bg-indigo-700 ml-auto">
                            <Play className="h-3 w-3" /> Trigger Now
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50">
                <h3 className="font-semibold text-slate-800">Security Audit & Compliance Logs</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[11px]">
                    <tr>
                      <th className="p-3">Timestamp</th>
                      <th className="p-3">Action</th>
                      <th className="p-3">User ID</th>
                      <th className="p-3">Store ID</th>
                      <th className="p-3">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono text-xs text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                        <td className="p-3 font-semibold text-indigo-700">{log.action}</td>
                        <td className="p-3 font-mono text-xs">{log.userId || 'System'}</td>
                        <td className="p-3 font-mono text-xs">{log.storeId || 'Global'}</td>
                        <td className="p-3 font-mono text-xs text-slate-600">{JSON.stringify(log.details)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
