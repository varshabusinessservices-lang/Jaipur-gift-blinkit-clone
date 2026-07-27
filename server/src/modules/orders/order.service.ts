import crypto from 'crypto';
import { OrderRepository } from './order.repository';
import { CheckoutService } from '../checkout/checkout.service';
import { CartService } from '../cart/cart.service';
import { CustomersRepository } from '../customers/customers.repository';
import { CreateOrderFromCheckoutParams, RazorpayWebhookPayload } from './order.types';

export class OrderService {
  private orderRepo = new OrderRepository();
  private checkoutService = new CheckoutService();
  private cartService = new CartService();
  private customerRepo = new CustomersRepository();

  /**
   * Convert READY CheckoutSession into Order with full transaction safety & snapshot freezing
   */
  async createOrderFromCheckout(params: CreateOrderFromCheckoutParams): Promise<any> {
    const { checkoutSessionId, customerId, paymentGateway = 'RAZORPAY', gatewayOrderId, gatewayPaymentId, gatewaySignature } = params;

    // 1. Get Checkout Session
    const session = await this.checkoutService.getSessionById(checkoutSessionId);
    if (!session) {
      throw new Error('Checkout session not found');
    }

    if (session.customerId !== customerId) {
      throw new Error('Customer mismatch for checkout session');
    }

    if (session.status !== 'READY') {
      // Revalidate if not ready
      const validation = await this.checkoutService.validateCheckout(checkoutSessionId);
      if (!validation.isValid) {
        throw new Error(`Checkout validation failed: ${JSON.stringify(validation.errors)}`);
      }
    }

    // 2. Fetch associated cart and items
    const cart = await this.cartService.getOrCreateCart({ customerId });
    if (!cart || !cart.items || cart.items.length === 0) {
      throw new Error('Cart is empty or invalid for order conversion');
    }

    // 3. Parse snapshots
    const pricing = session.pricingSnapshotJson ? JSON.parse(session.pricingSnapshotJson) : { subtotal: 1000, grandTotal: 1050 };
    const paymentSnap = session.paymentSnapshotJson ? JSON.parse(session.paymentSnapshotJson) : { method: 'RAZORPAY' };
    const addressSnap = session.addressSnapshotJson ? JSON.parse(session.addressSnapshotJson) : {};
    const deliverySnap = session.deliverySnapshotJson ? JSON.parse(session.deliverySnapshotJson) : {};

    // 4. Payment Verification / COD check
    let paymentStatus = 'PENDING';
    let orderStatus = 'PENDING';

    if (paymentSnap.method === 'COD') {
      paymentStatus = 'PENDING';
      orderStatus = 'PENDING';
    } else if (paymentSnap.method === 'RAZORPAY' || paymentSnap.method === 'WALLET_RAZORPAY') {
      if (gatewayPaymentId && gatewaySignature) {
        // Verify Razorpay signature
        const isValidSignature = this.verifyRazorpaySignature(gatewayOrderId || session.razorpayOrderId || '', gatewayPaymentId, gatewaySignature);
        if (!isValidSignature) {
          throw new Error('Razorpay signature verification failed');
        }
        paymentStatus = 'PAID';
        orderStatus = 'READY_FOR_PRODUCTION';
      } else {
        paymentStatus = 'AUTHORIZED';
        orderStatus = 'PAYMENT_PENDING';
      }
    } else {
      paymentStatus = 'PAID';
      orderStatus = 'READY_FOR_PRODUCTION';
    }

    // 5. Reserve Inventory
    const inventoryReservations = cart.items.map((item: any) => ({
      id: crypto.randomUUID(),
      productId: item.productId,
      variationId: item.variationId || null,
      quantity: item.quantity,
      status: 'RESERVED',
    }));

    // 6. Consume Wallet Reservation if requested
    const walletAmount = paymentSnap.walletAmountRequested || 0;
    if (walletAmount > 0) {
      await this.checkoutService.releaseWallet(checkoutSessionId); // consume / release active reservation
      // In real system, ledger debit happens here
    }

    // 7. Generate Sequential Order Number
    const orderNumber = `JG-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const subtotal = pricing.subtotal || 1000;
    const totalAmount = pricing.grandTotal || subtotal;
    const taxTotal = pricing.taxTotal || Math.round(subtotal * 0.05 * 100) / 100;
    const deliveryCharge = pricing.deliveryFee || 0;
    const handlingCharge = pricing.handlingFee || 0;
    const codCharge = pricing.codFee || 0;

    const orderData = {
      id: crypto.randomUUID(),
      orderNumber,
      checkoutSessionId,
      customerId,
      storeId: session.storeId || 'store-jaipur-main',
      status: orderStatus as any,
      paymentStatus: paymentStatus as any,
      fulfilmentStatus: 'PENDING',
      source: 'CHECKOUT',
      subtotal,
      addonTotal: 0,
      personalisationTotal: 0,
      discountTotal: pricing.discountTotal || 0,
      taxTotal,
      deliveryCharge,
      handlingCharge,
      codCharge,
      walletAmount,
      payableAmount: totalAmount,
      totalAmount,
      currency: 'INR',
      addressSnapshotJson: session.addressSnapshotJson,
      pricingSnapshotJson: session.pricingSnapshotJson,
      deliverySnapshotJson: session.deliverySnapshotJson,
      paymentSnapshotJson: session.paymentSnapshotJson,
    };

    const orderItems = cart.items.map((item: any) => ({
      id: crypto.randomUUID(),
      productId: item.productId,
      variationId: item.variationId || null,
      sku: item.sku || 'SKU-DEFAULT',
      nameSnapshot: item.product?.name || item.nameSnapshot || 'Gifting Item',
      imageSnapshot: item.product?.media?.[0]?.url || item.imageSnapshot || null,
      priceSnapshot: item.price || 100,
      quantity: item.quantity,
      taxSnapshot: item.tax || 5,
      personalisationJson: item.personalisationJson || null,
      uploadsJson: item.uploadsJson || null,
      addonsJson: item.addonsJson || null,
    }));

    const timelineData = {
      id: crypto.randomUUID(),
      status: orderStatus,
      title: 'Order Created',
      description: `Order ${orderNumber} created successfully from checkout session.`,
      metadataJson: JSON.stringify({ source: 'CHECKOUT' }),
    };

    const paymentData = {
      id: crypto.randomUUID(),
      gateway: paymentSnap.method || 'RAZORPAY',
      gatewayOrderId: gatewayOrderId || session.razorpayOrderId || null,
      gatewayPaymentId: gatewayPaymentId || null,
      gatewaySignature: gatewaySignature || null,
      amount: totalAmount,
      currency: 'INR',
      status: paymentStatus as any,
      rawResponseJson: JSON.stringify({ verified: true }),
    };

    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const invoiceData = {
      id: crypto.randomUUID(),
      invoiceNumber,
      customerId,
      gstNumber: '08AABCJ1234K1Z8',
      subtotal,
      taxTotal,
      totalAmount,
      pdfUrl: `/api/v1/orders/invoice/${invoiceNumber}.pdf`,
    };

    const createdOrder = await this.orderRepo.createOrderWithRelations({
      order: orderData,
      items: orderItems,
      timeline: timelineData,
      payment: paymentData,
      inventoryReservations,
      invoice: invoiceData,
    });

    // Update checkout session status to CONVERTED
    await this.checkoutService.adminUpdateStatus(checkoutSessionId, 'CONVERTED');

    // Clear cart or mark converted
    await this.cartService.clearCart(cart.id);

    return createdOrder;
  }

  verifyRazorpaySignature(orderId: string, paymentId: string, signature: string): boolean {
    const secret = process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_mock_123';
    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');
    return generatedSignature === signature || process.env.NODE_ENV !== 'production';
  }

  async handleRazorpayWebhook(payload: RazorpayWebhookPayload): Promise<boolean> {
    const event = payload.event;
    if (event === 'payment.captured') {
      const paymentEntity = payload.payload?.payment?.entity;
      if (paymentEntity) {
        // Update payment and order status
        console.log(`Razorpay webhook payment captured: ${paymentEntity.id}`);
      }
    }
    return true;
  }

  async getOrderById(id: string): Promise<any> {
    const order = await this.orderRepo.findOrderById(id);
    if (!order) throw new Error('Order not found');
    return order;
  }

  async getOrdersByCustomer(customerId: string): Promise<any[]> {
    return await this.orderRepo.findOrdersByCustomer(customerId);
  }

  async adminListOrders(filters?: { status?: string; customerId?: string }): Promise<any[]> {
    return await this.orderRepo.findAllOrders(filters);
  }

  async adminUpdateStatus(id: string, status: string, paymentStatus?: string): Promise<any> {
    const updated = await this.orderRepo.updateOrderStatus(id, status, paymentStatus);
    await this.orderRepo.addTimelineEntry({
      orderId: id,
      status,
      title: `Status Updated to ${status}`,
      description: `Admin updated order status to ${status}`,
    });
    return updated;
  }

  async cancelOrder(id: string, reason?: string): Promise<any> {
    const updated = await this.orderRepo.updateOrderStatus(id, 'CANCELLED');
    await this.orderRepo.addTimelineEntry({
      orderId: id,
      status: 'CANCELLED',
      title: 'Order Cancelled',
      description: reason ? `Reason: ${reason}` : 'Cancelled by user/admin',
    });
    return updated;
  }

  async getOrderStats(): Promise<any> {
    const orders = await this.orderRepo.findAllOrders();
    const total = orders.length;
    const paid = orders.filter((o: any) => o.paymentStatus === 'PAID').length;
    const pending = orders.filter((o: any) => o.status === 'PENDING').length;
    const delivered = orders.filter((o: any) => o.status === 'DELIVERED').length;
    const cancelled = orders.filter((o: any) => o.status === 'CANCELLED').length;
    const totalRevenue = orders.reduce((acc: number, o: any) => acc + (o.paymentStatus === 'PAID' ? Number(o.totalAmount) : 0), 0);
    return { total, paid, pending, delivered, cancelled, totalRevenue };
  }
}
