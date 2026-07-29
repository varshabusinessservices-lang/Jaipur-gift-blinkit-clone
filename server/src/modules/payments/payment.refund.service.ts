import { Prisma } from '@prisma/client';
import { prisma } from '../../database/prisma';
import { WalletService } from '../wallet/wallet.service';
import { paymentGatewayService, rupeesToPaise } from './payment.gateway.service';

export interface RefundPlanInput {
  orderId: string;
  requestedAmount?: number;
  items?: Array<{ orderItemId: string; quantity: number }>;
  destinationPolicy?: 'SOURCE_PRIORITY' | 'PROPORTIONAL' | 'ITEM_LEVEL';
}

export interface RefundAllocationPlan {
  orderPaymentAllocationId: string;
  orderItemId?: string | null;
  sourceType: string;
  walletBucketType?: string | null;
  walletCreditLotId?: string | null;
  gatewayPaymentId?: string | null;
  originalAmount: number;
  previouslyRefundedAmount: number;
  maxRefundableAmount: number;
  refundAmount: number;
  isWallet: boolean;
  isExternal: boolean;
  isCod: boolean;
  promotionalPolicy?: string;
}

export interface RefundPlanResult {
  orderId: string;
  maxRefundableAmount: number;
  requestedAmount: number;
  walletRefundAmount: number;
  externalRefundAmount: number;
  codRefundAmount: number;
  allocations: RefundAllocationPlan[];
  warnings: string[];
}

export interface CreateRefundInput {
  orderId: string;
  customerId: string;
  requestedAmount?: number;
  items?: Array<{ orderItemId: string; quantity: number }>;
  reasonCode?: string;
  customerReason?: string;
  internalReason?: string;
  destinationPolicy?: string;
  idempotencyKey?: string;
  requestedByType?: 'CUSTOMER' | 'ADMIN' | 'SYSTEM';
  requestedById?: string;
}

export class PaymentRefundService {
  /**
   * Calculate exact source-wise refund plan for an order
   */
  static async calculateRefundPlan(input: RefundPlanInput): Promise<RefundPlanResult> {
    const order = await prisma.order.findUnique({
      where: { id: input.orderId },
      include: {
        OrderPaymentAllocation: {
          include: { creditLot: true },
        },
      },
    });

    if (!order) {
      throw new Error(`Order ${input.orderId} not found`);
    }

    const allocations = order.OrderPaymentAllocation;
    if (!allocations || allocations.length === 0) {
      throw new Error(`No payment allocations found for order ${input.orderId}`);
    }

    const warnings: string[] = [];
    const allocationPlans: RefundAllocationPlan[] = [];

    let totalMaxRefundable = 0;

    for (const alloc of allocations) {
      const orig = parseFloat(alloc.amount.toString());
      const prevRef = parseFloat(alloc.refundedAmount.toString());
      const maxRef = Math.max(0, orig - prevRef);
      totalMaxRefundable += maxRef;

      const isWallet = ['REWARD', 'REFERRAL_REFERRER', 'REFERRAL_NEW_USER', 'PROMOTIONAL', 'REFUND', 'SELF_LOADED'].includes(alloc.sourceType);
      const isExternal = ['UPI', 'CARD', 'NETBANKING', 'RAZORPAY'].includes(alloc.sourceType);
      const isCod = alloc.sourceType === 'COD';

      allocationPlans.push({
        orderPaymentAllocationId: alloc.id,
        orderItemId: alloc.orderItemId,
        sourceType: alloc.sourceType,
        walletBucketType: alloc.walletBucketType,
        walletCreditLotId: alloc.walletCreditLotId,
        gatewayPaymentId: alloc.gatewayPaymentId,
        originalAmount: orig,
        previouslyRefundedAmount: prevRef,
        maxRefundableAmount: maxRef,
        refundAmount: 0,
        isWallet,
        isExternal,
        isCod,
      });
    }

    const targetAmount = input.requestedAmount !== undefined && input.requestedAmount !== null
      ? Math.min(input.requestedAmount, totalMaxRefundable)
      : totalMaxRefundable;

    if (targetAmount <= 0) {
      throw new Error('No refundable balance available for this order');
    }

    // Allocate targetAmount across allocations proportionally or by source priority
    let remainingToAllocate = targetAmount;

    // Sort by priority or strategy
    if (input.destinationPolicy === 'PROPORTIONAL') {
      for (const plan of allocationPlans) {
        if (totalMaxRefundable > 0 && plan.maxRefundableAmount > 0) {
          const share = Math.min(
            plan.maxRefundableAmount,
            Math.round((plan.maxRefundableAmount / totalMaxRefundable) * targetAmount * 100) / 100
          );
          plan.refundAmount = share;
        }
      }
    } else {
      // Default SOURCE_PRIORITY: external first or wallet first according to exact source
      for (const plan of allocationPlans) {
        if (remainingToAllocate <= 0) break;
        const allocAmt = Math.min(plan.maxRefundableAmount, remainingToAllocate);
        plan.refundAmount = allocAmt;
        remainingToAllocate = Math.round((remainingToAllocate - allocAmt) * 100) / 100;
      }
    }

    let walletTotal = 0;
    let externalTotal = 0;
    let codTotal = 0;

    for (const plan of allocationPlans) {
      if (plan.isWallet) walletTotal += plan.refundAmount;
      if (plan.isExternal) externalTotal += plan.refundAmount;
      if (plan.isCod) codTotal += plan.refundAmount;
    }

    return {
      orderId: input.orderId,
      maxRefundableAmount: Math.round(totalMaxRefundable * 100) / 100,
      requestedAmount: Math.round(targetAmount * 100) / 100,
      walletRefundAmount: Math.round(walletTotal * 100) / 100,
      externalRefundAmount: Math.round(externalTotal * 100) / 100,
      codRefundAmount: Math.round(codTotal * 100) / 100,
      allocations: allocationPlans,
      warnings,
    };
  }

  /**
   * Process a Full or Partial Order Refund
   */
  static async processRefund(input: CreateRefundInput): Promise<any> {
    if (input.idempotencyKey) {
      const existingRefund = await prisma.orderRefund.findUnique({
        where: { idempotencyKey: input.idempotencyKey },
        include: { allocations: true },
      });
      if (existingRefund) {
        return { refund: existingRefund, idempotencyReplay: true };
      }
    }

    const plan = await this.calculateRefundPlan({
      orderId: input.orderId,
      requestedAmount: input.requestedAmount,
      items: input.items,
      destinationPolicy: (input.destinationPolicy as any) || 'SOURCE_PRIORITY',
    });

    const isFullRefund = plan.requestedAmount >= plan.maxRefundableAmount;
    const refundType = isFullRefund ? 'FULL' : input.items ? 'ITEM' : 'PARTIAL';

    const orderRefund = await prisma.orderRefund.create({
      data: {
        orderId: input.orderId,
        customerId: input.customerId,
        type: refundType,
        status: 'PROCESSING',
        requestedAmount: new Prisma.Decimal(plan.requestedAmount.toFixed(2)),
        approvedAmount: new Prisma.Decimal(plan.requestedAmount.toFixed(2)),
        walletRefundAmount: new Prisma.Decimal(plan.walletRefundAmount.toFixed(2)),
        externalRefundAmount: new Prisma.Decimal(plan.externalRefundAmount.toFixed(2)),
        codRefundAmount: new Prisma.Decimal(plan.codRefundAmount.toFixed(2)),
        currency: 'INR',
        reasonCode: input.reasonCode || 'CUSTOMER_REQUEST',
        customerReason: input.customerReason,
        internalReason: input.internalReason,
        destinationPolicy: input.destinationPolicy || 'SOURCE_PRIORITY',
        idempotencyKey: input.idempotencyKey || null,
        requestedByType: input.requestedByType || 'CUSTOMER',
        requestedById: input.requestedById || input.customerId,
        processingAt: new Date(),
      },
    });

    const refundAllocations: any[] = [];
    let hasExternalPending = false;

    for (const allocPlan of plan.allocations) {
      if (allocPlan.refundAmount <= 0) continue;

      let walletCreditLotId: string | null = null;
      let walletLedgerEntryId: string | null = null;
      let externalRefundId: string | null = null;
      let status = 'COMPLETED';

      if (allocPlan.isWallet) {
        // Restore wallet money to correct bucket
        const bucket = (allocPlan.walletBucketType || allocPlan.sourceType) as any;
        const creditResult = await WalletService.creditWallet({
          customerId: input.customerId,
          amount: allocPlan.refundAmount,
          bucketType: bucket === 'SELF_LOADED' ? 'SELF_LOADED' : 'REFUND',
          sourceType: 'ORDER_REFUND',
          sourceId: input.orderId,
          narration: `Refund for order ${input.orderId}`,
          idempotencyKey: `refund_alloc:${orderRefund.id}:${allocPlan.orderPaymentAllocationId}`,
        });

        walletCreditLotId = creditResult.lot.id;
        walletLedgerEntryId = creditResult.entry.id;
      } else if (allocPlan.isExternal && allocPlan.gatewayPaymentId) {
        try {
          const gatewayResp = await paymentGatewayService.createRefund({
            paymentId: allocPlan.gatewayPaymentId,
            amountPaise: rupeesToPaise(allocPlan.refundAmount),
            notes: { orderId: input.orderId, refundId: orderRefund.id },
          });
          externalRefundId = gatewayResp.id;
          status = gatewayResp.status === 'processed' ? 'COMPLETED' : 'PROCESSING';
          if (status === 'PROCESSING') hasExternalPending = true;
        } catch (err: any) {
          status = 'FAILED';
          hasExternalPending = true;
        }
      }

      const refundAlloc = await prisma.refundAllocation.create({
        data: {
          refundId: orderRefund.id,
          orderPaymentAllocationId: allocPlan.orderPaymentAllocationId,
          orderItemId: allocPlan.orderItemId,
          sourceType: allocPlan.sourceType,
          originalAmount: new Prisma.Decimal(allocPlan.originalAmount.toFixed(2)),
          previouslyRefundedAmount: new Prisma.Decimal(allocPlan.previouslyRefundedAmount.toFixed(2)),
          refundAmount: new Prisma.Decimal(allocPlan.refundAmount.toFixed(2)),
          walletCreditLotId,
          walletLedgerEntryId,
          externalRefundId,
          status,
          idempotencyKey: `refund_alloc_rec:${orderRefund.id}:${allocPlan.orderPaymentAllocationId}`,
        },
      });

      // Update OrderPaymentAllocation refundedAmount
      const newRefunded = allocPlan.previouslyRefundedAmount + allocPlan.refundAmount;
      await prisma.orderPaymentAllocation.update({
        where: { id: allocPlan.orderPaymentAllocationId },
        data: {
          refundedAmount: new Prisma.Decimal(newRefunded.toFixed(2)),
          status: newRefunded >= allocPlan.originalAmount ? 'REFUNDED' : 'ACTIVE',
        },
      });

      refundAllocations.push(refundAlloc);
    }

    const finalStatus = hasExternalPending ? 'PARTIALLY_COMPLETED' : 'COMPLETED';
    const updatedRefund = await prisma.orderRefund.update({
      where: { id: orderRefund.id },
      data: {
        status: finalStatus,
        completedAt: finalStatus === 'COMPLETED' ? new Date() : null,
      },
    });

    // Update order payment status
    await prisma.order.update({
      where: { id: input.orderId },
      data: {
        paymentStatus: isFullRefund ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
      },
    });

    return {
      refund: updatedRefund,
      allocations: refundAllocations,
    };
  }
}
