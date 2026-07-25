import { OvernightOrdersData } from '../types/dashboard.types';
import { Moon, Clock, Sparkles } from 'lucide-react';

interface OvernightOrdersWidgetProps {
  data?: OvernightOrdersData;
  isLoading: boolean;
}

export function OvernightOrdersWidget({ data, isLoading }: OvernightOrdersWidgetProps) {
  if (isLoading || !data) {
    return (
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="h-4 w-40 bg-slate-200 rounded animate-pulse" />
        <div className="h-16 bg-slate-50 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-5 rounded-xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Moon className="w-4 h-4 text-amber-300" />
          <h3 className="text-sm font-bold text-white">Overnight Production Queue</h3>
        </div>
        <p className="text-xs text-slate-300">
          Orders accepted 24x7 while workshop was closed (8:00 PM - 8:00 AM)
        </p>
      </div>

      <div className="flex items-center gap-4 text-xs">
        <div className="bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-center">
          <p className="text-[10px] text-slate-400 uppercase font-semibold">Total Pending</p>
          <p className="text-lg font-extrabold text-amber-300">{data.count} Orders</p>
        </div>

        <div className="bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-center">
          <p className="text-[10px] text-slate-400 uppercase font-semibold">Morning Est.</p>
          <p className="text-lg font-extrabold text-emerald-300">
            ~{data.estimatedMorningWorkloadMin} mins
          </p>
        </div>
      </div>
    </div>
  );
}
