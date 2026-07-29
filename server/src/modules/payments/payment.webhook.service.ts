import crypto from 'crypto';
import { prisma } from '../../database/prisma';
import { paymentGatewayService } from './payment.gateway.service';
import { WalletService } from '../wallet/wallet.service';

export class PaymentWebhookService {
  /**
   * Process incoming raw webhook request from Razorpay
   */
  static async processWebhook(rawBody: string | Buffer, signature: string): Promise<{ status: string; eventId?: string; message: string }> {
    const isValid = paymentGatewayService.verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      throw new Error('Invalid webhook signature');
    }

    const payloadObj = typeof rawBody === 'string' ? JSON.parse(rawBody) : JSON.parse(rawBody.toString('utf-8'));
    const normalized = paymentGatewayService.normalizeWebhookEvent(payloadObj);

    // Compute payload hash for auditing
    const payloadHash = crypto.createHash('sha256').update(typeof rawBody === 'string' ? rawBody : rawBody.toString('utf-8')).digest('hex');

    let webhookEvent = await prisma.paymentWebhookEvent.findUnique({
      where: {
        gateway_gatewayEventId: {
          gateway: 'RAZORPAY',
          gatewayEventId: normalized.gatewayEventId,
        },
      },
    });

    if (webhookEvent) {
      if (webhookEvent.status === 'PROCESSED') {
        return { status: 'IGNORED', eventId: webhookEvent.id, message: 'Event already processed' };
      }
      webhookEvent = await prisma.paymentWebhookEvent.update({
        where: { id: webhookEvent.id },
        data: {
          attempts: webhookEvent.attempts + 1,
          lastReceivedAt: new Date(),
          status: 'PROCESSING',
        },
      });
    } else {
      webhookEvent = await prisma.paymentWebhookEvent.create({
        data: {
          gateway: 'RAZORPAY',
          gatewayEventId: normalized.gatewayEventId,
          eventType: normalized.eventType,
          payloadHash,
          signatureHash: signature,
          status: 'PROCESSING',
          attempts: 1,
          firstReceivedAt: new Date(),
          lastReceivedAt: new Date(),
          metadataJson: JSON.stringify(payloadObj),
        },
      });
    }

    try {
      await this.dispatchWebhookEvent(normalized.eventType, normalized.payload);

      await prisma.paymentWebhookEvent.update({
        where: { id: webhookEvent.id },
        data: {
          status: 'PROCESSED',
          processedAt: new Date(),
        },
      });

      return { status: 'PROCESSED', eventId: webhookEvent.id, message: 'Webhook processed successfully' };
    } catch (err: any) {
      await prisma.paymentWebhookEvent.update({
        where: { id: webhookEvent.id },
        data: {
          status: 'FAILED',
          failedAt: new Date(),
          failureMessage: err.message || 'Error processing webhook event',
        },
      });
      throw err;
    }
  }

  private static async dispatchWebhookEvent(eventType: string, payload: any) {
    if (eventType === 'payment.captured' || eventType === 'order.paid') {
      const payment = payload.payment?.entity || payload.order?.entity;
      if (!payment) return;

      const gatewayPaymentId = payment.id;
      const gatewayOrderId = payment.order_id || payment.id;
      const walletTopUpId = payment.notes?.walletTopUpId;

      // 1. Check if this payment belongs to a top-up
      let topUp: any = null;
      if (walletTopUpId) {
        topUp = await prisma.walletTopUp.findUnique({ where: { id: walletTopUpId } });
      } else if (gatewayOrderId) {
        topUp = await prisma.walletTopUp.findFirst({ where: { gatewayOrderId } });
      }

      if (topUp) {
        if (topUp.status !== 'CREDITED') {
          await WalletService.creditVerifiedTopUp({
            topUpId: topUp.id,
            paymentDetails: {
              id: gatewayPaymentId,
              orderId: gatewayOrderId,
              amount: payment.amount,
              currency: payment.currency || 'INR',
              status: 'captured',
              method: payment.method || 'online',
            },
            idempotencyKey: `webhook_topup_credit:${topUp.id}`,
            sourceEvent: 'WEBHOOK',
          });
        }
        return;
      }

      // 2. Check if this payment belongs to an OrderPayment
      if (gatewayOrderId) {
        const orderPayment = await prisma.orderPayment.findFirst({
          where: { gatewayOrderId },
        });
        if (orderPayment) {
          await prisma.orderPayment.update({
            where: { id: orderPayment.id },
            data: {
              gatewayPaymentId,
              status: 'PAID',
              rawResponseJson: JSON.stringify(payment),
            },
          });
          await prisma.order.update({
            where: { id: orderPayment.orderId },
            data: { paymentStatus: 'PAID' },
          });
        }
      }
    } else if (eventType === 'payment.failed') {
      const payment = payload.payment?.entity;
      if (!payment) return;

      const walletTopUpId = payment.notes?.walletTopUpId;
      const gatewayOrderId = payment.order_id;

      let topUp: any = null;
      if (walletTopUpId) {
        topUp = await prisma.walletTopUp.findUnique({ where: { id: walletTopUpId } });
      } else if (gatewayOrderId) {
        topUp = await prisma.walletTopUp.findFirst({ where: { gatewayOrderId } });
      }

      if (topUp) {
        await prisma.walletTopUp.update({
          where: { id: topUp.id },
          data: {
            status: 'PAYMENT_FAILED',
            failureCode: payment.error_code || 'PAYMENT_FAILED',
            failureMessage: payment.error_description || 'Payment failed on gateway',
          },
        });
      }
    } else if (eventType.startsWith('dispute.')) {
      const dispute = payload.dispute?.entity;
      if (!dispute) return;

      await WalletService.handleTopUpChargeback({
        gatewayPaymentId: dispute.payment_id,
        disputeId: dispute.id,
        amount: dispute.amount / 100, // paise to rupees
        reasonCode: dispute.reason_code,
        idempotencyKey: `dispute_webhook:${dispute.id}`,
      });
    }
  }
}
