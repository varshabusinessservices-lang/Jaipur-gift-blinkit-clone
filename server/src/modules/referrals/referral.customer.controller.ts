import { Router, Request, Response } from 'express';
import { prisma } from '../../database/prisma';
import { ReferralStatsService } from './referral.stats.service';
import { ReferralAttributionService } from './referral.attribution.service';
import { ReferralCodeService } from './referral.code.service';

export const customerReferralRouter = Router();

// GET /api/referrals/summary
customerReferralRouter.get('/summary', async (req: Request, res: Response) => {
  try {
    const customerId = (req as any).user?.id || (req as any).customer?.id || req.query.customerId;
    if (!customerId) {
      return res.status(400).json({ error: 'Customer ID required' });
    }
    const summary = await ReferralStatsService.getCustomerSummary(customerId as string);
    return res.json(summary);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/referrals/code
customerReferralRouter.get('/code', async (req: Request, res: Response) => {
  try {
    const customerId = (req as any).user?.id || (req as any).customer?.id || req.query.customerId;
    if (!customerId) {
      return res.status(400).json({ error: 'Customer ID required' });
    }
    const codeRecord = await ReferralCodeService.getOrCreatePrimaryCode(customerId as string);
    const { shareUrl, shareMessage } = ReferralCodeService.createShareLink(codeRecord.code);
    return res.json({
      code: codeRecord.code,
      status: codeRecord.status,
      shareUrl,
      shareMessage,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/referrals/code/regenerate
customerReferralRouter.post('/code/regenerate', async (req: Request, res: Response) => {
  try {
    const customerId = (req as any).user?.id || (req as any).customer?.id || req.body.customerId;
    if (!customerId) {
      return res.status(400).json({ error: 'Customer ID required' });
    }
    const newCodeRecord = await ReferralCodeService.regenerateCode(customerId as string);
    const { shareUrl, shareMessage } = ReferralCodeService.createShareLink(newCodeRecord.code);
    return res.json({
      code: newCodeRecord.code,
      status: newCodeRecord.status,
      shareUrl,
      shareMessage,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/referrals/validate-code
customerReferralRouter.post('/validate-code', async (req: Request, res: Response) => {
  try {
    const { code, prospectiveMobile, prospectiveEmail, deviceId } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Referral code is required' });
    }
    const result = await ReferralAttributionService.validateAndCreateSession({
      referralCode: code,
      prospectiveMobile,
      prospectiveEmail,
      deviceId,
      ipAddress: req.ip,
    });
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/referrals/history
customerReferralRouter.get('/history', async (req: Request, res: Response) => {
  try {
    const customerId = (req as any).user?.id || (req as any).customer?.id || req.query.customerId;
    if (!customerId) {
      return res.status(400).json({ error: 'Customer ID required' });
    }
    const relationships = await prisma.referralRelationship.findMany({
      where: { referrerId: customerId as string },
      select: {
        id: true,
        status: true,
        registeredAt: true,
        qualifiedAt: true,
        rewardedAt: true,
        coolingEndsAt: true,
        referrerRewardValue: true,
      },
      orderBy: { registeredAt: 'desc' },
    });
    return res.json({ history: relationships });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/referrals/credits
customerReferralRouter.get('/credits', async (req: Request, res: Response) => {
  try {
    const customerId = (req as any).user?.id || (req as any).customer?.id || req.query.customerId;
    if (!customerId) {
      return res.status(400).json({ error: 'Customer ID required' });
    }
    const credits = await prisma.referralCredit.findMany({
      where: { customerId: customerId as string },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ credits });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});
