import { describe, it, expect, beforeEach } from 'vitest';
import { CheckoutService } from './checkout.service';
import { CartService } from '../cart/cart.service';

describe('Checkout Engine - Batch 16', () => {
  const checkoutService = new CheckoutService();
  const cartService = new CartService();

  let testCustomerId = 'cust-test-123';
  let testCartId: string;
  let testCheckoutId: string;

  beforeEach(async () => {
    const cart = await cartService.getOrCreateCart({ customerId: testCustomerId });
    testCartId = cart.id;
  });

  it('should create a checkout session successfully for logged in customer', async () => {
    const session = await checkoutService.createCheckoutSession({
      customerId: testCustomerId,
      cartId: testCartId,
    });
    expect(session).toBeDefined();
    expect(session.id).toBeDefined();
    expect(session.status).toBe('DRAFT');
    testCheckoutId = session.id;
  });

  it('should reject guest checkout (missing customerId)', async () => {
    await expect(
      checkoutService.createCheckoutSession({
        customerId: '',
        cartId: testCartId,
      })
    ).rejects.toThrow();
  });

  it('should update address and check serviceability', async () => {
    const session = await checkoutService.createCheckoutSession({
      customerId: testCustomerId,
      cartId: testCartId,
    });

    const addrResult = await checkoutService.updateCheckoutAddress(session.id, {
      id: 'addr-1',
      fullName: 'Ajay Sharma',
      phone: '9876543210',
      addressLine1: 'M.I. Road',
      city: 'Jaipur',
      state: 'Rajasthan',
      pincode: '302001',
      addressType: 'HOME',
    });
    expect(addrResult.session).toBeDefined();
    expect(addrResult.serviceability.serviceable).toBe(true);
  });

  it('should calculate delivery pricing correctly', async () => {
    const pricing = await checkoutService.calculateDeliveryPricing({
      subtotal: 850,
      mode: 'SAME_DAY',
    });
    expect(pricing.deliveryFee).toBe(0); // free delivery over 799
    expect(pricing.grandTotal).toBeGreaterThan(850);
  });

  it('should preview and reserve wallet without debiting', async () => {
    const session = await checkoutService.createCheckoutSession({
      customerId: testCustomerId,
      cartId: testCartId,
    });
    const walletPreview = await checkoutService.previewWallet(testCustomerId, 100);
    expect(walletPreview.usableAmount).toBeLessThanOrEqual(500);

    const reservation = await checkoutService.reserveWallet(testCustomerId, session.id, 100);
    expect(reservation.status).toBe('RESERVED');
  });

  it('should create Razorpay order foundation', async () => {
    const session = await checkoutService.createCheckoutSession({
      customerId: testCustomerId,
      cartId: testCartId,
    });
    const updated = await checkoutService.createRazorpayOrderSnapshot(session.id, 999);
    expect(updated.razorpayOrderId).toBeDefined();
    expect(updated.razorpayStatus).toBe('CREATED');
  });

  it('should record customer consent successfully', async () => {
    const session = await checkoutService.createCheckoutSession({
      customerId: testCustomerId,
      cartId: testCartId,
    });
    const updated = await checkoutService.recordConsent(session.id, {
      terms: true,
      privacy: true,
      delivery: true,
      cancellation: true,
      personalised: true,
    });
    expect(updated.consentSnapshotJson).toBeDefined();
  });
});
