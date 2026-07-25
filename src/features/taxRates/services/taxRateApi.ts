import { config } from '../../../config/env';
import { 
  TaxRate, 
  TaxRateFormData, 
  TaxRateFilterState, 
  TaxRateOption,
  TaxRateStatus 
} from '../types/taxRate';

const API_BASE = config.apiBaseUrl;

// Mock Tax Rates
let mockTaxRates: TaxRate[] = [
  {
    id: 'tax-001',
    storeId: null,
    name: 'GST 0% (Exempt / Nil)',
    code: 'TAX-GST-0',
    description: 'Zero rated tax slab for exempt handcrafted goods.',
    taxType: 'GST',
    totalRate: '0.0000',
    cgstRate: '0.0000',
    sgstRate: '0.0000',
    igstRate: '0.0000',
    cessRate: '0.0000',
    hsnCode: '9999',
    sacCode: null,
    priceIncludesTax: true,
    status: 'ACTIVE',
    isDefault: false,
    sortOrder: 1,
    effectiveFrom: '2026-01-01T00:00:00.000Z',
    effectiveUntil: null,
    createdByAdminId: 'super-admin-id',
    updatedByAdminId: 'super-admin-id',
    createdAt: '2026-01-01T10:00:00.000Z',
    updatedAt: '2026-01-01T10:00:00.000Z',
    deletedAt: null,
  },
  {
    id: 'tax-002',
    storeId: null,
    name: 'GST 5%',
    code: 'TAX-GST-5',
    description: '5% GST slab (2.5% CGST + 2.5% SGST or 5% IGST).',
    taxType: 'GST',
    totalRate: '5.0000',
    cgstRate: '2.5000',
    sgstRate: '2.5000',
    igstRate: '5.0000',
    cessRate: '0.0000',
    hsnCode: '4901',
    sacCode: null,
    priceIncludesTax: true,
    status: 'ACTIVE',
    isDefault: false,
    sortOrder: 2,
    effectiveFrom: '2026-01-01T00:00:00.000Z',
    effectiveUntil: null,
    createdByAdminId: 'super-admin-id',
    updatedByAdminId: 'super-admin-id',
    createdAt: '2026-01-01T10:00:00.000Z',
    updatedAt: '2026-01-01T10:00:00.000Z',
    deletedAt: null,
  },
  {
    id: 'tax-003',
    storeId: null,
    name: 'GST 12%',
    code: 'TAX-GST-12',
    description: '12% GST slab (6% CGST + 6% SGST or 12% IGST).',
    taxType: 'GST',
    totalRate: '12.0000',
    cgstRate: '6.0000',
    sgstRate: '6.0000',
    igstRate: '12.0000',
    cessRate: '0.0000',
    hsnCode: '4414',
    sacCode: null,
    priceIncludesTax: true,
    status: 'ACTIVE',
    isDefault: false,
    sortOrder: 3,
    effectiveFrom: '2026-01-01T00:00:00.000Z',
    effectiveUntil: null,
    createdByAdminId: 'super-admin-id',
    updatedByAdminId: 'super-admin-id',
    createdAt: '2026-01-01T10:00:00.000Z',
    updatedAt: '2026-01-01T10:00:00.000Z',
    deletedAt: null,
  },
  {
    id: 'tax-004',
    storeId: null,
    name: 'GST 18% (Standard Default)',
    code: 'TAX-GST-18',
    description: 'Standard 18% GST rate for personalised gifts, photo frames and acrylics.',
    taxType: 'GST',
    totalRate: '18.0000',
    cgstRate: '9.0000',
    sgstRate: '9.0000',
    igstRate: '18.0000',
    cessRate: '0.0000',
    hsnCode: '3926',
    sacCode: null,
    priceIncludesTax: true,
    status: 'ACTIVE',
    isDefault: true,
    sortOrder: 4,
    effectiveFrom: '2026-01-01T00:00:00.000Z',
    effectiveUntil: null,
    createdByAdminId: 'super-admin-id',
    updatedByAdminId: 'super-admin-id',
    createdAt: '2026-01-01T10:00:00.000Z',
    updatedAt: '2026-01-01T10:00:00.000Z',
    deletedAt: null,
  },
  {
    id: 'tax-005',
    storeId: null,
    name: 'GST 28%',
    code: 'TAX-GST-28',
    description: '28% GST luxury slab for premium high-end gift accessories.',
    taxType: 'GST',
    totalRate: '28.0000',
    cgstRate: '14.0000',
    sgstRate: '14.0000',
    igstRate: '28.0000',
    cessRate: '0.0000',
    hsnCode: '8543',
    sacCode: null,
    priceIncludesTax: true,
    status: 'ACTIVE',
    isDefault: false,
    sortOrder: 5,
    effectiveFrom: '2026-01-01T00:00:00.000Z',
    effectiveUntil: null,
    createdByAdminId: 'super-admin-id',
    updatedByAdminId: 'super-admin-id',
    createdAt: '2026-01-01T10:00:00.000Z',
    updatedAt: '2026-01-01T10:00:00.000Z',
    deletedAt: null,
  }
];

export const taxRateApi = {
  async getTaxRates(filters: TaxRateFilterState = {}): Promise<{
    taxRates: TaxRate[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const isMock = config.adminUseMockApi ?? config.useMockApi;

    if (isMock) {
      await new Promise((r) => setTimeout(r, 120));
      let items = [...mockTaxRates];

      if (!filters.includeDeleted) {
        items = items.filter((t) => !t.deletedAt);
      } else {
        items = items.filter((t) => Boolean(t.deletedAt));
      }

      if (filters.status) {
        items = items.filter((t) => t.status === filters.status);
      }

      if (filters.taxType) {
        items = items.filter((t) => t.taxType === filters.taxType);
      }

      if (filters.defaultOnly) {
        items = items.filter((t) => t.isDefault);
      }

      if (filters.search) {
        const q = filters.search.toLowerCase();
        items = items.filter(
          (t) =>
            t.name.toLowerCase().includes(q) ||
            t.code.toLowerCase().includes(q) ||
            (t.hsnCode && t.hsnCode.toLowerCase().includes(q)) ||
            (t.sacCode && t.sacCode.toLowerCase().includes(q))
        );
      }

      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const total = items.length;

      const skip = (page - 1) * limit;
      const paginated = items.slice(skip, skip + limit);

      return {
        taxRates: paginated,
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
    if (filters.taxType) queryParams.set('taxType', filters.taxType);
    if (filters.defaultOnly) queryParams.set('defaultOnly', 'true');
    if (filters.includeDeleted) queryParams.set('includeDeleted', 'true');
    if (filters.sortBy) queryParams.set('sortBy', filters.sortBy);
    if (filters.sortOrder) queryParams.set('sortOrder', filters.sortOrder);

    const res = await fetch(`${API_BASE}/api/v1/admin/tax-rates?${queryParams.toString()}`, {
      credentials: 'include',
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch tax rates');
    }

    const json = await res.json();
    return {
      taxRates: json.data || [],
      total: json.meta?.total || 0,
      page: json.meta?.page || 1,
      limit: json.meta?.limit || 20,
      totalPages: json.meta?.totalPages || 1,
    };
  },

  async getTaxRateById(id: string): Promise<TaxRate> {
    const isMock = config.adminUseMockApi ?? config.useMockApi;

    if (isMock) {
      await new Promise((r) => setTimeout(r, 100));
      const found = mockTaxRates.find((t) => t.id === id);
      if (!found) throw new Error('Tax rate not found');
      return found;
    }

    const res = await fetch(`${API_BASE}/api/v1/admin/tax-rates/${id}`, {
      credentials: 'include',
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Tax rate not found');
    }

    const json = await res.json();
    return json.data;
  },

  async createTaxRate(data: TaxRateFormData): Promise<TaxRate> {
    const isMock = config.adminUseMockApi ?? config.useMockApi;

    if (isMock) {
      await new Promise((r) => setTimeout(r, 150));
      const code = data.code.toUpperCase();
      if (mockTaxRates.some((t) => t.code === code && !t.deletedAt)) {
        throw new Error('TAX_RATE_CODE_EXISTS: A tax rate with this code already exists');
      }

      if (data.isDefault) {
        mockTaxRates.forEach((t) => {
          t.isDefault = false;
        });
      }

      const newTaxRate: TaxRate = {
        id: `tax-${Date.now()}`,
        storeId: data.storeId || null,
        name: data.name,
        code,
        description: data.description || null,
        taxType: data.taxType || 'GST',
        totalRate: Number(data.totalRate).toFixed(4),
        cgstRate: Number(data.cgstRate ?? 0).toFixed(4),
        sgstRate: Number(data.sgstRate ?? 0).toFixed(4),
        igstRate: Number(data.igstRate ?? 0).toFixed(4),
        cessRate: Number(data.cessRate ?? 0).toFixed(4),
        hsnCode: data.hsnCode || null,
        sacCode: data.sacCode || null,
        priceIncludesTax: data.priceIncludesTax ?? true,
        status: data.status || 'ACTIVE',
        isDefault: data.isDefault ?? false,
        sortOrder: data.sortOrder ?? 0,
        effectiveFrom: data.effectiveFrom || null,
        effectiveUntil: data.effectiveUntil || null,
        createdByAdminId: 'super-admin-id',
        updatedByAdminId: 'super-admin-id',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      };

      mockTaxRates.push(newTaxRate);
      return newTaxRate;
    }

    const res = await fetch(`${API_BASE}/api/v1/admin/tax-rates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to create tax rate');
    }

    const json = await res.json();
    return json.data;
  },

  async updateTaxRate(id: string, data: Partial<TaxRateFormData>): Promise<TaxRate> {
    const isMock = config.adminUseMockApi ?? config.useMockApi;

    if (isMock) {
      await new Promise((r) => setTimeout(r, 150));
      const idx = mockTaxRates.findIndex((t) => t.id === id);
      if (idx === -1) throw new Error('Tax rate not found');

      if (data.code) {
        const code = data.code.toUpperCase();
        if (mockTaxRates.some((t) => t.code === code && t.id !== id && !t.deletedAt)) {
          throw new Error('TAX_RATE_CODE_EXISTS: A tax rate with this code already exists');
        }
      }

      if (data.isDefault) {
        mockTaxRates.forEach((t) => {
          t.isDefault = false;
        });
      }

      mockTaxRates[idx] = {
        ...mockTaxRates[idx],
        ...data,
        totalRate: data.totalRate !== undefined ? Number(data.totalRate).toFixed(4) : mockTaxRates[idx].totalRate,
        cgstRate: data.cgstRate !== undefined ? Number(data.cgstRate).toFixed(4) : mockTaxRates[idx].cgstRate,
        sgstRate: data.sgstRate !== undefined ? Number(data.sgstRate).toFixed(4) : mockTaxRates[idx].sgstRate,
        igstRate: data.igstRate !== undefined ? Number(data.igstRate).toFixed(4) : mockTaxRates[idx].igstRate,
        cessRate: data.cessRate !== undefined ? Number(data.cessRate).toFixed(4) : mockTaxRates[idx].cessRate,
        updatedAt: new Date().toISOString(),
      };
      return mockTaxRates[idx];
    }

    const res = await fetch(`${API_BASE}/api/v1/admin/tax-rates/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to update tax rate');
    }

    const json = await res.json();
    return json.data;
  },

  async setDefaultTaxRate(id: string): Promise<TaxRate> {
    const isMock = config.adminUseMockApi ?? config.useMockApi;

    if (isMock) {
      return this.updateTaxRate(id, { isDefault: true });
    }

    const res = await fetch(`${API_BASE}/api/v1/admin/tax-rates/${id}/default`, {
      method: 'PATCH',
      credentials: 'include',
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to set default tax rate');
    }

    const json = await res.json();
    return json.data;
  },

  async updateTaxRateStatus(id: string, status: TaxRateStatus): Promise<TaxRate> {
    return this.updateTaxRate(id, { status });
  },

  async deleteTaxRate(id: string): Promise<void> {
    const isMock = config.adminUseMockApi ?? config.useMockApi;

    if (isMock) {
      await new Promise((r) => setTimeout(r, 150));
      const item = mockTaxRates.find((t) => t.id === id);
      if (item) {
        if (item.isDefault) {
          throw new Error('TAX_RATE_DELETE_BLOCKED: Cannot delete default tax rate. Set another rate as default first.');
        }
        item.deletedAt = new Date().toISOString();
        item.status = 'INACTIVE';
      }
      return;
    }

    const res = await fetch(`${API_BASE}/api/v1/admin/tax-rates/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to delete tax rate');
    }
  },

  async restoreTaxRate(id: string): Promise<TaxRate> {
    const isMock = config.adminUseMockApi ?? config.useMockApi;

    if (isMock) {
      await new Promise((r) => setTimeout(r, 150));
      const item = mockTaxRates.find((t) => t.id === id);
      if (!item) throw new Error('Tax rate not found');
      item.deletedAt = null;
      item.status = 'INACTIVE';
      item.updatedAt = new Date().toISOString();
      return item;
    }

    const res = await fetch(`${API_BASE}/api/v1/admin/tax-rates/${id}/restore`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to restore tax rate');
    }

    const json = await res.json();
    return json.data;
  },

  async getTaxRateOptions(query: { activeOnly?: boolean; search?: string } = {}): Promise<TaxRateOption[]> {
    const isMock = config.adminUseMockApi ?? config.useMockApi;

    if (isMock) {
      let filtered = mockTaxRates.filter((t) => !t.deletedAt);
      if (query.activeOnly !== false) {
        filtered = filtered.filter((t) => t.status === 'ACTIVE');
      }
      if (query.search) {
        const q = query.search.toLowerCase();
        filtered = filtered.filter((t) => t.name.toLowerCase().includes(q));
      }
      return filtered.map((t) => ({
        id: t.id,
        name: t.name,
        code: t.code,
        totalRate: t.totalRate,
        priceIncludesTax: t.priceIncludesTax,
        status: t.status,
        selectable: t.status === 'ACTIVE',
      }));
    }

    const queryParams = new URLSearchParams();
    if (query.activeOnly !== undefined) queryParams.set('activeOnly', String(query.activeOnly));
    if (query.search) queryParams.set('search', query.search);

    const res = await fetch(`${API_BASE}/api/v1/admin/tax-rates/options?${queryParams.toString()}`, {
      credentials: 'include',
    });

    if (!res.ok) {
      throw new Error('Failed to fetch tax rate options');
    }

    const json = await res.json();
    return json.data || [];
  }
};
