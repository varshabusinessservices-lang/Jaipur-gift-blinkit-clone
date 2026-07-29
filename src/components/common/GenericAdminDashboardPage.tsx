import { apiClient } from '../../lib/axios';
import React, { useEffect, useState } from 'react';
import { RefreshCcw } from 'lucide-react';
import { StatCard } from './StatCard';

interface GenericAdminDashboardPageProps {
  title: string;
  description: string;
  endpoint: string;
}

export function GenericAdminDashboardPage({ title, description, endpoint }: GenericAdminDashboardPageProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get(endpoint);
      const json = res.data.success ? res.data.data : res.data;
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [endpoint]);

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
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500">Loading metrics...</div>
      ) : error ? (
        
        <div className="p-12 text-center">
          <div className="text-red-500 font-medium mb-4">Unable to load {title.split(' ')[0]} data.</div>
          {import.meta.env.DEV && (
            <div className="text-xs text-slate-400 max-w-lg mx-auto text-left bg-slate-50 p-4 rounded-lg overflow-auto">
              <div>Endpoint: {endpoint}</div>
              <div>Error: {error}</div>
            </div>
          )}
          <button onClick={fetchData} className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors">
            Retry
          </button>
        </div>
    
      ) : data ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(data).map(([key, value]) => {
            if (typeof value === 'object' || Array.isArray(value)) return null;
            const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            return (
              <StatCard
                key={key}
                title={formattedKey}
                value={String(value)}
                icon={<div className="h-5 w-5 bg-indigo-100 rounded-full" />}
              />
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center text-slate-500">No data available</div>
      )}
    </div>
  );
}
