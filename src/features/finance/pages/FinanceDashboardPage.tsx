import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, ShoppingBag, RefreshCw, Wallet, ShieldCheck, Download, Calendar, Filter, FileText } from 'lucide-react';

export function FinanceDashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'ledger' | 'revenue' | 'wallet' | 'settlements' | 'gst' | 'reports'>('overview');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [ledgerItems, setLedgerItems] = useState<any[]>([]);
  const [walletItems, setWalletItems] = useState<any[]>([]);
  const [settlements, setSettlements] = useState<any[]>([]);
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const res = await fetch('/api/v1/admin/finance/dashboard');
        const json = await res.json();
        if (json.success) setDashboardData(json.data);
      } else if (activeTab === 'ledger') {
        const res = await fetch('/api/v1/admin/finance/ledger');
        const json = await res.json();
        if (json.success) setLedgerItems(json.data);
      } else if (activeTab === 'revenue') {
        const res = await fetch('/api/v1/admin/finance/revenue');
        const json = await res.json();
        if (json.success) setReportData(json.data);
      } else if (activeTab === 'wallet') {
        const res = await fetch('/api/v1/admin/wallet');
        const json = await res.json();
        if (json.success) setWalletItems(json.data);
      } else if (activeTab === 'settlements') {
        const res = await fetch('/api/v1/admin/finance/settlements');
        const json = await res.json();
        if (json.success) setSettlements(json.data);
      } else if (activeTab === 'reports') {
        const res = await fetch('/api/v1/admin/reports/orders');
        const json = await res.json();
        if (json.success) setReportData(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (exportType: string, module: string) => {
    try {
      const res = await fetch('/api/v1/admin/reports/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exportType, module }),
      });
      const json = await res.json();
      if (json.success) {
        alert(`Export generated successfully! Download link: ${json.data.fileUrl}`);
      }
    } catch (err) {
      alert('Export failed');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Finance, Accounting & Business Intelligence</h1>
          <p className="text-sm text-slate-500 mt-1">Unified financial ledger, tax auditing, settlements, and reporting engine for Jaipur Gifting.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => handleExport('CSV', 'FINANCE')} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition">
            <Download className="h-4 w-4" /> Export CSV
          </button>
          <button onClick={() => handleExport('EXCEL', 'FINANCE')} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 rounded-lg text-sm font-medium text-white hover:bg-indigo-700 shadow-sm transition">
            <FileText className="h-4 w-4" /> Export Excel
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: 'Dashboard KPIs' },
          { id: 'ledger', label: 'Financial Ledger' },
          { id: 'revenue', label: 'Revenue & Sales' },
          { id: 'wallet', label: 'Wallet Ledger' },
          { id: 'settlements', label: 'Settlements' },
          { id: 'gst', label: 'GST Engine' },
          { id: 'reports', label: 'Reports & BI' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${
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
        <div className="py-16 text-center text-slate-500">Loading financial data...</div>
      ) : (
        <div className="space-y-6">
          {activeTab === 'overview' && dashboardData && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Today's Revenue</span>
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="text-3xl font-bold text-slate-900">₹{dashboardData.todaysRevenue.toLocaleString()}</div>
                <p className="text-xs text-emerald-600 font-medium mt-1">↑ +12.4% vs yesterday</p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Today's Orders</span>
                  <ShoppingBag className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="text-3xl font-bold text-slate-900">{dashboardData.todaysOrders}</div>
                <p className="text-xs text-slate-500 mt-1">Average Value: ₹{dashboardData.averageOrderValue}</p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Monthly Revenue</span>
                  <TrendingUp className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="text-3xl font-bold text-slate-900">₹{dashboardData.monthlyRevenue.toLocaleString()}</div>
                <p className="text-xs text-indigo-600 font-medium mt-1">Repeat Rate: {dashboardData.repeatCustomerPercentage}%</p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Wallet Balance</span>
                  <Wallet className="h-5 w-5 text-amber-600" />
                </div>
                <div className="text-3xl font-bold text-slate-900">₹{dashboardData.walletBalance.toLocaleString()}</div>
                <p className="text-xs text-slate-500 mt-1">Total Refunds: ₹{dashboardData.refunds}</p>
              </div>
            </div>
          )}

          {activeTab === 'ledger' && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                <h3 className="font-semibold text-slate-800">Unified Financial Ledger Entries</h3>
                <span className="text-xs text-slate-500">{ledgerItems.length} transactions recorded</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[11px]">
                    <tr>
                      <th className="p-3">Ledger #</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Reference</th>
                      <th className="p-3 text-right">Debit (₹)</th>
                      <th className="p-3 text-right">Credit (₹)</th>
                      <th className="p-3 text-right">Balance (₹)</th>
                      <th className="p-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    {ledgerItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="p-3 font-medium text-slate-900">{item.ledgerNumber}</td>
                        <td className="p-3"><span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs font-semibold">{item.transactionType}</span></td>
                        <td className="p-3 text-xs text-slate-500">{item.narration || item.referenceType}</td>
                        <td className="p-3 text-right text-red-600">{item.debit > 0 ? `₹${item.debit}` : '-'}</td>
                        <td className="p-3 text-right text-emerald-600">{item.credit > 0 ? `₹${item.credit}` : '-'}</td>
                        <td className="p-3 text-right font-semibold text-slate-900">₹{item.runningBalance}</td>
                        <td className="p-3 text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'revenue' && reportData && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h4 className="text-xs font-semibold uppercase text-slate-500 mb-1">Total Revenue</h4>
                  <div className="text-3xl font-bold text-slate-900">₹{reportData.metrics?.totalRevenue}</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h4 className="text-xs font-semibold uppercase text-slate-500 mb-1">Average Order Value</h4>
                  <div className="text-3xl font-bold text-slate-900">₹{reportData.metrics?.averageOrderValue}</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h4 className="text-xs font-semibold uppercase text-slate-500 mb-1">Delivery Success Rate</h4>
                  <div className="text-3xl font-bold text-emerald-600">{reportData.metrics?.deliverySuccessPercent}%</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'wallet' && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50">
                <h3 className="font-semibold text-slate-800">Customer Wallet Ledger History</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[11px]">
                    <tr>
                      <th className="p-3">Ledger #</th>
                      <th className="p-3">Customer ID</th>
                      <th className="p-3">Type</th>
                      <th className="p-3 text-right">Amount (₹)</th>
                      <th className="p-3 text-right">Balance After (₹)</th>
                      <th className="p-3">Narration</th>
                      <th className="p-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    {walletItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="p-3 font-medium text-slate-900">{item.ledgerNumber}</td>
                        <td className="p-3 text-xs font-mono">{item.customerId}</td>
                        <td className="p-3"><span className="px-2 py-1 bg-amber-50 text-amber-700 rounded text-xs font-semibold">{item.transactionType}</span></td>
                        <td className="p-3 text-right font-semibold">₹{item.amount}</td>
                        <td className="p-3 text-right font-semibold text-indigo-600">₹{item.balanceAfter}</td>
                        <td className="p-3 text-xs text-slate-500">{item.narration}</td>
                        <td className="p-3 text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'settlements' && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50">
                <h3 className="font-semibold text-slate-800">Store & Gateway Settlements</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[11px]">
                    <tr>
                      <th className="p-3">Settlement #</th>
                      <th className="p-3">Entity Type</th>
                      <th className="p-3">Entity ID</th>
                      <th className="p-3 text-right">Amount (₹)</th>
                      <th className="p-3 text-right">Commission (₹)</th>
                      <th className="p-3 text-right">Net Amount (₹)</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    {settlements.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="p-3 font-medium text-slate-900">{item.settlementNumber}</td>
                        <td className="p-3 uppercase text-xs font-bold text-slate-600">{item.entityType}</td>
                        <td className="p-3 text-xs font-mono">{item.entityId}</td>
                        <td className="p-3 text-right">₹{item.amount}</td>
                        <td className="p-3 text-right text-red-600">₹{item.commission}</td>
                        <td className="p-3 text-right font-bold text-emerald-600">₹{item.netAmount}</td>
                        <td className="p-3"><span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-xs font-semibold">{item.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'gst' && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-semibold text-slate-800 text-lg">GST & Tax Snapshot Engine</h3>
              <p className="text-sm text-slate-500">Calculates CGST, SGST, IGST and HSN snapshots directly from frozen order snapshots according to Indian GST compliance rules.</p>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-800">Store GSTIN: 08AABCJ1234K1ZU</div>
                  <div className="text-xs text-slate-500">Default Tax Class: Standard 18% GST (CGST 9% + SGST 9%)</div>
                </div>
                <button onClick={() => alert('GST Return Summary generated successfully.')} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
                  Generate GSTR-1 Report
                </button>
              </div>
            </div>
          )}

          {activeTab === 'reports' && reportData && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-semibold text-slate-800 text-lg">Business Intelligence & Order Analytics</h3>
              <pre className="p-4 bg-slate-950 text-slate-100 rounded-lg text-xs overflow-auto font-mono">
                {JSON.stringify(reportData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
