export type BrandStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

export interface CreateBrandDto {
  storeId?: string | null;
  name: string;
  slug?: string;
  code?: string | null;
  description?: string | null;
  shortDescription?: string | null;
  logoFileId?: string | null;
  bannerFileId?: string | null;
  seoImageFileId?: string | null;
  websiteUrl?: string | null;
  status?: BrandStatus;
  isFeatured?: boolean;
  sortOrder?: number;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywordsJson?: string | null;
}

export interface UpdateBrandDto {
  storeId?: string | null;
  name?: string;
  slug?: string;
  code?: string | null;
  description?: string | null;
  shortDescription?: string | null;
  logoFileId?: string | null;
  bannerFileId?: string | null;
  seoImageFileId?: string | null;
  websiteUrl?: string | null;
  status?: BrandStatus;
  isFeatured?: boolean;
  sortOrder?: number;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywordsJson?: string | null;
}

export interface BrandFilterQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: BrandStatus;
  featured?: boolean | string;
  storeId?: string;
  includeDeleted?: boolean | string;
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'sortOrder' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface BrandReorderItem {
  id: string;
  sortOrder: number;
}

export interface BrandOptionsQuery {
  activeOnly?: boolean | string;
  search?: string;
  storeId?: string;
}

export interface BrandOption {
  id: string;
  name: string;
  slug: string;
  code: string | null;
  status: BrandStatus;
  selectable: boolean;
}
