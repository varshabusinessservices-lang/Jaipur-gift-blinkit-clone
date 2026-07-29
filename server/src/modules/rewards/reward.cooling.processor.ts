import { PrismaClient } from '@prisma/client';
import { RewardCalculationService } from './reward.calculation.service';
import { RewardService } from './reward.service';
import { ScheduledJobService } from '../jobs/scheduled.job.service';

const prisma = new PrismaClient();

export interface CoolingProcessorOptions {
  batchSize?: number;
  cursor?: string;
  asOf?: Date;
  dryRun?: boolean;
  customerId?: string;
  rewardTransactionId?: string;
  triggeredBy?: string;
}

export class RewardCoolingProcessor {
  /**
   * Process all rewards whose cooling period has ended.
   */
  static async processCoolingRewards(options: CoolingProcessorOptions = {}) {
    return await ScheduledJobService.executeJob(
      {
        jobName: 'rewards:process-cooling',
        lockKey: 'lock:rewards:process-cooling',
        triggeredBy: options.triggeredBy || 'SCHEDULED',
        metadata: options,
      },
      async (runId) => {
        const batchSize = Math.min(500, Math.max(1, options.batchSize || 50));
        const asOf = options.asOf || new Date();
        const dryRun = options.dryRun || false;

        const where: any = {
          status: 'COOLING_PERIOD',
          coolingEndsAt: { lte: asOf },
          isFraudHold: false,
        };

        if (options.customerId) {
          where.customerId = options.customerId;
        }

        if (options.rewardTransactionId) {
          where.id = options.rewardTransactionId;
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

        const pendingRewards = await prisma.rewardTransaction.findMany(findOptions);

        let scannedCount = pendingRewards.length;
        let successCount = 0;
        let skippedCount = 0;
        let failedCount = 0;
        const errors: string[] = [];

        const config = await RewardCalculationService.getRewardConfig();

        for (const rewardTx of pendingRewards) {
          try {
            // Verify order is still valid and not cancelled or refunded
            if (rewardTx.sourceOrderId) {
              const order = await prisma.order.findUnique({
                where: { id: rewardTx.sourceOrderId },
              });

              if (!order || order.status === 'CANCELLED' || order.paymentStatus === 'REFUNDED') {
                skippedCount++;
                continue;
              }
            }

            if (dryRun) {
              successCount++;
              continue;
            }

            const now = new Date();
            const idempotencyKey = `reward_cooling_complete:${rewardTx.id}`;

            // Process atomically in transaction
            await prisma.$transaction(async (tx) => {
              const current = await tx.rewardTransaction.findUnique({
                where: { id: rewardTx.id },
              });

              if (!current || current.status !== 'COOLING_PERIOD' || current.isFraudHold) {
                return;
              }

              await tx.rewardTransaction.update({
                where: { id: rewardTx.id },
                data: {
                  status: 'CLAIMABLE',
                  claimableAt: now,
                  metadataJson: JSON.stringify({
                    coolingCompletedAt: now,
                    coolingCompletedRunId: runId,
                    idempotencyKey,
                  }),
                },
              });

              await RewardService.getRewardAccount(rewardTx.customerId, tx);

              // Auto convert if manual claim disabled
              if (!config.manualClaimEnabled) {
                try {
                  await RewardService.claimReward({
                    customerId: rewardTx.customerId,
                    rewardTransactionId: rewardTx.id,
                    idempotencyKey: `auto-convert-${rewardTx.id}`,
                    conversionType: 'AUTO',
                  });
                } catch {
                  // Silently allow auto convert to be picked up by auto conversion processor
                }
              }
            });

            successCount++;
          } catch (err: any) {
            failedCount++;
            errors.push(`Reward ${rewardTx.id}: ${err?.message || String(err)}`);
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
            nextCursor: pendingRewards.length === batchSize ? pendingRewards[pendingRewards.length - 1].id : null,
          },
        };
      }
    );
  }
}
