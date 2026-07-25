import { RecentOrderItem } from '../types/dashboard.types';
import { formatCurrency, formatRelativeTime } from '../utils/formatters';
import { ShoppingBag, Eye, Sparkles, Clock, CheckCircle, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../../lib/utils';

interface RecentOrdersTableProps {
  orders?: RecentOrderItem[];
  isLoading: boolean;
}

export function RecentOrdersTable({ orders, isLoading }: RecentOrdersTableProps) {
  if (isLoading || !orders) {
    return (
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="h-4 w-40 bg-slate-200 rounded animate-pulse" />
        <div className="h-48 bg-slate-50 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-indigo-600" />
            Recent Orders
          </h3>
          <p className="text-xs text-slate-500">Real-time hyperlocal order dispatch queue</p>
        </div>
        <Link
          to="/sales/orders"
          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          View All Orders →
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="p-8 text-center text-slate-400 text-xs">
          No recent orders found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] uppercase tracking-wider font-semibold text-slate-500 border-b border-slate-100">
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Promise</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    {ord.orderNumber}
                    <span className="block text-[10px] font-normal text-slate-400">
                      {formatRelativeTime(ord.createdAt)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-700 font-medium">
                    {ord.customerNameMasked}
                  </td>
                  <td className="py-3 px-4">
                    {ord.isPersonalised ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 inline-flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5 text-amber-600" /> Personalised
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                        Regular
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-600">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-blue-50 text-blue-700 font-bold border border-blue-100">
                      {ord.deliveryPromise.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {formatCurrency(ord.totalAmount)}
                    <span className="block text-[10px] font-normal text-emerald-600 font-semibold">
                      {ord.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={cn(
                        'px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide',
                        ord.orderStatus === 'DELIVERED' && 'bg-emerald-100 text-emerald-800',
                        ord.orderStatus === 'IN_PRODUCTION' && 'bg-amber-100 text-amber-800',
                        ord.orderStatus === 'OUT_FOR_DELIVERY' && 'bg-sky-100 text-sky-800',
                        ord.orderStatus === 'REVIEW_PENDING' && 'bg-rose-100 text-rose-800'
                      )}
                    >
                      {ord.orderStatus.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      to={`/sales/orders/${ord.id}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 rounded font-semibold transition-colors"
                    >
                      <Eye className="w-3 h-3" /> View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
