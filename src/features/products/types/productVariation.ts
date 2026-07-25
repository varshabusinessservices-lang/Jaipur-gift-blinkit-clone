export type ProductVariationStatus = 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK' | 'ARCHIVED';

export interface VariationValueDetail {
  id: string;
  variationId: string;
  attributeId: string;
  attributeName: string;
  attributeValueId: string;
  valueName: string;
  displayValue: string | null;
  colourHex: string | null;
  sortOrder: number;
}

export interface VariationMediaDetail {
  id: string;
  variationId: string;
  fileAssetId: string;
  url: string;
  sortOrder: number;
  isPrimary: boolean;
  altText: string | null;
}

export interface ProductVariationDetail {
  id: string;
  productId: string;
  combinationKey: string;
  title: string;
  sku: string | null;
  barcode: string | null;
  status: ProductVariationStatus;
  isDefault: boolean;
  mrp: string | null;
  sellingPrice: string | null;
  costPrice: string | null;
  effectiveMrp: string | null;
  effectiveSellingPrice: string | null;
  priceSource: 'INHERIT_PRODUCT' | 'OVERRIDE';
  taxRateId: string | null;
  taxRateName: string | null;
  taxRateValue: number | null;
  priceIncludesTax: boolean | null;
  manageStock: boolean;
  stockQuantity: number | null;
  reservedStock: number;
  availableStock: number | null;
  stockStatus: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  lowStockThreshold: number | null;
  allowBackorder: boolean;
  weightGrams: string | null;
  lengthCm: string | null;
  widthCm: string | null;
  heightCm: string | null;
  preparationTimeMinutes: number | null;
  packingTimeMinutes: number | null;
  sameDayEligible: boolean | null;
  nextDayEligible: boolean | null;
  expressEligible: boolean | null;
  maximumSameDayDistanceKm: string | null;
  externalLabRequired: boolean | null;
  requiresManualDeliveryReview: boolean | null;
  mainImageFileId: string | null;
  mainImageUrl: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  values: VariationValueDetail[];
  media: VariationMediaDetail[];
}

export interface ProductVariationFilterQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  stockStatus?: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'ALL';
  defaultOnly?: boolean;
  attributeId?: string;
  attributeValueId?: string;
  includeDeleted?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface GeneratePreviewInput {
  selectedAttributeIds: string[];
  selectedAttributeValueIds?: string[];
  disabledCombinations?: string[];
}

export interface VariationPreviewItem {
  combinationKey: string;
  label: string;
  attributeValues: {
    attributeId: string;
    attributeName: string;
    valueId: string;
    valueName: string;
  }[];
  exists: boolean;
  eligible: boolean;
  warnings: string[];
}

export interface PreviewResult {
  productId: string;
  totalCombinations: number;
  maxLimit: number;
  combinations: VariationPreviewItem[];
}

export interface BaseDefaults {
  autoSku?: boolean;
  skuPrefix?: string;
  mrp?: number | string | null;
  sellingPrice?: number | string | null;
  costPrice?: number | string | null;
  stockQuantity?: number | null;
  lowStockThreshold?: number | null;
  status?: ProductVariationStatus;
  preparationTimeMinutes?: number | null;
  sameDayEligible?: boolean | null;
}

export interface CombinationGenerationItem {
  combinationKey?: string;
  title?: string;
  sku?: string;
  barcode?: string | null;
  attributeValues: {
    attributeId: string;
    attributeValueId: string;
  }[];
  mrp?: number | string | null;
  sellingPrice?: number | string | null;
  costPrice?: number | string | null;
  stockQuantity?: number | null;
  status?: ProductVariationStatus;
}

export interface GenerateVariationsInput {
  combinations: CombinationGenerationItem[];
  baseDefaults?: BaseDefaults;
  skipExisting?: boolean;
  activateNew?: boolean;
}

export interface CreateVariationInput {
  combinationKey?: string;
  title?: string;
  sku?: string | null;
  barcode?: string | null;
  status?: ProductVariationStatus;
  isDefault?: boolean;
  mrp?: number | string | null;
  sellingPrice?: number | string | null;
  costPrice?: number | string | null;
  taxRateId?: string | null;
  priceIncludesTax?: boolean | null;
  manageStock?: boolean;
  stockQuantity?: number | null;
  reservedStock?: number;
  lowStockThreshold?: number | null;
  allowBackorder?: boolean;
  weightGrams?: number | string | null;
  lengthCm?: number | string | null;
  widthCm?: number | string | null;
  heightCm?: number | string | null;
  preparationTimeMinutes?: number | null;
  packingTimeMinutes?: number | null;
  sameDayEligible?: boolean | null;
  nextDayEligible?: boolean | null;
  expressEligible?: boolean | null;
  maximumSameDayDistanceKm?: number | string | null;
  externalLabRequired?: boolean | null;
  requiresManualDeliveryReview?: boolean | null;
  mainImageFileId?: string | null;
  sortOrder?: number;
  attributeValues: {
    attributeId: string;
    attributeValueId: string;
  }[];
}

export interface BulkUpdateInput {
  variationIds: string[];
  operation:
    | 'SET_STATUS'
    | 'INCREASE_PRICE_FIXED'
    | 'DECREASE_PRICE_FIXED'
    | 'INCREASE_PRICE_PERCENT'
    | 'DECREASE_PRICE_PERCENT'
    | 'SET_MRP'
    | 'SET_SELLING_PRICE'
    | 'SET_STOCK'
    | 'ADD_STOCK'
    | 'SET_LOW_STOCK_THRESHOLD'
    | 'ENABLE_SAME_DAY'
    | 'SET_PREPARATION_TIME'
    | 'SET_TAX_RATE'
    | 'DELETE';
  payload: any;
}
