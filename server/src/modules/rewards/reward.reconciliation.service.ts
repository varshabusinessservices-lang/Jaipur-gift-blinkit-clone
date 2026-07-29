import { PrismaClient, Prisma } from '@prisma/client';
import { RewardAccountRebuildService } from './reward.account.rebuild.service';
import { ScheduledJobService } from '../jobs/scheduled.job.service';

const prisma = new PrismaClient();

export class RewardReconciliationService {
  /**
   * Run full reward ecosystem reconciliation.
   */
  static async reconcileDateRange(options: {
    runType?: string;
    dateFrom?: Date;
    dateTo?: Date;
    initiatedBy?: string;
  } = {}) {
    return await ScheduledJobService.executeJob(
      {
        jobName: 'rewards:reconcile',
        lockKey: 'lock:rewards:reconcile',
        triggeredBy: options.initiatedBy || 'SCHEDULED',
        metadata: options,
      },
      async (jobRunId) => {
        const run = await prisma.rewardReconciliationRun.create({
          data: {
            runType: options.runType || 'DAILY',
            status: 'RUNNING',
            dateFrom: options.dateFrom,
            dateTo: options.dateTo,
            initiatedBy: options.initiatedBy || 'SYSTEM',
          },
        });

        let scannedRewards = 0;
        let scannedConversions = 0;
        let matchedRecords = 0;
        let mismatchedRecords = 0;
        let recoveredRecords = 0;
        let failedRecords = 0;

        const dateFilter: any = {};
        if (options.dateFrom) dateFilter.gte = options.dateFrom;
        if (options.dateTo) dateFilter.lte = options.dateTo;

        const whereTx: any = {};
        if (Object.keys(dateFilter).length > 0) {
          whereTx.createdAt = dateFilter;
        }

        // 1. Scan Reward Transactions
        const rewardTxs = await prisma.rewardTransaction.findMany({
          where: whereTx,
          include: {
            conversions: true,
          },
        });

        scannedRewards = rewardTxs.length;

        for (const rewardTx of rewardTxs) {
          let hasIssue = false;

          // Check CONVERTED status consistency
          if (rewardTx.status === 'CONVERTED') {
            scannedConversions += rewardTx.conversions.length;

            if (rewardTx.conversions.length === 0) {
              hasIssue = true;
              mismatchedRecords++;
              await prisma.rewardReconciliationIssue.create({
                data: {
                  reconciliationRunId: run.id,
                  customerId: rewardTx.customerId,
                  rewardTransactionId: rewardTx.id,
                  issueType: 'MISSING_REWARD_CONVERSION',
                  expectedAmount: rewardTx.walletValue,
                  actualAmount: new Prisma.Decimal('0.00'),
                  differenceAmount: rewardTx.walletValue,
                  status: 'OPEN',
                },
              });

              await prisma.rewardRecoveryCase.create({
                data: {
                  customerId: rewardTx.customerId,
                  rewardTransactionId: rewardTx.id,
                  recoveryType: 'ORPHAN_CONVERSION',
                  status: 'OPEN',
                  originalRewardAmount: rewardTx.walletValue,
                  outstandingAmount: rewardTx.walletValue,
                  reasonCode: 'CONVERTED_STATUS_WITHOUT_CONVERSION_RECORD',
                },
              });
            } else if (rewardTx.conversions.length > 1) {
              hasIssue = true;
              mismatchedRecords++;
              await prisma.rewardReconciliationIssue.create({
                data: {
                  reconciliationRunId: run.id,
                  customerId: rewardTx.customerId,
                  rewardTransactionId: rewardTx.id,
                  issueType: 'DUPLICATE_REWARD_CONVERSION',
                  expectedAmount: rewardTx.walletValue,
                  actualAmount: rewardTx.conversions.reduce((acc, c) => acc.plus(c.convertedValue), new Prisma.Decimal('0.00')),
                  differenceAmount: rewardTx.conversions.reduce((acc, c) => acc.plus(c.convertedValue), new Prisma.Decimal('0.00')).sub(rewardTx.walletValue),
                  status: 'OPEN',
                },
              });
            }
          }

          // Check converted conversions linked credit lot & ledger
          for (const conversion of rewardTx.conversions) {
            const creditLot = await prisma.walletCreditLot.findUnique({
              where: { id: conversion.walletCreditLotId },
            });

            if (!creditLot) {
              hasIssue = true;
              mismatchedRecords++;
              await prisma.rewardReconciliationIssue.create({
                data: {
                  reconciliationRunId: run.id,
                  customerId: rewardTx.customerId,
                  rewardTransactionId: rewardTx.id,
                  rewardConversionId: conversion.id,
                  issueType: 'MISSING_WALLET_CREDIT_LOT',
                  expectedAmount: conversion.convertedValue,
                  actualAmount: new Prisma.Decimal('0.00'),
                  differenceAmount: conversion.convertedValue,
                  status: 'OPEN',
                },
              });
            }
          }

          if (!hasIssue) {
            matchedRecords++;
          }
        }

        // 2. Scan Reward Accounts for aggregate mismatches
        const rewardAccounts = await prisma.rewardAccount.findMany();
        let customerScannedCount = rewardAccounts.length;

        for (const account of rewardAccounts) {
          const check = await RewardAccountRebuildService.reportMismatch(account.customerId);
          if (check.mismatch && check.expected) {
            mismatchedRecords++;
            await prisma.rewardReconciliationIssue.create({
              data: {
                reconciliationRunId: run.id,
                customerId: account.customerId,
                issueType: 'REWARD_ACCOUNT_MISMATCH',
                expectedAmount: check.expected.totalClaimableCoins,
                actualAmount: account.totalClaimableCoins,
                differenceAmount: check.expected.totalClaimableCoins.sub(account.totalClaimableCoins),
                status: 'OPEN',
              },
            });

            // Auto repair aggregate mismatch safely
            try {
              await RewardAccountRebuildService.rebuildCustomerRewardAccount(account.customerId);
              recoveredRecords++;
            } catch {
              failedRecords++;
            }
          } else {
            matchedRecords++;
          }
        }

        const finalStatus = mismatchedRecords > 0 ? (failedRecords > 0 ? 'COMPLETED_WITH_ERRORS' : 'COMPLETED') : 'COMPLETED';

        await prisma.rewardReconciliationRun.update({
          where: { id: run.id },
          data: {
            status: finalStatus,
            completedAt: new Date(),
            customersScanned: customerScannedCount,
            rewardsScanned: scannedRewards,
            conversionsScanned: scannedConversions,
            matchedRecords,
            mismatchedRecords,
            recoveredRecords,
            failedRecords,
          },
        });

        return {
          scannedCount: scannedRewards + customerScannedCount,
          successCount: matchedRecords + recoveredRecords,
          skippedCount: 0,
          failedCount: mismatchedRecords - recoveredRecords,
          data: {
            reconciliationRunId: run.id,
            scannedRewards,
            scannedConversions,
            mismatchedRecords,
            recoveredRecords,
          },
        };
      }
    );
  }
}
