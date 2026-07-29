import { Router } from 'express';
import { ReportController } from './report.controller';
import { requireAuth } from '../../middlewares/auth.middleware';

export const reportRouter = Router();

reportRouter.use(requireAuth);

reportRouter.get('/overview', ReportController.getOverview);
reportRouter.get('/sales', ReportController.getSales);
reportRouter.get('/orders', ReportController.getOrders);
reportRouter.get('/payments', ReportController.getPayments);
reportRouter.get('/wallet', ReportController.getWallet);
reportRouter.get('/rewards', ReportController.getRewards);
reportRouter.get('/referrals', ReportController.getReferrals);
reportRouter.get('/refunds', ReportController.getRefunds);
reportRouter.get('/customers', ReportController.getCustomers);
reportRouter.get('/delivery', ReportController.getDelivery);
reportRouter.get('/taxes', ReportController.getTaxes);

reportRouter.post('/export', ReportController.exportReport);
reportRouter.get('/exports', ReportController.getExportHistory);
reportRouter.get('/exports/:id/download', ReportController.downloadExportJob);
