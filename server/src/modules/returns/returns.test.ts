import { describe, it, expect, beforeEach } from 'vitest';
import { ReturnsService } from './returns.service';
import { SupportService } from '../support/support.service';
import { OrderService } from '../orders/order.service';
import { CheckoutService } from '../checkout/checkout.service';
import { CartService } from '../cart/cart.service';

describe('Post-Delivery Operations Engine - Batch 20', () => {
  const returnsService = new ReturnsService();
  const supportService = new SupportService();
  const orderService = new OrderService();
  const checkoutService = new CheckoutService();
  const cartService = new CartService();

  const testCustomerId = 'cust-returns-test-1';
  let testOrderId: string;
  let testReturnId: string;
  let testTicketId: string;

  beforeEach(async () => {
    const cart = await cartService.getOrCreateCart({ customerId: testCustomerId });
    await cartService.addItemToCart(cart.id, {
      productId: 'prod-gift-ret-1',
      quantity: 1,
    });

    const session = await checkoutService.createCheckoutSession({
      customerId: testCustomerId,
      cartId: cart.id,
    });

    const checkoutRepo = new (await import('../checkout/checkout.repository')).CheckoutRepository();
    await checkoutRepo.updateSession(session.id, {
      deliverySnapshotJson: JSON.stringify({ mode: 'INSTANT', deliveryFee: 0, handlingFee: 15 }),
      paymentSnapshotJson: JSON.stringify({ method: 'RAZORPAY' }),
      addressSnapshotJson: JSON.stringify({ street: '456 Tonk Road', city: 'Jaipur', state: 'Rajasthan', pincode: '302015' }),
    });

    await checkoutService.recordConsent(session.id, {
      terms: true,
      privacy: true,
      delivery: true,
      cancellation: true,
      personalised: true,
    });
    await checkoutService.validateCheckout(session.id);

    const order = await orderService.createOrderFromCheckout({
      checkoutSessionId: session.id,
      customerId: testCustomerId,
      paymentGateway: 'RAZORPAY',
    });

    // Mark order as DELIVERED
    const updatedOrder = await orderService.adminUpdateStatus(order.id, 'DELIVERED');
    testOrderId = updatedOrder.id;
  });

  it('should reject return for non-valid reason on personalised item', async () => {
    // Create a specific personalised order for this test
    const cart = await cartService.getOrCreateCart({ customerId: testCustomerId });
    await cartService.addItemToCart(cart.id, {
      productId: 'prod-gift-ret-personalized',
      quantity: 1,
      personalisationJson: JSON.stringify({ name: 'Custom Engraving' }),
    } as any);

    const session = await checkoutService.createCheckoutSession({
      customerId: testCustomerId,
      cartId: cart.id,
    });

    const checkoutRepo = new (await import('../checkout/checkout.repository')).CheckoutRepository();
    await checkoutRepo.updateSession(session.id, {
      deliverySnapshotJson: JSON.stringify({ mode: 'INSTANT', deliveryFee: 0, handlingFee: 15 }),
      paymentSnapshotJson: JSON.stringify({ method: 'RAZORPAY' }),
      addressSnapshotJson: JSON.stringify({ street: '456 Tonk Road', city: 'Jaipur', state: 'Rajasthan', pincode: '302015' }),
    });

    await checkoutService.recordConsent(session.id, {
      terms: true,
      privacy: true,
      delivery: true,
      cancellation: true,
      personalised: true,
    });
    await checkoutService.validateCheckout(session.id);

    const order = await orderService.createOrderFromCheckout({
      checkoutSessionId: session.id,
      customerId: testCustomerId,
      paymentGateway: 'RAZORPAY',
    });

    const deliveredOrder = await orderService.adminUpdateStatus(order.id, 'DELIVERED');
    const orderItem = deliveredOrder.items[0];

    const ret = await returnsService.createReturnRequest({
      orderId: deliveredOrder.id,
      orderItemId: orderItem.id,
      customerId: testCustomerId,
      reason: 'Late Delivery', // Not allowed for personalised
      remarks: 'Arrived a bit late',
    });

    expect(ret.eligibilityStatus).toBe('NOT_ELIGIBLE');
    expect(ret.status).toBe('REJECTED');
  });

  it('should approve return for valid damage reason on personalised item', async () => {
    const ret = await returnsService.createReturnRequest({
      orderId: testOrderId,
      customerId: testCustomerId,
      reason: 'Damaged',
      remarks: 'Glass photo frame is shattered',
      images: ['https://example.com/damage.jpg'],
    });

    expect(ret.eligibilityStatus).toBe('ELIGIBLE');
    expect(ret.status).toBe('REQUESTED');
    testReturnId = ret.id;
  });

  it('should record inspection and pass/fail return', async () => {
    const ret = await returnsService.createReturnRequest({
      orderId: testOrderId,
      customerId: testCustomerId,
      reason: 'Wrong Item',
      remarks: 'Received mug instead of frame',
    });
    testReturnId = ret.id;

    const inspection = await returnsService.recordInspection({
      returnId: testReturnId,
      result: 'PASS',
      condition: 'Unopened packaging',
      inspectorNotes: 'Confirmed wrong item shipped',
    });

    expect(inspection.result).toBe('PASS');
    const updatedRet = await returnsService.getReturnById(testReturnId);
    expect(updatedRet.status).toBe('INSPECTION_PASSED');
  });

  it('should create replacement order after inspection passed', async () => {
    const ret = await returnsService.createReturnRequest({
      orderId: testOrderId,
      customerId: testCustomerId,
      reason: 'Manufacturing Defect',
      remarks: 'Print blurred',
    });
    testReturnId = ret.id;

    await returnsService.recordInspection({
      returnId: testReturnId,
      result: 'PASS',
      inspectorNotes: 'Defect verified',
    });

    const replacement = await returnsService.createReplacement({ returnId: testReturnId });
    expect(replacement).toBeDefined();
    expect(replacement.replacementNumber).toBeDefined();
    expect(replacement.status).toBe('REPLACEMENT_INITIATED');
  });

  it('should process refund and prevent double refunding', async () => {
    const refund = await returnsService.processRefund({
      orderId: testOrderId,
      amount: 499,
      mode: 'RAZORPAY',
      reference: 'pay_refund_12345',
    });

    expect(refund).toBeDefined();
    expect(refund.status).toBe('COMPLETED');

    // Attempting to refund more than order total should throw error
    await expect(returnsService.processRefund({
      orderId: testOrderId,
      amount: 9999,
      mode: 'RAZORPAY',
    })).rejects.toThrow('Refund amount exceeds order total amount');
  });

  it('should create support ticket and add chat messages', async () => {
    const ticket = await supportService.createTicket({
      customerId: testCustomerId,
      orderId: testOrderId,
      category: 'Return',
      priority: 'HIGH',
      subject: 'Issue with reverse pickup time',
      message: 'Can pickup be scheduled for evening?',
    });

    expect(ticket).toBeDefined();
    expect(ticket.ticketNumber).toBeDefined();
    expect(ticket.messages.length).toBe(1);
    testTicketId = ticket.id;

    const msg = await supportService.addMessage({
      ticketId: testTicketId,
      senderType: 'ADMIN',
      senderName: 'Support Agent Rajesh',
      message: 'Sure, we have updated your pickup slot to 5 PM.',
    });

    expect(msg).toBeDefined();
    const updatedTicket = await supportService.getTicketById(testTicketId);
    expect(updatedTicket.messages.length).toBe(2);
  });
});
