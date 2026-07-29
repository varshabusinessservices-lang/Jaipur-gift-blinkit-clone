import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WalletService } from './wallet.service';
import { WalletSlabService } from './wallet.slab.service';
import { prisma } from '../../database/prisma';

describe('WalletService & Financial Engine Comprehensive Unit Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();

    vi.spyOn(prisma.walletAccount, 'findUnique').mockResolvedValue({
      id: 'acc_1',
      customerId: 'cust_1',
      status: 'ACTIVE',
      currency: 'INR',
      cachedTotalBalance: '830.00',
      cachedAvailableBalance: '830.00',
      cachedHeldBalance: '0.00',
    } as any);

    vi.spyOn(prisma.walletAccount, 'create').mockResolvedValue({
      id: 'acc_1',
      customerId: 'cust_1',
      status: 'ACTIVE',
      currency: 'INR',
      cachedTotalBalance: '0.00',
      cachedAvailableBalance: '0.00',
      cachedHeldBalance: '0.00',
    } as any);

    vi.spyOn(prisma.walletAccount, 'update').mockResolvedValue({ id: 'acc_1' } as any);

    vi.spyOn(prisma.walletCreditLot, 'findMany').mockResolvedValue([
      {
        id: 'lot_reward_1',
        walletAccountId: 'acc_1',
        customerId: 'cust_1',
        bucketType: 'REWARD',
        originalAmount: '180.00',
        remainingAmount: '180.00',
        reservedAmount: '0.00',
        consumedAmount: '0.00',
        reversedAmount: '0.00',
        expiredAmount: '0.00',
        expiresAt: new Date('2026-12-31'),
        priority: 90,
        creditedAt: new Date('2026-01-01'),
        status: 'ACTIVE',
      },
      {
        id: 'lot_referral_1',
        walletAccountId: 'acc_1',
        customerId: 'cust_1',
        bucketType: 'REFERRAL_REFERRER',
        originalAmount: '150.00',
        remainingAmount: '150.00',
        reservedAmount: '0.00',
        consumedAmount: '0.00',
        reversedAmount: '0.00',
        expiredAmount: '0.00',
        expiresAt: new Date('2026-12-31'),
        priority: 80,
        creditedAt: new Date('2026-01-02'),
        status: 'ACTIVE',
      },
      {
        id: 'lot_self_1',
        walletAccountId: 'acc_1',
        customerId: 'cust_1',
        bucketType: 'SELF_LOADED',
        originalAmount: '500.00',
        remainingAmount: '500.00',
        reservedAmount: '0.00',
        consumedAmount: '0.00',
        reversedAmount: '0.00',
        expiredAmount: '0.00',
        expiresAt: null,
        priority: 50,
        creditedAt: new Date('2026-01-03'),
        status: 'ACTIVE',
      },
    ] as any);

    vi.spyOn(prisma.walletCreditLot, 'findUnique').mockImplementation((({ where }: any) => {
      if (where.id === 'lot_reward_1') {
        return Promise.resolve({
          id: 'lot_reward_1',
          walletAccountId: 'acc_1',
          customerId: 'cust_1',
          originalAmount: '180.00',
          remainingAmount: '180.00',
          reservedAmount: '0.00',
          consumedAmount: '0.00',
          reversedAmount: '0.00',
          expiredAmount: '0.00',
          status: 'ACTIVE',
        } as any);
      }
      return Promise.resolve({
        id: where.id,
        walletAccountId: 'acc_1',
        customerId: 'cust_1',
        originalAmount: '500.00',
        remainingAmount: '500.00',
        reservedAmount: '0.00',
        consumedAmount: '0.00',
        reversedAmount: '0.00',
        expiredAmount: '0.00',
        status: 'ACTIVE',
      } as any);
    }) as any);

    vi.spyOn(prisma.walletCreditLot, 'create').mockResolvedValue({ id: 'lot_created' } as any);
    vi.spyOn(prisma.walletCreditLot, 'update').mockResolvedValue({ id: 'lot_updated' } as any);

    vi.spyOn(prisma.walletUsageSlab, 'count').mockResolvedValue(5);

    vi.spyOn(prisma.walletUsageSlab, 'findMany').mockResolvedValue([
      {
        id: 'slab_4',
        name: 'Tier 4 (999+)',
        minOrderValue: '999.00',
        maxOrderValue: null,
        maxPromotionalPct: '100.00',
        isActive: true,
      },
      {
        id: 'slab_3',
        name: 'Tier 3 (799-998.99)',
        minOrderValue: '799.00',
        maxOrderValue: '998.99',
        maxPromotionalPct: '50.00',
        isActive: true,
      },
      {
        id: 'slab_2',
        name: 'Tier 2 (499-798.99)',
        minOrderValue: '499.00',
        maxOrderValue: '798.99',
        maxPromotionalPct: '40.00',
        isActive: true,
      },
      {
        id: 'slab_1',
        name: 'Tier 1 (299-498.99)',
        minOrderValue: '299.00',
        maxOrderValue: '498.99',
        maxPromotionalPct: '20.00',
        isActive: true,
      },
      {
        id: 'slab_0',
        name: 'Tier 0 (Below 299)',
        minOrderValue: '0.00',
        maxOrderValue: '289.99',
        maxPromotionalPct: '0.00',
        isActive: true,
      },
    ] as any);

    vi.spyOn(prisma.walletConfig, 'findFirst').mockResolvedValue({ defaultReservationMinutes: 15 } as any);

    vi.spyOn(prisma.walletReservation, 'create').mockResolvedValue({ id: 'res_1', walletAccountId: 'acc_1', status: 'ACTIVE' } as any);
    vi.spyOn(prisma.walletReservation, 'update').mockResolvedValue({ id: 'res_1', status: 'CONSUMED' } as any);
    vi.spyOn(prisma.walletReservation, 'findUnique').mockResolvedValue({
      id: 'res_1',
      walletAccountId: 'acc_1',
      customerId: 'cust_1',
      status: 'ACTIVE',
      allocations: [
        {
          id: 'res_alloc_1',
          walletCreditLotId: 'lot_reward_1',
          amount: '180.00',
          creditLot: {
            id: 'lot_reward_1',
            bucketType: 'REWARD',
            originalAmount: '180.00',
            remainingAmount: '0.00',
            reservedAmount: '180.00',
            consumedAmount: '0.00',
            reversedAmount: '0.00',
            expiredAmount: '0.00',
          },
        },
      ],
    } as any);

    vi.spyOn(prisma.walletReservationAllocation, 'create').mockResolvedValue({ id: 'res_alloc_1' } as any);
    vi.spyOn(prisma.walletReservationAllocation, 'update').mockResolvedValue({ id: 'res_alloc_1' } as any);

    vi.spyOn(prisma.orderPaymentAllocation, 'create').mockResolvedValue({ id: 'ord_alloc_1' } as any);

    vi.spyOn(prisma.walletLedgerEntry, 'create').mockResolvedValue({ id: 'ledger_1' } as any);
    vi.spyOn(prisma.walletLedgerEntry, 'findUnique').mockResolvedValue(null as any);
    vi.spyOn(prisma.walletLedgerEntry, 'findFirst').mockResolvedValue(null as any);

    vi.spyOn(prisma, '$transaction').mockImplementation(async (cb: any) => cb(prisma));
  });

  describe('FEFO Engine & Priority Sorting', () => {
    it('should sort lots by earliest expiresAt first, then priority, then creditedAt, then UUID', () => {
      const lots = [
        { id: 'uuid-b', expiresAt: new Date('2026-12-31'), bucketType: 'PROMOTIONAL', creditedAt: new Date('2026-01-01') },
        { id: 'uuid-a', expiresAt: new Date('2026-06-30'), bucketType: 'SELF_LOADED', creditedAt: new Date('2026-01-01') },
        { id: 'uuid-c', expiresAt: null, bucketType: 'REWARD', creditedAt: new Date('2026-01-01') },
      ];

      const sorted = WalletService.sortLotsFEFO(lots as any);
      expect(sorted[0].id).toBe('uuid-a'); // June 2026
      expect(sorted[1].id).toBe('uuid-b'); // Dec 2026
      expect(sorted[2].id).toBe('uuid-c'); // Null expiry
    });
  });

  describe('Checkout Allocation Engine Scenarios', () => {
    it('Scenario 699 allocation: Reward=180, Referral=150, SelfLoaded=500 -> Promo=279.60, SelfLoaded=419.40, External=0', async () => {
      const allocation = await WalletService.calculateCheckoutAllocation({
        customerId: 'cust_1',
        subtotal: 699,
      });

      expect(allocation.eligibleOrderValue).toBe(699);
      expect(allocation.maxPromotionalAllowed).toBe(279.6);
      expect(allocation.usedAmounts.reward).toBe(180);
      expect(allocation.usedAmounts.referral).toBe(99.6);
      expect(allocation.usedAmounts.selfLoaded).toBe(419.4);
      expect(allocation.usedAmounts.totalWallet).toBe(699);
      expect(allocation.externalAmount).toBe(0);
    });

    it('Scenario 399 allocation: 20% slab cap -> Promo=79.80', async () => {
      const allocation = await WalletService.calculateCheckoutAllocation({
        customerId: 'cust_1',
        subtotal: 399,
      });

      expect(allocation.eligibleOrderValue).toBe(399);
      expect(allocation.maxPromotionalAllowed).toBe(79.8);
      expect(allocation.usedAmounts.reward).toBe(79.8);
      expect(allocation.usedAmounts.selfLoaded).toBe(319.2);
      expect(allocation.externalAmount).toBe(0);
    });

    it('Scenario 999 allocation: 100% slab cap', async () => {
      const allocation = await WalletService.calculateCheckoutAllocation({
        customerId: 'cust_1',
        subtotal: 999,
      });

      expect(allocation.eligibleOrderValue).toBe(999);
      expect(allocation.maxPromotionalAllowed).toBe(999);
      expect(allocation.usedAmounts.reward).toBe(180);
      expect(allocation.usedAmounts.referral).toBe(150);
      expect(allocation.usedAmounts.selfLoaded).toBe(500);
      expect(allocation.usedAmounts.totalWallet).toBe(830);
      expect(allocation.externalAmount).toBe(169);
    });

    it('Boundary 299: 20% slab cap (₹59.80 max promo)', async () => {
      const allocation = await WalletService.calculateCheckoutAllocation({
        customerId: 'cust_1',
        subtotal: 299,
      });

      expect(allocation.maxPromotionalAllowed).toBe(59.8);
      expect(allocation.usedAmounts.reward).toBe(59.8);
    });

    it('Boundary 499: 40% slab cap (₹199.60 max promo)', async () => {
      const allocation = await WalletService.calculateCheckoutAllocation({
        customerId: 'cust_1',
        subtotal: 499,
      });

      expect(allocation.maxPromotionalAllowed).toBe(199.6);
    });

    it('Boundary 799: 50% slab cap (₹399.50 max promo)', async () => {
      const allocation = await WalletService.calculateCheckoutAllocation({
        customerId: 'cust_1',
        subtotal: 799,
      });

      expect(allocation.maxPromotionalAllowed).toBe(399.5);
    });
  });

  describe('First Order Override', () => {
    it('First order with REFERRAL_NEW_USER lot allows full ₹100 override on 399 order', async () => {
      vi.mocked(prisma.walletCreditLot.findMany).mockResolvedValueOnce([
        {
          id: 'lot_new_user',
          walletAccountId: 'acc_1',
          bucketType: 'REFERRAL_NEW_USER',
          originalAmount: '100.00',
          remainingAmount: '100.00',
          reservedAmount: '0.00',
          consumedAmount: '0.00',
          reversedAmount: '0.00',
          expiredAmount: '0.00',
          firstOrderOnly: true,
          expiresAt: null,
          priority: 100,
          creditedAt: new Date(),
          status: 'ACTIVE',
        },
      ] as any);

      const allocation = await WalletService.calculateCheckoutAllocation({
        customerId: 'cust_1',
        subtotal: 399,
        isFirstOrder: true,
      });

      expect(allocation.firstOrderOverrideApplied).toBe(true);
      expect(allocation.maxPromotionalAllowed).toBe(100);
      expect(allocation.usedAmounts.referral).toBe(100);
    });
  });

  describe('Reservation Engine, Consume, Release & Idempotency', () => {
    it('createReservation should lock credit lots and validate invariants', async () => {
      const reservation = await WalletService.createReservation({
        customerId: 'cust_1',
        checkoutSessionId: 'sess_123',
        subtotal: 699,
      });

      expect(reservation).toBeDefined();
      expect(prisma.walletReservation.create).toHaveBeenCalled();
      expect(prisma.walletCreditLot.update).toHaveBeenCalled();
    });

    it('consumeReservation should update lot consumed amount and create ledger entries', async () => {
      const result: any = await WalletService.consumeReservation('res_1', 'order_999', 'cust_1');

      expect(result.success).toBe(true);
      expect(prisma.walletReservation.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'res_1' },
          data: expect.objectContaining({ status: 'CONSUMED', orderId: 'order_999' }),
        })
      );
    });

    it('releaseReservation should restore reserved balances back to remaining amount', async () => {
      vi.mocked(prisma.walletReservation.findUnique).mockResolvedValueOnce({
        id: 'res_1',
        walletAccountId: 'acc_1',
        status: 'ACTIVE',
        allocations: [
          {
            id: 'alloc_1',
            walletCreditLotId: 'lot_reward_1',
            amount: '180.00',
          },
        ],
      } as any);

      await WalletService.releaseReservation('res_1', 'Payment Failed');

      expect(prisma.walletReservation.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'res_1' },
          data: expect.objectContaining({ status: 'RELEASED' }),
        })
      );
    });

    it('Duplicate consume should be idempotent', async () => {
      vi.mocked(prisma.walletLedgerEntry.findFirst).mockResolvedValueOnce({
        id: 'existing_ledger',
      } as any);

      const result: any = await WalletService.consumeReservation('res_1', 'order_999', 'cust_1', 'key_123');
      expect(result.idempotencyReplay).toBe(true);
    });
  });

  describe('Full Wallet Payment & Simulation', () => {
    it('createFullWalletPayment should complete atomically when wallet covers 100%', async () => {
      vi.mocked(prisma.walletCreditLot.findMany).mockResolvedValueOnce([
        {
          id: 'lot_self_large',
          walletAccountId: 'acc_1',
          bucketType: 'SELF_LOADED',
          originalAmount: '1000.00',
          remainingAmount: '1000.00',
          reservedAmount: '0.00',
          consumedAmount: '0.00',
          reversedAmount: '0.00',
          expiredAmount: '0.00',
          expiresAt: null,
          priority: 50,
          creditedAt: new Date(),
          status: 'ACTIVE',
        },
      ] as any);

      const result = await WalletService.createFullWalletPayment({
        customerId: 'cust_1',
        checkoutSessionId: 'sess_full',
        orderId: 'order_full_1',
        subtotal: 500,
      });

      expect(result.success).toBe(true);
      expect(result.orderId).toBe('order_full_1');
    });

    it('WalletSlabService.simulate should produce exact allocation in-memory', () => {
      const result = WalletSlabService.simulate({
        subtotal: 699,
        walletBalances: {
          reward: 180,
          referral: 150,
          promotional: 0,
          refund: 0,
          selfLoaded: 500,
        },
      });

      expect(result.eligibleOrderValue).toBe(699);
      expect(result.usedAmounts.reward).toBe(180);
      expect(result.usedAmounts.referral).toBe(99.6);
      expect(result.usedAmounts.selfLoaded).toBe(419.4);
      expect(result.externalAmount).toBe(0);
    });
  });
});
