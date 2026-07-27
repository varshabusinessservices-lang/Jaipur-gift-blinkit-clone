export type CheckoutStatus =
  | 'DRAFT'
  | 'VALIDATING'
  | 'READY'
  | 'PAYMENT_PENDING'
  | 'LOCKED'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'CONVERTED';

export type DeliveryMode =
  | 'SAME_DAY'
  | 'NEXT_DAY'
  | 'STANDARD'
  | 'STORE_PICKUP'
  | 'MANUAL';

export type PaymentMethod =
  | 'RAZORPAY'
  | 'COD'
  | 'WALLET'
  | 'WALLET_RAZORPAY'
  | 'WALLET_COD';

export interface CheckoutAddressSnapshot {
  id: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  addressType: string;
  latitude?: number;
  longitude?: number;
}

export interface CheckoutPricingSnapshot {
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  deliveryFee: number;
  handlingFee: number;
  weightSurcharge: number;
  codFee: number;
  walletDiscount: number;
  couponDiscount: number;
  grandTotal: number;
}

export interface CheckoutTaxSnapshot {
  items: Array<{
    itemId: string;
    taxRate: number;
    taxAmount: number;
    cgst: number;
    sgst: number;
    igst: number;
  }>;
  totalTax: number;
}

export interface CheckoutDeliverySnapshot {
  mode: DeliveryMode;
  storeId: string;
  slotId?: string;
  slotTime?: string;
  scheduledDate?: string;
  deliveryFee: number;
  handlingFee: number;
  isSameDay: boolean;
  rejectReason?: string;
}

export interface CheckoutPaymentSnapshot {
  method: PaymentMethod;
  razorpayOrderId?: string;
  razorpayAmount?: number;
  razorpayCurrency?: string;
  codEligible: boolean;
  codReason?: string;
  walletAmountRequested: number;
}

export interface CheckoutWalletSnapshot {
  availableBalance: number;
  reservedAmount: number;
  usableAmount: number;
  referralEligible: boolean;
}

export interface CheckoutCouponSnapshot {
  code: string;
  discountType: string;
  discountValue: number;
  discountAmount: number;
}

export interface CheckoutConsentSnapshot {
  termsAccepted: boolean;
  privacyAccepted: boolean;
  deliveryPolicyAccepted: boolean;
  cancellationPolicyAccepted: boolean;
  personalisedProductPolicyAccepted: boolean;
  acceptedAt: string;
}

export interface CheckoutValidationResult {
  isValid: boolean;
  errors: Array<{ field: string; message: string }>;
  warnings: Array<{ field: string; message: string }>;
}
