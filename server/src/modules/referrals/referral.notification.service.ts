import { prisma } from '../../database/prisma';
import { JobProcessorOptions, JobProcessorResult } from './referral.types';

export class ReferralNotificationService {
  static async scheduleEventNotification(params: {
    customerId: string;
    eventType: string;
    referralRelationshipId?: string;
    referralCreditId?: string;
    channel?: string;
    idempotencyKey?: string;
    scheduledFor?: Date;
    metadata?: any;
  }): Promise<any> {
    const channel = params.channel || 'IN_APP';
    const idempotencyKey = params.idempotencyKey || `ref_notif_${params.eventType}_${params.customerId}_${params.referralRelationshipId || 'gen'}`;

    const existing = await prisma.referralNotificationEvent.findUnique({
      where: { idempotencyKey },
    });

    if (existing) return existing;

    return await prisma.referralNotificationEvent.create({
      data: {
        customerId: params.customerId,
        referralRelationshipId: params.referralRelationshipId || null,
        referralCreditId: params.referralCreditId || null,
        eventType: params.eventType,
        channel,
        status: 'PENDING',
        idempotencyKey,
        scheduledFor: params.scheduledFor || new Date(),
        metadataJson: params.metadata ? JSON.stringify(params.metadata) : null,
      },
    });
  }

  static async processDueNotifications(options: JobProcessorOptions = {}): Promise<JobProcessorResult> {
    const batchSize = options.batchSize || 50;
    const asOf = options.asOf || new Date();
    const dryRun = options.dryRun ?? false;

    let scannedCount = 0;
    let successCount = 0;
    let skippedCount = 0;
    let failedCount = 0;
    const details: any[] = [];

    const dueEvents = await prisma.referralNotificationEvent.findMany({
      where: {
        status: 'PENDING',
        scheduledFor: { lte: asOf },
      },
      take: batchSize,
      orderBy: { scheduledFor: 'asc' },
    });

    scannedCount = dueEvents.length;

    for (const event of dueEvents) {
      try {
        if (dryRun) {
          skippedCount++;
          details.push({ eventId: event.id, action: 'DRY_RUN_SEND' });
          continue;
        }

        // Mark sent
        await prisma.referralNotificationEvent.update({
          where: { id: event.id },
          data: {
            status: 'SENT',
            sentAt: new Date(),
          },
        });

        successCount++;
        details.push({ eventId: event.id, action: 'SENT' });
      } catch (err: any) {
        failedCount++;
        details.push({ eventId: event.id, action: 'FAILED', error: err.message });
      }
    }

    return {
      jobName: 'ReferralNotificationProcessor',
      scannedCount,
      successCount,
      skippedCount,
      failedCount,
      details,
    };
  }
}
