import { Router } from 'express';
import { DeliveryController } from './delivery.controller';

const router = Router();
const controller = new DeliveryController();

// Tasks
router.post('/tasks', controller.initTask);
router.get('/tasks', controller.listTasks);
router.get('/tasks/:id', controller.getTask);

// Riders
router.get('/riders', controller.getRiders);

// Rider actions
router.post('/tasks/:id/assign', controller.assignRider);
router.post('/tasks/:id/accept', controller.riderAccept);
router.post('/tasks/:id/pickup', controller.pickup);
router.post('/tasks/:id/out-for-delivery', controller.outForDelivery);
router.post('/tasks/:id/arrived', controller.arrived);
router.post('/tasks/:id/verify-otp', controller.verifyOtp);
router.post('/tasks/:id/proof-of-delivery', controller.proofOfDelivery);
router.post('/tasks/:id/exception', controller.exception);

// Customer Tracking
router.get('/customer/order/:orderId/tracking', controller.customerTracking);

export { router as deliveryRoutes };
