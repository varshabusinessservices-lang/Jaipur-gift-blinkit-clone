import React, { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/axios';
import { Search, Download, RefreshCcw, Calendar, Filter } from 'lucide-react';
import { StatCard } from '../../../components/common/StatCard';

interface GenericReportTablePageProps {
  title: string;
  description: string;
  endpoint: string;
  reportType: string;
}

export function GenericReportTablePage({ title, description, endpoint, reportType }: GenericReportTablePageProps) {
  const [data, setData] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState('30days');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get(endpoint);
      const json = res.data.success ? res.data.data : res.data;
      setData(json.rows || []);
      setSummary(json.summary || {});
    } catch (err: any) {
      setError(err.message || 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [endpoint]);

  const handleExportExcel = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const res = await apiClient.post('/admin/reports/export', {
        reportType,
        filters: { dateRange }
      }, {
        responseType: 'blob'
      });

      // Extract filename from Content-Disposition header if present
      const disposition = res.headers['content-disposition'];
      let filename = `${reportType}-report-${new Date().toISOString().split('T')[0]}.xlsx`;
      if (disposition && disposition.includes('filename=')) {
        const match = disposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) {
          filename = match[1];
        }
      }

      const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert('Export failed: ' + (err.message || 'Unknown error'));
    } finally {
      setExporting(false);
    }
  };

  const filteredData = data.filter(item => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return Object.values(item).some(val => 
      String(val).toLowerCase().includes(searchLower)
    );
  });

  const headers = data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchData} className="p-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm" title="Refresh">
            <RefreshCcw className="h-4 w-4" />
          </button>
          <button
            onClick={handleExportExcel}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
          >
            <Download className="h-4 w-4" /> {exporting ? 'Preparing Excel...' : 'Export Excel'}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && Object.keys(summary).length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(summary).map(([key, value]) => {
            const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            return (
              <StatCard
                key={key}
                title={formattedKey}
                value={String(value)}
                icon={<div className="h-5 w-5 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-bold text-indigo-600">📊</div>}
              />
            );
          })}
        </div>
      )}

      {/* Filters & Search Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between gap-4 items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search report records..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Calendar className="h-4 w-4 text-slate-400" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="thisMonth">This Month</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {headers.map(h => (
                  <th key={h} className="py-3 px-4 whitespace-nowrap">{h.replace(/([A-Z])/g, ' $1')}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={Math.max(headers.length, 1)} className="py-12 text-center text-slate-500">
                    Loading report data...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={Math.max(headers.length, 1)} className="py-12 text-center text-red-500">
                    Error: {error}
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={Math.max(headers.length, 1)} className="py-12 text-center text-slate-500">
                    No report records found for current filters.
                  </td>
                </tr>
              ) : (
                filteredData.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    {headers.map(h => {
                      const val = item[h];
                      let displayVal = '-';
                      if (val !== null && val !== undefined) {
                        displayVal = String(val);
                      }
                      return (
                        <td key={h} className="py-3 px-4 max-w-[200px] truncate" title={displayVal}>
                          {displayVal}
                        </td>
                      );
                    })}
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
