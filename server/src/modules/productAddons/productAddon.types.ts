import { z } from 'zod';

export const ProductAddonStatusSchema = z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED', 'SCHEDULED']);
export type ProductAddonStatus = z.infer<typeof ProductAddonStatusSchema>;

export const ProductAddonInputTypeSchema = z.enum([
  'CHECKBOX',
  'RADIO',
  'DROPDOWN',
  'QUANTITY',
  'TEXT',
  'TEXTAREA',
  'SINGLE_IMAGE',
  'MULTI_IMAGE',
  'FILE',
  'NUMBER',
]);
export type ProductAddonInputType = z.infer<typeof ProductAddonInputTypeSchema>;

export const ProductAddonPricingTypeSchema = z.enum([
  'FIXED',
  'PERCENTAGE',
  'FREE',
  'PER_QUANTITY',
  'CUSTOM_AMOUNT',
]);
export type ProductAddonPricingType = z.infer<typeof ProductAddonPricingTypeSchema>;

export const AddonAssignmentTypeSchema = z.enum([
  'GLOBAL',
  'ALL_PERSONALISED_PRODUCTS',
  'CATEGORY',
  'PRODUCT',
  'VARIATION',
]);
export type AddonAssignmentType = z.infer<typeof AddonAssignmentTypeSchema>;

export const AddonAssignmentStatusSchema = z.enum(['ACTIVE', 'INACTIVE']);
export type AddonAssignmentStatus = z.infer<typeof AddonAssignmentStatusSchema>;

export const AddonGroupSelectionTypeSchema = z.enum(['SINGLE', 'MULTIPLE']);
export type AddonGroupSelectionType = z.infer<typeof AddonGroupSelectionTypeSchema>;

// Option Schema
export const CreateProductAddonOptionSchema = z.object({
  name: z.string().min(1, 'Option name is required').max(120),
  code: z.string().max(50).optional().nullable(),
  description: z.string().optional().nullable(),
  pricingType: ProductAddonPricingTypeSchema.optional().nullable(),
  fixedPrice: z.string().or(z.number()).optional().nullable(),
  percentageRate: z.string().or(z.number()).optional().nullable(),
  imageFileId: z.string().uuid().optional().nullable(),
  isDefault: z.boolean().default(false),
  status: ProductAddonStatusSchema.default('ACTIVE'),
  sortOrder: z.number().int().default(0),
  metadataJson: z.string().optional().nullable(),
});

export const UpdateProductAddonOptionSchema = CreateProductAddonOptionSchema.partial();

// Assignment Schema
export const CreateAddonAssignmentSchema = z.object({
  assignmentType: AddonAssignmentTypeSchema,
  productId: z.string().uuid().optional().nullable(),
  variationId: z.string().uuid().optional().nullable(),
  categoryId: z.string().uuid().optional().nullable(),
  isRequiredOverride: z.boolean().optional().nullable(),
  priceOverride: z.string().or(z.number()).optional().nullable(),
  percentageOverride: z.string().or(z.number()).optional().nullable(),
  sortOrder: z.number().int().default(0),
  startsAt: z.string().or(z.date()).optional().nullable(),
  endsAt: z.string().or(z.date()).optional().nullable(),
  status: AddonAssignmentStatusSchema.default('ACTIVE'),
});

// Addon Create Schema
export const CreateProductAddonSchema = z.object({
  storeId: z.string().uuid().optional().nullable(),
  name: z.string().min(2, 'Name must be at least 2 characters').max(120),
  slug: z.string().max(150).optional(),
  code: z.string().max(50).optional().nullable(),
  shortDescription: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  inputType: ProductAddonInputTypeSchema,
  pricingType: ProductAddonPricingTypeSchema,
  fixedPrice: z.string().or(z.number()).optional().nullable(),
  percentageRate: z.string().or(z.number()).optional().nullable(),
  minimumAmount: z.string().or(z.number()).optional().nullable(),
  maximumAmount: z.string().or(z.number()).optional().nullable(),
  defaultAmount: z.string().or(z.number()).optional().nullable(),
  taxRateId: z.string().uuid().optional().nullable(),
  priceIncludesTax: z.boolean().default(true),
  imageFileId: z.string().uuid().optional().nullable(),
  status: ProductAddonStatusSchema.default('ACTIVE'),
  isRequired: z.boolean().default(false),
  allowQuantity: z.boolean().default(false),
  minimumQuantity: z.number().int().nonnegative().default(0),
  maximumQuantity: z.number().int().positive().optional().nullable(),
  defaultQuantity: z.number().int().nonnegative().optional().nullable(),
  manageStock: z.boolean().default(false),
  stockQuantity: z.number().int().nonnegative().optional().nullable(),
  reservedStock: z.number().int().nonnegative().default(0),
  lowStockThreshold: z.number().int().nonnegative().optional().nullable(),
  allowBackorder: z.boolean().default(false),
  placeholder: z.string().optional().nullable(),
  helpText: z.string().optional().nullable(),
  validationJson: z.string().optional().nullable(),
  customerLabel: z.string().optional().nullable(),
  internalLabel: z.string().optional().nullable(),
  sortOrder: z.number().int().default(0),
  startsAt: z.string().or(z.date()).optional().nullable(),
  endsAt: z.string().or(z.date()).optional().nullable(),
  options: z.array(CreateProductAddonOptionSchema).optional(),
  assignments: z.array(CreateAddonAssignmentSchema).optional(),
});

export const UpdateProductAddonSchema = CreateProductAddonSchema.partial();

// List Filter Schema
export const ListProductAddonQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  status: z.string().optional(),
  inputType: z.string().optional(),
  pricingType: z.string().optional(),
  assignmentType: z.string().optional(),
  productId: z.string().optional(),
  categoryId: z.string().optional(),
  personalisedOnly: z.coerce.boolean().optional(),
  stockStatus: z.enum(['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK', 'ALL']).optional(),
  scheduled: z.coerce.boolean().optional(),
  includeDeleted: z.coerce.boolean().default(false),
  sortBy: z.enum(['name', 'createdAt', 'updatedAt', 'sortOrder', 'status', 'fixedPrice', 'stockQuantity']).default('sortOrder'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export type ListProductAddonQuery = z.infer<typeof ListProductAddonQuerySchema>;

// Addon Group Schemas
export const CreateAddonGroupItemSchema = z.object({
  addonId: z.string().uuid(),
  sortOrder: z.number().int().default(0),
  isDefault: z.boolean().default(false),
});

export const CreateAddonGroupSchema = z.object({
  storeId: z.string().uuid().optional().nullable(),
  name: z.string().min(2, 'Name must be at least 2 characters').max(120),
  slug: z.string().max(150).optional(),
  description: z.string().optional().nullable(),
  selectionType: AddonGroupSelectionTypeSchema,
  minimumSelections: z.number().int().nonnegative().default(0),
  maximumSelections: z.number().int().positive().optional().nullable(),
  isRequired: z.boolean().default(false),
  status: ProductAddonStatusSchema.default('ACTIVE'),
  sortOrder: z.number().int().default(0),
  items: z.array(CreateAddonGroupItemSchema).optional(),
});

export const UpdateAddonGroupSchema = CreateAddonGroupSchema.partial();

export const ListAddonGroupQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  status: z.string().optional(),
  includeDeleted: z.coerce.boolean().default(false),
  sortBy: z.enum(['name', 'createdAt', 'updatedAt', 'sortOrder', 'status']).default('sortOrder'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export type ListAddonGroupQuery = z.infer<typeof ListAddonGroupQuerySchema>;
