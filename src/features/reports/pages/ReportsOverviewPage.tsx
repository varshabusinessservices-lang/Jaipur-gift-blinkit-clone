import React, { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/axios';
import { RefreshCcw, Download, Calendar, ArrowUpRight, TrendingUp, DollarSign, ShoppingBag, ShieldCheck } from 'lucide-react';
import { StatCard } from '../../../components/common/StatCard';
import { useNavigate } from 'react-router-dom';

export function ReportsOverviewPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchOverview = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/admin/reports/overview');
      const json = res.data.success ? res.data.data : res.data;
      setData(json);
    } catch (err: any) {
      setError(err.message || 'Failed to load overview');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleExportAll = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const res = await apiClient.post('/admin/reports/export', {
        reportType: 'overview',
        filters: {}
      }, { responseType: 'blob' });

      const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `overview-report-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert('Export failed');
    } finally {
      setExporting(false);
    }
  };

  const summary = data?.summary || {};

  const reportSections = [
    { title: 'Sales Reports', desc: 'Gross sales, net sales, discounts & trends', path: 'sales', icon: DollarSign, color: 'bg-emerald-50 text-emerald-600' },
    { title: 'Order Reports', desc: 'Order status, sources & customer fulfillment', path: 'orders', icon: ShoppingBag, color: 'bg-indigo-50 text-indigo-600' },
    { title: 'Payment Reports', desc: 'Gateways, COD, online & reconciliation', path: 'payments', icon: TrendingUp, color: 'bg-blue-50 text-blue-600' },
    { title: 'Wallet Reports', desc: 'Liabilities, balances & topups', path: 'wallet', icon: ShieldCheck, color: 'bg-violet-50 text-violet-600' },
    { title: 'Reward Reports', desc: 'Coin earnings, cooling & conversions', path: 'rewards', icon: DollarSign, color: 'bg-amber-50 text-amber-600' },
    { title: 'Referral Reports', desc: 'Registrations, qualifications & credits', path: 'referrals', icon: ArrowUpRight, color: 'bg-rose-50 text-rose-600' },
    { title: 'Refund Reports', desc: 'Refund amounts, restorations & reasons', path: 'refunds', icon: RefreshCcw, color: 'bg-cyan-50 text-cyan-600' },
    { title: 'Customer Reports', desc: 'Acquisition, active spenders & balances', path: 'customers', icon: ShoppingBag, color: 'bg-purple-50 text-purple-600' },
    { title: 'Delivery Reports', desc: 'Zones, delivery boys & fulfillment duration', path: 'delivery', icon: TrendingUp, color: 'bg-orange-50 text-orange-600' },
    { title: 'Tax Reports', desc: 'GST breakdown, CGST, SGST & IGST', path: 'taxes', icon: ShieldCheck, color: 'bg-teal-50 text-teal-600' },
    { title: 'Export History', desc: 'Audit logs of generated spreadsheets', path: 'exports', icon: Download, color: 'bg-slate-100 text-slate-700' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Enterprise Reports & BI</h1>
          <p className="text-sm text-slate-500">Comprehensive real-time financial, operational and compliance analytics</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchOverview} className="p-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm" title="Refresh">
            <RefreshCcw className="h-4 w-4" />
          </button>
          <button
            onClick={handleExportAll}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
          >
            <Download className="h-4 w-4" /> {exporting ? 'Preparing Excel...' : 'Export Excel Overview'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500">Loading enterprise metrics...</div>
      ) : error ? (
        <div className="p-12 text-center text-red-500">Error loading metrics: {error}</div>
      ) : (
        <>
          {/* Key Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Gross Sales" value={`₹${summary.grossSales || '0.00'}`} icon={<DollarSign className="h-5 w-5" />} />
            <StatCard title="Net Sales" value={`₹${summary.netSales || '0.00'}`} icon={<TrendingUp className="h-5 w-5" />} />
            <StatCard title="Total Orders" value={summary.totalOrders || 0} icon={<ShoppingBag className="h-5 w-5" />} />
            <StatCard title="Average Order Value" value={`₹${summary.averageOrderValue || '0.00'}`} icon={<ArrowUpRight className="h-5 w-5" />} />
            <StatCard title="Online Collected" value={`₹${summary.onlinePaymentCollected || '0.00'}`} icon={<ShieldCheck className="h-5 w-5" />} />
            <StatCard title="COD Collected" value={`₹${summary.codCollected || '0.00'}`} icon={<DollarSign className="h-5 w-5" />} />
            <StatCard title="Wallet Liability" value={`₹${summary.walletLiability || '0.00'}`} icon={<ShieldCheck className="h-5 w-5" />} />
            <StatCard title="Reward Liability" value={`₹${summary.rewardLiability || '0.00'}`} icon={<TrendingUp className="h-5 w-5" />} />
          </div>

          {/* Report Modules Navigation Grid */}
          <div className="pt-4">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Detailed Report Modules</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reportSections.map(sec => {
                const Icon = sec.icon;
                return (
                  <div
                    key={sec.path}
                    onClick={() => navigate(sec.path)}
                    className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer flex items-start gap-4 group"
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${sec.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">{sec.title}</h3>
                        <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{sec.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
