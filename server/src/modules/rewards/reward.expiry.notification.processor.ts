import { PrismaClient, Prisma } from '@prisma/client';
import { RewardCalculationService } from './reward.calculation.service';
import { ScheduledJobService } from '../jobs/scheduled.job.service';

const prisma = new PrismaClient();

export interface ExpiryNotificationOptions {
  batchSize?: number;
  asOf?: Date;
  dryRun?: boolean;
  customerId?: string;
  triggeredBy?: string;
}

export class RewardExpiryNotificationProcessor {
  /**
   * Schedule expiry reminder notifications for active reward lots.
   */
  static async scheduleExpiryNotifications(options: ExpiryNotificationOptions = {}) {
    return await ScheduledJobService.executeJob(
      {
        jobName: 'rewards:schedule-notifications',
        lockKey: 'lock:rewards:schedule-notifications',
        triggeredBy: options.triggeredBy || 'SCHEDULED',
        metadata: options,
      },
      async (runId) => {
        const batchSize = Math.min(500, Math.max(1, options.batchSize || 100));
        const asOf = options.asOf || new Date();
        const dryRun = options.dryRun || false;

        const config = await RewardCalculationService.getRewardConfig();

        if (!config.rewardExpiryNotificationsEnabled) {
          return {
            scannedCount: 0,
            successCount: 0,
            skippedCount: 0,
            failedCount: 0,
            errorSummary: 'Reward expiry notifications are disabled in WalletConfig.',
          };
        }

        let reminderDays: number[] = [60, 45, 30, 15, 7, 3, 1, 0];
        try {
          if (config.rewardExpiryReminderDaysJson) {
            reminderDays = JSON.parse(config.rewardExpiryReminderDaysJson);
          }
        } catch {
          // Fallback to default
        }

        const minBalance = config.minimumBalanceForExpiryReminder || new Prisma.Decimal('10.00');

        const activeLots = await prisma.walletCreditLot.findMany({
          where: {
            bucketType: 'REWARD',
            status: 'ACTIVE',
            remainingAmount: { gte: minBalance },
            expiresAt: { gt: asOf },
            customerId: options.customerId ? options.customerId : { not: null },
          },
          take: batchSize,
          orderBy: { expiresAt: 'asc' },
        });

        let scannedCount = activeLots.length;
        let successCount = 0;
        let skippedCount = 0;
        let failedCount = 0;

        for (const lot of activeLots) {
          if (!lot.expiresAt || !lot.customerId) continue;

          const lotExpiry = new Date(lot.expiresAt);

          for (const days of reminderDays) {
            const scheduledFor = new Date(lotExpiry.getTime() - days * 24 * 60 * 60 * 1000);

            // Skip if reminder scheduled date is in the deep past (more than 1 day past)
            if (scheduledFor.getTime() < asOf.getTime() - 24 * 60 * 60 * 1000) {
              continue;
            }

            const idempotencyKey = `reward_expiry_notif:${lot.id}:${days}d`;

            if (dryRun) {
              successCount++;
              continue;
            }

            try {
              const existing = await prisma.rewardNotificationEvent.findUnique({
                where: { idempotencyKey },
              });

              if (!existing) {
                const title = days === 0
                  ? 'Your reward credits expire today!'
                  : `Your ₹${lot.remainingAmount.toFixed(2)} reward balance expires in ${days} day${days > 1 ? 's' : ''}`;

                const message = days === 0
                  ? `Your ₹${lot.remainingAmount.toFixed(2)} reward credits expire today. Use them on your next order before midnight!`
                  : `You have ₹${lot.remainingAmount.toFixed(2)} in reward credits expiring on ${lotExpiry.toLocaleDateString()}. Shop now to save!`;

                await prisma.rewardNotificationEvent.create({
                  data: {
                    customerId: lot.customerId,
                    walletCreditLotId: lot.id,
                    notificationType: 'REWARD_EXPIRING',
                    channel: 'IN_APP',
                    scheduledFor: scheduledFor <= asOf ? asOf : scheduledFor,
                    status: 'PENDING',
                    idempotencyKey,
                    title,
                    message,
                    amount: lot.remainingAmount,
                    expiresAt: lotExpiry,
                  },
                });
                successCount++;
              } else {
                skippedCount++;
              }
            } catch {
              failedCount++;
            }
          }
        }

        return {
          scannedCount,
          successCount,
          skippedCount,
          failedCount,
        };
      }
    );
  }

  /**
   * Process due scheduled reward notifications.
   */
  static async processDueNotifications(options: ExpiryNotificationOptions = {}) {
    return await ScheduledJobService.executeJob(
      {
        jobName: 'rewards:send-notifications',
        lockKey: 'lock:rewards:send-notifications',
        triggeredBy: options.triggeredBy || 'SCHEDULED',
        metadata: options,
      },
      async (runId) => {
        const batchSize = Math.min(500, Math.max(1, options.batchSize || 100));
        const asOf = options.asOf || new Date();
        const dryRun = options.dryRun || false;

        const config = await RewardCalculationService.getRewardConfig();

        const pendingEvents = await prisma.rewardNotificationEvent.findMany({
          where: {
            status: 'PENDING',
            scheduledFor: { lte: asOf },
            customerId: options.customerId ? options.customerId : undefined,
          },
          take: batchSize,
          orderBy: { scheduledFor: 'asc' },
        });

        let scannedCount = pendingEvents.length;
        let successCount = 0;
        let skippedCount = 0;
        let failedCount = 0;

        for (const event of pendingEvents) {
          try {
            // Check quiet hours (e.g. 10 PM to 8 AM)
            const currentHour = asOf.getHours();
            const quietStart = config.quietHoursStart ?? 22;
            const quietEnd = config.quietHoursEnd ?? 8;

            const isQuietHour = quietStart > quietEnd
              ? (currentHour >= quietStart || currentHour < quietEnd)
              : (currentHour >= quietStart && currentHour < quietEnd);

            if (isQuietHour) {
              // Reschedule to next quietEnd hour
              const rescheduled = new Date(asOf);
              if (currentHour >= quietStart) {
                rescheduled.setDate(rescheduled.getDate() + 1);
              }
              rescheduled.setHours(quietEnd, 0, 0, 0);

              await prisma.rewardNotificationEvent.update({
                where: { id: event.id },
                data: { scheduledFor: rescheduled },
              });
              skippedCount++;
              continue;
            }

            // Verify underlying lot is still valid
            if (event.walletCreditLotId) {
              const lot = await prisma.walletCreditLot.findUnique({
                where: { id: event.walletCreditLotId },
              });

              if (!lot || lot.remainingAmount.lte(0) || lot.status !== 'ACTIVE') {
                await prisma.rewardNotificationEvent.update({
                  where: { id: event.id },
                  data: { status: 'CANCELLED' },
                });
                skippedCount++;
                continue;
              }
            }

            if (dryRun) {
              successCount++;
              continue;
            }

            // Mark SENT
            await prisma.rewardNotificationEvent.update({
              where: { id: event.id },
              data: {
                status: 'SENT',
                sentAt: new Date(),
              },
            });

            successCount++;
          } catch (err: any) {
            failedCount++;
            await prisma.rewardNotificationEvent.update({
              where: { id: event.id },
              data: {
                status: 'FAILED',
                failedAt: new Date(),
                retryCount: event.retryCount + 1,
                failureCode: err?.message || String(err),
              },
            }).catch(() => {});
          }
        }

        return {
          scannedCount,
          successCount,
          skippedCount,
          failedCount,
        };
      }
    );
  }

  /**
   * Cancel pending notifications for lots that are no longer active or spent.
   */
  static async cancelObsoleteNotifications(options: ExpiryNotificationOptions = {}) {
    const asOf = options.asOf || new Date();

    const pending = await prisma.rewardNotificationEvent.findMany({
      where: {
        status: 'PENDING',
        walletCreditLotId: { not: null },
      },
      take: options.batchSize || 200,
    });

    let cancelledCount = 0;

    for (const event of pending) {
      if (!event.walletCreditLotId) continue;

      const lot = await prisma.walletCreditLot.findUnique({
        where: { id: event.walletCreditLotId },
      });

      if (!lot || lot.remainingAmount.lte(0) || lot.status !== 'ACTIVE') {
        await prisma.rewardNotificationEvent.update({
          where: { id: event.id },
          data: { status: 'CANCELLED' },
        });
        cancelledCount++;
      }
    }

    return { cancelledCount };
  }
}
