import { OrderFunnelData } from '../types/dashboard.types';
import { Filter, ArrowRight, AlertCircle, RefreshCw, XCircle, ShieldAlert } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface OrderFunnelWidgetProps {
  data?: OrderFunnelData;
  isLoading: boolean;
}

export function OrderFunnelWidget({ data, isLoading }: OrderFunnelWidgetProps) {
  if (isLoading || !data) {
    return (
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="h-4 w-48 bg-slate-200 rounded animate-pulse" />
        <div className="h-24 bg-slate-50 rounded-lg animate-pulse" />
      </div>
    );
  }

  const { steps, exceptions } = data;
  const maxCount = Math.max(...steps.map((s) => s.count), 1);

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Filter className="w-4 h-4 text-indigo-600" />
            Order Lifecycle Funnel
          </h3>
          <p className="text-xs text-slate-500">
            Flow from initial order placement through production to final delivery
          </p>
        </div>

        {/* Exceptions pill bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-amber-600" /> On Hold: {exceptions.onHold}
          </span>
          <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-1">
            <XCircle className="w-3 h-3 text-rose-600" /> Cancelled: {exceptions.cancelled}
          </span>
          <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-purple-600" /> Failed Delivery: {exceptions.failedDelivery}
          </span>
          <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-orange-50 text-orange-800 border border-orange-200 flex items-center gap-1">
            <RefreshCw className="w-3 h-3 text-orange-600" /> Replacement: {exceptions.replacementRequested}
          </span>
        </div>
      </div>

      {/* Funnel Steps */}
      <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
        {steps.map((step, idx) => {
          const percent = Math.round((step.count / maxCount) * 100);
          const isHighlight = step.key === 'REVIEW' || step.key === 'PRODUCTION';

          return (
            <div
              key={step.key}
              className={cn(
                'rounded-lg p-2.5 border text-center relative flex flex-col justify-between transition-all',
                isHighlight
                  ? 'bg-amber-50/60 border-amber-200 shadow-sm'
                  : 'bg-slate-50 border-slate-200'
              )}
            >
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight line-clamp-1">
                  {step.label}
                </p>
                <p className="text-lg font-bold text-slate-900 mt-1">{step.count}</p>
              </div>

              <div className="mt-2 w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className={cn(
                    'h-full transition-all duration-500 rounded-full',
                    isHighlight ? 'bg-amber-500' : 'bg-indigo-600'
                  )}
                  style={{ width: `${Math.max(percent, 5)}%` }}
                />
              </div>

              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-slate-300">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
