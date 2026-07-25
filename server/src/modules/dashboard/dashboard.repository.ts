import { prisma } from '../../database/prisma';
import {
  DashboardQueryFilter,
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
} from './dashboard.types';

export function calculateDateBounds(filter: DashboardQueryFilter): {
  from: Date;
  to: Date;
  prevFrom: Date;
  prevTo: Date;
  daysDiff: number;
} {
  const now = new Date();
  const timezone = filter.timezone || 'Asia/Kolkata';

  // Get current date string in Asia/Kolkata
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const todayStr = formatter.format(now); // YYYY-MM-DD

  let fromDate: Date;
  let toDate: Date;

  if (filter.range === 'custom' && filter.from && filter.to) {
    fromDate = new Date(`${filter.from}T00:00:00.000+05:30`);
    toDate = new Date(`${filter.to}T23:59:59.999+05:30`);
  } else {
    toDate = new Date(`${todayStr}T23:59:59.999+05:30`);
    let daysBack = 1;
    if (filter.range === '3d') daysBack = 3;
    else if (filter.range === '7d') daysBack = 7;
    else if (filter.range === '15d') daysBack = 15;
    else if (filter.range === '30d') daysBack = 30;

    const start = new Date(`${todayStr}T00:00:00.000+05:30`);
    start.setDate(start.getDate() - (daysBack - 1));
    fromDate = start;
  }

  const daysDiff = Math.max(1, Math.round((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)));

  const prevTo = new Date(fromDate.getTime() - 1);
  const prevFrom = new Date(prevTo.getTime() - daysDiff * 24 * 60 * 60 * 1000 + 1);

  return { from: fromDate, to: toDate, prevFrom, prevTo, daysDiff };
}

export class DashboardRepository {
  async getSummary(_filter: DashboardQueryFilter): Promise<DashboardSummaryData> {
    // When commerce tables (Order, Product, Customer) are added in future batches,
    // real SQL aggregate queries will execute here.
    return {
      totalOrders: { current: 0, previous: 0, changePercent: null, trend: 'neutral', label: 'Total Orders', comparisonLabel: 'vs prev period' },
      grossSales: { current: '₹0.00', previous: '₹0.00', changePercent: null, trend: 'neutral', label: 'Gross Sales', comparisonLabel: 'vs prev period' },
      netSales: { current: '₹0.00', previous: '₹0.00', changePercent: null, trend: 'neutral', label: 'Net Sales', comparisonLabel: 'vs prev period' },
      avgOrderValue: { current: '₹0.00', previous: '₹0.00', changePercent: null, trend: 'neutral', label: 'Average Order Value', comparisonLabel: 'vs prev period' },
      newCustomers: { current: 0, previous: 0, changePercent: null, trend: 'neutral', label: 'New Customers', comparisonLabel: 'vs prev period' },
      repeatCustomers: { current: 0, previous: 0, changePercent: null, trend: 'neutral', label: 'Repeat Customers', comparisonLabel: 'vs prev period' },
      pendingPersonalisedOrders: { current: 0, previous: 0, changePercent: null, trend: 'neutral', label: 'Pending Personalised', comparisonLabel: 'vs prev period' },
      designApprovalPending: { current: 0, previous: 0, changePercent: null, trend: 'neutral', label: 'Design Approval Pending', comparisonLabel: 'vs prev period' },
      inProduction: { current: 0, previous: 0, changePercent: null, trend: 'neutral', label: 'In Production', comparisonLabel: 'vs prev period' },
      readyForDispatch: { current: 0, previous: 0, changePercent: null, trend: 'neutral', label: 'Ready for Dispatch', comparisonLabel: 'vs prev period' },
      outForDelivery: { current: 0, previous: 0, changePercent: null, trend: 'neutral', label: 'Out for Delivery', comparisonLabel: 'vs prev period' },
      delivered: { current: 0, previous: 0, changePercent: null, trend: 'neutral', label: 'Delivered', comparisonLabel: 'vs prev period' },
      cancelled: { current: 0, previous: 0, changePercent: null, trend: 'neutral', label: 'Cancelled', comparisonLabel: 'vs prev period' },
      replacementRequests: { current: 0, previous: 0, changePercent: null, trend: 'neutral', label: 'Replacement Requests', comparisonLabel: 'vs prev period' },
      lowStockProducts: { current: 0, previous: 0, changePercent: null, trend: 'neutral', label: 'Low Stock Items', comparisonLabel: 'vs prev period' },
      overnightOrders: { current: 0, previous: 0, changePercent: null, trend: 'neutral', label: 'Overnight Orders', comparisonLabel: 'vs prev period' },
    };
  }

  async getRevenueOrders(filter: DashboardQueryFilter): Promise<RevenueOrdersData> {
    const { from, daysDiff } = calculateDateBounds(filter);
    const points = [];
    const granularity = daysDiff > 30 ? 'week' : 'day';

    for (let i = 0; i < Math.min(daysDiff, 30); i++) {
      const d = new Date(from);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      points.push({
        period: dateStr,
        orderCount: 0,
        grossSales: '0.00',
        netSales: '0.00',
      });
    }

    return { granularity, points };
  }

  async getOrderHistory(filter: DashboardQueryFilter): Promise<OrderHistoryData> {
    const { from, daysDiff } = calculateDateBounds(filter);
    const points = [];

    for (let i = 0; i < Math.min(daysDiff, 30); i++) {
      const d = new Date(from);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      points.push({
        period: dateStr,
        placed: 0,
        confirmed: 0,
        delivered: 0,
        cancelled: 0,
      });
    }

    return { points };
  }

  async getOrderFunnel(_filter: DashboardQueryFilter): Promise<OrderFunnelData> {
    return {
      steps: [
        { key: 'PLACED', label: 'Placed', count: 0 },
        { key: 'ACCEPTED', label: 'Accepted', count: 0 },
        { key: 'REVIEW', label: 'Personalisation Review', count: 0 },
        { key: 'APPROVAL', label: 'Design Approval', count: 0 },
        { key: 'PRODUCTION', label: 'Production', count: 0 },
        { key: 'PACKING', label: 'Packing', count: 0 },
        { key: 'READY', label: 'Ready for Dispatch', count: 0 },
        { key: 'ASSIGNED', label: 'Assigned', count: 0 },
        { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', count: 0 },
        { key: 'DELIVERED', label: 'Delivered', count: 0 },
      ],
      exceptions: {
        onHold: 0,
        cancelled: 0,
        failedDelivery: 0,
        replacementRequested: 0,
      },
    };
  }

  async getCustomerInsights(filter: DashboardQueryFilter): Promise<CustomerInsightsData> {
    const { from, daysDiff } = calculateDateBounds(filter);
    const points = [];

    for (let i = 0; i < Math.min(daysDiff, 30); i++) {
      const d = new Date(from);
      d.setDate(d.getDate() + i);
      points.push({
        period: d.toISOString().split('T')[0],
        newCustomers: 0,
        repeatCustomers: 0,
      });
    }

    return {
      newCustomers: 0,
      repeatCustomers: 0,
      guestCustomers: 0,
      returningCustomerRate: 0,
      avgOrdersPerCustomer: 0,
      topCustomerCount: 0,
      inactiveCustomerCount: 0,
      points,
    };
  }

  async getTopProducts(_filter: DashboardQueryFilter): Promise<TopProductItem[]> {
    return [];
  }

  async getTopCategories(_filter: DashboardQueryFilter): Promise<TopCategoryItem[]> {
    return [];
  }

  async getTopDeliveryBoys(_filter: DashboardQueryFilter): Promise<TopDeliveryBoyItem[]> {
    return [];
  }

  async getRecentOrders(_limit: number = 10): Promise<RecentOrderItem[]> {
    return [];
  }

  async getPersonalisationAttention(): Promise<PersonalisationAttentionItem[]> {
    return [];
  }

  async getDeliveryOverview(_filter: DashboardQueryFilter): Promise<DeliveryOverviewData> {
    return {
      readyForDispatch: 0,
      awaitingAssignment: 0,
      assigned: 0,
      outForDelivery: 0,
      deliveredToday: 0,
      failedDelivery: 0,
      sameDayConfirmed: 0,
      sameDayReview: 0,
      nextDay: 0,
      scheduled: 0,
    };
  }

  async getOvernightOrders(): Promise<OvernightOrdersData> {
    return {
      count: 0,
      oldestPendingAgeHours: 0,
      estimatedMorningWorkloadMin: 0,
      personalisedCount: 0,
      regularCount: 0,
    };
  }

  async getLowStock(): Promise<LowStockItem[]> {
    return [];
  }
}

export const dashboardRepository = new DashboardRepository();
