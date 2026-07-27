import { describe, it, expect, beforeEach } from 'vitest';
import { OrderService } from './order.service';
import { CheckoutService } from '../checkout/checkout.service';
import { CartService } from '../cart/cart.service';

describe('Order Engine - Batch 17', () => {
  const orderService = new OrderService();
  const checkoutService = new CheckoutService();
  const cartService = new CartService();

  const testCustomerId = 'cust-order-test-1';
  let testCheckoutId: string;
  let testCartId: string;

  beforeEach(async () => {
    const cart = await cartService.getOrCreateCart({ customerId: testCustomerId });
    testCartId = cart.id;
    await cartService.addItemToCart(testCartId, {
      productId: 'prod-test-1',
      quantity: 2,
    });

    const session = await checkoutService.createCheckoutSession({
      customerId: testCustomerId,
      cartId: testCartId,
    });
    testCheckoutId = session.id;

    // Update address
    await checkoutService.updateCheckoutAddress(testCheckoutId, {
      id: 'addr-1',
      fullName: 'Ajay Sharma',
      phone: '9876543210',
      addressLine1: 'M.I. Road',
      city: 'Jaipur',
      state: 'Rajasthan',
      pincode: '302001',
      addressType: 'HOME',
    });

    // Update delivery and consent snapshots directly via checkoutRepo or service methods if available
    const checkoutRepo = new (await import('../checkout/checkout.repository')).CheckoutRepository();
    await checkoutRepo.updateSession(testCheckoutId, {
      deliverySnapshotJson: JSON.stringify({ mode: 'NEXT_DAY', deliveryFee: 0, handlingFee: 15, isSameDay: false }),
      paymentSnapshotJson: JSON.stringify({ method: 'COD' }),
    });

    await checkoutService.recordConsent(testCheckoutId, {
      terms: true,
      privacy: true,
      delivery: true,
      cancellation: true,
      personalised: true,
    });

    await checkoutService.validateCheckout(testCheckoutId);
  });

  it('should create an order successfully from a READY checkout session', async () => {
    const order = await orderService.createOrderFromCheckout({
      checkoutSessionId: testCheckoutId,
      customerId: testCustomerId,
      paymentGateway: 'COD',
    });

    expect(order).toBeDefined();
    expect(order.orderNumber).toBeDefined();
    expect(order.status).toBe('PENDING');
    expect(order.items).toBeDefined();
    expect(order.timelines).toBeDefined();
    expect(order.invoices).toBeDefined();
  });

  it('should verify Razorpay signature successfully in test mode', () => {
    const isValid = orderService.verifyRazorpaySignature('order_test_123', 'pay_test_456', 'any_sig');
    expect(isValid).toBe(true);
  });

  it('should fetch order details and timeline correctly', async () => {
    const order = await orderService.createOrderFromCheckout({
      checkoutSessionId: testCheckoutId,
      customerId: testCustomerId,
      paymentGateway: 'COD',
    });

    const fetched = await orderService.getOrderById(order.id);
    expect(fetched.id).toBe(order.id);
    expect(fetched.timelines.length).toBeGreaterThan(0);
  });

  it('should support order cancellation', async () => {
    const order = await orderService.createOrderFromCheckout({
      checkoutSessionId: testCheckoutId,
      customerId: testCustomerId,
      paymentGateway: 'COD',
    });

    const cancelled = await orderService.cancelOrder(order.id, 'Customer changed mind');
    expect(cancelled.status).toBe('CANCELLED');
  });
});
