import { PrismaClient, Prisma } from '@prisma/client';
import { RewardCalculationService } from './reward.calculation.service';
import { RewardService } from './reward.service';
import { ScheduledJobService } from '../jobs/scheduled.job.service';

const prisma = new PrismaClient();

export interface WalletExpiryProcessorOptions {
  batchSize?: number;
  cursor?: string;
  asOf?: Date;
  dryRun?: boolean;
  customerId?: string;
  triggeredBy?: string;
}

export class RewardWalletExpiryProcessor {
  /**
   * Processes expired reward wallet credit lots safely with reservation protection.
   */
  static async processExpiringRewardLots(options: WalletExpiryProcessorOptions = {}) {
    return await ScheduledJobService.executeJob(
      {
        jobName: 'rewards:expire-wallet',
        lockKey: 'lock:rewards:expire-wallet',
        triggeredBy: options.triggeredBy || 'SCHEDULED',
        metadata: options,
      },
      async (runId) => {
        const batchSize = Math.min(500, Math.max(1, options.batchSize || 50));
        const asOf = options.asOf || new Date();
        const dryRun = options.dryRun || false;

        const where: any = {
          bucketType: 'REWARD',
          remainingAmount: { gt: 0 },
          expiresAt: { lte: asOf },
          status: { in: ['ACTIVE', 'LOCKED'] },
        };

        if (options.customerId) {
          where.customerId = options.customerId;
        }

        const findOptions: any = {
          where,
          take: batchSize,
          orderBy: { id: 'asc' },
        };

        if (options.cursor) {
          findOptions.cursor = { id: options.cursor };
          findOptions.skip = 1;
        }

        const expiringLots = await prisma.walletCreditLot.findMany(findOptions);

        let scannedCount = expiringLots.length;
        let successCount = 0;
        let skippedCount = 0;
        let failedCount = 0;
        const errors: string[] = [];

        const config = await RewardCalculationService.getRewardConfig();

        for (const lot of expiringLots) {
          try {
            if (dryRun) {
              successCount++;
              continue;
            }

            await prisma.$transaction(async (tx) => {
              const currentLot = await tx.walletCreditLot.findUnique({
                where: { id: lot.id },
              });

              if (!currentLot || currentLot.remainingAmount.lte(0) || !currentLot.expiresAt || currentLot.expiresAt > asOf) {
                return;
              }

              const reserved = currentLot.reservedAmount;
              const remaining = currentLot.remainingAmount;

              let expirableAmount = new Prisma.Decimal('0.00');
              let protectedAmount = new Prisma.Decimal('0.00');
              let requirePostReleaseExpiry = false;

              if (reserved.gt(0)) {
                // Protect reserved portion from immediate expiry
                protectedAmount = reserved;
                expirableAmount = remaining.sub(reserved);
                requirePostReleaseExpiry = true;
              } else {
                expirableAmount = remaining;
              }

              if (expirableAmount.lte(0) && requirePostReleaseExpiry) {
                // Update post release flag only
                await tx.walletCreditLot.update({
                  where: { id: currentLot.id },
                  data: {
                    protectedReservedAmount: protectedAmount,
                    postReleaseExpiryRequired: true,
                    expiryAtReservationTime: currentLot.expiresAt,
                  },
                });
                return;
              }

              const newRemaining = remaining.sub(expirableAmount);
              const newExpiredTotal = currentLot.expiredAmount.plus(expirableAmount);
              const newStatus = newRemaining.lte(0) ? 'EXPIRED' : currentLot.status;

              await tx.walletCreditLot.update({
                where: { id: currentLot.id },
                data: {
                  remainingAmount: newRemaining,
                  expiredAmount: newExpiredTotal,
                  status: newStatus,
                  protectedReservedAmount: protectedAmount,
                  postReleaseExpiryRequired: requirePostReleaseExpiry,
                  expiryAtReservationTime: requirePostReleaseExpiry ? currentLot.expiresAt : null,
                },
              });

              // Debit wallet account & record EXPIRY ledger entry
              const walletAccount = await tx.walletAccount.findUnique({
                where: { id: currentLot.walletAccountId },
              });

              if (walletAccount && expirableAmount.gt(0)) {
                const prevTotal = walletAccount.cachedTotalBalance;
                const prevAvailable = walletAccount.cachedAvailableBalance;
                const newTotal = prevTotal.sub(expirableAmount);
                const newAvailable = prevAvailable.sub(expirableAmount);

                const ledgerEntry = await tx.walletLedgerEntry.create({
                  data: {
                    walletAccountId: walletAccount.id,
                    customerId: currentLot.customerId,
                    creditLotId: currentLot.id,
                    transactionType: 'DEBIT',
                    direction: 'DEBIT',
                    bucketType: 'REWARD',
                    amount: expirableAmount,
                    openingWalletBalance: prevTotal,
                    closingWalletBalance: newTotal,
                    openingLotBalance: currentLot.remainingAmount,
                    closingLotBalance: currentLot.remainingAmount.sub(expirableAmount),
                    referenceType: 'EXPIRY',
                    referenceId: currentLot.id,
                    idempotencyKey: `reward-lot-expiry-ledger-${currentLot.id}-${runId}`,
                    narration: `Expired reward wallet credits from lot ${currentLot.id}`,
                  },
                });

                await tx.walletAccount.update({
                  where: { id: walletAccount.id },
                  data: {
                    cachedTotalBalance: newTotal,
                    cachedAvailableBalance: newAvailable,
                  },
                });

                // Update reward account totalExpiredCoins
                if (currentLot.customerId) {
                  const coinsExpired = expirableAmount.div(config.rewardCoinValue);
                  const rewardAccount = await RewardService.getRewardAccount(currentLot.customerId, tx);
                  await tx.rewardAccount.update({
                    where: { id: rewardAccount.id },
                    data: {
                      totalExpiredCoins: rewardAccount.totalExpiredCoins.plus(coinsExpired),
                    },
                  });
                }
              }
            });

            successCount++;
          } catch (err: any) {
            failedCount++;
            errors.push(`Lot ${lot.id}: ${err?.message || String(err)}`);
          }
        }

        return {
          scannedCount,
          successCount,
          skippedCount,
          failedCount,
          errorSummary: errors.length > 0 ? errors.join('; ') : undefined,
          data: {
            asOf,
            dryRun,
            nextCursor: expiringLots.length === batchSize ? expiringLots[expiringLots.length - 1].id : null,
          },
        };
      }
    );
  }
}
