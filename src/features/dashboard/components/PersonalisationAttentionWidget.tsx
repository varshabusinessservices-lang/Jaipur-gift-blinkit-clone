import { PersonalisationAttentionItem } from '../types/dashboard.types';
import { AlertTriangle, ArrowRight, ImageOff, Clock, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../../lib/utils';

interface PersonalisationAttentionWidgetProps {
  data?: PersonalisationAttentionItem[];
  isLoading: boolean;
}

export function PersonalisationAttentionWidget({
  data,
  isLoading,
}: PersonalisationAttentionWidgetProps) {
  if (isLoading || !data) {
    return (
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="h-4 w-48 bg-slate-200 rounded animate-pulse" />
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-16 bg-slate-50 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-amber-200/80 shadow-sm space-y-4 relative overflow-hidden">
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Personalisation Attention
          </h3>
          <p className="text-xs text-slate-500">Orders requiring photo/text/proof resolution</p>
        </div>
        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-extrabold text-xs">
          {data.length} Alerts
        </span>
      </div>

      {data.length === 0 ? (
        <div className="py-6 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-lg">
          No personalised orders currently blocked or awaiting attention.
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((item) => (
            <div
              key={item.id}
              className={cn(
                'p-3 rounded-lg border text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors',
                item.priority === 'URGENT'
                  ? 'bg-rose-50/60 border-rose-200'
                  : item.priority === 'HIGH'
                  ? 'bg-amber-50/60 border-amber-200'
                  : 'bg-slate-50 border-slate-200'
              )}
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-slate-900">{item.orderNumber}</span>
                  <span
                    className={cn(
                      'px-2 py-0.2 rounded text-[10px] font-extrabold uppercase',
                      item.priority === 'URGENT' && 'bg-rose-200 text-rose-900',
                      item.priority === 'HIGH' && 'bg-amber-200 text-amber-900',
                      item.priority === 'MEDIUM' && 'bg-blue-100 text-blue-900'
                    )}
                  >
                    {item.priority}
                  </span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {item.ageInHours.toFixed(1)}h pending
                  </span>
                </div>
                <p className="font-bold text-slate-800">{item.issueLabel}</p>
                <p className="text-slate-600 text-[11px] line-clamp-1">{item.summary}</p>
              </div>

              <Link
                to={item.actionRoute}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded font-bold text-xs shrink-0 flex items-center gap-1 transition-colors"
              >
                Resolve <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
