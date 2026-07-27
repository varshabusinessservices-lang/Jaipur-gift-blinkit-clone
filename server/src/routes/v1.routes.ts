import { Router } from 'express';
import { healthRouter } from '../modules/health/health.routes';
import { systemRouter } from '../modules/system/system.routes';
import { authRouter } from '../modules/auth/auth.routes';

import { adminRouter } from '../modules/admin/admin.routes';
import { publicBrandRouter } from '../modules/brands/publicBrand.routes';
import { publicProductAttributeRouter } from '../modules/productAttributes/publicProductAttribute.routes';
import { publicProductRouter } from '../modules/products/publicProducts.routes';
import { publicProductAddonRouter } from '../modules/productAddons/publicProductAddon.routes';
import { publicPersonalisationFormRouter } from '../modules/personalisationForms/personalisationForms.routes';
import { customerUploadRouter } from '../modules/customerUploads/customerUploads.routes';
import { customerRouter } from '../modules/customers/customers.routes';
import { customerAdminRouter } from '../modules/customers/customers.admin.routes';
import { cartRoutes } from '../modules/cart/cart.routes';
import { checkoutRoutes } from '../modules/checkout/checkout.routes';
import { orderRoutes } from '../modules/orders/order.routes';
import { productionRoutes } from '../modules/production/production.routes';
import { deliveryRoutes } from '../modules/delivery/delivery.routes';
import { returnsRoutes } from '../modules/returns/returns.routes';
import { supportRoutes } from '../modules/support/support.routes';
import { notificationRoutes } from '../modules/notifications/notifications.routes';
import { adminNotificationRoutes } from '../modules/notifications/notifications.admin.routes';
import financeRoutes from '../modules/finance/finance.routes';
import enterpriseStoreRoutes from '../modules/enterpriseStore/enterpriseStore.routes';
import productionReadinessRoutes from '../modules/productionReadiness/productionReadiness.routes';
import deliveryZonesRoutes from '../modules/deliveryZones/deliveryZones.routes';
import settingsRoutes from '../modules/settings/settings.routes';
import { paymentSettingsRoutes } from '../modules/settings/paymentSettings.routes';

export const v1Routes = Router();

v1Routes.use('/health', healthRouter);
v1Routes.use('/system', systemRouter);
v1Routes.use('/auth', authRouter);
v1Routes.use('/admin', adminRouter);
v1Routes.use('/admin/customers', customerAdminRouter);
v1Routes.use('/admin/returns', returnsRoutes);
v1Routes.use('/admin/support', supportRoutes);
v1Routes.use('/admin/notifications', adminNotificationRoutes);
v1Routes.use('/', financeRoutes);
v1Routes.use('/admin/enterprise', enterpriseStoreRoutes);
v1Routes.use('/admin/production', productionReadinessRoutes);
v1Routes.use('/', deliveryZonesRoutes);
v1Routes.use('/', settingsRoutes);
v1Routes.use('/', paymentSettingsRoutes);


v1Routes.use('/customers', customerRouter);
v1Routes.use('/brands', publicBrandRouter);
v1Routes.use('/product-attributes', publicProductAttributeRouter);
v1Routes.use('/products', publicProductRouter);
v1Routes.use('/products', publicProductAddonRouter);
v1Routes.use('/personalisation-forms', publicPersonalisationFormRouter);
v1Routes.use('/cart', cartRoutes);
v1Routes.use('/checkouts', checkoutRoutes);
v1Routes.use('/orders', orderRoutes);
v1Routes.use('/production', productionRoutes);
v1Routes.use('/delivery', deliveryRoutes);
v1Routes.use('/returns', returnsRoutes);
v1Routes.use('/support', supportRoutes);
v1Routes.use('/refunds', returnsRoutes); // For GET /refunds or /returns/refunds/ledger
v1Routes.use('/notifications', notificationRoutes);
v1Routes.use('/notification-preferences', notificationRoutes);

v1Routes.use('/', customerUploadRouter);

// v1Routes.use('/stores', storeRouter);
// v1Routes.use('/settings', settingsRouter);
