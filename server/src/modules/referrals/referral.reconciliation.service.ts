import { Prisma } from '@prisma/client';
import { prisma } from '../../database/prisma';
import { JobProcessorOptions, JobProcessorResult } from './referral.types';

export class ReferralReconciliationService {
  static async runReconciliation(options: JobProcessorOptions = {}): Promise<JobProcessorResult & { runId?: string }> {
    const dryRun = options.dryRun ?? false;

    let relationshipsScanned = 0;
    let creditsScanned = 0;
    let lotsScanned = 0;
    let matchedCount = 0;
    let mismatchedCount = 0;
    let repairedCount = 0;
    let escalatedCount = 0;
    const details: any[] = [];

    let run: any = null;
    if (!dryRun) {
      run = await prisma.referralReconciliationRun.create({
        data: {
          runType: 'AUTOMATED_DAILY',
          status: 'IN_PROGRESS',
        },
      });
    }

    // 1. Audit ReferralRelationships
    const relationships = await prisma.referralRelationship.findMany({
      take: options.batchSize || 500,
    });

    relationshipsScanned = relationships.length;

    for (const rel of relationships) {
      // Check if MOBILE_VERIFIED or later state has NEW_USER credit
      if (['MOBILE_VERIFIED', 'NEW_USER_CREDIT_ISSUED', 'FIRST_ORDER_PLACED', 'FIRST_ORDER_PAID', 'FIRST_ORDER_DELIVERED', 'COOLING_PERIOD', 'QUALIFIED', 'REWARDED'].includes(rel.status)) {
        const newUserCredit = await prisma.referralCredit.findFirst({
          where: { referralRelationId: rel.id, creditType: 'NEW_USER' },
        });

        if (!newUserCredit) {
          mismatchedCount++;
          details.push({ relationshipId: rel.id, issueType: 'MISSING_NEW_USER_CREDIT' });

          if (!dryRun && run) {
            await prisma.referralReconciliationIssue.create({
              data: {
                reconciliationRunId: run.id,
                referralRelationshipId: rel.id,
                customerId: rel.newCustomerId,
                issueType: 'MISSING_NEW_USER_CREDIT',
                expectedAmount: rel.newUserRewardValue || new Prisma.Decimal('100.00'),
                actualAmount: new Prisma.Decimal('0.00'),
                status: 'OPEN',
              },
            });
            escalatedCount++;
          }
        } else {
          matchedCount++;
        }
      }

      // Check if REWARDED state has REFERRER credit
      if (rel.status === 'REWARDED') {
        const referrerCredit = await prisma.referralCredit.findFirst({
          where: { referralRelationId: rel.id, creditType: 'REFERRER' },
        });

        if (!referrerCredit) {
          mismatchedCount++;
          details.push({ relationshipId: rel.id, issueType: 'MISSING_REFERRER_CREDIT' });

          if (!dryRun && run) {
            await prisma.referralReconciliationIssue.create({
              data: {
                reconciliationRunId: run.id,
                referralRelationshipId: rel.id,
                customerId: rel.referrerId,
                issueType: 'MISSING_REFERRER_CREDIT',
                expectedAmount: rel.referrerRewardValue || new Prisma.Decimal('50.00'),
                actualAmount: new Prisma.Decimal('0.00'),
                status: 'OPEN',
              },
            });
            escalatedCount++;
          }
        } else {
          matchedCount++;
        }
      }
    }

    // 2. Audit ReferralCredits
    const credits = await prisma.referralCredit.findMany({
      take: options.batchSize || 500,
    });

    creditsScanned = credits.length;

    for (const credit of credits) {
      if (credit.walletCreditLotId) {
        const lot = await prisma.walletCreditLot.findUnique({
          where: { id: credit.walletCreditLotId },
        });

        if (!lot) {
          mismatchedCount++;
          details.push({ creditId: credit.id, issueType: 'MISSING_WALLET_LOT' });

          if (!dryRun && run) {
            await prisma.referralReconciliationIssue.create({
              data: {
                reconciliationRunId: run.id,
                referralRelationshipId: credit.referralRelationId,
                customerId: credit.customerId,
                issueType: 'MISSING_WALLET_LOT',
                expectedAmount: credit.amount,
                actualAmount: new Prisma.Decimal('0.00'),
                status: 'OPEN',
              },
            });
            escalatedCount++;
          }
        } else {
          matchedCount++;
        }
      }
    }

    if (!dryRun && run) {
      await prisma.referralReconciliationRun.update({
        where: { id: run.id },
        data: {
          status: mismatchedCount > 0 ? 'COMPLETED_WITH_DISCREPANCIES' : 'COMPLETED',
          completedAt: new Date(),
          relationshipsScanned,
          creditsScanned,
          lotsScanned,
          matchedCount,
          mismatchedCount,
          repairedCount,
          escalatedCount,
          summaryJson: JSON.stringify({ mismatchedCount, escalatedCount, matchedCount }),
        },
      });
    }

    return {
      jobName: 'ReferralReconciliationProcessor',
      runId: run ? run.id : undefined,
      scannedCount: relationshipsScanned + creditsScanned,
      successCount: matchedCount,
      skippedCount: 0,
      failedCount: mismatchedCount,
      details,
    };
  }
}
