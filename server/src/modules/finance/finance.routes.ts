import { Router } from 'express';
import { FinanceController } from './finance.controller';

const router = Router();
const controller = new FinanceController();

// Admin Finance & Ledger Endpoints
router.get('/admin/finance/dashboard', controller.getDashboard);
router.get('/admin/finance/ledger', controller.getLedger);
router.get('/admin/finance/revenue', controller.getRevenue);
router.get('/admin/finance/settlements', controller.getSettlements);

// Wallet Endpoints
router.get('/wallet/history', controller.getWalletHistory);
router.get('/admin/wallet', controller.adminWalletList);

// Reports Endpoints
router.get('/admin/reports/orders', controller.getOrderReport);
router.get('/admin/reports/products', controller.getProductReport);
router.get('/admin/reports/customers', controller.getCustomerReport);
router.get('/admin/reports/production', controller.getProductionReport);
router.get('/admin/reports/delivery', controller.getDeliveryReport);
router.get('/admin/reports/returns', controller.getReturnReport);

// Exports
router.post('/admin/reports/export', controller.createExport);

export default router;
