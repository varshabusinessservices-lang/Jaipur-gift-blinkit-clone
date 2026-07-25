export type CategoryStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

export interface Category {
  id: string;
  parentId: string | null;
  storeId: string | null;
  name: string;
  slug: string;
  code: string | null;
  shortDescription: string | null;
  description: string | null;
  imageFileId: string | null;
  iconFileId: string | null;
  desktopBannerFileId: string | null;
  mobileBannerFileId: string | null;
  imageUrl?: string | null;
  iconUrl?: string | null;
  desktopBannerUrl?: string | null;
  mobileBannerUrl?: string | null;
  status: CategoryStatus;
  isFeatured: boolean;
  showOnHomepage: boolean;
  sortOrder: number;
  level: number;
  path: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywordsJson: string | null;
  seoImageFileId: string | null;
  seoImageUrl?: string | null;
  createdByAdminId: string | null;
  updatedByAdminId: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  parent?: {
    id: string;
    name: string;
    slug: string;
    level?: number;
    path?: string | null;
  } | null;
  children?: Category[];
  _count?: {
    children: number;
    products?: number;
  };
  activeChildCount?: number;
  productCount?: number;
  breadcrumbs?: Array<{ id: string; name: string; slug: string }>;
  analyticsPlaceholder?: CategoryAnalyticsPlaceholder;
}

export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
}

export interface CategoryAnalyticsPlaceholder {
  totalProducts: number;
  activeProducts: number;
  totalSalesAmount: number;
  totalOrdersCount: number;
  conversionRatePct: number;
  avgOrderValue: number;
}

export interface CategoryFormData {
  name: string;
  slug: string;
  code: string;
  parentId: string | null;
  storeId: string | null;
  shortDescription: string;
  description: string;
  imageFileId: string | null;
  imageUrl: string | null;
  iconFileId: string | null;
  iconUrl: string | null;
  desktopBannerFileId: string | null;
  desktopBannerUrl: string | null;
  mobileBannerFileId: string | null;
  mobileBannerUrl: string | null;
  status: CategoryStatus;
  isFeatured: boolean;
  showOnHomepage: boolean;
  sortOrder: number;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  seoImageFileId: string | null;
  seoImageUrl: string | null;
}

export interface CategoryFilterState {
  search: string;
  status: CategoryStatus | 'ALL';
  parentId: string | 'null' | 'root' | 'ALL';
  isFeatured: string; // 'all' | 'true' | 'false'
  showOnHomepage: string; // 'all' | 'true' | 'false'
  storeId: string;
  view: 'tree' | 'list';
  sortBy: 'sortOrder' | 'name' | 'createdAt' | 'updatedAt';
  sortOrder: 'asc' | 'desc';
  page: number;
  limit: number;
  includeDeleted: boolean;
}

export interface CategoryReorderPayload {
  items: Array<{
    id: string;
    parentId?: string | null;
    sortOrder: number;
  }>;
}
