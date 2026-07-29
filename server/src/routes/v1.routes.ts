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
import appearanceRoutes from '../modules/settings/appearance.routes';
import appearanceStorefrontRoutes from '../modules/settings/appearance.storefront.routes';
import { customerWalletRouter, adminWalletRouter } from '../modules/wallet/wallet.routes';
import { customerRewardRouter, adminRewardRouter } from '../modules/rewards/reward.routes';
import { customerReferralRouter } from '../modules/referrals/referral.customer.controller';
import { adminReferralRouter } from '../modules/referrals/referral.admin.controller';
import { internalReferralJobsRouter } from '../modules/referrals/referral.jobs.controller';
import { reportRouter } from '../modules/reports/report.routes';

export const v1Routes = Router();

// Harmless API Root Endpoint
v1Routes.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      name: 'Jaipur Gifting API',
      version: 'v1',
      status: 'running'
    }
  });
});

v1Routes.use('/health', healthRouter);
v1Routes.use('/system', systemRouter);
v1Routes.use('/auth', authRouter);
v1Routes.use('/admin', adminRouter);
v1Routes.use('/admin/customers', customerAdminRouter);
v1Routes.use('/admin/returns', returnsRoutes);
v1Routes.use('/admin/support', supportRoutes);
v1Routes.use('/admin/notifications', adminNotificationRoutes);
v1Routes.use('/admin/reports', reportRouter);
v1Routes.use('/admin/appearance', appearanceRoutes);
v1Routes.use('/storefront/appearance', appearanceStorefrontRoutes);
v1Routes.use('/', financeRoutes);
v1Routes.use('/admin/enterprise', enterpriseStoreRoutes);
v1Routes.use('/admin/production', productionReadinessRoutes);
v1Routes.use('/', deliveryZonesRoutes);
v1Routes.use('/', settingsRoutes);
v1Routes.use('/', paymentSettingsRoutes);
v1Routes.use('/wallet', customerWalletRouter);
v1Routes.use('/admin/wallet', adminWalletRouter);
v1Routes.use('/rewards', customerRewardRouter);
v1Routes.use('/admin/rewards', adminRewardRouter);
v1Routes.use('/referrals', customerReferralRouter);
v1Routes.use('/admin/referrals', adminReferralRouter);
v1Routes.use('/internal/jobs/referrals', internalReferralJobsRouter);


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

// General File Asset Viewer/Downloader
v1Routes.get('/files/:fileAssetId', async (req, res, next) => {
  try {
    const { fileAssetId } = req.params;
    const { prisma } = await import('../database/prisma');
    const path = await import('path');
    const fs = await import('fs');

    const fileAsset = await prisma.fileAsset.findUnique({
      where: { id: fileAssetId }
    });

    if (!fileAsset) {
      return res.status(404).send('File not found');
    }

    // Determine the absolute path on disk
    let physicalPath = '';
    if (fileAsset.storagePath.startsWith('/uploads/')) {
      physicalPath = path.join(process.cwd(), fileAsset.storagePath);
    } else {
      const STORAGE_ROOT = process.env.CUSTOMER_UPLOAD_PRIVATE_ROOT || 'storage/customer-uploads';
      physicalPath = path.join(process.cwd(), STORAGE_ROOT, fileAsset.storagePath);
    }

    if (fs.existsSync(physicalPath)) {
      res.setHeader('Content-Type', fileAsset.mimeType || 'image/png');
      return res.sendFile(physicalPath);
    } else {
      // Graceful fallback to Unsplash placeholder images to prevent broken images
      if (fileAsset.ownerType === 'BRAND' || fileAsset.role === 'BRAND_LOGO') {
        return res.redirect('https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=400');
      } else if (fileAsset.ownerType === 'CATEGORY') {
        return res.redirect('https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&q=80&w=400');
      } else {
        return res.redirect('https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80');
      }
    }
  } catch (error) {
    next(error);
  }
});

v1Routes.use('/', customerUploadRouter);

// v1Routes.use('/stores', storeRouter);
// v1Routes.use('/settings', settingsRouter);
