import { apiClient } from '../../lib/axios';
import React, { useEffect, useState } from 'react';
import { Search, Download, RefreshCcw } from 'lucide-react';

interface GenericAdminTablePageProps {
  title: string;
  description: string;
  endpoint: string;
  dataKey?: string; // the key in the response that contains the array of data (e.g. 'transactions', 'relationships')
}

export function GenericAdminTablePage({ title, description, endpoint, dataKey }: GenericAdminTablePageProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get(endpoint);
      const json = res.data.success ? res.data.data : res.data;
      
      let fetchedData = [];
      if (dataKey && json[dataKey]) {
        fetchedData = json[dataKey];
      } else if (Array.isArray(json)) {
        fetchedData = json;
      } else {
        // Try to guess the data key
        const possibleArrays = Object.values(json).filter(val => Array.isArray(val));
        if (possibleArrays.length > 0) {
          fetchedData = possibleArrays[0] as any[];
        } else {
          fetchedData = [json]; // wrap in array
        }
      }
      setData(fetchedData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [endpoint]);

  const filteredData = data.filter(item => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return Object.values(item).some(val => 
      String(val).toLowerCase().includes(searchLower)
    );
  });

  const headers = data.length > 0 ? Object.keys(data[0]).filter(k => typeof data[0][k] !== 'object') : [];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchData} className="p-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
            <RefreshCcw className="h-4 w-4" />
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-sm font-medium transition-colors shadow-sm"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between gap-4 items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {headers.map(h => (
                  <th key={h} className="py-3 px-4 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={Math.max(headers.length, 1)} className="py-12 text-center text-slate-500">
                    Loading data...
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
                    No records found
                  </td>
                </tr>
              ) : (
                filteredData.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-slate-50 transition-colors">
                    {headers.map(h => {
                      const val = item[h];
                      let displayVal = '-';
                      if (val !== null && val !== undefined) {
                        if (typeof val === 'object') {
                          displayVal = JSON.stringify(val);
                        } else {
                          displayVal = String(val);
                        }
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
