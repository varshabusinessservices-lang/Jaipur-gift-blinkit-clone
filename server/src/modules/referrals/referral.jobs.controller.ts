import { Router, Request, Response } from 'express';
import { ReferralCoolingProcessor } from './referral.cooling.processor';
import { ReferralCreditExpiryProcessor } from './referral.expiry.processor';
import { ReferralNotificationService } from './referral.notification.service';
import { ReferralReconciliationService } from './referral.reconciliation.service';

export const internalReferralJobsRouter = Router();

// Internal token security check middleware
internalReferralJobsRouter.use((req: Request, res: Response, next) => {
  const jobToken = req.headers['x-job-token'] || req.query.jobToken;
  const expectedToken = process.env.JOB_SECRET_TOKEN || 'internal-referral-job-secret';

  if (process.env.NODE_ENV === 'production' && jobToken !== expectedToken) {
    return res.status(401).json({ error: 'Unauthorized job request' });
  }
  next();
});

// POST /api/internal/jobs/referrals/cooling
internalReferralJobsRouter.post('/cooling', async (req: Request, res: Response) => {
  try {
    const { batchSize, dryRun } = req.body;
    const result = await ReferralCoolingProcessor.processDueReferralQualifications({ batchSize, dryRun });
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/internal/jobs/referrals/expiry
internalReferralJobsRouter.post('/expiry', async (req: Request, res: Response) => {
  try {
    const { batchSize, dryRun } = req.body;
    const result = await ReferralCreditExpiryProcessor.processReferralCreditExpiry({ batchSize, dryRun });
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/internal/jobs/referrals/notifications
internalReferralJobsRouter.post('/notifications', async (req: Request, res: Response) => {
  try {
    const { batchSize, dryRun } = req.body;
    const result = await ReferralNotificationService.processDueNotifications({ batchSize, dryRun });
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/internal/jobs/referrals/reconciliation
internalReferralJobsRouter.post('/reconciliation', async (req: Request, res: Response) => {
  try {
    const { batchSize, dryRun } = req.body;
    const result = await ReferralReconciliationService.runReconciliation({ batchSize, dryRun });
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});
