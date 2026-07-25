import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DashboardDateRange, DashboardFilter } from '../types/dashboard.types';
import {
  useDashboardOverview,
  useDashboardOrderFunnel,
  useDashboardTopProducts,
  useDashboardTopCategories,
  useDashboardTopDeliveryBoys,
  useDashboardPersonalisationAttention,
  useDashboardOvernightOrders,
  useDashboardLowStock,
} from '../hooks/useDashboardData';

import { WelcomeHeader } from '../components/WelcomeHeader';
import { DateFilterBar } from '../components/DateFilterBar';
import { SummaryCards } from '../components/SummaryCards';
import { RevenueOrdersChart } from '../components/RevenueOrdersChart';
import { OrderHistoryChart } from '../components/OrderHistoryChart';
import { OrderFunnelWidget } from '../components/OrderFunnelWidget';
import { CustomerInsightsWidget } from '../components/CustomerInsightsWidget';
import { TopProductsWidget } from '../components/TopProductsWidget';
import { TopCategoriesWidget } from '../components/TopCategoriesWidget';
import { TopDeliveryBoysWidget } from '../components/TopDeliveryBoysWidget';
import { RecentOrdersTable } from '../components/RecentOrdersTable';
import { PersonalisationAttentionWidget } from '../components/PersonalisationAttentionWidget';
import { DeliveryOverviewWidget } from '../components/DeliveryOverviewWidget';
import { OvernightOrdersWidget } from '../components/OvernightOrdersWidget';
import { LowStockWidget } from '../components/LowStockWidget';
import { AlertCircle, RefreshCw } from 'lucide-react';

export function DashboardPage() {
  const [searchParams] = useSearchParams();

  // Read filter parameters from URL search params cleanly
  const currentFilter = useMemo<DashboardFilter>(() => {
    const range = (searchParams.get('range') as DashboardDateRange) || 'today';
    const from = searchParams.get('from') || undefined;
    const to = searchParams.get('to') || undefined;
    return {
      range,
      from,
      to,
      timezone: 'Asia/Kolkata',
    };
  }, [searchParams]);

  // Primary Aggregated Query
  const overviewQuery = useDashboardOverview(currentFilter);

  // Secondary Queries (loaded lazily / independently)
  const funnelQuery = useDashboardOrderFunnel(currentFilter);
  const topProductsQuery = useDashboardTopProducts(currentFilter);
  const topCategoriesQuery = useDashboardTopCategories(currentFilter);
  const topDeliveryBoysQuery = useDashboardTopDeliveryBoys(currentFilter);
  const personalisationQuery = useDashboardPersonalisationAttention();
  const overnightQuery = useDashboardOvernightOrders();
  const lowStockQuery = useDashboardLowStock();

  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>(() =>
    new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })
  );

  const handleRefreshAll = () => {
    overviewQuery.refetch();
    funnelQuery.refetch();
    topProductsQuery.refetch();
    topCategoriesQuery.refetch();
    topDeliveryBoysQuery.refetch();
    personalisationQuery.refetch();
    overnightQuery.refetch();
    lowStockQuery.refetch();
    setLastRefreshedAt(new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }));
  };

  const isRefetching =
    overviewQuery.isFetching ||
    funnelQuery.isFetching ||
    topProductsQuery.isFetching ||
    topCategoriesQuery.isFetching ||
    topDeliveryBoysQuery.isFetching ||
    personalisationQuery.isFetching ||
    overnightQuery.isFetching ||
    lowStockQuery.isFetching;

  // Handle fatal primary load error
  if (overviewQuery.isError && !overviewQuery.data) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 p-4">
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-rose-600 mx-auto" />
          <h2 className="text-lg font-bold text-rose-900">Dashboard Failed to Load</h2>
          <p className="text-sm text-rose-700 max-w-md mx-auto">
            {(overviewQuery.error as any)?.message ||
              'Unable to fetch aggregated dashboard data from the server.'}
          </p>
          <button
            onClick={handleRefreshAll}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg inline-flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" /> Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome Header */}
      <WelcomeHeader
        data={overviewQuery.data?.welcome}
        isLoading={overviewQuery.isLoading}
        onRefresh={handleRefreshAll}
        isRefetching={isRefetching}
        lastRefreshedAt={lastRefreshedAt}
      />

      {/* Date Filter Bar */}
      <DateFilterBar filter={currentFilter} onChange={() => {}} />

      {/* Overnight Orders Queue Banner */}
      <OvernightOrdersWidget data={overnightQuery.data} isLoading={overnightQuery.isLoading} />

      {/* 16 Summary Cards */}
      <SummaryCards summary={overviewQuery.data?.summary} isLoading={overviewQuery.isLoading} />

      {/* Personalisation Attention Operational Alert */}
      <PersonalisationAttentionWidget
        data={personalisationQuery.data}
        isLoading={personalisationQuery.isLoading}
      />

      {/* Main Charts & Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          {/* Revenue vs Orders Chart */}
          <RevenueOrdersChart
            data={overviewQuery.data?.revenueOrders}
            isLoading={overviewQuery.isLoading}
          />

          {/* Daily Orders History */}
          <OrderHistoryChart
            data={overviewQuery.data?.orderHistory}
            isLoading={overviewQuery.isLoading}
          />

          {/* Order Lifecycle Funnel */}
          <OrderFunnelWidget data={funnelQuery.data} isLoading={funnelQuery.isLoading} />

          {/* Recent Orders Table */}
          <RecentOrdersTable
            orders={overviewQuery.data?.recentOrders}
            isLoading={overviewQuery.isLoading}
          />
        </div>

        <div className="lg:col-span-4 space-y-6">
          {/* Customer Insights */}
          <CustomerInsightsWidget
            data={overviewQuery.data?.customerInsights}
            isLoading={overviewQuery.isLoading}
          />

          {/* Delivery Promises Overview */}
          <DeliveryOverviewWidget
            data={overviewQuery.data?.deliveryOverview}
            isLoading={overviewQuery.isLoading}
          />

          {/* Top 10 Products */}
          <TopProductsWidget
            data={topProductsQuery.data}
            isLoading={topProductsQuery.isLoading}
          />

          {/* Top Categories */}
          <TopCategoriesWidget
            data={topCategoriesQuery.data}
            isLoading={topCategoriesQuery.isLoading}
          />

          {/* Delivery Boys */}
          <TopDeliveryBoysWidget
            data={topDeliveryBoysQuery.data}
            isLoading={topDeliveryBoysQuery.isLoading}
          />

          {/* Low Stock Alerts */}
          <LowStockWidget data={lowStockQuery.data} isLoading={lowStockQuery.isLoading} />
        </div>
      </div>
    </div>
  );
}
