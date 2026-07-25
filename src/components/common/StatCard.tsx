import { ReactNode } from "react";
import { cn } from "../../lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: string | number;
    isPositive?: boolean;
    isNeutral?: boolean;
    isNegative?: boolean;
    label?: string;
  };
  iconClassName?: string;
  className?: string;
}

export function StatCard({ title, value, icon, trend, iconClassName = "bg-indigo-50 text-indigo-600", className }: StatCardProps) {
  return (
    <div className={cn("rounded-xl border border-slate-200 bg-white p-6 shadow-sm", className)}>
      <div className="flex items-center gap-4 mb-4">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", iconClassName)}>
          {icon}
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
      </div>
      {trend && (
        <div 
          className={cn(
            "text-[10px] font-bold",
            trend.isPositive ? "text-green-600" : 
            trend.isNegative ? "text-red-500" : 
            "text-slate-400"
          )}
        >
          {trend.isPositive ? "+" : trend.isNegative ? "-" : ""}{trend.value} {trend.label || "from yesterday"}
        </div>
      )}
    </div>
  );
}
