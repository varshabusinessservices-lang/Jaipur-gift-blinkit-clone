import { requirePermission } from '../../middlewares/permissions';
import { Router, Request, Response } from 'express';
import { prisma } from '../../database/prisma';
import { ReferralConfigService } from './referral.config.service';
import { ReferralCoolingProcessor } from './referral.cooling.processor';
import { ReferralCreditExpiryProcessor } from './referral.expiry.processor';
import { ReferralQualificationService } from './referral.qualification.service';
import { ReferralReconciliationService } from './referral.reconciliation.service';

export const adminReferralRouter = Router();

// GET /api/admin/referrals/summary
adminReferralRouter.get('/summary', async (req: Request, res: Response) => {
  try {
    const totalRelationships = await prisma.referralRelationship.count();
    const registeredCount = await prisma.referralRelationship.count({ where: { status: 'REGISTERED' } });
    const mobileVerifiedCount = await prisma.referralRelationship.count({ where: { status: 'MOBILE_VERIFIED' } });
    const coolingCount = await prisma.referralRelationship.count({ where: { status: 'COOLING_PERIOD' } });
    const qualifiedCount = await prisma.referralRelationship.count({ where: { status: 'QUALIFIED' } });
    const rewardedCount = await prisma.referralRelationship.count({ where: { status: 'REWARDED' } });
    const fraudHeldCount = await prisma.referralRelationship.count({ where: { status: 'FRAUD_HOLD' } });
    const openReviewCases = await prisma.referralReviewCase.count({ where: { status: 'OPEN' } });

    const config = await ReferralConfigService.getConfig();

    return res.json({ success: true, data: {
      totalRelationships,
      registeredCount,
      mobileVerifiedCount,
      coolingCount,
      qualifiedCount,
      rewardedCount,
      fraudHeldCount,
      openReviewCases,
      config} });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/referrals/relationships
adminReferralRouter.get('/relationships', async (req: Request, res: Response) => {
  try {
    const { status, page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    const whereClause: any = {};
    if (status) whereClause.status = status as string;

    const [relationships, total] = await Promise.all([
      prisma.referralRelationship.findMany({
        where: whereClause,
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        orderBy: { createdAt: 'desc' }}),
      prisma.referralRelationship.count({ where: whereClause }),
    ]);

    return res.json({
      relationships,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum)}});
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/referrals/review-cases
adminReferralRouter.get('/review-cases', async (req: Request, res: Response) => {
  try {
    const cases = await prisma.referralReviewCase.findMany({
      orderBy: { createdAt: 'desc' }});
    return res.json({ reviewCases: cases });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/referrals/review-cases/:id/approve
adminReferralRouter.post('/review-cases/:id/approve', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const reviewCase = await prisma.referralReviewCase.findUnique({ where: { id } });

    if (!reviewCase) {
      return res.status(404).json({ error: 'Review case not found' });
    }

    await prisma.referralReviewCase.update({
      where: { id },
      data: {
        status: 'RESOLVED',
        decision: 'APPROVE_REFERRAL',
        reviewedAt: new Date(),
        resolvedAt: new Date()}});

    await prisma.referralRelationship.update({
      where: { id: reviewCase.referralRelationshipId },
      data: { status: 'REGISTERED' }});

    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/referrals/review-cases/:id/reject
adminReferralRouter.post('/review-cases/:id/reject', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const reviewCase = await prisma.referralReviewCase.findUnique({ where: { id } });

    if (!reviewCase) {
      return res.status(404).json({ error: 'Review case not found' });
    }

    await prisma.referralReviewCase.update({
      where: { id },
      data: {
        status: 'RESOLVED',
        decision: 'REJECT_REFERRAL',
        reviewerNotes: reason,
        reviewedAt: new Date(),
        resolvedAt: new Date()}});

    await prisma.referralRelationship.update({
      where: { id: reviewCase.referralRelationshipId },
      data: { status: 'REJECTED', rejectionReason: reason || 'Rejected by admin review' }});

    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/referrals/settings
adminReferralRouter.get('/settings', async (req: Request, res: Response) => {
  try {
    const config = await ReferralConfigService.getConfig();
    return res.json(config);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/referrals/settings
adminReferralRouter.put('/settings', async (req: Request, res: Response) => {
  try {
    const updated = await ReferralConfigService.updateConfig(req.body);
    return res.json(updated);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/referrals/process-due
adminReferralRouter.post('/process-due', async (req: Request, res: Response) => {
  try {
    const { dryRun = false } = req.body;

    const coolingResult = await ReferralCoolingProcessor.processDueReferralQualifications({ dryRun });
    const expiryResult = await ReferralCreditExpiryProcessor.processReferralCreditExpiry({ dryRun });

    return res.json({
      coolingResult,
      expiryResult});
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});


adminReferralRouter.get('/codes', requirePermission('referral.view'), async (req: Request, res: Response) => {
  try {
    const codes = await prisma.referralCode.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
    return res.json({ success: true, data: { codes } });
  } catch (e: any) { return res.status(500).json({ error: e.message }); }
});

adminReferralRouter.get('/credits', requirePermission('referral.view'), async (req: Request, res: Response) => {
  try {
    const credits = await prisma.walletCreditLot.findMany({ where: { bucketType: { startsWith: 'REFERRAL_' } }, orderBy: { createdAt: 'desc' }, take: 100 });
    return res.json({ success: true, data: { credits } });
  } catch (e: any) { return res.status(500).json({ error: e.message }); }
});

adminReferralRouter.get('/qualifications', requirePermission('referral.view'), async (req: Request, res: Response) => {
  try {
    const qualifications = await prisma.referralRelationship.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
    return res.json({ success: true, data: { qualifications } });
  } catch (e: any) { return res.status(500).json({ error: e.message }); }
});

adminReferralRouter.get('/fraud', requirePermission('referral.view'), async (req: Request, res: Response) => {
  try {
    const fraud = await prisma.referralReviewCase.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
    return res.json({ success: true, data: { fraud } });
  } catch (e: any) { return res.status(500).json({ error: e.message }); }
});

adminReferralRouter.get('/recovery', requirePermission('referral.view'), async (req: Request, res: Response) => {
  try {
    const recovery = await prisma.referralRecoveryCase.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
    return res.json({ success: true, data: { recovery } });
  } catch (e: any) { return res.status(500).json({ error: e.message }); }
});

adminReferralRouter.get('/reconciliation', requirePermission('financial.reconciliation'), async (req: Request, res: Response) => {
  try {
    const reconciliation = await prisma.referralReconciliationRun.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
    return res.json({ success: true, data: { reconciliation } });
  } catch (e: any) { return res.status(500).json({ error: e.message }); }
});

adminReferralRouter.get('/notifications', requirePermission('referral.view'), async (req: Request, res: Response) => {
  try {
    const notifications = await prisma.referralNotificationEvent.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
    return res.json({ success: true, data: { notifications } });
  } catch (e: any) { return res.status(500).json({ error: e.message }); }
});

