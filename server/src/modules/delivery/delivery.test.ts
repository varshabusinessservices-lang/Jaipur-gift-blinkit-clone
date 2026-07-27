import { describe, it, expect, beforeEach } from 'vitest';
import { DeliveryService } from './delivery.service';
import { OrderService } from '../orders/order.service';
import { CheckoutService } from '../checkout/checkout.service';
import { CartService } from '../cart/cart.service';

describe('Delivery Management Engine - Batch 19', () => {
  const deliveryService = new DeliveryService();
  const orderService = new OrderService();
  const checkoutService = new CheckoutService();
  const cartService = new CartService();

  const testCustomerId = 'cust-delivery-test-1';
  let testOrderId: string;
  let testTaskId: string;
  let testRiderId: string;

  beforeEach(async () => {
    const cart = await cartService.getOrCreateCart({ customerId: testCustomerId });
    await cartService.addItemToCart(cart.id, {
      productId: 'prod-gift-1',
      quantity: 1,
    });

    const session = await checkoutService.createCheckoutSession({
      customerId: testCustomerId,
      cartId: cart.id,
    });

    const checkoutRepo = new (await import('../checkout/checkout.repository')).CheckoutRepository();
    await checkoutRepo.updateSession(session.id, {
      deliverySnapshotJson: JSON.stringify({ mode: 'NEXT_DAY', deliveryFee: 0, handlingFee: 15 }),
      paymentSnapshotJson: JSON.stringify({ method: 'COD' }),
      addressSnapshotJson: JSON.stringify({ street: '123 C-Scheme', city: 'Jaipur', state: 'Rajasthan', pincode: '302001' }),
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
      paymentGateway: 'COD',
    });

    // Mark order as READY_FOR_DISPATCH
    const updatedOrder = await orderService.adminUpdateStatus(order.id, 'READY_FOR_DISPATCH');
    testOrderId = updatedOrder.id;

    const riders = await deliveryService.getRiders();
    testRiderId = riders[0].id;
  });

  it('should create delivery task from order when ready for dispatch', async () => {
    const task = await deliveryService.createDeliveryTaskForOrder({
      orderId: testOrderId,
      estimatedDistance: 2.8,
      estimatedDuration: 15,
    });

    expect(task).toBeDefined();
    expect(task.taskNumber).toBeDefined();
    expect(task.status).toBe('NEW');
    expect(task.otp).toBeDefined();
    expect(task.otp.length).toBe(6);
    testTaskId = task.id;
  });

  it('should assign and reassign rider to delivery task', async () => {
    const task = await deliveryService.createDeliveryTaskForOrder({ orderId: testOrderId });
    testTaskId = task.id;

    const assigned = await deliveryService.assignRider({
      taskId: testTaskId,
      riderId: testRiderId,
    });
    expect(assigned.status).toBe('ASSIGNED');
    expect(assigned.riderId).toBe(testRiderId);

    const riders = await deliveryService.getRiders();
    const secondRiderId = riders[1] ? riders[1].id : testRiderId;
    const reassigned = await deliveryService.assignRider({
      taskId: testTaskId,
      riderId: secondRiderId,
    });
    expect(reassigned.riderId).toBe(secondRiderId);
  });

  it('should handle pickup, out for delivery, and arrival', async () => {
    const task = await deliveryService.createDeliveryTaskForOrder({ orderId: testOrderId });
    testTaskId = task.id;

    await deliveryService.assignRider({ taskId: testTaskId, riderId: testRiderId });
    await deliveryService.riderAcceptTask(testTaskId);

    const pickedUp = await deliveryService.markPickedUp(testTaskId);
    expect(pickedUp.status).toBe('PICKED_UP');

    const outForDelivery = await deliveryService.setOutForDelivery(testTaskId);
    expect(outForDelivery.status).toBe('OUT_FOR_DELIVERY');

    const arrived = await deliveryService.markArrived(testTaskId);
    expect(arrived.status).toBe('ARRIVED');
  });

  it('should verify OTP and complete delivery successfully', async () => {
    const task = await deliveryService.createDeliveryTaskForOrder({ orderId: testOrderId });
    testTaskId = task.id;
    const correctOtp = task.otp;

    await deliveryService.assignRider({ taskId: testTaskId, riderId: testRiderId });
    await deliveryService.markPickedUp(testTaskId);

    // Test failed OTP
    await expect(deliveryService.verifyOtpAndDeliver({
      taskId: testTaskId,
      otp: '000000',
    })).rejects.toThrow('Invalid OTP provided');

    // Test correct OTP
    const delivered = await deliveryService.verifyOtpAndDeliver({
      taskId: testTaskId,
      otp: correctOtp,
    });
    expect(delivered.status).toBe('DELIVERED');

    const order = await orderService.getOrderById(testOrderId);
    expect(order.status).toBe('DELIVERED');
  });

  it('should capture proof of delivery', async () => {
    const task = await deliveryService.createDeliveryTaskForOrder({ orderId: testOrderId });
    testTaskId = task.id;

    const delivered = await deliveryService.recordProofOfDelivery({
      taskId: testTaskId,
      recipientName: 'Mrs. Sharma',
      recipientRelation: 'Mother',
      notes: 'Handed over securely',
    });
    expect(delivered.status).toBe('DELIVERED');
    expect(delivered.proofOfDeliveryJson).toContain('Mrs. Sharma');
  });

  it('should handle delivery exception and failures', async () => {
    const task = await deliveryService.createDeliveryTaskForOrder({ orderId: testOrderId });
    testTaskId = task.id;

    const failed = await deliveryService.reportException({
      taskId: testTaskId,
      reason: 'CUSTOMER_UNAVAILABLE',
      notes: 'Called multiple times, phone switched off',
    });
    expect(failed.status).toBe('FAILED');
    expect(failed.exceptionJson).toContain('CUSTOMER_UNAVAILABLE');
  });

  it('should return customer tracking and timelines correctly', async () => {
    const task = await deliveryService.createDeliveryTaskForOrder({ orderId: testOrderId });
    testTaskId = task.id;

    const fullTask = await deliveryService.getTaskById(testTaskId);
    expect(fullTask.timelines.length).toBeGreaterThan(0);

    const trackingView = deliveryService.getCustomerTrackingView('OUT_FOR_DELIVERY', fullTask);
    expect(trackingView.step).toBe(4);
    expect(trackingView.label).toContain('Out For Delivery');
  });
});
