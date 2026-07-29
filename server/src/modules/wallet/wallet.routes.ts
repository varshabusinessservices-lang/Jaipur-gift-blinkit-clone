import { requirePermission } from '../../middlewares/permissions';
import { Router } from 'express';
import { WalletController } from './wallet.controller';
import { WalletAdminController } from './wallet.admin.controller';

export const customerWalletRouter = Router();
export const adminWalletRouter = Router();

// Webhook endpoint (unauthenticated)
customerWalletRouter.post('/webhook', WalletController.webhookVerifyPayment);

// Customer Wallet routes
customerWalletRouter.get('/', WalletController.getSummary);
customerWalletRouter.get('/summary', WalletController.getSummary);
customerWalletRouter.post('/topup', WalletController.initiateTopUp);
customerWalletRouter.post('/topups', WalletController.initiateTopUp);
customerWalletRouter.post('/topups/:topUpId/confirm', WalletController.confirmTopUp);
customerWalletRouter.post('/refunds/calculate', WalletController.calculateRefund);
customerWalletRouter.post('/refunds', WalletController.processRefund);
customerWalletRouter.post('/calculate', WalletController.calculateAllocation);
customerWalletRouter.post('/reserve', WalletController.reserve);
customerWalletRouter.post('/consume', WalletController.consume);
customerWalletRouter.post('/release', WalletController.release);
customerWalletRouter.post('/full-payment', WalletController.fullPayment);
customerWalletRouter.post('/simulate', WalletController.simulate);

// Admin Wallet Slabs, Reconciliation & Admin routes
adminWalletRouter.get('/slabs', WalletAdminController.getSlabs);
adminWalletRouter.post('/slabs', WalletAdminController.createSlab);
adminWalletRouter.put('/slabs/:id', WalletAdminController.updateSlab);
adminWalletRouter.delete('/slabs/:id', WalletAdminController.deleteSlab);

adminWalletRouter.post('/simulate', WalletAdminController.simulate);
adminWalletRouter.get('/metrics', WalletAdminController.getMetrics);
adminWalletRouter.post('/reconcile', WalletAdminController.runReconciliation);
adminWalletRouter.get('/accounts', requirePermission('wallet.view'), WalletAdminController.getAccounts);
adminWalletRouter.get('/transactions', requirePermission('wallet.view'), WalletAdminController.getTransactions);
adminWalletRouter.get('/ledger', requirePermission('wallet.view'), WalletAdminController.getLedger);
adminWalletRouter.get('/credit-lots', requirePermission('wallet.view'), WalletAdminController.getCreditLots);
adminWalletRouter.get('/reservations', requirePermission('wallet.view'), WalletAdminController.getReservations);
adminWalletRouter.get('/topups', requirePermission('wallet.view'), WalletAdminController.getTopups);
adminWalletRouter.get('/adjustments', requirePermission('wallet.view'), WalletAdminController.getAdjustments);
adminWalletRouter.get('/refunds', requirePermission('wallet.view'), WalletAdminController.getRefunds);
adminWalletRouter.get('/expiring', requirePermission('wallet.view'), WalletAdminController.getExpiring);
adminWalletRouter.get('/reconciliation', requirePermission('financial.reconciliation'), WalletAdminController.getReconciliationRecords);

export default customerWalletRouter;
