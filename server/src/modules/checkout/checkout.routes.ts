import { Router } from 'express';
import { CheckoutController } from './checkout.controller';

const router = Router();
const controller = new CheckoutController();

// Customer checkout routes
router.post('/', controller.createSession);
router.get('/', controller.getCustomerSessions);
router.get('/:id', controller.getSession);
router.post('/:id/validate', controller.validateCheckout);
router.put('/:id/address', controller.updateAddress);
router.get('/service/check', controller.checkServiceability);
router.get('/delivery/slots', controller.getDeliverySlots);
router.post('/pricing/calculate', controller.calculatePricing);
router.post('/wallet/preview', controller.previewWallet);
router.post('/:id/coupon', controller.applyCoupon);
router.post('/:id/razorpay', controller.createRazorpayOrder);
router.post('/:id/consent', controller.recordConsent);
router.post('/payment-methods/resolve', controller.resolvePaymentMethods);

// Admin checkout routes
router.get('/admin/list', controller.adminListSessions);
router.get('/admin/stats', controller.adminGetStats);
router.get('/admin/:id', controller.adminGetSession);
router.put('/admin/:id/status', controller.adminUpdateStatus);

export { router as checkoutRoutes };
