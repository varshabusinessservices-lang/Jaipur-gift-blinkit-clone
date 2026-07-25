import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware';
import * as dashboardController from './dashboard.controller';

export const dashboardRouter = Router();

dashboardRouter.use(requireAuth);

dashboardRouter.get('/overview', dashboardController.getOverview);
dashboardRouter.get('/summary', dashboardController.getSummary);
dashboardRouter.get('/revenue-orders', dashboardController.getRevenueOrders);
dashboardRouter.get('/order-history', dashboardController.getOrderHistory);
dashboardRouter.get('/order-funnel', dashboardController.getOrderFunnel);
dashboardRouter.get('/customer-insights', dashboardController.getCustomerInsights);
dashboardRouter.get('/top-products', dashboardController.getTopProducts);
dashboardRouter.get('/top-categories', dashboardController.getTopCategories);
dashboardRouter.get('/top-delivery-boys', dashboardController.getTopDeliveryBoys);
dashboardRouter.get('/recent-orders', dashboardController.getRecentOrders);
dashboardRouter.get('/personalisation-attention', dashboardController.getPersonalisationAttention);
dashboardRouter.get('/delivery-overview', dashboardController.getDeliveryOverview);
dashboardRouter.get('/overnight-orders', dashboardController.getOvernightOrders);
dashboardRouter.get('/low-stock', dashboardController.getLowStock);
