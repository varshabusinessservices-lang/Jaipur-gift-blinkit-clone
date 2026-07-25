import { dashboardRepository, calculateDateBounds } from './dashboard.repository';
import { DashboardQueryFilter, DashboardOverviewData, WelcomeHeaderData } from './dashboard.types';

export class DashboardService {
  private getWelcomeInfo(adminName: string): WelcomeHeaderData {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'full',
      timeStyle: 'short',
    });

    return {
      adminName: adminName || 'Super Admin',
      currentDate: formatter.format(now),
      timezone: 'Asia/Kolkata',
      storeMode: 'SINGLE_STORE',
      apiStatus: 'ONLINE',
      dataMode: 'LIVE',
      productionLoad: 'NORMAL',
      deliveryAvailability: 'Active & Accepting Orders (24x7)',
    };
  }

  async getOverview(filter: DashboardQueryFilter, adminName: string): Promise<DashboardOverviewData> {
    const [
      summary,
      revenueOrders,
      orderHistory,
      customerInsights,
      recentOrders,
      deliveryOverview,
    ] = await Promise.all([
      dashboardRepository.getSummary(filter),
      dashboardRepository.getRevenueOrders(filter),
      dashboardRepository.getOrderHistory(filter),
      dashboardRepository.getCustomerInsights(filter),
      dashboardRepository.getRecentOrders(filter.limit || 10),
      dashboardRepository.getDeliveryOverview(filter),
    ]);

    return {
      welcome: this.getWelcomeInfo(adminName),
      summary,
      revenueOrders,
      orderHistory,
      customerInsights,
      recentOrders,
      deliveryOverview,
    };
  }

  async getSummary(filter: DashboardQueryFilter) {
    return dashboardRepository.getSummary(filter);
  }

  async getRevenueOrders(filter: DashboardQueryFilter) {
    return dashboardRepository.getRevenueOrders(filter);
  }

  async getOrderHistory(filter: DashboardQueryFilter) {
    return dashboardRepository.getOrderHistory(filter);
  }

  async getOrderFunnel(filter: DashboardQueryFilter) {
    return dashboardRepository.getOrderFunnel(filter);
  }

  async getCustomerInsights(filter: DashboardQueryFilter) {
    return dashboardRepository.getCustomerInsights(filter);
  }

  async getTopProducts(filter: DashboardQueryFilter) {
    return dashboardRepository.getTopProducts(filter);
  }

  async getTopCategories(filter: DashboardQueryFilter) {
    return dashboardRepository.getTopCategories(filter);
  }

  async getTopDeliveryBoys(filter: DashboardQueryFilter) {
    return dashboardRepository.getTopDeliveryBoys(filter);
  }

  async getRecentOrders(limit: number) {
    return dashboardRepository.getRecentOrders(limit);
  }

  async getPersonalisationAttention() {
    return dashboardRepository.getPersonalisationAttention();
  }

  async getDeliveryOverview(filter: DashboardQueryFilter) {
    return dashboardRepository.getDeliveryOverview(filter);
  }

  async getOvernightOrders() {
    return dashboardRepository.getOvernightOrders();
  }

  async getLowStock() {
    return dashboardRepository.getLowStock();
  }

  getMeta(filter: DashboardQueryFilter) {
    const { from, to } = calculateDateBounds(filter);
    return {
      from: from.toISOString(),
      to: to.toISOString(),
      timezone: filter.timezone || 'Asia/Kolkata',
    };
  }
}

export const dashboardService = new DashboardService();
