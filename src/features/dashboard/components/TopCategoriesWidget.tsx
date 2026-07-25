import { TopCategoryItem } from '../types/dashboard.types';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { Layers } from 'lucide-react';

interface TopCategoriesWidgetProps {
  data?: TopCategoryItem[];
  isLoading: boolean;
}

export function TopCategoriesWidget({ data, isLoading }: TopCategoriesWidgetProps) {
  if (isLoading || !data) {
    return (
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="h-4 w-40 bg-slate-200 rounded animate-pulse" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-10 bg-slate-50 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600" />
          Top Categories
        </h3>
        <span className="text-xs text-slate-400 font-semibold">Sales Share</span>
      </div>

      {data.length === 0 ? (
        <div className="py-6 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-lg">
          No category sales recorded yet.
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((cat) => (
            <div key={cat.id} className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-800">{cat.name}</span>
                <span className="text-slate-900 font-bold">
                  {formatCurrency(cat.revenue)} ({cat.salesSharePercent.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(cat.salesSharePercent, 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400">
                {cat.productCount} products • {formatNumber(cat.unitsSold)} units sold
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
