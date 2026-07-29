import crypto from 'crypto';
import { prisma } from '../../database/prisma';
import { ReferralConfigService } from './referral.config.service';
import { ReferralRiskOutcome } from './referral.types';

export class ReferralFraudService {
  static hashValue(val?: string | null): string | null {
    if (!val) return null;
    return crypto.createHash('sha256').update(val.trim().toLowerCase()).digest('hex');
  }

  static async assessRelationshipRisk(params: {
    referrerCustomerId: string;
    newCustomerId?: string;
    prospectiveMobile?: string;
    prospectiveEmail?: string;
    deviceId?: string;
    ipAddress?: string;
    paymentInstrumentHash?: string;
    addressLine?: string;
  }): Promise<{
    riskScore: number;
    outcome: ReferralRiskOutcome;
    triggeredSignals: string[];
    requiresManualReview: boolean;
    requiresOtp: boolean;
    blocked: boolean;
  }> {
    const config = await ReferralConfigService.getConfig();
    let riskScore = 0;
    const triggeredSignals: string[] = [];

    // 1. Self-referral check
    if (params.newCustomerId && params.referrerCustomerId === params.newCustomerId) {
      riskScore += 100;
      triggeredSignals.push('SELF_REFERRAL_ATTEMPT');
    }

    // 2. Identity Overlap (Phone / Email)
    if (params.referrerCustomerId) {
      const referrer = await prisma.customer.findUnique({
        where: { id: params.referrerCustomerId },
        select: { mobile: true, email: true },
      });

      if (referrer) {
        if (params.prospectiveMobile && referrer.mobile === params.prospectiveMobile) {
          riskScore += 100;
          triggeredSignals.push('REUSED_REFERRER_MOBILE');
        }
        if (params.prospectiveEmail && referrer.email && referrer.email.toLowerCase() === params.prospectiveEmail.toLowerCase()) {
          riskScore += 100;
          triggeredSignals.push('REUSED_REFERRER_EMAIL');
        }
      }
    }

    // 3. Device Fingerprint Overlap
    if (params.deviceId) {
      const deviceHash = this.hashValue(params.deviceId)!;
      const deviceLink = await prisma.customerDeviceLink.findFirst({
        where: { deviceFingerprintHash: deviceHash },
      });

      if (deviceLink) {
        if (deviceLink.accountCountObserved >= config.maxReferralsPerDevice) {
          riskScore += 50;
          triggeredSignals.push('EXCESS_ACCOUNTS_PER_DEVICE');
        }
        if (deviceLink.trustStatus === 'BLOCKED') {
          riskScore += 80;
          triggeredSignals.push('BLOCKED_DEVICE_FINGERPRINT');
        }
      }
    }

    // 4. Payment Instrument Link Overlap
    if (params.paymentInstrumentHash) {
      const paymentLink = await prisma.paymentInstrumentLink.findFirst({
        where: { instrumentFingerprintHash: params.paymentInstrumentHash },
      });

      if (paymentLink) {
        if (paymentLink.chargebackLinked) {
          riskScore += 90;
          triggeredSignals.push('CHARGEBACK_LINKED_PAYMENT_INSTRUMENT');
        }
        if (paymentLink.customerId === params.referrerCustomerId) {
          riskScore += 70;
          triggeredSignals.push('SHARED_PAYMENT_INSTRUMENT_WITH_REFERRER');
        }
      }
    }

    // 5. Address Overlap
    if (params.addressLine) {
      const addrHash = this.hashValue(params.addressLine)!;
      const addrLink = await prisma.addressIdentityLink.findFirst({
        where: { addressHash: addrHash, customerId: params.referrerCustomerId },
      });

      if (addrLink) {
        riskScore += 20; // Mild risk contribution
        triggeredSignals.push('SAME_DELIVERY_ADDRESS_AS_REFERRER');
      }
    }

    // 6. IP Signup Velocity
    if (params.ipAddress) {
      const ipHash = this.hashValue(params.ipAddress)!;
      const recentIpSessions = await prisma.referralAttributionSession.count({
        where: {
          ipHash,
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      });

      if (recentIpSessions > 5) {
        riskScore += 30;
        triggeredSignals.push('HIGH_IP_SIGNUP_VELOCITY');
      }
    }

    // Determine outcome
    let outcome = ReferralRiskOutcome.LOW_RISK;
    let requiresManualReview = false;
    let requiresOtp = false;
    let blocked = false;

    if (riskScore >= config.blockThreshold || riskScore >= 100) {
      outcome = ReferralRiskOutcome.BLOCKED;
      blocked = true;
    } else if (riskScore >= config.manualReviewThreshold) {
      outcome = ReferralRiskOutcome.HIGH_RISK;
      requiresManualReview = true;
    } else if (riskScore >= config.riskOtpThreshold) {
      outcome = ReferralRiskOutcome.MEDIUM_RISK;
      requiresOtp = true;
    }

    return {
      riskScore,
      outcome,
      triggeredSignals,
      requiresManualReview,
      requiresOtp,
      blocked,
    };
  }

  static async recordDeviceLink(customerId: string, deviceId: string) {
    if (!deviceId) return;
    const deviceHash = this.hashValue(deviceId)!;

    const existing = await prisma.customerDeviceLink.findFirst({
      where: { customerId, deviceFingerprintHash: deviceHash },
    });

    if (existing) {
      await prisma.customerDeviceLink.update({
        where: { id: existing.id },
        data: { lastSeenAt: new Date() },
      });
    } else {
      await prisma.customerDeviceLink.create({
        data: {
          customerId,
          deviceFingerprintHash: deviceHash,
        },
      });
    }
  }

  static async recordPaymentInstrumentLink(customerId: string, gateway: string, instrumentHash: string, instrumentType: string = 'CARD') {
    if (!instrumentHash) return;

    const existing = await prisma.paymentInstrumentLink.findFirst({
      where: { customerId, instrumentFingerprintHash: instrumentHash },
    });

    if (existing) {
      await prisma.paymentInstrumentLink.update({
        where: { id: existing.id },
        data: { lastSeenAt: new Date() },
      });
    } else {
      await prisma.paymentInstrumentLink.create({
        data: {
          customerId,
          gateway,
          instrumentFingerprintHash: instrumentHash,
          instrumentType,
        },
      });
    }
  }

  static async recordAddressIdentityLink(customerId: string, addressLine: string) {
    if (!addressLine) return;
    const addrHash = this.hashValue(addressLine)!;

    const existing = await prisma.addressIdentityLink.findFirst({
      where: { customerId, addressHash: addrHash },
    });

    if (existing) {
      await prisma.addressIdentityLink.update({
        where: { id: existing.id },
        data: { lastSeenAt: new Date() },
      });
    } else {
      await prisma.addressIdentityLink.create({
        data: {
          customerId,
          addressHash: addrHash,
        },
      });
    }
  }

  static async createReviewCase(relationshipId: string, riskAssessment: {
    riskScore: number;
    triggeredSignals: string[];
  }): Promise<any> {
    const rel = await prisma.referralRelationship.findUnique({
      where: { id: relationshipId },
    });

    if (!rel) throw new Error('Referral relationship not found');

    const reviewCase = await prisma.referralReviewCase.create({
      data: {
        referralRelationshipId: relationshipId,
        referrerCustomerId: rel.referrerId,
        newCustomerId: rel.newCustomerId,
        status: 'OPEN',
        priority: riskAssessment.riskScore >= 90 ? 'CRITICAL' : riskAssessment.riskScore >= 70 ? 'HIGH' : 'MEDIUM',
        riskScore: riskAssessment.riskScore,
        triggeredSignals: JSON.stringify(riskAssessment.triggeredSignals),
      },
    });

    await prisma.referralRelationship.update({
      where: { id: relationshipId },
      data: { status: 'FRAUD_HOLD', fraudHeldAt: new Date(), riskScore: riskAssessment.riskScore },
    });

    return reviewCase;
  }
}
