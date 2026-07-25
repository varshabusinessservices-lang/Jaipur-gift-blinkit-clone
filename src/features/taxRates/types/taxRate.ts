export type TaxType = 'GST' | 'IGST' | 'ZERO_RATED' | 'EXEMPT' | 'CUSTOM';
export type TaxRateStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

export interface TaxRate {
  id: string;
  storeId?: string | null;
  name: string;
  code: string;
  description?: string | null;
  taxType: TaxType;
  totalRate: string;
  cgstRate: string;
  sgstRate: string;
  igstRate: string;
  cessRate: string;
  hsnCode?: string | null;
  sacCode?: string | null;
  priceIncludesTax: boolean;
  status: TaxRateStatus;
  isDefault: boolean;
  sortOrder: number;
  effectiveFrom?: string | null;
  effectiveUntil?: string | null;
  createdByAdminId?: string | null;
  updatedByAdminId?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface TaxRateFormData {
  storeId?: string | null;
  name: string;
  code: string;
  description?: string | null;
  taxType: TaxType;
  totalRate: number | string;
  cgstRate?: number | string;
  sgstRate?: number | string;
  igstRate?: number | string;
  cessRate?: number | string;
  hsnCode?: string | null;
  sacCode?: string | null;
  priceIncludesTax: boolean;
  status: TaxRateStatus;
  isDefault: boolean;
  sortOrder: number;
  effectiveFrom?: string | null;
  effectiveUntil?: string | null;
}

export interface TaxRateFilterState {
  search?: string;
  status?: TaxRateStatus | '';
  taxType?: TaxType | '';
  defaultOnly?: boolean;
  includeDeleted?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'code' | 'totalRate' | 'sortOrder' | 'status' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
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
