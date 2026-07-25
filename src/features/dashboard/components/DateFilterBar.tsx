import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DashboardDateRange, DashboardFilter } from '../types/dashboard.types';
import { Calendar, Filter } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { toast } from 'sonner';

const filterOptions: { label: string; range: DashboardDateRange }[] = [
  { label: 'Today', range: 'today' },
  { label: '3 Days', range: '3d' },
  { label: '7 Days', range: '7d' },
  { label: '15 Days', range: '15d' },
  { label: '30 Days', range: '30d' },
  { label: 'Custom', range: 'custom' },
];

interface DateFilterBarProps {
  filter: DashboardFilter;
  onChange: (newFilter: DashboardFilter) => void;
}

export function DateFilterBar({ filter, onChange }: DateFilterBarProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [customFrom, setCustomFrom] = useState(filter.from || '');
  const [customTo, setCustomTo] = useState(filter.to || '');
  const [isCustomOpen, setIsCustomOpen] = useState(filter.range === 'custom');

  useEffect(() => {
    setIsCustomOpen(filter.range === 'custom');
  }, [filter.range]);

  const handleSelectRange = (range: DashboardDateRange) => {
    if (range === 'custom') {
      setIsCustomOpen(true);
      return;
    }

    setIsCustomOpen(false);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('range', range);
    newParams.delete('from');
    newParams.delete('to');
    setSearchParams(newParams, { replace: true });

    onChange({
      range,
      timezone: 'Asia/Kolkata',
    });
  };

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customFrom || !customTo) {
      toast.error('Please select both start and end dates');
      return;
    }

    const fromDate = new Date(customFrom);
    const toDate = new Date(customTo);

    if (fromDate > toDate) {
      toast.error('Start date cannot be after end date');
      return;
    }

    const diffDays = Math.ceil(Math.abs(toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays > 365) {
      toast.error('Custom date range cannot exceed 365 days');
      return;
    }

    const newParams = new URLSearchParams(searchParams);
    newParams.set('range', 'custom');
    newParams.set('from', customFrom);
    newParams.set('to', customTo);
    setSearchParams(newParams, { replace: true });

    onChange({
      range: 'custom',
      from: customFrom,
      to: customTo,
      timezone: 'Asia/Kolkata',
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
        <Filter className="w-4 h-4 text-indigo-600" />
        <span>Date Range (Asia/Kolkata):</span>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto">
        {filterOptions.map((opt) => {
          const isActive = filter.range === opt.range;
          return (
            <button
              key={opt.range}
              onClick={() => handleSelectRange(opt.range)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {isCustomOpen && (
        <form
          onSubmit={handleApplyCustom}
          className="w-full md:w-auto flex items-center gap-2 flex-wrap pt-2 md:pt-0 border-t md:border-t-0 border-slate-100"
        >
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="bg-transparent text-slate-800 text-xs focus:outline-none"
            />
          </div>
          <span className="text-xs text-slate-400">to</span>
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="bg-transparent text-slate-800 text-xs focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Apply
          </button>
        </form>
      )}
    </div>
  );
}
