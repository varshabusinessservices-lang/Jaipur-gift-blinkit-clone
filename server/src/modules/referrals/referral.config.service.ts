import { Prisma } from '@prisma/client';
import { prisma } from '../../database/prisma';
import { ReferralConfigSnapshot } from './referral.types';

export class ReferralConfigService {
  static async getConfig(): Promise<ReferralConfigSnapshot> {
    const dbConfig = await prisma.walletConfig.findUnique({
      where: { id: 'singleton' },
    });

    if (!dbConfig) {
      return {
        referralEnabled: true,
        referralCodeLength: 8,
        referralCodePrefix: 'JPR',
        referrerRewardAmount: new Prisma.Decimal('50.00'),
        newUserRewardAmount: new Prisma.Decimal('100.00'),
        minimumFirstOrderValue: new Prisma.Decimal('299.00'),
        firstOrderOverrideEnabled: true,
        firstOrderOverrideMaximumAmount: new Prisma.Decimal('100.00'),
        newUserCreditExpiryDays: 30,
        referrerCreditExpiryDays: 90,
        referralCoolingDays: 3,
        monthlyReferralLimit: 10,
        lifetimeReferralLimit: 50,
        maxReferralsPerDevice: 3,
        riskOtpThreshold: 50,
        manualReviewThreshold: 70,
        blockThreshold: 90,
      };
    }

    return {
      referralEnabled: dbConfig.referralEnabled ?? true,
      referralCodeLength: 8,
      referralCodePrefix: 'JPR',
      referrerRewardAmount: dbConfig.referralReferrerAmt ? new Prisma.Decimal(dbConfig.referralReferrerAmt.toString()) : new Prisma.Decimal('50.00'),
      newUserRewardAmount: dbConfig.referralNewUserAmt ? new Prisma.Decimal(dbConfig.referralNewUserAmt.toString()) : new Prisma.Decimal('100.00'),
      minimumFirstOrderValue: dbConfig.referralMinOrder ? new Prisma.Decimal(dbConfig.referralMinOrder.toString()) : new Prisma.Decimal('299.00'),
      firstOrderOverrideEnabled: dbConfig.newUserFirstOrderOverrideEnabled ?? true,
      firstOrderOverrideMaximumAmount: dbConfig.referralNewUserAmt ? new Prisma.Decimal(dbConfig.referralNewUserAmt.toString()) : new Prisma.Decimal('100.00'),
      newUserCreditExpiryDays: dbConfig.referralNewUserExp ?? 30,
      referrerCreditExpiryDays: dbConfig.referralReferrerExp ?? 90,
      referralCoolingDays: dbConfig.referralCoolingDays ?? 3,
      monthlyReferralLimit: dbConfig.monthlyReferralLimit ?? 10,
      lifetimeReferralLimit: dbConfig.lifetimeReferralLimit ?? 50,
      maxReferralsPerDevice: dbConfig.maxReferralsPerDevice ?? 3,
      riskOtpThreshold: dbConfig.riskOtpThreshold ?? 50,
      manualReviewThreshold: dbConfig.manualReviewThreshold ?? 70,
      blockThreshold: dbConfig.blockThreshold ?? 90,
    };
  }

  static async updateConfig(data: Partial<{
    referralEnabled: boolean;
    referralReferrerAmt: number | string;
    referralNewUserAmt: number | string;
    referralMinOrder: number | string;
    newUserFirstOrderOverrideEnabled: boolean;
    referralReferrerExp: number;
    referralNewUserExp: number;
    referralCoolingDays: number;
    monthlyReferralLimit: number;
    lifetimeReferralLimit: number;
    maxReferralsPerDevice: number;
    riskOtpThreshold: number;
    manualReviewThreshold: number;
    blockThreshold: number;
  }>) {
    const updatePayload: any = {};

    if (data.referralEnabled !== undefined) updatePayload.referralEnabled = data.referralEnabled;
    if (data.referralReferrerAmt !== undefined) updatePayload.referralReferrerAmt = new Prisma.Decimal(data.referralReferrerAmt.toString());
    if (data.referralNewUserAmt !== undefined) updatePayload.referralNewUserAmt = new Prisma.Decimal(data.referralNewUserAmt.toString());
    if (data.referralMinOrder !== undefined) updatePayload.referralMinOrder = new Prisma.Decimal(data.referralMinOrder.toString());
    if (data.newUserFirstOrderOverrideEnabled !== undefined) updatePayload.newUserFirstOrderOverrideEnabled = data.newUserFirstOrderOverrideEnabled;
    if (data.referralReferrerExp !== undefined) updatePayload.referralReferrerExp = data.referralReferrerExp;
    if (data.referralNewUserExp !== undefined) updatePayload.referralNewUserExp = data.referralNewUserExp;
    if (data.referralCoolingDays !== undefined) updatePayload.referralCoolingDays = data.referralCoolingDays;
    if (data.monthlyReferralLimit !== undefined) updatePayload.monthlyReferralLimit = data.monthlyReferralLimit;
    if (data.lifetimeReferralLimit !== undefined) updatePayload.lifetimeReferralLimit = data.lifetimeReferralLimit;
    if (data.maxReferralsPerDevice !== undefined) updatePayload.maxReferralsPerDevice = data.maxReferralsPerDevice;
    if (data.riskOtpThreshold !== undefined) updatePayload.riskOtpThreshold = data.riskOtpThreshold;
    if (data.manualReviewThreshold !== undefined) updatePayload.manualReviewThreshold = data.manualReviewThreshold;
    if (data.blockThreshold !== undefined) updatePayload.blockThreshold = data.blockThreshold;

    updatePayload.version = { increment: 1 };

    return await prisma.walletConfig.upsert({
      where: { id: 'singleton' },
      create: { id: 'singleton', ...updatePayload },
      update: updatePayload,
    });
  }
}
