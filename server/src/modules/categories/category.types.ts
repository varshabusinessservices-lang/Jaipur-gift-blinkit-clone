export type CategoryStatusType = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

export interface CategoryFilterQuery {
  search?: string;
  status?: CategoryStatusType | 'ALL';
  parentId?: string | 'null' | 'root';
  isFeatured?: boolean | string;
  showOnHomepage?: boolean | string;
  storeId?: string;
  page?: number | string;
  limit?: number | string;
  sortBy?: 'sortOrder' | 'name' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  view?: 'tree' | 'flat' | 'list';
  includeDeleted?: boolean | string;
}

export interface CreateCategoryDto {
  name: string;
  slug?: string;
  code?: string;
  parentId?: string | null;
  storeId?: string | null;
  shortDescription?: string;
  description?: string;
  imageFileId?: string | null;
  iconFileId?: string | null;
  desktopBannerFileId?: string | null;
  mobileBannerFileId?: string | null;
  categoryType?: 'PARENT' | 'CHILD' | 'SUB_CHILD';
  level?: number;
  mobileImageFileId?: string | null;
  showInNavigation?: boolean;
  showInSearch?: boolean;
  showOnDesktop?: boolean;
  showOnMobile?: boolean;
  imageAltText?: string | null;
  bannerAltText?: string | null;
  bgColour?: string | null;
  textColour?: string | null;

  status?: CategoryStatusType;
  isFeatured?: boolean;
  showOnHomepage?: boolean;
  sortOrder?: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywordsJson?: string;
  seoImageFileId?: string | null;
}

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {}

export interface CategoryReorderItem {
  id: string;
  parentId?: string | null;
  sortOrder: number;
}

export type DeleteCategoryMode = 'SINGLE' | 'CASCADE_DESCENDANTS' | 'MOVE_DESCENDANTS' | 'DEACTIVATE_BRANCH';

export interface DeleteCategoryOptions {
  mode?: DeleteCategoryMode;
  targetParentId?: string | null;
  reason?: string;
}

export interface CategoryTreeNode {
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
  status: CategoryStatusType;
  isFeatured: boolean;
  showOnHomepage: boolean;
  sortOrder: number;
  level: number;
  path: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywordsJson: string | null;
  seoImageFileId: string | null;
  createdByAdminId: string | null;
  updatedByAdminId: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  deletedAt: string | Date | null;
  children: CategoryTreeNode[];
  productCount?: number;
  activeChildCount?: number;
}
