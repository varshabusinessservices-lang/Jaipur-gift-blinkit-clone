import { Prisma } from '@prisma/client';
import { prisma } from '../../database/prisma';
import { JobProcessorOptions, JobProcessorResult } from './referral.types';

export class ReferralCreditExpiryProcessor {
  static async processReferralCreditExpiry(options: JobProcessorOptions = {}): Promise<JobProcessorResult> {
    const batchSize = options.batchSize || 50;
    const asOf = options.asOf || new Date();
    const dryRun = options.dryRun ?? false;

    let scannedCount = 0;
    let successCount = 0;
    let skippedCount = 0;
    let failedCount = 0;
    const details: any[] = [];

    const expirableLots = await prisma.walletCreditLot.findMany({
      where: {
        bucketType: { in: ['REFERRAL_NEW_USER', 'REFERRAL_REFERRER'] },
        status: { in: ['ACTIVE', 'PARTIALLY_USED'] },
        expiresAt: { lte: asOf },
        remainingAmount: { gt: 0 },
      },
      take: batchSize,
      orderBy: { expiresAt: 'asc' },
    });

    scannedCount = expirableLots.length;

    for (const lot of expirableLots) {
      try {
        const remaining = new Prisma.Decimal(lot.remainingAmount.toString());
        const reserved = new Prisma.Decimal(lot.reservedAmount ? lot.reservedAmount.toString() : '0.00');

        // Protect active reservations
        const expirableAmount = Prisma.Decimal.max(new Prisma.Decimal('0.00'), remaining.sub(reserved));

        if (expirableAmount.lte(0)) {
          skippedCount++;
          details.push({ lotId: lot.id, action: 'SKIPPED_FULLY_RESERVED' });
          continue;
        }

        if (dryRun) {
          skippedCount++;
          details.push({ lotId: lot.id, action: 'DRY_RUN_EXPIRE', expirableAmount: expirableAmount.toString() });
          continue;
        }

        const newRemaining = remaining.sub(expirableAmount);

        await prisma.walletCreditLot.update({
          where: { id: lot.id },
          data: {
            remainingAmount: newRemaining,
            status: newRemaining.lte(0) ? 'EXPIRED' : lot.status,
          },
        });

        // Update corresponding ReferralCredit if lot completely expired
        if (newRemaining.lte(0)) {
          await prisma.referralCredit.updateMany({
            where: { walletCreditLotId: lot.id, status: 'CREDITED' },
            data: { status: 'CANCELLED' },
          });
        }

        // Update wallet account cached balance
        const walletAccount = await prisma.walletAccount.findFirst({
          where: { customerId: lot.customerId },
        });

        if (walletAccount) {
          const prevTotal = new Prisma.Decimal(walletAccount.cachedTotalBalance.toString());
          const prevAvail = new Prisma.Decimal(walletAccount.cachedAvailableBalance.toString());

          await prisma.walletAccount.update({
            where: { id: walletAccount.id },
            data: {
              cachedTotalBalance: Prisma.Decimal.max(new Prisma.Decimal('0.00'), prevTotal.sub(expirableAmount)),
              cachedAvailableBalance: Prisma.Decimal.max(new Prisma.Decimal('0.00'), prevAvail.sub(expirableAmount)),
            },
          });
        }

        successCount++;
        details.push({ lotId: lot.id, action: 'EXPIRED', expirableAmount: expirableAmount.toString() });
      } catch (err: any) {
        failedCount++;
        details.push({ lotId: lot.id, action: 'FAILED', error: err.message });
      }
    }

    return {
      jobName: 'ReferralCreditExpiryProcessor',
      scannedCount,
      successCount,
      skippedCount,
      failedCount,
      details,
    };
  }
}
