import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export class RewardAccountRebuildService {
  /**
   * Recalculates expected reward account aggregates for a customer.
   */
  static async calculateExpectedAggregates(customerId: string, txPrisma?: any) {
    const db = txPrisma || prisma;

    const transactions = await db.rewardTransaction.findMany({
      where: { customerId },
    });

    let totalEstimated = new Prisma.Decimal('0.00');
    let totalPending = new Prisma.Decimal('0.00');
    let totalClaimable = new Prisma.Decimal('0.00');
    let totalConverted = new Prisma.Decimal('0.00');
    let totalExpired = new Prisma.Decimal('0.00');
    let totalReversed = new Prisma.Decimal('0.00');

    for (const tx of transactions) {
      const coins = tx.coinsEarned || new Prisma.Decimal('0.00');

      switch (tx.status) {
        case 'ESTIMATED':
          totalEstimated = totalEstimated.plus(coins);
          break;
        case 'PENDING_PAYMENT':
        case 'PENDING_DELIVERY':
        case 'DELIVERY_CONFIRMED':
        case 'COOLING_PERIOD':
          totalPending = totalPending.plus(coins);
          break;
        case 'CLAIMABLE':
          totalClaimable = totalClaimable.plus(coins);
          break;
        case 'CONVERTED':
          totalConverted = totalConverted.plus(coins);
          break;
        case 'EXPIRED':
          totalExpired = totalExpired.plus(coins);
          break;
        case 'REVERSED':
        case 'CANCELLED':
          totalReversed = totalReversed.plus(coins);
          break;
      }
    }

    return {
      totalEstimatedCoins: totalEstimated,
      totalPendingCoins: totalPending,
      totalClaimableCoins: totalClaimable,
      totalConvertedCoins: totalConverted,
      totalExpiredCoins: totalExpired,
      totalReversedCoins: totalReversed,
    };
  }

  /**
   * Rebuilds and syncs a customer's RewardAccount atomically.
   */
  static async rebuildCustomerRewardAccount(customerId: string, txPrisma?: any) {
    const db = txPrisma || prisma;

    const expected = await this.calculateExpectedAggregates(customerId, db);

    const account = await db.rewardAccount.upsert({
      where: { customerId },
      create: {
        customerId,
        ...expected,
        version: 1,
      },
      update: {
        ...expected,
        version: { increment: 1 },
      },
    });

    return account;
  }

  /**
   * Batch rebuild reward accounts for multiple customers with cursor pagination.
   */
  static async rebuildBatch(options: { batchSize?: number; cursor?: string } = {}) {
    const batchSize = options.batchSize || 100;

    const findOptions: any = {
      take: batchSize,
      orderBy: { id: 'asc' },
    };

    if (options.cursor) {
      findOptions.cursor = { id: options.cursor };
      findOptions.skip = 1;
    }

    const customers = await prisma.customer.findMany(findOptions);

    let processed = 0;
    for (const cust of customers) {
      await this.rebuildCustomerRewardAccount(cust.id);
      processed++;
    }

    return {
      processed,
      nextCursor: customers.length === batchSize ? customers[customers.length - 1].id : null,
    };
  }

  /**
   * Compare expected aggregates with stored aggregates and report mismatch if any.
   */
  static async reportMismatch(customerId: string) {
    const account = await prisma.rewardAccount.findUnique({
      where: { customerId },
    });

    const expected = await this.calculateExpectedAggregates(customerId);

    if (!account) {
      return {
        mismatch: true,
        reason: 'REWARD_ACCOUNT_MISSING',
        expected,
        actual: null,
      };
    }

    const isMismatch =
      !account.totalEstimatedCoins.equals(expected.totalEstimatedCoins) ||
      !account.totalPendingCoins.equals(expected.totalPendingCoins) ||
      !account.totalClaimableCoins.equals(expected.totalClaimableCoins) ||
      !account.totalConvertedCoins.equals(expected.totalConvertedCoins) ||
      !account.totalExpiredCoins.equals(expected.totalExpiredCoins) ||
      !account.totalReversedCoins.equals(expected.totalReversedCoins);

    return {
      mismatch: isMismatch,
      expected,
      actual: {
        totalEstimatedCoins: account.totalEstimatedCoins,
        totalPendingCoins: account.totalPendingCoins,
        totalClaimableCoins: account.totalClaimableCoins,
        totalConvertedCoins: account.totalConvertedCoins,
        totalExpiredCoins: account.totalExpiredCoins,
        totalReversedCoins: account.totalReversedCoins,
      },
    };
  }
}
