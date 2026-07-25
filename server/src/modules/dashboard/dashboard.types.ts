export type DashboardDateRange = 'today' | '3d' | '7d' | '15d' | '30d' | 'custom';

export interface DashboardQueryFilter {
  range: DashboardDateRange;
  from?: string;
  to?: string;
  timezone?: string;
  limit?: number;
  metric?: 'units' | 'revenue' | 'orders';
}

export interface SummaryMetric {
  current: number | string;
  previous: number | string;
  changePercent: number | null;
  trend: 'positive' | 'negative' | 'neutral';
  label: string;
  comparisonLabel: string;
}

export interface DashboardSummaryData {
  totalOrders: SummaryMetric;
  grossSales: SummaryMetric;
  netSales: SummaryMetric;
  avgOrderValue: SummaryMetric;
  newCustomers: SummaryMetric;
  repeatCustomers: SummaryMetric;
  pendingPersonalisedOrders: SummaryMetric;
  designApprovalPending: SummaryMetric;
  inProduction: SummaryMetric;
  readyForDispatch: SummaryMetric;
  outForDelivery: SummaryMetric;
  delivered: SummaryMetric;
  cancelled: SummaryMetric;
  replacementRequests: SummaryMetric;
  lowStockProducts: SummaryMetric;
  overnightOrders: SummaryMetric;
}

export interface RevenueOrdersPoint {
  period: string;
  orderCount: number;
  grossSales: string;
  netSales: string;
}

export interface RevenueOrdersData {
  granularity: 'day' | 'week';
  points: RevenueOrdersPoint[];
}

export interface OrderHistoryPoint {
  period: string;
  placed: number;
  confirmed: number;
  delivered: number;
  cancelled: number;
}

export interface OrderHistoryData {
  points: OrderHistoryPoint[];
}

export interface FunnelStep {
  key: string;
  label: string;
  count: number;
}

export interface OrderFunnelData {
  steps: FunnelStep[];
  exceptions: {
    onHold: number;
    cancelled: number;
    failedDelivery: number;
    replacementRequested: number;
  };
}

export interface CustomerInsightsData {
  newCustomers: number;
  repeatCustomers: number;
  guestCustomers: number;
  returningCustomerRate: number;
  avgOrdersPerCustomer: number;
  topCustomerCount: number;
  inactiveCustomerCount: number;
  points: { period: string; newCustomers: number; repeatCustomers: number }[];
}

export interface TopProductItem {
  id: string;
  title: string;
  sku: string;
  imageUrl: string | null;
  productType: 'PERSONALISED' | 'REGULAR';
  unitsSold: number;
  ordersCount: number;
  netSales: string;
  isPersonalised: boolean;
  isBestSeller: boolean;
}

export interface TopCategoryItem {
  id: string;
  name: string;
  productCount: number;
  unitsSold: number;
  ordersCount: number;
  revenue: string;
  salesSharePercent: number;
}

export interface TopDeliveryBoyItem {
  id: string;
  name: string;
  avatarUrl: string | null;
  deliveredOrders: number;
  onTimePercent: number;
  failedDeliveries: number;
  avgRating: number;
  cashPending: string;
  availability: 'AVAILABLE' | 'ON_DELIVERY' | 'OFFLINE';
}

export interface RecentOrderItem {
  id: string;
  orderNumber: string;
  customerNameMasked: string;
  itemCount: number;
  isPersonalised: boolean;
  totalAmount: string;
  paymentStatus: 'PAID' | 'PENDING' | 'FAILED' | 'REFUNDED';
  deliveryPromise: 'SAME_DAY_CONFIRMED' | 'SAME_DAY_REVIEW' | 'NEXT_DAY' | 'SCHEDULED' | 'STORE_PICKUP';
  orderStatus: string;
  createdAt: string;
}

export interface PersonalisationAttentionItem {
  id: string;
  orderNumber: string;
  issueType: string;
  issueLabel: string;
  ageInHours: number;
  priority: 'HIGH' | 'MEDIUM' | 'URGENT';
  summary: string;
  actionRoute: string;
}

export interface DeliveryOverviewData {
  readyForDispatch: number;
  awaitingAssignment: number;
  assigned: number;
  outForDelivery: number;
  deliveredToday: number;
  failedDelivery: number;
  sameDayConfirmed: number;
  sameDayReview: number;
  nextDay: number;
  scheduled: number;
}

export interface OvernightOrdersData {
  count: number;
  oldestPendingAgeHours: number;
  estimatedMorningWorkloadMin: number;
  personalisedCount: number;
  regularCount: number;
}

export interface LowStockItem {
  id: string;
  title: string;
  sku: string;
  availableStock: number;
  reservedStock: number;
  lowStockThreshold: number;
  status: 'LOW_STOCK' | 'OUT_OF_STOCK';
}

export interface WelcomeHeaderData {
  adminName: string;
  currentDate: string;
  timezone: string;
  storeMode: 'SINGLE_STORE';
  apiStatus: 'ONLINE';
  dataMode: 'LIVE' | 'MOCK';
  productionLoad: 'LOW' | 'NORMAL' | 'HIGH' | 'FULL';
  deliveryAvailability: string;
}

export interface DashboardOverviewData {
  welcome: WelcomeHeaderData;
  summary: DashboardSummaryData;
  revenueOrders: RevenueOrdersData;
  orderHistory: OrderHistoryData;
  customerInsights: CustomerInsightsData;
  recentOrders: RecentOrderItem[];
  deliveryOverview: DeliveryOverviewData;
}
