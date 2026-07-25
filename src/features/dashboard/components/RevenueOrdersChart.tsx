import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { RevenueOrdersData } from '../types/dashboard.types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { IndianRupee, ShoppingBag } from 'lucide-react';

interface RevenueOrdersChartProps {
  data?: RevenueOrdersData;
  isLoading: boolean;
}

export function RevenueOrdersChart({ data, isLoading }: RevenueOrdersChartProps) {
  if (isLoading || !data) {
    return (
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="h-4 w-40 bg-slate-200 rounded animate-pulse" />
        <div className="h-[280px] bg-slate-50 rounded-lg animate-pulse" />
      </div>
    );
  }

  const hasData = data.points && data.points.some((p) => p.netSales > 0 || p.orderCount > 0);

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-indigo-600" />
            Revenue vs Orders
          </h3>
          <p className="text-xs text-slate-500">
            Granularity: {data.granularity === 'day' ? 'Daily' : 'Weekly'}
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
            <span className="font-semibold text-slate-700">Net Sales (₹)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="font-semibold text-slate-700">Orders Count</span>
          </div>
        </div>
      </div>

      {!hasData ? (
        <div className="h-[280px] flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-lg text-slate-400 p-6 text-center">
          <ShoppingBag className="w-10 h-10 mb-2 stroke-1 text-slate-300" />
          <p className="text-sm font-semibold text-slate-600">No Sales Data Available</p>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            There are no completed orders or net sales recorded for the selected date range.
          </p>
        </div>
      ) : (
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.points} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />

              <XAxis
                dataKey="period"
                tickFormatter={(val) => formatDate(val)}
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                yAxisId="left"
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const netSalesVal = payload[0]?.value as number;
                    const ordersVal = payload[1]?.value as number;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-lg shadow-lg text-xs space-y-1 z-50">
                        <p className="font-bold border-b border-slate-700 pb-1 mb-1">
                          {formatDate(label)}
                        </p>
                        <p className="text-indigo-300">
                          Net Sales: <span className="font-bold text-white">{formatCurrency(netSalesVal)}</span>
                        </p>
                        <p className="text-emerald-300">
                          Orders: <span className="font-bold text-white">{ordersVal} orders</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Area
                yAxisId="left"
                type="monotone"
                dataKey="netSales"
                name="Net Sales"
                stroke="#4f46e5"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#revenueGrad)"
              />

              <Area
                yAxisId="right"
                type="monotone"
                dataKey="orderCount"
                name="Order Count"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#ordersGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
