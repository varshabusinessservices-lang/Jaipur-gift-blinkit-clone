import { Prisma } from '@prisma/client';
import { prisma } from '../../database/prisma';

export class WalletSlabService {
  /**
   * Ensure default slabs exist in database if table is empty
   */
  static async ensureDefaultSlabs(): Promise<void> {
    try {
      const count = await prisma.walletUsageSlab.count();
      if (count === 0) {
        await prisma.walletUsageSlab.createMany({
          data: [
            {
              name: 'Tier 0 (Below 299)',
              minOrderValue: new Prisma.Decimal('0.00'),
              maxOrderValue: new Prisma.Decimal('289.99'),
              maxPromotionalPct: new Prisma.Decimal('0.00'),
              priority: 0,
              isActive: true,
            },
            {
              name: 'Tier 1 (299-498.99)',
              minOrderValue: new Prisma.Decimal('299.00'),
              maxOrderValue: new Prisma.Decimal('498.99'),
              maxPromotionalPct: new Prisma.Decimal('20.00'),
              priority: 10,
              isActive: true,
            },
            {
              name: 'Tier 2 (499-798.99)',
              minOrderValue: new Prisma.Decimal('499.00'),
              maxOrderValue: new Prisma.Decimal('798.99'),
              maxPromotionalPct: new Prisma.Decimal('40.00'),
              priority: 20,
              isActive: true,
            },
            {
              name: 'Tier 3 (799-998.99)',
              minOrderValue: new Prisma.Decimal('799.00'),
              maxOrderValue: new Prisma.Decimal('998.99'),
              maxPromotionalPct: new Prisma.Decimal('50.00'),
              priority: 30,
              isActive: true,
            },
            {
              name: 'Tier 4 (999+)',
              minOrderValue: new Prisma.Decimal('999.00'),
              maxOrderValue: null,
              maxPromotionalPct: new Prisma.Decimal('100.00'),
              priority: 40,
              isActive: true,
            },
          ],
        });
      }
    } catch (err) {
      // Ignored if DB connection not present in offline unit tests
    }
  }

  /**
   * Get all active slabs ordered by minOrderValue descending
   */
  static async getActiveSlabs() {
    await this.ensureDefaultSlabs();
    return await prisma.walletUsageSlab.findMany({
      where: {
        isActive: true,
        AND: [
          { OR: [{ startDate: null }, { startDate: { lte: new Date() } }] },
          { OR: [{ endDate: null }, { endDate: { gte: new Date() } }] },
        ],
      },
      orderBy: [{ minOrderValue: 'desc' }, { priority: 'desc' }],
    });
  }

  /**
   * Find applicable slab for a given eligible order value
   */
  static async getApplicableSlab(eligibleOrderValue: number | Prisma.Decimal) {
    const val = new Prisma.Decimal(eligibleOrderValue.toString());
    const slabs = await this.getActiveSlabs();

    for (const slab of slabs) {
      const minVal = new Prisma.Decimal(slab.minOrderValue.toString());
      if (val.gte(minVal)) {
        if (!slab.maxOrderValue) {
          return slab;
        }
        const maxVal = new Prisma.Decimal(slab.maxOrderValue.toString());
        if (val.lte(maxVal)) {
          return slab;
        }
      }
    }
    return null;
  }

  /**
   * Calculate promotional spending limit based on eligible order value
   */
  static async calculatePromotionalLimit(eligibleOrderValue: number | Prisma.Decimal) {
    const val = new Prisma.Decimal(eligibleOrderValue.toString());
    const slab = await this.getApplicableSlab(val);

    if (!slab) {
      return { slab: null, promoLimit: new Prisma.Decimal('0.00') };
    }

    const pct = new Prisma.Decimal(slab.maxPromotionalPct.toString());
    let limit = val.times(pct).dividedBy(new Prisma.Decimal('100.00'));

    if (slab.fixedPromotionalCap) {
      const cap = new Prisma.Decimal(slab.fixedPromotionalCap.toString());
      if (limit.gt(cap)) {
        limit = cap;
      }
    }

    return {
      slab,
      promoLimit: limit,
    };
  }

  /**
   * Validate slab inputs before saving
   */
  static validateSlab(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
      errors.push('Slab name is required');
    }

    const minOrder = Number(data.minOrderValue);
    if (isNaN(minOrder) || minOrder < 0) {
      errors.push('Minimum order value must be a non-negative number');
    }

    if (data.maxOrderValue !== undefined && data.maxOrderValue !== null) {
      const maxOrder = Number(data.maxOrderValue);
      if (isNaN(maxOrder) || maxOrder < minOrder) {
        errors.push('Maximum order value must be greater than or equal to minimum order value');
      }
    }

    const pct = Number(data.maxPromotionalPct);
    if (isNaN(pct) || pct < 0 || pct > 100) {
      errors.push('Promotional percentage must be between 0 and 100');
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Simulate allocation purely in-memory
   */
  static simulate(params: {
    subtotal: number;
    discount?: number;
    coupon?: number;
    excludedAmount?: number;
    walletBalances: {
      reward: number;
      referral: number;
      promotional: number;
      refund: number;
      selfLoaded: number;
    };
    isFirstOrder?: boolean;
    firstOrderOverrideAmount?: number;
  }) {
    const subtotal = new Prisma.Decimal((params.subtotal || 0).toFixed(2));
    const discount = new Prisma.Decimal((params.discount || 0).toFixed(2));
    const coupon = new Prisma.Decimal((params.coupon || 0).toFixed(2));
    const excluded = new Prisma.Decimal((params.excludedAmount || 0).toFixed(2));

    const eligibleOrderValue = Prisma.Decimal.max(
      new Prisma.Decimal('0.00'),
      subtotal.minus(discount).minus(coupon).minus(excluded)
    );

    const eligibleNum = eligibleOrderValue.toNumber();

    // Default slab rules calculation if in memory:
    let maxPromoPct = 0;
    let slabName = 'Below 299 (0%)';
    if (eligibleNum >= 999) {
      maxPromoPct = 100;
      slabName = '999+ (100%)';
    } else if (eligibleNum >= 799) {
      maxPromoPct = 50;
      slabName = '799-998.99 (50%)';
    } else if (eligibleNum >= 499) {
      maxPromoPct = 40;
      slabName = '499-798.99 (40%)';
    } else if (eligibleNum >= 299) {
      maxPromoPct = 20;
      slabName = '299-498.99 (20%)';
    }

    let slabPromoLimit = eligibleOrderValue.times(maxPromoPct).dividedBy(100);

    // Check first order override
    let firstOrderOverrideUsed = new Prisma.Decimal('0.00');
    if (params.isFirstOrder && params.firstOrderOverrideAmount && params.firstOrderOverrideAmount > 0) {
      firstOrderOverrideUsed = Prisma.Decimal.min(
        new Prisma.Decimal(params.firstOrderOverrideAmount.toFixed(2)),
        eligibleOrderValue
      );
    }

    const effectivePromoCap = Prisma.Decimal.max(slabPromoLimit, firstOrderOverrideUsed);

    // Consume in priority order:
    // 1. REWARD
    // 2. REFERRAL
    // 3. PROMOTIONAL
    // 4. REFUND
    // 5. SELF_LOADED
    let remainingPromoCap = effectivePromoCap;
    let remainingOrderValue = eligibleOrderValue;

    const rewardAvail = new Prisma.Decimal((params.walletBalances.reward || 0).toFixed(2));
    const rewardUsed = Prisma.Decimal.min(rewardAvail, remainingPromoCap, remainingOrderValue);
    remainingPromoCap = remainingPromoCap.minus(rewardUsed);
    remainingOrderValue = remainingOrderValue.minus(rewardUsed);

    const referralAvail = new Prisma.Decimal((params.walletBalances.referral || 0).toFixed(2));
    const referralUsed = Prisma.Decimal.min(referralAvail, remainingPromoCap, remainingOrderValue);
    remainingPromoCap = remainingPromoCap.minus(referralUsed);
    remainingOrderValue = remainingOrderValue.minus(referralUsed);

    const promoAvail = new Prisma.Decimal((params.walletBalances.promotional || 0).toFixed(2));
    const promoUsed = Prisma.Decimal.min(promoAvail, remainingPromoCap, remainingOrderValue);
    remainingPromoCap = remainingPromoCap.minus(promoUsed);
    remainingOrderValue = remainingOrderValue.minus(promoUsed);

    // Non-promotional buckets:
    const refundAvail = new Prisma.Decimal((params.walletBalances.refund || 0).toFixed(2));
    const refundUsed = Prisma.Decimal.min(refundAvail, remainingOrderValue);
    remainingOrderValue = remainingOrderValue.minus(refundUsed);

    const selfLoadedAvail = new Prisma.Decimal((params.walletBalances.selfLoaded || 0).toFixed(2));
    const selfLoadedUsed = Prisma.Decimal.min(selfLoadedAvail, remainingOrderValue);
    remainingOrderValue = remainingOrderValue.minus(selfLoadedUsed);

    const totalWalletUsed = rewardUsed
      .plus(referralUsed)
      .plus(promoUsed)
      .plus(refundUsed)
      .plus(selfLoadedUsed);

    const totalOrder = subtotal; // Assuming total order is subtotal minus discounts + excluded
    const totalOrderPayable = subtotal.minus(discount).minus(coupon);
    const externalAmount = Prisma.Decimal.max(new Prisma.Decimal('0.00'), totalOrderPayable.minus(totalWalletUsed));

    return {
      eligibleOrderValue: eligibleOrderValue.toNumber(),
      appliedSlab: slabName,
      maxPromotionalPct: maxPromoPct,
      effectivePromotionalCap: effectivePromoCap.toNumber(),
      usedAmounts: {
        reward: rewardUsed.toNumber(),
        referral: referralUsed.toNumber(),
        promotional: promoUsed.toNumber(),
        refund: refundUsed.toNumber(),
        selfLoaded: selfLoadedUsed.toNumber(),
        totalWallet: totalWalletUsed.toNumber(),
      },
      externalAmount: externalAmount.toNumber(),
    };
  }

  /**
   * Admin CRUD methods
   */
  static async getAllSlabs() {
    await this.ensureDefaultSlabs();
    return await prisma.walletUsageSlab.findMany({
      orderBy: [{ priority: 'desc' }, { minOrderValue: 'asc' }],
    });
  }

  static async createSlab(data: any) {
    const validation = this.validateSlab(data);
    if (!validation.valid) {
      throw new Error(`Invalid slab configuration: ${validation.errors.join(', ')}`);
    }

    return await prisma.walletUsageSlab.create({
      data: {
        name: data.name,
        customerGroup: data.customerGroup,
        minOrderValue: new Prisma.Decimal(data.minOrderValue.toString()),
        maxOrderValue: data.maxOrderValue ? new Prisma.Decimal(data.maxOrderValue.toString()) : null,
        maxPromotionalPct: new Prisma.Decimal(data.maxPromotionalPct.toString()),
        fixedPromotionalCap: data.fixedPromotionalCap ? new Prisma.Decimal(data.fixedPromotionalCap.toString()) : null,
        applicableBuckets: data.applicableBuckets || 'REWARD,REFERRAL_REFERRER,REFERRAL_NEW_USER,PROMOTIONAL',
        firstOrderOverride: Boolean(data.firstOrderOverride),
        couponCompatible: data.couponCompatible !== undefined ? Boolean(data.couponCompatible) : true,
        priority: data.priority ? Number(data.priority) : 0,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
      },
    });
  }

  static async updateSlab(id: string, data: any) {
    return await prisma.walletUsageSlab.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.customerGroup !== undefined && { customerGroup: data.customerGroup }),
        ...(data.minOrderValue !== undefined && { minOrderValue: new Prisma.Decimal(data.minOrderValue.toString()) }),
        ...(data.maxOrderValue !== undefined && {
          maxOrderValue: data.maxOrderValue ? new Prisma.Decimal(data.maxOrderValue.toString()) : null,
        }),
        ...(data.maxPromotionalPct !== undefined && {
          maxPromotionalPct: new Prisma.Decimal(data.maxPromotionalPct.toString()),
        }),
        ...(data.fixedPromotionalCap !== undefined && {
          fixedPromotionalCap: data.fixedPromotionalCap ? new Prisma.Decimal(data.fixedPromotionalCap.toString()) : null,
        }),
        ...(data.isActive !== undefined && { isActive: Boolean(data.isActive) }),
        ...(data.priority !== undefined && { priority: Number(data.priority) }),
      },
    });
  }

  static async deleteSlab(id: string) {
    return await prisma.walletUsageSlab.delete({
      where: { id },
    });
  }
}
