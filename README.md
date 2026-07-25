# Jaipur Personalised Gifts

## Architecture
- **Frontend:** React 19 + TypeScript + Vite, using Zustand and TanStack Query.
- **Backend:** Node.js + Express + TypeScript, Prisma ORM (MySQL).
- **Setup:** Monorepo structure where the backend serves the frontend assets in production and proxies them in development.

## Local Development Setup
- **Node version required:** v20+ (v22+ recommended)
- **Database:** MySQL 8+ required for data persistence.

## Environment Files
- `.env`: Frontend environment variables
- `server/.env`: Backend environment variables (including `DATABASE_URL`)

## Commands
- `npm run dev`: Starts the combined backend + frontend dev server on port 3000
- `npm run build`: Builds both frontend and backend
- `npm run prisma:generate`: Generates the Prisma client
- `npm run prisma:migrate`: Applies DB migrations
- `npm run prisma:seed`: Seeds the database

## Mock Mode
When `VITE_ADMIN_USE_MOCK_API=true`, the frontend will gracefully fall back to mock data and not show errors if the backend is unavailable.

## Security Notes
- No real credentials are included in the source code.
- Passwords and OTPs are not logged.
- The `DATABASE_URL` in `.env.example` points to a placeholder.

## Batch 4 Features (Super Admin Security & Profile Module)
- **Profile Management:** View/edit name & mobile, upload avatar (`FileAsset`), remove avatar.
- **Password Security:** Password change with 6-digit email OTP verification, strict strength checks (12+ chars, uppercase, lowercase, numbers, special symbols), session revocation on change.
- **Two-Stage Email Change:** Verification of current email OTP, new email OTP, and password confirmation.
- **Session Management:** View active sessions with device/IP metadata, revoke individual sessions, revoke all other devices, or logout everywhere.
- **Security Audit Trail:** Comprehensive activity log tracking logins, password updates, email changes, and session revocations.

## Batch 5 Features (Super Admin Dashboard Foundation)
- **Route:** `/admin/dashboard`
- **Dashboard Endpoints (`/api/v1/admin/dashboard/*`):**
  - `GET /overview`: Primary aggregated dashboard load
  - `GET /summary`: 16 core business & operational summary metrics
  - `GET /revenue-orders`: Daily/weekly sales & order count series
  - `GET /order-history`: Daily placed/delivered/cancelled volume
  - `GET /order-funnel`: 10-stage lifecycle funnel + exceptions
  - `GET /customer-insights`: New vs repeat customer analytics
  - `GET /top-products`: Top 10 selling products (revenue/units)
  - `GET /top-categories`: Sales share by category
  - `GET /top-delivery-boys`: Delivery rider performance & COD tracking
  - `GET /recent-orders`: Hyperlocal order dispatch queue
  - `GET /personalisation-attention`: Operational alerts for blocked personalised items
  - `GET /delivery-overview`: Hyperlocal SLA commitments
  - `GET /overnight-orders`: Morning production queue for off-hours orders
  - `GET /low-stock`: Raw printing materials low stock alerts
- **Date Filters:** Today, Last 3 Days, Last 7 Days, Last 15 Days, Last 30 Days, Custom Range (up to 365 days). Timezone fixed to `Asia/Kolkata`.
- **Currency:** Indian Rupee (`INR`, `en-IN`).
- **Mock vs Live Mode:**
  - `VITE_ADMIN_USE_MOCK_API=true`: Uses deterministic mock dashboard service with Jaipur gifting datasets.
  - `VITE_ADMIN_USE_MOCK_API=false`: Calls live API endpoints. Live mode returns honest zero/empty aggregates when commerce models do not exist yet.

## Batch 6 Features (Category Management Module)
- **Hierarchy Support:** Main categories, subcategories, and unlimited nested child categories with parent-child relationship management.
- **Views:** Category Tree View with drag/reorder controls, List View, Category Add/Edit Forms, Category Detail View, Category Trash Bin with Soft Delete & Restore.
- **Media & SEO:** FileAsset integration for Category Images and Icons, SEO meta titles, meta descriptions, canonical slugs, and keywords.
- **Sales Placeholders:** Prepared for future category sales analytics.

## Batch 7 Features (Brands & Tax Rates Management Modules)
- **Brand Management (`/admin/brands`):**
  - Complete Brand CRUD with brand logo (`BRAND_LOGO`), banner (`BRAND_BANNER`), and SEO image asset bindings.
  - Slug generation, brand code uniqueness validation, featured brand highlights, active/inactive control, duplicate brand, and soft delete/restore.
  - Public read-only brand APIs (`/api/v1/brands`, `/api/v1/brands/:slug`).
- **Tax Rates & GST Slabs (`/admin/tax-rates`):**
  - Full GST slab management (0%, 5%, 12%, 18% default, 28% luxury).
  - Component rate breakdowns (CGST, SGST, IGST, Cess), HSN/SAC code classifications, tax-inclusive and tax-exclusive pricing rules.
  - Single default tax rate enforcement across the store with transaction safety.
  - **Interactive Live GST Calculator** widget for testing tax splits.
  - Audit logging for all tax rate updates and soft-deletion/restoration workflows.

## Deferred to Future Batches
- Products, Product Attributes, Variations, and Personalisation Forms (Batch 8+).
