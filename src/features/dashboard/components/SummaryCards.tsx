import { DashboardSummaryData, SummaryMetric } from '../types/dashboard.types';
import { formatCurrency, formatNumber, formatPercent } from '../utils/formatters';
import {
  ShoppingCart,
  IndianRupee,
  Users,
  Package,
  Clock,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Truck,
  AlertTriangle,
  UserPlus,
  Repeat,
  Palette,
  Sparkles,
  RotateCcw,
  Boxes,
  Moon,
  Info,
} from 'lucide-react';
import { cn } from '../../../lib/utils';

interface SummaryCardsProps {
  summary?: DashboardSummaryData;
  isLoading: boolean;
}

interface CardConfig {
  key: keyof DashboardSummaryData;
  icon: React.ReactNode;
  iconBg: string;
  isCurrency?: boolean;
  highlightRing?: boolean;
  tooltipText: string;
}

const cardConfigs: CardConfig[] = [
  {
    key: 'totalOrders',
    icon: <ShoppingCart className="w-4 h-4 text-blue-600" />,
    iconBg: 'bg-blue-50',
    tooltipText: 'Total number of orders placed in the selected date range.',
  },
  {
    key: 'grossSales',
    icon: <IndianRupee className="w-4 h-4 text-emerald-600" />,
    iconBg: 'bg-emerald-50',
    isCurrency: true,
    tooltipText: 'Sum of order item totals before discounts and refunds.',
  },
  {
    key: 'netSales',
    icon: <IndianRupee className="w-4 h-4 text-indigo-600" />,
    iconBg: 'bg-indigo-50',
    isCurrency: true,
    tooltipText: 'Gross sales minus discounts and completed refunds, excluding cancelled orders.',
  },
  {
    key: 'avgOrderValue',
    icon: <TrendingUp className="w-4 h-4 text-purple-600" />,
    iconBg: 'bg-purple-50',
    isCurrency: true,
    tooltipText: 'Net sales divided by eligible non-cancelled orders.',
  },
  {
    key: 'newCustomers',
    icon: <UserPlus className="w-4 h-4 text-teal-600" />,
    iconBg: 'bg-teal-50',
    tooltipText: 'First-time ordering customers during the selected period.',
  },
  {
    key: 'repeatCustomers',
    icon: <Repeat className="w-4 h-4 text-cyan-600" />,
    iconBg: 'bg-cyan-50',
    tooltipText: 'Customers with 2+ completed orders.',
  },
  {
    key: 'pendingPersonalisedOrders',
    icon: <Sparkles className="w-4 h-4 text-amber-600" />,
    iconBg: 'bg-amber-50',
    highlightRing: true,
    tooltipText: 'Personalised orders requiring image review, cropping, or text confirmation.',
  },
  {
    key: 'designApprovalPending',
    icon: <Palette className="w-4 h-4 text-indigo-600" />,
    iconBg: 'bg-indigo-50',
    tooltipText: 'Digital proofs sent to WhatsApp/email awaiting client approval.',
  },
  {
    key: 'inProduction',
    icon: <Package className="w-4 h-4 text-amber-600" />,
    iconBg: 'bg-amber-50',
    tooltipText: 'Orders currently printing, engraving, or assembling in workshop.',
  },
  {
    key: 'readyForDispatch',
    icon: <Boxes className="w-4 h-4 text-blue-600" />,
    iconBg: 'bg-blue-50',
    tooltipText: 'Packed orders ready for delivery rider pickup.',
  },
  {
    key: 'outForDelivery',
    icon: <Truck className="w-4 h-4 text-sky-600" />,
    iconBg: 'bg-sky-50',
    tooltipText: 'Hyperlocal orders currently on the road with delivery boys.',
  },
  {
    key: 'delivered',
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
    iconBg: 'bg-emerald-50',
    tooltipText: 'Orders successfully delivered to customer.',
  },
  {
    key: 'cancelled',
    icon: <XCircle className="w-4 h-4 text-rose-600" />,
    iconBg: 'bg-rose-50',
    tooltipText: 'Cancelled or payment failed orders.',
  },
  {
    key: 'replacementRequests',
    icon: <RotateCcw className="w-4 h-4 text-orange-600" />,
    iconBg: 'bg-orange-50',
    tooltipText: 'Customer requests for product replacement or re-print.',
  },
  {
    key: 'lowStockProducts',
    icon: <AlertTriangle className="w-4 h-4 text-red-600" />,
    iconBg: 'bg-red-50',
    tooltipText: 'Products or raw printing materials below safety threshold.',
  },
  {
    key: 'overnightOrders',
    icon: <Moon className="w-4 h-4 text-indigo-600" />,
    iconBg: 'bg-indigo-50',
    tooltipText: 'Orders placed after production closing time (e.g., 8:00 PM).',
  },
];

export function SummaryCards({ summary, isLoading }: SummaryCardsProps) {
  if (isLoading || !summary) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 16 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm animate-pulse space-y-3"
          >
            <div className="flex justify-between items-center">
              <div className="h-3 w-24 bg-slate-200 rounded" />
              <div className="h-7 w-7 bg-slate-100 rounded-lg" />
            </div>
            <div className="h-6 w-20 bg-slate-200 rounded" />
            <div className="h-3 w-32 bg-slate-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cardConfigs.map((cfg) => {
        const metric: SummaryMetric | undefined = summary[cfg.key];
        if (!metric) return null;

        const displayValue = cfg.isCurrency
          ? formatCurrency(metric.current)
          : formatNumber(Number(metric.current));

        const hasComparison = metric.changePercent !== null;

        return (
          <div
            key={cfg.key}
            className={cn(
              'bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow relative group',
              cfg.highlightRing && 'ring-2 ring-amber-500/80 border-amber-300'
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-600 line-clamp-1">
                  {metric.label}
                </span>
                <div className="relative group/tooltip">
                  <Info className="w-3 h-3 text-slate-400 hover:text-slate-600 cursor-help" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/tooltip:block w-48 bg-slate-900 text-white text-[11px] p-2 rounded shadow-lg z-30 pointer-events-none">
                    {cfg.tooltipText}
                  </div>
                </div>
              </div>

              <div
                className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                  cfg.iconBg
                )}
              >
                {cfg.icon}
              </div>
            </div>

            <div className="mt-2">
              <div className="text-xl font-bold text-slate-900 tracking-tight">
                {displayValue}
              </div>

              <div className="mt-1 flex items-center gap-2 text-[11px]">
                {hasComparison ? (
                  <>
                    <span
                      className={cn(
                        'font-bold px-1.5 py-0.5 rounded',
                        metric.trend === 'positive' && 'bg-emerald-50 text-emerald-700',
                        metric.trend === 'negative' && 'bg-rose-50 text-rose-700',
                        metric.trend === 'neutral' && 'bg-slate-100 text-slate-700'
                      )}
                    >
                      {formatPercent(metric.changePercent)}
                    </span>
                    <span className="text-slate-400 truncate">{metric.comparisonLabel}</span>
                  </>
                ) : (
                  <span className="text-slate-400 italic">No comparison data</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
