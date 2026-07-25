import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { OrderHistoryData } from '../types/dashboard.types';
import { formatDate } from '../utils/formatters';
import { History } from 'lucide-react';

interface OrderHistoryChartProps {
  data?: OrderHistoryData;
  isLoading: boolean;
}

export function OrderHistoryChart({ data, isLoading }: OrderHistoryChartProps) {
  if (isLoading || !data) {
    return (
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="h-4 w-40 bg-slate-200 rounded animate-pulse" />
        <div className="h-[260px] bg-slate-50 rounded-lg animate-pulse" />
      </div>
    );
  }

  const hasData = data.points && data.points.some((p) => p.placed > 0 || p.delivered > 0);

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <History className="w-4 h-4 text-indigo-600" />
          Daily Order Volume History
        </h3>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500" /> Placed
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Delivered
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> Cancelled
          </span>
        </div>
      </div>

      {!hasData ? (
        <div className="h-[240px] flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-lg text-slate-400 p-6 text-center">
          <p className="text-sm font-semibold text-slate-600">No History Available</p>
          <p className="text-xs text-slate-400 mt-1">
            No order volume history recorded for this period.
          </p>
        </div>
      ) : (
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.points} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="period"
                tickFormatter={(val) => formatDate(val)}
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-lg shadow-lg text-xs space-y-1">
                        <p className="font-bold border-b border-slate-700 pb-1 mb-1">
                          {formatDate(label)}
                        </p>
                        {payload.map((p: any) => (
                          <p key={p.dataKey} style={{ color: p.color }}>
                            {p.name}: <span className="font-bold text-white">{p.value}</span>
                          </p>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="placed" name="Placed" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="delivered" name="Delivered" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="cancelled" name="Cancelled" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
