import { describe, it, expect, vi, beforeEach } from 'vitest';
import { rupeesToPaise, paiseToRupees, RazorpayPaymentGatewayService } from '../payments/payment.gateway.service';
import { WalletService } from './wallet.service';
import { PaymentRefundService } from '../payments/payment.refund.service';
import { PaymentWebhookService } from '../payments/payment.webhook.service';

vi.mock('../../database/prisma', () => {
  const mockPrisma: any = {
    walletAccount: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    walletTopUp: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    paymentWebhookEvent: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    paymentDispute: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    walletCreditLot: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    walletLedgerEntry: {
      findUnique: vi.fn().mockResolvedValue(null),
      create: vi.fn(),
    },
    $transaction: vi.fn((cb) => cb(mockPrisma)),
    order: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    orderPaymentAllocation: {
      update: vi.fn(),
    },
    orderRefund: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    refundAllocation: {
      create: vi.fn(),
    },
    walletUsageSlab: {
      count: vi.fn().mockResolvedValue(1),
    },
  };
  return { prisma: mockPrisma };
});

import { prisma } from '../../database/prisma';

describe('Batch 3: Payment Gateway & Money Utility Tests', () => {
  it('converts rupees to paise and vice versa accurately', () => {
    expect(rupeesToPaise(499.00)).toBe(49900);
    expect(rupeesToPaise('123.45')).toBe(12345);
    expect(paiseToRupees(49900)).toBe('499.00');
    expect(paiseToRupees(12345)).toBe('123.45');
  });

  it('verifies signatures correctly in mock mode', () => {
    const gateway = new RazorpayPaymentGatewayService();
    expect(gateway.isMockMode()).toBe(true);

    const validCheckout = gateway.verifyCheckoutSignature({
      orderId: 'order_123',
      paymentId: 'pay_123',
      signature: 'mock_valid_signature',
    });
    expect(validCheckout).toBe(true);

    const validWebhook = gateway.verifyWebhookSignature('{"event":"payment.captured"}', 'mock_valid_webhook_signature');
    expect(validWebhook).toBe(true);
  });
});

describe('Batch 3: Wallet Top-Up Verification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects top-up when unverified mobile', async () => {
    await expect(
      WalletService.createWalletTopUp({
        customerId: 'cust_123',
        amount: 500,
        isVerifiedMobile: false,
      })
    ).rejects.toThrow('Verified mobile number is required for wallet top-up');
  });

  it('rejects top-up below minimum limit', async () => {
    await expect(
      WalletService.createWalletTopUp({
        customerId: 'cust_123',
        amount: 50,
        isVerifiedMobile: true,
      })
    ).rejects.toThrow('Minimum top-up amount');
  });

  it('creates wallet top-up and Razorpay order successfully', async () => {
    (prisma.walletAccount.findUnique as any).mockResolvedValue({
      id: 'acc_123',
      customerId: 'cust_123',
      status: 'ACTIVE',
      cachedTotalBalance: '0.00',
    });
    (prisma.walletTopUp.findMany as any).mockResolvedValue([]);
    (prisma.walletTopUp.create as any).mockResolvedValue({
      id: 'topup_123',
      customerId: 'cust_123',
      amount: '500.00',
      status: 'CREATED',
      gateway: 'RAZORPAY',
    });
    (prisma.walletTopUp.update as any).mockResolvedValue({
      id: 'topup_123',
      gatewayOrderId: 'order_mock_123',
      status: 'PAYMENT_PENDING',
    });

    const result = await WalletService.createWalletTopUp({
      customerId: 'cust_123',
      amount: 500,
      isVerifiedMobile: true,
    });

    expect(result.walletTopUpId).toBe('topup_123');
    expect(result.amount).toBe(500);
    expect(result.gateway).toBe('RAZORPAY');
    expect(result.paymentStatus).toBe('PAYMENT_PENDING');
  });
});

describe('Batch 3: Webhook Processing', () => {
  it('processes payment.captured webhook idempotently', async () => {
    (prisma.paymentWebhookEvent.findUnique as any).mockResolvedValue(null);
    (prisma.paymentWebhookEvent.create as any).mockResolvedValue({
      id: 'evt_123',
      status: 'PROCESSING',
      attempts: 1,
    });

    (prisma.walletTopUp.findUnique as any).mockResolvedValue({
      id: 'topup_123',
      customerId: 'cust_123',
      amount: '500.00',
      status: 'PAYMENT_PENDING',
    });

    (prisma.walletAccount.findUnique as any).mockResolvedValue({
      id: 'acc_123',
      customerId: 'cust_123',
      status: 'ACTIVE',
      cachedTotalBalance: '0.00',
      cachedAvailableBalance: '0.00',
      cachedHeldBalance: '0.00',
    });

    (prisma.walletCreditLot.create as any).mockResolvedValue({
      id: 'lot_123',
      remainingAmount: '500.00',
    });

    (prisma.walletLedgerEntry.create as any).mockResolvedValue({
      id: 'ledger_123',
      amount: '500.00',
    });

    (prisma.walletTopUp.update as any).mockResolvedValue({
      id: 'topup_123',
      status: 'CREDITED',
    });

    const payload = JSON.stringify({
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay_mock_123',
            amount: 50000,
            currency: 'INR',
            notes: { walletTopUpId: 'topup_123' },
          },
        },
      },
    });

    const res = await PaymentWebhookService.processWebhook(payload, 'mock_valid_webhook_signature');
    expect(res.status).toBe('PROCESSED');
  });
});

describe('Batch 3: Source-wise Refunds', () => {
  it('calculates source-wise refund plan correctly', async () => {
    (prisma.order.findUnique as any).mockResolvedValue({
      id: 'order_123',
      OrderPaymentAllocation: [
        {
          id: 'alloc_1',
          sourceType: 'REWARD',
          walletBucketType: 'REWARD',
          amount: '100.00',
          refundedAmount: '0.00',
        },
        {
          id: 'alloc_2',
          sourceType: 'UPI',
          gatewayPaymentId: 'pay_upi_123',
          amount: '400.00',
          refundedAmount: '0.00',
        },
      ],
    });

    const plan = await PaymentRefundService.calculateRefundPlan({
      orderId: 'order_123',
      requestedAmount: 500,
    });

    expect(plan.maxRefundableAmount).toBe(500);
    expect(plan.walletRefundAmount).toBe(100);
    expect(plan.externalRefundAmount).toBe(400);
    expect(plan.allocations).toHaveLength(2);
  });
});
