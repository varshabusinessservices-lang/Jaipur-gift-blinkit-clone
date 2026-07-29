import { PrismaClient, Prisma } from '@prisma/client';
import { RewardCalculationService } from './reward.calculation.service';
import { RewardService } from './reward.service';
import { ReverseRewardResult } from './reward.types';

const prisma = new PrismaClient();

export class RewardReversalService {
  /**
   * Calculates the exact reward reversal amount for an order based on item allocations or partial refund amount.
   */
  static async calculateRewardReversal(params: {
    orderId: string;
    refundAmount?: number | Prisma.Decimal;
    cancelledItemIds?: string[];
    txPrisma?: any;
  }) {
    const db = params.txPrisma || prisma;

    const rewardTx = await db.rewardTransaction.findFirst({
      where: { sourceOrderId: params.orderId },
      include: {
        conversions: true,
        itemAllocations: true,
      },
    });

    if (!rewardTx || rewardTx.status === 'CANCELLED' || rewardTx.status === 'REVERSED') {
      return null;
    }

    const order = await db.order.findUnique({
      where: { id: params.orderId },
      include: {
        items: true,
        OrderPaymentAllocation: true,
      },
    });

    if (!order) return null;

    const config = await RewardCalculationService.getRewardConfig();

    const simulation = await RewardCalculationService.simulateReward(
      {
        orderId: order.id,
        totalOrderAmount: order.payableAmount,
        items: (order.items || []).map((i: any) => ({
          id: i.id,
          productId: i.productId,
          categoryId: i.categoryId,
          unitPrice: i.unitPrice,
          quantity: i.quantity,
          discountAmount: i.discountAmount,
          totalPrice: i.totalPrice,
          status: params.cancelledItemIds?.includes(i.id) ? 'CANCELLED' : i.status,
          refundedAmount: i.refundedAmount,
        })),
        fees: {
          deliveryFee: (order as any).deliveryCharge || (order as any).deliveryFee || 0,
        },
        paymentSources: (order.OrderPaymentAllocation || []).map((pa: any) => ({
          sourceType: pa.sourceType,
          walletBucketType: pa.walletBucketType,
          amount: pa.amount,
        })),
      },
      config
    );

    const oldCoins = rewardTx.coinsEarned;
    const newCoins = simulation.coins;

    const coinsToReverse = oldCoins.gt(newCoins) ? oldCoins.sub(newCoins) : new Prisma.Decimal('0.00');
    const valueToReverse = RewardCalculationService.calculateWalletValue(coinsToReverse, config);

    return {
      rewardTx,
      order,
      oldCoins,
      newCoins,
      coinsToReverse,
      valueToReverse,
      simulation,
    };
  }

  /**
   * Handle full refund or cancellation reversal.
   */
  static async handleFullRefund(orderId: string, reason: string = 'FULL_REFUND', txPrisma?: any): Promise<ReverseRewardResult | null> {
    const db = txPrisma || prisma;

    const rewardTx = await db.rewardTransaction.findFirst({
      where: { sourceOrderId: orderId },
      include: { conversions: true },
    });

    if (!rewardTx || rewardTx.status === 'CANCELLED' || rewardTx.status === 'REVERSED') {
      return null;
    }

    const coinsToReverse = rewardTx.coinsEarned;
    const valueToReverse = rewardTx.walletValue;

    let clawbackValue = new Prisma.Decimal('0.00');
    let unrecoveredValue = new Prisma.Decimal('0.00');

    if (rewardTx.status === 'CONVERTED') {
      const conversion = rewardTx.conversions[0];
      if (conversion) {
        const creditLot = await db.walletCreditLot.findUnique({
          where: { id: conversion.walletCreditLotId },
        });

        if (creditLot) {
          clawbackValue = Prisma.Decimal.min(creditLot.remainingAmount, valueToReverse);
          unrecoveredValue = valueToReverse.sub(clawbackValue);

          if (clawbackValue.gt(0)) {
            await db.walletCreditLot.update({
              where: { id: creditLot.id },
              data: {
                remainingAmount: creditLot.remainingAmount.sub(clawbackValue),
                reversedAmount: creditLot.reversedAmount.plus(clawbackValue),
                status: creditLot.remainingAmount.sub(clawbackValue).lte(0) ? 'EXHAUSTED' : creditLot.status,
              },
            });

            // Create ledger reversal entry
            const walletAccount = await db.walletAccount.findFirst({
              where: { customerId: rewardTx.customerId },
            });

            if (walletAccount) {
              const previousBalance = walletAccount.cachedBalance;
              const newBalance = previousBalance.sub(clawbackValue);

              const ledgerEntry = await db.walletLedgerEntry.create({
                data: {
                  walletAccountId: walletAccount.id,
                  customerId: rewardTx.customerId,
                  entryType: 'REVERSAL',
                  direction: 'DEBIT',
                  bucketType: 'REWARD',
                  amount: clawbackValue,
                  balanceBefore: previousBalance,
                  balanceAfter: newBalance,
                  sourceType: 'REWARD_REVERSAL',
                  sourceId: rewardTx.id,
                  idempotencyKey: `reward-reversal-ledger-${rewardTx.id}-${Date.now()}`,
                  narration: `Reward clawback for order refund/cancellation (${reason})`,
                },
              });

              await db.walletAccount.update({
                where: { id: walletAccount.id },
                data: { cachedBalance: newBalance },
              });
            }
          }

          if (unrecoveredValue.gt(0)) {
            await db.rewardRecoveryCase.create({
              data: {
                customerId: rewardTx.customerId,
                rewardTransactionId: rewardTx.id,
                rewardConversionId: conversion.id,
                walletCreditLotId: creditLot.id,
                orderId: rewardTx.sourceOrderId,
                recoveryType: 'REWARD_ALREADY_SPENT',
                status: 'OPEN',
                originalRewardAmount: valueToReverse,
                recoverableAmount: clawbackValue,
                recoveredAmount: clawbackValue,
                outstandingAmount: unrecoveredValue,
                reasonCode: reason,
              },
            });
          }
        }
      }
    }

    const updatedRewardTx = await db.rewardTransaction.update({
      where: { id: rewardTx.id },
      data: {
        status: 'REVERSED',
        coinsEarned: new Prisma.Decimal('0.00'),
        walletValue: new Prisma.Decimal('0.00'),
        metadataJson: JSON.stringify({
          reversedAt: new Date(),
          reason,
          reversedCoins: coinsToReverse.toString(),
          reversedValue: valueToReverse.toString(),
          clawbackFromWalletAmount: clawbackValue.toString(),
          unrecoveredAmount: unrecoveredValue.toString(),
        }),
      },
    });

    await db.rewardItemAllocation.updateMany({
      where: { rewardTransactionId: rewardTx.id },
      data: { status: 'REVERSED' },
    });

    await RewardService.getRewardAccount(rewardTx.customerId, db);

    return {
      success: true,
      rewardTransactionId: rewardTx.id,
      status: 'REVERSED',
      reversedCoins: coinsToReverse,
      reversedValue: valueToReverse,
      clawbackFromWalletAmount: clawbackValue,
      unrecoveredAmount: unrecoveredValue,
    };
  }

  /**
   * Handle partial refund reward adjustment.
   */
  static async handlePartialRefund(params: {
    orderId: string;
    refundId?: string;
    refundAmount?: number | Prisma.Decimal;
    refundReason?: string;
    txPrisma?: any;
  }): Promise<ReverseRewardResult | null> {
    const db = params.txPrisma || prisma;

    const calc = await this.calculateRewardReversal({
      orderId: params.orderId,
      refundAmount: params.refundAmount,
      txPrisma: db,
    });

    if (!calc || calc.coinsToReverse.lte(0)) {
      return null;
    }

    const { rewardTx, newCoins, coinsToReverse, valueToReverse } = calc;

    let clawbackValue = new Prisma.Decimal('0.00');
    let unrecoveredValue = new Prisma.Decimal('0.00');

    if (rewardTx.status === 'CONVERTED') {
      const conversion = rewardTx.conversions[0];
      if (conversion) {
        const creditLot = await db.walletCreditLot.findUnique({
          where: { id: conversion.walletCreditLotId },
        });

        if (creditLot) {
          clawbackValue = Prisma.Decimal.min(creditLot.remainingAmount, valueToReverse);
          unrecoveredValue = valueToReverse.sub(clawbackValue);

          if (clawbackValue.gt(0)) {
            await db.walletCreditLot.update({
              where: { id: creditLot.id },
              data: {
                remainingAmount: creditLot.remainingAmount.sub(clawbackValue),
                reversedAmount: creditLot.reversedAmount.plus(clawbackValue),
              },
            });

            const walletAccount = await db.walletAccount.findFirst({
              where: { customerId: rewardTx.customerId },
            });

            if (walletAccount) {
              const previousBalance = walletAccount.cachedBalance;
              const newBalance = previousBalance.sub(clawbackValue);

              await db.walletLedgerEntry.create({
                data: {
                  walletAccountId: walletAccount.id,
                  customerId: rewardTx.customerId,
                  entryType: 'REVERSAL',
                  direction: 'DEBIT',
                  bucketType: 'REWARD',
                  amount: clawbackValue,
                  balanceBefore: previousBalance,
                  balanceAfter: newBalance,
                  sourceType: 'REWARD_REVERSAL',
                  sourceId: rewardTx.id,
                  idempotencyKey: `partial-reward-reversal-ledger-${rewardTx.id}-${Date.now()}`,
                  narration: `Partial reward clawback for order adjustment (${params.refundReason || 'PARTIAL_REFUND'})`,
                },
              });

              await db.walletAccount.update({
                where: { id: walletAccount.id },
                data: { cachedBalance: newBalance },
              });
            }
          }

          if (unrecoveredValue.gt(0)) {
            await db.rewardRecoveryCase.create({
              data: {
                customerId: rewardTx.customerId,
                rewardTransactionId: rewardTx.id,
                rewardConversionId: conversion.id,
                walletCreditLotId: creditLot.id,
                orderId: rewardTx.sourceOrderId,
                refundId: params.refundId,
                recoveryType: 'PARTIAL_REVERSAL',
                status: 'OPEN',
                originalRewardAmount: valueToReverse,
                recoverableAmount: clawbackValue,
                recoveredAmount: clawbackValue,
                outstandingAmount: unrecoveredValue,
                reasonCode: params.refundReason || 'PARTIAL_REFUND_SPENT',
              },
            });
          }
        }
      }
    }

    const newStatus = newCoins.gt(0) ? rewardTx.status : 'REVERSED';

    await db.rewardTransaction.update({
      where: { id: rewardTx.id },
      data: {
        status: newStatus,
        coinsEarned: newCoins,
        walletValue: rewardTx.walletValue.sub(valueToReverse),
      },
    });

    await RewardService.getRewardAccount(rewardTx.customerId, db);

    return {
      success: true,
      rewardTransactionId: rewardTx.id,
      status: newStatus,
      reversedCoins: coinsToReverse,
      reversedValue: valueToReverse,
      clawbackFromWalletAmount: clawbackValue,
      unrecoveredAmount: unrecoveredValue,
    };
  }

  /**
   * Get reward recovery status for customer or admin review.
   */
  static async getRewardRecoveryStatus(customerId: string) {
    const cases = await prisma.rewardRecoveryCase.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
    });

    return cases;
  }
}
