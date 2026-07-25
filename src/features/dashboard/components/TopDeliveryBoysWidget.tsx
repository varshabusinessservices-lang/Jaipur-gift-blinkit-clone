import { TopDeliveryBoyItem } from '../types/dashboard.types';
import { formatCurrency } from '../utils/formatters';
import { Truck, Star, UserCheck } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface TopDeliveryBoysWidgetProps {
  data?: TopDeliveryBoyItem[];
  isLoading: boolean;
}

export function TopDeliveryBoysWidget({ data, isLoading }: TopDeliveryBoysWidgetProps) {
  if (isLoading || !data) {
    return (
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="h-4 w-40 bg-slate-200 rounded animate-pulse" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 bg-slate-50 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Truck className="w-4 h-4 text-indigo-600" />
          Delivery Riders
        </h3>
        <span className="text-xs text-slate-400 font-semibold">Performance</span>
      </div>

      {data.length === 0 ? (
        <div className="py-6 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-lg">
          No delivery riders active in this period.
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((rider) => (
            <div
              key={rider.id}
              className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0 flex items-center justify-center font-bold text-slate-600">
                  {rider.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-slate-900 truncate">{rider.name}</p>
                    <span
                      className={cn(
                        'w-2 h-2 rounded-full shrink-0',
                        rider.availability === 'AVAILABLE' && 'bg-emerald-500',
                        rider.availability === 'ON_DELIVERY' && 'bg-amber-500 animate-pulse',
                        rider.availability === 'OFFLINE' && 'bg-slate-300'
                      )}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>{rider.deliveredOrders} Delivered</span>
                    <span>•</span>
                    <span className="text-emerald-600 font-semibold">{rider.onTimePercent}% On-Time</span>
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="flex items-center justify-end gap-1 font-bold text-slate-800">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                  {rider.avgRating.toFixed(1)}
                </div>
                {rider.cashPending > 0 && (
                  <p className="text-[10px] text-amber-600 font-semibold">
                    COD: {formatCurrency(rider.cashPending)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
