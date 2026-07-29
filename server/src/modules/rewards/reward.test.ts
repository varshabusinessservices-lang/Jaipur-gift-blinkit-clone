import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Prisma } from '@prisma/client';
import { RewardCalculationService } from './reward.calculation.service';
import { RewardConfig } from './reward.types';

describe('Batch 4: Enterprise Reward Engine Tests', () => {
  let defaultConfig: RewardConfig;

  beforeEach(() => {
    vi.clearAllMocks();

    defaultConfig = {
      rewardsEnabled: true,
      manualClaimEnabled: true,
      selfLoadedSpendEarnsRewards: true,
      onlinePaymentEarnsRewards: true,
      codEarnsRewards: true,
      refundWalletEarnsRewards: false,
      rewardCoinsPer100: new Prisma.Decimal('1.5'),
      rewardCoinValue: new Prisma.Decimal('1.5'),
      minimumEligibleSpend: new Prisma.Decimal('0.00'),
      maxRewardPerOrder: null,
      rewardCoolingDays: 3,
      rewardAutoConvertDays: 90,
      rewardExpiryDays: 90,
      campaignMultiplierEnabled: false,
      campaignMultiplier: new Prisma.Decimal('1.00'),
      excludedCategories: ['cat_excluded'],
      excludedProducts: ['prod_excluded'],
      excludedBrands: ['brand_excluded'],
    };
  });

  describe('1. Default Business Rules & Formula Calculations', () => {
    it('calculates 13.50 coins and ₹20.25 wallet value for ₹900 eligible spend', () => {
      const eligibleSpend = new Prisma.Decimal('900.00');
      const coinResult = RewardCalculationService.calculateCoins(eligibleSpend, defaultConfig);
      const walletValue = RewardCalculationService.calculateWalletValue(coinResult.coins, defaultConfig);

      expect(coinResult.coins.toString()).toBe('13.5');
      expect(walletValue.toString()).toBe('20.25');
    });

    it('uses Decimal precision for odd eligible spend amounts', () => {
      const eligibleSpend = new Prisma.Decimal('349.50');
      const coinResult = RewardCalculationService.calculateCoins(eligibleSpend, defaultConfig);
      const walletValue = RewardCalculationService.calculateWalletValue(coinResult.coins, defaultConfig);

      // (349.50 / 100) * 1.5 = 5.2425 -> 5.24 coins
      // 5.2425 * 1.5 = 7.86375 -> 7.86
      expect(coinResult.coins.toNumber()).toBeCloseTo(5.24, 2);
      expect(walletValue.toNumber()).toBeCloseTo(7.86, 2);
    });

    it('applies campaign multiplier correctly when enabled', () => {
      const config = {
        ...defaultConfig,
        campaignMultiplierEnabled: true,
        campaignMultiplier: new Prisma.Decimal('2.00'),
      };
      const eligibleSpend = new Prisma.Decimal('900.00');
      const coinResult = RewardCalculationService.calculateCoins(eligibleSpend, config);
      const walletValue = RewardCalculationService.calculateWalletValue(coinResult.coins, config);

      // 13.50 * 2 = 27.00 coins -> ₹40.50
      expect(coinResult.coins.toString()).toBe('27');
      expect(walletValue.toString()).toBe('40.5');
    });

    it('respects maximum reward per order cap', () => {
      const config = {
        ...defaultConfig,
        maxRewardPerOrder: new Prisma.Decimal('10.00'),
      };
      const eligibleSpend = new Prisma.Decimal('1000.00'); // 15 coins raw
      const coinResult = RewardCalculationService.calculateCoins(eligibleSpend, config);

      expect(coinResult.coins.toString()).toBe('10');
    });
  });

  describe('2. Eligible Spend & Fee Exclusions', () => {
    it('excludes delivery fee, express fee, platform fee, packaging fee, gift wrap, tips, and top-up from eligible spend', () => {
      const input = {
        totalOrderAmount: 1500,
        items: [
          { productId: 'p1', unitPrice: 1000, quantity: 1, totalPrice: 1000 },
        ],
        fees: {
          deliveryFee: 100,
          expressFee: 50,
          platformFee: 20,
          codFee: 30,
          packagingFee: 20,
          giftWrapFee: 50,
          tipAmount: 30,
          topUpAmount: 200,
        },
      };

      const result = RewardCalculationService.calculateEligibleSpend(input, defaultConfig);

      expect(result.eligibleSpend.toString()).toBe('1000');
      expect(result.excludedAmount.toNumber()).toBe(500); // sum of all fees (100+50+20+30+20+50+30+200)
    });

    it('excludes gift cards and donations from eligible merchandise spend', () => {
      const input = {
        items: [
          { productId: 'p1', unitPrice: 500, quantity: 1, totalPrice: 500 },
          { productId: 'gc1', unitPrice: 500, quantity: 1, totalPrice: 500, isGiftCard: true },
          { productId: 'don1', unitPrice: 100, quantity: 1, totalPrice: 100, isDonation: true },
        ],
      };

      const result = RewardCalculationService.calculateEligibleSpend(input, defaultConfig);

      expect(result.eligibleSpend.toString()).toBe('500');
      expect(result.excludedAmount.toString()).toBe('600');
    });

    it('excludes items belonging to excluded categories, products, or brands', () => {
      const input = {
        items: [
          { productId: 'p1', categoryId: 'cat_normal', unitPrice: 400, quantity: 1, totalPrice: 400 },
          { productId: 'p2', categoryId: 'cat_excluded', unitPrice: 300, quantity: 1, totalPrice: 300 },
          { productId: 'prod_excluded', categoryId: 'cat_normal', unitPrice: 200, quantity: 1, totalPrice: 200 },
          { productId: 'p3', brandId: 'brand_excluded', unitPrice: 100, quantity: 1, totalPrice: 100 },
        ],
      };

      const result = RewardCalculationService.calculateEligibleSpend(input, defaultConfig);

      expect(result.eligibleSpend.toString()).toBe('400');
      expect(result.excludedAmount.toString()).toBe('600');
    });

    it('excludes cancelled items and reduces eligible spend for refunded items', () => {
      const input = {
        items: [
          { productId: 'p1', unitPrice: 500, quantity: 1, totalPrice: 500 },
          { productId: 'p2', unitPrice: 300, quantity: 1, totalPrice: 300, status: 'CANCELLED' },
          { productId: 'p3', unitPrice: 400, quantity: 2, totalPrice: 800, refundedQuantity: 1 },
        ],
      };

      const result = RewardCalculationService.calculateEligibleSpend(input, defaultConfig);

      // p1 = 500
      // p2 = 0 (cancelled)
      // p3 = 400 (1 active qty * 400)
      // Total eligible spend = 900
      expect(result.eligibleSpend.toString()).toBe('900');
    });
  });

  describe('3. Payment Source Eligibility Rules', () => {
    it('verifies online payment earns reward', () => {
      const isEligible = RewardCalculationService.isPaymentSourceEligible('ONLINE', undefined, defaultConfig);
      expect(isEligible).toBe(true);
    });

    it('verifies self-loaded wallet spend earns reward', () => {
      const isEligible = RewardCalculationService.isPaymentSourceEligible('SELF_LOADED', 'SELF_LOADED', defaultConfig);
      expect(isEligible).toBe(true);
    });

    it('verifies reward wallet NEVER earns reward', () => {
      const isEligible = RewardCalculationService.isPaymentSourceEligible('REWARD', 'REWARD', defaultConfig);
      expect(isEligible).toBe(false);
    });

    it('verifies referral wallet NEVER earns reward', () => {
      const isEligibleReferrer = RewardCalculationService.isPaymentSourceEligible('REFERRAL', 'REFERRAL_REFERRER', defaultConfig);
      const isEligibleNewUser = RewardCalculationService.isPaymentSourceEligible('REFERRAL', 'REFERRAL_NEW_USER', defaultConfig);
      expect(isEligibleReferrer).toBe(false);
      expect(isEligibleNewUser).toBe(false);
    });

    it('verifies promotional wallet NEVER earns reward', () => {
      const isEligible = RewardCalculationService.isPaymentSourceEligible('PROMOTIONAL', 'PROMOTIONAL', defaultConfig);
      expect(isEligible).toBe(false);
    });

    it('verifies refund wallet is configurable (defaults to false)', () => {
      const defaultEligible = RewardCalculationService.isPaymentSourceEligible('REFUND', 'REFUND', defaultConfig);
      expect(defaultEligible).toBe(false);

      const customConfig = { ...defaultConfig, refundWalletEarnsRewards: true };
      const customEligible = RewardCalculationService.isPaymentSourceEligible('REFUND', 'REFUND', customConfig);
      expect(customEligible).toBe(true);
    });

    it('restricts eligible spend when paid partially with reward wallet', () => {
      const input = {
        totalOrderAmount: 1000,
        items: [{ productId: 'p1', unitPrice: 1000, quantity: 1, totalPrice: 1000 }],
        paymentSources: [
          { sourceType: 'REWARD', walletBucketType: 'REWARD', amount: 300 },
          { sourceType: 'ONLINE', amount: 700 },
        ],
      };

      const result = RewardCalculationService.calculateEligibleSpend(input, defaultConfig);

      // Only ₹700 paid via ONLINE is eligible
      expect(result.eligibleSpend.toString()).toBe('700');
    });
  });

  describe('4. Simulation Engine API Integration', () => {
    it('simulates ₹900 order with online payment returning full breakdown', async () => {
      const input = {
        totalOrderAmount: 900,
        items: [{ productId: 'p1', unitPrice: 900, quantity: 1, totalPrice: 900 }],
        paymentSources: [{ sourceType: 'ONLINE', amount: 900 }],
      };

      const simulation = await RewardCalculationService.simulateReward(input, defaultConfig);

      expect(simulation.eligibleSpend.toString()).toBe('900');
      expect(simulation.coins.toString()).toBe('13.5');
      expect(simulation.walletValue.toString()).toBe('20.25');
      expect(simulation.excludedAmount.toString()).toBe('0');
      expect(simulation.multiplier.toString()).toBe('1');
    });
  });
});
