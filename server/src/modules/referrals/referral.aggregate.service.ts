import { Prisma } from '@prisma/client';
import { prisma } from '../../database/prisma';
import { ReferralCodeService } from './referral.code.service';
import { ReferralConfigService } from './referral.config.service';
import { ReferralCustomerSummary } from './referral.types';

export class ReferralAggregateService {
  static async getCustomerSummary(customerId: string): Promise<ReferralCustomerSummary> {
    const config = await ReferralConfigService.getConfig();
    const primaryCode = await ReferralCodeService.getOrCreatePrimaryCode(customerId);
    const { shareUrl, shareMessage } = ReferralCodeService.createShareLink(primaryCode.code);

    const relationships = await prisma.referralRelationship.findMany({
      where: { referrerId: customerId },
    });

    let totalInvited = relationships.length;
    let totalRegistered = 0;
    let totalMobileVerified = 0;
    let totalFirstOrders = 0;
    let totalQualified = 0;
    let totalRewarded = 0;
    let totalRejected = 0;
    let totalUnderReview = 0;
    let currentMonthSuccessful = 0;

    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    for (const rel of relationships) {
      if (['REGISTERED', 'MOBILE_VERIFIED', 'NEW_USER_CREDIT_ISSUED', 'FIRST_ORDER_STARTED', 'FIRST_ORDER_PLACED', 'FIRST_ORDER_PAID', 'FIRST_ORDER_DELIVERED', 'COOLING_PERIOD', 'QUALIFIED', 'REWARDED'].includes(rel.status)) {
        totalRegistered++;
      }
      if (['MOBILE_VERIFIED', 'NEW_USER_CREDIT_ISSUED', 'FIRST_ORDER_STARTED', 'FIRST_ORDER_PLACED', 'FIRST_ORDER_PAID', 'FIRST_ORDER_DELIVERED', 'COOLING_PERIOD', 'QUALIFIED', 'REWARDED'].includes(rel.status)) {
        totalMobileVerified++;
      }
      if (['FIRST_ORDER_PLACED', 'FIRST_ORDER_PAID', 'FIRST_ORDER_DELIVERED', 'COOLING_PERIOD', 'QUALIFIED', 'REWARDED'].includes(rel.status)) {
        totalFirstOrders++;
      }
      if (['QUALIFIED', 'REWARDED'].includes(rel.status)) {
        totalQualified++;
      }
      if (rel.status === 'REWARDED') {
        totalRewarded++;
        if (rel.rewardedAt && rel.rewardedAt >= startOfMonth) {
          currentMonthSuccessful++;
        }
      }
      if (rel.status === 'REJECTED' || rel.status === 'CANCELLED') {
        totalRejected++;
      }
      if (rel.status === 'FRAUD_HOLD' || rel.status === 'MANUAL_REVIEW') {
        totalUnderReview++;
      }
    }

    // Calculate total earned amount
    const referrerCredits = await prisma.referralCredit.findMany({
      where: {
        customerId,
        creditType: 'REFERRER',
        status: 'CREDITED',
      },
    });

    let totalEarnedDec = new Prisma.Decimal('0.00');
    for (const c of referrerCredits) {
      totalEarnedDec = totalEarnedDec.plus(new Prisma.Decimal(c.amount.toString()));
    }

    // Calculate active referral wallet lots balance
    const activeLots = await prisma.walletCreditLot.findMany({
      where: {
        customerId,
        bucketType: { in: ['REFERRAL_NEW_USER', 'REFERRAL_REFERRER'] },
        status: { in: ['ACTIVE', 'PARTIALLY_USED'] },
        remainingAmount: { gt: 0 },
      },
    });

    let availableBal = new Prisma.Decimal('0.00');
    let expiringBal = new Prisma.Decimal('0.00');

    const next30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    for (const lot of activeLots) {
      const rem = new Prisma.Decimal(lot.remainingAmount.toString());
      availableBal = availableBal.plus(rem);

      if (lot.expiresAt && lot.expiresAt <= next30Days) {
        expiringBal = expiringBal.plus(rem);
      }
    }

    return {
      referralCode: primaryCode.code,
      shareUrl,
      shareMessage,
      newUserBenefitText: `Get ₹${config.newUserRewardAmount} credit on your first eligible order of ₹${config.minimumFirstOrderValue}+`,
      referrerBenefitText: `Earn ₹${config.referrerRewardAmount} wallet credit when your referred friend completes their first order`,
      minimumFirstOrder: Number(config.minimumFirstOrderValue),
      totalInvited,
      totalRegistered,
      totalMobileVerified,
      totalFirstOrders,
      totalQualified,
      totalRewarded,
      totalRejected,
      totalUnderReview,
      totalEarnedAmount: Number(totalEarnedDec),
      availableReferralBalance: Number(availableBal),
      expiringReferralBalance: Number(expiringBal),
      currentMonthSuccessfulReferrals: currentMonthSuccessful,
    };
  }
}
