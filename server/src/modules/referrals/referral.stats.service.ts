import { prisma } from '../../database/prisma';
import { ReferralCustomerSummary } from './referral.types';
import { ReferralConfigService } from './referral.config.service';

export class ReferralStatsService {
  static async getCustomerSummary(customerId: string): Promise<ReferralCustomerSummary> {
    const config = await ReferralConfigService.getConfig();

    const codeRecord = await prisma.referralCode.findFirst({
      where: { customerId, isPrimary: true, status: 'ACTIVE' },
    });

    const referralCode = codeRecord?.code || '';
    const shareUrl = referralCode ? `${process.env.FRONTEND_URL || 'https://jaipurgifting.com'}/r/${referralCode}` : '';
    const shareMessage = `Use my referral code ${referralCode} to get ₹${config.newUserRewardAmount} off on your first order of ₹${config.minimumFirstOrderValue}+ at Jaipur Gifting! Sign up here: ${shareUrl}`;

    const stats = await prisma.referralRelationship.groupBy({
      by: ['status'],
      where: { referrerId: customerId },
      _count: { id: true },
    });

    const statMap: Record<string, number> = {};
    for (const s of stats) {
      statMap[s.status] = s._count.id;
    }

    const totalRegistered = (statMap['REGISTERED'] || 0) + (statMap['MOBILE_VERIFIED'] || 0) + (statMap['NEW_USER_CREDIT_ISSUED'] || 0) + (statMap['FIRST_ORDER_STARTED'] || 0) + (statMap['FIRST_ORDER_PLACED'] || 0) + (statMap['FIRST_ORDER_PAID'] || 0) + (statMap['FIRST_ORDER_DELIVERED'] || 0) + (statMap['COOLING_PERIOD'] || 0) + (statMap['QUALIFIED'] || 0) + (statMap['REWARDED'] || 0);
    const totalQualified = (statMap['QUALIFIED'] || 0) + (statMap['REWARDED'] || 0);

    const credits = await prisma.referralCredit.aggregate({
      where: { customerId, creditType: 'REFERRER', status: 'CREDITED' },
      _sum: { amount: true },
    });

    const totalEarnedAmount = Number(credits._sum.amount || 0);

    // Get wallet bucket balances from wallet service logic directly here or via wallet service
    // For summary, we can sum the wallet lots
    const activeLots = await prisma.walletCreditLot.aggregate({
      where: {
        customerId,
        bucketType: 'REFERRAL_REFERRER',
        status: 'ACTIVE',
        expiresAt: { gt: new Date() },
      },
      _sum: { remainingAmount: true },
    });
    const availableReferralBalance = Number(activeLots._sum.remainingAmount || 0);

    const expiringLots = await prisma.walletCreditLot.aggregate({
      where: {
        customerId,
        bucketType: 'REFERRAL_REFERRER',
        status: 'ACTIVE',
        expiresAt: { gt: new Date(), lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }, // expiring in 7 days
      },
      _sum: { remainingAmount: true },
    });
    const expiringReferralBalance = Number(expiringLots._sum.remainingAmount || 0);

    const now = new Date();
    const currentMonthRewarded = await prisma.referralRelationship.count({
      where: {
        referrerId: customerId,
        status: 'REWARDED',
        rewardedAt: { gte: new Date(now.getFullYear(), now.getMonth(), 1) },
      }
    });

    return {
      referralCode,
      shareUrl,
      shareMessage,
      newUserBenefitText: `₹${config.newUserRewardAmount}`,
      referrerBenefitText: `₹${config.referrerRewardAmount}`,
      minimumFirstOrder: Number(config.minimumFirstOrderValue),
      totalInvited: 0, // Not accurately trackable unless we track distinct sessions
      totalRegistered,
      totalMobileVerified: totalRegistered - (statMap['REGISTERED'] || 0),
      totalFirstOrders: (statMap['FIRST_ORDER_PLACED'] || 0) + (statMap['FIRST_ORDER_PAID'] || 0) + (statMap['FIRST_ORDER_DELIVERED'] || 0) + (statMap['COOLING_PERIOD'] || 0) + totalQualified,
      totalQualified,
      totalRewarded: statMap['REWARDED'] || 0,
      totalRejected: (statMap['REJECTED'] || 0) + (statMap['CANCELLED'] || 0) + (statMap['REVERSED'] || 0),
      totalUnderReview: (statMap['MANUAL_REVIEW'] || 0) + (statMap['FRAUD_HOLD'] || 0),
      totalEarnedAmount,
      availableReferralBalance,
      expiringReferralBalance,
      currentMonthSuccessfulReferrals: currentMonthRewarded,
    };
  }

  static async getAdminDashboardStats(): Promise<any> {
    const totalRelationships = await prisma.referralRelationship.count();
    const successfulReferrals = await prisma.referralRelationship.count({ where: { status: 'REWARDED' } });
    const pendingReferrals = await prisma.referralRelationship.count({ where: { status: { in: ['REGISTERED', 'MOBILE_VERIFIED', 'FIRST_ORDER_PLACED', 'FIRST_ORDER_PAID', 'FIRST_ORDER_DELIVERED', 'COOLING_PERIOD', 'QUALIFIED'] } } });
    
    const issuedCredits = await prisma.referralCredit.aggregate({
      _sum: { amount: true },
    });

    const riskCases = await prisma.referralReviewCase.count({ where: { status: 'OPEN' } });

    return {
      totalRelationships,
      successfulReferrals,
      pendingReferrals,
      totalCreditsIssued: Number(issuedCredits._sum.amount || 0),
      openRiskCases: riskCases,
    };
  }
}
