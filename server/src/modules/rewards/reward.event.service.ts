import { PrismaClient, Prisma } from '@prisma/client';
import { RewardService } from './reward.service';
import { RewardCalculationService } from './reward.calculation.service';
import { RewardReversalService } from './reward.reversal.service';

const prisma = new PrismaClient();

export class RewardEventService {
  /**
   * Helper to execute event with idempotency lock and payload validation.
   */
  private static async executeWithIdempotency<T>(
    idempotencyKey: string,
    operationType: string,
    customerId: string | undefined,
    handler: (tx: Prisma.TransactionClient) => Promise<T>
  ): Promise<{ success: boolean; data?: T; duplicated?: boolean; error?: string }> {
    return await prisma.$transaction(async (tx) => {
      // Check existing idempotency record
      const existing = await tx.financialIdempotencyRecord.findUnique({
        where: { idempotencyKey },
      });

      if (existing) {
        if (existing.status === 'COMPLETED' && existing.responseSnapshotJson) {
          try {
            const data = JSON.parse(existing.responseSnapshotJson);
            return { success: true, data, duplicated: true };
          } catch {
            return { success: true, duplicated: true };
          }
        }
        if (existing.status === 'IN_PROGRESS') {
          return { success: false, error: 'Event operation currently in progress' };
        }
      }

      // Create idempotency record
      await tx.financialIdempotencyRecord.upsert({
        where: { idempotencyKey },
        create: {
          idempotencyKey,
          operationType,
          customerId,
          status: 'IN_PROGRESS',
        },
        update: {
          status: 'IN_PROGRESS',
        },
      });

      try {
        const result = await handler(tx);
        await tx.financialIdempotencyRecord.update({
          where: { idempotencyKey },
          data: {
            status: 'COMPLETED',
            responseSnapshotJson: result ? JSON.stringify(result) : null,
          },
        });
        return { success: true, data: result, duplicated: false };
      } catch (err: any) {
        await tx.financialIdempotencyRecord.update({
          where: { idempotencyKey },
          data: {
            status: 'FAILED',
            responseSnapshotJson: JSON.stringify({ error: err?.message || String(err) }),
          },
        });
        throw err;
      }
    });
  }

  /**
   * Domain Event: Order Created / Placed
   * Key: reward_estimate:{orderId}:{version}
   */
  static async handleOrderCreated(orderId: string, ruleVersion: number = 1, context?: any) {
    const idempotencyKey = `reward_estimate:${orderId}:v${ruleVersion}`;

    return await this.executeWithIdempotency(
      idempotencyKey,
      'REWARD_ORDER_CREATED',
      context?.customerId,
      async (tx) => {
        return await RewardService.handleOrderPlaced(orderId, tx);
      }
    );
  }

  /**
   * Domain Event: Order Payment Confirmed
   * Key: reward_payment_confirmed:{orderId}:{paymentId || 'default'}
   */
  static async handleOrderPaymentConfirmed(orderId: string, paymentId?: string, context?: any) {
    const key = `reward_payment_confirmed:${orderId}:${paymentId || 'confirmed'}`;

    return await this.executeWithIdempotency(
      key,
      'REWARD_PAYMENT_CONFIRMED',
      context?.customerId,
      async (tx) => {
        return await RewardService.handlePaymentSuccess(orderId, tx);
      }
    );
  }

  /**
   * Domain Event: Order Payment Failed
   * Key: reward_payment_failed:{orderId}
   */
  static async handleOrderPaymentFailed(orderId: string, context?: any) {
    const key = `reward_payment_failed:${orderId}`;

    return await this.executeWithIdempotency(
      key,
      'REWARD_PAYMENT_FAILED',
      context?.customerId,
      async (tx) => {
        const rewardTx = await tx.rewardTransaction.findFirst({
          where: { sourceOrderId: orderId },
        });

        if (rewardTx && (rewardTx.status === 'ESTIMATED' || rewardTx.status === 'PENDING_PAYMENT')) {
          const updated = await tx.rewardTransaction.update({
            where: { id: rewardTx.id },
            data: { status: 'CANCELLED' },
          });
          await RewardService.getRewardAccount(rewardTx.customerId, tx);
          return updated;
        }
        return rewardTx;
      }
    );
  }

  /**
   * Domain Event: Order Delivered
   * Key: reward_delivery:{orderId}:{deliveryVersion || 1}
   */
  static async handleOrderDelivered(orderId: string, deliveredAt?: Date, deliveryVersion: number = 1, context?: any) {
    const key = `reward_delivery:${orderId}:v${deliveryVersion}`;

    return await this.executeWithIdempotency(
      key,
      'REWARD_ORDER_DELIVERED',
      context?.customerId,
      async (tx) => {
        return await RewardService.handleOrderDelivered(orderId, deliveredAt, tx);
      }
    );
  }

  /**
   * Domain Event: Order Cancelled
   * Key: reward_order_cancelled:{orderId}
   */
  static async handleOrderCancelled(orderId: string, context?: any) {
    const key = `reward_order_cancelled:${orderId}`;

    return await this.executeWithIdempotency(
      key,
      'REWARD_ORDER_CANCELLED',
      context?.customerId,
      async (tx) => {
        return await RewardReversalService.handleFullRefund(orderId, 'ORDER_CANCELLED', tx);
      }
    );
  }

  /**
   * Domain Event: Order Item Cancelled
   * Key: reward_item_cancelled:{orderId}:{orderItemId}
   */
  static async handleOrderItemCancelled(orderId: string, orderItemId: string, context?: any) {
    const key = `reward_item_cancelled:${orderId}:${orderItemId}`;

    return await this.executeWithIdempotency(
      key,
      'REWARD_ITEM_CANCELLED',
      context?.customerId,
      async (tx) => {
        return await RewardReversalService.handlePartialRefund({
          orderId,
          refundReason: `ITEM_CANCELLED_${orderItemId}`,
          txPrisma: tx,
        });
      }
    );
  }

  /**
   * Domain Event: Order Refund Created
   * Key: reward_refund_created:{refundId}
   */
  static async handleOrderRefundCreated(refundId: string, context?: any) {
    const key = `reward_refund_created:${refundId}`;

    return await this.executeWithIdempotency(
      key,
      'REWARD_REFUND_CREATED',
      context?.customerId,
      async (tx) => {
        const refund = await tx.orderRefund.findUnique({
          where: { id: refundId },
        });
        if (!refund) return null;

        if (refund.type === 'FULL') {
          return await RewardReversalService.handleFullRefund(refund.orderId, `REFUND_${refundId}`, tx);
        } else {
          return await RewardReversalService.handlePartialRefund({
            orderId: refund.orderId,
            refundId: refund.id,
            refundAmount: Number(refund.approvedAmount || refund.requestedAmount),
            refundReason: `PARTIAL_REFUND_${refundId}`,
            txPrisma: tx,
          });
        }
      }
    );
  }

  /**
   * Domain Event: Order Refund Completed
   * Key: reward_refund_completed:{refundId}
   */
  static async handleOrderRefundCompleted(refundId: string, context?: any) {
    const key = `reward_refund_completed:${refundId}`;

    return await this.executeWithIdempotency(
      key,
      'REWARD_REFUND_COMPLETED',
      context?.customerId,
      async (tx) => {
        const refund = await tx.orderRefund.findUnique({
          where: { id: refundId },
        });
        if (!refund) return null;

        return await RewardReversalService.handlePartialRefund({
          orderId: refund.orderId,
          refundId: refund.id,
          refundAmount: Number(refund.approvedAmount || refund.requestedAmount),
          refundReason: `REFUND_COMPLETED_${refundId}`,
          txPrisma: tx,
        });
      }
    );
  }

  /**
   * Domain Event: Order Returned
   * Key: reward_order_returned:{orderId}
   */
  static async handleOrderReturned(orderId: string, context?: any) {
    const key = `reward_order_returned:${orderId}`;

    return await this.executeWithIdempotency(
      key,
      'REWARD_ORDER_RETURNED',
      context?.customerId,
      async (tx) => {
        return await RewardReversalService.handleFullRefund(orderId, 'ORDER_RETURNED', tx);
      }
    );
  }

  /**
   * Domain Event: Delivery Reversed
   * Key: reward_delivery_reversed:{orderId}
   */
  static async handleOrderDeliveryReversed(orderId: string, context?: any) {
    const key = `reward_delivery_reversed:${orderId}`;

    return await this.executeWithIdempotency(
      key,
      'REWARD_DELIVERY_REVERSED',
      context?.customerId,
      async (tx) => {
        return await RewardReversalService.handleFullRefund(orderId, 'DELIVERY_REVERSED', tx);
      }
    );
  }

  /**
   * Domain Event: Fraud Hold Applied
   * Key: reward_fraud_hold:{rewardTransactionId}:{riskAssessmentId || 'hold'}
   */
  static async handleFraudHoldApplied(
    rewardTransactionId: string,
    riskAssessmentId?: string,
    reason?: string,
    context?: any
  ) {
    const key = `reward_fraud_hold:${rewardTransactionId}:${riskAssessmentId || 'hold'}`;

    return await this.executeWithIdempotency(
      key,
      'REWARD_FRAUD_HOLD',
      context?.customerId,
      async (tx) => {
        return await RewardService.applyFraudHold(rewardTransactionId, reason, tx);
      }
    );
  }

  /**
   * Domain Event: Fraud Hold Released
   * Key: reward_fraud_release:{rewardTransactionId}:{riskAssessmentId || 'release'}
   */
  static async handleFraudHoldReleased(
    rewardTransactionId: string,
    riskAssessmentId?: string,
    context?: any
  ) {
    const key = `reward_fraud_release:${rewardTransactionId}:${riskAssessmentId || 'release'}`;

    return await this.executeWithIdempotency(
      key,
      'REWARD_FRAUD_RELEASE',
      context?.customerId,
      async (tx) => {
        return await RewardService.releaseFraudHold(rewardTransactionId, tx);
      }
    );
  }
}
