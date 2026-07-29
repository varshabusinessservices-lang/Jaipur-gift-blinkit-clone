import { PrismaClient, Prisma } from '@prisma/client';
import { RewardCalculationService } from './reward.calculation.service';
import { WalletService } from '../wallet/wallet.service';
import {
  RewardConfig,
  ClaimRewardResult,
  ReverseRewardResult,
} from './reward.types';

const prisma = new PrismaClient();

export class RewardService {
  /**
   * Get or initialize a customer's RewardAccount and synchronize cached balances.
   */
  static async getRewardAccount(customerId: string, txPrisma?: any) {
    const db = txPrisma || prisma;

    let account = await db.rewardAccount.findUnique({
      where: { customerId },
    });

    if (!account) {
      account = await db.rewardAccount.create({
        data: {
          customerId,
          totalEstimatedCoins: new Prisma.Decimal('0.00'),
          totalPendingCoins: new Prisma.Decimal('0.00'),
          totalClaimableCoins: new Prisma.Decimal('0.00'),
          totalConvertedCoins: new Prisma.Decimal('0.00'),
          totalExpiredCoins: new Prisma.Decimal('0.00'),
          totalReversedCoins: new Prisma.Decimal('0.00'),
        },
      });
    }

    // Synchronize cached totals from RewardTransaction
    const totals = await db.rewardTransaction.groupBy({
      by: ['status'],
      where: { customerId },
      _sum: {
        coinsEarned: true,
      },
    });

    let estimated = new Prisma.Decimal('0.00');
    let pending = new Prisma.Decimal('0.00');
    let claimable = new Prisma.Decimal('0.00');
    let converted = new Prisma.Decimal('0.00');
    let expired = new Prisma.Decimal('0.00');
    let reversed = new Prisma.Decimal('0.00');

    for (const group of totals) {
      const sum = new Prisma.Decimal(group._sum.coinsEarned?.toString() || '0.00');
      switch (group.status) {
        case 'ESTIMATED':
          estimated = estimated.plus(sum);
          break;
        case 'PENDING_PAYMENT':
        case 'PENDING_DELIVERY':
        case 'DELIVERY_CONFIRMED':
        case 'COOLING_PERIOD':
          pending = pending.plus(sum);
          break;
        case 'CLAIMABLE':
          claimable = claimable.plus(sum);
          break;
        case 'CONVERTED':
          converted = converted.plus(sum);
          break;
        case 'EXPIRED':
          expired = expired.plus(sum);
          break;
        case 'REVERSED':
        case 'CANCELLED':
          reversed = reversed.plus(sum);
          break;
      }
    }

    const updatedAccount = await db.rewardAccount.update({
      where: { id: account.id },
      data: {
        totalEstimatedCoins: estimated,
        totalPendingCoins: pending,
        totalClaimableCoins: claimable,
        totalConvertedCoins: converted,
        totalExpiredCoins: expired,
        totalReversedCoins: reversed,
      },
    });

    return updatedAccount;
  }

  /**
   * Handle Order Placed event: Creates ESTIMATED RewardTransaction.
   */
  static async handleOrderPlaced(orderId: string, txPrisma?: any) {
    const db = txPrisma || prisma;

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        OrderPaymentAllocation: true,
      },
    });

    if (!order) {
      throw new Error(`Order not found: ${orderId}`);
    }

    const config = await RewardCalculationService.getRewardConfig();
    if (!config.rewardsEnabled) {
      return null;
    }

    // Check if reward transaction already created
    const existing = await db.rewardTransaction.findFirst({
      where: { sourceOrderId: orderId },
    });
    if (existing) {
      return existing;
    }

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
          status: i.status,
        })),
        fees: {
          deliveryFee: (order as any).deliveryCharge || (order as any).deliveryFee || 0,
          expressFee: (order as any).expressFee || 0,
          platformFee: (order as any).platformFee || 0,
          codFee: (order as any).codCharge || (order as any).codFee || 0,
          packagingFee: (order as any).handlingCharge || (order as any).packagingFee || 0,
          giftWrapFee: (order as any).giftWrapFee || 0,
        },
        paymentSources: (order.OrderPaymentAllocation || []).map((pa: any) => ({
          sourceType: pa.sourceType,
          walletBucketType: pa.walletBucketType,
          amount: pa.amount,
        })),
      },
      config
    );

    if (simulation.coins.lte(0)) {
      return null;
    }

    const rewardAcc = await this.getRewardAccount(order.customerId, db);

    const rewardTx = await db.rewardTransaction.create({
      data: {
        customerId: order.customerId,
        rewardAccountId: rewardAcc.id,
        sourceOrderId: order.id,
        type: 'ORDER_EARNING',
        eligibleSpend: simulation.eligibleSpend,
        coinsEarned: simulation.coins,
        multiplier: simulation.multiplier,
        walletValue: simulation.walletValue,
        status: order.paymentStatus === 'PAID' ? 'PENDING_DELIVERY' : 'ESTIMATED',
        idempotencyKey: `reward-order-${order.id}`,
        metadataJson: JSON.stringify({
          excludedAmount: simulation.excludedAmount.toString(),
          reason: simulation.reason,
        }),
      },
    });

    // Create item allocations
    if (order.items && order.items.length > 0) {
      for (const item of order.items) {
        const itemEligible = simulation.eligibleSpend.gt(0)
          ? Prisma.Decimal.min(new Prisma.Decimal(item.totalPrice.toString()), simulation.eligibleSpend)
          : new Prisma.Decimal('0.00');
        const itemCoins = simulation.coins.gt(0)
          ? simulation.coins.mul(itemEligible).div(simulation.eligibleSpend)
          : new Prisma.Decimal('0.00');

        await db.rewardItemAllocation.create({
          data: {
            rewardTransactionId: rewardTx.id,
            orderId: order.id,
            orderItemId: item.id,
            productId: item.productId,
            categoryId: item.categoryId,
            quantity: item.quantity,
            grossItemAmount: new Prisma.Decimal(item.unitPrice.toString()).mul(item.quantity),
            discountAllocated: new Prisma.Decimal(item.discountAmount ? item.discountAmount.toString() : '0.00'),
            eligibleSpend: itemEligible,
            coins: itemCoins,
            walletValue: RewardCalculationService.calculateWalletValue(itemCoins, config),
            multiplier: simulation.multiplier,
            status: rewardTx.status,
          },
        }).catch(() => {});
      }
    }

    await this.getRewardAccount(order.customerId, db);
    return rewardTx;
  }

  /**
   * Handle Payment Success event: Moves ESTIMATED -> PENDING_DELIVERY.
   */
  static async handlePaymentSuccess(orderId: string, txPrisma?: any) {
    const db = txPrisma || prisma;

    const rewardTx = await db.rewardTransaction.findFirst({
      where: { sourceOrderId: orderId },
    });

    if (!rewardTx) {
      return await this.handleOrderPlaced(orderId, db);
    }

    if (rewardTx.status === 'ESTIMATED' || rewardTx.status === 'PENDING_PAYMENT') {
      const updated = await db.rewardTransaction.update({
        where: { id: rewardTx.id },
        data: { status: 'PENDING_DELIVERY' },
      });
      await this.getRewardAccount(rewardTx.customerId, db);
      return updated;
    }

    return rewardTx;
  }

  /**
   * Handle Order Delivered event: Moves to DELIVERY_CONFIRMED -> COOLING_PERIOD or CLAIMABLE.
   */
  static async handleOrderDelivered(orderId: string, deliveredAt?: Date, txPrisma?: any) {
    const db = txPrisma || prisma;
    const now = deliveredAt || new Date();

    let rewardTx = await db.rewardTransaction.findFirst({
      where: { sourceOrderId: orderId },
    });

    if (!rewardTx) {
      rewardTx = await this.handleOrderPlaced(orderId, db);
    }

    if (!rewardTx) return null;

    if (
      rewardTx.status === 'ESTIMATED' ||
      rewardTx.status === 'PENDING_PAYMENT' ||
      rewardTx.status === 'PENDING_DELIVERY'
    ) {
      const config = await RewardCalculationService.getRewardConfig();
      const coolingDays = config.rewardCoolingDays;
      const autoConvertDays = config.rewardAutoConvertDays;

      const coolingEndsAt = new Date(now.getTime() + coolingDays * 24 * 60 * 60 * 1000);
      const autoConvertAt = new Date(now.getTime() + (coolingDays + autoConvertDays) * 24 * 60 * 60 * 1000);

      const isImmediateClaimable = coolingDays === 0;

      const updated = await db.rewardTransaction.update({
        where: { id: rewardTx.id },
        data: {
          deliveredAt: now,
          coolingEndsAt,
          autoConvertAt,
          status: isImmediateClaimable ? 'CLAIMABLE' : 'COOLING_PERIOD',
          claimableAt: isImmediateClaimable ? now : coolingEndsAt,
        },
      });

      await this.getRewardAccount(rewardTx.customerId, db);

      // Auto convert if manual claim disabled and immediately claimable
      if (isImmediateClaimable && !config.manualClaimEnabled) {
        await this.claimReward({
          customerId: rewardTx.customerId,
          rewardTransactionId: updated.id,
          idempotencyKey: `auto-convert-${updated.id}`,
          conversionType: 'AUTO',
        });
      }

      return updated;
    }

    return rewardTx;
  }

  /**
   * Cron / Worker: Transition COOLING_PERIOD transactions whose cooling period has ended to CLAIMABLE.
   */
  static async processCoolingPeriods() {
    const now = new Date();
    const config = await RewardCalculationService.getRewardConfig();

    const pendingTxns = await prisma.rewardTransaction.findMany({
      where: {
        status: 'COOLING_PERIOD',
        coolingEndsAt: { lte: now },
      },
    });

    const transitioned = [];
    for (const tx of pendingTxns) {
      const updated = await prisma.rewardTransaction.update({
        where: { id: tx.id },
        data: {
          status: 'CLAIMABLE',
          claimableAt: now,
        },
      });

      await this.getRewardAccount(tx.customerId);
      transitioned.push(updated);

      if (!config.manualClaimEnabled) {
        try {
          await this.claimReward({
            customerId: tx.customerId,
            rewardTransactionId: tx.id,
            idempotencyKey: `auto-convert-${tx.id}`,
            conversionType: 'AUTO',
          });
        } catch (e) {
          // Log auto-conversion failure silently for batch resilience
        }
      }
    }

    return transitioned;
  }

  /**
   * Claim claimable reward and convert to WalletCreditLot (REWARD bucket).
   */
  static async claimReward(params: {
    customerId: string;
    rewardTransactionId: string;
    idempotencyKey?: string;
    conversionType?: 'MANUAL' | 'AUTO';
  }): Promise<ClaimRewardResult> {
    const { customerId, rewardTransactionId, idempotencyKey, conversionType = 'MANUAL' } = params;

    const rewardTx = await prisma.rewardTransaction.findFirst({
      where: {
        id: rewardTransactionId,
        customerId,
      },
      include: {
        conversions: true,
      },
    });

    if (!rewardTx) {
      throw new Error('Reward transaction not found or does not belong to customer');
    }

    if (rewardTx.isFraudHold) {
      throw new Error('Reward transaction is currently on fraud hold');
    }

    // Check if already converted
    if (rewardTx.status === 'CONVERTED' || rewardTx.conversions.length > 0) {
      const existingConv = rewardTx.conversions[0];
      return {
        success: true,
        rewardTransactionId,
        walletCreditLotId: existingConv?.walletCreditLotId || '',
        walletLedgerEntryId: existingConv?.walletLedgerEntryId || undefined,
        convertedCoins: rewardTx.coinsEarned,
        convertedValue: rewardTx.walletValue,
        alreadyClaimed: true,
      };
    }

    if (rewardTx.status !== 'CLAIMABLE') {
      throw new Error(`Reward transaction is not in CLAIMABLE status (Current: ${rewardTx.status})`);
    }

    if (rewardTx.expiresAt && rewardTx.expiresAt < new Date()) {
      await prisma.rewardTransaction.update({
        where: { id: rewardTx.id },
        data: { status: 'EXPIRED' },
      });
      await this.getRewardAccount(customerId);
      throw new Error('Reward transaction has expired');
    }

    const config = await RewardCalculationService.getRewardConfig();
    const expiryDate = new Date(Date.now() + config.rewardExpiryDays * 24 * 60 * 60 * 1000);

    const idempotency = idempotencyKey || `reward-claim-${rewardTx.id}`;

    // Credit to wallet (bucket: REWARD, sourceType: REWARD_CONVERSION)
    const creditResult = await WalletService.creditWallet({
      customerId,
      bucketType: 'REWARD',
      sourceType: 'REWARD_CONVERSION',
      sourceId: rewardTx.id,
      amount: rewardTx.walletValue,
      expiresAt: expiryDate,
      idempotencyKey: idempotency,
      narration: `Converted ${rewardTx.coinsEarned.toFixed(2)} reward coins to wallet`,
    });

    const now = new Date();

    // Record conversion and update status atomically
    const conversion = await prisma.rewardConversion.create({
      data: {
        customerId,
        rewardTransactionId: rewardTx.id,
        walletCreditLotId: creditResult.lot.id,
        walletLedgerEntryId: creditResult.entry?.id,
        convertedCoins: rewardTx.coinsEarned,
        convertedValue: rewardTx.walletValue,
        conversionType,
        idempotencyKey: idempotency,
      },
    });

    await prisma.rewardTransaction.update({
      where: { id: rewardTx.id },
      data: {
        status: 'CONVERTED',
        claimedAt: conversionType === 'MANUAL' ? now : rewardTx.claimedAt,
        convertedAt: now,
      },
    });

    await this.getRewardAccount(customerId);

    return {
      success: true,
      rewardTransactionId,
      walletCreditLotId: creditResult.lot.id,
      walletLedgerEntryId: creditResult.entry?.id,
      convertedCoins: rewardTx.coinsEarned,
      convertedValue: rewardTx.walletValue,
      alreadyClaimed: false,
    };
  }

  /**
   * Cron / Worker: Convert all due CLAIMABLE transactions automatically.
   */
  static async processAutoConversions() {
    const now = new Date();
    const config = await RewardCalculationService.getRewardConfig();

    const dueTransactions = await prisma.rewardTransaction.findMany({
      where: {
        status: 'CLAIMABLE',
        OR: [
          { autoConvertAt: { lte: now } },
          ...(config.manualClaimEnabled ? [] : [{ status: 'CLAIMABLE' }]),
        ],
      },
    });

    const convertedResults = [];
    for (const tx of dueTransactions) {
      try {
        const res = await this.claimReward({
          customerId: tx.customerId,
          rewardTransactionId: tx.id,
          idempotencyKey: `auto-convert-${tx.id}`,
          conversionType: 'AUTO',
        });
        convertedResults.push(res);
      } catch (e) {
        // Skip failed auto conversions for resilience
      }
    }

    return convertedResults;
  }

  /**
   * Reverse or adjust reward earnings on order refund or cancellation.
   */
  static async handleOrderRefundOrCancellation(params: {
    orderId: string;
    refundAmount?: number;
    cancelledItemIds?: string[];
  }): Promise<ReverseRewardResult | null> {
    const { orderId } = params;

    const rewardTx = await prisma.rewardTransaction.findFirst({
      where: { sourceOrderId: orderId },
      include: { conversions: true },
    });

    if (!rewardTx || rewardTx.status === 'CANCELLED' || rewardTx.status === 'REVERSED') {
      return null;
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, OrderPaymentAllocation: true },
    });

    if (!order) return null;

    const config = await RewardCalculationService.getRewardConfig();
    const newSimulation = await RewardCalculationService.simulateReward(
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
          status: i.status,
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
    const newCoins = newSimulation.coins;

    const coinsToReverse = oldCoins.sub(newCoins);
    if (coinsToReverse.lte(0)) {
      return null;
    }

    const valueToReverse = RewardCalculationService.calculateWalletValue(coinsToReverse, config);

    let clawbackValue = new Prisma.Decimal('0.00');
    let unrecoveredValue = new Prisma.Decimal('0.00');

    if (rewardTx.status === 'CONVERTED') {
      // If converted money exists in WalletCreditLot, recover it without mutating historical entries
      const conversion = rewardTx.conversions[0];
      if (conversion) {
        const creditLot = await prisma.walletCreditLot.findUnique({
          where: { id: conversion.walletCreditLotId },
        });

        if (creditLot) {
          const availableToClawback = Prisma.Decimal.min(creditLot.remainingAmount, valueToReverse);
          clawbackValue = availableToClawback;
          unrecoveredValue = valueToReverse.sub(clawbackValue);

          if (clawbackValue.gt(0)) {
            await prisma.walletCreditLot.update({
              where: { id: creditLot.id },
              data: {
                remainingAmount: creditLot.remainingAmount.sub(clawbackValue),
                reversedAmount: creditLot.reversedAmount.plus(clawbackValue),
              },
            });
          }
        }
      }

      await prisma.rewardTransaction.update({
        where: { id: rewardTx.id },
        data: {
          status: newCoins.gt(0) ? 'CONVERTED' : 'REVERSED',
          coinsEarned: newCoins,
          walletValue: rewardTx.walletValue.sub(valueToReverse),
        },
      });
    } else {
      // Unconverted reward transaction
      await prisma.rewardTransaction.update({
        where: { id: rewardTx.id },
        data: {
          status: newCoins.gt(0) ? rewardTx.status : 'REVERSED',
          coinsEarned: newCoins,
          walletValue: rewardTx.walletValue.sub(valueToReverse),
        },
      });
    }

    await this.getRewardAccount(rewardTx.customerId);

    return {
      success: true,
      rewardTransactionId: rewardTx.id,
      status: newCoins.gt(0) ? rewardTx.status : 'REVERSED',
      reversedCoins: coinsToReverse,
      reversedValue: valueToReverse,
      clawbackFromWalletAmount: clawbackValue,
      unrecoveredAmount: unrecoveredValue,
    };
  }

  /**
   * Returns complete customer rewards summary dashboard data.
   */
  static async getCustomerRewardsSummary(customerId: string) {
    const account = await this.getRewardAccount(customerId);
    const config = await RewardCalculationService.getRewardConfig();

    const claimableTxns = await prisma.rewardTransaction.findMany({
      where: {
        customerId,
        status: 'CLAIMABLE',
      },
      orderBy: { createdAt: 'desc' },
    });

    const pendingTxns = await prisma.rewardTransaction.findMany({
      where: {
        customerId,
        status: { in: ['ESTIMATED', 'PENDING_PAYMENT', 'PENDING_DELIVERY', 'DELIVERY_CONFIRMED', 'COOLING_PERIOD'] },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      account: {
        customerId: account.customerId,
        totalEstimatedCoins: account.totalEstimatedCoins,
        totalPendingCoins: account.totalPendingCoins,
        totalClaimableCoins: account.totalClaimableCoins,
        totalConvertedCoins: account.totalConvertedCoins,
        totalExpiredCoins: account.totalExpiredCoins,
        totalReversedCoins: account.totalReversedCoins,
        claimableWalletValue: RewardCalculationService.calculateWalletValue(account.totalClaimableCoins, config),
      },
      config: {
        rewardsEnabled: config.rewardsEnabled,
        coinsPerHundred: config.rewardCoinsPer100,
        walletValuePerCoin: config.rewardCoinValue,
        effectiveRatePct: config.rewardCoinsPer100.mul(config.rewardCoinValue).toFixed(2) + '%',
        manualClaimEnabled: config.manualClaimEnabled,
      },
      claimableTransactions: claimableTxns,
      pendingTransactions: pendingTxns,
    };
  }

  /**
   * Paginated reward transaction history for customer.
   */
  static async getCustomerRewardHistory(
    customerId: string,
    options: { page?: number; limit?: number; status?: string } = {}
  ) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const skip = (page - 1) * limit;

    const where: any = { customerId };
    if (options.status) {
      where.status = options.status;
    }

    const [total, items] = await Promise.all([
      prisma.rewardTransaction.count({ where }),
      prisma.rewardTransaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { conversions: true },
      }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Updates reward settings in WalletConfig singleton.
   */
  static async updateRewardConfig(newSettings: Partial<RewardConfig>, updatedBy?: string) {
    let walletConfig = await prisma.walletConfig.findFirst();

    const dataToUpdate: any = {};

    if (newSettings.rewardsEnabled !== undefined) dataToUpdate.rewardsEnabled = newSettings.rewardsEnabled;
    if (newSettings.manualClaimEnabled !== undefined) dataToUpdate.manualClaimEnabled = newSettings.manualClaimEnabled;
    if (newSettings.selfLoadedSpendEarnsRewards !== undefined)
      dataToUpdate.selfLoadedSpendEarnsRewards = newSettings.selfLoadedSpendEarnsRewards;
    if (newSettings.onlinePaymentEarnsRewards !== undefined)
      dataToUpdate.onlinePaymentEarnsRewards = newSettings.onlinePaymentEarnsRewards;
    if (newSettings.codEarnsRewards !== undefined) dataToUpdate.codEarnsRewards = newSettings.codEarnsRewards;
    if (newSettings.refundWalletEarnsRewards !== undefined)
      dataToUpdate.refundWalletEarnsRewards = newSettings.refundWalletEarnsRewards;
    if (newSettings.rewardCoinsPer100 !== undefined)
      dataToUpdate.rewardCoinsPer100 = new Prisma.Decimal(newSettings.rewardCoinsPer100.toString());
    if (newSettings.rewardCoinValue !== undefined)
      dataToUpdate.rewardCoinValue = new Prisma.Decimal(newSettings.rewardCoinValue.toString());
    if (newSettings.minimumEligibleSpend !== undefined)
      dataToUpdate.minimumEligibleSpend = new Prisma.Decimal(newSettings.minimumEligibleSpend.toString());
    if (newSettings.maxRewardPerOrder !== undefined)
      dataToUpdate.maxRewardPerOrder = newSettings.maxRewardPerOrder
        ? new Prisma.Decimal(newSettings.maxRewardPerOrder.toString())
        : null;
    if (newSettings.rewardCoolingDays !== undefined) dataToUpdate.rewardCoolingDays = newSettings.rewardCoolingDays;
    if (newSettings.rewardAutoConvertDays !== undefined)
      dataToUpdate.rewardAutoConvertDays = newSettings.rewardAutoConvertDays;
    if (newSettings.rewardExpiryDays !== undefined) dataToUpdate.rewardExpiryDays = newSettings.rewardExpiryDays;
    if (newSettings.campaignMultiplierEnabled !== undefined)
      dataToUpdate.campaignMultiplierEnabled = newSettings.campaignMultiplierEnabled;
    if (newSettings.campaignMultiplier !== undefined)
      dataToUpdate.campaignMultiplier = new Prisma.Decimal(newSettings.campaignMultiplier.toString());
    if (newSettings.excludedCategories !== undefined)
      dataToUpdate.excludedCategoriesJson = JSON.stringify(newSettings.excludedCategories);
    if (newSettings.excludedProducts !== undefined)
      dataToUpdate.excludedProductsJson = JSON.stringify(newSettings.excludedProducts);
    if (newSettings.excludedBrands !== undefined)
      dataToUpdate.excludedBrandsJson = JSON.stringify(newSettings.excludedBrands);

    if (updatedBy) dataToUpdate.updatedBy = updatedBy;

    if (!walletConfig) {
      walletConfig = await prisma.walletConfig.create({
        data: {
          id: 'singleton',
          ...dataToUpdate,
        },
      });
    } else {
      walletConfig = await prisma.walletConfig.update({
        where: { id: walletConfig.id },
        data: dataToUpdate,
      });
    }

    return await RewardCalculationService.getRewardConfig();
  }

  /**
   * Apply fraud hold to a reward transaction.
   */
  static async applyFraudHold(rewardTransactionId: string, reason?: string, txPrisma?: any) {
    const db = txPrisma || prisma;

    const rewardTx = await db.rewardTransaction.findUnique({
      where: { id: rewardTransactionId },
    });

    if (!rewardTx) {
      throw new Error(`Reward transaction ${rewardTransactionId} not found`);
    }

    if (rewardTx.isFraudHold) {
      return rewardTx;
    }

    const updated = await db.rewardTransaction.update({
      where: { id: rewardTx.id },
      data: {
        isFraudHold: true,
        fraudHoldReason: reason || 'SUSPICIOUS_ACTIVITY',
        fraudHoldAt: new Date(),
        previousStatus: rewardTx.status,
      },
    });

    return updated;
  }

  /**
   * Release fraud hold from a reward transaction.
   */
  static async releaseFraudHold(rewardTransactionId: string, txPrisma?: any) {
    const db = txPrisma || prisma;

    const rewardTx = await db.rewardTransaction.findUnique({
      where: { id: rewardTransactionId },
    });

    if (!rewardTx || !rewardTx.isFraudHold) {
      return rewardTx;
    }

    const restoredStatus = rewardTx.previousStatus || rewardTx.status;

    const updated = await db.rewardTransaction.update({
      where: { id: rewardTx.id },
      data: {
        isFraudHold: false,
        status: restoredStatus,
      },
    });

    return updated;
  }
}
