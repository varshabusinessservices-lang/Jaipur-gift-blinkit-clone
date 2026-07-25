import { z } from 'zod';

export type ProductVariationStatus = 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK' | 'ARCHIVED';

export const VariationFilterQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(200).default(50),
  search: z.string().optional().default(''),
  status: z.string().optional().default(''),
  stockStatus: z.enum(['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK', 'ALL']).optional().default('ALL'),
  defaultOnly: z.preprocess((v) => v === 'true' || v === true, z.boolean().default(false)),
  attributeId: z.string().optional().default(''),
  attributeValueId: z.string().optional().default(''),
  includeDeleted: z.preprocess((v) => v === 'true' || v === true, z.boolean().default(false)),
  sortBy: z.enum(['title', 'sku', 'createdAt', 'updatedAt', 'sellingPrice', 'stockQuantity', 'sortOrder', 'status']).default('sortOrder'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export type VariationFilterQuery = z.infer<typeof VariationFilterQuerySchema>;

export const AttributeValueRefSchema = z.object({
  attributeId: z.string(),
  attributeValueId: z.string(),
});

export const GeneratePreviewInputSchema = z.object({
  selectedAttributeIds: z.array(z.string()).min(1, 'At least one attribute must be selected'),
  selectedAttributeValueIds: z.array(z.string()).default([]),
  disabledCombinations: z.array(z.string()).optional().default([]),
});

export type GeneratePreviewInput = z.infer<typeof GeneratePreviewInputSchema>;

export const BaseDefaultsSchema = z.object({
  autoSku: z.boolean().optional().default(true),
  skuPrefix: z.string().optional(),
  mrp: z.union([z.number(), z.string()]).nullable().optional(),
  sellingPrice: z.union([z.number(), z.string()]).nullable().optional(),
  costPrice: z.union([z.number(), z.string()]).nullable().optional(),
  stockQuantity: z.number().nullable().optional(),
  lowStockThreshold: z.number().nullable().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK', 'ARCHIVED']).optional().default('INACTIVE'),
  preparationTimeMinutes: z.number().nullable().optional(),
  sameDayEligible: z.boolean().nullable().optional(),
});

export const CombinationGenerationItemSchema = z.object({
  combinationKey: z.string().optional(),
  title: z.string().optional(),
  sku: z.string().optional(),
  barcode: z.string().nullable().optional(),
  attributeValues: z.array(AttributeValueRefSchema).min(1),
  mrp: z.union([z.number(), z.string()]).nullable().optional(),
  sellingPrice: z.union([z.number(), z.string()]).nullable().optional(),
  costPrice: z.union([z.number(), z.string()]).nullable().optional(),
  stockQuantity: z.number().nullable().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK', 'ARCHIVED']).optional(),
});

export const GenerateVariationsInputSchema = z.object({
  combinations: z.array(CombinationGenerationItemSchema).min(1, 'At least one combination is required'),
  baseDefaults: BaseDefaultsSchema.optional(),
  skipExisting: z.boolean().default(true),
  activateNew: z.boolean().default(false),
});

export type GenerateVariationsInput = z.infer<typeof GenerateVariationsInputSchema>;

export const CreateVariationSchema = z.object({
  combinationKey: z.string().optional(),
  title: z.string().min(1, 'Title is required').optional(),
  sku: z.string().nullable().optional(),
  barcode: z.string().nullable().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK', 'ARCHIVED']).default('ACTIVE'),
  isDefault: z.boolean().default(false),
  mrp: z.union([z.number(), z.string()]).nullable().optional(),
  sellingPrice: z.union([z.number(), z.string()]).nullable().optional(),
  costPrice: z.union([z.number(), z.string()]).nullable().optional(),
  taxRateId: z.string().nullable().optional(),
  priceIncludesTax: z.boolean().nullable().optional(),
  manageStock: z.boolean().default(true),
  stockQuantity: z.number().nullable().optional(),
  reservedStock: z.number().default(0),
  lowStockThreshold: z.number().nullable().optional(),
  allowBackorder: z.boolean().default(false),
  weightGrams: z.union([z.number(), z.string()]).nullable().optional(),
  lengthCm: z.union([z.number(), z.string()]).nullable().optional(),
  widthCm: z.union([z.number(), z.string()]).nullable().optional(),
  heightCm: z.union([z.number(), z.string()]).nullable().optional(),
  preparationTimeMinutes: z.number().nullable().optional(),
  packingTimeMinutes: z.number().nullable().optional(),
  sameDayEligible: z.boolean().nullable().optional(),
  nextDayEligible: z.boolean().nullable().optional(),
  expressEligible: z.boolean().nullable().optional(),
  maximumSameDayDistanceKm: z.union([z.number(), z.string()]).nullable().optional(),
  externalLabRequired: z.boolean().nullable().optional(),
  requiresManualDeliveryReview: z.boolean().nullable().optional(),
  mainImageFileId: z.string().nullable().optional(),
  sortOrder: z.number().default(0),
  attributeValues: z.array(AttributeValueRefSchema).min(1, 'At least one attribute value is required'),
});

export type CreateVariationInput = z.infer<typeof CreateVariationSchema>;

export const UpdateVariationSchema = CreateVariationSchema.partial().extend({
  attributeValues: z.array(AttributeValueRefSchema).optional(),
});

export type UpdateVariationInput = z.infer<typeof UpdateVariationSchema>;

export const BulkUpdateVariationsSchema = z.object({
  variationIds: z.array(z.string()).min(1, 'Select at least one variation'),
  operation: z.enum([
    'SET_STATUS',
    'INCREASE_PRICE_FIXED',
    'DECREASE_PRICE_FIXED',
    'INCREASE_PRICE_PERCENT',
    'DECREASE_PRICE_PERCENT',
    'SET_MRP',
    'SET_SELLING_PRICE',
    'SET_STOCK',
    'ADD_STOCK',
    'SET_LOW_STOCK_THRESHOLD',
    'ENABLE_SAME_DAY',
    'SET_PREPARATION_TIME',
    'SET_TAX_RATE',
    'DELETE',
  ]),
  payload: z.any(),
});

export type BulkUpdateVariationsInput = z.infer<typeof BulkUpdateVariationsSchema>;

export const VariationMediaInputSchema = z.object({
  fileAssetId: z.string().min(1, 'File asset ID is required'),
  isPrimary: z.boolean().default(false),
  altText: z.string().nullable().optional(),
  sortOrder: z.number().default(0),
});

export type VariationMediaInput = z.infer<typeof VariationMediaInputSchema>;

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
  createdByAdminId: string | null;
  updatedByAdminId: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  values: VariationValueDetail[];
  media: VariationMediaDetail[];
}

export interface ProductVariationPublicDetail {
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
  effectiveMrp: string | null;
  effectiveSellingPrice: string | null;
  taxRateValue: number | null;
  manageStock: boolean;
  availableStock: number | null;
  inStock: boolean;
  mainImageUrl: string | null;
  sameDayEligible: boolean | null;
  preparationTimeMinutes: number | null;
  values: {
    attributeId: string;
    attributeName: string;
    attributeValueId: string;
    valueName: string;
    displayValue: string | null;
    colourHex: string | null;
  }[];
}
