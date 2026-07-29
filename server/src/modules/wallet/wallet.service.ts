import { Prisma } from '@prisma/client';
import { prisma } from '../../database/prisma';
import { FinancialInvariantService } from './financial.invariant.service';
import { WalletSlabService } from './wallet.slab.service';
import { env } from '../../config/env';

export interface CheckoutAllocationInput {
  customerId: string;
  subtotal: number | Prisma.Decimal;
  discount?: number | Prisma.Decimal;
  coupon?: number | Prisma.Decimal;
  excludedAmount?: number | Prisma.Decimal;
  isFirstOrder?: boolean;
  walletToggle?: boolean;
  usePromotional?: boolean;
  useSelfLoaded?: boolean;
}

export interface CreateReservationParams {
  customerId: string;
  checkoutSessionId: string;
  subtotal: number | Prisma.Decimal;
  discount?: number | Prisma.Decimal;
  coupon?: number | Prisma.Decimal;
  excludedAmount?: number | Prisma.Decimal;
  isFirstOrder?: boolean;
  requestedAmount?: number | Prisma.Decimal;
  usePromotional?: boolean;
  useSelfLoaded?: boolean;
}

export interface CreditWalletParams {
  customerId: string;
  amount: number | Prisma.Decimal;
  bucketType: 'SELF_LOADED' | 'REWARD' | 'REFERRAL_REFERRER' | 'REFERRAL_NEW_USER' | 'REFUND' | 'PROMOTIONAL';
  sourceType: string;
  sourceId?: string;
  expiresAt?: Date | null;
  firstOrderOnly?: boolean;
  narration?: string;
  idempotencyKey?: string;
}

export interface DebitWalletParams {
  customerId: string;
  amount: number | Prisma.Decimal;
  reason: string;
  referenceType: string;
  referenceId?: string;
  idempotencyKey?: string;
}

export interface RestoreWalletParams {
  customerId: string;
  amount: number | Prisma.Decimal;
  orderId?: string;
  reason: string;
  idempotencyKey?: string;
}

export interface CreateAdjustmentParams {
  walletAccountId: string;
  adminId?: string;
  amount: number | Prisma.Decimal;
  adjustmentType: 'CREDIT' | 'DEBIT' | 'EXTEND_EXPIRY' | 'HOLD' | 'RELEASE';
  bucketType?: 'SELF_LOADED' | 'REWARD' | 'REFERRAL_REFERRER' | 'REFERRAL_NEW_USER' | 'REFUND' | 'PROMOTIONAL';
  reasonCategory: 'GOODWILL' | 'FRAUD_REVERSAL' | 'MANUAL_CORRECTION';
  note: string;
  autoApprove?: boolean;
}

export class WalletService {
  private static readonly BUCKET_PRIORITY_MAP: Record<string, number> = {
    REFERRAL_NEW_USER: 1,
    REWARD: 2,
    REFERRAL_REFERRER: 3,
    PROMOTIONAL: 4,
    REFUND: 5,
    SELF_LOADED: 6,
  };

  /**
   * Get or create a WalletAccount for a customer
   */
  static async getWalletAccount(customerId: string) {
    let account = await prisma.walletAccount.findUnique({
      where: { customerId },
    });
    if (!account) {
      account = await prisma.walletAccount.create({
        data: {
          customerId,
          status: 'ACTIVE',
          cachedTotalBalance: new Prisma.Decimal('0.00'),
          cachedAvailableBalance: new Prisma.Decimal('0.00'),
          cachedHeldBalance: new Prisma.Decimal('0.00'),
        },
      });
    }
    return account;
  }

  /**
   * Recalculate and update cached balances on a WalletAccount
   */
  static async updateCachedBalances(walletAccountId: string, tx: Prisma.TransactionClient = prisma) {
    const activeLots = await tx.walletCreditLot.findMany({
      where: {
        walletAccountId,
        status: 'ACTIVE',
      },
    });

    let totalAvailable = new Prisma.Decimal('0.00');
    let totalReserved = new Prisma.Decimal('0.00');
    const now = new Date();

    for (const lot of activeLots) {
      if (!lot.expiresAt || lot.expiresAt > now) {
        totalAvailable = totalAvailable.plus(lot.remainingAmount);
        totalReserved = totalReserved.plus(lot.reservedAmount);
      }
    }

    const totalBalance = totalAvailable.plus(totalReserved);

    return await tx.walletAccount.update({
      where: { id: walletAccountId },
      data: {
        cachedTotalBalance: totalBalance,
        cachedAvailableBalance: totalAvailable,
        cachedHeldBalance: totalReserved,
        lastReconciledAt: new Date(),
        version: { increment: 1 },
      },
    });
  }

  /**
   * Sort credit lots according to FEFO Engine rules
   */
  static sortLotsFEFO<T extends { expiresAt: Date | null; bucketType: string; creditedAt: Date; id: string }>(
    lots: T[]
  ): T[] {
    return [...lots].sort((a, b) => {
      // 1. Earliest expiresAt (lots with expiry date come before non-expiring lots)
      if (a.expiresAt && b.expiresAt) {
        const diff = a.expiresAt.getTime() - b.expiresAt.getTime();
        if (diff !== 0) return diff;
      } else if (a.expiresAt && !b.expiresAt) {
        return -1;
      } else if (!a.expiresAt && b.expiresAt) {
        return 1;
      }

      // 2. Priority rank (1 to 6)
      const rankA = WalletService.BUCKET_PRIORITY_MAP[a.bucketType] ?? 99;
      const rankB = WalletService.BUCKET_PRIORITY_MAP[b.bucketType] ?? 99;
      if (rankA !== rankB) return rankA - rankB;

      // 3. Oldest creditedAt
      const timeA = new Date(a.creditedAt).getTime();
      const timeB = new Date(b.creditedAt).getTime();
      if (timeA !== timeB) return timeA - timeB;

      // 4. Lowest UUID string
      return a.id.localeCompare(b.id);
    });
  }

  /**
   * Get total spendable balance (unreserved, unexpired active lots)
   */
  static async getSpendableBalance(customerId: string): Promise<number> {
    const account = await this.getWalletAccount(customerId);
    const now = new Date();

    const activeLots = await prisma.walletCreditLot.findMany({
      where: {
        walletAccountId: account.id,
        status: 'ACTIVE',
        remainingAmount: { gt: 0 },
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
    });

    const total = activeLots.reduce(
      (sum, lot) => sum.plus(new Prisma.Decimal(lot.remainingAmount.toString())),
      new Prisma.Decimal('0.00')
    );

    return total.toNumber();
  }

  /**
   * Get balance breakdown by bucket
   */
  static async getBucketBalances(customerId: string) {
    const account = await this.getWalletAccount(customerId);
    const now = new Date();

    const activeLots = await prisma.walletCreditLot.findMany({
      where: {
        walletAccountId: account.id,
        status: 'ACTIVE',
        remainingAmount: { gt: 0 },
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
    });

    const balances = {
      selfLoaded: new Prisma.Decimal('0.00'),
      reward: new Prisma.Decimal('0.00'),
      referralReferrer: new Prisma.Decimal('0.00'),
      referralNewUser: new Prisma.Decimal('0.00'),
      promotional: new Prisma.Decimal('0.00'),
      refund: new Prisma.Decimal('0.00'),
      total: new Prisma.Decimal('0.00'),
    };

    for (const lot of activeLots) {
      const amt = new Prisma.Decimal(lot.remainingAmount.toString());
      balances.total = balances.total.plus(amt);

      switch (lot.bucketType) {
        case 'SELF_LOADED':
          balances.selfLoaded = balances.selfLoaded.plus(amt);
          break;
        case 'REWARD':
          balances.reward = balances.reward.plus(amt);
          break;
        case 'REFERRAL_REFERRER':
          balances.referralReferrer = balances.referralReferrer.plus(amt);
          break;
        case 'REFERRAL_NEW_USER':
          balances.referralNewUser = balances.referralNewUser.plus(amt);
          break;
        case 'PROMOTIONAL':
          balances.promotional = balances.promotional.plus(amt);
          break;
        case 'REFUND':
          balances.refund = balances.refund.plus(amt);
          break;
        default:
          break;
      }
    }

    return {
      selfLoaded: balances.selfLoaded.toNumber(),
      reward: balances.reward.toNumber(),
      referralReferrer: balances.referralReferrer.toNumber(),
      referralNewUser: balances.referralNewUser.toNumber(),
      promotional: balances.promotional.toNumber(),
      refund: balances.refund.toNumber(),
      total: balances.total.toNumber(),
    };
  }

  /**
   * Get balance expiring within specified days
   */
  static async getExpiringBalance(customerId: string, days: number = 15): Promise<number> {
    const account = await this.getWalletAccount(customerId);
    const now = new Date();
    const futureLimit = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const expiringLots = await prisma.walletCreditLot.findMany({
      where: {
        walletAccountId: account.id,
        status: 'ACTIVE',
        remainingAmount: { gt: 0 },
        expiresAt: {
          gt: now,
          lte: futureLimit,
        },
      },
    });

    const total = expiringLots.reduce(
      (sum, lot) => sum.plus(new Prisma.Decimal(lot.remainingAmount.toString())),
      new Prisma.Decimal('0.00')
    );

    return total.toNumber();
  }

  /**
   * Get full wallet summary
   */
  static async getWalletSummary(customerId: string) {
    const account = await this.getWalletAccount(customerId);
    const buckets = await this.getBucketBalances(customerId);
    const expiringSoon = await this.getExpiringBalance(customerId, 15);

    return {
      accountId: account.id,
      status: account.status,
      currency: account.currency,
      totalBalance: buckets.total,
      spendableBalance: buckets.total,
      selfLoaded: buckets.selfLoaded,
      reward: buckets.reward,
      referral: buckets.referralReferrer + buckets.referralNewUser,
      referralReferrer: buckets.referralReferrer,
      referralNewUser: buckets.referralNewUser,
      refund: buckets.refund,
      promotional: buckets.promotional,
      expiringSoon,
    };
  }

  /**
   * CHECKOUT ALLOCATION ENGINE
   */
  static async calculateCheckoutAllocation(input: CheckoutAllocationInput) {
    const subtotal = new Prisma.Decimal((input.subtotal || 0).toString());
    const discount = new Prisma.Decimal((input.discount || 0).toString());
    const coupon = new Prisma.Decimal((input.coupon || 0).toString());
    const excluded = new Prisma.Decimal((input.excludedAmount || 0).toString());

    const eligibleOrderValue = Prisma.Decimal.max(
      new Prisma.Decimal('0.00'),
      subtotal.minus(discount).minus(coupon).minus(excluded)
    );
    const totalOrderPayable = Prisma.Decimal.max(
      new Prisma.Decimal('0.00'),
      subtotal.minus(discount).minus(coupon)
    );

    const walletToggle = input.walletToggle !== false;
    const usePromotional = input.usePromotional !== false;
    const useSelfLoaded = input.useSelfLoaded !== false;

    if (!walletToggle) {
      return {
        eligibleOrderValue: eligibleOrderValue.toNumber(),
        totalOrderPayable: totalOrderPayable.toNumber(),
        appliedSlab: null,
        maxPromotionalAllowed: 0,
        firstOrderOverrideApplied: false,
        usedAmounts: {
          reward: 0,
          referral: 0,
          promotional: 0,
          refund: 0,
          selfLoaded: 0,
          totalWallet: 0,
        },
        externalAmount: totalOrderPayable.toNumber(),
        lotAllocations: [],
        reasons: ['Wallet disabled by user toggle'],
      };
    }

    const account = await this.getWalletAccount(input.customerId);
    const now = new Date();

    const activeLots = await prisma.walletCreditLot.findMany({
      where: {
        walletAccountId: account.id,
        status: 'ACTIVE',
        remainingAmount: { gt: 0 },
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
    });

    const slab = await WalletSlabService.getApplicableSlab(eligibleOrderValue);
    let slabPromoLimit = new Prisma.Decimal('0.00');
    if (slab) {
      const pct = new Prisma.Decimal(slab.maxPromotionalPct.toString());
      slabPromoLimit = eligibleOrderValue.times(pct).dividedBy(new Prisma.Decimal('100.00'));
      if (slab.fixedPromotionalCap) {
        const cap = new Prisma.Decimal(slab.fixedPromotionalCap.toString());
        if (slabPromoLimit.gt(cap)) {
          slabPromoLimit = cap;
        }
      }
    }

    // Check First Order Override for REFERRAL_NEW_USER
    let firstOrderOverrideApplied = false;
    let firstOrderOverrideCap = new Prisma.Decimal('0.00');

    if (input.isFirstOrder) {
      const newUserLot = activeLots.find(
        (l) => l.bucketType === 'REFERRAL_NEW_USER' && l.firstOrderOnly && Number(l.remainingAmount) > 0
      );
      if (newUserLot) {
        firstOrderOverrideApplied = true;
        firstOrderOverrideCap = Prisma.Decimal.min(
          new Prisma.Decimal(newUserLot.remainingAmount.toString()),
          eligibleOrderValue,
          new Prisma.Decimal('100.00')
        );
      }
    }

    const effectivePromoCap = Prisma.Decimal.max(slabPromoLimit, firstOrderOverrideCap);

    // Group lots into categories
    const promoBuckets = ['REFERRAL_NEW_USER', 'REWARD', 'REFERRAL_REFERRER', 'PROMOTIONAL'];
    const promoLots = this.sortLotsFEFO(activeLots.filter((l) => promoBuckets.includes(l.bucketType)));
    const refundLots = this.sortLotsFEFO(activeLots.filter((l) => l.bucketType === 'REFUND'));
    const selfLoadedLots = this.sortLotsFEFO(activeLots.filter((l) => l.bucketType === 'SELF_LOADED'));

    let remainingPromoCap = effectivePromoCap;
    let remainingEligibleValue = eligibleOrderValue;
    let remainingPayableValue = totalOrderPayable;

    const lotAllocations: Array<{
      lotId: string;
      bucketType: string;
      amount: number;
      expiresAt: Date | null;
      priority: number;
    }> = [];

    const usedBuckets = {
      reward: new Prisma.Decimal('0.00'),
      referral: new Prisma.Decimal('0.00'),
      promotional: new Prisma.Decimal('0.00'),
      refund: new Prisma.Decimal('0.00'),
      selfLoaded: new Prisma.Decimal('0.00'),
      totalWallet: new Prisma.Decimal('0.00'),
    };

    // 1. Consume Promotional Lots
    if (usePromotional) {
      for (const lot of promoLots) {
        if (remainingPromoCap.lte(0) || remainingEligibleValue.lte(0) || remainingPayableValue.lte(0)) {
          break;
        }

        const lotRem = new Prisma.Decimal(lot.remainingAmount.toString());
        const alloc = Prisma.Decimal.min(lotRem, remainingPromoCap, remainingEligibleValue, remainingPayableValue);

        if (alloc.gt(0)) {
          lotAllocations.push({
            lotId: lot.id,
            bucketType: lot.bucketType,
            amount: alloc.toNumber(),
            expiresAt: lot.expiresAt,
            priority: lot.priority,
          });

          remainingPromoCap = remainingPromoCap.minus(alloc);
          remainingEligibleValue = remainingEligibleValue.minus(alloc);
          remainingPayableValue = remainingPayableValue.minus(alloc);
          usedBuckets.totalWallet = usedBuckets.totalWallet.plus(alloc);

          if (lot.bucketType === 'REWARD') {
            usedBuckets.reward = usedBuckets.reward.plus(alloc);
          } else if (lot.bucketType.startsWith('REFERRAL')) {
            usedBuckets.referral = usedBuckets.referral.plus(alloc);
          } else if (lot.bucketType === 'PROMOTIONAL') {
            usedBuckets.promotional = usedBuckets.promotional.plus(alloc);
          }
        }
      }
    }

    // 2. Consume Refund Lots
    if (useSelfLoaded) {
      for (const lot of refundLots) {
        if (remainingPayableValue.lte(0)) break;

        const lotRem = new Prisma.Decimal(lot.remainingAmount.toString());
        const alloc = Prisma.Decimal.min(lotRem, remainingPayableValue);

        if (alloc.gt(0)) {
          lotAllocations.push({
            lotId: lot.id,
            bucketType: lot.bucketType,
            amount: alloc.toNumber(),
            expiresAt: lot.expiresAt,
            priority: lot.priority,
          });

          remainingPayableValue = remainingPayableValue.minus(alloc);
          usedBuckets.refund = usedBuckets.refund.plus(alloc);
          usedBuckets.totalWallet = usedBuckets.totalWallet.plus(alloc);
        }
      }

      // 3. Consume Self Loaded Lots
      for (const lot of selfLoadedLots) {
        if (remainingPayableValue.lte(0)) break;

        const lotRem = new Prisma.Decimal(lot.remainingAmount.toString());
        const alloc = Prisma.Decimal.min(lotRem, remainingPayableValue);

        if (alloc.gt(0)) {
          lotAllocations.push({
            lotId: lot.id,
            bucketType: lot.bucketType,
            amount: alloc.toNumber(),
            expiresAt: lot.expiresAt,
            priority: lot.priority,
          });

          remainingPayableValue = remainingPayableValue.minus(alloc);
          usedBuckets.selfLoaded = usedBuckets.selfLoaded.plus(alloc);
          usedBuckets.totalWallet = usedBuckets.totalWallet.plus(alloc);
        }
      }
    }

    const externalAmount = Prisma.Decimal.max(new Prisma.Decimal('0.00'), remainingPayableValue);

    return {
      eligibleOrderValue: eligibleOrderValue.toNumber(),
      totalOrderPayable: totalOrderPayable.toNumber(),
      appliedSlab: slab ? { id: slab.id, name: slab.name, minOrderValue: Number(slab.minOrderValue), maxPromotionalPct: Number(slab.maxPromotionalPct) } : null,
      maxPromotionalAllowed: effectivePromoCap.toNumber(),
      firstOrderOverrideApplied,
      usedAmounts: {
        reward: usedBuckets.reward.toNumber(),
        referral: usedBuckets.referral.toNumber(),
        promotional: usedBuckets.promotional.toNumber(),
        refund: usedBuckets.refund.toNumber(),
        selfLoaded: usedBuckets.selfLoaded.toNumber(),
        totalWallet: usedBuckets.totalWallet.toNumber(),
      },
      externalAmount: externalAmount.toNumber(),
      lotAllocations,
      reasons: [
        `Eligible order value: ₹${eligibleOrderValue.toFixed(2)}`,
        slab ? `Applied Slab: ${slab.name} (${slab.maxPromotionalPct}%)` : 'No slab applied',
        firstOrderOverrideApplied ? 'First order override applied for ₹100' : 'Standard slab rules',
      ],
    };
  }

  /**
   * CREATE RESERVATION
   */
  static async createReservation(params: CreateReservationParams) {
    const allocationPlan = await this.calculateCheckoutAllocation({
      customerId: params.customerId,
      subtotal: params.subtotal,
      discount: params.discount,
      coupon: params.coupon,
      excludedAmount: params.excludedAmount,
      isFirstOrder: params.isFirstOrder,
      walletToggle: true,
      usePromotional: params.usePromotional,
      useSelfLoaded: params.useSelfLoaded,
    });

    if (allocationPlan.lotAllocations.length === 0) {
      return null;
    }

    const account = await this.getWalletAccount(params.customerId);

    return await prisma.$transaction(async (tx) => {
      const config = await tx.walletConfig.findFirst();
      const resMinutes = config ? Number(config.defaultReservationMinutes) : 15;
      const expiresAt = new Date(Date.now() + resMinutes * 60 * 1000);

      const requestedTotal = allocationPlan.usedAmounts.totalWallet;

      // Create WalletReservation
      const reservation = await tx.walletReservation.create({
        data: {
          walletAccountId: account.id,
          customerId: params.customerId,
          checkoutSessionId: params.checkoutSessionId,
          totalReservedAmount: new Prisma.Decimal(requestedTotal.toFixed(2)),
          currency: account.currency,
          status: 'ACTIVE',
          expiresAt,
        },
      });

      const allocationsToValidate: { amount: Prisma.Decimal }[] = [];

      for (const alloc of allocationPlan.lotAllocations) {
        const allocAmt = new Prisma.Decimal(alloc.amount.toFixed(2));
        allocationsToValidate.push({ amount: allocAmt });

        // Update lot remainingAmount and reservedAmount
        const lot = await tx.walletCreditLot.findUnique({
          where: { id: alloc.lotId },
        });

        if (!lot || Number(lot.remainingAmount) < alloc.amount) {
          throw new Error(`Insufficient lot balance during reservation on lot ${alloc.lotId}`);
        }

        const newRemaining = new Prisma.Decimal(lot.remainingAmount.toString()).minus(allocAmt);
        const newReserved = new Prisma.Decimal(lot.reservedAmount.toString()).plus(allocAmt);

        await tx.walletCreditLot.update({
          where: { id: alloc.lotId },
          data: {
            remainingAmount: newRemaining,
            reservedAmount: newReserved,
          },
        });

        // Validate Financial Invariant on lot
        FinancialInvariantService.validateCreditLot(
          lot.originalAmount,
          newRemaining,
          newReserved,
          lot.consumedAmount,
          lot.expiredAmount,
          lot.reversedAmount
        );

        // Create WalletReservationAllocation
        await tx.walletReservationAllocation.create({
          data: {
            reservationId: reservation.id,
            walletCreditLotId: alloc.lotId,
            bucketType: alloc.bucketType,
            amount: allocAmt,
            consumedAmount: new Prisma.Decimal('0.00'),
            releasedAmount: new Prisma.Decimal('0.00'),
            allocationPriority: alloc.priority,
            status: 'ACTIVE',
          },
        });
      }

      // Validate overall reservation allocations sum
      FinancialInvariantService.validateReservationAllocations(
        new Prisma.Decimal(requestedTotal.toFixed(2)),
        allocationsToValidate
      );

      // Update cached balances
      await this.updateCachedBalances(account.id, tx);

      return await tx.walletReservation.findUnique({
        where: { id: reservation.id },
        include: { allocations: { include: { creditLot: true } } },
      });
    });
  }

  /**
   * CONSUME RESERVATION
   */
  static async consumeReservation(
    reservationId: string,
    orderId: string,
    customerId: string,
    idempotencyKey?: string
  ) {
    if (idempotencyKey) {
      const existingLedger = await prisma.walletLedgerEntry.findFirst({
        where: { idempotencyKey },
      });
      if (existingLedger) {
        return { idempotencyReplay: true, reservationId, orderId };
      }
    }

    return await prisma.$transaction(async (tx) => {
      const reservation = await tx.walletReservation.findUnique({
        where: { id: reservationId },
        include: { allocations: { include: { creditLot: true } } },
      });

      if (!reservation) {
        throw new Error('Reservation not found');
      }

      if (reservation.status === 'CONSUMED') {
        return { reservationId, status: 'CONSUMED', alreadyConsumed: true };
      }

      if (reservation.status !== 'ACTIVE') {
        throw new Error(`Cannot consume reservation with status ${reservation.status}`);
      }

      const account = await tx.walletAccount.findUnique({
        where: { id: reservation.walletAccountId },
      });
      if (!account) throw new Error('Wallet account not found');

      // Mark reservation consumed
      await tx.walletReservation.update({
        where: { id: reservationId },
        data: {
          status: 'CONSUMED',
          consumedAt: new Date(),
          orderId,
        },
      });

      let openingWalletBalance = new Prisma.Decimal(account.cachedAvailableBalance.toString()).plus(
        account.cachedHeldBalance.toString()
      );

      for (const alloc of reservation.allocations) {
        const allocAmt = new Prisma.Decimal(alloc.amount.toString());
        const lot = alloc.creditLot;

        const newReserved = new Prisma.Decimal(lot.reservedAmount.toString()).minus(allocAmt);
        const newConsumed = new Prisma.Decimal(lot.consumedAmount.toString()).plus(allocAmt);
        const newRemaining = new Prisma.Decimal(lot.remainingAmount.toString());

        const isExhausted = newRemaining.lte(0) && newReserved.lte(0);

        await tx.walletCreditLot.update({
          where: { id: lot.id },
          data: {
            reservedAmount: newReserved,
            consumedAmount: newConsumed,
            ...(isExhausted && { status: 'EXHAUSTED' }),
          },
        });

        // Validate Invariant
        FinancialInvariantService.validateCreditLot(
          lot.originalAmount,
          newRemaining,
          newReserved,
          newConsumed,
          lot.expiredAmount,
          lot.reversedAmount
        );

        // Update allocation
        await tx.walletReservationAllocation.update({
          where: { id: alloc.id },
          data: {
            consumedAmount: allocAmt,
            status: 'CONSUMED',
          },
        });

        // Create OrderPaymentAllocation
        await tx.orderPaymentAllocation.create({
          data: {
            orderId,
            customerId,
            sourceType: lot.bucketType,
            walletBucketType: lot.bucketType,
            walletCreditLotId: lot.id,
            walletReservationAllocationId: alloc.id,
            amount: allocAmt,
            status: 'ACTIVE',
          },
        });

        const closingWalletBalance = openingWalletBalance.minus(allocAmt);

        // Create WalletLedgerEntry
        await tx.walletLedgerEntry.create({
          data: {
            walletAccountId: account.id,
            customerId,
            creditLotId: lot.id,
            reservationId,
            orderId,
            transactionType: 'DEBIT',
            direction: 'DEBIT',
            amount: allocAmt,
            bucketType: lot.bucketType,
            openingLotBalance: newRemaining.plus(newReserved).plus(allocAmt),
            closingLotBalance: newRemaining.plus(newReserved),
            openingWalletBalance,
            closingWalletBalance,
            referenceType: 'ORDER_PAYMENT',
            referenceId: orderId,
            narration: `Order payment for order ${orderId}`,
            idempotencyKey: idempotencyKey ? `${idempotencyKey}_${alloc.id}` : undefined,
          },
        });

        // Validate Ledger Balance Invariant
        FinancialInvariantService.validateLedgerBalance(openingWalletBalance, 'DEBIT', allocAmt, closingWalletBalance);

        openingWalletBalance = closingWalletBalance;
      }

      await this.updateCachedBalances(account.id, tx);

      return { success: true, reservationId, orderId };
    });
  }

  /**
   * RELEASE RESERVATION
   */
  static async releaseReservation(reservationId: string, reason?: string) {
    return await prisma.$transaction(async (tx) => {
      const reservation = await tx.walletReservation.findUnique({
        where: { id: reservationId },
        include: { allocations: true },
      });

      if (!reservation) return null;
      if (reservation.status !== 'ACTIVE') {
        return reservation;
      }

      await tx.walletReservation.update({
        where: { id: reservationId },
        data: {
          status: 'RELEASED',
          releasedAt: new Date(),
          metadataJson: reason ? JSON.stringify({ releaseReason: reason }) : undefined,
        },
      });

      for (const alloc of reservation.allocations) {
        const allocAmt = new Prisma.Decimal(alloc.amount.toString());
        const lot = await tx.walletCreditLot.findUnique({
          where: { id: alloc.walletCreditLotId },
        });

        if (lot) {
          const newRemaining = new Prisma.Decimal(lot.remainingAmount.toString()).plus(allocAmt);
          const newReserved = new Prisma.Decimal(lot.reservedAmount.toString()).minus(allocAmt);

          await tx.walletCreditLot.update({
            where: { id: lot.id },
            data: {
              remainingAmount: newRemaining,
              reservedAmount: newReserved,
            },
          });

          FinancialInvariantService.validateCreditLot(
            lot.originalAmount,
            newRemaining,
            newReserved,
            lot.consumedAmount,
            lot.expiredAmount,
            lot.reversedAmount
          );
        }

        await tx.walletReservationAllocation.update({
          where: { id: alloc.id },
          data: {
            releasedAmount: allocAmt,
            status: 'RELEASED',
          },
        });
      }

      await this.updateCachedBalances(reservation.walletAccountId, tx);

      return await tx.walletReservation.findUnique({
        where: { id: reservationId },
        include: { allocations: true },
      });
    });
  }

  /**
   * EXPIRE RESERVATION
   */
  static async expireReservation(reservationId: string) {
    return await this.releaseReservation(reservationId, 'RESERVATION_EXPIRED');
  }

  /**
   * FULL WALLET PAYMENT
   */
  static async createFullWalletPayment(params: {
    customerId: string;
    checkoutSessionId: string;
    orderId: string;
    subtotal: number | Prisma.Decimal;
    discount?: number | Prisma.Decimal;
    coupon?: number | Prisma.Decimal;
    excludedAmount?: number | Prisma.Decimal;
    isFirstOrder?: boolean;
    idempotencyKey?: string;
  }) {
    const allocationPlan = await this.calculateCheckoutAllocation({
      customerId: params.customerId,
      subtotal: params.subtotal,
      discount: params.discount,
      coupon: params.coupon,
      excludedAmount: params.excludedAmount,
      isFirstOrder: params.isFirstOrder,
      walletToggle: true,
    });

    if (allocationPlan.externalAmount > 0) {
      throw new Error(`Full wallet payment unavailable. Remaining external amount: ₹${allocationPlan.externalAmount}`);
    }

    const reservation = await this.createReservation({
      customerId: params.customerId,
      checkoutSessionId: params.checkoutSessionId,
      subtotal: params.subtotal,
      discount: params.discount,
      coupon: params.coupon,
      excludedAmount: params.excludedAmount,
      isFirstOrder: params.isFirstOrder,
    });

    if (!reservation) {
      throw new Error('Failed to create reservation for full wallet payment');
    }

    const consumed = await this.consumeReservation(
      reservation.id,
      params.orderId,
      params.customerId,
      params.idempotencyKey
    );

    return {
      success: true,
      reservationId: reservation.id,
      orderId: params.orderId,
      consumed,
      usedAmounts: allocationPlan.usedAmounts,
    };
  }

  /**
   * CREDIT WALLET
   */
  static async creditWallet(params: CreditWalletParams) {
    if (params.idempotencyKey) {
      const existing = await prisma.walletLedgerEntry.findUnique({
        where: { idempotencyKey: params.idempotencyKey },
      });
      if (existing) {
        const lot = await prisma.walletCreditLot.findFirst({
          where: { walletAccountId: existing.walletAccountId, sourceType: params.sourceType, sourceId: params.sourceId },
        });
        return { lot, entry: existing };
      }
    }

    const account = await this.getWalletAccount(params.customerId);
    const amountVal = new Prisma.Decimal(params.amount.toString());

    if (amountVal.lte(0)) {
      throw new Error('Credit amount must be greater than zero');
    }

    return await prisma.$transaction(async (tx) => {
      const openingWalletBalance = new Prisma.Decimal(account.cachedAvailableBalance.toString());
      const closingWalletBalance = openingWalletBalance.plus(amountVal);

      // Create Credit Lot
      const lot = await tx.walletCreditLot.create({
        data: {
          walletAccountId: account.id,
          customerId: params.customerId,
          bucketType: params.bucketType,
          originalAmount: amountVal,
          remainingAmount: amountVal,
          reservedAmount: new Prisma.Decimal('0.00'),
          consumedAmount: new Prisma.Decimal('0.00'),
          reversedAmount: new Prisma.Decimal('0.00'),
          expiredAmount: new Prisma.Decimal('0.00'),
          sourceType: params.sourceType,
          sourceId: params.sourceId,
          expiresAt: params.expiresAt || null,
          firstOrderOnly: Boolean(params.firstOrderOnly),
          priority: this.BUCKET_PRIORITY_MAP[params.bucketType] ?? 50,
          status: 'ACTIVE',
        },
      });

      // Validate Invariant
      FinancialInvariantService.validateCreditLot(amountVal, amountVal, 0, 0, 0, 0);

      // Create Ledger Entry
      const entry = await tx.walletLedgerEntry.create({
        data: {
          walletAccountId: account.id,
          customerId: params.customerId,
          creditLotId: lot.id,
          transactionType: 'CREDIT',
          direction: 'CREDIT',
          amount: amountVal,
          bucketType: params.bucketType,
          openingLotBalance: new Prisma.Decimal('0.00'),
          closingLotBalance: amountVal,
          openingWalletBalance,
          closingWalletBalance,
          referenceType: params.sourceType,
          referenceId: params.sourceId,
          narration: params.narration || `Credit to ${params.bucketType}`,
          idempotencyKey: params.idempotencyKey,
        },
      });

      FinancialInvariantService.validateLedgerBalance(openingWalletBalance, 'CREDIT', amountVal, closingWalletBalance);

      await this.updateCachedBalances(account.id, tx);

      return { lot, entry };
    });
  }

  /**
   * DIRECT DEBIT WALLET
   */
  static async debitWallet(params: DebitWalletParams) {
    if (params.idempotencyKey) {
      const existing = await prisma.walletLedgerEntry.findUnique({
        where: { idempotencyKey: params.idempotencyKey },
      });
      if (existing) return { entry: existing };
    }

    const account = await this.getWalletAccount(params.customerId);
    const amountVal = new Prisma.Decimal(params.amount.toString());

    if (amountVal.lte(0)) throw new Error('Debit amount must be greater than zero');

    const now = new Date();
    const activeLots = await prisma.walletCreditLot.findMany({
      where: {
        walletAccountId: account.id,
        status: 'ACTIVE',
        remainingAmount: { gt: 0 },
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
    });

    const sortedLots = this.sortLotsFEFO(activeLots);
    let remainingToDebit = amountVal;

    return await prisma.$transaction(async (tx) => {
      let openingWalletBalance = new Prisma.Decimal(account.cachedAvailableBalance.toString());
      const entries = [];

      for (const lot of sortedLots) {
        if (remainingToDebit.lte(0)) break;

        const lotRem = new Prisma.Decimal(lot.remainingAmount.toString());
        const debitAmt = Prisma.Decimal.min(lotRem, remainingToDebit);

        if (debitAmt.gt(0)) {
          const newRemaining = lotRem.minus(debitAmt);
          const newConsumed = new Prisma.Decimal(lot.consumedAmount.toString()).plus(debitAmt);
          const isExhausted = newRemaining.lte(0) && Number(lot.reservedAmount) <= 0;

          await tx.walletCreditLot.update({
            where: { id: lot.id },
            data: {
              remainingAmount: newRemaining,
              consumedAmount: newConsumed,
              ...(isExhausted && { status: 'EXHAUSTED' }),
            },
          });

          FinancialInvariantService.validateCreditLot(
            lot.originalAmount,
            newRemaining,
            lot.reservedAmount,
            newConsumed,
            lot.expiredAmount,
            lot.reversedAmount
          );

          const closingWalletBalance = openingWalletBalance.minus(debitAmt);

          const entry = await tx.walletLedgerEntry.create({
            data: {
              walletAccountId: account.id,
              customerId: params.customerId,
              creditLotId: lot.id,
              transactionType: 'DEBIT',
              direction: 'DEBIT',
              amount: debitAmt,
              bucketType: lot.bucketType,
              openingLotBalance: lotRem,
              closingLotBalance: newRemaining,
              openingWalletBalance,
              closingWalletBalance,
              referenceType: params.referenceType,
              referenceId: params.referenceId,
              narration: params.reason,
              idempotencyKey: params.idempotencyKey ? `${params.idempotencyKey}_${lot.id}` : undefined,
            },
          });

          FinancialInvariantService.validateLedgerBalance(openingWalletBalance, 'DEBIT', debitAmt, closingWalletBalance);

          openingWalletBalance = closingWalletBalance;
          remainingToDebit = remainingToDebit.minus(debitAmt);
          entries.push(entry);
        }
      }

      if (remainingToDebit.gt(0)) {
        throw new Error(`Insufficient wallet balance for debit of ₹${amountVal.toFixed(2)}`);
      }

      await this.updateCachedBalances(account.id, tx);

      return { entries };
    });
  }

  /**
   * RESTORE WALLET (For Refunds / Order Cancellations)
   */
  static async restoreWallet(params: RestoreWalletParams) {
    return await this.creditWallet({
      customerId: params.customerId,
      amount: params.amount,
      bucketType: 'REFUND',
      sourceType: 'REFUND',
      sourceId: params.orderId,
      narration: params.reason || 'Order refund credit',
      idempotencyKey: params.idempotencyKey,
    });
  }

  /**
   * EXPIRE WALLET LOT
   */
  static async expireWalletLot(lotId: string) {
    return await prisma.$transaction(async (tx) => {
      const lot = await tx.walletCreditLot.findUnique({
        where: { id: lotId },
      });

      if (!lot || lot.status !== 'ACTIVE') return null;

      const expiredAmt = new Prisma.Decimal(lot.remainingAmount.toString());
      if (expiredAmt.lte(0)) return lot;

      const newExpiredTotal = new Prisma.Decimal(lot.expiredAmount.toString()).plus(expiredAmt);

      const updatedLot = await tx.walletCreditLot.update({
        where: { id: lotId },
        data: {
          remainingAmount: new Prisma.Decimal('0.00'),
          expiredAmount: newExpiredTotal,
          status: 'EXPIRED',
        },
      });

      FinancialInvariantService.validateCreditLot(
        lot.originalAmount,
        0,
        lot.reservedAmount,
        lot.consumedAmount,
        newExpiredTotal,
        lot.reversedAmount
      );

      const account = await tx.walletAccount.findUnique({
        where: { id: lot.walletAccountId },
      });

      if (account) {
        const openingWalletBalance = new Prisma.Decimal(account.cachedAvailableBalance.toString());
        const closingWalletBalance = openingWalletBalance.minus(expiredAmt);

        await tx.walletLedgerEntry.create({
          data: {
            walletAccountId: account.id,
            customerId: lot.customerId,
            creditLotId: lot.id,
            transactionType: 'EXPIRY',
            direction: 'DEBIT',
            amount: expiredAmt,
            bucketType: lot.bucketType,
            openingLotBalance: expiredAmt,
            closingLotBalance: new Prisma.Decimal('0.00'),
            openingWalletBalance,
            closingWalletBalance,
            referenceType: 'LOT_EXPIRY',
            referenceId: lot.id,
            narration: `Lot ${lot.id} expired`,
          },
        });

        await this.updateCachedBalances(account.id, tx);
      }

      return updatedLot;
    });
  }

  /**
   * CREATE ADJUSTMENT REQUEST
   */
  static async createAdjustment(params: CreateAdjustmentParams) {
    const account = await prisma.walletAccount.findUnique({
      where: { id: params.walletAccountId },
    });
    if (!account) throw new Error('Wallet account not found');

    const amountVal = new Prisma.Decimal(params.amount.toString());

    const adjustment = await prisma.walletAdjustmentRequest.create({
      data: {
        walletAccountId: params.walletAccountId,
        customerId: account.customerId,
        adminId: params.adminId,
        requestedBy: params.adminId,
        amount: amountVal,
        adjustmentType: params.adjustmentType,
        bucketType: params.bucketType || 'SELF_LOADED',
        reasonCategory: params.reasonCategory,
        note: params.note,
        status: params.autoApprove ? 'APPROVED' : 'PENDING',
        approvedBy: params.autoApprove ? params.adminId : undefined,
        approvedAt: params.autoApprove ? new Date() : undefined,
      },
    });

    if (params.autoApprove) {
      if (params.adjustmentType === 'CREDIT') {
        await this.creditWallet({
          customerId: account.customerId,
          amount: amountVal,
          bucketType: params.bucketType || 'SELF_LOADED',
          sourceType: 'ADMIN_ADJUSTMENT',
          sourceId: adjustment.id,
          narration: `Admin adjustment: ${params.note}`,
        });
      } else if (params.adjustmentType === 'DEBIT') {
        await this.debitWallet({
          customerId: account.customerId,
          amount: amountVal,
          reason: `Admin adjustment debit: ${params.note}`,
          referenceType: 'ADMIN_ADJUSTMENT',
          referenceId: adjustment.id,
        });
      }

      await prisma.walletAdjustmentRequest.update({
        where: { id: adjustment.id },
        data: { status: 'APPLIED', executedAt: new Date() },
      });
    }

    return adjustment;
  }

  /**
   * Create a Wallet Top-Up request & gateway order
   */
  static async createWalletTopUp(params: {
    customerId: string;
    amount: number | Prisma.Decimal;
    idempotencyKey?: string;
    deviceId?: string;
    sessionId?: string;
    paymentMethodPreference?: string;
    returnContext?: any;
    isVerifiedMobile?: boolean;
  }) {
    if (params.isVerifiedMobile === false) {
      throw new Error('Verified mobile number is required for wallet top-up');
    }

    if (!env.WALLET_TOPUP_ENABLED) {
      throw new Error('Wallet top-up is currently disabled');
    }

    const amountNum = typeof params.amount === 'number' ? params.amount : parseFloat(params.amount.toString());
    if (isNaN(amountNum) || amountNum <= 0) {
      throw new Error('Invalid top-up amount');
    }

    if (amountNum < env.WALLET_TOPUP_MIN_AMOUNT) {
      throw new Error(`Minimum top-up amount is ₹${env.WALLET_TOPUP_MIN_AMOUNT}`);
    }

    if (amountNum > env.WALLET_TOPUP_MAX_AMOUNT) {
      throw new Error(`Maximum top-up amount per transaction is ₹${env.WALLET_TOPUP_MAX_AMOUNT}`);
    }

    const account = await this.getWalletAccount(params.customerId);
    if (account.status !== 'ACTIVE') {
      throw new Error('Wallet account is not active');
    }

    // Daily & Monthly Limits
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const existingTopUps = await prisma.walletTopUp.findMany({
      where: {
        customerId: params.customerId,
        status: { in: ['PAYMENT_PENDING', 'PAYMENT_SUCCESS', 'CREDIT_PENDING', 'CREDITED'] },
        createdAt: { gte: startOfMonth },
      },
    });

    let todayTotal = 0;
    let monthTotal = 0;

    for (const tu of existingTopUps) {
      const tuAmt = parseFloat(tu.amount.toString());
      monthTotal += tuAmt;
      if (tu.createdAt >= startOfDay) {
        todayTotal += tuAmt;
      }
    }

    if (todayTotal + amountNum > env.WALLET_TOPUP_MAX_DAILY_AMOUNT) {
      throw new Error(`Daily top-up limit of ₹${env.WALLET_TOPUP_MAX_DAILY_AMOUNT} exceeded`);
    }

    if (monthTotal + amountNum > env.WALLET_TOPUP_MAX_MONTHLY_AMOUNT) {
      throw new Error(`Monthly top-up limit of ₹${env.WALLET_TOPUP_MAX_MONTHLY_AMOUNT} exceeded`);
    }

    const currentBalance = parseFloat(account.cachedTotalBalance.toString());
    if (currentBalance + amountNum > env.WALLET_MAX_BALANCE) {
      throw new Error(`Maximum wallet balance limit of ₹${env.WALLET_MAX_BALANCE} exceeded`);
    }

    // Idempotency check
    if (params.idempotencyKey) {
      const existing = await prisma.walletTopUp.findUnique({
        where: { idempotencyKey: params.idempotencyKey },
      });
      if (existing) {
        return {
          walletTopUpId: existing.id,
          gateway: existing.gateway,
          gatewayOrderId: existing.gatewayOrderId,
          amount: parseFloat(existing.amount.toString()),
          currency: existing.currency,
          razorpayKeyId: env.RAZORPAY_KEY_ID,
          paymentStatus: existing.status,
          requiresOtp: false,
        };
      }
    }

    const topUp = await prisma.walletTopUp.create({
      data: {
        walletAccountId: account.id,
        customerId: params.customerId,
        amount: new Prisma.Decimal(amountNum.toFixed(2)),
        currency: 'INR',
        status: 'CREATED',
        gateway: 'RAZORPAY',
        idempotencyKey: params.idempotencyKey || null,
        metadataJson: JSON.stringify({
          deviceId: params.deviceId,
          sessionId: params.sessionId,
          paymentMethodPreference: params.paymentMethodPreference,
          returnContext: params.returnContext,
        }),
      },
    });

    const { paymentGatewayService, rupeesToPaise } = await import('../payments/payment.gateway.service');
    const paise = rupeesToPaise(amountNum);
    const razorpayOrder = await paymentGatewayService.createPaymentOrder({
      amountPaise: paise,
      currency: 'INR',
      receipt: topUp.id,
      notes: { walletTopUpId: topUp.id, customerId: params.customerId },
    });

    const updatedTopUp = await prisma.walletTopUp.update({
      where: { id: topUp.id },
      data: {
        gatewayOrderId: razorpayOrder.id,
        status: 'PAYMENT_PENDING',
      },
    });

    return {
      walletTopUpId: updatedTopUp.id,
      gateway: 'RAZORPAY',
      gatewayOrderId: razorpayOrder.id,
      amount: amountNum,
      currency: 'INR',
      razorpayKeyId: env.RAZORPAY_KEY_ID,
      customerPrefill: { customerId: params.customerId },
      paymentStatus: 'PAYMENT_PENDING',
      requiresOtp: false,
    };
  }

  /**
   * Confirm top-up payment via customer callback
   */
  static async confirmWalletTopUp(params: {
    topUpId: string;
    customerId: string;
    razorpayPaymentId: string;
    razorpayOrderId: string;
    razorpaySignature: string;
    idempotencyKey?: string;
  }) {
    const topUp = await prisma.walletTopUp.findUnique({
      where: { id: params.topUpId },
    });

    if (!topUp) {
      throw new Error('Wallet top-up record not found');
    }

    if (topUp.customerId !== params.customerId) {
      throw new Error('Unauthorized top-up confirmation');
    }

    if (topUp.status === 'CREDITED') {
      return { success: true, status: 'CREDITED', walletTopUpId: topUp.id, idempotencyReplay: true };
    }

    if (topUp.gatewayOrderId && topUp.gatewayOrderId !== params.razorpayOrderId) {
      throw new Error('Gateway order ID mismatch');
    }

    const { paymentGatewayService, rupeesToPaise } = await import('../payments/payment.gateway.service');

    const isValidSignature = paymentGatewayService.verifyCheckoutSignature({
      orderId: params.razorpayOrderId,
      paymentId: params.razorpayPaymentId,
      signature: params.razorpaySignature,
    });

    if (!isValidSignature) {
      await prisma.walletTopUp.update({
        where: { id: topUp.id },
        data: { status: 'PAYMENT_FAILED', failureCode: 'INVALID_SIGNATURE', failureMessage: 'Gateway checkout signature verification failed' },
      });
      throw new Error('Payment signature verification failed');
    }

    const paymentDetails = await paymentGatewayService.fetchPayment(params.razorpayPaymentId);

    if (paymentDetails.orderId && paymentDetails.orderId !== params.razorpayOrderId) {
      throw new Error('Payment order mismatch');
    }

    const expectedPaise = rupeesToPaise(topUp.amount);
    if (paymentDetails.amount !== expectedPaise) {
      throw new Error(`Payment amount mismatch: expected ${expectedPaise} paise, got ${paymentDetails.amount}`);
    }

    if (paymentDetails.currency !== 'INR') {
      throw new Error('Payment currency mismatch');
    }

    if (paymentDetails.status !== 'captured' && paymentDetails.status !== 'authorized') {
      await prisma.walletTopUp.update({
        where: { id: topUp.id },
        data: { status: 'PAYMENT_FAILED', failureCode: paymentDetails.errorCode || 'PAYMENT_NOT_CAPTURED', failureMessage: paymentDetails.errorDescription || 'Payment not in captured state' },
      });
      throw new Error(`Payment in invalid state: ${paymentDetails.status}`);
    }

    let finalPayment = paymentDetails;
    if (paymentDetails.status === 'authorized') {
      finalPayment = await paymentGatewayService.capturePayment(params.razorpayPaymentId, expectedPaise, 'INR');
    }

    return await this.creditVerifiedTopUp({
      topUpId: topUp.id,
      paymentDetails: finalPayment,
      idempotencyKey: params.idempotencyKey,
      sourceEvent: 'CONFIRM_CALLBACK',
    });
  }

  /**
   * Idempotently credit a verified top-up to the customer wallet
   */
  static async creditVerifiedTopUp(params: {
    topUpId: string;
    paymentDetails: any;
    idempotencyKey?: string;
    sourceEvent?: string;
  }) {
    const topUp = await prisma.walletTopUp.findUnique({
      where: { id: params.topUpId },
    });

    if (!topUp) {
      throw new Error('Top-up record not found');
    }

    if (topUp.status === 'CREDITED') {
      return { success: true, status: 'CREDITED', topUpId: topUp.id, idempotencyReplay: true };
    }

    const existingPaymentCredited = await prisma.walletTopUp.findFirst({
      where: {
        gatewayPaymentId: params.paymentDetails.id,
        status: 'CREDITED',
      },
    });

    if (existingPaymentCredited && existingPaymentCredited.id !== topUp.id) {
      throw new Error(`Payment ID ${params.paymentDetails.id} has already credited another top-up`);
    }

    const amountNum = parseFloat(topUp.amount.toString());

    // Execute atomic credit
    const creditResult = await this.creditWallet({
      customerId: topUp.customerId!,
      amount: amountNum,
      bucketType: 'SELF_LOADED',
      sourceType: 'TOP_UP',
      sourceId: topUp.id,
      expiresAt: null,
      narration: `Wallet top-up via Razorpay (${params.paymentDetails.id})`,
      idempotencyKey: params.idempotencyKey || `wallet_topup_credit:${topUp.id}`,
    });

    const updatedTopUp = await prisma.walletTopUp.update({
      where: { id: topUp.id },
      data: {
        status: 'CREDITED',
        gatewayPaymentId: params.paymentDetails.id,
        paymentMethod: params.paymentDetails.method || 'online',
        paidAt: new Date(),
        creditedAt: new Date(),
      },
    });

    const account = await this.getWalletAccount(topUp.customerId!);

    return {
      success: true,
      status: 'CREDITED',
      topUpId: updatedTopUp.id,
      amount: amountNum,
      creditLotId: creditResult.lot.id,
      ledgerEntryId: creditResult.entry.id,
      walletBalance: account.cachedAvailableBalance,
    };
  }

  /**
   * Handle Chargeback / Dispute for a top-up
   */
  static async handleTopUpChargeback(params: {
    topUpId?: string;
    gatewayPaymentId?: string;
    disputeId: string;
    amount: number | Prisma.Decimal;
    reasonCode?: string;
    idempotencyKey?: string;
  }) {
    let topUp: any = null;
    if (params.topUpId) {
      topUp = await prisma.walletTopUp.findUnique({ where: { id: params.topUpId } });
    } else if (params.gatewayPaymentId) {
      topUp = await prisma.walletTopUp.findFirst({ where: { gatewayPaymentId: params.gatewayPaymentId } });
    }

    const disputeAmountNum = typeof params.amount === 'number' ? params.amount : parseFloat(params.amount.toString());

    let dispute = await prisma.paymentDispute.findFirst({
      where: { gatewayDisputeId: params.disputeId },
    });

    if (!dispute) {
      dispute = await prisma.paymentDispute.create({
        data: {
          gateway: 'RAZORPAY',
          gatewayDisputeId: params.disputeId,
          gatewayPaymentId: params.gatewayPaymentId || topUp?.gatewayPaymentId,
          walletTopUpId: topUp?.id,
          customerId: topUp?.customerId,
          amount: new Prisma.Decimal(disputeAmountNum.toFixed(2)),
          currency: 'INR',
          reasonCode: params.reasonCode || 'CHARGEBACK',
          status: 'OPEN',
          walletAmountHeld: new Prisma.Decimal(disputeAmountNum.toFixed(2)),
          idempotencyKey: params.idempotencyKey || `dispute:${params.disputeId}`,
        },
      });
    }

    if (topUp && topUp.customerId) {
      const account = await this.getWalletAccount(topUp.customerId);

      // Find related lot
      const relatedLot = await prisma.walletCreditLot.findFirst({
        where: {
          walletAccountId: account.id,
          bucketType: 'SELF_LOADED',
          sourceType: 'TOP_UP',
          sourceId: topUp.id,
        },
      });

      let heldAmount = 0;
      if (relatedLot) {
        const remaining = parseFloat(relatedLot.remainingAmount.toString());
        heldAmount = Math.min(remaining, disputeAmountNum);

        if (heldAmount > 0) {
          const newRemaining = remaining - heldAmount;
          const currentReserved = parseFloat(relatedLot.reservedAmount.toString());
          await prisma.walletCreditLot.update({
            where: { id: relatedLot.id },
            data: {
              remainingAmount: new Prisma.Decimal(newRemaining.toFixed(2)),
              reservedAmount: new Prisma.Decimal((currentReserved + heldAmount).toFixed(2)),
              status: newRemaining === 0 ? 'FRAUD_HOLD' : 'ACTIVE',
            },
          });
        }
      }

      await prisma.walletLedgerEntry.create({
        data: {
          walletAccountId: account.id,
          customerId: topUp.customerId,
          transactionType: 'CHARGEBACK',
          direction: 'DEBIT',
          amount: new Prisma.Decimal(disputeAmountNum.toFixed(2)),
          bucketType: 'SELF_LOADED',
          creditLotId: relatedLot?.id,
          referenceType: 'DISPUTE_HOLD',
          referenceId: params.disputeId,
          narration: `Chargeback dispute hold (${params.disputeId})`,
        },
      });

      await prisma.walletFraudSignal.create({
        data: {
          walletAccountId: account.id,
          customerId: topUp.customerId,
          signalType: 'CHARGEBACK_RECEIVED',
          riskScore: 50,
          description: `Dispute/chargeback received for payment ${params.gatewayPaymentId || params.disputeId}`,
        },
      });
    }

    return dispute;
  }

  /**
   * Expire abandoned top-ups older than timeout
   */
  static async expireAbandonedTopUps(timeoutMinutes = 60) {
    const threshold = new Date(Date.now() - timeoutMinutes * 60 * 1000);
    const expired = await prisma.walletTopUp.updateMany({
      where: {
        status: { in: ['CREATED', 'PAYMENT_PENDING'] },
        createdAt: { lt: threshold },
      },
      data: {
        status: 'EXPIRED',
        failureCode: 'TOPUP_TIMEOUT',
        failureMessage: 'Top-up payment expired before completion',
      },
    });
    return expired.count;
  }

  /**
   * Helper credit shortcuts
   */
  static async createTopupCredit(params: { customerId: string; amount: number; sourceId?: string; idempotencyKey?: string }) {
    return await this.creditWallet({
      customerId: params.customerId,
      amount: params.amount,
      bucketType: 'SELF_LOADED',
      sourceType: 'TOP_UP',
      sourceId: params.sourceId,
      narration: 'Wallet top-up',
      idempotencyKey: params.idempotencyKey,
    });
  }

  static async createRewardCredit(params: {
    customerId: string;
    amount: number;
    sourceId?: string;
    expiresAt?: Date;
    idempotencyKey?: string;
  }) {
    return await this.creditWallet({
      customerId: params.customerId,
      amount: params.amount,
      bucketType: 'REWARD',
      sourceType: 'REWARD_CONVERSION',
      sourceId: params.sourceId,
      expiresAt: params.expiresAt,
      narration: 'Reward coin conversion',
      idempotencyKey: params.idempotencyKey,
    });
  }

  static async createReferralCredit(params: {
    customerId: string;
    amount: number;
    bucketType: 'REFERRAL_REFERRER' | 'REFERRAL_NEW_USER';
    sourceId?: string;
    expiresAt?: Date;
    firstOrderOnly?: boolean;
    idempotencyKey?: string;
  }) {
    return await this.creditWallet({
      customerId: params.customerId,
      amount: params.amount,
      bucketType: params.bucketType,
      sourceType: 'REFERRAL_REWARD',
      sourceId: params.sourceId,
      expiresAt: params.expiresAt,
      firstOrderOnly: params.firstOrderOnly,
      narration: 'Referral reward credit',
      idempotencyKey: params.idempotencyKey,
    });
  }

  static async createRefundCredit(params: { customerId: string; amount: number; orderId?: string; idempotencyKey?: string }) {
    return await this.creditWallet({
      customerId: params.customerId,
      amount: params.amount,
      bucketType: 'REFUND',
      sourceType: 'REFUND',
      sourceId: params.orderId,
      narration: 'Order refund credit',
      idempotencyKey: params.idempotencyKey,
    });
  }
}
