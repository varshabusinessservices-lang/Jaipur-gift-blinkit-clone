import { config } from '../../../config/env';
import { 
  Category, 
  CategoryTreeNode, 
  CategoryFormData, 
  CategoryFilterState, 
  CategoryStatus,
  CategoryReorderPayload 
} from '../types/category';

const API_BASE = config.apiBaseUrl;

// Mock Data Store for Mock Mode
let mockCategories: CategoryTreeNode[] = [
  {
    id: 'cat-001',
    parentId: null,
    storeId: null,
    name: 'Personalised Gifts',
    slug: 'personalised-gifts',
    code: 'CAT-PERS-01',
    shortDescription: 'Customised gifts crafted with love in Jaipur.',
    description: 'Explore custom engraved gifts, custom name accessories, and memorable keepsakes with 90-min instant delivery in Jaipur.',
    imageFileId: 'img-001',
    iconFileId: 'icon-001',
    desktopBannerFileId: 'banner-001',
    mobileBannerFileId: 'banner-m-001',
    imageUrl: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&q=80&w=400',
    iconUrl: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&q=80&w=100',
    desktopBannerUrl: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&q=80&w=1200',
    mobileBannerUrl: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&q=80&w=600',
    status: 'ACTIVE',
    isFeatured: true,
    showOnHomepage: true,
    sortOrder: 1,
    level: 1,
    path: 'cat-001',
    seoTitle: 'Personalised Gifts Jaipur | Custom Name Gifts Online',
    seoDescription: 'Buy unique custom printed and engraved personalised gifts in Jaipur with 90-min express delivery.',
    seoKeywordsJson: JSON.stringify(['personalised gifts', 'jaipur gifts', 'custom gifts']),
    seoImageFileId: null,
    createdByAdminId: 'super-admin-id',
    updatedByAdminId: 'super-admin-id',
    createdAt: '2026-01-01T10:00:00Z',
    updatedAt: '2026-01-01T10:00:00Z',
    deletedAt: null,
    activeChildCount: 2,
    productCount: 124,
    children: [
      {
        id: 'cat-002',
        parentId: 'cat-001',
        storeId: null,
        name: 'Custom Photo Frames',
        slug: 'custom-photo-frames',
        code: 'CAT-FRM-02',
        shortDescription: 'Wooden LED & acrylic photo frames with express delivery.',
        description: 'High-definition acrylic and wooden LED photo frames customized with your memories.',
        imageFileId: 'img-002',
        iconFileId: 'icon-002',
        desktopBannerFileId: null,
        mobileBannerFileId: null,
        imageUrl: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?auto=format&fit=crop&q=80&w=400',
        iconUrl: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?auto=format&fit=crop&q=80&w=100',
        status: 'ACTIVE',
        isFeatured: true,
        showOnHomepage: true,
        sortOrder: 1,
        level: 2,
        path: 'cat-001/cat-002',
        seoTitle: 'Customised Photo Frames Online Jaipur',
        seoDescription: 'Personalised LED acrylic and wooden photo frames with instant preview.',
        seoKeywordsJson: JSON.stringify(['photo frames', 'led frames', 'acrylic photo frame']),
        seoImageFileId: null,
        createdByAdminId: 'super-admin-id',
        updatedByAdminId: 'super-admin-id',
        createdAt: '2026-01-02T10:00:00Z',
        updatedAt: '2026-01-02T10:00:00Z',
        deletedAt: null,
        activeChildCount: 1,
        productCount: 42,
        children: [
          {
            id: 'cat-003',
            parentId: 'cat-002',
            storeId: null,
            name: '3D Crystal Photo Laser Engraved',
            slug: '3d-crystal-photo-laser-engraved',
            code: 'CAT-3D-03',
            shortDescription: 'Laser engraved 3D crystal cubes with LED light base.',
            description: '3D laser photo engraving inside optical glass crystal cubes.',
            imageFileId: 'img-003',
            iconFileId: null,
            desktopBannerFileId: null,
            mobileBannerFileId: null,
            imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=400',
            iconUrl: null,
            status: 'ACTIVE',
            isFeatured: false,
            showOnHomepage: false,
            sortOrder: 1,
            level: 3,
            path: 'cat-001/cat-002/cat-003',
            seoTitle: '3D Crystal Photo Laser Engraved Jaipur',
            seoDescription: 'Laser engraved 3D crystal photo gifts with LED light base.',
            seoKeywordsJson: JSON.stringify(['3d crystal photo', 'laser photo crystal']),
            seoImageFileId: null,
            createdByAdminId: 'super-admin-id',
            updatedByAdminId: 'super-admin-id',
            createdAt: '2026-01-03T10:00:00Z',
            updatedAt: '2026-01-03T10:00:00Z',
            deletedAt: null,
            activeChildCount: 0,
            productCount: 18,
            children: []
          }
        ]
      },
      {
        id: 'cat-004',
        parentId: 'cat-001',
        storeId: null,
        name: 'Personalised Mugs & Sippers',
        slug: 'personalised-mugs-sippers',
        code: 'CAT-MUG-04',
        shortDescription: 'Magic heat transfer mugs, stainless steel sippers & flasks.',
        description: 'Custom mug printing with custom photos, quotes, and temperature displays.',
        imageFileId: 'img-004',
        iconFileId: null,
        desktopBannerFileId: null,
        mobileBannerFileId: null,
        imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=400',
        iconUrl: null,
        status: 'ACTIVE',
        isFeatured: true,
        showOnHomepage: true,
        sortOrder: 2,
        level: 2,
        path: 'cat-001/cat-004',
        seoTitle: 'Custom Printed Mugs Jaipur',
        seoDescription: 'Magic mugs and personalised travel flasks.',
        seoKeywordsJson: JSON.stringify(['custom mug', 'magic mug', 'sipper bottle']),
        seoImageFileId: null,
        createdByAdminId: 'super-admin-id',
        updatedByAdminId: 'super-admin-id',
        createdAt: '2026-01-04T10:00:00Z',
        updatedAt: '2026-01-04T10:00:00Z',
        deletedAt: null,
        activeChildCount: 0,
        productCount: 36,
        children: []
      }
    ]
  },
  {
    id: 'cat-005',
    parentId: null,
    storeId: null,
    name: 'Jaipur Craft Specials',
    slug: 'jaipur-craft-specials',
    code: 'CAT-JPR-05',
    shortDescription: 'Traditional Rajasthani handicrafts & blue pottery personalised keepsakes.',
    description: 'Authentic artisan items with custom block print packaging and brass nameplates.',
    imageFileId: 'img-005',
    iconFileId: 'icon-005',
    desktopBannerFileId: null,
    mobileBannerFileId: null,
    imageUrl: 'https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&q=80&w=400',
    iconUrl: 'https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&q=80&w=100',
    status: 'ACTIVE',
    isFeatured: true,
    showOnHomepage: true,
    sortOrder: 2,
    level: 1,
    path: 'cat-005',
    seoTitle: 'Jaipur Handicraft Personalised Gifts',
    seoDescription: 'Authentic Rajasthani artisan gifts with custom branding.',
    seoKeywordsJson: JSON.stringify(['jaipur crafts', 'blue pottery', 'rajasthani gifts']),
    seoImageFileId: null,
    createdByAdminId: 'super-admin-id',
    updatedByAdminId: 'super-admin-id',
    createdAt: '2026-01-05T10:00:00Z',
    updatedAt: '2026-01-05T10:00:00Z',
    deletedAt: null,
    activeChildCount: 1,
    productCount: 68,
    children: [
      {
        id: 'cat-006',
        parentId: 'cat-005',
        storeId: null,
        name: 'Block Print Personalised Pouches',
        slug: 'block-print-personalised-pouches',
        code: 'CAT-BLK-06',
        shortDescription: 'Sanganeri hand block printed cotton pouches with embroidered names.',
        description: 'Eco-friendly Sanganeri cotton pouches with custom monogramming.',
        imageFileId: null,
        iconFileId: null,
        desktopBannerFileId: null,
        mobileBannerFileId: null,
        imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=400',
        iconUrl: null,
        status: 'ACTIVE',
        isFeatured: false,
        showOnHomepage: false,
        sortOrder: 1,
        level: 2,
        path: 'cat-005/cat-006',
        seoTitle: 'Block Print Monogrammed Pouches',
        seoDescription: 'Sanganeri block print canvas bags with custom names.',
        seoKeywordsJson: JSON.stringify(['sanganeri print', 'block print bag']),
        seoImageFileId: null,
        createdByAdminId: 'super-admin-id',
        updatedByAdminId: 'super-admin-id',
        createdAt: '2026-01-06T10:00:00Z',
        updatedAt: '2026-01-06T10:00:00Z',
        deletedAt: null,
        activeChildCount: 0,
        productCount: 22,
        children: []
      }
    ]
  },
  {
    id: 'cat-007',
    parentId: null,
    storeId: null,
    name: 'Corporate & Bulk Gifting',
    slug: 'corporate-bulk-gifting',
    code: 'CAT-CORP-07',
    shortDescription: 'Custom logo engraved hampers, leatherette diaries & desk organisers.',
    description: 'Bulk corporate branding gifts with custom laser engraving and quick Jaipur local dispatch.',
    imageFileId: 'img-007',
    iconFileId: null,
    desktopBannerFileId: null,
    mobileBannerFileId: null,
    imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238bd345a?auto=format&fit=crop&q=80&w=400',
    iconUrl: null,
    status: 'ACTIVE',
    isFeatured: false,
    showOnHomepage: true,
    sortOrder: 3,
    level: 1,
    path: 'cat-007',
    seoTitle: 'Corporate Personalised Gifts Jaipur',
    seoDescription: 'Custom company logo hampers and executive gifting solutions.',
    seoKeywordsJson: JSON.stringify(['corporate gifts', 'logo engraving', 'executive hampers']),
    seoImageFileId: null,
    createdByAdminId: 'super-admin-id',
    updatedByAdminId: 'super-admin-id',
    createdAt: '2026-01-07T10:00:00Z',
    updatedAt: '2026-01-07T10:00:00Z',
    deletedAt: null,
    activeChildCount: 0,
    productCount: 45,
    children: []
  },
  {
    id: 'cat-008',
    parentId: null,
    storeId: null,
    name: 'Seasonal & Festive Specials',
    slug: 'seasonal-festive-specials',
    code: 'CAT-FEST-08',
    shortDescription: 'Diwali, Teej, Rakhi & Wedding anniversary personalised combo gift sets.',
    description: 'Curated festive hampers with custom sweets, dry fruits and personalized greeting cards.',
    imageFileId: null,
    iconFileId: null,
    desktopBannerFileId: null,
    mobileBannerFileId: null,
    imageUrl: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&q=80&w=400',
    iconUrl: null,
    status: 'INACTIVE',
    isFeatured: false,
    showOnHomepage: false,
    sortOrder: 4,
    level: 1,
    path: 'cat-008',
    seoTitle: 'Festive Personalised Gifts Jaipur',
    seoDescription: 'Exclusive Diwali and festive personalized gift sets.',
    seoKeywordsJson: JSON.stringify(['festive gifts', 'diwali hampers']),
    seoImageFileId: null,
    createdByAdminId: 'super-admin-id',
    updatedByAdminId: 'super-admin-id',
    createdAt: '2026-01-08T10:00:00Z',
    updatedAt: '2026-01-08T10:00:00Z',
    deletedAt: null,
    activeChildCount: 0,
    productCount: 15,
    children: []
  }
];

// Helper to flatten mock categories
function flattenTree(nodes: CategoryTreeNode[]): Category[] {
  const result: Category[] = [];
  const traverse = (list: CategoryTreeNode[]) => {
    for (const node of list) {
      const { children, ...flat } = node;
      result.push(flat);
      if (children && children.length > 0) {
        traverse(children);
      }
    }
  };
  traverse(nodes);
  return result;
}

export const categoryApi = {
  /**
   * Get category tree
   */
  async getCategoryTree(): Promise<CategoryTreeNode[]> {
    if (config.adminUseMockApi) {
      await new Promise((r) => setTimeout(r, 200));
      return mockCategories;
    }

    const token = localStorage.getItem('admin_token');
    const res = await fetch(`${API_BASE}/admin/categories/tree`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch category tree');
    return data.data;
  },

  /**
   * Get filtered list of categories
   */
  async getCategories(filters: Partial<CategoryFilterState>): Promise<{
    data: Category[];
    meta: { total: number; page: number; limit: number; totalPages: number; view: string };
  }> {
    if (config.adminUseMockApi) {
      await new Promise((r) => setTimeout(r, 200));
      let flat = flattenTree(mockCategories);

      if (filters.search) {
        const s = filters.search.toLowerCase();
        flat = flat.filter(
          (c) =>
            c.name.toLowerCase().includes(s) ||
            c.slug.toLowerCase().includes(s) ||
            (c.code && c.code.toLowerCase().includes(s))
        );
      }

      if (filters.status && filters.status !== 'ALL') {
        flat = flat.filter((c) => c.status === filters.status);
      }

      if (filters.parentId && filters.parentId !== 'ALL') {
        if (filters.parentId === 'null' || filters.parentId === 'root') {
          flat = flat.filter((c) => c.parentId === null);
        } else {
          flat = flat.filter((c) => c.parentId === filters.parentId);
        }
      }

      if (filters.isFeatured && filters.isFeatured !== 'all') {
        const feat = filters.isFeatured === 'true';
        flat = flat.filter((c) => c.isFeatured === feat);
      }

      if (filters.showOnHomepage && filters.showOnHomepage !== 'all') {
        const home = filters.showOnHomepage === 'true';
        flat = flat.filter((c) => c.showOnHomepage === home);
      }

      const page = filters.page || 1;
      const limit = filters.limit || 50;

      return {
        data: flat,
        meta: {
          total: flat.length,
          page,
          limit,
          totalPages: Math.ceil(flat.length / limit) || 1,
          view: 'list',
        },
      };
    }

    const queryParams = new URLSearchParams();
    if (filters.search) queryParams.set('search', filters.search);
    if (filters.status) queryParams.set('status', filters.status);
    if (filters.parentId) queryParams.set('parentId', filters.parentId);
    if (filters.isFeatured) queryParams.set('isFeatured', filters.isFeatured);
    if (filters.showOnHomepage) queryParams.set('showOnHomepage', filters.showOnHomepage);
    if (filters.sortBy) queryParams.set('sortBy', filters.sortBy);
    if (filters.sortOrder) queryParams.set('sortOrder', filters.sortOrder);
    if (filters.view) queryParams.set('view', filters.view);
    if (filters.page) queryParams.set('page', String(filters.page));
    if (filters.limit) queryParams.set('limit', String(filters.limit));

    const token = localStorage.getItem('admin_token');
    const res = await fetch(`${API_BASE}/admin/categories?${queryParams.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch categories');
    return {
      data: data.data || [],
      meta: data.meta || { total: 0, page: 1, limit: 50, totalPages: 1, view: 'list' },
    };
  },

  /**
   * Get single category by ID
   */
  async getCategoryById(id: string): Promise<Category> {
    if (config.adminUseMockApi) {
      await new Promise((r) => setTimeout(r, 150));
      const flat = flattenTree(mockCategories);
      const cat = flat.find((c) => c.id === id);
      if (!cat) throw new Error(`Category with ID ${id} not found`);

      const parent = cat.parentId ? flat.find((p) => p.id === cat.parentId) : null;
      const children = flat.filter((ch) => ch.parentId === cat.id);

      return {
        ...cat,
        parent: parent ? { id: parent.id, name: parent.name, slug: parent.slug, level: parent.level } : null,
        children: children as any,
        breadcrumbs: parent ? [{ id: parent.id, name: parent.name, slug: parent.slug }] : [],
        analyticsPlaceholder: {
          totalProducts: cat.productCount || 15,
          activeProducts: Math.max(0, (cat.productCount || 15) - 2),
          totalSalesAmount: 185000,
          totalOrdersCount: 112,
          conversionRatePct: 4.8,
          avgOrderValue: 1651,
        },
      };
    }

    const token = localStorage.getItem('admin_token');
    const res = await fetch(`${API_BASE}/admin/categories/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Category not found');
    return data.data;
  },

  /**
   * Create category
   */
  async createCategory(formData: CategoryFormData): Promise<Category> {
    if (config.adminUseMockApi) {
      await new Promise((r) => setTimeout(r, 300));

      const newId = `cat-${Date.now()}`;
      const slug = formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

      let level = 1;
      let path = newId;

      if (formData.parentId) {
        const flat = flattenTree(mockCategories);
        const parent = flat.find((p) => p.id === formData.parentId);
        if (parent) {
          level = parent.level + 1;
          path = `${parent.path || parent.id}/${newId}`;
        }
      }

      const newCategoryNode: CategoryTreeNode = {
        id: newId,
        parentId: formData.parentId || null,
        storeId: formData.storeId || null,
        name: formData.name,
        slug: slug,
        code: formData.code || null,
        shortDescription: formData.shortDescription || null,
        description: formData.description || null,
        imageFileId: formData.imageFileId || null,
        iconFileId: formData.iconFileId || null,
        desktopBannerFileId: formData.desktopBannerFileId || null,
        mobileBannerFileId: formData.mobileBannerFileId || null,
        imageUrl: formData.imageUrl || 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&q=80&w=400',
        iconUrl: formData.iconUrl || null,
        desktopBannerUrl: formData.desktopBannerUrl || null,
        mobileBannerUrl: formData.mobileBannerUrl || null,
        status: formData.status || 'ACTIVE',
        isFeatured: formData.isFeatured || false,
        showOnHomepage: formData.showOnHomepage || false,
        sortOrder: formData.sortOrder || 1,
        level: level,
        path: path,
        seoTitle: formData.seoTitle || null,
        seoDescription: formData.seoDescription || null,
        seoKeywordsJson: formData.seoKeywords ? JSON.stringify(formData.seoKeywords.split(',').map((s) => s.trim())) : null,
        seoImageFileId: formData.seoImageFileId || null,
        createdByAdminId: 'super-admin-id',
        updatedByAdminId: 'super-admin-id',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
        children: [],
        productCount: 0,
        activeChildCount: 0,
      };

      if (!formData.parentId) {
        mockCategories.push(newCategoryNode);
      } else {
        const insertIntoTree = (list: CategoryTreeNode[]): boolean => {
          for (const node of list) {
            if (node.id === formData.parentId) {
              node.children.push(newCategoryNode);
              node.activeChildCount = (node.activeChildCount || 0) + 1;
              return true;
            }
            if (node.children.length > 0 && insertIntoTree(node.children)) {
              return true;
            }
          }
          return false;
        };
        insertIntoTree(mockCategories);
      }

      return newCategoryNode;
    }

    const token = localStorage.getItem('admin_token');
    const res = await fetch(`${API_BASE}/admin/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create category');
    return data.data;
  },

  /**
   * Update category
   */
  async updateCategory(id: string, formData: Partial<CategoryFormData>): Promise<Category> {
    if (config.adminUseMockApi) {
      await new Promise((r) => setTimeout(r, 300));
      const flat = flattenTree(mockCategories);
      const cat = flat.find((c) => c.id === id);
      if (!cat) throw new Error(`Category with ID ${id} not found`);

      // Circular parent check in mock mode
      if (formData.parentId && formData.parentId === id) {
        throw new Error('A category cannot be its own parent.');
      }

      Object.assign(cat, formData, { updatedAt: new Date().toISOString() });
      return cat;
    }

    const token = localStorage.getItem('admin_token');
    const res = await fetch(`${API_BASE}/admin/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update category');
    return data.data;
  },

  /**
   * Quick status toggle
   */
  async updateStatus(id: string, status: CategoryStatus): Promise<Category> {
    if (config.adminUseMockApi) {
      await new Promise((r) => setTimeout(r, 150));
      const flat = flattenTree(mockCategories);
      const cat = flat.find((c) => c.id === id);
      if (cat) cat.status = status;
      return cat as Category;
    }

    const token = localStorage.getItem('admin_token');
    const res = await fetch(`${API_BASE}/admin/categories/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ status }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update status');
    return data.data;
  },

  /**
   * Reorder categories
   */
  async reorderCategories(payload: CategoryReorderPayload): Promise<void> {
    if (config.adminUseMockApi) {
      await new Promise((r) => setTimeout(r, 200));
      const flat = flattenTree(mockCategories);
      payload.items.forEach((item) => {
        const cat = flat.find((c) => c.id === item.id);
        if (cat) {
          cat.sortOrder = item.sortOrder;
          if (item.parentId !== undefined) cat.parentId = item.parentId;
        }
      });
      return;
    }

    const token = localStorage.getItem('admin_token');
    const res = await fetch(`${API_BASE}/admin/categories/reorder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to reorder categories');
  },

  /**
   * Soft delete category
   * SAFETY CHECK: Verify subcategories do not exist before deleting!
   */
  async deleteCategory(id: string): Promise<void> {
    if (config.adminUseMockApi) {
      await new Promise((r) => setTimeout(r, 200));
      const flat = flattenTree(mockCategories);
      const cat = flat.find((c) => c.id === id);

      if (cat) {
        // Safety check for active children
        const children = flat.filter((ch) => ch.parentId === id && !ch.deletedAt);
        if (children.length > 0) {
          throw new Error(
            `Cannot delete category '${cat.name}' because it contains ${children.length} subcategory/subcategories. Please move or delete subcategories first.`
          );
        }
        cat.deletedAt = new Date().toISOString();
        cat.status = 'ARCHIVED';
      }
      return;
    }

    const token = localStorage.getItem('admin_token');
    const res = await fetch(`${API_BASE}/admin/categories/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete category');
  },

  /**
   * Restore category
   */
  async restoreCategory(id: string): Promise<Category> {
    if (config.adminUseMockApi) {
      await new Promise((r) => setTimeout(r, 200));
      const flat = flattenTree(mockCategories);
      const cat = flat.find((c) => c.id === id);
      if (cat) {
        cat.deletedAt = null;
        cat.status = 'ACTIVE';
      }
      return cat as Category;
    }

    const token = localStorage.getItem('admin_token');
    const res = await fetch(`${API_BASE}/admin/categories/${id}/restore`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to restore category');
    return data.data;
  },

  /**
   * Upload media asset (image, icon, banner)
   */
  async uploadMedia(file: File, role: string = 'CATEGORY_IMAGE'): Promise<{ fileAssetId: string; url: string }> {
    if (config.adminUseMockApi) {
      await new Promise((r) => setTimeout(r, 400));
      const fakeId = `file-${Date.now()}`;
      const fakeUrl = URL.createObjectURL(file);
      return { fileAssetId: fakeId, url: fakeUrl };
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('role', role);

    const token = localStorage.getItem('admin_token');
    const res = await fetch(`${API_BASE}/admin/categories/media`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to upload image');
    return data.data;
  },
};
