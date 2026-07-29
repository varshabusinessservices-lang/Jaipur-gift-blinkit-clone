import { PrismaClient } from '@prisma/client';
import { RewardCalculationService } from './reward.calculation.service';
import { RewardService } from './reward.service';
import { ScheduledJobService } from '../jobs/scheduled.job.service';

const prisma = new PrismaClient();

export interface AutoConvertProcessorOptions {
  batchSize?: number;
  cursor?: string;
  asOf?: Date;
  dryRun?: boolean;
  customerId?: string;
  triggeredBy?: string;
}

export class RewardAutoConversionProcessor {
  /**
   * Automatically converts claimable rewards that have reached their auto-conversion threshold.
   */
  static async processDueAutoConversions(options: AutoConvertProcessorOptions = {}) {
    return await ScheduledJobService.executeJob(
      {
        jobName: 'rewards:auto-convert',
        lockKey: 'lock:rewards:auto-convert',
        triggeredBy: options.triggeredBy || 'SCHEDULED',
        metadata: options,
      },
      async (runId) => {
        const batchSize = Math.min(500, Math.max(1, options.batchSize || 50));
        const asOf = options.asOf || new Date();
        const dryRun = options.dryRun || false;

        const config = await RewardCalculationService.getRewardConfig();

        if (!config.automaticConversionEnabled) {
          return {
            scannedCount: 0,
            successCount: 0,
            skippedCount: 0,
            failedCount: 0,
            errorSummary: 'Automatic conversion is disabled in WalletConfig.',
          };
        }

        const where: any = {
          status: 'CLAIMABLE',
          isFraudHold: false,
          OR: [
            { autoConvertAt: { lte: asOf } },
            { autoConvertAt: null },
          ],
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

        const claimableRewards = await prisma.rewardTransaction.findMany(findOptions);

        let scannedCount = claimableRewards.length;
        let successCount = 0;
        let skippedCount = 0;
        let failedCount = 0;
        const errors: string[] = [];

        for (const rewardTx of claimableRewards) {
          try {
            if (dryRun) {
              successCount++;
              continue;
            }

            const idempotencyKey = `auto-convert-tx-${rewardTx.id}`;

            const result = await RewardService.claimReward({
              customerId: rewardTx.customerId,
              rewardTransactionId: rewardTx.id,
              idempotencyKey,
              conversionType: 'AUTO',
            });

            if (result.alreadyClaimed || result.success) {
              successCount++;
            } else {
              failedCount++;
              errors.push(`Auto-convert failed for ${rewardTx.id}`);
            }
          } catch (err: any) {
            failedCount++;
            const errorMsg = err?.message || String(err);
            errors.push(`Reward ${rewardTx.id}: ${errorMsg}`);

            // Log recovery case for repeated failures
            try {
              await prisma.rewardRecoveryCase.create({
                data: {
                  customerId: rewardTx.customerId,
                  rewardTransactionId: rewardTx.id,
                  recoveryType: 'CONVERSION_FAILED',
                  status: 'OPEN',
                  originalRewardAmount: rewardTx.walletValue,
                  outstandingAmount: rewardTx.walletValue,
                  reasonCode: 'AUTO_CONVERSION_EXCEPTION',
                  metadataJson: JSON.stringify({ error: errorMsg, runId }),
                },
              });
            } catch {
              // Ignore recovery creation failures
            }
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
            nextCursor: claimableRewards.length === batchSize ? claimableRewards[claimableRewards.length - 1].id : null,
          },
        };
      }
    );
  }
}
