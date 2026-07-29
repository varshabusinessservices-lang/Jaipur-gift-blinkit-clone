import * as crypto from 'crypto';
import { env } from '../../config/env';
import { Decimal } from '@prisma/client/runtime/library';

export interface CreatePaymentOrderParams {
  amountPaise: number;
  currency?: string;
  receipt: string;
  notes?: Record<string, any>;
}

export interface PaymentOrderResponse {
  id: string;
  entity: string;
  amount: number;
  amountPaid: number;
  amountDue: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  createdAt: number;
  notes?: Record<string, any>;
}

export interface GatewayPaymentDetails {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  status: string; // created, authorized, captured, refunded, failed
  orderId?: string;
  invoiceId?: string;
  international?: boolean;
  method?: string; // card, netbanking, wallet, emi, upi
  amountRefunded?: number;
  refundStatus?: string;
  captured?: boolean;
  description?: string;
  cardId?: string;
  bank?: string;
  wallet?: string;
  vpa?: string;
  email?: string;
  contact?: string;
  errorCode?: string;
  errorDescription?: string;
  errorSource?: string;
  errorStep?: string;
  errorReason?: string;
  notes?: Record<string, any>;
  createdAt?: number;
}

export interface GatewayRefundResponse {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  paymentId: string;
  notes?: Record<string, any>;
  receipt?: string;
  status: string; // pending, processed, failed
  speedRequested?: string;
  speedProcessed?: string;
  createdAt?: number;
}

export function rupeesToPaise(rupees: string | number | Decimal): number {
  const valStr = typeof rupees === 'object' && 'toString' in rupees ? rupees.toString() : String(rupees);
  const num = parseFloat(valStr);
  if (isNaN(num) || num < 0) {
    throw new Error(`Invalid rupee amount for paise conversion: ${rupees}`);
  }
  return Math.round(num * 100);
}

export function paiseToRupees(paise: number): string {
  if (isNaN(paise) || paise < 0) {
    throw new Error(`Invalid paise amount for rupee conversion: ${paise}`);
  }
  return (paise / 100).toFixed(2);
}

export class RazorpayPaymentGatewayService {
  private keyId: string;
  private keySecret: string;
  private webhookSecret: string;
  private isMock: boolean;

  constructor() {
    this.keyId = env.RAZORPAY_KEY_ID || 'rzp_test_mock_key_id';
    this.keySecret = env.RAZORPAY_KEY_SECRET || 'rzp_test_mock_key_secret';
    this.webhookSecret = env.RAZORPAY_WEBHOOK_SECRET || 'rzp_test_mock_webhook_secret';
    
    const mode = env.PAYMENT_GATEWAY_MODE;
    this.isMock = mode === 'mock' || (mode === 'auto' && (this.keyId.includes('mock') || process.env.NODE_ENV === 'test'));
  }

  public isMockMode(): boolean {
    return this.isMock;
  }

  public verifyCheckoutSignature(params: { orderId: string; paymentId: string; signature: string }): boolean {
    if (!params.orderId || !params.paymentId || !params.signature) {
      return false;
    }
    if (this.isMock && params.signature === 'mock_valid_signature') {
      return true;
    }
    try {
      const text = `${params.orderId}|${params.paymentId}`;
      const expectedSignature = crypto
        .createHmac('sha256', this.keySecret)
        .update(text)
        .digest('hex');
      
      return crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'utf-8'),
        Buffer.from(params.signature, 'utf-8')
      );
    } catch {
      return false;
    }
  }

  public verifyWebhookSignature(payload: string | Buffer, signature: string, secretOverride?: string): boolean {
    if (!payload || !signature) {
      return false;
    }
    const secret = secretOverride || this.webhookSecret;
    if (this.isMock && signature === 'mock_valid_webhook_signature') {
      return true;
    }
    try {
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'utf-8'),
        Buffer.from(signature, 'utf-8')
      );
    } catch {
      return false;
    }
  }

  public async createPaymentOrder(params: CreatePaymentOrderParams): Promise<PaymentOrderResponse> {
    if (this.isMock) {
      const orderId = `order_mock_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      return {
        id: orderId,
        entity: 'order',
        amount: params.amountPaise,
        amountPaid: 0,
        amountDue: params.amountPaise,
        currency: params.currency || 'INR',
        receipt: params.receipt,
        status: 'created',
        attempts: 0,
        createdAt: Math.floor(Date.now() / 1000),
        notes: params.notes,
      };
    }

    const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: params.amountPaise,
        currency: params.currency || 'INR',
        receipt: params.receipt,
        notes: params.notes,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Razorpay createOrder failed (${response.status}): ${errText}`);
    }

    return await response.json() as PaymentOrderResponse;
  }

  public async fetchPayment(paymentId: string): Promise<GatewayPaymentDetails> {
    if (this.isMock) {
      return {
        id: paymentId,
        entity: 'payment',
        amount: 50000,
        currency: 'INR',
        status: 'captured',
        orderId: `order_mock_123`,
        method: 'upi',
        captured: true,
        createdAt: Math.floor(Date.now() / 1000),
      };
    }

    const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
    const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
      method: 'GET',
      headers: { 'Authorization': `Basic ${auth}` },
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Razorpay fetchPayment failed (${response.status}): ${errText}`);
    }

    return await response.json() as GatewayPaymentDetails;
  }

  public async fetchOrder(orderId: string): Promise<PaymentOrderResponse> {
    if (this.isMock) {
      return {
        id: orderId,
        entity: 'order',
        amount: 50000,
        amountPaid: 50000,
        amountDue: 0,
        currency: 'INR',
        receipt: 'rcpt_mock',
        status: 'paid',
        attempts: 1,
        createdAt: Math.floor(Date.now() / 1000),
      };
    }

    const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
    const response = await fetch(`https://api.razorpay.com/v1/orders/${orderId}`, {
      method: 'GET',
      headers: { 'Authorization': `Basic ${auth}` },
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Razorpay fetchOrder failed (${response.status}): ${errText}`);
    }

    return await response.json() as PaymentOrderResponse;
  }

  public async capturePayment(paymentId: string, amountPaise: number, currency = 'INR'): Promise<GatewayPaymentDetails> {
    if (this.isMock) {
      return {
        id: paymentId,
        entity: 'payment',
        amount: amountPaise,
        currency,
        status: 'captured',
        captured: true,
      };
    }

    const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
    const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount: amountPaise, currency }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Razorpay capturePayment failed (${response.status}): ${errText}`);
    }

    return await response.json() as GatewayPaymentDetails;
  }

  public async createRefund(params: { paymentId: string; amountPaise: number; notes?: Record<string, any>; speed?: string }): Promise<GatewayRefundResponse> {
    if (this.isMock) {
      const refundId = `rfnd_mock_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      return {
        id: refundId,
        entity: 'refund',
        amount: params.amountPaise,
        currency: 'INR',
        paymentId: params.paymentId,
        notes: params.notes,
        status: 'processed',
        speedProcessed: params.speed || 'optimum',
        createdAt: Math.floor(Date.now() / 1000),
      };
    }

    const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
    const response = await fetch(`https://api.razorpay.com/v1/payments/${params.paymentId}/refund`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: params.amountPaise,
        notes: params.notes,
        speed: params.speed || 'optimum',
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Razorpay createRefund failed (${response.status}): ${errText}`);
    }

    return await response.json() as GatewayRefundResponse;
  }

  public async fetchRefund(refundId: string): Promise<GatewayRefundResponse> {
    if (this.isMock) {
      return {
        id: refundId,
        entity: 'refund',
        amount: 10000,
        currency: 'INR',
        paymentId: 'pay_mock_123',
        status: 'processed',
        createdAt: Math.floor(Date.now() / 1000),
      };
    }

    const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
    const response = await fetch(`https://api.razorpay.com/v1/refunds/${refundId}`, {
      method: 'GET',
      headers: { 'Authorization': `Basic ${auth}` },
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Razorpay fetchRefund failed (${response.status}): ${errText}`);
    }

    return await response.json() as GatewayRefundResponse;
  }

  public normalizeWebhookEvent(rawEvent: any): {
    gatewayEventId: string;
    eventType: string;
    payload: any;
    entityId?: string;
  } {
    const eventType = rawEvent?.event || 'unknown';
    const gatewayEventId = rawEvent?.event_id || rawEvent?.id || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const payload = rawEvent?.payload || {};

    let entityId: string | undefined;
    if (payload.payment?.entity?.id) {
      entityId = payload.payment.entity.id;
    } else if (payload.refund?.entity?.id) {
      entityId = payload.refund.entity.id;
    } else if (payload.dispute?.entity?.id) {
      entityId = payload.dispute.entity.id;
    } else if (payload.order?.entity?.id) {
      entityId = payload.order.entity.id;
    }

    return {
      gatewayEventId,
      eventType,
      payload,
      entityId,
    };
  }
}

export const paymentGatewayService = new RazorpayPaymentGatewayService();
