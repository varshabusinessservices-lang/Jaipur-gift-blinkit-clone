import { TopProductItem } from '../types/dashboard.types';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { Award, Package, Sparkles, TrendingUp } from 'lucide-react';

interface TopProductsWidgetProps {
  data?: TopProductItem[];
  isLoading: boolean;
}

export function TopProductsWidget({ data, isLoading }: TopProductsWidgetProps) {
  if (isLoading || !data) {
    return (
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="h-4 w-40 bg-slate-200 rounded animate-pulse" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 bg-slate-50 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            Top 10 Products
          </h3>
          <span className="text-xs text-slate-400 font-semibold">By Net Revenue</span>
        </div>

        {data.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-lg">
            No product sales data recorded yet.
          </div>
        ) : (
          <div className="space-y-3">
            {data.slice(0, 5).map((item, idx) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-5 text-center text-xs font-bold text-slate-400 shrink-0">
                    #{idx + 1}
                  </span>
                  <div className="w-9 h-9 rounded-md bg-slate-200 shrink-0 flex items-center justify-center text-slate-500 overflow-hidden">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-xs font-bold text-slate-900 truncate">{item.title}</p>
                      {item.isBestSeller && (
                        <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded text-[10px] font-extrabold flex items-center gap-0.5 shrink-0">
                          <Award className="w-2.5 h-2.5 text-amber-600" /> Best Seller
                        </span>
                      )}
                      {item.isPersonalised && (
                        <span className="px-1.5 py-0.2 bg-indigo-100 text-indigo-800 rounded text-[10px] font-bold flex items-center gap-0.5 shrink-0">
                          <Sparkles className="w-2.5 h-2.5 text-indigo-600" /> Perso
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      SKU: {item.sku} • {formatNumber(item.unitsSold)} units ({item.ordersCount} orders)
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-slate-900">{formatCurrency(item.netSales)}</p>
                  <p className="text-[10px] text-slate-400">Net Revenue</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
