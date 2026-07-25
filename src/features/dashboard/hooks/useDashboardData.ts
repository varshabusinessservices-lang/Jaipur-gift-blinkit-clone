import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboardApi';
import { DashboardFilter } from '../types/dashboard.types';
import { useAuthStore } from '../../../store/authStore';

export function normalizeFilter(filter: DashboardFilter) {
  return {
    range: filter.range,
    from: filter.range === 'custom' ? filter.from || '' : '',
    to: filter.range === 'custom' ? filter.to || '' : '',
    timezone: filter.timezone || 'Asia/Kolkata',
    limit: filter.limit || 10,
    metric: filter.metric || 'revenue',
  };
}

export const dashboardKeys = {
  all: ['dashboard'] as const,
  overview: (filter: DashboardFilter) => ['dashboard', 'overview', normalizeFilter(filter)] as const,
  summary: (filter: DashboardFilter) => ['dashboard', 'summary', normalizeFilter(filter)] as const,
  revenueOrders: (filter: DashboardFilter) => ['dashboard', 'revenueOrders', normalizeFilter(filter)] as const,
  orderHistory: (filter: DashboardFilter) => ['dashboard', 'orderHistory', normalizeFilter(filter)] as const,
  orderFunnel: (filter: DashboardFilter) => ['dashboard', 'orderFunnel', normalizeFilter(filter)] as const,
  customerInsights: (filter: DashboardFilter) => ['dashboard', 'customerInsights', normalizeFilter(filter)] as const,
  topProducts: (filter: DashboardFilter) => ['dashboard', 'topProducts', normalizeFilter(filter)] as const,
  topCategories: (filter: DashboardFilter) => ['dashboard', 'topCategories', normalizeFilter(filter)] as const,
  topDeliveryBoys: (filter: DashboardFilter) => ['dashboard', 'topDeliveryBoys', normalizeFilter(filter)] as const,
  recentOrders: (limit: number) => ['dashboard', 'recentOrders', limit] as const,
  personalisationAttention: () => ['dashboard', 'personalisationAttention'] as const,
  deliveryOverview: (filter: DashboardFilter) => ['dashboard', 'deliveryOverview', normalizeFilter(filter)] as const,
  overnightOrders: () => ['dashboard', 'overnightOrders'] as const,
  lowStock: () => ['dashboard', 'lowStock'] as const,
};

const queryConfig = {
  staleTime: 30000, // 30 seconds
  retry: (failureCount: number, error: any) => {
    if (error?.response?.status === 401 || error?.response?.status === 403) return false;
    return failureCount < 1;
  },
  refetchOnWindowFocus: false,
};

export function useDashboardOverview(filter: DashboardFilter) {
  const adminName = useAuthStore((s) => s.user?.name);
  return useQuery({
    queryKey: dashboardKeys.overview(filter),
    queryFn: () => dashboardApi.getOverview(filter, adminName),
    ...queryConfig,
  });
}

export function useDashboardOrderFunnel(filter: DashboardFilter) {
  return useQuery({
    queryKey: dashboardKeys.orderFunnel(filter),
    queryFn: () => dashboardApi.getOrderFunnel(filter),
    ...queryConfig,
  });
}

export function useDashboardTopProducts(filter: DashboardFilter) {
  return useQuery({
    queryKey: dashboardKeys.topProducts(filter),
    queryFn: () => dashboardApi.getTopProducts(filter),
    ...queryConfig,
  });
}

export function useDashboardTopCategories(filter: DashboardFilter) {
  return useQuery({
    queryKey: dashboardKeys.topCategories(filter),
    queryFn: () => dashboardApi.getTopCategories(filter),
    ...queryConfig,
  });
}

export function useDashboardTopDeliveryBoys(filter: DashboardFilter) {
  return useQuery({
    queryKey: dashboardKeys.topDeliveryBoys(filter),
    queryFn: () => dashboardApi.getTopDeliveryBoys(filter),
    ...queryConfig,
  });
}

export function useDashboardPersonalisationAttention() {
  return useQuery({
    queryKey: dashboardKeys.personalisationAttention(),
    queryFn: () => dashboardApi.getPersonalisationAttention(),
    ...queryConfig,
  });
}

export function useDashboardOvernightOrders() {
  return useQuery({
    queryKey: dashboardKeys.overnightOrders(),
    queryFn: () => dashboardApi.getOvernightOrders(),
    ...queryConfig,
  });
}

export function useDashboardLowStock() {
  return useQuery({
    queryKey: dashboardKeys.lowStock(),
    queryFn: () => dashboardApi.getLowStock(),
    ...queryConfig,
  });
}
