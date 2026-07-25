# Batch 05 Completion Report: Super Admin Dashboard Foundation

## Executive Summary
Batch 05 replaces the previous dashboard placeholders with a complete, API-driven Super Admin dashboard foundation for the Blinkit-inspired hyperlocal personalised gifting platform (*Jaipur Gifting*).

The dashboard foundation provides operational analytics, sales monitoring, date range filtering (`Asia/Kolkata`), order funnel visibility, personalised order alerts, and customer insights. It supports both Mock Mode (`VITE_ADMIN_USE_MOCK_API=true`) and Live API Mode (`VITE_ADMIN_USE_MOCK_API=false`) with honest empty database fallbacks without inventing fake database tables.

---

## 1. Dashboard Widgets Implemented
1. **Welcome Header**: Admin greeting, business date/time in `Asia/Kolkata`, store mode (`SINGLE_STORE`), API status badge, Live/Mock data badge, production load indicator, delivery status, and a manual refresh trigger with timestamp.
2. **Date Filter Bar**: Quick range selectors (`Today`, `Last 3 Days`, `Last 7 Days`, `Last 15 Days`, `Last 30 Days`, `Custom Range`) with custom date pickers (up to 365 days max) synced to URL parameters (`?range=7d` / `?from=...&to=...`).
3. **Overnight Orders Queue**: Morning production queue monitor for orders placed off-hours (e.g. 8:00 PM to 8:00 AM) with estimated morning workload.
4. **Summary Cards (16 Metrics)**:
   - Total Orders
   - Gross Sales (INR)
   - Net Sales (INR)
   - Average Order Value (AOV)
   - New Customers
   - Repeat Customers
   - Pending Personalised Orders (highlighted priority)
   - Design Approval Pending
   - In Production
   - Ready for Dispatch
   - Out for Delivery
   - Delivered
   - Cancelled
   - Replacement Requests
   - Low Stock Products
   - Overnight Queue
   *Includes percentage trends vs previous period, tooltip metric explanations, and loading skeletons.*
5. **Personalisation Attention**: Operational alert box flagging blocked or pending personalised orders (low quality image warnings, missing engraving text, pending proofs) with age indicators and direct action routes.
6. **Revenue vs Orders Chart**: Recharts dual-axis area chart for Net Sales (INR) and Order Count with daily or weekly granularity and INR currency tooltips.
7. **Daily Order Volume History**: Recharts bar chart tracking Placed, Delivered, and Cancelled orders over time.
8. **Order Lifecycle Funnel**: Visual flow tracking orders through 10 stages (*Placed -> Accepted -> Personalisation Review -> Design Approval -> Production -> Packing -> Ready for Dispatch -> Assigned -> Out for Delivery -> Delivered*) alongside exception indicators (*On Hold, Cancelled, Failed Delivery, Replacement Requested*).
9. **Customer Insights**: Acquisition vs retention metrics (*New Customers, Repeat Customers, Returning Customer Rate %, Avg Orders / Customer*) with trend chart.
10. **Delivery Promises Overview**: Hyperlocal SLA commitments breakdown (*Same-Day Confirmed, Same-Day Review, Next-Day, Scheduled / Store Pickup*).
11. **Top 10 Products**: Best-selling product list featuring titles, SKUs, units sold, net sales, Personalised badges, and Best Seller badges.
12. **Top Categories**: Category sales share breakdown with product counts and revenue bars.
13. **Delivery Riders**: Delivery boy performance widget showing delivered counts, on-time %, rating, cash pending (COD), and real-time availability status.
14. **Low Stock Raw Materials**: Critical stock alerts for raw materials (mugs, wood mouldings, bottles) with low-stock thresholds.
15. **Recent Orders Table**: Real-time order dispatch list showing order #, masked customer info, item count, personalisation type, amount, payment status, delivery promise, order status, and action links to `/sales/orders/:id`.

---

## 2. Files Created & Modified

### Backend Files Created / Modified
- `server/src/modules/dashboard/dashboard.types.ts`
- `server/src/modules/dashboard/dashboard.schemas.ts`
- `server/src/modules/dashboard/dashboard.repository.ts`
- `server/src/modules/dashboard/dashboard.service.ts`
- `server/src/modules/dashboard/dashboard.controller.ts`
- `server/src/modules/dashboard/dashboard.routes.ts`
- `server/src/modules/admin/admin.routes.ts` (Mounted dashboard router)
- `server/tests/dashboard.test.ts` (Backend test suite)

### Frontend Files Created / Modified
- `src/features/dashboard/types/dashboard.types.ts`
- `src/features/dashboard/utils/formatters.ts`
- `src/features/dashboard/utils/dateUtils.ts`
- `src/features/dashboard/api/mockDashboardService.ts`
- `src/features/dashboard/api/dashboardApi.ts`
- `src/features/dashboard/hooks/useDashboardData.ts`
- `src/features/dashboard/components/WelcomeHeader.tsx`
- `src/features/dashboard/components/DateFilterBar.tsx`
- `src/features/dashboard/components/SummaryCards.tsx`
- `src/features/dashboard/components/RevenueOrdersChart.tsx`
- `src/features/dashboard/components/OrderHistoryChart.tsx`
- `src/features/dashboard/components/OrderFunnelWidget.tsx`
- `src/features/dashboard/components/CustomerInsightsWidget.tsx`
- `src/features/dashboard/components/TopProductsWidget.tsx`
- `src/features/dashboard/components/TopCategoriesWidget.tsx`
- `src/features/dashboard/components/TopDeliveryBoysWidget.tsx`
- `src/features/dashboard/components/RecentOrdersTable.tsx`
- `src/features/dashboard/components/PersonalisationAttentionWidget.tsx`
- `src/features/dashboard/components/DeliveryOverviewWidget.tsx`
- `src/features/dashboard/components/OvernightOrdersWidget.tsx`
- `src/features/dashboard/components/LowStockWidget.tsx`
- `src/features/dashboard/pages/DashboardPage.tsx`

---

## 3. Endpoints Created
All endpoints reside under `/api/v1/admin/dashboard/*` and require authenticated Super Admin access (`requireAuth`):

- `GET /api/v1/admin/dashboard/overview` (Aggregated initial dashboard load)
- `GET /api/v1/admin/dashboard/summary`
- `GET /api/v1/admin/dashboard/revenue-orders`
- `GET /api/v1/admin/dashboard/order-history`
- `GET /api/v1/admin/dashboard/order-funnel`
- `GET /api/v1/admin/dashboard/customer-insights`
- `GET /api/v1/admin/dashboard/top-products`
- `GET /api/v1/admin/dashboard/top-categories`
- `GET /api/v1/admin/dashboard/top-delivery-boys`
- `GET /api/v1/admin/dashboard/recent-orders`
- `GET /api/v1/admin/dashboard/personalisation-attention`
- `GET /api/v1/admin/dashboard/delivery-overview`
- `GET /api/v1/admin/dashboard/overnight-orders`
- `GET /api/v1/admin/dashboard/low-stock`

---

## 4. Timezone, Currency & Security Handling
- **Timezone**: All business day boundaries and current date calculations use `Asia/Kolkata`.
- **Currency**: Formatted in `INR` (`en-IN`) using `Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })`.
- **Privacy & Security**: Customer names are masked (e.g. `Rahul S. (88****12)`), payment credentials/secrets and raw customer upload payloads are excluded from summary API responses.

---

## 5. Source Models & Data Source Status
- **Current Database Schema**: `AdminUser`, `AdminSession`, `OtpChallenge`, `Store`, `AppSetting`, `StoreSetting`, `FeatureFlag`, `AuditLog`, `FileAsset`, `UploadSession`, `SystemJob`, `ApiRequestLog`.
- **Deferred Data Sources (Batch 6+)**: `Order`, `OrderItem`, `Customer`, `Product`, `Category`, `DeliveryBoy`.
- **Live Mode Adapter Strategy**: `dashboardRepository` provides zero/empty aggregate fallbacks in live mode without creating unneeded or incomplete database tables or showing hardcoded fake values in live API responses.

---

## 6. Verification & Test Results
- **TypeScript Check (`npm run lint`)**: Passed cleanly with 0 errors.
- **Backend Test Suite (`npx vitest run`)**: 8/8 tests passed.
- **Applet Compilation (`compile_applet`)**: Succeeded cleanly.

---

## 7. Deferred Items to Batch 6
- Product, Category, Brand CRUD
- Order Management & Production Workflow CRUD
- Delivery Zone & Delivery Staff CRUD
