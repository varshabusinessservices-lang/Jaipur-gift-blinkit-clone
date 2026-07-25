export type ProductAttributeType =
  | 'TEXT'
  | 'COLOUR_SWATCH'
  | 'IMAGE_SWATCH'
  | 'BUTTON'
  | 'DROPDOWN'
  | 'RADIO';

export type ProductAttributeStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

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
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface AttributeFilterQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  type?: string;
  variationOnly?: boolean;
  filterableOnly?: boolean;
  categoryId?: string;
  includeDeleted?: boolean;
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'sortOrder' | 'status' | 'type';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateAttributeValueInput {
  id?: string;
  name: string;
  slug?: string;
  code?: string | null;
  description?: string | null;
  displayValue?: string | null;
  colourHex?: string | null;
  imageFileId?: string | null;
  status?: ProductAttributeStatus;
  sortOrder?: number;
}

export interface CategoryAssignmentInput {
  categoryId: string;
  isRequired?: boolean;
  isVariationAttribute?: boolean | null;
  isFilterable?: boolean | null;
  sortOrder?: number;
}

export interface CreateAttributeInput {
  name: string;
  slug?: string;
  code?: string | null;
  description?: string | null;
  type: ProductAttributeType;
  status: ProductAttributeStatus;
  isVariationAttribute?: boolean;
  isFilterable?: boolean;
  isRequiredByDefault?: boolean;
  showOnProductPage?: boolean;
  showInProductSummary?: boolean;
  allowMultipleValues?: boolean;
  sortOrder?: number;
  values?: CreateAttributeValueInput[];
  categoryAssignments?: CategoryAssignmentInput[];
}

export interface AttributeGroupDetail {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  sortOrder: number;
  status: ProductAttributeStatus;
  attributes: ProductAttributeDetail[];
  createdAt: string;
  updatedAt: string;
}
