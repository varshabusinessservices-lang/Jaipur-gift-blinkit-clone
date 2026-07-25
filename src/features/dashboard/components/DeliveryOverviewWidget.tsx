import { DeliveryOverviewData } from '../types/dashboard.types';
import { Truck, CheckCircle2, Clock, AlertTriangle, Send } from 'lucide-react';

interface DeliveryOverviewWidgetProps {
  data?: DeliveryOverviewData;
  isLoading: boolean;
}

export function DeliveryOverviewWidget({ data, isLoading }: DeliveryOverviewWidgetProps) {
  if (isLoading || !data) {
    return (
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="h-4 w-40 bg-slate-200 rounded animate-pulse" />
        <div className="h-20 bg-slate-50 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Truck className="w-4 h-4 text-indigo-600" />
            Hyperlocal Delivery Promises
          </h3>
          <p className="text-xs text-slate-500">Dispatch queue and promise SLA commitments</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-blue-50/80 border border-blue-100 rounded-lg p-3">
          <p className="text-blue-700 font-semibold">Same-Day Confirmed</p>
          <p className="text-lg font-bold text-blue-900 mt-0.5">{data.sameDayConfirmed}</p>
        </div>

        <div className="bg-amber-50/80 border border-amber-100 rounded-lg p-3">
          <p className="text-amber-700 font-semibold">Same-Day Review</p>
          <p className="text-lg font-bold text-amber-900 mt-0.5">{data.sameDayReview}</p>
        </div>

        <div className="bg-purple-50/80 border border-purple-100 rounded-lg p-3">
          <p className="text-purple-700 font-semibold">Next-Day</p>
          <p className="text-lg font-bold text-purple-900 mt-0.5">{data.nextDay}</p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <p className="text-slate-600 font-semibold">Scheduled / Store Pickup</p>
          <p className="text-lg font-bold text-slate-900 mt-0.5">{data.scheduled}</p>
        </div>
      </div>
    </div>
  );
}
