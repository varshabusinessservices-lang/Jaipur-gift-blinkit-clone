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

export const mockDashboardService = {
  async getOverview(filter: DashboardFilter, adminName: string = 'Super Admin'): Promise<DashboardOverviewData> {
    await new Promise((r) => setTimeout(r, 150));
    const [
      summary,
      revenueOrders,
      orderHistory,
      customerInsights,
      recentOrders,
      deliveryOverview,
    ] = await Promise.all([
      this.getSummary(filter),
      this.getRevenueOrders(filter),
      this.getOrderHistory(filter),
      this.getCustomerInsights(filter),
      this.getRecentOrders(filter.limit || 10),
      this.getDeliveryOverview(filter),
    ]);

    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'full',
      timeStyle: 'short',
    });

    return {
      welcome: {
        adminName,
        currentDate: formatter.format(now),
        timezone: 'Asia/Kolkata',
        storeMode: 'SINGLE_STORE',
        apiStatus: 'ONLINE',
        dataMode: 'MOCK',
        productionLoad: 'NORMAL',
        deliveryAvailability: 'Active & Accepting Orders (24x7)',
      },
      summary,
      revenueOrders,
      orderHistory,
      customerInsights,
      recentOrders,
      deliveryOverview,
    };
  },

  async getSummary(filter: DashboardFilter): Promise<DashboardSummaryData> {
    await new Promise((r) => setTimeout(r, 100));
    let multiplier = 1;
    if (filter.range === '3d') multiplier = 3;
    else if (filter.range === '7d') multiplier = 7;
    else if (filter.range === '15d') multiplier = 15;
    else if (filter.range === '30d') multiplier = 30;
    else if (filter.range === 'custom') multiplier = 5;

    const baseOrders = 28 * multiplier;
    const baseGross = 24500 * multiplier;
    const baseNet = 22100 * multiplier;
    const prevNet = Math.round(baseNet * 0.88);
    const changePercent = parseFloat((((baseNet - prevNet) / prevNet) * 100).toFixed(1));

    return {
      totalOrders: { current: baseOrders, previous: Math.round(baseOrders * 0.9), changePercent: 11.1, trend: 'positive', label: 'Total Orders', comparisonLabel: 'vs prev period' },
      grossSales: { current: baseGross, previous: Math.round(baseGross * 0.88), changePercent: 13.6, trend: 'positive', label: 'Gross Sales', comparisonLabel: 'vs prev period' },
      netSales: { current: baseNet, previous: prevNet, changePercent, trend: 'positive', label: 'Net Sales', comparisonLabel: 'vs prev period' },
      avgOrderValue: { current: Math.round(baseNet / baseOrders), previous: Math.round(prevNet / (baseOrders * 0.9)), changePercent: 2.2, trend: 'positive', label: 'Average Order Value', comparisonLabel: 'vs prev period' },
      newCustomers: { current: Math.round(12 * multiplier), previous: Math.round(10 * multiplier), changePercent: 20.0, trend: 'positive', label: 'New Customers', comparisonLabel: 'vs prev period' },
      repeatCustomers: { current: Math.round(16 * multiplier), previous: Math.round(15 * multiplier), changePercent: 6.7, trend: 'positive', label: 'Repeat Customers', comparisonLabel: 'vs prev period' },
      pendingPersonalisedOrders: { current: 9, previous: 12, changePercent: -25.0, trend: 'positive', label: 'Pending Personalised', comparisonLabel: 'needs review' },
      designApprovalPending: { current: 4, previous: 6, changePercent: -33.3, trend: 'positive', label: 'Design Proof Pending', comparisonLabel: 'awaiting client' },
      inProduction: { current: 7, previous: 5, changePercent: 40.0, trend: 'neutral', label: 'In Production', comparisonLabel: 'active capacity' },
      readyForDispatch: { current: 5, previous: 4, changePercent: 25.0, trend: 'positive', label: 'Ready for Dispatch', comparisonLabel: 'awaiting rider' },
      outForDelivery: { current: 3, previous: 2, changePercent: 50.0, trend: 'positive', label: 'Out for Delivery', comparisonLabel: 'on the road' },
      delivered: { current: Math.round(20 * multiplier), previous: Math.round(18 * multiplier), changePercent: 11.1, trend: 'positive', label: 'Delivered', comparisonLabel: 'vs prev period' },
      cancelled: { current: Math.round(1 * multiplier), previous: Math.round(2 * multiplier), changePercent: -50.0, trend: 'positive', label: 'Cancelled', comparisonLabel: 'vs prev period' },
      replacementRequests: { current: 0, previous: 1, changePercent: -100, trend: 'positive', label: 'Replacements', comparisonLabel: 'zero issues' },
      lowStockProducts: { current: 3, previous: 3, changePercent: 0, trend: 'neutral', label: 'Low Stock Items', comparisonLabel: 'action required' },
      overnightOrders: { current: 5, previous: 4, changePercent: 25.0, trend: 'neutral', label: 'Overnight Queue', comparisonLabel: 'placed off-hours' },
    };
  },

  async getRevenueOrders(filter: DashboardFilter): Promise<RevenueOrdersData> {
    await new Promise((r) => setTimeout(r, 100));
    let days = 7;
    if (filter.range === 'today') days = 1;
    else if (filter.range === '3d') days = 3;
    else if (filter.range === '15d') days = 15;
    else if (filter.range === '30d') days = 30;
    else if (filter.range === 'custom') days = 7;

    const points = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const orderCount = 20 + ((i * 7) % 15);
      const grossSales = orderCount * 850 + ((i * 123) % 400);
      const netSales = Math.round(grossSales * 0.92);

      points.push({
        period: dateStr,
        orderCount,
        grossSales,
        netSales,
      });
    }

    return {
      granularity: days > 30 ? 'week' : 'day',
      points,
    };
  },

  async getOrderHistory(filter: DashboardFilter): Promise<OrderHistoryData> {
    await new Promise((r) => setTimeout(r, 100));
    let days = 7;
    if (filter.range === 'today') days = 1;
    else if (filter.range === '3d') days = 3;
    else if (filter.range === '15d') days = 15;
    else if (filter.range === '30d') days = 30;

    const points = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      points.push({
        period: dateStr,
        placed: 25 + (i % 5),
        confirmed: 23 + (i % 4),
        delivered: 21 + (i % 3),
        cancelled: 1,
      });
    }

    return { points };
  },

  async getOrderFunnel(_filter: DashboardFilter): Promise<OrderFunnelData> {
    await new Promise((r) => setTimeout(r, 100));
    return {
      steps: [
        { key: 'PLACED', label: 'Placed', count: 42 },
        { key: 'ACCEPTED', label: 'Accepted', count: 38 },
        { key: 'REVIEW', label: 'Personalisation Review', count: 9 },
        { key: 'APPROVAL', label: 'Design Approval', count: 4 },
        { key: 'PRODUCTION', label: 'In Production', count: 7 },
        { key: 'PACKING', label: 'Packing', count: 3 },
        { key: 'READY', label: 'Ready for Dispatch', count: 5 },
        { key: 'ASSIGNED', label: 'Assigned', count: 4 },
        { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', count: 3 },
        { key: 'DELIVERED', label: 'Delivered', count: 28 },
      ],
      exceptions: {
        onHold: 2,
        cancelled: 1,
        failedDelivery: 0,
        replacementRequested: 0,
      },
    };
  },

  async getCustomerInsights(_filter: DashboardFilter): Promise<CustomerInsightsData> {
    await new Promise((r) => setTimeout(r, 100));
    return {
      newCustomers: 124,
      repeatCustomers: 186,
      guestCustomers: 32,
      returningCustomerRate: 60.0,
      avgOrdersPerCustomer: 2.4,
      topCustomerCount: 15,
      inactiveCustomerCount: 22,
      points: [
        { period: '2026-07-20', newCustomers: 15, repeatCustomers: 22 },
        { period: '2026-07-21', newCustomers: 18, repeatCustomers: 25 },
        { period: '2026-07-22', newCustomers: 14, repeatCustomers: 28 },
        { period: '2026-07-23', newCustomers: 20, repeatCustomers: 30 },
        { period: '2026-07-24', newCustomers: 22, repeatCustomers: 32 },
        { period: '2026-07-25', newCustomers: 19, repeatCustomers: 29 },
        { period: '2026-07-26', newCustomers: 16, repeatCustomers: 20 },
      ],
    };
  },

  async getTopProducts(_filter: DashboardFilter): Promise<TopProductItem[]> {
    await new Promise((r) => setTimeout(r, 100));
    return [
      {
        id: 'p1',
        title: 'Custom Laser Engraved Wooden Photo Frame (8x10)',
        sku: 'JPG-FRAME-001',
        imageUrl: null,
        productType: 'PERSONALISED',
        unitsSold: 84,
        ordersCount: 72,
        netSales: 41916,
        isPersonalised: true,
        isBestSeller: true,
      },
      {
        id: 'p2',
        title: 'Magic Color Changing Coffee Mug with Photo',
        sku: 'JPG-MUG-002',
        imageUrl: null,
        productType: 'PERSONALISED',
        unitsSold: 65,
        ordersCount: 58,
        netSales: 22685,
        isPersonalised: true,
        isBestSeller: true,
      },
      {
        id: 'p3',
        title: 'Personalised Sipper Water Bottle with Name',
        sku: 'JPG-BOT-003',
        imageUrl: null,
        productType: 'PERSONALISED',
        unitsSold: 42,
        ordersCount: 39,
        netSales: 18858,
        isPersonalised: true,
        isBestSeller: false,
      },
      {
        id: 'p4',
        title: 'Premium Printed Cotton T-Shirt (Jaipur Edition)',
        sku: 'JPG-TSH-004',
        imageUrl: null,
        productType: 'REGULAR',
        unitsSold: 38,
        ordersCount: 30,
        netSales: 18962,
        isPersonalised: false,
        isBestSeller: false,
      },
      {
        id: 'p5',
        title: 'Custom Metal Keychain with Photo & Number',
        sku: 'JPG-KEY-005',
        imageUrl: null,
        productType: 'PERSONALISED',
        unitsSold: 95,
        ordersCount: 68,
        netSales: 14155,
        isPersonalised: true,
        isBestSeller: false,
      },
    ];
  },

  async getTopCategories(_filter: DashboardFilter): Promise<TopCategoryItem[]> {
    await new Promise((r) => setTimeout(r, 100));
    return [
      { id: 'c1', name: 'Photo Frames & Collages', productCount: 24, unitsSold: 142, ordersCount: 120, revenue: 85200, salesSharePercent: 38.5 },
      { id: 'c2', name: 'Custom Drinkware & Mugs', productCount: 18, unitsSold: 110, ordersCount: 95, revenue: 49500, salesSharePercent: 22.4 },
      { id: 'c3', name: 'Personalised Apparel', productCount: 15, unitsSold: 68, ordersCount: 54, revenue: 37400, salesSharePercent: 16.9 },
      { id: 'c4', name: 'Keychains & Accessories', productCount: 12, unitsSold: 125, ordersCount: 88, revenue: 25000, salesSharePercent: 11.3 },
      { id: 'c5', name: 'Ready Gifts & Hampers', productCount: 10, unitsSold: 22, ordersCount: 20, revenue: 24200, salesSharePercent: 10.9 },
    ];
  },

  async getTopDeliveryBoys(_filter: DashboardFilter): Promise<TopDeliveryBoyItem[]> {
    await new Promise((r) => setTimeout(r, 100));
    return [
      { id: 'db1', name: 'Ramesh Sharma', avatarUrl: null, deliveredOrders: 42, onTimePercent: 98.2, failedDeliveries: 0, avgRating: 4.9, cashPending: 1450, availability: 'ON_DELIVERY' },
      { id: 'db2', name: 'Vikram Singh', avatarUrl: null, deliveredOrders: 38, onTimePercent: 96.5, failedDeliveries: 1, avgRating: 4.8, cashPending: 820, availability: 'AVAILABLE' },
      { id: 'db3', name: 'Sanjay Saini', avatarUrl: null, deliveredOrders: 31, onTimePercent: 95.0, failedDeliveries: 0, avgRating: 4.7, cashPending: 0, availability: 'OFFLINE' },
    ];
  },

  async getRecentOrders(_limit: number = 10): Promise<RecentOrderItem[]> {
    await new Promise((r) => setTimeout(r, 100));
    return [
      { id: 'ord-101', orderNumber: 'JPG-2026-8801', customerNameMasked: 'Rahul S. (88****12)', itemCount: 2, isPersonalised: true, totalAmount: 1249, paymentStatus: 'PAID', deliveryPromise: 'SAME_DAY_CONFIRMED', orderStatus: 'IN_PRODUCTION', createdAt: new Date(Date.now() - 15 * 60000).toISOString() },
      { id: 'ord-102', orderNumber: 'JPG-2026-8802', customerNameMasked: 'Anjali V. (94****45)', itemCount: 1, isPersonalised: true, totalAmount: 499, paymentStatus: 'PAID', deliveryPromise: 'SAME_DAY_REVIEW', orderStatus: 'REVIEW_PENDING', createdAt: new Date(Date.now() - 32 * 60000).toISOString() },
      { id: 'ord-103', orderNumber: 'JPG-2026-8803', customerNameMasked: 'Pooja K. (70****89)', itemCount: 3, isPersonalised: false, totalAmount: 890, paymentStatus: 'PAID', deliveryPromise: 'NEXT_DAY', orderStatus: 'READY_FOR_DISPATCH', createdAt: new Date(Date.now() - 48 * 60000).toISOString() },
      { id: 'ord-104', orderNumber: 'JPG-2026-8804', customerNameMasked: 'Amit M. (98****33)', itemCount: 1, isPersonalised: true, totalAmount: 699, paymentStatus: 'PENDING', deliveryPromise: 'SAME_DAY_CONFIRMED', orderStatus: 'PROOF_AWAITING_APPROVAL', createdAt: new Date(Date.now() - 75 * 60000).toISOString() },
      { id: 'ord-105', orderNumber: 'JPG-2026-8805', customerNameMasked: 'Deepak G. (91****02)', itemCount: 2, isPersonalised: true, totalAmount: 1599, paymentStatus: 'PAID', deliveryPromise: 'SAME_DAY_CONFIRMED', orderStatus: 'OUT_FOR_DELIVERY', createdAt: new Date(Date.now() - 110 * 60000).toISOString() },
    ];
  },

  async getPersonalisationAttention(): Promise<PersonalisationAttentionItem[]> {
    await new Promise((r) => setTimeout(r, 100));
    return [
      { id: 'att-1', orderNumber: 'JPG-2026-8802', issueType: 'LOW_QUALITY_PHOTO', issueLabel: 'Low Resolution Photo Uploaded', ageInHours: 1.2, priority: 'HIGH', summary: 'Uploaded image resolution is 480x640 (requires min 1200x1600 for 8x10 frame).', actionRoute: '/sales/orders/ord-102' },
      { id: 'att-2', orderNumber: 'JPG-2026-8804', issueType: 'PROOF_APPROVAL_AWAITING', issueLabel: 'Proof Awaiting Client Approval', ageInHours: 2.5, priority: 'MEDIUM', summary: 'Preview generated and sent via WhatsApp. Client review pending.', actionRoute: '/sales/orders/ord-104' },
      { id: 'att-3', orderNumber: 'JPG-2026-8798', issueType: 'MISSING_ENGRAVING_TEXT', issueLabel: 'Custom Text Missing', ageInHours: 4.1, priority: 'URGENT', summary: 'Order item specifies laser engraving but text field was submitted blank.', actionRoute: '/sales/orders/ord-8798' },
    ];
  },

  async getDeliveryOverview(_filter: DashboardFilter): Promise<DeliveryOverviewData> {
    await new Promise((r) => setTimeout(r, 100));
    return {
      readyForDispatch: 5,
      awaitingAssignment: 2,
      assigned: 4,
      outForDelivery: 3,
      deliveredToday: 28,
      failedDelivery: 0,
      sameDayConfirmed: 18,
      sameDayReview: 4,
      nextDay: 12,
      scheduled: 6,
    };
  },

  async getOvernightOrders(): Promise<OvernightOrdersData> {
    await new Promise((r) => setTimeout(r, 100));
    return {
      count: 5,
      oldestPendingAgeHours: 6.8,
      estimatedMorningWorkloadMin: 45,
      personalisedCount: 4,
      regularCount: 1,
    };
  },

  async getLowStock(): Promise<LowStockItem[]> {
    await new Promise((r) => setTimeout(r, 100));
    return [
      { id: 'ls-1', title: 'Blank Sublimation White Mugs (11oz)', sku: 'RAW-MUG-11OZ', availableStock: 8, reservedStock: 4, lowStockThreshold: 20, status: 'LOW_STOCK' },
      { id: 'ls-2', title: 'Synthetic Wood Frame Moulding (8x10 Dark Walnut)', sku: 'RAW-FRM-8X10', availableStock: 5, reservedStock: 3, lowStockThreshold: 15, status: 'LOW_STOCK' },
      { id: 'ls-3', title: 'Stainless Steel Water Bottles (750ml White)', sku: 'RAW-BOT-750ML', availableStock: 0, reservedStock: 0, lowStockThreshold: 10, status: 'OUT_OF_STOCK' },
    ];
  },
};
