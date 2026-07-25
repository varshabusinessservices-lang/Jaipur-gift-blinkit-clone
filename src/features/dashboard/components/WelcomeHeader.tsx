import { WelcomeHeaderData } from '../types/dashboard.types';
import { Clock, RefreshCw, Server, Store, Zap, ShieldCheck } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface WelcomeHeaderProps {
  data?: WelcomeHeaderData;
  isLoading: boolean;
  onRefresh: () => void;
  isRefetching: boolean;
  lastRefreshedAt: string;
}

export function WelcomeHeader({
  data,
  isLoading,
  onRefresh,
  isRefetching,
  lastRefreshedAt,
}: WelcomeHeaderProps) {
  if (isLoading || !data) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm animate-pulse space-y-4">
        <div className="h-6 w-64 bg-slate-200 rounded"></div>
        <div className="flex gap-4">
          <div className="h-4 w-32 bg-slate-200 rounded"></div>
          <div className="h-4 w-32 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  const isMock = data.dataMode === 'MOCK';

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-xl p-6 shadow-md relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              Welcome back, {data.adminName}
            </h1>
            <span
              className={cn(
                'px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border',
                isMock
                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                  : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
              )}
            >
              {isMock ? 'Demo Mock Data' : 'Live Mode'}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              API: {data.apiStatus}
            </span>
          </div>

          <p className="text-xs md:text-sm text-slate-300 mt-1 flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              {data.currentDate} ({data.timezone})
            </span>
            <span className="text-slate-500">•</span>
            <span className="flex items-center gap-1">
              <Store className="w-3.5 h-3.5 text-indigo-400" />
              Store: Single Store (Jaipur Hub)
            </span>
          </p>
        </div>

        {/* Operational Indicators & Action */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/80 rounded-lg px-3 py-2 text-xs space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" /> Production Load:
              </span>
              <span className="font-bold text-amber-300">{data.productionLoad}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" /> Dispatch:
              </span>
              <span className="font-semibold text-emerald-300">{data.deliveryAvailability}</span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <button
              onClick={onRefresh}
              disabled={isRefetching}
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-60 cursor-pointer"
            >
              <RefreshCw className={cn('w-3.5 h-3.5', isRefetching && 'animate-spin')} />
              Refresh
            </button>
            {lastRefreshedAt && (
              <span className="text-[10px] text-slate-400">Refreshed {lastRefreshedAt}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
