import { Request, Response } from 'express';
import { WalletService } from './wallet.service';
import { WalletSlabService } from './wallet.slab.service';
import { prisma } from '../../database/prisma';

export class WalletController {
  /**
   * GET /wallet or /wallet/summary
   */
  static async getSummary(req: Request, res: Response) {
    try {
      const customerId = (req as any).user?.id || req.query.customerId as string;
      if (!customerId) return res.status(401).json({ error: 'Unauthorized: missing customer ID' });

      const summary = await WalletService.getWalletSummary(customerId);
      return res.json(summary);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * POST /wallet/topup or /wallet/topups
   */
  static async initiateTopUp(req: Request, res: Response) {
    try {
      const customerId = (req as any).user?.id || req.body.customerId;
      if (!customerId) return res.status(401).json({ error: 'Unauthorized: missing customer ID' });

      const { amount, idempotencyKey, deviceId, sessionId, paymentMethodPreference, returnContext, isVerifiedMobile } = req.body;

      const result = await WalletService.createWalletTopUp({
        customerId,
        amount,
        idempotencyKey,
        deviceId,
        sessionId,
        paymentMethodPreference,
        returnContext,
        isVerifiedMobile: isVerifiedMobile !== false,
      });

      return res.json(result);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  /**
   * POST /wallet/topups/:topUpId/confirm
   */
  static async confirmTopUp(req: Request, res: Response) {
    try {
      const customerId = (req as any).user?.id || req.body.customerId;
      if (!customerId) return res.status(401).json({ error: 'Unauthorized: missing customer ID' });

      const topUpId = req.params.topUpId || req.body.topUpId;
      const { razorpayPaymentId, razorpayOrderId, razorpaySignature, idempotencyKey } = req.body;

      if (!topUpId || !razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
        return res.status(400).json({ error: 'Missing required top-up confirmation parameters' });
      }

      const result = await WalletService.confirmWalletTopUp({
        topUpId,
        customerId,
        razorpayPaymentId,
        razorpayOrderId,
        razorpaySignature,
        idempotencyKey,
      });

      return res.json(result);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  /**
   * POST /wallet/webhook
   */
  static async webhookVerifyPayment(req: Request, res: Response) {
    try {
      const signature = (req.headers['x-razorpay-signature'] as string) || req.body.signature || 'mock_valid_webhook_signature';
      const rawBody = typeof req.body === 'string' || Buffer.isBuffer(req.body) ? req.body : JSON.stringify(req.body);

      const { PaymentWebhookService } = await import('../payments/payment.webhook.service');
      const result = await PaymentWebhookService.processWebhook(rawBody, signature);

      return res.json(result);
    } catch (error: any) {
      console.error('Webhook error:', error);
      return res.status(400).json({ error: error.message });
    }
  }

  /**
   * POST /wallet/refunds/calculate
   */
  static async calculateRefund(req: Request, res: Response) {
    try {
      const { orderId, requestedAmount, items, destinationPolicy } = req.body;
      if (!orderId) return res.status(400).json({ error: 'orderId is required' });

      const { PaymentRefundService } = await import('../payments/payment.refund.service');
      const plan = await PaymentRefundService.calculateRefundPlan({
        orderId,
        requestedAmount: requestedAmount ? Number(requestedAmount) : undefined,
        items,
        destinationPolicy,
      });

      return res.json(plan);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  /**
   * POST /wallet/refunds
   */
  static async processRefund(req: Request, res: Response) {
    try {
      const customerId = (req as any).user?.id || req.body.customerId;
      const { orderId, requestedAmount, items, reasonCode, customerReason, internalReason, destinationPolicy, idempotencyKey } = req.body;

      if (!orderId || !customerId) {
        return res.status(400).json({ error: 'orderId and customerId are required' });
      }

      const { PaymentRefundService } = await import('../payments/payment.refund.service');
      const result = await PaymentRefundService.processRefund({
        orderId,
        customerId,
        requestedAmount: requestedAmount ? Number(requestedAmount) : undefined,
        items,
        reasonCode,
        customerReason,
        internalReason,
        destinationPolicy,
        idempotencyKey,
        requestedByType: (req as any).user ? 'CUSTOMER' : 'ADMIN',
      });

      return res.json(result);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  /**
   * POST /wallet/calculate
   */
  static async calculateAllocation(req: Request, res: Response) {
    try {
      const customerId = (req as any).user?.id || req.body.customerId;
      if (!customerId) return res.status(401).json({ error: 'Unauthorized: missing customer ID' });

      const { subtotal, discount, coupon, excludedAmount, isFirstOrder, walletToggle, usePromotional, useSelfLoaded } =
        req.body;

      const allocation = await WalletService.calculateCheckoutAllocation({
        customerId,
        subtotal: Number(subtotal || 0),
        discount: Number(discount || 0),
        coupon: Number(coupon || 0),
        excludedAmount: Number(excludedAmount || 0),
        isFirstOrder: Boolean(isFirstOrder),
        walletToggle: walletToggle !== false,
        usePromotional: usePromotional !== false,
        useSelfLoaded: useSelfLoaded !== false,
      });

      return res.json(allocation);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * POST /wallet/reserve
   */
  static async reserve(req: Request, res: Response) {
    try {
      const customerId = (req as any).user?.id || req.body.customerId;
      if (!customerId) return res.status(401).json({ error: 'Unauthorized: missing customer ID' });

      const {
        checkoutSessionId,
        subtotal,
        discount,
        coupon,
        excludedAmount,
        isFirstOrder,
        usePromotional,
        useSelfLoaded,
      } = req.body;

      const reservation = await WalletService.createReservation({
        customerId,
        checkoutSessionId: checkoutSessionId || `session_${Date.now()}`,
        subtotal: Number(subtotal || 0),
        discount: Number(discount || 0),
        coupon: Number(coupon || 0),
        excludedAmount: Number(excludedAmount || 0),
        isFirstOrder: Boolean(isFirstOrder),
        usePromotional: usePromotional !== false,
        useSelfLoaded: useSelfLoaded !== false,
      });

      return res.json(reservation);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * POST /wallet/consume
   */
  static async consume(req: Request, res: Response) {
    try {
      const customerId = (req as any).user?.id || req.body.customerId;
      if (!customerId) return res.status(401).json({ error: 'Unauthorized: missing customer ID' });

      const { reservationId, orderId, idempotencyKey } = req.body;
      if (!reservationId || !orderId) {
        return res.status(400).json({ error: 'reservationId and orderId are required' });
      }

      const result = await WalletService.consumeReservation(reservationId, orderId, customerId, idempotencyKey);
      return res.json(result);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * POST /wallet/release
   */
  static async release(req: Request, res: Response) {
    try {
      const { reservationId, reason } = req.body;
      if (!reservationId) return res.status(400).json({ error: 'reservationId is required' });

      const result = await WalletService.releaseReservation(reservationId, reason);
      return res.json(result);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * POST /wallet/full-payment
   */
  static async fullPayment(req: Request, res: Response) {
    try {
      const customerId = (req as any).user?.id || req.body.customerId;
      if (!customerId) return res.status(401).json({ error: 'Unauthorized: missing customer ID' });

      const { checkoutSessionId, orderId, subtotal, discount, coupon, excludedAmount, isFirstOrder, idempotencyKey } =
        req.body;

      const result = await WalletService.createFullWalletPayment({
        customerId,
        checkoutSessionId: checkoutSessionId || `session_${Date.now()}`,
        orderId,
        subtotal: Number(subtotal || 0),
        discount: Number(discount || 0),
        coupon: Number(coupon || 0),
        excludedAmount: Number(excludedAmount || 0),
        isFirstOrder: Boolean(isFirstOrder),
        idempotencyKey,
      });

      return res.json(result);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  /**
   * POST /wallet/simulate
   */
  static async simulate(req: Request, res: Response) {
    try {
      const simulation = WalletSlabService.simulate(req.body);
      return res.json(simulation);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
