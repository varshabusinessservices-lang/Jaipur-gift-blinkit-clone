import { Prisma } from '@prisma/client';
import { prisma } from '../../database/prisma';
import { WalletService } from '../wallet/wallet.service';
import { ReferralConfigService } from './referral.config.service';

export class ReferralCreditService {
  static async issueNewUserCredit(relationshipId: string): Promise<any> {
    const rel = await prisma.referralRelationship.findUnique({
      where: { id: relationshipId },
    });

    if (!rel) throw new Error('Referral relationship not found');

    if (rel.status === 'REJECTED' || rel.status === 'FRAUD_HOLD') {
      throw new Error(`Cannot issue new user credit for relationship in state ${rel.status}`);
    }

    // Check if new user credit already issued
    const existingCredit = await prisma.referralCredit.findFirst({
      where: {
        referralRelationId: relationshipId,
        creditType: 'NEW_USER',
      },
    });

    if (existingCredit) {
      return existingCredit;
    }

    const config = await ReferralConfigService.getConfig();
    const amount = rel.newUserRewardValue && Number(rel.newUserRewardValue) > 0
      ? new Prisma.Decimal(rel.newUserRewardValue.toString())
      : config.newUserRewardAmount;

    const expiresAt = new Date(Date.now() + config.newUserCreditExpiryDays * 24 * 60 * 60 * 1000);
    const idempotencyKey = `referral_new_user_credit_${relationshipId}`;

    // Create wallet lot & ledger entry via WalletService
    const walletRes = await WalletService.createReferralCredit({
      customerId: rel.newCustomerId,
      amount: Number(amount),
      bucketType: 'REFERRAL_NEW_USER',
      sourceId: relationshipId,
      expiresAt,
      firstOrderOnly: true,
      idempotencyKey,
    });

    const referralCredit = await prisma.referralCredit.create({
      data: {
        referralRelationId: relationshipId,
        customerId: rel.newCustomerId,
        creditType: 'NEW_USER',
        amount,
        walletCreditLotId: walletRes.lot.id,
        walletLedgerEntryId: walletRes.entry.id,
        status: 'CREDITED',
        idempotencyKey,
        expiresAt,
        issuedAt: new Date(),
        availableAt: new Date(),
      },
    });

    await prisma.referralRelationship.update({
      where: { id: relationshipId },
      data: {
        status: 'NEW_USER_CREDIT_ISSUED',
        // newUserRewardedAt not tracked directly here,
      },
    });

    return referralCredit;
  }

  static async issueReferrerCredit(relationshipId: string): Promise<any> {
    const rel = await prisma.referralRelationship.findUnique({
      where: { id: relationshipId },
    });

    if (!rel) throw new Error('Referral relationship not found');

    if (rel.status !== 'QUALIFIED' && rel.status !== 'COOLING_PERIOD') {
      throw new Error(`Referral relationship must be QUALIFIED or COOLING_PERIOD to issue referrer credit, current state: ${rel.status}`);
    }

    // Check if referrer credit already issued
    const existingCredit = await prisma.referralCredit.findFirst({
      where: {
        referralRelationId: relationshipId,
        creditType: 'REFERRER',
      },
    });

    if (existingCredit) {
      return existingCredit;
    }

    const config = await ReferralConfigService.getConfig();

    // Check monthly & lifetime limits
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthlyRewardedCount = await prisma.referralRelationship.count({
      where: {
        referrerId: rel.referrerId,
        status: 'REWARDED',
        rewardedAt: { gte: startOfMonth },
      },
    });

    if (monthlyRewardedCount >= config.monthlyReferralLimit) {
      await prisma.referralRelationship.update({
        where: { id: relationshipId },
        data: { status: 'MANUAL_REVIEW', rejectionReason: 'Monthly referral limit reached for referrer' },
      });
      throw new Error('Referrer monthly limit reached. Marked for manual review.');
    }

    const lifetimeRewardedCount = await prisma.referralRelationship.count({
      where: {
        referrerId: rel.referrerId,
        status: 'REWARDED',
      },
    });

    if (lifetimeRewardedCount >= config.lifetimeReferralLimit) {
      await prisma.referralRelationship.update({
        where: { id: relationshipId },
        data: { status: 'MANUAL_REVIEW', rejectionReason: 'Lifetime referral limit reached for referrer' },
      });
      throw new Error('Referrer lifetime limit reached. Marked for manual review.');
    }

    const amount = rel.referrerRewardValue && Number(rel.referrerRewardValue) > 0
      ? new Prisma.Decimal(rel.referrerRewardValue.toString())
      : config.referrerRewardAmount;

    const expiresAt = new Date(Date.now() + config.referrerCreditExpiryDays * 24 * 60 * 60 * 1000);
    const idempotencyKey = `referral_referrer_credit_${relationshipId}`;

    const walletRes = await WalletService.createReferralCredit({
      customerId: rel.referrerId,
      amount: Number(amount),
      bucketType: 'REFERRAL_REFERRER',
      sourceId: relationshipId,
      expiresAt,
      idempotencyKey,
    });

    const referralCredit = await prisma.referralCredit.create({
      data: {
        referralRelationId: relationshipId,
        customerId: rel.referrerId,
        creditType: 'REFERRER',
        amount,
        walletCreditLotId: walletRes.lot.id,
        walletLedgerEntryId: walletRes.entry.id,
        status: 'CREDITED',
        idempotencyKey,
        expiresAt,
        issuedAt: new Date(),
        availableAt: new Date(),
      },
    });

    await prisma.referralRelationship.update({
      where: { id: relationshipId },
      data: {
        status: 'REWARDED',
        qualifiedAt: rel.qualifiedAt || new Date(),
        rewardedAt: new Date(),
      },
    });

    return referralCredit;
  }
}
