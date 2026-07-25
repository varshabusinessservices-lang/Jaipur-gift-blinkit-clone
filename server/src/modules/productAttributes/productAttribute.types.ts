import { z } from 'zod';

export type ProductAttributeType =
  | 'TEXT'
  | 'COLOUR_SWATCH'
  | 'IMAGE_SWATCH'
  | 'BUTTON'
  | 'DROPDOWN'
  | 'RADIO';

export type ProductAttributeStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

export const HEX_COLOUR_REGEX = /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/;

// Error codes
export const AttributeErrorCode = {
  ATTRIBUTE_NOT_FOUND: 'ATTRIBUTE_NOT_FOUND',
  ATTRIBUTE_SLUG_EXISTS: 'ATTRIBUTE_SLUG_EXISTS',
  ATTRIBUTE_CODE_EXISTS: 'ATTRIBUTE_CODE_EXISTS',
  ATTRIBUTE_TYPE_INVALID: 'ATTRIBUTE_TYPE_INVALID',
  ATTRIBUTE_TYPE_CHANGE_BLOCKED: 'ATTRIBUTE_TYPE_CHANGE_BLOCKED',
  ATTRIBUTE_DELETE_BLOCKED: 'ATTRIBUTE_DELETE_BLOCKED',
  ATTRIBUTE_RESTORE_CONFLICT: 'ATTRIBUTE_RESTORE_CONFLICT',
  ATTRIBUTE_CATEGORY_DUPLICATE: 'ATTRIBUTE_CATEGORY_DUPLICATE',
  ATTRIBUTE_CATEGORY_INVALID: 'ATTRIBUTE_CATEGORY_INVALID',
  ATTRIBUTE_VALUE_NOT_FOUND: 'ATTRIBUTE_VALUE_NOT_FOUND',
  ATTRIBUTE_VALUE_SLUG_EXISTS: 'ATTRIBUTE_VALUE_SLUG_EXISTS',
  ATTRIBUTE_VALUE_CODE_EXISTS: 'ATTRIBUTE_VALUE_CODE_EXISTS',
  ATTRIBUTE_VALUE_COLOUR_REQUIRED: 'ATTRIBUTE_VALUE_COLOUR_REQUIRED',
  ATTRIBUTE_VALUE_IMAGE_REQUIRED: 'ATTRIBUTE_VALUE_IMAGE_REQUIRED',
  ATTRIBUTE_VALUE_MEDIA_INVALID: 'ATTRIBUTE_VALUE_MEDIA_INVALID',
  VARIATION_COMBINATION_LIMIT_EXCEEDED: 'VARIATION_COMBINATION_LIMIT_EXCEEDED',
} as const;

// Value Schema
export const AttributeValueInputSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Value name is required').max(100),
  slug: z.string().optional(),
  code: z.string().max(50).optional().nullable(),
  description: z.string().optional().nullable(),
  displayValue: z.string().optional().nullable(),
  colourHex: z
    .string()
    .optional()
    .nullable()
    .refine(
      (val) => !val || HEX_COLOUR_REGEX.test(val),
      { message: 'Invalid hex colour code (e.g. #000000)' }
    ),
  imageFileId: z.string().optional().nullable(),
  metadataJson: z.string().optional().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).default('ACTIVE'),
  sortOrder: z.number().int().min(0).default(0),
});

export type AttributeValueInput = z.infer<typeof AttributeValueInputSchema>;

// Attribute Category Assignment Schema
export const CategoryAssignmentInputSchema = z.object({
  categoryId: z.string().uuid('Invalid Category ID'),
  isRequired: z.boolean().default(false),
  isVariationAttribute: z.boolean().optional().nullable(),
  isFilterable: z.boolean().optional().nullable(),
  sortOrder: z.number().int().min(0).default(0),
});

export type CategoryAssignmentInput = z.infer<typeof CategoryAssignmentInputSchema>;

// Attribute Create Schema
export const CreateAttributeSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  slug: z.string().max(140).optional(),
  code: z.string().max(50).optional().nullable(),
  description: z.string().optional().nullable(),
  type: z.enum(['TEXT', 'COLOUR_SWATCH', 'IMAGE_SWATCH', 'BUTTON', 'DROPDOWN', 'RADIO']).default('TEXT'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).default('ACTIVE'),
  isVariationAttribute: z.boolean().default(true),
  isFilterable: z.boolean().default(true),
  isRequiredByDefault: z.boolean().default(false),
  showOnProductPage: z.boolean().default(true),
  showInProductSummary: z.boolean().default(true),
  allowMultipleValues: z.boolean().default(false),
  sortOrder: z.number().int().min(0).default(0),
  values: z.array(AttributeValueInputSchema).optional().default([]),
  categoryAssignments: z.array(CategoryAssignmentInputSchema).optional().default([]),
});

export type CreateAttributeDTO = z.infer<typeof CreateAttributeSchema>;

// Attribute Update Schema
export const UpdateAttributeSchema = CreateAttributeSchema.partial();
export type UpdateAttributeDTO = z.infer<typeof UpdateAttributeSchema>;

// Value Create Schema
export const CreateAttributeValueSchema = AttributeValueInputSchema;
export type CreateAttributeValueDTO = z.infer<typeof CreateAttributeValueSchema>;

// Value Update Schema
export const UpdateAttributeValueSchema = AttributeValueInputSchema.partial();
export type UpdateAttributeValueDTO = z.infer<typeof UpdateAttributeValueSchema>;

// Attribute Group Schema
export const CreateAttributeGroupSchema = z.object({
  name: z.string().min(2, 'Group name is required').max(100),
  slug: z.string().max(140).optional(),
  description: z.string().optional().nullable(),
  sortOrder: z.number().int().min(0).default(0),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).default('ACTIVE'),
  attributeIds: z.array(z.string().uuid()).optional().default([]),
});

export type CreateAttributeGroupDTO = z.infer<typeof CreateAttributeGroupSchema>;

// Filter Query Schema
export const AttributeFilterQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional().default(''),
  status: z.string().optional().default(''),
  type: z.string().optional().default(''),
  variationOnly: z.coerce.boolean().optional(),
  filterableOnly: z.coerce.boolean().optional(),
  categoryId: z.string().optional().default(''),
  includeDeleted: z.coerce.boolean().optional().default(false),
  sortBy: z.enum(['name', 'createdAt', 'updatedAt', 'sortOrder', 'status', 'type']).default('sortOrder'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export type AttributeFilterQuery = z.infer<typeof AttributeFilterQuerySchema>;

// Full Domain Types for App
export interface ProductAttributeValueItem {
  id: string;
  attributeId: string;
  name: string;
  slug: string;
  code?: string | null;
  description?: string | null;
  displayValue?: string | null;
  colourHex?: string | null;
  imageFileId?: string | null;
  metadataJson?: string | null;
  status: ProductAttributeStatus;
  sortOrder: number;
  createdByAdminId?: string | null;
  updatedByAdminId?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface AttributeCategoryAssignmentItem {
  id: string;
  attributeId: string;
  categoryId: string;
  categoryName?: string;
  categoryPath?: string;
  isRequired: boolean;
  isVariationAttribute?: boolean | null;
  isFilterable?: boolean | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductAttributeDetail {
  id: string;
  storeId?: string | null;
  name: string;
  slug: string;
  code?: string | null;
  description?: string | null;
  type: ProductAttributeType;
  status: ProductAttributeStatus;
  isVariationAttribute: boolean;
  isFilterable: boolean;
  isRequiredByDefault: boolean;
  showOnProductPage: boolean;
  showInProductSummary: boolean;
  allowMultipleValues: boolean;
  sortOrder: number;
  valueCount: number;
  activeValueCount: number;
  assignedCategoryCount: number;
  productUsageCount: number | null;
  usageStatus: string;
  values: ProductAttributeValueItem[];
  categoryAssignments: AttributeCategoryAssignmentItem[];
  createdByAdminId?: string | null;
  updatedByAdminId?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface AttributeGroupItemDetail {
  id: string;
  storeId?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  sortOrder: number;
  status: ProductAttributeStatus;
  attributes: ProductAttributeDetail[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}
