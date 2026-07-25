import { config } from '../../../config/env';
import { 
  Brand, 
  BrandFormData, 
  BrandFilterState, 
  BrandOption,
  BrandStatus 
} from '../types/brand';

const API_BASE = config.apiBaseUrl;

// Mock Store for Brands
let mockBrands: Brand[] = [
  {
    id: 'brand-001',
    storeId: null,
    name: 'Photo Frame Studio',
    slug: 'photo-frame-studio',
    code: 'BRD-PFS-01',
    shortDescription: 'In-house studio crafting custom acrylic & wooden LED photo frames.',
    description: 'Premier Jaipur photo frame studio specializing in high-definition UV printed acrylic frames, customized LED wooden frames, and memory shadow boxes.',
    logoFileId: 'img-logo-001',
    bannerFileId: 'img-banner-001',
    logoUrl: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&q=80&w=200',
    bannerUrl: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&q=80&w=1200',
    seoImageFileId: null,
    websiteUrl: 'https://jaipurgifts.example.com/brands/photo-frame-studio',
    status: 'ACTIVE',
    isFeatured: true,
    sortOrder: 1,
    productCount: null,
    seoTitle: 'Photo Frame Studio Jaipur | Custom Acrylic & LED Frames',
    seoDescription: 'Order custom personalised photo frames from Photo Frame Studio in Jaipur with 90-min instant delivery.',
    seoKeywordsJson: JSON.stringify(['photo frame studio', 'acrylic photo frame', 'jaipur customised frames']),
    createdByAdminId: 'super-admin-id',
    updatedByAdminId: 'super-admin-id',
    createdAt: '2026-01-01T10:00:00.000Z',
    updatedAt: '2026-01-01T10:00:00.000Z',
    deletedAt: null,
  },
  {
    id: 'brand-002',
    storeId: null,
    name: 'Jaipur Gifts',
    slug: 'jaipur-gifts',
    code: 'BRD-JPG-02',
    shortDescription: 'Handcrafted authentic Jaipuri keepsakes and personalised wooden crafts.',
    description: 'Traditional and contemporary gift collection showcasing handcrafted blue pottery motifs, brass engravings, and custom name plaques.',
    logoFileId: null,
    bannerFileId: null,
    logoUrl: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?auto=format&fit=crop&q=80&w=200',
    bannerUrl: null,
    seoImageFileId: null,
    websiteUrl: 'https://jaipurgifts.example.com',
    status: 'ACTIVE',
    isFeatured: true,
    sortOrder: 2,
    productCount: null,
    seoTitle: 'Jaipur Gifts | Artisanal Keepsakes & Custom Name Gifts',
    seoDescription: 'Handmade Jaipuri gifts with custom engraving options.',
    seoKeywordsJson: JSON.stringify(['jaipur gifts', 'artisanal keepsakes', 'custom plaque']),
    createdByAdminId: 'super-admin-id',
    updatedByAdminId: 'super-admin-id',
    createdAt: '2026-01-02T10:00:00.000Z',
    updatedAt: '2026-01-02T10:00:00.000Z',
    deletedAt: null,
  },
  {
    id: 'brand-003',
    storeId: null,
    name: 'Celebration Collection',
    slug: 'celebration-collection',
    code: 'BRD-CEL-03',
    shortDescription: 'Curated gift hampers for birthdays, anniversaries, and festive moments.',
    description: 'Exclusive celebration kits combining personalised memory items, premium chocolates, and greeting cards.',
    logoFileId: null,
    bannerFileId: null,
    logoUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=200',
    bannerUrl: null,
    seoImageFileId: null,
    websiteUrl: null,
    status: 'ACTIVE',
    isFeatured: false,
    sortOrder: 3,
    productCount: null,
    seoTitle: 'Celebration Collection | Birthday & Anniversary Gift Hampers',
    seoDescription: 'Express celebration gift hampers with instant 90-minute delivery in Jaipur.',
    seoKeywordsJson: JSON.stringify(['gift hampers', 'celebration kit', 'instant gift jaipur']),
    createdByAdminId: 'super-admin-id',
    updatedByAdminId: 'super-admin-id',
    createdAt: '2026-01-03T10:00:00.000Z',
    updatedAt: '2026-01-03T10:00:00.000Z',
    deletedAt: null,
  }
];

export const brandApi = {
  async getBrands(filters: BrandFilterState = {}): Promise<{
    brands: Brand[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const isMock = config.adminUseMockApi ?? config.useMockApi;

    if (isMock) {
      await new Promise((r) => setTimeout(r, 120));
      let items = [...mockBrands];

      if (!filters.includeDeleted) {
        items = items.filter((b) => !b.deletedAt);
      } else {
        items = items.filter((b) => Boolean(b.deletedAt));
      }

      if (filters.status) {
        items = items.filter((b) => b.status === filters.status);
      }

      if (filters.featured !== undefined && filters.featured !== '') {
        const featBool = filters.featured === 'true';
        items = items.filter((b) => b.isFeatured === featBool);
      }

      if (filters.search) {
        const q = filters.search.toLowerCase();
        items = items.filter(
          (b) =>
            b.name.toLowerCase().includes(q) ||
            b.slug.toLowerCase().includes(q) ||
            (b.code && b.code.toLowerCase().includes(q)) ||
            (b.description && b.description.toLowerCase().includes(q))
        );
      }

      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const total = items.length;

      const skip = (page - 1) * limit;
      const paginated = items.slice(skip, skip + limit);

      return {
        brands: paginated,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      };
    }

    const queryParams = new URLSearchParams();
    if (filters.page) queryParams.set('page', String(filters.page));
    if (filters.limit) queryParams.set('limit', String(filters.limit));
    if (filters.search) queryParams.set('search', filters.search);
    if (filters.status) queryParams.set('status', filters.status);
    if (filters.featured !== undefined) queryParams.set('featured', String(filters.featured));
    if (filters.includeDeleted) queryParams.set('includeDeleted', 'true');
    if (filters.sortBy) queryParams.set('sortBy', filters.sortBy);
    if (filters.sortOrder) queryParams.set('sortOrder', filters.sortOrder);

    const res = await fetch(`${API_BASE}/api/v1/admin/brands?${queryParams.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch brands');
    }

    const json = await res.json();
    return {
      brands: json.data || [],
      total: json.meta?.total || 0,
      page: json.meta?.page || 1,
      limit: json.meta?.limit || 20,
      totalPages: json.meta?.totalPages || 1,
    };
  },

  async getBrandById(id: string): Promise<Brand> {
    const isMock = config.adminUseMockApi ?? config.useMockApi;

    if (isMock) {
      await new Promise((r) => setTimeout(r, 100));
      const found = mockBrands.find((b) => b.id === id);
      if (!found) throw new Error('Brand not found');
      return found;
    }

    const res = await fetch(`${API_BASE}/api/v1/admin/brands/${id}`, {
      credentials: 'include',
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Brand not found');
    }

    const json = await res.json();
    return json.data;
  },

  async createBrand(data: BrandFormData): Promise<Brand> {
    const isMock = config.adminUseMockApi ?? config.useMockApi;

    if (isMock) {
      await new Promise((r) => setTimeout(r, 150));
      const slug = data.slug || data.name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      if (mockBrands.some((b) => b.slug === slug && !b.deletedAt)) {
        throw new Error('BRAND_SLUG_EXISTS: A brand with this slug already exists');
      }

      const newBrand: Brand = {
        id: `brand-${Date.now()}`,
        storeId: data.storeId || null,
        name: data.name,
        slug,
        code: data.code || null,
        description: data.description || null,
        shortDescription: data.shortDescription || null,
        logoFileId: data.logoFileId || null,
        bannerFileId: data.bannerFileId || null,
        seoImageFileId: data.seoImageFileId || null,
        websiteUrl: data.websiteUrl || null,
        status: data.status || 'ACTIVE',
        isFeatured: data.isFeatured ?? false,
        sortOrder: data.sortOrder ?? 0,
        productCount: null,
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
        seoKeywordsJson: data.seoKeywordsJson || null,
        createdByAdminId: 'super-admin-id',
        updatedByAdminId: 'super-admin-id',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      };

      mockBrands.unshift(newBrand);
      return newBrand;
    }

    const res = await fetch(`${API_BASE}/api/v1/admin/brands`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to create brand');
    }

    const json = await res.json();
    return json.data;
  },

  async updateBrand(id: string, data: Partial<BrandFormData>): Promise<Brand> {
    const isMock = config.adminUseMockApi ?? config.useMockApi;

    if (isMock) {
      await new Promise((r) => setTimeout(r, 150));
      const idx = mockBrands.findIndex((b) => b.id === id);
      if (idx === -1) throw new Error('Brand not found');

      if (data.slug) {
        if (mockBrands.some((b) => b.slug === data.slug && b.id !== id && !b.deletedAt)) {
          throw new Error('BRAND_SLUG_EXISTS: A brand with this slug already exists');
        }
      }

      mockBrands[idx] = {
        ...mockBrands[idx],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      return mockBrands[idx];
    }

    const res = await fetch(`${API_BASE}/api/v1/admin/brands/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to update brand');
    }

    const json = await res.json();
    return json.data;
  },

  async updateBrandStatus(id: string, status: BrandStatus): Promise<Brand> {
    return this.updateBrand(id, { status });
  },

  async updateBrandFeatured(id: string, isFeatured: boolean): Promise<Brand> {
    return this.updateBrand(id, { isFeatured });
  },

  async deleteBrand(id: string): Promise<void> {
    const isMock = config.adminUseMockApi ?? config.useMockApi;

    if (isMock) {
      await new Promise((r) => setTimeout(r, 150));
      const item = mockBrands.find((b) => b.id === id);
      if (item) {
        item.deletedAt = new Date().toISOString();
        item.status = 'INACTIVE';
      }
      return;
    }

    const res = await fetch(`${API_BASE}/api/v1/admin/brands/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to delete brand');
    }
  },

  async restoreBrand(id: string): Promise<Brand> {
    const isMock = config.adminUseMockApi ?? config.useMockApi;

    if (isMock) {
      await new Promise((r) => setTimeout(r, 150));
      const item = mockBrands.find((b) => b.id === id);
      if (!item) throw new Error('Brand not found');
      item.deletedAt = null;
      item.status = 'INACTIVE';
      item.updatedAt = new Date().toISOString();
      return item;
    }

    const res = await fetch(`${API_BASE}/api/v1/admin/brands/${id}/restore`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to restore brand');
    }

    const json = await res.json();
    return json.data;
  },

  async duplicateBrand(id: string): Promise<Brand> {
    const isMock = config.adminUseMockApi ?? config.useMockApi;

    if (isMock) {
      const item = await this.getBrandById(id);
      return this.createBrand({
        name: `${item.name} (Copy)`,
        code: item.code ? `${item.code}-COPY` : null,
        description: item.description,
        shortDescription: item.shortDescription,
        logoFileId: item.logoFileId,
        bannerFileId: item.bannerFileId,
        seoImageFileId: item.seoImageFileId,
        websiteUrl: item.websiteUrl,
        status: 'INACTIVE',
        isFeatured: false,
        sortOrder: item.sortOrder + 1,
        seoTitle: item.seoTitle,
        seoDescription: item.seoDescription,
        seoKeywordsJson: item.seoKeywordsJson,
      });
    }

    const res = await fetch(`${API_BASE}/api/v1/admin/brands/${id}/duplicate`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to duplicate brand');
    }

    const json = await res.json();
    return json.data;
  },

  async getBrandOptions(query: { activeOnly?: boolean; search?: string } = {}): Promise<BrandOption[]> {
    const isMock = config.adminUseMockApi ?? config.useMockApi;

    if (isMock) {
      let filtered = mockBrands.filter((b) => !b.deletedAt);
      if (query.activeOnly !== false) {
        filtered = filtered.filter((b) => b.status === 'ACTIVE');
      }
      if (query.search) {
        const q = query.search.toLowerCase();
        filtered = filtered.filter((b) => b.name.toLowerCase().includes(q));
      }
      return filtered.map((b) => ({
        id: b.id,
        name: b.name,
        slug: b.slug,
        code: b.code || null,
        status: b.status,
        selectable: b.status === 'ACTIVE',
      }));
    }

    const queryParams = new URLSearchParams();
    if (query.activeOnly !== undefined) queryParams.set('activeOnly', String(query.activeOnly));
    if (query.search) queryParams.set('search', query.search);

    const res = await fetch(`${API_BASE}/api/v1/admin/brands/options?${queryParams.toString()}`, {
      credentials: 'include',
    });

    if (!res.ok) {
      throw new Error('Failed to fetch brand options');
    }

    const json = await res.json();
    return json.data || [];
  }
};
