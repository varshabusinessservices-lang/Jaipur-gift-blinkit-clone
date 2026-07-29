import { prisma } from '../../database/prisma';
import { ReferralQualificationService } from './referral.qualification.service';
import { JobProcessorOptions, JobProcessorResult } from './referral.types';

export class ReferralCoolingProcessor {
  static async processDueReferralQualifications(options: JobProcessorOptions = {}): Promise<JobProcessorResult> {
    const batchSize = options.batchSize || 50;
    const asOf = options.asOf || new Date();
    const dryRun = options.dryRun ?? false;

    let scannedCount = 0;
    let successCount = 0;
    let skippedCount = 0;
    let failedCount = 0;
    const details: any[] = [];

    const whereClause: any = {
      status: 'COOLING_PERIOD',
      coolingEndsAt: { lte: asOf },
    };

    if (options.relationshipId) {
      whereClause.id = options.relationshipId;
    }
    if (options.customerId) {
      whereClause.referrerId = options.customerId;
    }

    const dueRelationships = await prisma.referralRelationship.findMany({
      where: whereClause,
      take: batchSize,
      orderBy: { coolingEndsAt: 'asc' },
    });

    scannedCount = dueRelationships.length;

    for (const rel of dueRelationships) {
      try {
        if (dryRun) {
          skippedCount++;
          details.push({ relationshipId: rel.id, action: 'DRY_RUN_QUALIFY', referrerId: rel.referrerId });
          continue;
        }

        await ReferralQualificationService.qualifyReferral(rel.id);
        successCount++;
        details.push({ relationshipId: rel.id, action: 'QUALIFIED_AND_REWARDED', referrerId: rel.referrerId });
      } catch (err: any) {
        failedCount++;
        details.push({ relationshipId: rel.id, action: 'FAILED', error: err.message });
      }
    }

    return {
      jobName: 'ReferralCoolingProcessor',
      scannedCount,
      successCount,
      skippedCount,
      failedCount,
      details,
    };
  }
}
