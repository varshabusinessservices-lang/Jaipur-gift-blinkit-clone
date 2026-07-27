import { Router } from 'express';
import { OrderController } from './order.controller';

const router = Router();
const controller = new OrderController();

// Webhook
router.post('/webhook/razorpay', controller.razorpayWebhook);

// Customer order routes
router.post('/', controller.createOrder);
router.get('/', controller.getCustomerOrders);
router.get('/:id', controller.getOrder);
router.get('/:id/timeline', controller.getOrderTimeline);
router.get('/:id/invoice', controller.getOrderInvoice);
router.post('/:id/cancel', controller.cancelOrder);

// Admin order routes
router.get('/admin/list', controller.adminListOrders);
router.get('/admin/stats', controller.adminGetStats);
router.get('/admin/:id', controller.adminGetOrder);
router.patch('/admin/:id/status', controller.adminUpdateStatus);

export { router as orderRoutes };
