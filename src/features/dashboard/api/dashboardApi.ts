import { apiClient } from '../../../lib/axios';
import { config } from '../../../config/env';
import { mockDashboardService } from './mockDashboardService';
import {
  DashboardFilter,
  DashboardOverviewData,
  DashboardSummaryData,
  RevenueOrdersData,
  OrderHistoryData,
  OrderFunnelData,
  CustomerInsightsData,
  TopProductItem,
  TopCategoryItem,
  TopDeliveryBoyItem,
  RecentOrderItem,
  PersonalisationAttentionItem,
  DeliveryOverviewData,
  OvernightOrdersData,
  LowStockItem,
} from '../types/dashboard.types';

export const dashboardApi = {
  async getOverview(filter: DashboardFilter, adminName?: string): Promise<DashboardOverviewData> {
    if (config.useMockApi) {
      return mockDashboardService.getOverview(filter, adminName);
    }
    const res = await apiClient.get('/admin/dashboard/overview', { params: filter });
    return res.data.data;
  },

  async getSummary(filter: DashboardFilter): Promise<DashboardSummaryData> {
    if (config.useMockApi) {
      return mockDashboardService.getSummary(filter);
    }
    const res = await apiClient.get('/admin/dashboard/summary', { params: filter });
    return res.data.data;
  },

  async getRevenueOrders(filter: DashboardFilter): Promise<RevenueOrdersData> {
    if (config.useMockApi) {
      return mockDashboardService.getRevenueOrders(filter);
    }
    const res = await apiClient.get('/admin/dashboard/revenue-orders', { params: filter });
    return res.data.data;
  },

  async getOrderHistory(filter: DashboardFilter): Promise<OrderHistoryData> {
    if (config.useMockApi) {
      return mockDashboardService.getOrderHistory(filter);
    }
    const res = await apiClient.get('/admin/dashboard/order-history', { params: filter });
    return res.data.data;
  },

  async getOrderFunnel(filter: DashboardFilter): Promise<OrderFunnelData> {
    if (config.useMockApi) {
      return mockDashboardService.getOrderFunnel(filter);
    }
    const res = await apiClient.get('/admin/dashboard/order-funnel', { params: filter });
    return res.data.data;
  },

  async getCustomerInsights(filter: DashboardFilter): Promise<CustomerInsightsData> {
    if (config.useMockApi) {
      return mockDashboardService.getCustomerInsights(filter);
    }
    const res = await apiClient.get('/admin/dashboard/customer-insights', { params: filter });
    return res.data.data;
  },

  async getTopProducts(filter: DashboardFilter): Promise<TopProductItem[]> {
    if (config.useMockApi) {
      return mockDashboardService.getTopProducts(filter);
    }
    const res = await apiClient.get('/admin/dashboard/top-products', { params: filter });
    return res.data.data;
  },

  async getTopCategories(filter: DashboardFilter): Promise<TopCategoryItem[]> {
    if (config.useMockApi) {
      return mockDashboardService.getTopCategories(filter);
    }
    const res = await apiClient.get('/admin/dashboard/top-categories', { params: filter });
    return res.data.data;
  },

  async getTopDeliveryBoys(filter: DashboardFilter): Promise<TopDeliveryBoyItem[]> {
    if (config.useMockApi) {
      return mockDashboardService.getTopDeliveryBoys(filter);
    }
    const res = await apiClient.get('/admin/dashboard/top-delivery-boys', { params: filter });
    return res.data.data;
  },

  async getRecentOrders(limit: number = 10): Promise<RecentOrderItem[]> {
    if (config.useMockApi) {
      return mockDashboardService.getRecentOrders(limit);
    }
    const res = await apiClient.get('/admin/dashboard/recent-orders', { params: { limit } });
    return res.data.data;
  },

  async getPersonalisationAttention(): Promise<PersonalisationAttentionItem[]> {
    if (config.useMockApi) {
      return mockDashboardService.getPersonalisationAttention();
    }
    const res = await apiClient.get('/admin/dashboard/personalisation-attention');
    return res.data.data;
  },

  async getDeliveryOverview(filter: DashboardFilter): Promise<DeliveryOverviewData> {
    if (config.useMockApi) {
      return mockDashboardService.getDeliveryOverview(filter);
    }
    const res = await apiClient.get('/admin/dashboard/delivery-overview', { params: filter });
    return res.data.data;
  },

  async getOvernightOrders(): Promise<OvernightOrdersData> {
    if (config.useMockApi) {
      return mockDashboardService.getOvernightOrders();
    }
    const res = await apiClient.get('/admin/dashboard/overnight-orders');
    return res.data.data;
  },

  async getLowStock(): Promise<LowStockItem[]> {
    if (config.useMockApi) {
      return mockDashboardService.getLowStock();
    }
    const res = await apiClient.get('/admin/dashboard/low-stock');
    return res.data.data;
  },
};
