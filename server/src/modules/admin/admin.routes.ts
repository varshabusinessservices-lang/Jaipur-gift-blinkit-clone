import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware';
import * as profileController from './profile.controller';
import * as securityController from './security.controller';
import { dashboardRouter } from '../dashboard/dashboard.routes';
import { categoryRouter } from '../categories/category.routes';
import { brandRouter } from '../brands/brand.routes';
import { taxRateRouter } from '../taxRates/taxRate.routes';
import { productAttributeRouter, attributeGroupRouter } from '../productAttributes/productAttribute.routes';
import { productRouter } from '../products/products.routes';
import { productAddonRouter } from '../productAddons/productAddon.routes';
import { addonGroupRouter } from '../productAddons/addonGroup.routes';
import { personalisationFormRouter } from '../personalisationForms/personalisationForms.routes';
import { customerUploadAdminRouter } from '../customerUploads/customerUploads.admin.routes';
import multer from 'multer';

export const adminRouter = Router();

const upload = multer({ 
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

adminRouter.use(requireAuth);

// Dashboard
adminRouter.use('/dashboard', dashboardRouter);

// Categories
adminRouter.use('/categories', categoryRouter);

// Brands
adminRouter.use('/brands', brandRouter);

// Tax Rates
adminRouter.use('/tax-rates', taxRateRouter);

// Product Attributes
adminRouter.use('/product-attributes', productAttributeRouter);

// Attribute Groups
adminRouter.use('/attribute-groups', attributeGroupRouter);

// Products
adminRouter.use('/products', productRouter);

// Product Add-ons
adminRouter.use('/product-addons', productAddonRouter);

// Add-on Groups
adminRouter.use('/addon-groups', addonGroupRouter);

// Personalisation Forms
adminRouter.use('/personalisation-forms', personalisationFormRouter);

// Customer Uploads Manager
adminRouter.use('/customer-uploads', customerUploadAdminRouter);


// Profile
adminRouter.patch('/profile', profileController.updateProfile);
adminRouter.post('/profile/avatar', upload.single('avatar'), profileController.uploadAvatar);
adminRouter.delete('/profile/avatar', profileController.deleteAvatar);

// Security - Password
adminRouter.post('/security/password/request-otp', securityController.requestPasswordOtp);
adminRouter.post('/security/password/verify-otp', securityController.verifyPasswordOtp);
adminRouter.post('/security/password/change', securityController.changePassword);

// Security - Email
adminRouter.post('/security/email/request-old-email-otp', securityController.requestOldEmailOtp);
adminRouter.post('/security/email/verify-old-email-otp', securityController.verifyOldEmailOtp);
adminRouter.post('/security/email/request-new-email-otp', securityController.requestNewEmailOtp);
adminRouter.post('/security/email/verify-new-email-otp', securityController.verifyNewEmailOtp);
adminRouter.post('/security/email/change', securityController.changeEmail);

// Security - Sessions
adminRouter.get('/security/sessions', securityController.getSessions);
adminRouter.delete('/security/sessions/:sessionId', securityController.revokeSession);
adminRouter.post('/security/sessions/revoke-all-others', securityController.revokeAllOtherSessions);
adminRouter.post('/security/sessions/logout-all', securityController.logoutAllSessions);

// Security - Activity
adminRouter.get('/security/activity', securityController.getSecurityActivity);
