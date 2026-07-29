import { Request, Response } from 'express';
import { RewardService } from './reward.service';
import { RewardCalculationService } from './reward.calculation.service';

export class RewardController {
  // ==========================================
  // CUSTOMER APIS
  // ==========================================

  /**
   * GET /api/rewards
   */
  static async getCustomerRewards(req: Request, res: Response) {
    try {
      const customerId = (req as any).user?.id || (req as any).customer?.id || req.query.customerId as string;
      if (!customerId) {
        return res.status(401).json({ success: false, error: 'Unauthorized: Customer ID required' });
      }

      const summary = await RewardService.getCustomerRewardsSummary(customerId);
      return res.json({ success: true, data: summary });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message || 'Failed to fetch rewards summary' });
    }
  }

  /**
   * GET /api/rewards/history
   */
  static async getCustomerRewardHistory(req: Request, res: Response) {
    try {
      const customerId = (req as any).user?.id || (req as any).customer?.id || req.query.customerId as string;
      if (!customerId) {
        return res.status(401).json({ success: false, error: 'Unauthorized: Customer ID required' });
      }

      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const status = req.query.status as string;

      const history = await RewardService.getCustomerRewardHistory(customerId, { page, limit, status });
      return res.json({ success: true, data: history });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message || 'Failed to fetch reward history' });
    }
  }

  /**
   * GET /api/rewards/claimable
   */
  static async getCustomerClaimableRewards(req: Request, res: Response) {
    try {
      const customerId = (req as any).user?.id || (req as any).customer?.id || req.query.customerId as string;
      if (!customerId) {
        return res.status(401).json({ success: false, error: 'Unauthorized: Customer ID required' });
      }

      const summary = await RewardService.getCustomerRewardsSummary(customerId);
      return res.json({
        success: true,
        data: {
          claimableCoins: summary.account.totalClaimableCoins,
          claimableWalletValue: summary.account.claimableWalletValue,
          claimableTransactions: summary.claimableTransactions}});
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message || 'Failed to fetch claimable rewards' });
    }
  }

  /**
   * POST /api/rewards/claim
   */
  static async claimCustomerReward(req: Request, res: Response) {
    try {
      const customerId = (req as any).user?.id || (req as any).customer?.id || req.body.customerId;
      if (!customerId) {
        return res.status(401).json({ success: false, error: 'Unauthorized: Customer ID required' });
      }

      const { rewardTransactionId, idempotencyKey } = req.body;

      if (!rewardTransactionId) {
        // Option to claim all claimable
        const summary = await RewardService.getCustomerRewardsSummary(customerId);
        if (summary.claimableTransactions.length === 0) {
          return res.status(400).json({ success: false, error: 'No claimable rewards available' });
        }

        const results = [];
        for (const tx of summary.claimableTransactions) {
          const result = await RewardService.claimReward({
            customerId,
            rewardTransactionId: tx.id,
            idempotencyKey: idempotencyKey ? `${idempotencyKey}-${tx.id}` : undefined,
            conversionType: 'MANUAL'});
          results.push(result);
        }

        return res.json({ success: true, data: { claimedCount: results.length, details: results } });
      }

      const result = await RewardService.claimReward({
        customerId,
        rewardTransactionId,
        idempotencyKey,
        conversionType: 'MANUAL'});

      return res.json({ success: true, data: result });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message || 'Failed to claim reward' });
    }
  }

  /**
   * POST /api/rewards/simulate
   */
  static async simulateCustomerReward(req: Request, res: Response) {
    try {
      const input = req.body || {};
      const simulation = await RewardCalculationService.simulateReward(input);

      return res.json({
        success: true,
        data: {
          eligibleSpend: simulation.eligibleSpend,
          coins: simulation.coins,
          walletValue: simulation.walletValue,
          excludedAmount: simulation.excludedAmount,
          multiplier: simulation.multiplier,
          reason: simulation.reason}});
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message || 'Simulation failed' });
    }
  }

  /**
   * GET /api/rewards/notifications
   */
  static async getNotifications(req: Request, res: Response) {
    try {
      const customerId = (req as any).user?.id || (req as any).customer?.id || req.query.customerId as string;
      if (!customerId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      const notifications = await prisma.rewardNotificationEvent.findMany({
        where: { customerId },
        orderBy: { scheduledFor: 'desc' },
        take: 50});

      return res.json({ success: true, data: notifications });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message || 'Failed to fetch notifications' });
    }
  }

  /**
   * POST /api/rewards/notifications/:id/read
   */
  static async markNotificationRead(req: Request, res: Response) {
    try {
      const customerId = (req as any).user?.id || (req as any).customer?.id;
      const { id } = req.params;

      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      const updated = await prisma.rewardNotificationEvent.updateMany({
        where: { id, customerId },
        data: { status: 'READ', readAt: new Date() }});

      return res.json({ success: true, data: { updatedCount: updated.count } });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message || 'Failed to update notification' });
    }
  }

  /**
   * POST /api/rewards/notifications/read-all
   */
  static async markAllNotificationsRead(req: Request, res: Response) {
    try {
      const customerId = (req as any).user?.id || (req as any).customer?.id;

      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      const updated = await prisma.rewardNotificationEvent.updateMany({
        where: { customerId, status: { not: 'READ' } },
        data: { status: 'READ', readAt: new Date() }});

      return res.json({ success: true, data: { updatedCount: updated.count } });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message || 'Failed to update notifications' });
    }
  }

  /**
   * GET /api/rewards/expiring
   */
  static async getExpiringRewards(req: Request, res: Response) {
    try {
      const customerId = (req as any).user?.id || (req as any).customer?.id || req.query.customerId as string;
      if (!customerId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      const expiringLots = await prisma.walletCreditLot.findMany({
        where: {
          customerId,
          bucketType: 'REWARD',
          status: 'ACTIVE',
          remainingAmount: { gt: 0 },
          expiresAt: { gt: new Date() }},
        orderBy: { expiresAt: 'asc' }});

      let totalExpiring = new (await import('@prisma/client')).Prisma.Decimal('0.00');
      for (const lot of expiringLots) {
        totalExpiring = totalExpiring.plus(lot.remainingAmount);
      }

      return res.json({
        success: true,
        data: {
          totalExpiringAmount: totalExpiring,
          nearestExpiryDate: expiringLots[0]?.expiresAt || null,
          expiringLots}});
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message || 'Failed to fetch expiring rewards' });
    }
  }

  // ==========================================
  // ADMIN APIS
  // ==========================================

  /**
   * GET /api/admin/rewards/transactions
   */
  static async getAdminTransactions(req: Request, res: Response) {
    try {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      const page = parseInt(req.query.page as string || '1', 10);
      const limit = parseInt(req.query.limit as string || '20', 10);
      const status = req.query.status as string;
      const customerId = req.query.customerId as string;

      const where: any = {};
      if (status) where.status = status;
      if (customerId) where.customerId = customerId;

      const [total, items] = await Promise.all([
        prisma.rewardTransaction.count({ where }),
        prisma.rewardTransaction.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' },
          }),
      ]);

      return res.json({
        success: true,
        data: { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }});
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * GET /api/admin/rewards/recovery-cases
   */
  static async getAdminRecoveryCases(req: Request, res: Response) {
    try {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      const cases = await prisma.rewardRecoveryCase.findMany({
        orderBy: { createdAt: 'desc' },
        });

      return res.json({ success: true, data: cases });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * GET /api/admin/rewards/reconciliation
   */
  static async getAdminReconciliation(req: Request, res: Response) {
    try {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      const runs = await prisma.rewardReconciliationRun.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
        });

      return res.json({ success: true, data: runs });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * POST /api/admin/rewards/reconciliation/run
   */
  static async runAdminReconciliation(req: Request, res: Response) {
    try {
      const { RewardReconciliationService } = await import('./reward.reconciliation.service');
      const result = await RewardReconciliationService.reconcileDateRange({
        runType: 'MANUAL',
        initiatedBy: (req as any).user?.id || 'ADMIN'});

      return res.json({ success: true, data: result });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * POST /api/admin/rewards/process-due
   */
  static async processDueWorkers(req: Request, res: Response) {
    try {
      const { RewardCoolingProcessor } = await import('./reward.cooling.processor');
      const { RewardAutoConversionProcessor } = await import('./reward.autoconvert.processor');
      const { RewardWalletExpiryProcessor } = await import('./reward.wallet.expiry.processor');
      const { RewardExpiryNotificationProcessor } = await import('./reward.expiry.notification.processor');

      const [cooling, autoConvert, walletExpiry, scheduleNotif, sendNotif] = await Promise.all([
        RewardCoolingProcessor.processCoolingRewards({ triggeredBy: 'ADMIN_MANUAL' }),
        RewardAutoConversionProcessor.processDueAutoConversions({ triggeredBy: 'ADMIN_MANUAL' }),
        RewardWalletExpiryProcessor.processExpiringRewardLots({ triggeredBy: 'ADMIN_MANUAL' }),
        RewardExpiryNotificationProcessor.scheduleExpiryNotifications({ triggeredBy: 'ADMIN_MANUAL' }),
        RewardExpiryNotificationProcessor.processDueNotifications({ triggeredBy: 'ADMIN_MANUAL' }),
      ]);

      return res.json({
        success: true,
        data: { cooling, autoConvert, walletExpiry, scheduleNotif, sendNotif }});
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * POST /api/admin/rewards/transactions/:id/fraud-hold
   */
  static async applyFraudHold(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const updated = await RewardService.applyFraudHold(id, reason);
      return res.json({ success: true, data: updated });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  /**
   * POST /api/admin/rewards/transactions/:id/fraud-release
   */
  static async releaseFraudHold(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const updated = await RewardService.releaseFraudHold(id);
      return res.json({ success: true, data: updated });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  // ==========================================
  // ADMIN APIS
  // ==========================================

  /**
   * GET /api/admin/rewards
   */
  static async getAdminRewardSettings(req: Request, res: Response) {
    try {
      const config = await RewardCalculationService.getRewardConfig();
      return res.json({ success: true, data: config });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message || 'Failed to fetch admin reward settings' });
    }
  }

  /**
   * PUT /api/admin/rewards/settings
   */
  static async updateAdminRewardSettings(req: Request, res: Response) {
    try {
      const adminUserId = (req as any).user?.id || 'admin';
      const updatedConfig = await RewardService.updateRewardConfig(req.body, adminUserId);
      return res.json({ success: true, data: updatedConfig });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message || 'Failed to update reward settings' });
    }
  }

  /**
   * POST /api/admin/rewards/simulate
   */
  static async simulateAdminReward(req: Request, res: Response) {
    try {
      const { orderAmount, paymentMethod, items, fees, paymentSources, configOverride } = req.body;

      const calcInput = {
        totalOrderAmount: orderAmount || 0,
        items: items || [],
        fees: fees || {},
        paymentSources: paymentSources || [
          { sourceType: paymentMethod || 'ONLINE', amount: orderAmount || 0 },
        ]};

      const simulation = await RewardCalculationService.simulateReward(calcInput, configOverride);

      return res.json({
        success: true,
        data: {
          eligibleSpend: simulation.eligibleSpend,
          coins: simulation.coins,
          walletValue: simulation.walletValue,
          excludedAmount: simulation.excludedAmount,
          multiplier: simulation.multiplier,
          reason: simulation.reason,
          itemBreakdown: simulation.itemBreakdown}});
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message || 'Admin reward simulation failed' });
    }
  }

  static async getAdminMetrics(req: Request, res: Response) {
    try {
      const totalIssued = await prisma.rewardTransaction.aggregate({ _sum: { coinsEarned: true }, where: { type: 'EARNED' } });
      const totalRedeemed = await prisma.rewardTransaction.aggregate({ _sum: { coinsEarned: true }, where: { type: 'REDEEMED' } });
      return res.json({ success: true, data: {
        totalIssued: totalIssued._sum.coinsEarned ? totalIssued._sum.coinsEarned.toFixed(2) : "0.00",
        totalRedeemed: totalRedeemed._sum.coinsEarned ? totalRedeemed._sum.coinsEarned.toFixed(2) : "0.00",
        activeRewards: await prisma.rewardAccount.count()
      }});
    } catch (e: any) { return res.status(500).json({ error: e.message }); }
  }

  static async getAdminConversions(req: Request, res: Response) {
    try {
      const conversions = await prisma.rewardTransaction.findMany({ where: { type: 'REDEEMED' }, orderBy: { createdAt: 'desc' }, take: 100 });
      return res.json({ success: true, data: { conversions } });
    } catch (e: any) { return res.status(500).json({ error: e.message }); }
  }

  static async getAdminClaimable(req: Request, res: Response) {
    try {
      const rewards = await prisma.rewardTransaction.findMany({ where: { status: 'PENDING' }, orderBy: { createdAt: 'desc' }, take: 100 });
      return res.json({ success: true, data: { rewards } });
    } catch (e: any) { return res.status(500).json({ error: e.message }); }
  }

  static async getAdminConverted(req: Request, res: Response) {
    try {
      const rewards = await prisma.rewardTransaction.findMany({ where: { type: 'REDEEMED' }, orderBy: { createdAt: 'desc' }, take: 100 });
      return res.json({ success: true, data: { rewards } });
    } catch (e: any) { return res.status(500).json({ error: e.message }); }
  }

  static async getAdminWalletLots(req: Request, res: Response) {
    try {
      const lots = await prisma.walletCreditLot.findMany({ where: { bucketType: 'REWARD' }, orderBy: { createdAt: 'desc' }, take: 100 });
      return res.json({ success: true, data: { lots } });
    } catch (e: any) { return res.status(500).json({ error: e.message }); }
  }

  static async getAdminExpiring(req: Request, res: Response) {
    try {
      const rewards = await prisma.rewardTransaction.findMany({ where: { expiresAt: { not: null, lte: new Date(Date.now() + 30 * 86400000) } }, orderBy: { expiresAt: 'asc' }, take: 100 });
      return res.json({ success: true, data: { rewards } });
    } catch (e: any) { return res.status(500).json({ error: e.message }); }
  }

  static async getAdminReversals(req: Request, res: Response) {
    try {
      const reversals = await prisma.rewardTransaction.findMany({ where: { type: 'REVERSED' }, orderBy: { createdAt: 'desc' }, take: 100 });
      return res.json({ success: true, data: { reversals } });
    } catch (e: any) { return res.status(500).json({ error: e.message }); }
  }

  static async getAdminNotifications(req: Request, res: Response) {
    try {
      const notifications = await prisma.rewardNotificationEvent.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
      return res.json({ success: true, data: { notifications } });
    } catch (e: any) { return res.status(500).json({ error: e.message }); }
  }

}