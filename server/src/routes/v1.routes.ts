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

export const v1Routes = Router();

v1Routes.use('/health', healthRouter);
v1Routes.use('/system', systemRouter);
v1Routes.use('/auth', authRouter);
v1Routes.use('/admin', adminRouter);
v1Routes.use('/brands', publicBrandRouter);
v1Routes.use('/product-attributes', publicProductAttributeRouter);
v1Routes.use('/products', publicProductRouter);
v1Routes.use('/products', publicProductAddonRouter);
v1Routes.use('/personalisation-forms', publicPersonalisationFormRouter);
// v1Routes.use('/stores', storeRouter);
// v1Routes.use('/settings', settingsRouter);
