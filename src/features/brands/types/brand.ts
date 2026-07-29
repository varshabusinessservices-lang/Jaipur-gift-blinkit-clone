export type BrandStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

export interface Brand {
  id: string;
  storeId?: string | null;
  name: string;
  slug: string;
  code?: string | null;
  description?: string | null;
  shortDescription?: string | null;
  logoFileId?: string | null;
  logoAltText?: string | null;
  seoImageFileId?: string | null;
  seoImageAltText?: string | null;
  logoUrl?: string | null;
  seoImageUrl?: string | null;
  websiteUrl?: string | null;
  status: BrandStatus;
  isFeatured: boolean;
  sortOrder: number;
  productCount?: number | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywordsJson?: string | null;
  createdByAdminId?: string | null;
  updatedByAdminId?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface BrandFormData {
  storeId?: string | null;
  name: string;
  slug?: string;
  code?: string | null;
  description?: string | null;
  shortDescription?: string | null;
  logoFileId?: string | null;
  logoAltText?: string | null;
  seoImageFileId?: string | null;
  seoImageAltText?: string | null;
  logoUrl?: string | null;
  seoImageUrl?: string | null;
  websiteUrl?: string | null;
  status: BrandStatus;
  isFeatured: boolean;
  sortOrder: number;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywordsJson?: string | null;
}

export interface BrandFilterState {
  search?: string;
  status?: BrandStatus | '';
  featured?: string; // 'true', 'false', ''
  includeDeleted?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'sortOrder' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface BrandOption {
  id: string;
  name: string;
  slug: string;
  code: string | null;
  status: BrandStatus;
  selectable: boolean;
}
