import crypto from 'crypto';
import { prisma } from '../../database/prisma';
import { ReferralCodeService } from './referral.code.service';
import { ReferralCreditService } from './referral.credit.service';
import { ReferralFraudService } from './referral.fraud.service';
import { ReferralConfigService } from './referral.config.service';

export class ReferralAttributionService {
  static async validateAndCreateSession(params: {
    referralCode: string;
    prospectiveMobile?: string;
    prospectiveEmail?: string;
    deviceId?: string;
    ipAddress?: string;
  }): Promise<{
    valid: boolean;
    attributionToken?: string;
    referrerDisplayName?: string;
    newUserBenefitText?: string;
    minimumFirstOrder?: number;
    reason?: string;
  }> {
    const config = await ReferralConfigService.getConfig();
    if (!config.referralEnabled) {
      return { valid: false, reason: 'Referral program is currently disabled' };
    }

    const resolved = await ReferralCodeService.resolveCode(params.referralCode);
    if (!resolved.valid) {
      return { valid: false, reason: resolved.reason };
    }

    const token = crypto.randomBytes(24).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days window

    await prisma.referralAttributionSession.create({
      data: {
        tokenHash,
        referralCodeId: resolved.referralCode.id,
        referrerCustomerId: resolved.referrer.id,
        prospectiveMobileHash: params.prospectiveMobile ? ReferralFraudService.hashValue(params.prospectiveMobile) : null,
        prospectiveEmailHash: params.prospectiveEmail ? ReferralFraudService.hashValue(params.prospectiveEmail) : null,
        deviceId: params.deviceId || null,
        ipHash: params.ipAddress ? ReferralFraudService.hashValue(params.ipAddress) : null,
        status: 'PENDING',
        expiresAt,
      },
    });

    const referrerDisplayName = resolved.referrer.name
      ? resolved.referrer.name.split(' ')[0]
      : 'A friend';

    return {
      valid: true,
      attributionToken: token,
      referrerDisplayName,
      newUserBenefitText: `Get ₹${config.newUserRewardAmount} wallet credit on your first order of ₹${config.minimumFirstOrderValue}+`,
      minimumFirstOrder: Number(config.minimumFirstOrderValue),
    };
  }

  static async attachToRegistration(params: {
    newCustomerId: string;
    referralCode?: string;
    attributionToken?: string;
    deviceId?: string;
    ipAddress?: string;
  }): Promise<{
    attached: boolean;
    relationship?: any;
    reason?: string;
  }> {
    const config = await ReferralConfigService.getConfig();
    if (!config.referralEnabled) {
      return { attached: false, reason: 'Referral program is disabled' };
    }

    // Check if customer already has a referrer
    const existingRel = await prisma.referralRelationship.findUnique({
      where: { newCustomerId: params.newCustomerId },
    });

    if (existingRel) {
      return { attached: true, relationship: existingRel };
    }

    let referrerId: string | null = null;
    let referralCodeId: string | null = null;

    if (params.attributionToken) {
      const tokenHash = crypto.createHash('sha256').update(params.attributionToken).digest('hex');
      const session = await prisma.referralAttributionSession.findUnique({
        where: { tokenHash },
      });

      if (session && session.status === 'PENDING' && session.expiresAt > new Date()) {
        referrerId = session.referrerCustomerId;
        referralCodeId = session.referralCodeId;

        await prisma.referralAttributionSession.update({
          where: { id: session.id },
          data: {
            status: 'ATTACHED',
            attachedCustomerId: params.newCustomerId,
            attachedAt: new Date(),
          },
        });
      }
    }

    if (!referrerId && params.referralCode) {
      const resolved = await ReferralCodeService.resolveCode(params.referralCode);
      if (resolved.valid) {
        referrerId = resolved.referrer.id;
        referralCodeId = resolved.referralCode.id;
      }
    }

    if (!referrerId) {
      return { attached: false, reason: 'No valid referral code or token provided' };
    }

    // Prevent self-referral
    if (referrerId === params.newCustomerId) {
      return { attached: false, reason: 'Self-referral is not permitted' };
    }

    // Check risk assessment
    const risk = await ReferralFraudService.assessRelationshipRisk({
      referrerCustomerId: referrerId,
      newCustomerId: params.newCustomerId,
      deviceId: params.deviceId,
      ipAddress: params.ipAddress,
    });

    if (risk.blocked) {
      return { attached: false, reason: 'Referral risk assessment failed' };
    }

    const relationship = await prisma.referralRelationship.create({
      data: {
        referrerId,
        newCustomerId: params.newCustomerId,
        referralCodeId,
        status: risk.requiresManualReview ? 'FRAUD_HOLD' : 'REGISTERED',
        referrerRewardValue: config.referrerRewardAmount,
        newUserRewardValue: config.newUserRewardAmount,
        riskScore: risk.riskScore,
        registeredAt: new Date(),
        fraudHeldAt: risk.requiresManualReview ? new Date() : null,
      },
    });

    if (risk.requiresManualReview) {
      await ReferralFraudService.createReviewCase(relationship.id, risk);
    }

    return {
      attached: true,
      relationship,
    };
  }

  static async confirmMobileVerification(customerId: string): Promise<{
    verified: boolean;
    creditIssued: boolean;
    relationship?: any;
    credit?: any;
  }> {
    const relationship = await prisma.referralRelationship.findUnique({
      where: { newCustomerId: customerId },
    });

    if (!relationship) {
      return { verified: false, creditIssued: false };
    }

    if (relationship.status === 'FRAUD_HOLD' || relationship.status === 'REJECTED') {
      return { verified: true, creditIssued: false, relationship };
    }

    const updatedRel = await prisma.referralRelationship.update({
      where: { id: relationship.id },
      data: {
        mobileVerifiedAt: new Date(),
        status: relationship.status === 'REGISTERED' ? 'MOBILE_VERIFIED' : relationship.status,
      },
    });

    let credit: any = null;
    let creditIssued = false;

    try {
      credit = await ReferralCreditService.issueNewUserCredit(relationship.id);
      creditIssued = true;
    } catch (err) {
      console.error(`Failed to issue new user credit on mobile verification for ${customerId}:`, err);
    }

    return {
      verified: true,
      creditIssued,
      relationship: updatedRel,
      credit,
    };
  }
}
