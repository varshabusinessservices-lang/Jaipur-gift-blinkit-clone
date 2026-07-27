import { describe, it, expect, beforeEach } from 'vitest';
import { ProductionService } from './production.service';
import { OrderService } from '../orders/order.service';
import { CheckoutService } from '../checkout/checkout.service';
import { CartService } from '../cart/cart.service';

describe('Production Management Engine - Batch 18', () => {
  const productionService = new ProductionService();
  const orderService = new OrderService();
  const checkoutService = new CheckoutService();
  const cartService = new CartService();

  const testCustomerId = 'cust-prod-test-1';
  let testOrderId: string;

  beforeEach(async () => {
    const cart = await cartService.getOrCreateCart({ customerId: testCustomerId });
    await cartService.addItemToCart(cart.id, {
      productId: 'prod-mug-1',
      quantity: 1,
    });

    const session = await checkoutService.createCheckoutSession({
      customerId: testCustomerId,
      cartId: cart.id,
    });

    const checkoutRepo = new (await import('../checkout/checkout.repository')).CheckoutRepository();
    await checkoutRepo.updateSession(session.id, {
      addressSnapshotJson: JSON.stringify({ name: 'Test', addressLine1: '123 Main St', pincode: '302001' }), deliverySnapshotJson: JSON.stringify({ mode: 'NEXT_DAY', deliveryFee: 0, handlingFee: 15 }),
      paymentSnapshotJson: JSON.stringify({ method: 'COD' }),
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

    // Mark order as READY_FOR_PRODUCTION
    const updatedOrder = await orderService.adminUpdateStatus(order.id, 'READY_FOR_PRODUCTION');
    testOrderId = updatedOrder.id;
  });

  it('should initialize a production job from an order', async () => {
    const job = await productionService.createProductionJobForOrder(testOrderId);
    expect(job).toBeDefined();
    expect(job.jobNumber).toBeDefined();
    expect(job.items.length).toBeGreaterThan(0);
    expect(job.status).toBe('ARTWORK_PENDING');
  });

  it('should process artwork review and transition item to print queue', async () => {
    const job = await productionService.createProductionJobForOrder(testOrderId);
    const item = job.items[0];

    const updatedItem = await productionService.reviewArtwork({
      itemId: item.id,
      action: 'APPROVE',
      notes: 'Artwork looks great',
      staffName: 'Ramesh Designer',
    });

    expect(updatedItem.artworkStatus).toBe('APPROVED');
    expect(updatedItem.printStatus).toBe('QUEUED');
  });

  it('should handle print assignment, printing start, and completion', async () => {
    const job = await productionService.createProductionJobForOrder(testOrderId);
    const item = job.items[0];

    await productionService.reviewArtwork({ itemId: item.id, action: 'APPROVE' });

    const printingItem = await productionService.assignPrintAndStart({
      itemId: item.id,
      machineId: 'mach-2',
      station: 'Mug-Press-1',
      staffName: 'Sunil Operator',
    });
    expect(printingItem.printStatus).toBe('PRINTING');

    const printedItem = await productionService.completePrinting(item.id, 'Sunil Operator');
    expect(printedItem.printStatus).toBe('PRINTED');
    expect(printedItem.qcStatus).toBe('PENDING');
  });

  it('should handle quality check pass and packing', async () => {
    const job = await productionService.createProductionJobForOrder(testOrderId);
    const item = job.items[0];

    await productionService.reviewArtwork({ itemId: item.id, action: 'APPROVE' });
    await productionService.assignPrintAndStart({ itemId: item.id, machineId: 'mach-2' });
    await productionService.completePrinting(item.id);

    const qcPassedItem = await productionService.performQualityCheck({
      itemId: item.id,
      result: 'PASS',
      notes: 'Colors vibrant, no defects',
      staffName: 'Vikram Supervisor',
    });
    expect(qcPassedItem.qcStatus).toBe('PASSED');

    const packingStart = await productionService.handlePacking({
      itemId: item.id,
      action: 'START',
      staffName: 'Anita Packer',
    });
    expect(packingStart.packingStatus).toBe('PACKING');

    const packingComplete = await productionService.handlePacking({
      itemId: item.id,
      action: 'COMPLETE',
      packageNotes: 'Gift boxed securely',
      staffName: 'Anita Packer',
    });
    expect(packingComplete.packingStatus).toBe('PACKED');
    expect(packingComplete.status).toBe('READY_FOR_DISPATCH');

    // Verify parent order automatically became READY_FOR_DISPATCH
    const finalOrder = await orderService.getOrderById(testOrderId);
    expect(finalOrder.status).toBe('READY_FOR_DISPATCH');
  });

  it('should handle QC failure and reprint generation', async () => {
    const job = await productionService.createProductionJobForOrder(testOrderId);
    const item = job.items[0];

    await productionService.reviewArtwork({ itemId: item.id, action: 'APPROVE' });
    await productionService.assignPrintAndStart({ itemId: item.id, machineId: 'mach-2' });
    await productionService.completePrinting(item.id);

    const qcFailing = await productionService.performQualityCheck({
      itemId: item.id,
      result: 'FAIL',
      notes: 'Smudge on print',
    });
    expect(qcFailing.qcStatus).toBe('FAILED');

    const reprintItem = await productionService.handleReprint(item.id, 'Smudge defect');
    expect(reprintItem.printStatus).toBe('QUEUED');
    expect(reprintItem.status).toBe('PRINT_QUEUE');
  });

  it('should return simplified customer status view', () => {
    const view = productionService.getCustomerStatusView('PRINTING');
    expect(view.step).toBe(2);
    expect(view.label).toContain('Printing');
  });
});
