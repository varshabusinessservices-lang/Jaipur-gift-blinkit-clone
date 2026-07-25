export type TaxType = 'GST' | 'IGST' | 'ZERO_RATED' | 'EXEMPT' | 'CUSTOM';
export type TaxRateStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

export interface CreateTaxRateDto {
  storeId?: string | null;
  name: string;
  code: string;
  description?: string | null;
  taxType?: TaxType;
  totalRate: number | string;
  cgstRate?: number | string;
  sgstRate?: number | string;
  igstRate?: number | string;
  cessRate?: number | string;
  hsnCode?: string | null;
  sacCode?: string | null;
  priceIncludesTax?: boolean;
  status?: TaxRateStatus;
  isDefault?: boolean;
  sortOrder?: number;
  effectiveFrom?: string | Date | null;
  effectiveUntil?: string | Date | null;
}

export interface UpdateTaxRateDto {
  storeId?: string | null;
  name?: string;
  code?: string;
  description?: string | null;
  taxType?: TaxType;
  totalRate?: number | string;
  cgstRate?: number | string;
  sgstRate?: number | string;
  igstRate?: number | string;
  cessRate?: number | string;
  hsnCode?: string | null;
  sacCode?: string | null;
  priceIncludesTax?: boolean;
  status?: TaxRateStatus;
  isDefault?: boolean;
  sortOrder?: number;
  effectiveFrom?: string | Date | null;
  effectiveUntil?: string | Date | null;
}

export interface TaxRateFilterQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: TaxRateStatus;
  taxType?: TaxType;
  defaultOnly?: boolean | string;
  includeDeleted?: boolean | string;
  effectiveOn?: string;
  sortBy?: 'name' | 'code' | 'totalRate' | 'createdAt' | 'updatedAt' | 'sortOrder' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface TaxRateOptionsQuery {
  activeOnly?: boolean | string;
  search?: string;
  storeId?: string;
}

export interface TaxRateOption {
  id: string;
  name: string;
  code: string;
  totalRate: string;
  priceIncludesTax: boolean;
  status: TaxRateStatus;
  selectable: boolean;
}
