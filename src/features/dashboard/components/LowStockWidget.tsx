import { LowStockItem } from '../types/dashboard.types';
import { AlertTriangle, Boxes } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface LowStockWidgetProps {
  data?: LowStockItem[];
  isLoading: boolean;
}

export function LowStockWidget({ data, isLoading }: LowStockWidgetProps) {
  if (isLoading || !data) {
    return (
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="h-4 w-40 bg-slate-200 rounded animate-pulse" />
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
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
          <AlertTriangle className="w-4 h-4 text-red-600" />
          Low Stock Raw Materials
        </h3>
        <span className="text-xs text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded">
          {data.length} Items Low
        </span>
      </div>

      {data.length === 0 ? (
        <div className="py-6 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-lg">
          All printing materials and blanks are sufficiently stocked.
        </div>
      ) : (
        <div className="space-y-2.5">
          {data.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 text-xs"
            >
              <div>
                <p className="font-bold text-slate-900">{item.title}</p>
                <p className="text-[10px] text-slate-400 font-mono">
                  SKU: {item.sku} • Threshold: {item.lowStockThreshold}
                </p>
              </div>

              <div className="text-right">
                <span
                  className={cn(
                    'px-2 py-0.5 rounded text-[10px] font-extrabold uppercase',
                    item.status === 'OUT_OF_STOCK'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  )}
                >
                  {item.availableStock} in stock
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
