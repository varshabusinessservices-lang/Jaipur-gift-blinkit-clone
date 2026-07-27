export enum CartStatus {
  ACTIVE = 'ACTIVE',
  LOCKED = 'LOCKED',
  EXPIRED = 'EXPIRED',
  ABANDONED = 'ABANDONED',
  CONVERTED = 'CONVERTED',
  BLOCKED = 'BLOCKED',
}

export enum CartSource {
  WEBSITE = 'WEBSITE',
  ANDROID_APP = 'ANDROID_APP',
  ADMIN_ASSISTED = 'ADMIN_ASSISTED',
  WAL_IN = 'WAL_IN',
  PHONE = 'PHONE',
  WHATSAPP = 'WHATSAPP',
  INSTAGRAM = 'INSTAGRAM',
}

export enum CartItemStatus {
  ACTIVE = 'ACTIVE',
  INVALID = 'INVALID',
  UNAVAILABLE = 'UNAVAILABLE',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  PRICE_CHANGED = 'PRICE_CHANGED',
  REQUIRES_ACTION = 'REQUIRES_ACTION',
  REMOVED = 'REMOVED',
}

export enum CartItemInventoryStatus {
  AVAILABLE = 'AVAILABLE',
  LOW_STOCK = 'LOW_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  NOT_TRACKED = 'NOT_TRACKED',
  BACKORDER_ALLOWED = 'BACKORDER_ALLOWED',
  UNAVAILABLE_AT_STORE = 'UNAVAILABLE_AT_STORE',
  UNKNOWN = 'UNKNOWN',
}

export enum PersonalisationResponseStatus {
  DRAFT = 'DRAFT',
  COMPLETE = 'COMPLETE',
  INVALID = 'INVALID',
  REQUIRES_REVIEW = 'REQUIRES_REVIEW',
  LOCKED = 'LOCKED',
}

export enum CartDiscountSourceType {
  PRODUCT = 'PRODUCT',
  VARIATION = 'VARIATION',
  COUPON = 'COUPON',
  PROMOTION = 'PROMOTION',
  REFERRAL = 'REFERRAL',
  ADMIN = 'ADMIN',
  SYSTEM = 'SYSTEM',
}

export enum DeliveryEstimateStatus {
  ESTIMATED = 'ESTIMATED',
  ADDRESS_REQUIRED = 'ADDRESS_REQUIRED',
  NOT_SERVICEABLE = 'NOT_SERVICEABLE',
  MANUAL_REVIEW = 'MANUAL_REVIEW',
  UNAVAILABLE = 'UNAVAILABLE',
  FREE = 'FREE',
}

export interface CartInput {
  productId: string;
  variationId?: string | null;
  quantity: number;
  selectedAddOns?: Array<{
    productAddOnId: string;
    addOnGroupId?: string | null;
    addOnOptionId?: string | null;
    quantity?: number;
    customerInput?: string | null;
    uploadIds?: string[];
  }>;
  personalisationFormId?: string | null;
  personalisationFormVersion?: number | null;
  personalisationResponse?: Record<string, any>;
  uploadSessionToken?: string | null;
  clientCartItemId?: string;
  storeId?: string | null;
}

export interface AddOnSelectionInput {
  productAddOnId: string;
  addOnGroupId?: string | null;
  addOnOptionId?: string | null;
  quantity?: number;
  customerInput?: string | null;
  uploadIds?: string[];
}
