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
import { PlaceholderPage } from "../../pages/PlaceholderPage";
import { NotFoundPage } from "../../pages/NotFoundPage";
import { RouteErrorBoundary } from "../../components/common/RouteErrorBoundary";
import { ProtectedRoute } from "../../components/common/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/admin/dashboard" replace />,
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
        element: <PlaceholderPage title="Orders" />,
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
        element: <PlaceholderPage title="Customers" />,
      },
      {
        path: "reports",
        element: <PlaceholderPage title="Reports" />,
      },
      {
        path: "settings",
        element: <PlaceholderPage title="Settings" />,
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
