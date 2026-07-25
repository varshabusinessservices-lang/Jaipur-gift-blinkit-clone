import { config } from '../../../config/env';
import {
  ProductAttributeDetail,
  ProductAttributeValueItem,
  AttributeFilterQuery,
  CreateAttributeInput,
  CreateAttributeValueInput,
  AttributeGroupDetail,
} from '../types/productAttribute';
import { generateVariationCombinations, AttributeSelectionInput } from '../../../utils/variationCombinator';

const API_BASE = config.apiBaseUrl;

// Mock Store for Frontend Mock API mode
let mockAttributes: ProductAttributeDetail[] = [
  {
    id: 'attr-frame-size-01',
    name: 'Frame Size',
    slug: 'frame-size',
    code: 'ATTR-SIZE-01',
    description: 'Standard dimensions for custom photo frames and plaques.',
    type: 'BUTTON',
    status: 'ACTIVE',
    isVariationAttribute: true,
    isFilterable: true,
    isRequiredByDefault: true,
    showOnProductPage: true,
    showInProductSummary: true,
    allowMultipleValues: false,
    sortOrder: 1,
    valueCount: 4,
    activeValueCount: 4,
    assignedCategoryCount: 1,
    productUsageCount: null,
    usageStatus: 'UNAVAILABLE',
    values: [
      {
        id: 'val-a4',
        attributeId: 'attr-frame-size-01',
        name: 'A4 Size (8.3 × 11.7 in)',
        slug: 'a4',
        code: 'VAL-A4',
        displayValue: 'A4',
        status: 'ACTIVE',
        sortOrder: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'val-a3',
        attributeId: 'attr-frame-size-01',
        name: 'A3 Size (11.7 × 16.5 in)',
        slug: 'a3',
        code: 'VAL-A3',
        displayValue: 'A3',
        status: 'ACTIVE',
        sortOrder: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'val-1218',
        attributeId: 'attr-frame-size-01',
        name: '12 × 18 Inches',
        slug: '12-18-inches',
        code: 'VAL-1218',
        displayValue: '12 × 18"',
        status: 'ACTIVE',
        sortOrder: 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'val-1824',
        attributeId: 'attr-frame-size-01',
        name: '18 × 24 Inches',
        slug: '18-24-inches',
        code: 'VAL-1824',
        displayValue: '18 × 24"',
        status: 'ACTIVE',
        sortOrder: 4,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    categoryAssignments: [
      {
        id: 'assign-01',
        attributeId: 'attr-frame-size-01',
        categoryId: 'cat-photo-frames-01',
        categoryName: 'Photo Frames',
        isRequired: true,
        isVariationAttribute: true,
        isFilterable: true,
        sortOrder: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'attr-frame-colour-02',
    name: 'Frame Colour',
    slug: 'frame-colour',
    code: 'ATTR-COLOUR-02',
    description: 'Border tint and finish shade.',
    type: 'COLOUR_SWATCH',
    status: 'ACTIVE',
    isVariationAttribute: true,
    isFilterable: true,
    isRequiredByDefault: true,
    showOnProductPage: true,
    showInProductSummary: true,
    allowMultipleValues: false,
    sortOrder: 2,
    valueCount: 4,
    activeValueCount: 4,
    assignedCategoryCount: 1,
    productUsageCount: null,
    usageStatus: 'UNAVAILABLE',
    values: [
      {
        id: 'val-black',
        attributeId: 'attr-frame-colour-02',
        name: 'Classic Black',
        slug: 'black',
        code: 'VAL-BLK',
        displayValue: 'Black',
        colourHex: '#000000',
        status: 'ACTIVE',
        sortOrder: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'val-white',
        attributeId: 'attr-frame-colour-02',
        name: 'Pure White',
        slug: 'white',
        code: 'VAL-WHT',
        displayValue: 'White',
        colourHex: '#FFFFFF',
        status: 'ACTIVE',
        sortOrder: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'val-brown',
        attributeId: 'attr-frame-colour-02',
        name: 'Teak Brown',
        slug: 'brown',
        code: 'VAL-BRN',
        displayValue: 'Brown',
        colourHex: '#8B4513',
        status: 'ACTIVE',
        sortOrder: 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'val-golden',
        attributeId: 'attr-frame-colour-02',
        name: 'Royal Golden',
        slug: 'golden',
        code: 'VAL-GLD',
        displayValue: 'Golden',
        colourHex: '#FFD700',
        status: 'ACTIVE',
        sortOrder: 4,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    categoryAssignments: [],
    createdAt: new Date(Date.now() - 25 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'attr-material-03',
    name: 'Material',
    slug: 'material',
    code: 'ATTR-MAT-03',
    description: 'Primary material used for frame body or plaque base.',
    type: 'DROPDOWN',
    status: 'ACTIVE',
    isVariationAttribute: true,
    isFilterable: true,
    isRequiredByDefault: false,
    showOnProductPage: true,
    showInProductSummary: true,
    allowMultipleValues: false,
    sortOrder: 3,
    valueCount: 4,
    activeValueCount: 4,
    assignedCategoryCount: 0,
    productUsageCount: null,
    usageStatus: 'UNAVAILABLE',
    values: [
      {
        id: 'val-mdf',
        attributeId: 'attr-material-03',
        name: 'Engineered MDF Wood',
        slug: 'mdf',
        code: 'VAL-MDF',
        displayValue: 'MDF',
        status: 'ACTIVE',
        sortOrder: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'val-wood',
        attributeId: 'attr-material-03',
        name: 'Solid Pine Wood',
        slug: 'wood',
        code: 'VAL-PINE',
        displayValue: 'Wood',
        status: 'ACTIVE',
        sortOrder: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'val-acrylic',
        attributeId: 'attr-material-03',
        name: 'Clear Acrylic',
        slug: 'acrylic',
        code: 'VAL-ACR',
        displayValue: 'Acrylic',
        status: 'ACTIVE',
        sortOrder: 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'val-metal',
        attributeId: 'attr-material-03',
        name: 'Anodized Aluminum Metal',
        slug: 'metal',
        code: 'VAL-MET',
        displayValue: 'Metal',
        status: 'ACTIVE',
        sortOrder: 4,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    categoryAssignments: [],
    createdAt: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'attr-tshirt-size-04',
    name: 'T-Shirt Size',
    slug: 't-shirt-size',
    code: 'ATTR-TSHIRT-04',
    description: 'Apparel sizing for custom printed t-shirts.',
    type: 'BUTTON',
    status: 'ACTIVE',
    isVariationAttribute: true,
    isFilterable: true,
    isRequiredByDefault: true,
    showOnProductPage: true,
    showInProductSummary: true,
    allowMultipleValues: false,
    sortOrder: 4,
    valueCount: 5,
    activeValueCount: 5,
    assignedCategoryCount: 0,
    productUsageCount: null,
    usageStatus: 'UNAVAILABLE',
    values: [
      {
        id: 'val-s',
        attributeId: 'attr-tshirt-size-04',
        name: 'Small (38")',
        slug: 'small',
        code: 'VAL-S',
        displayValue: 'S',
        status: 'ACTIVE',
        sortOrder: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'val-m',
        attributeId: 'attr-tshirt-size-04',
        name: 'Medium (40")',
        slug: 'medium',
        code: 'VAL-M',
        displayValue: 'M',
        status: 'ACTIVE',
        sortOrder: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'val-l',
        attributeId: 'attr-tshirt-size-04',
        name: 'Large (42")',
        slug: 'large',
        code: 'VAL-L',
        displayValue: 'L',
        status: 'ACTIVE',
        sortOrder: 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'val-xl',
        attributeId: 'attr-tshirt-size-04',
        name: 'Extra Large (44")',
        slug: 'xlarge',
        code: 'VAL-XL',
        displayValue: 'XL',
        status: 'ACTIVE',
        sortOrder: 4,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'val-xxl',
        attributeId: 'attr-tshirt-size-04',
        name: 'Double Extra Large (46")',
        slug: 'xxlarge',
        code: 'VAL-XXL',
        displayValue: 'XXL',
        status: 'ACTIVE',
        sortOrder: 5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    categoryAssignments: [],
    createdAt: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let mockGroups: AttributeGroupDetail[] = [
  {
    id: 'grp-frame-specs-01',
    name: 'Frame Specifications',
    slug: 'frame-specifications',
    description: 'Essential dimensions and material settings for photo frames.',
    sortOrder: 1,
    status: 'ACTIVE',
    attributes: [mockAttributes[0], mockAttributes[1], mockAttributes[2]],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const productAttributeApi = {
  async getAttributes(filters: AttributeFilterQuery = {}): Promise<{
    attributes: ProductAttributeDetail[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const isMock = config.adminUseMockApi ?? config.useMockApi;

    if (isMock) {
      await new Promise((r) => setTimeout(r, 120));
      let items = [...mockAttributes];

      if (!filters.includeDeleted) {
        items = items.filter((a) => !a.deletedAt);
      } else {
        items = items.filter((a) => Boolean(a.deletedAt));
      }

      if (filters.status) {
        items = items.filter((a) => a.status === filters.status);
      }

      if (filters.type) {
        items = items.filter((a) => a.type === filters.type);
      }

      if (filters.variationOnly) {
        items = items.filter((a) => a.isVariationAttribute);
      }

      if (filters.filterableOnly) {
        items = items.filter((a) => a.isFilterable);
      }

      if (filters.search) {
        const q = filters.search.toLowerCase();
        items = items.filter(
          (a) =>
            a.name.toLowerCase().includes(q) ||
            a.slug.toLowerCase().includes(q) ||
            (a.code && a.code.toLowerCase().includes(q))
        );
      }

      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const total = items.length;

      const skip = (page - 1) * limit;
      const paginated = items.slice(skip, skip + limit);

      return {
        attributes: paginated,
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
    if (filters.type) queryParams.set('type', filters.type);
    if (filters.variationOnly) queryParams.set('variationOnly', 'true');
    if (filters.filterableOnly) queryParams.set('filterableOnly', 'true');
    if (filters.includeDeleted) queryParams.set('includeDeleted', 'true');
    if (filters.sortBy) queryParams.set('sortBy', filters.sortBy);
    if (filters.sortOrder) queryParams.set('sortOrder', filters.sortOrder);

    const res = await fetch(`${API_BASE}/api/v1/admin/product-attributes?${queryParams.toString()}`, {
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch product attributes');
    }

    const json = await res.json();
    return {
      attributes: json.data || [],
      total: json.pagination?.total || 0,
      page: json.pagination?.page || 1,
      limit: json.pagination?.limit || 20,
      totalPages: json.pagination?.totalPages || 1,
    };
  },

  async getAttributeById(id: string): Promise<ProductAttributeDetail> {
    const isMock = config.adminUseMockApi ?? config.useMockApi;

    if (isMock) {
      await new Promise((r) => setTimeout(r, 100));
      const found = mockAttributes.find((a) => a.id === id);
      if (!found) throw new Error('Product attribute not found');
      return found;
    }

    const res = await fetch(`${API_BASE}/api/v1/admin/product-attributes/${id}`, {
      credentials: 'include',
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Product attribute not found');
    }

    const json = await res.json();
    return json.data;
  },

  async createAttribute(data: CreateAttributeInput): Promise<ProductAttributeDetail> {
    const isMock = config.adminUseMockApi ?? config.useMockApi;

    if (isMock) {
      await new Promise((r) => setTimeout(r, 150));
      const slug = data.slug || data.name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      if (mockAttributes.some((a) => a.slug === slug && !a.deletedAt)) {
        throw new Error('ATTRIBUTE_SLUG_EXISTS: An attribute with this slug already exists');
      }

      const attrId = `attr-${Date.now()}`;
      const createdVals: ProductAttributeValueItem[] = (data.values || []).map((v, i) => ({
        id: v.id || `val-${Date.now()}-${i}`,
        attributeId: attrId,
        name: v.name,
        slug: v.slug || v.name.toLowerCase().replace(/\s+/g, '-'),
        code: v.code || null,
        description: v.description || null,
        displayValue: v.displayValue || v.name,
        colourHex: v.colourHex || null,
        imageFileId: v.imageFileId || null,
        status: v.status || 'ACTIVE',
        sortOrder: v.sortOrder ?? i + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      const newAttr: ProductAttributeDetail = {
        id: attrId,
        storeId: null,
        name: data.name,
        slug,
        code: data.code || null,
        description: data.description || null,
        type: data.type,
        status: data.status || 'ACTIVE',
        isVariationAttribute: data.isVariationAttribute ?? true,
        isFilterable: data.isFilterable ?? true,
        isRequiredByDefault: data.isRequiredByDefault ?? false,
        showOnProductPage: data.showOnProductPage ?? true,
        showInProductSummary: data.showInProductSummary ?? true,
        allowMultipleValues: data.allowMultipleValues ?? false,
        sortOrder: data.sortOrder ?? 0,
        valueCount: createdVals.length,
        activeValueCount: createdVals.filter((v) => v.status === 'ACTIVE').length,
        assignedCategoryCount: (data.categoryAssignments || []).length,
        productUsageCount: null,
        usageStatus: 'UNAVAILABLE',
        values: createdVals,
        categoryAssignments: (data.categoryAssignments || []).map((ca, i) => ({
          id: `assign-${Date.now()}-${i}`,
          attributeId: attrId,
          categoryId: ca.categoryId,
          categoryName: 'Selected Category',
          isRequired: ca.isRequired ?? false,
          isVariationAttribute: ca.isVariationAttribute,
          isFilterable: ca.isFilterable,
          sortOrder: ca.sortOrder ?? i + 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      };

      mockAttributes.unshift(newAttr);
      return newAttr;
    }

    const res = await fetch(`${API_BASE}/api/v1/admin/product-attributes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to create product attribute');
    }

    const json = await res.json();
    return json.data;
  },

  async updateAttribute(id: string, data: Partial<CreateAttributeInput>): Promise<ProductAttributeDetail> {
    const isMock = config.adminUseMockApi ?? config.useMockApi;

    if (isMock) {
      await new Promise((r) => setTimeout(r, 150));
      const idx = mockAttributes.findIndex((a) => a.id === id);
      if (idx === -1) throw new Error('Attribute not found');

      const existing = mockAttributes[idx];
      const updatedValues: ProductAttributeValueItem[] = data.values
        ? data.values.map((v, i) => ({
            id: v.id || `val-${Date.now()}-${i}`,
            attributeId: id,
            name: v.name,
            slug: v.slug || v.name.toLowerCase().replace(/\s+/g, '-'),
            code: v.code || null,
            description: v.description || null,
            displayValue: v.displayValue || v.name,
            colourHex: v.colourHex || null,
            imageFileId: v.imageFileId || null,
            status: v.status || 'ACTIVE',
            sortOrder: v.sortOrder ?? i + 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }))
        : existing.values;

      mockAttributes[idx] = {
        ...existing,
        ...(data as any),
        values: updatedValues,
        valueCount: updatedValues.length,
        activeValueCount: updatedValues.filter((v) => v.status === 'ACTIVE').length,
        updatedAt: new Date().toISOString(),
      };
      return mockAttributes[idx];
    }

    const res = await fetch(`${API_BASE}/api/v1/admin/product-attributes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to update attribute');
    }

    const json = await res.json();
    return json.data;
  },

  async updateAttributeStatus(id: string, status: string): Promise<ProductAttributeDetail> {
    return this.updateAttribute(id, { status: status as any });
  },

  async deleteAttribute(id: string): Promise<void> {
    const isMock = config.adminUseMockApi ?? config.useMockApi;

    if (isMock) {
      await new Promise((r) => setTimeout(r, 150));
      const item = mockAttributes.find((a) => a.id === id);
      if (item) {
        item.deletedAt = new Date().toISOString();
        item.status = 'INACTIVE';
      }
      return;
    }

    const res = await fetch(`${API_BASE}/api/v1/admin/product-attributes/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to delete attribute');
    }
  },

  async restoreAttribute(id: string): Promise<ProductAttributeDetail> {
    const isMock = config.adminUseMockApi ?? config.useMockApi;

    if (isMock) {
      await new Promise((r) => setTimeout(r, 150));
      const item = mockAttributes.find((a) => a.id === id);
      if (!item) throw new Error('Attribute not found');
      item.deletedAt = null;
      item.status = 'INACTIVE';
      item.updatedAt = new Date().toISOString();
      return item;
    }

    const res = await fetch(`${API_BASE}/api/v1/admin/product-attributes/${id}/restore`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to restore attribute');
    }

    const json = await res.json();
    return json.data;
  },

  async createAttributeValue(attributeId: string, data: CreateAttributeValueInput): Promise<ProductAttributeValueItem> {
    const isMock = config.adminUseMockApi ?? config.useMockApi;

    if (isMock) {
      const attr = mockAttributes.find((a) => a.id === attributeId);
      if (!attr) throw new Error('Attribute not found');

      const newVal: ProductAttributeValueItem = {
        id: `val-${Date.now()}`,
        attributeId,
        name: data.name,
        slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-'),
        code: data.code || null,
        description: data.description || null,
        displayValue: data.displayValue || data.name,
        colourHex: data.colourHex || null,
        imageFileId: data.imageFileId || null,
        status: data.status || 'ACTIVE',
        sortOrder: data.sortOrder ?? attr.values.length + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      attr.values.push(newVal);
      attr.valueCount = attr.values.length;
      attr.activeValueCount = attr.values.filter((v) => v.status === 'ACTIVE').length;
      return newVal;
    }

    const res = await fetch(`${API_BASE}/api/v1/admin/product-attributes/${attributeId}/values`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to create attribute value');
    }

    const json = await res.json();
    return json.data;
  },

  async generateCombinations(selections: AttributeSelectionInput[], maxLimit?: number) {
    const isMock = config.adminUseMockApi ?? config.useMockApi;

    if (isMock) {
      return generateVariationCombinations(selections, maxLimit || 100);
    }

    const res = await fetch(`${API_BASE}/api/v1/admin/product-attributes/generate-combinations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ selections, maxLimit }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to generate combinations');
    }

    const json = await res.json();
    return json.data;
  },

  async getAttributeGroups(): Promise<AttributeGroupDetail[]> {
    const isMock = config.adminUseMockApi ?? config.useMockApi;

    if (isMock) {
      return mockGroups;
    }

    const res = await fetch(`${API_BASE}/api/v1/admin/attribute-groups`, {
      credentials: 'include',
    });

    if (!res.ok) {
      throw new Error('Failed to fetch attribute groups');
    }

    const json = await res.json();
    return json.data || [];
  }
};
