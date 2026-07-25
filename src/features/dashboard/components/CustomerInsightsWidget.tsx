import { CustomerInsightsData } from '../types/dashboard.types';
import { Users, UserPlus, Repeat, UserCheck, ShoppingCart } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { formatDate } from '../utils/formatters';

interface CustomerInsightsWidgetProps {
  data?: CustomerInsightsData;
  isLoading: boolean;
}

export function CustomerInsightsWidget({ data, isLoading }: CustomerInsightsWidgetProps) {
  if (isLoading || !data) {
    return (
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="h-4 w-40 bg-slate-200 rounded animate-pulse" />
        <div className="h-40 bg-slate-50 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" />
            Customer Insights
          </h3>
          <p className="text-xs text-slate-500">Acquisition vs Retention performance</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <UserPlus className="w-3.5 h-3.5 text-teal-600" /> New Customers
          </div>
          <p className="text-lg font-bold text-slate-900 mt-1">{data.newCustomers}</p>
        </div>

        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <Repeat className="w-3.5 h-3.5 text-cyan-600" /> Repeat Customers
          </div>
          <p className="text-lg font-bold text-slate-900 mt-1">{data.repeatCustomers}</p>
        </div>

        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <UserCheck className="w-3.5 h-3.5 text-indigo-600" /> Returning Rate
          </div>
          <p className="text-lg font-bold text-slate-900 mt-1">
            {data.returningCustomerRate.toFixed(1)}%
          </p>
        </div>

        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <ShoppingCart className="w-3.5 h-3.5 text-purple-600" /> Avg Orders/Customer
          </div>
          <p className="text-lg font-bold text-slate-900 mt-1">
            {data.avgOrdersPerCustomer.toFixed(1)}
          </p>
        </div>
      </div>

      {data.points && data.points.length > 0 && (
        <div className="h-[180px] w-full pt-2">
          <p className="text-xs font-semibold text-slate-700 mb-2">Acquisition Trend</p>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.points} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <XAxis dataKey="period" tickFormatter={(v) => formatDate(v)} tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-slate-900 text-white p-2 rounded shadow text-xs">
                        <p className="font-bold">{formatDate(label)}</p>
                        <p className="text-teal-300">New: {payload[0]?.value}</p>
                        <p className="text-cyan-300">Repeat: {payload[1]?.value}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area type="monotone" dataKey="newCustomers" stroke="#0d9488" fill="#ccfbf1" />
              <Area type="monotone" dataKey="repeatCustomers" stroke="#0891b2" fill="#cff4fc" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
