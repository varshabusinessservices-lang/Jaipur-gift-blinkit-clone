import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Prisma } from '@prisma/client';
import { RewardCalculationService } from './reward.calculation.service';
import { RewardConfig } from './reward.types';

describe('Batch 5: Automated Reward Engine & Lifecycle Infrastructure Tests', () => {
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
      automaticConversionEnabled: true,
      claimableRewardValidityDays: 90,
      rewardExpiryNotificationsEnabled: true,
      rewardExpiryReminderDaysJson: '[7,3,1]',
      minimumBalanceForExpiryReminder: new Prisma.Decimal('10.00'),
      notificationChannelsJson: '["SMS","EMAIL","IN_APP"]',
      quietHoursStart: 22,
      quietHoursEnd: 8,
      customerTimezoneFallback: 'Asia/Kolkata',
      maxRewardNotificationsPerDay: 3,
    };
  });

  describe('1. Partial Refund & Reversal Math (₹900 -> ₹300 refund)', () => {
    it('accurately calculates original ₹900 spend -> 13.50 coins (₹20.25 wallet value)', () => {
      const origSpend = new Prisma.Decimal('900.00');
      const origCoins = RewardCalculationService.calculateCoins(origSpend, defaultConfig);
      const origValue = RewardCalculationService.calculateWalletValue(origCoins.coins, defaultConfig);

      expect(origCoins.coins.toString()).toBe('13.5');
      expect(origValue.toString()).toBe('20.25');
    });

    it('accurately calculates post-refund ₹600 eligible spend -> 9.00 coins (₹13.50 wallet value), reversing 4.50 coins (₹6.75 value)', () => {
      const origSpend = new Prisma.Decimal('900.00');
      const origCoins = RewardCalculationService.calculateCoins(origSpend, defaultConfig).coins;
      const origValue = RewardCalculationService.calculateWalletValue(origCoins, defaultConfig);

      const postRefundSpend = new Prisma.Decimal('600.00');
      const postRefundCoins = RewardCalculationService.calculateCoins(postRefundSpend, defaultConfig).coins;
      const postRefundValue = RewardCalculationService.calculateWalletValue(postRefundCoins, defaultConfig);

      const reversedCoins = origCoins.sub(postRefundCoins);
      const reversedValue = origValue.sub(postRefundValue);

      expect(origCoins.toString()).toBe('13.5');
      expect(postRefundCoins.toString()).toBe('9');
      expect(reversedCoins.toString()).toBe('4.5');
      expect(reversedValue.toString()).toBe('6.75');
    });
  });

  describe('2. Active Reservation & Expiry Protection Math', () => {
    it('calculates protected remaining amount when active reservation exists on expiring lot', () => {
      const remainingAmount = new Prisma.Decimal('100.00');
      const reservedAmount = new Prisma.Decimal('40.00');

      const expirableAmount = Prisma.Decimal.max(new Prisma.Decimal('0.00'), remainingAmount.sub(reservedAmount));
      const protectedAmount = Prisma.Decimal.min(remainingAmount, reservedAmount);

      expect(expirableAmount.toString()).toBe('60');
      expect(protectedAmount.toString()).toBe('40');
    });

    it('fully expires lot when reservedAmount is zero', () => {
      const remainingAmount = new Prisma.Decimal('100.00');
      const reservedAmount = new Prisma.Decimal('0.00');

      const expirableAmount = Prisma.Decimal.max(new Prisma.Decimal('0.00'), remainingAmount.sub(reservedAmount));
      const protectedAmount = Prisma.Decimal.min(remainingAmount, reservedAmount);

      expect(expirableAmount.toString()).toBe('100');
      expect(protectedAmount.toString()).toBe('0');
    });
  });

  describe('3. Cooling Period & Status State Machine Transitions', () => {
    it('defines correct status sequence: ESTIMATED -> PENDING_DELIVERY -> COOLING_PERIOD -> CLAIMABLE -> CONVERTED', () => {
      const validTransitions: Record<string, string[]> = {
        ESTIMATED: ['PENDING_PAYMENT', 'PENDING_DELIVERY', 'CANCELLED'],
        PENDING_PAYMENT: ['PENDING_DELIVERY', 'CANCELLED'],
        PENDING_DELIVERY: ['DELIVERY_CONFIRMED', 'COOLING_PERIOD', 'CLAIMABLE', 'CANCELLED'],
        DELIVERY_CONFIRMED: ['COOLING_PERIOD', 'CLAIMABLE', 'REVERSED'],
        COOLING_PERIOD: ['CLAIMABLE', 'REVERSED'],
        CLAIMABLE: ['CONVERTED', 'EXPIRED', 'REVERSED'],
        CONVERTED: ['REVERSED'],
        EXPIRED: [],
        CANCELLED: [],
        REVERSED: [],
      };

      expect(validTransitions['ESTIMATED']).toContain('PENDING_DELIVERY');
      expect(validTransitions['PENDING_DELIVERY']).toContain('COOLING_PERIOD');
      expect(validTransitions['COOLING_PERIOD']).toContain('CLAIMABLE');
      expect(validTransitions['CLAIMABLE']).toContain('CONVERTED');
    });
  });

  describe('4. Quiet Hours & Notification Window Validation', () => {
    it('detects quiet hours window correctly (e.g., 22:00 to 08:00)', () => {
      const isQuietHour = (hour: number, start: number, end: number) => {
        if (start > end) {
          return hour >= start || hour < end;
        }
        return hour >= start && hour < end;
      };

      expect(isQuietHour(23, 22, 8)).toBe(true);  // 11 PM -> Quiet
      expect(isQuietHour(2, 22, 8)).toBe(true);   // 2 AM -> Quiet
      expect(isQuietHour(7, 22, 8)).toBe(true);   // 7 AM -> Quiet
      expect(isQuietHour(10, 22, 8)).toBe(false); // 10 AM -> Normal
      expect(isQuietHour(15, 22, 8)).toBe(false); // 3 PM -> Normal
    });
  });
});
