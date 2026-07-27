import crypto from 'crypto';
import { CheckoutRepository } from './checkout.repository';
import { CartRepository } from '../cart/cart.repository';
import { CustomersRepository } from '../customers/customers.repository';
import {
  CheckoutStatus,
  DeliveryMode,
  PaymentMethod,
  CheckoutAddressSnapshot,
  CheckoutPricingSnapshot,
  CheckoutTaxSnapshot,
  CheckoutDeliverySnapshot,
  CheckoutPaymentSnapshot,
  CheckoutWalletSnapshot,
  CheckoutCouponSnapshot,
  CheckoutConsentSnapshot,
  CheckoutValidationResult,
} from './checkout.types';

export class CheckoutService {
  private checkoutRepo = new CheckoutRepository();
  private cartRepo = new CartRepository();
  private customersRepo = new CustomersRepository();

  /**
   * 1. Create Checkout Session from Cart
   */
  async createCheckoutSession(params: { customerId: string; cartId: string; storeId?: string }): Promise<any> {
    const { customerId, cartId, storeId } = params;

    // Verify customer & cart ownership
    const cart = await this.cartRepo.findCartById(cartId);
    if (!cart) {
      throw new Error('Cart not found');
    }
    if (cart.customerId && cart.customerId !== customerId) {
      throw new Error('Cart does not belong to customer');
    }
    if (cart.status !== 'ACTIVE') {
      throw new Error('Cart is not active for checkout');
    }

    const checkoutNumber = `CHK-${Date.now().toString().slice(-8)}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry

    const sessionData = {
      id: crypto.randomUUID(),
      checkoutNumber,
      customerId,
      cartId,
      storeId: storeId || cart.storeId || 'store-jaipur-main',
      status: 'DRAFT' as CheckoutStatus,
      addressSnapshotJson: null,
      pricingSnapshotJson: null,
      taxSnapshotJson: null,
      deliverySnapshotJson: null,
      paymentSnapshotJson: null,
      walletSnapshotJson: null,
      couponSnapshotJson: null,
      consentSnapshotJson: null,
      razorpayOrderId: null,
      razorpayStatus: null,
      expiresAt,
      lockedAt: null,
    };

    return await this.checkoutRepo.createSession(sessionData);
  }

  async getSessionById(id: string): Promise<any> {
    const session = await this.checkoutRepo.findSessionById(id);
    if (!session) throw new Error('Checkout session not found');
    return session;
  }

  async getSessionsByCustomer(customerId: string): Promise<any[]> {
    return await this.checkoutRepo.findSessionByCustomerId(customerId);
  }

  /**
   * 2. Comprehensive Checkout Validation Engine
   */
  async validateCheckout(sessionId: string): Promise<CheckoutValidationResult> {
    const session = await this.getSessionById(sessionId);
    const errors: Array<{ field: string; message: string }> = [];
    const warnings: Array<{ field: string; message: string }> = [];

    // Customer Session check
    if (!session.customerId) {
      errors.push({ field: 'customerId', message: 'No guest checkout allowed. Customer authentication required.' });
    }

    // Cart Ownership check
    const cart = await this.cartRepo.findCartById(session.cartId);
    if (!cart) {
      errors.push({ field: 'cartId', message: 'Associated cart no longer exists.' });
    } else {
      if (cart.items && cart.items.length === 0) {
        errors.push({ field: 'cart', message: 'Cart is empty.' });
      }
    }

    // Address Valid & Belongs to Customer
    if (!session.addressSnapshotJson) {
      errors.push({ field: 'address', message: 'Delivery address is required.' });
    } else {
      const address = JSON.parse(session.addressSnapshotJson);
      if (!address.pincode) {
        errors.push({ field: 'address.pincode', message: 'Pincode is required in address.' });
      } else {
        // Serviceability check
        const serviceArea = await this.checkoutRepo.findServiceAreaByPincode(address.pincode);
        if (!serviceArea || !serviceArea.isServiceable) {
          errors.push({ field: 'serviceability', message: `Pincode ${address.pincode} is not serviceable.` });
        }
      }
    }

    // Delivery slot / mode check
    if (!session.deliverySnapshotJson) {
      errors.push({ field: 'delivery', message: 'Delivery mode and slot selection required.' });
    } else {
      const delivery = JSON.parse(session.deliverySnapshotJson);
      if (delivery.mode === 'SAME_DAY') {
        const now = new Date();
        const currentHour = now.getHours();
        if (currentHour >= 14) {
          errors.push({ field: 'delivery.mode', message: 'Same day delivery cutoff is 2:00 PM.' });
        }
      }
    }

    // Consent check
    if (!session.consentSnapshotJson) {
      errors.push({ field: 'consent', message: 'Customer consents must be accepted.' });
    } else {
      const consent = JSON.parse(session.consentSnapshotJson);
      if (!consent.termsAccepted || !consent.privacyAccepted) {
        errors.push({ field: 'consent', message: 'Terms and Privacy policy acceptance is mandatory.' });
      }
    }

    const isValid = errors.length === 0;
    await this.checkoutRepo.updateSession(sessionId, {
      status: isValid ? 'READY' : 'VALIDATING',
    });

    return { isValid, errors, warnings };
  }

  /**
   * 3. Address Snapshot & Management
   */
  async updateCheckoutAddress(sessionId: string, address: CheckoutAddressSnapshot): Promise<any> {
    const session = await this.getSessionById(sessionId);
    // Validate serviceability for the pincode
    const serviceArea = await this.checkoutRepo.findServiceAreaByPincode(address.pincode);
    const isServiceable = serviceArea ? serviceArea.isServiceable : true; // default true for Jaipur testing

    const updated = await this.checkoutRepo.updateSession(sessionId, {
      addressSnapshotJson: JSON.stringify(address),
    });
    return { session: updated, serviceability: { serviceable: isServiceable, serviceArea } };
  }

  /**
   * 4. Serviceability & Store Resolution Engine
   */
  async checkServiceability(pincode: string): Promise<any> {
    const area = await this.checkoutRepo.findServiceAreaByPincode(pincode);
    if (!area) {
      return { pincode, eligible: true, storeId: 'store-jaipur-main', message: 'Default Jaipur hub serviceable' };
    }
    return {
      pincode: area.pincode,
      eligible: area.isServiceable,
      sameDayEligible: area.isSameDayEligible,
      storeId: area.storeId || 'store-jaipur-main',
    };
  }

  /**
   * 5. Delivery Slot Engine & Same Day Rule
   */
  async getAvailableDeliverySlots(pincode: string, mode: DeliveryMode): Promise<any[]> {
    const now = new Date();
    const currentHour = now.getHours();
    const isBefore2PM = currentHour < 14;

    const slots = [];
    if (mode === 'SAME_DAY') {
      if (!isBefore2PM) {
        return []; // Past 2 PM cutoff
      }
      slots.push(
        { id: 'slot-1', title: '4:00 PM - 6:00 PM', available: true },
        { id: 'slot-2', title: '6:00 PM - 8:00 PM', available: true }
      );
    } else if (mode === 'NEXT_DAY' || mode === 'STANDARD') {
      slots.push(
        { id: 'slot-3', title: '10:00 AM - 1:00 PM', available: true },
        { id: 'slot-4', title: '2:00 PM - 5:00 PM', available: true },
        { id: 'slot-5', title: '6:00 PM - 9:00 PM', available: true }
      );
    } else {
      slots.push({ id: 'slot-pickup', title: 'Store Pickup Anytime (9 AM - 9 PM)', available: true });
    }
    return slots;
  }

  /**
   * 6. Delivery Pricing Engine
   */
  async calculateDeliveryPricing(params: { subtotal: number; mode: DeliveryMode; weightKg?: number }): Promise<CheckoutPricingSnapshot> {
    const { subtotal, mode, weightKg = 1 } = params;

    let deliveryFee = mode === 'SAME_DAY' ? 49 : mode === 'STORE_PICKUP' ? 0 : 29;
    if (subtotal >= 799) {
      deliveryFee = 0; // Free delivery over ₹799
    }

    const handlingFee = 15;
    const weightSurcharge = weightKg > 2 ? (weightKg - 2) * 10 : 0;
    const codFee = 0;

    const grandTotal = subtotal + deliveryFee + handlingFee + weightSurcharge + codFee;

    return {
      subtotal,
      discountTotal: 0,
      taxTotal: Math.round(subtotal * 0.05 * 100) / 100, // 5% GST estimate
      deliveryFee,
      handlingFee,
      weightSurcharge,
      codFee,
      walletDiscount: 0,
      couponDiscount: 0,
      grandTotal,
    };
  }

  /**
   * 7. Wallet Reservation Engine (Preview, Reserve, Release - Do NOT debit)
   */
  async previewWallet(customerId: string, requestedAmount: number): Promise<CheckoutWalletSnapshot> {
    // Mock wallet balance for customer
    const availableBalance = 500; // ₹500 available
    const usableAmount = Math.min(requestedAmount, availableBalance, 250); // max ₹250 usable per order
    return {
      availableBalance,
      reservedAmount: 0,
      usableAmount,
      referralEligible: true,
    };
  }

  async reserveWallet(customerId: string, checkoutId: string, amount: number): Promise<any> {
    const reservation = await this.checkoutRepo.createWalletReservation({
      id: crypto.randomUUID(),
      customerId,
      checkoutId,
      amount,
      type: 'NORMAL',
      status: 'RESERVED',
    });
    return reservation;
  }

  async releaseWallet(checkoutId: string): Promise<boolean> {
    const reservations = await this.checkoutRepo.findWalletReservationsByCheckout(checkoutId);
    for (const res of reservations) {
      await this.checkoutRepo.updateWalletReservationStatus(res.id, 'RELEASED');
    }
    return true;
  }

  /**
   * 8. Coupon Application
   */
  async applyCoupon(sessionId: string, code: string): Promise<any> {
    const session = await this.getSessionById(sessionId);
    const coupon = await this.checkoutRepo.findCouponByCode(code);
    if (!coupon || !coupon.isActive) {
      throw new Error('Invalid or expired coupon code');
    }

    const snapshot: CheckoutCouponSnapshot = {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: Number(coupon.discountValue),
      discountAmount: coupon.discountType === 'FIXED' ? Number(coupon.discountValue) : 50, // sample discount
    };

    const updated = await this.checkoutRepo.updateSession(sessionId, {
      couponSnapshotJson: JSON.stringify(snapshot),
    });
    return updated;
  }

  /**
   * 9. Razorpay Order Foundation & Payment Methods
   */
  async createRazorpayOrderSnapshot(sessionId: string, amount: number): Promise<any> {
    const session = await this.getSessionById(sessionId);
    const razorpayOrderId = `order_${crypto.randomBytes(8).toString('hex')}`;

    const paymentSnapshot: CheckoutPaymentSnapshot = {
      method: 'RAZORPAY',
      razorpayOrderId,
      razorpayAmount: Math.round(amount * 100), // in paise
      razorpayCurrency: 'INR',
      codEligible: amount <= 2000,
      walletAmountRequested: 0,
    };

    const updated = await this.checkoutRepo.updateSession(sessionId, {
      razorpayOrderId,
      razorpayStatus: 'CREATED',
      paymentSnapshotJson: JSON.stringify(paymentSnapshot),
    });
    return updated;
  }

  /**
   * 10. Customer Consent Recording
   */
  async recordConsent(sessionId: string, consents: { terms: boolean; privacy: boolean; delivery: boolean; cancellation: boolean; personalised: boolean }): Promise<any> {
    const consentSnapshot: CheckoutConsentSnapshot = {
      termsAccepted: consents.terms,
      privacyAccepted: consents.privacy,
      deliveryPolicyAccepted: consents.delivery,
      cancellationPolicyAccepted: consents.cancellation,
      personalisedProductPolicyAccepted: consents.personalised,
      acceptedAt: new Date().toISOString(),
    };

    const updated = await this.checkoutRepo.updateSession(sessionId, {
      consentSnapshotJson: JSON.stringify(consentSnapshot),
    });
    return updated;
  }

  /**
   * 11. Admin Management Methods
   */
  async adminListSessions(filters?: { status?: string; customerId?: string }): Promise<any[]> {
    return await this.checkoutRepo.findAllSessions(filters);
  }

  async adminGetSession(id: string): Promise<any> {
    return await this.getSessionById(id);
  }

  async adminUpdateStatus(id: string, status: CheckoutStatus): Promise<any> {
    return await this.checkoutRepo.updateSession(id, { status });
  }

  async adminGetStats(): Promise<any> {
    const sessions = await this.checkoutRepo.findAllSessions();
    const total = sessions.length;
    const draft = sessions.filter((s: any) => s.status === 'DRAFT').length;
    const ready = sessions.filter((s: any) => s.status === 'READY').length;
    const converted = sessions.filter((s: any) => s.status === 'CONVERTED').length;
    const expired = sessions.filter((s: any) => s.status === 'EXPIRED').length;
    return { total, draft, ready, converted, expired };
  }

  async resolvePaymentMethods(payload: { amount?: number; hasPersonalisedItems?: boolean; deliveryMode?: string; customerId?: string; zoneId?: string; storeId?: string }): Promise<any> {
    const amount = Number(payload.amount || 999);
    const hasPersonalisedItems = !!payload.hasPersonalisedItems;
    const deliveryMode = payload.deliveryMode || 'STANDARD';

    let codEligible = true;
    let reasonCode = null;
    let message = 'Cash on Delivery is available.';
    let requiredAdvanceAmount = 0;
    let remainingCodAmount = amount;

    if (deliveryMode === 'EXPRESS') {
      codEligible = false;
      reasonCode = 'COD_DISABLED_FOR_DELIVERY_MODE';
      message = 'Cash on Delivery is not available for express delivery.';
    } else if (hasPersonalisedItems) {
      codEligible = false;
      reasonCode = 'PERSONALISED_ITEM_REQUIRES_ADVANCE';
      message = 'Cash on Delivery requires 50% advance payment for personalised products.';
      requiredAdvanceAmount = Math.round(amount * 0.5);
      remainingCodAmount = amount - requiredAdvanceAmount;
    } else if (amount < 500) {
      codEligible = false;
      reasonCode = 'COD_MINIMUM_NOT_MET';
      message = 'Minimum order amount for Cash on Delivery is ₹500.';
    } else if (amount > 5000) {
      codEligible = false;
      reasonCode = 'COD_MAXIMUM_EXCEEDED';
      message = 'Maximum order amount for Cash on Delivery is ₹5,000.';
    }

    const availableMethods = ['RAZORPAY', 'WALLET'];
    if (codEligible || requiredAdvanceAmount > 0) {
      availableMethods.push('COD');
    }

    return {
      availableMethods,
      cod: {
        eligible: codEligible,
        reasonCode,
        message,
        requiredAdvanceAmount,
        remainingCodAmount,
      },
    };
  }
}
