import { requirePermission } from '../../middlewares/permissions';
import { Router } from 'express';
import { RewardController } from './reward.controller';

const customerRewardRouter = Router();
const adminRewardRouter = Router();

// Customer Reward Routes
customerRewardRouter.get('/', RewardController.getCustomerRewards);
customerRewardRouter.get('/history', RewardController.getCustomerRewardHistory);
customerRewardRouter.get('/claimable', RewardController.getCustomerClaimableRewards);
customerRewardRouter.get('/expiring', RewardController.getExpiringRewards);
customerRewardRouter.get('/notifications', RewardController.getNotifications);
customerRewardRouter.post('/notifications/:id/read', RewardController.markNotificationRead);
customerRewardRouter.post('/notifications/read-all', RewardController.markAllNotificationsRead);
customerRewardRouter.post('/claim', RewardController.claimCustomerReward);
customerRewardRouter.post('/simulate', RewardController.simulateCustomerReward);

// Admin Reward Routes
adminRewardRouter.get('/', RewardController.getAdminRewardSettings);
adminRewardRouter.put('/settings', RewardController.updateAdminRewardSettings);
adminRewardRouter.post('/simulate', RewardController.simulateAdminReward);
adminRewardRouter.get('/transactions', RewardController.getAdminTransactions);
adminRewardRouter.get('/recovery-cases', RewardController.getAdminRecoveryCases);
adminRewardRouter.get('/reconciliation', RewardController.getAdminReconciliation);
adminRewardRouter.post('/reconciliation/run', RewardController.runAdminReconciliation);
adminRewardRouter.post('/process-due', RewardController.processDueWorkers);
adminRewardRouter.post('/transactions/:id/fraud-hold', RewardController.applyFraudHold);
adminRewardRouter.post('/transactions/:id/fraud-release', RewardController.releaseFraudHold);


adminRewardRouter.get('/metrics', requirePermission('reward.view'), RewardController.getAdminMetrics);
adminRewardRouter.get('/conversions', requirePermission('reward.view'), RewardController.getAdminConversions);
adminRewardRouter.get('/claimable', requirePermission('reward.view'), RewardController.getAdminClaimable);
adminRewardRouter.get('/converted', requirePermission('reward.view'), RewardController.getAdminConverted);
adminRewardRouter.get('/wallet-lots', requirePermission('reward.view'), RewardController.getAdminWalletLots);
adminRewardRouter.get('/expiring', requirePermission('reward.view'), RewardController.getAdminExpiring);
adminRewardRouter.get('/reversals', requirePermission('reward.view'), RewardController.getAdminReversals);
adminRewardRouter.get('/notifications', requirePermission('reward.view'), RewardController.getAdminNotifications);

export { customerRewardRouter, adminRewardRouter };
