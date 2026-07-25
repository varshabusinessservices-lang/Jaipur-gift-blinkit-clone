export type ProductAddonStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED' | 'SCHEDULED';

export type ProductAddonInputType =
  | 'CHECKBOX'
  | 'RADIO'
  | 'DROPDOWN'
  | 'QUANTITY'
  | 'TEXT'
  | 'TEXTAREA'
  | 'SINGLE_IMAGE'
  | 'MULTI_IMAGE'
  | 'FILE'
  | 'NUMBER';

export type ProductAddonPricingType =
  | 'FIXED'
  | 'PERCENTAGE'
  | 'FREE'
  | 'PER_QUANTITY'
  | 'CUSTOM_AMOUNT';

export type AddonAssignmentType =
  | 'GLOBAL'
  | 'ALL_PERSONALISED_PRODUCTS'
  | 'CATEGORY'
  | 'PRODUCT'
  | 'VARIATION';

export type AddonAssignmentStatus = 'ACTIVE' | 'INACTIVE';

export type AddonGroupSelectionType = 'SINGLE' | 'MULTIPLE';

export interface ProductAddonOption {
  id: string;
  addonId?: string;
  name: string;
  code?: string | null;
  description?: string | null;
  pricingType?: ProductAddonPricingType | null;
  fixedPrice?: string | number | null;
  percentageRate?: string | number | null;
  imageFileId?: string | null;
  isDefault: boolean;
  status: ProductAddonStatus;
  sortOrder: number;
  metadataJson?: string | null;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface AddonAssignment {
  id: string;
  addonId?: string;
  assignmentType: AddonAssignmentType;
  productId?: string | null;
  variationId?: string | null;
  categoryId?: string | null;
  isRequiredOverride?: boolean | null;
  priceOverride?: string | number | null;
  percentageOverride?: string | number | null;
  sortOrder: number;
  status: AddonAssignmentStatus;
  product?: { id: string; title: string; slug: string; sku?: string } | null;
  category?: { id: string; name: string; slug: string } | null;
  variation?: { id: string; title: string; sku: string } | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductAddon {
  id: string;
  storeId?: string | null;
  name: string;
  slug: string;
  code?: string | null;
  shortDescription?: string | null;
  description?: string | null;
  inputType: ProductAddonInputType;
  pricingType: ProductAddonPricingType;
  fixedPrice?: string | number | null;
  percentageRate?: string | number | null;
  minimumAmount?: string | number | null;
  maximumAmount?: string | number | null;
  defaultAmount?: string | number | null;
  taxRateId?: string | null;
  priceIncludesTax: boolean;
  imageFileId?: string | null;
  status: ProductAddonStatus;
  isRequired: boolean;
  allowQuantity: boolean;
  minimumQuantity: number;
  maximumQuantity?: number | null;
  defaultQuantity?: number | null;
  manageStock: boolean;
  stockQuantity?: number | null;
  reservedStock: number;
  lowStockThreshold?: number | null;
  allowBackorder: boolean;
  placeholder?: string | null;
  helpText?: string | null;
  validationJson?: string | null;
  customerLabel?: string | null;
  internalLabel?: string | null;
  sortOrder: number;
  startsAt?: string | null;
  endsAt?: string | null;
  createdByAdminId?: string | null;
  updatedByAdminId?: string | null;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  taxRate?: { id: string; name: string; totalRate: string | number } | null;
  options?: ProductAddonOption[];
  assignments?: AddonAssignment[];
}

export interface AddonGroupItem {
  id: string;
  groupId?: string;
  addonId: string;
  sortOrder: number;
  isDefault: boolean;
  addon?: Partial<ProductAddon>;
}

export interface AddonGroup {
  id: string;
  storeId?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  selectionType: AddonGroupSelectionType;
  minimumSelections: number;
  maximumSelections?: number | null;
  isRequired: boolean;
  status: ProductAddonStatus;
  sortOrder: number;
  items?: AddonGroupItem[];
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface ProductAddonFilterState {
  search?: string;
  status?: string;
  inputType?: string;
  pricingType?: string;
  assignmentType?: string;
  productId?: string;
  categoryId?: string;
  personalisedOnly?: boolean;
  stockStatus?: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'ALL';
  includeDeleted?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
