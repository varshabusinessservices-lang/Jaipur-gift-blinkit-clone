import { PrismaClient, Prisma } from '@prisma/client';
import {
  RewardConfig,
  RewardCalculationInput,
  RewardCalculationResult,
  OrderItemCalculationInput,
  PaymentSourceAllocationInput,
} from './reward.types';

const prisma = new PrismaClient();

export class RewardCalculationService {
  /**
   * Retrieves reward configuration from WalletConfig or returns defaults.
   */
  static async getRewardConfig(customConfig?: Partial<RewardConfig>): Promise<RewardConfig> {
    const walletConfig = await prisma.walletConfig.findFirst().catch(() => null);

    const parseJsonArray = (jsonStr: string | null | undefined): string[] => {
      if (!jsonStr) return [];
      try {
        const parsed = JSON.parse(jsonStr);
        return Array.isArray(parsed) ? parsed.map((x) => String(x)) : [];
      } catch {
        return [];
      }
    };

    const defaultConfig: RewardConfig = {
      rewardsEnabled: walletConfig?.rewardsEnabled ?? true,
      manualClaimEnabled: walletConfig?.manualClaimEnabled ?? true,
      selfLoadedSpendEarnsRewards: walletConfig?.selfLoadedSpendEarnsRewards ?? true,
      onlinePaymentEarnsRewards: walletConfig?.onlinePaymentEarnsRewards ?? true,
      codEarnsRewards: walletConfig?.codEarnsRewards ?? true,
      refundWalletEarnsRewards: (walletConfig as any)?.refundWalletEarnsRewards ?? false,
      rewardCoinsPer100: new Prisma.Decimal(walletConfig?.rewardCoinsPer100?.toString() || '1.5'),
      rewardCoinValue: new Prisma.Decimal(walletConfig?.rewardCoinValue?.toString() || '1.5'),
      minimumEligibleSpend: new Prisma.Decimal((walletConfig as any)?.minimumEligibleSpend?.toString() || '0.00'),
      maxRewardPerOrder: walletConfig?.maxRewardPerOrder
        ? new Prisma.Decimal(walletConfig.maxRewardPerOrder.toString())
        : null,
      rewardCoolingDays: walletConfig?.rewardCoolingDays ?? 3,
      rewardAutoConvertDays: walletConfig?.rewardAutoConvertDays ?? 90,
      rewardExpiryDays: walletConfig?.rewardExpiryDays ?? 90,
      campaignMultiplierEnabled: (walletConfig as any)?.campaignMultiplierEnabled ?? false,
      campaignMultiplier: new Prisma.Decimal((walletConfig as any)?.campaignMultiplier?.toString() || '1.00'),
      excludedCategories: parseJsonArray((walletConfig as any)?.excludedCategoriesJson),
      excludedProducts: parseJsonArray((walletConfig as any)?.excludedProductsJson),
      excludedBrands: parseJsonArray((walletConfig as any)?.excludedBrandsJson),
      automaticConversionEnabled: (walletConfig as any)?.automaticConversionEnabled ?? true,
      claimableRewardValidityDays: (walletConfig as any)?.claimableRewardValidityDays ?? 90,
      rewardExpiryNotificationsEnabled: (walletConfig as any)?.rewardExpiryNotificationsEnabled ?? true,
      rewardExpiryReminderDaysJson: (walletConfig as any)?.rewardExpiryReminderDaysJson || '[7,3,1]',
      minimumBalanceForExpiryReminder: new Prisma.Decimal((walletConfig as any)?.minimumBalanceForExpiryReminder?.toString() || '10.00'),
      notificationChannelsJson: (walletConfig as any)?.notificationChannelsJson || '["SMS","EMAIL","IN_APP"]',
      quietHoursStart: (walletConfig as any)?.quietHoursStart ?? 22,
      quietHoursEnd: (walletConfig as any)?.quietHoursEnd ?? 8,
      customerTimezoneFallback: (walletConfig as any)?.customerTimezoneFallback || 'Asia/Kolkata',
      maxRewardNotificationsPerDay: (walletConfig as any)?.maxRewardNotificationsPerDay ?? 3,
    };

    if (!customConfig) return defaultConfig;

    return {
      ...defaultConfig,
      ...customConfig,
      rewardCoinsPer100: customConfig.rewardCoinsPer100
        ? new Prisma.Decimal(customConfig.rewardCoinsPer100.toString())
        : defaultConfig.rewardCoinsPer100,
      rewardCoinValue: customConfig.rewardCoinValue
        ? new Prisma.Decimal(customConfig.rewardCoinValue.toString())
        : defaultConfig.rewardCoinValue,
      minimumEligibleSpend: customConfig.minimumEligibleSpend
        ? new Prisma.Decimal(customConfig.minimumEligibleSpend.toString())
        : defaultConfig.minimumEligibleSpend,
      maxRewardPerOrder: customConfig.maxRewardPerOrder !== undefined
        ? (customConfig.maxRewardPerOrder ? new Prisma.Decimal(customConfig.maxRewardPerOrder.toString()) : null)
        : defaultConfig.maxRewardPerOrder,
      campaignMultiplier: customConfig.campaignMultiplier
        ? new Prisma.Decimal(customConfig.campaignMultiplier.toString())
        : defaultConfig.campaignMultiplier,
    };
  }

  /**
   * Helper to determine if a payment source/bucket is eligible to earn rewards.
   */
  static isPaymentSourceEligible(
    sourceType: string,
    bucketType: string | undefined,
    config: RewardConfig
  ): boolean {
    const srcUpper = (sourceType || '').toUpperCase();
    const bucketUpper = (bucketType || '').toUpperCase();

    // STRICT NEVER ELIGIBLE BUCKETS / SOURCES:
    // Reward wallet, Referral wallet (referrer or new user), Promotional wallet
    if (
      bucketUpper === 'REWARD' ||
      bucketUpper.startsWith('REFERRAL') ||
      bucketUpper === 'PROMOTIONAL' ||
      srcUpper === 'REWARD' ||
      srcUpper.startsWith('REFERRAL') ||
      srcUpper === 'PROMOTIONAL'
    ) {
      return false;
    }

    // Refund wallet
    if (bucketUpper === 'REFUND' || srcUpper === 'REFUND') {
      return config.refundWalletEarnsRewards;
    }

    // Self-loaded wallet
    if (bucketUpper === 'SELF_LOADED' || srcUpper === 'SELF_LOADED') {
      return config.selfLoadedSpendEarnsRewards;
    }

    // COD
    if (srcUpper === 'COD') {
      return config.codEarnsRewards;
    }

    // Online / Gateway payment (UPI, CARD, NET_BANKING, ONLINE, GATEWAY, etc.)
    return config.onlinePaymentEarnsRewards;
  }

  /**
   * Calculates eligible merchandise spend from items, fees, and payment allocations.
   */
  static calculateEligibleSpend(
    input: RewardCalculationInput,
    config: RewardConfig
  ): {
    eligibleSpend: Prisma.Decimal;
    excludedAmount: Prisma.Decimal;
    reason?: string;
    itemBreakdown: Array<{
      productId?: string;
      description?: string;
      amount: Prisma.Decimal;
      isEligible: boolean;
      exclusionReason?: string;
    }>;
  } {
    if (!config.rewardsEnabled) {
      return {
        eligibleSpend: new Prisma.Decimal('0.00'),
        excludedAmount: new Prisma.Decimal(input.totalOrderAmount?.toString() || '0.00'),
        reason: 'Rewards program is currently disabled',
        itemBreakdown: [],
      };
    }

    let merchandiseEligible = new Prisma.Decimal('0.00');
    let totalExcluded = new Prisma.Decimal('0.00');
    const itemBreakdown: Array<{
      productId?: string;
      description?: string;
      amount: Prisma.Decimal;
      isEligible: boolean;
      exclusionReason?: string;
    }> = [];

    // 1. Process items
    if (input.items && input.items.length > 0) {
      for (const item of input.items) {
        const itemUnitPrice = new Prisma.Decimal(item.unitPrice?.toString() || '0.00');
        const itemQty = item.quantity || 1;
        const itemDiscount = new Prisma.Decimal(item.discountAmount?.toString() || '0.00');
        const rawTotalPrice = item.totalPrice
          ? new Prisma.Decimal(item.totalPrice.toString())
          : itemUnitPrice.mul(itemQty).sub(itemDiscount);

        let finalItemPrice = rawTotalPrice.gt(0) ? rawTotalPrice : new Prisma.Decimal('0.00');

        // Adjust for refunded quantity / amount
        if (item.refundedAmount) {
          const refAmt = new Prisma.Decimal(item.refundedAmount.toString());
          finalItemPrice = finalItemPrice.sub(refAmt);
        } else if (item.refundedQuantity && item.refundedQuantity > 0) {
          const activeQty = Math.max(0, itemQty - item.refundedQuantity);
          finalItemPrice = itemUnitPrice.mul(activeQty);
        }

        if (finalItemPrice.lte(0) || item.status === 'CANCELLED') {
          totalExcluded = totalExcluded.plus(rawTotalPrice.gt(0) ? rawTotalPrice : new Prisma.Decimal('0.00'));
          itemBreakdown.push({
            productId: item.productId,
            amount: rawTotalPrice,
            isEligible: false,
            exclusionReason: 'Cancelled or refunded item',
          });
          continue;
        }

        // Check exclusions: Gift cards, donations, excluded products/categories/brands
        const isGiftCard = item.isGiftCard || item.productType === 'GIFT_CARD';
        const isDonation = item.isDonation || item.productType === 'DONATION';
        const isCategoryExcluded =
          item.categoryId && config.excludedCategories.includes(item.categoryId);
        const isProductExcluded =
          item.productId && config.excludedProducts.includes(item.productId);
        const isBrandExcluded =
          item.brandId && config.excludedBrands.includes(item.brandId);

        if (isGiftCard) {
          totalExcluded = totalExcluded.plus(finalItemPrice);
          itemBreakdown.push({
            productId: item.productId,
            amount: finalItemPrice,
            isEligible: false,
            exclusionReason: 'Gift cards are excluded from rewards',
          });
        } else if (isDonation) {
          totalExcluded = totalExcluded.plus(finalItemPrice);
          itemBreakdown.push({
            productId: item.productId,
            amount: finalItemPrice,
            isEligible: false,
            exclusionReason: 'Donations are excluded from rewards',
          });
        } else if (isCategoryExcluded) {
          totalExcluded = totalExcluded.plus(finalItemPrice);
          itemBreakdown.push({
            productId: item.productId,
            amount: finalItemPrice,
            isEligible: false,
            exclusionReason: 'Category is excluded from rewards',
          });
        } else if (isProductExcluded) {
          totalExcluded = totalExcluded.plus(finalItemPrice);
          itemBreakdown.push({
            productId: item.productId,
            amount: finalItemPrice,
            isEligible: false,
            exclusionReason: 'Product is excluded from rewards',
          });
        } else if (isBrandExcluded) {
          totalExcluded = totalExcluded.plus(finalItemPrice);
          itemBreakdown.push({
            productId: item.productId,
            amount: finalItemPrice,
            isEligible: false,
            exclusionReason: 'Brand is excluded from rewards',
          });
        } else {
          merchandiseEligible = merchandiseEligible.plus(finalItemPrice);
          itemBreakdown.push({
            productId: item.productId,
            amount: finalItemPrice,
            isEligible: true,
          });
        }
      }
    } else if (input.totalOrderAmount) {
      // Fallback if item list not passed directly
      merchandiseEligible = new Prisma.Decimal(input.totalOrderAmount.toString());
    }

    // 2. Non-merchandise fees are ALWAYS excluded
    if (input.fees) {
      const feesToExclude = [
        input.fees.deliveryFee,
        input.fees.expressFee,
        input.fees.platformFee,
        input.fees.codFee,
        input.fees.packagingFee,
        input.fees.giftWrapFee,
        input.fees.donationAmount,
        input.fees.tipAmount,
        input.fees.topUpAmount,
      ];

      for (const fee of feesToExclude) {
        if (fee) {
          const feeDecimal = new Prisma.Decimal(fee.toString());
          if (feeDecimal.gt(0)) {
            totalExcluded = totalExcluded.plus(feeDecimal);
          }
        }
      }
    }

    // 3. Process payment sources eligibility
    let finalEligibleSpend = merchandiseEligible;

    if (input.paymentSources && input.paymentSources.length > 0) {
      let eligiblePaidAmount = new Prisma.Decimal('0.00');
      let ineligiblePaidAmount = new Prisma.Decimal('0.00');

      for (const ps of input.paymentSources) {
        const psAmt = new Prisma.Decimal(ps.amount?.toString() || '0.00');
        if (psAmt.lte(0)) continue;

        if (this.isPaymentSourceEligible(ps.sourceType, ps.walletBucketType, config)) {
          eligiblePaidAmount = eligiblePaidAmount.plus(psAmt);
        } else {
          ineligiblePaidAmount = ineligiblePaidAmount.plus(psAmt);
        }
      }

      // Final eligible spend cannot exceed eligible paid amount
      if (finalEligibleSpend.gt(eligiblePaidAmount)) {
        const extraIneligible = finalEligibleSpend.sub(eligiblePaidAmount);
        totalExcluded = totalExcluded.plus(extraIneligible);
        finalEligibleSpend = eligiblePaidAmount;
      }
    }

    // 4. Validate minimum eligible spend threshold
    let reason: string | undefined;
    if (finalEligibleSpend.lt(config.minimumEligibleSpend)) {
      reason = `Eligible spend ₹${finalEligibleSpend.toFixed(2)} is below minimum required spend ₹${config.minimumEligibleSpend.toFixed(2)}`;
      totalExcluded = totalExcluded.plus(finalEligibleSpend);
      finalEligibleSpend = new Prisma.Decimal('0.00');
    }

    return {
      eligibleSpend: finalEligibleSpend,
      excludedAmount: totalExcluded,
      reason,
      itemBreakdown,
    };
  }

  /**
   * Calculates coins earned based on eligible spend and configuration multiplier/caps.
   */
  static calculateCoins(
    eligibleSpend: Prisma.Decimal,
    config: RewardConfig
  ): { coins: Prisma.Decimal; multiplier: Prisma.Decimal } {
    if (eligibleSpend.lte(0) || !config.rewardsEnabled) {
      return {
        coins: new Prisma.Decimal('0.00'),
        multiplier: new Prisma.Decimal('1.00'),
      };
    }

    const multiplier = config.campaignMultiplierEnabled
      ? config.campaignMultiplier
      : new Prisma.Decimal('1.00');

    // Base calculation: (eligibleSpend / 100) * rewardCoinsPer100
    const baseCoins = eligibleSpend.div(100).mul(config.rewardCoinsPer100);
    let totalCoins = baseCoins.mul(multiplier);

    // Apply maximum reward cap per order
    if (config.maxRewardPerOrder && totalCoins.gt(config.maxRewardPerOrder)) {
      totalCoins = config.maxRewardPerOrder;
    }

    // Standardize to 2 decimal places
    return {
      coins: new Prisma.Decimal(totalCoins.toFixed(2)),
      multiplier,
    };
  }

  /**
   * Calculates monetary wallet value equivalent of reward coins.
   */
  static calculateWalletValue(
    coins: Prisma.Decimal,
    config: RewardConfig
  ): Prisma.Decimal {
    if (coins.lte(0)) {
      return new Prisma.Decimal('0.00');
    }
    const val = coins.mul(config.rewardCoinValue);
    return new Prisma.Decimal(val.toFixed(2));
  }

  /**
   * Full simulation engine returning structured reward breakdown.
   */
  static async simulateReward(
    input: RewardCalculationInput,
    overrideConfig?: Partial<RewardConfig>
  ): Promise<RewardCalculationResult> {
    const config = await this.getRewardConfig(overrideConfig);
    const spendResult = this.calculateEligibleSpend(input, config);
    const coinResult = this.calculateCoins(spendResult.eligibleSpend, config);
    const walletValue = this.calculateWalletValue(coinResult.coins, config);

    return {
      eligibleSpend: spendResult.eligibleSpend,
      coins: coinResult.coins,
      walletValue,
      excludedAmount: spendResult.excludedAmount,
      multiplier: coinResult.multiplier,
      reason: spendResult.reason,
      itemBreakdown: spendResult.itemBreakdown,
    };
  }
}
