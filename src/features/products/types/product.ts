export type ProductType = 'SIMPLE' | 'VARIABLE' | 'COMBO' | 'GIFT_SET' | 'PERSONALISED';
export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK' | 'ARCHIVED' | 'SCHEDULED';
export type ProductVisibility = 'PUBLIC' | 'HIDDEN' | 'APP_ONLY' | 'WEBSITE_ONLY' | 'ADMIN_ONLY';
export type ProductCondition = 'NEW' | 'HANDMADE' | 'CUSTOM_MADE';
export type ProductMediaType = 'IMAGE' | 'VIDEO' | 'DOCUMENT';
export type ProductBadge = 
  | 'NEW' 
  | 'HOT' 
  | 'FLASH_SALE' 
  | 'PERSONALISED' 
  | 'BEST_SELLER' 
  | 'FEATURED' 
  | 'LIMITED_STOCK' 
  | 'SAME_DAY' 
  | 'EXCLUSIVE' 
  | 'TRENDING';
export type BadgeSource = 'MANUAL' | 'AUTOMATIC' | 'SYSTEM';

export interface ProductFilterQuery {
  page?: number;
  limit?: number;
  search?: string;
  productType?: string;
  status?: string;
  visibility?: string;
  categoryId?: string;
  brandId?: string;
  taxRateId?: string;
  personalised?: boolean;
  featured?: boolean;
  badge?: string;
  stockStatus?: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'ALL';
  sameDayEligible?: boolean;
  includeDeleted?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'title' | 'createdAt' | 'updatedAt' | 'sellingPrice' | 'stockQuantity' | 'sortOrder' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface CategoryAssignmentInput {
  categoryId: string;
  isPrimary?: boolean;
  sortOrder?: number;
}

export interface AttributeAssignmentInput {
  attributeId: string;
  isRequired?: boolean;
  isVariationAttribute?: boolean;
  isFilterable?: boolean;
  sortOrder?: number;
  valueIds: string[];
}

export interface MediaInput {
  fileAssetId: string;
  url?: string;
  mediaType?: ProductMediaType;
  isPrimary?: boolean;
  altText?: string | null;
  sortOrder?: number;
}

export interface BadgeAssignmentInput {
  badge: ProductBadge;
  source?: BadgeSource;
  active?: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
}

export interface CreateProductInput {
  productType: ProductType;
  status: ProductStatus;
  visibility: ProductVisibility;
  condition: ProductCondition;
  title: string;
  internalName?: string | null;
  slug?: string;
  sku?: string | null;
  barcode?: string | null;
  brandId?: string | null;
  primaryCategoryId: string;
  additionalCategoryIds?: string[];
  shortDescription?: string | null;
  description?: string | null;
  highlightsJson?: string | null;
  careInstructions?: string | null;
  countryOfOrigin?: string | null;
  manufacturer?: string | null;
  packer?: string | null;
  importer?: string | null;
  hsnCode?: string | null;
  taxRateId?: string | null;
  mrp?: number | null;
  sellingPrice?: number | null;
  costPrice?: number | null;
  priceIncludesTax?: boolean;
  minimumOrderQuantity?: number;
  maximumOrderQuantity?: number | null;
  manageStock?: boolean;
  stockQuantity?: number | null;
  reservedStock?: number;
  lowStockThreshold?: number | null;
  allowBackorder?: boolean;
  weightGrams?: number | null;
  lengthCm?: number | null;
  widthCm?: number | null;
  heightCm?: number | null;
  isFragile?: boolean;
  requiresSpecialPackaging?: boolean;
  sameDayEligible?: boolean;
  nextDayEligible?: boolean;
  expressEligible?: boolean;
  storePickupEligible?: boolean;
  maximumSameDayDistanceKm?: number | null;
  preparationTimeMinutes?: number | null;
  packingTimeMinutes?: number | null;
  externalLabRequired?: boolean;
  requiresManualDeliveryReview?: boolean;
  isPersonalised?: boolean;
  isFeatured?: boolean;
  isNewBadgeManual?: boolean;
  isHotBadgeManual?: boolean;
  isFlashSaleManual?: boolean;
  isBestSellerOverride?: boolean;
  sortOrder?: number;
  publishAt?: string | null;
  unpublishAt?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywordsJson?: string | null;
  seoImageFileId?: string | null;
  mainImageFileId?: string | null;
  isIndexable?: boolean;
  isFollowable?: boolean;
  attributeAssignments?: AttributeAssignmentInput[];
  media?: MediaInput[];
  badges?: BadgeAssignmentInput[];
}

export interface ProductDetail {
  id: string;
  storeId: string | null;
  productType: ProductType;
  status: ProductStatus;
  visibility: ProductVisibility;
  condition: ProductCondition | null;
  title: string;
  internalName: string | null;
  slug: string;
  sku: string | null;
  barcode: string | null;
  brandId: string | null;
  brandName?: string | null;
  primaryCategoryId: string;
  primaryCategoryName?: string | null;
  primaryCategoryPath?: string | null;
  shortDescription: string | null;
  description: string | null;
  highlightsJson: string | null;
  careInstructions: string | null;
  countryOfOrigin: string | null;
  manufacturer: string | null;
  packer: string | null;
  importer: string | null;
  hsnCode: string | null;
  taxRateId: string | null;
  taxRateName?: string | null;
  taxRateValue?: string | number | null;
  mrp: string | null;
  sellingPrice: string | null;
  costPrice: string | null;
  priceIncludesTax: boolean;
  minimumOrderQuantity: number;
  maximumOrderQuantity: number | null;
  manageStock: boolean;
  stockQuantity: number | null;
  reservedStock: number;
  availableStock: number;
  stockStatus: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  lowStockThreshold: number | null;
  allowBackorder: boolean;
  weightGrams: string | null;
  lengthCm: string | null;
  widthCm: string | null;
  heightCm: string | null;
  isFragile: boolean;
  requiresSpecialPackaging: boolean;
  sameDayEligible: boolean;
  nextDayEligible: boolean;
  expressEligible: boolean;
  storePickupEligible: boolean;
  maximumSameDayDistanceKm: string | null;
  preparationTimeMinutes: number | null;
  packingTimeMinutes: number | null;
  externalLabRequired: boolean;
  requiresManualDeliveryReview: boolean;
  isPersonalised: boolean;
  isFeatured: boolean;
  isNewBadgeManual: boolean;
  isHotBadgeManual: boolean;
  isFlashSaleManual: boolean;
  isBestSellerOverride: boolean;
  sortOrder: number;
  publishAt: string | null;
  unpublishAt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywordsJson: string | null;
  seoImageFileId: string | null;
  mainImageFileId: string | null;
  mainImageUrl?: string | null;
  isIndexable: boolean;
  isFollowable: boolean;
  createdByAdminId: string | null;
  updatedByAdminId: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  categoryAssignments: Array<{
    id: string;
    categoryId: string;
    categoryName: string;
    categoryPath: string;
    isPrimary: boolean;
    sortOrder: number;
  }>;
  attributeAssignments: Array<{
    id: string;
    attributeId: string;
    attributeName: string;
    attributeCode?: string | null;
    attributeType?: string;
    isRequired: boolean;
    isVariationAttribute: boolean;
    isFilterable: boolean;
    sortOrder: number;
    values: Array<{
      id: string;
      valueId: string;
      valueName: string;
      displayValue?: string | null;
      colourHex?: string | null;
      sortOrder: number;
    }>;
  }>;
  media: Array<{
    id: string;
    fileAssetId: string;
    url?: string;
    mediaType: ProductMediaType;
    sortOrder: number;
    isPrimary: boolean;
    altText: string | null;
  }>;
  badges: Array<{
    id: string;
    badge: ProductBadge;
    source: BadgeSource;
    active: boolean;
    startsAt: string | null;
    endsAt: string | null;
  }>;
}

export interface ProductOption {
  id: string;
  title: string;
  sku: string | null;
  productType: ProductType;
  sellingPrice: string | null;
  status: ProductStatus;
  selectable: boolean;
}
