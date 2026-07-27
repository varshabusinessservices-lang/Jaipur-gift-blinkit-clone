import { createBrowserRouter, Navigate } from "react-router-dom";
import { AdminLayout } from "../../layouts/AdminLayout";
import { LoginPage } from "../../features/auth/pages/LoginPage";
import { ForgotPasswordPage } from "../../features/auth/pages/ForgotPasswordPage";
import { ResetPasswordPage } from "../../features/auth/pages/ResetPasswordPage";
import { ProfilePage } from "../../features/admin/pages/ProfilePage";
import { PasswordChangePage } from "../../features/admin/pages/PasswordChangePage";
import { EmailChangePage } from "../../features/admin/pages/EmailChangePage";
import { SessionsPage } from "../../features/admin/pages/SessionsPage";
import { SecurityActivityPage } from "../../features/admin/pages/SecurityActivityPage";
import { DashboardPage } from "../../features/dashboard/pages/DashboardPage";
import { CategoryListPage } from "../../features/categories/pages/CategoryListPage";
import { BrandListPage } from "../../features/brands/pages/BrandListPage";
import { BrandCreatePage } from "../../features/brands/pages/BrandCreatePage";
import { BrandEditPage } from "../../features/brands/pages/BrandEditPage";
import { BrandDetailPage } from "../../features/brands/pages/BrandDetailPage";
import { BrandTrashPage } from "../../features/brands/pages/BrandTrashPage";
import { TaxRateListPage } from "../../features/taxRates/pages/TaxRateListPage";
import { TaxRateCreatePage } from "../../features/taxRates/pages/TaxRateCreatePage";
import { TaxRateEditPage } from "../../features/taxRates/pages/TaxRateEditPage";
import { TaxRateTrashPage } from "../../features/taxRates/pages/TaxRateTrashPage";
import { ProductAttributeListPage } from "../../features/productAttributes/pages/ProductAttributeListPage";
import { ProductAttributeCreatePage } from "../../features/productAttributes/pages/ProductAttributeCreatePage";
import { ProductAttributeEditPage } from "../../features/productAttributes/pages/ProductAttributeEditPage";
import { ProductAttributeDetailPage } from "../../features/productAttributes/pages/ProductAttributeDetailPage";
import { AttributeGroupsPage } from "../../features/productAttributes/pages/AttributeGroupsPage";
import { ProductAddonListPage } from "../../features/productAddons/pages/ProductAddonListPage";
import { ProductAddonCreatePage } from "../../features/productAddons/pages/ProductAddonCreatePage";
import { ProductAddonEditPage } from "../../features/productAddons/pages/ProductAddonEditPage";
import { ProductAddonDetailPage } from "../../features/productAddons/pages/ProductAddonDetailPage";
import { ProductAddonTrashPage } from "../../features/productAddons/pages/ProductAddonTrashPage";
import { AddonGroupListPage } from "../../features/productAddons/pages/AddonGroupListPage";
import { ProductListPage } from "../../features/products/pages/ProductListPage";
import { ProductCreatePage } from "../../features/products/pages/ProductCreatePage";
import { ProductEditPage } from "../../features/products/pages/ProductEditPage";
import { ProductDetailPage } from "../../features/products/pages/ProductDetailPage";
import { ProductTrashPage } from "../../features/products/pages/ProductTrashPage";
import { VariationListPage } from "../../features/products/pages/VariationListPage";
import { VariationGeneratePage } from "../../features/products/pages/VariationGeneratePage";
import { VariationCreatePage } from "../../features/products/pages/VariationCreatePage";
import { VariationEditPage } from "../../features/products/pages/VariationEditPage";
import { PersonalisationFormListPage } from "../../features/personalisationForms/pages/PersonalisationFormListPage";
import { PersonalisationFormCreatePage } from "../../features/personalisationForms/pages/PersonalisationFormCreatePage";
import { PersonalisationFormEditPage } from "../../features/personalisationForms/pages/PersonalisationFormEditPage";
import { PersonalisationFormDetailPage } from "../../features/personalisationForms/pages/PersonalisationFormDetailPage";
import { CustomerUploadsListPage } from "../../features/customerUploads/pages/CustomerUploadsListPage";
import { CustomerUploadDetailPage } from "../../features/customerUploads/pages/CustomerUploadDetailPage";
import { UploadSessionListPage } from "../../features/customerUploads/pages/UploadSessionListPage";
import { UploadSessionDetailPage } from "../../features/customerUploads/pages/UploadSessionDetailPage";
import { CleanupManagerPage } from "../../features/customerUploads/pages/CleanupManagerPage";
import { FinanceDashboardPage } from "../../features/finance/pages/FinanceDashboardPage";
import { EnterpriseStoreDashboardPage } from "../../features/enterpriseStore/pages/EnterpriseStoreDashboardPage";
import { ProductionDashboardPage } from "../../features/productionReadiness/pages/ProductionDashboardPage";
import { DeliveryZonesManagementPage } from "../../features/deliveryZones/pages/DeliveryZonesManagementPage";
import { SettingsLayout } from "../../layouts/SettingsLayout";
import { SystemSettingsPage } from "../../features/settings/pages/SystemSettingsPage";
import { WebSettingsPage } from "../../features/settings/pages/WebSettingsPage";
import { AppSettingsPage } from "../../features/settings/pages/AppSettingsPage";
import { HomeSettingsPage } from "../../features/settings/pages/HomeSettingsPage";
import { AuthSettingsPage } from "../../features/settings/pages/AuthSettingsPage";
import { EmailSettingsPage } from "../../features/settings/pages/EmailSettingsPage";
import { PaymentSettingsPage } from "../../features/settings/pages/PaymentSettingsPage";
import { NotificationSettingsPage } from "../../features/settings/pages/NotificationSettingsPage";
import { DeliveryBoySettingsPage } from "../../features/settings/pages/DeliveryBoySettingsPage";
import { PlaceholderPage } from "../../pages/PlaceholderPage";
import { NotFoundPage } from "../../pages/NotFoundPage";
import { RouteErrorBoundary } from "../../components/common/RouteErrorBoundary";
import { ProtectedRoute } from "../../components/common/ProtectedRoute";
import { OrdersManagementPage } from "../../features/orders/pages/OrdersManagementPage";
import { DispatchManagementPage } from "../../features/dispatch/pages/DispatchManagementPage";
import { BannersManagementPage } from "../../features/banners/pages/BannersManagementPage";
import { FeaturedSectionsManagementPage } from "../../features/featuredSections/pages/FeaturedSectionsManagementPage";
import { CouponsManagementPage } from "../../features/coupons/pages/CouponsManagementPage";
import { NotificationsManagementPage } from "../../features/notifications/pages/NotificationsManagementPage";
import { CustomersManagementPage } from "../../features/customers/pages/CustomersManagementPage";
import { DeliveryBoysManagementPage } from "../../features/deliveryBoys/pages/DeliveryBoysManagementPage";
import { DesignSystemShowcasePage } from "../../features/frontend/pages/DesignSystemShowcasePage";
import { HomePage } from "../../features/frontend/pages/HomePage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/design-system",
    element: <DesignSystemShowcasePage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/admin",
    element: <Navigate to="/admin/dashboard" replace />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/admin/login",
    element: <LoginPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/admin/forgot-password",
    element: <ForgotPasswordPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/admin/reset-password",
    element: <ResetPasswordPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        path: "dashboard",
        element: <DashboardPage />,
      },
      {
        path: "profile",
        element: <ProfilePage />,
      },
      {
        path: "profile/security/email",
        element: <EmailChangePage />,
      },
      {
        path: "profile/security/password",
        element: <PasswordChangePage />,
      },
      {
        path: "profile/sessions",
        element: <SessionsPage />,
      },
      {
        path: "profile/security-activity",
        element: <SecurityActivityPage />,
      },
      {
        path: "sales/orders",
        element: <OrdersManagementPage />,
      },
      {
        path: "orders",
        element: <OrdersManagementPage />,
      },
      {
        path: "dispatch",
        element: <DispatchManagementPage />,
      },
      {
        path: "banners",
        element: <BannersManagementPage />,
      },
      {
        path: "featured-sections",
        element: <FeaturedSectionsManagementPage />,
      },
      {
        path: "coupons",
        element: <CouponsManagementPage />,
      },
      {
        path: "notifications",
        element: <NotificationsManagementPage />,
      },
      {
        path: "sales/invoices",
        element: <PlaceholderPage title="Invoices" />,
      },
      {
        path: "products",
        element: <ProductListPage />,
      },
      {
        path: "products/create",
        element: <ProductCreatePage />,
      },
      {
        path: "products/new",
        element: <ProductCreatePage />,
      },
      {
        path: "products/trash",
        element: <ProductTrashPage />,
      },
      {
        path: "products/edit/:id",
        element: <ProductEditPage />,
      },
      {
        path: "products/:id/edit",
        element: <ProductEditPage />,
      },
      {
        path: "products/:productId/variations",
        element: <VariationListPage />,
      },
      {
        path: "products/:productId/variations/generate",
        element: <VariationGeneratePage />,
      },
      {
        path: "products/:productId/variations/new",
        element: <VariationCreatePage />,
      },
      {
        path: "products/:productId/variations/:variationId",
        element: <VariationEditPage />,
      },
      {
        path: "products/:productId/variations/:variationId/edit",
        element: <VariationEditPage />,
      },
      {
        path: "products/:id",
        element: <ProductDetailPage />,
      },
      {
        path: "catalog/products",
        element: <ProductListPage />,
      },
      {
        path: "catalog/categories",
        element: <CategoryListPage />,
      },
      {
        path: "categories",
        element: <CategoryListPage />,
      },
      {
        path: "brands",
        element: <BrandListPage />,
      },
      {
        path: "brands/new",
        element: <BrandCreatePage />,
      },
      {
        path: "brands/trash",
        element: <BrandTrashPage />,
      },
      {
        path: "brands/:id",
        element: <BrandDetailPage />,
      },
      {
        path: "brands/:id/edit",
        element: <BrandEditPage />,
      },
      {
        path: "tax-rates",
        element: <TaxRateListPage />,
      },
      {
        path: "tax-rates/new",
        element: <TaxRateCreatePage />,
      },
      {
        path: "tax-rates/trash",
        element: <TaxRateTrashPage />,
      },
      {
        path: "tax-rates/:id/edit",
        element: <TaxRateEditPage />,
      },
      {
        path: "product-attributes",
        element: <ProductAttributeListPage />,
      },
      {
        path: "product-attributes/new",
        element: <ProductAttributeCreatePage />,
      },
      {
        path: "product-attributes/:id",
        element: <ProductAttributeDetailPage />,
      },
      {
        path: "product-attributes/:id/edit",
        element: <ProductAttributeEditPage />,
      },
      {
        path: "attribute-groups",
        element: <AttributeGroupsPage />,
      },
      {
        path: "product-addons",
        element: <ProductAddonListPage />,
      },
      {
        path: "product-addons/new",
        element: <ProductAddonCreatePage />,
      },
      {
        path: "product-addons/trash",
        element: <ProductAddonTrashPage />,
      },
      {
        path: "product-addons/:id",
        element: <ProductAddonDetailPage />,
      },
      {
        path: "product-addons/:id/edit",
        element: <ProductAddonEditPage />,
      },
      {
        path: "addon-groups",
        element: <AddonGroupListPage />,
      },
      {
        path: "personalisation-forms",
        element: <PersonalisationFormListPage />,
      },
      {
        path: "personalisation-forms/new",
        element: <PersonalisationFormCreatePage />,
      },
      {
        path: "personalisation-forms/:id",
        element: <PersonalisationFormDetailPage />,
      },
      {
        path: "personalisation-forms/:id/edit",
        element: <PersonalisationFormEditPage />,
      },
      {
        path: "customer-uploads",
        element: <CustomerUploadsListPage />,
      },
      {
        path: "customer-uploads/:id",
        element: <CustomerUploadDetailPage />,
      },
      {
        path: "upload-sessions",
        element: <UploadSessionListPage />,
      },
      {
        path: "upload-sessions/:id",
        element: <UploadSessionDetailPage />,
      },
      {
        path: "customer-uploads/cleanup",
        element: <CleanupManagerPage />,
      },
      {
        path: "catalog/personalisation-forms",
        element: <PersonalisationFormListPage />,
      },
      {
        path: "catalog/addons",
        element: <ProductAddonListPage />,
      },
      {
        path: "catalog/attributes",
        element: <ProductAttributeListPage />,
      },
      {
        path: "customers",
        element: <CustomersManagementPage />,
      },
      {
        path: "delivery-boys",
        element: <DeliveryBoysManagementPage />,
      },
      {
        path: "finance",
        element: <FinanceDashboardPage />,
      },
      {
        path: "enterprise",
        element: <EnterpriseStoreDashboardPage />,
      },
      {
        path: "production",
        element: <ProductionDashboardPage />,
      },
      {
        path: "delivery-zones",
        element: <DeliveryZonesManagementPage />,
      },
      {
        path: "reports",
        element: <PlaceholderPage title="Reports" />,
      },
      {
        path: "settings",
        element: <SettingsLayout />,
        children: [
          { index: true, element: <Navigate to="system" replace /> },
          { path: "system", element: <SystemSettingsPage /> },
          { path: "web", element: <WebSettingsPage /> },
          { path: "website", element: <Navigate to="web" replace /> },
          { path: "seo-integrations", element: <Navigate to="web" replace /> },
          { path: "legal", element: <Navigate to="web" replace /> },
          { path: "app", element: <AppSettingsPage /> },
          { path: "home", element: <HomeSettingsPage /> },
          { path: "home-general", element: <Navigate to="home" replace /> },
          { path: "home-general-settings", element: <Navigate to="home" replace /> },
          { path: "authentication", element: <AuthSettingsPage /> },
          { path: "email", element: <EmailSettingsPage /> },
          { path: "payment", element: <PaymentSettingsPage /> },
          { path: "payments", element: <Navigate to="payment" replace /> },
          { path: "notification", element: <NotificationSettingsPage /> },
          { path: "notifications", element: <Navigate to="notification" replace /> },
          { path: "delivery-boy", element: <DeliveryBoySettingsPage /> },
          { path: "delivery", element: <Navigate to="delivery-boy" replace /> },
          { path: "delivery-zones", element: <DeliveryZonesManagementPage /> },
          { path: "personalisation", element: <Navigate to="system" replace /> },
          { path: "orders-returns", element: <Navigate to="system" replace /> },
          { path: "storage-privacy", element: <Navigate to="system" replace /> },
        ]
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
