import { z } from 'zod';

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

// Query Parameters DTO
export const ProductFilterQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional().default(''),
  productType: z.string().optional().default(''),
  status: z.string().optional().default(''),
  visibility: z.string().optional().default(''),
  categoryId: z.string().optional().default(''),
  brandId: z.string().optional().default(''),
  taxRateId: z.string().optional().default(''),
  personalised: z.preprocess((v) => (v === 'true' ? true : v === 'false' ? false : undefined), z.boolean().optional()),
  featured: z.preprocess((v) => (v === 'true' ? true : v === 'false' ? false : undefined), z.boolean().optional()),
  badge: z.string().optional().default(''),
  stockStatus: z.enum(['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK', 'ALL']).optional().default('ALL'),
  sameDayEligible: z.preprocess((v) => (v === 'true' ? true : v === 'false' ? false : undefined), z.boolean().optional()),
  includeDeleted: z.preprocess((v) => v === 'true' || v === true, z.boolean().default(false)),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  sortBy: z.enum(['title', 'createdAt', 'updatedAt', 'sellingPrice', 'stockQuantity', 'sortOrder', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type ProductFilterQuery = z.infer<typeof ProductFilterQuerySchema>;

export const ProductOptionsQuerySchema = z.object({
  search: z.string().optional().default(''),
  activeOnly: z.preprocess((v) => v === 'true' || v === true, z.boolean().default(true)),
  excludeId: z.string().optional(),
  productType: z.string().optional(),
  categoryId: z.string().optional(),
});

export type ProductOptionsQuery = z.infer<typeof ProductOptionsQuerySchema>;

// Category Assignment Schema
export const CategoryAssignmentInputSchema = z.object({
  categoryId: z.string().min(1, 'Category ID is required'),
  isPrimary: z.boolean().default(false),
  sortOrder: z.number().default(0),
});

// Attribute & Value Assignment Schema
export const AttributeAssignmentInputSchema = z.object({
  attributeId: z.string().min(1, 'Attribute ID is required'),
  isRequired: z.boolean().default(false),
  isVariationAttribute: z.boolean().default(true),
  isFilterable: z.boolean().default(true),
  sortOrder: z.number().default(0),
  valueIds: z.array(z.string()).default([]),
});

// Media Input Schema
export const MediaInputSchema = z.object({
  fileAssetId: z.string().min(1, 'File asset ID is required'),
  mediaType: z.enum(['IMAGE', 'VIDEO', 'DOCUMENT']).default('IMAGE'),
  isPrimary: z.boolean().default(false),
  altText: z.string().nullable().optional(),
  sortOrder: z.number().default(0),
});

// Badge Assignment Input Schema
export const BadgeAssignmentInputSchema = z.object({
  badge: z.enum([
    'NEW', 'HOT', 'FLASH_SALE', 'PERSONALISED', 'BEST_SELLER', 
    'FEATURED', 'LIMITED_STOCK', 'SAME_DAY', 'EXCLUSIVE', 'TRENDING'
  ]),
  source: z.enum(['MANUAL', 'AUTOMATIC', 'SYSTEM']).default('MANUAL'),
  active: z.boolean().default(true),
  startsAt: z.string().nullable().optional(),
  endsAt: z.string().nullable().optional(),
});

// Create Product Schema
export const CreateProductSchema = z.object({
  productType: z.enum(['SIMPLE', 'VARIABLE', 'COMBO', 'GIFT_SET', 'PERSONALISED']),
  status: z.enum(['DRAFT', 'ACTIVE', 'INACTIVE', 'OUT_OF_STOCK', 'ARCHIVED', 'SCHEDULED']).default('DRAFT'),
  visibility: z.enum(['PUBLIC', 'HIDDEN', 'APP_ONLY', 'WEBSITE_ONLY', 'ADMIN_ONLY']).default('PUBLIC'),
  condition: z.enum(['NEW', 'HANDMADE', 'CUSTOM_MADE']).default('NEW'),
  title: z.string().min(2, 'Title must be at least 2 characters').max(200, 'Title cannot exceed 200 characters'),
  internalName: z.string().nullable().optional(),
  slug: z.string().optional(),
  sku: z.string().nullable().optional(),
  barcode: z.string().nullable().optional(),
  brandId: z.string().nullable().optional(),
  primaryCategoryId: z.string().min(1, 'Primary category is required'),
  additionalCategoryIds: z.array(z.string()).optional().default([]),
  shortDescription: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  highlightsJson: z.string().nullable().optional(),
  careInstructions: z.string().nullable().optional(),
  countryOfOrigin: z.string().nullable().optional().default('India'),
  manufacturer: z.string().nullable().optional(),
  packer: z.string().nullable().optional(),
  importer: z.string().nullable().optional(),
  hsnCode: z.string().nullable().optional(),
  taxRateId: z.string().nullable().optional(),
  mrp: z.coerce.number().min(0, 'MRP cannot be negative').nullable().optional(),
  sellingPrice: z.coerce.number().min(0, 'Selling price cannot be negative').nullable().optional(),
  costPrice: z.coerce.number().min(0, 'Cost price cannot be negative').nullable().optional(),
  priceIncludesTax: z.boolean().default(true),
  minimumOrderQuantity: z.number().min(1).default(1),
  maximumOrderQuantity: z.number().min(1).nullable().optional(),
  manageStock: z.boolean().default(true),
  stockQuantity: z.number().min(0).nullable().optional().default(0),
  reservedStock: z.number().min(0).default(0),
  lowStockThreshold: z.number().min(0).nullable().optional().default(5),
  allowBackorder: z.boolean().default(false),
  weightGrams: z.number().min(0).nullable().optional(),
  lengthCm: z.number().min(0).nullable().optional(),
  widthCm: z.number().min(0).nullable().optional(),
  heightCm: z.number().min(0).nullable().optional(),
  isFragile: z.boolean().default(false),
  requiresSpecialPackaging: z.boolean().default(false),
  sameDayEligible: z.boolean().default(false),
  nextDayEligible: z.boolean().default(true),
  expressEligible: z.boolean().default(false),
  storePickupEligible: z.boolean().default(true),
  maximumSameDayDistanceKm: z.number().min(0).nullable().optional().default(15),
  preparationTimeMinutes: z.number().min(0).nullable().optional().default(60),
  packingTimeMinutes: z.number().min(0).nullable().optional().default(15),
  externalLabRequired: z.boolean().default(false),
  requiresManualDeliveryReview: z.boolean().default(false),
  isPersonalised: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  isNewBadgeManual: z.boolean().default(false),
  isHotBadgeManual: z.boolean().default(false),
  isFlashSaleManual: z.boolean().default(false),
  isBestSellerOverride: z.boolean().default(false),
  sortOrder: z.number().default(0),
  publishAt: z.string().nullable().optional(),
  unpublishAt: z.string().nullable().optional(),
  seoTitle: z.string().nullable().optional(),
  seoDescription: z.string().nullable().optional(),
  seoKeywordsJson: z.string().nullable().optional(),
  seoImageFileId: z.string().nullable().optional(),
  mainImageFileId: z.string().nullable().optional(),
  isIndexable: z.boolean().default(true),
  isFollowable: z.boolean().default(true),
  attributeAssignments: z.array(AttributeAssignmentInputSchema).optional().default([]),
  media: z.array(MediaInputSchema).optional().default([]),
  badges: z.array(BadgeAssignmentInputSchema).optional().default([]),
});

export type CreateProductDTO = z.infer<typeof CreateProductSchema>;

// Update Product Schema
export const UpdateProductSchema = CreateProductSchema.partial().extend({
  status: z.enum(['DRAFT', 'ACTIVE', 'INACTIVE', 'OUT_OF_STOCK', 'ARCHIVED', 'SCHEDULED']).optional(),
});

export type UpdateProductDTO = z.infer<typeof UpdateProductSchema>;

// Inventory Update Schema
export const UpdateInventorySchema = z.object({
  manageStock: z.boolean(),
  stockQuantity: z.number().min(0).nullable().optional(),
  reservedStock: z.number().min(0).optional().default(0),
  lowStockThreshold: z.number().min(0).nullable().optional(),
  allowBackorder: z.boolean().optional(),
});

export type UpdateInventoryDTO = z.infer<typeof UpdateInventorySchema>;

// Delivery Settings Update Schema
export const UpdateDeliverySettingsSchema = z.object({
  sameDayEligible: z.boolean(),
  nextDayEligible: z.boolean(),
  expressEligible: z.boolean(),
  storePickupEligible: z.boolean(),
  maximumSameDayDistanceKm: z.number().min(0).nullable().optional(),
  preparationTimeMinutes: z.number().min(0).nullable().optional(),
  packingTimeMinutes: z.number().min(0).nullable().optional(),
  isFragile: z.boolean().optional(),
  requiresSpecialPackaging: z.boolean().optional(),
  externalLabRequired: z.boolean().optional(),
  requiresManualDeliveryReview: z.boolean().optional(),
});

export type UpdateDeliverySettingsDTO = z.infer<typeof UpdateDeliverySettingsSchema>;

// Interface for Product Item Output
export interface ProductDetailItem {
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
