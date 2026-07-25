import { config } from '../../../config/env';
import {
  ProductVariationDetail,
  ProductVariationFilterQuery,
  GeneratePreviewInput,
  PreviewResult,
  GenerateVariationsInput,
  CreateVariationInput,
  BulkUpdateInput,
} from '../types/productVariation';
import { buildCombinationKey } from '../../../utils/variationCombinator';

const API_BASE = config.apiBaseUrl;

// Mock memory store for variations when mock API mode is enabled
let mockVariations: ProductVariationDetail[] = [
  {
    id: 'var-001',
    productId: 'prod-002',
    combinationKey: 'attr-size:val-a4|attr-colour:val-black',
    title: 'A4 / Black',
    sku: 'JPG-FRM-A4-BLK',
    barcode: '890123456801',
    status: 'ACTIVE',
    isDefault: true,
    mrp: '1499.00',
    sellingPrice: '999.00',
    costPrice: '350.00',
    effectiveMrp: '1499.00',
    effectiveSellingPrice: '999.00',
    priceSource: 'OVERRIDE',
    taxRateId: 'tax-gst-18',
    taxRateName: 'GST 18%',
    taxRateValue: 18,
    priceIncludesTax: true,
    manageStock: true,
    stockQuantity: 25,
    reservedStock: 0,
    availableStock: 25,
    stockStatus: 'IN_STOCK',
    lowStockThreshold: 5,
    allowBackorder: false,
    weightGrams: '650.00',
    lengthCm: '30.00',
    widthCm: '21.00',
    heightCm: '3.00',
    preparationTimeMinutes: 45,
    packingTimeMinutes: 15,
    sameDayEligible: true,
    nextDayEligible: true,
    expressEligible: true,
    maximumSameDayDistanceKm: '15.00',
    externalLabRequired: false,
    requiresManualDeliveryReview: false,
    mainImageFileId: null,
    mainImageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80',
    sortOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    values: [
      {
        id: 'vv-1',
        variationId: 'var-001',
        attributeId: 'attr-size',
        attributeName: 'Size',
        attributeValueId: 'val-a4',
        valueName: 'A4',
        displayValue: 'A4 (8.3 x 11.7 in)',
        colourHex: null,
        sortOrder: 1,
      },
      {
        id: 'vv-2',
        variationId: 'var-001',
        attributeId: 'attr-colour',
        attributeName: 'Colour',
        attributeValueId: 'val-black',
        valueName: 'Black',
        displayValue: 'Matte Black',
        colourHex: '#000000',
        sortOrder: 2,
      },
    ],
    media: [],
  },
  {
    id: 'var-002',
    productId: 'prod-002',
    combinationKey: 'attr-size:val-a4|attr-colour:val-brown',
    title: 'A4 / Brown',
    sku: 'JPG-FRM-A4-BRN',
    barcode: '890123456802',
    status: 'ACTIVE',
    isDefault: false,
    mrp: '1499.00',
    sellingPrice: '999.00',
    costPrice: '350.00',
    effectiveMrp: '1499.00',
    effectiveSellingPrice: '999.00',
    priceSource: 'OVERRIDE',
    taxRateId: 'tax-gst-18',
    taxRateName: 'GST 18%',
    taxRateValue: 18,
    priceIncludesTax: true,
    manageStock: true,
    stockQuantity: 18,
    reservedStock: 0,
    availableStock: 18,
    stockStatus: 'IN_STOCK',
    lowStockThreshold: 5,
    allowBackorder: false,
    weightGrams: '650.00',
    lengthCm: '30.00',
    widthCm: '21.00',
    heightCm: '3.00',
    preparationTimeMinutes: 45,
    packingTimeMinutes: 15,
    sameDayEligible: true,
    nextDayEligible: true,
    expressEligible: true,
    maximumSameDayDistanceKm: '15.00',
    externalLabRequired: false,
    requiresManualDeliveryReview: false,
    mainImageFileId: null,
    mainImageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80',
    sortOrder: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    values: [
      {
        id: 'vv-3',
        variationId: 'var-002',
        attributeId: 'attr-size',
        attributeName: 'Size',
        attributeValueId: 'val-a4',
        valueName: 'A4',
        displayValue: 'A4 (8.3 x 11.7 in)',
        colourHex: null,
        sortOrder: 1,
      },
      {
        id: 'vv-4',
        variationId: 'var-002',
        attributeId: 'attr-colour',
        attributeName: 'Colour',
        attributeValueId: 'val-brown',
        valueName: 'Brown',
        displayValue: 'Rich Walnut',
        colourHex: '#5C4033',
        sortOrder: 2,
      },
    ],
    media: [],
  },
];

export const productVariationApi = {
  async listVariations(productId: string, query: ProductVariationFilterQuery = {}) {
    if (config.useMockApi) {
      let filtered = mockVariations.filter((v) => v.productId === productId);
      if (!query.includeDeleted) filtered = filtered.filter((v) => v.deletedAt === null);
      if (query.status) filtered = filtered.filter((v) => v.status === query.status);
      if (query.defaultOnly) filtered = filtered.filter((v) => v.isDefault);
      if (query.search) {
        const q = query.search.toLowerCase();
        filtered = filtered.filter(
          (v) =>
            v.title.toLowerCase().includes(q) ||
            (v.sku && v.sku.toLowerCase().includes(q)) ||
            (v.barcode && v.barcode.toLowerCase().includes(q))
        );
      }
      return {
        data: filtered,
        meta: {
          total: filtered.length,
          page: query.page || 1,
          limit: query.limit || 50,
          totalPages: 1,
        },
      };
    }

    const params = new URLSearchParams();
    if (query.page) params.append('page', String(query.page));
    if (query.limit) params.append('limit', String(query.limit));
    if (query.search) params.append('search', query.search);
    if (query.status) params.append('status', query.status);
    if (query.stockStatus) params.append('stockStatus', query.stockStatus);
    if (query.defaultOnly) params.append('defaultOnly', 'true');
    if (query.includeDeleted) params.append('includeDeleted', 'true');
    if (query.sortBy) params.append('sortBy', query.sortBy);
    if (query.sortOrder) params.append('sortOrder', query.sortOrder);

    const response = await fetch(`${API_BASE}/admin/products/${productId}/variations?${params.toString()}`, {
      credentials: 'include',
    });
    const json = await response.json();
    if (!response.ok) throw new Error(json.message || 'Failed to fetch variations');
    return json;
  },

  async getVariationDetail(productId: string, variationId: string): Promise<ProductVariationDetail> {
    if (config.useMockApi) {
      const v = mockVariations.find((v) => v.id === variationId && v.productId === productId);
      if (!v) throw new Error('Variation not found');
      return v;
    }

    const response = await fetch(`${API_BASE}/admin/products/${productId}/variations/${variationId}`, {
      credentials: 'include',
    });
    const json = await response.json();
    if (!response.ok) throw new Error(json.message || 'Failed to fetch variation details');
    return json.data;
  },

  async generatePreview(productId: string, input: GeneratePreviewInput): Promise<PreviewResult> {
    if (config.useMockApi) {
      return {
        productId,
        totalCombinations: 4,
        maxLimit: 100,
        combinations: [
          {
            combinationKey: 'attr-size:val-a4|attr-colour:val-black',
            label: 'A4 / Black',
            attributeValues: [
              { attributeId: 'attr-size', attributeName: 'Size', valueId: 'val-a4', valueName: 'A4' },
              { attributeId: 'attr-colour', attributeName: 'Colour', valueId: 'val-black', valueName: 'Black' },
            ],
            exists: true,
            eligible: false,
            warnings: ['Combination already exists'],
          },
          {
            combinationKey: 'attr-size:val-a4|attr-colour:val-brown',
            label: 'A4 / Brown',
            attributeValues: [
              { attributeId: 'attr-size', attributeName: 'Size', valueId: 'val-a4', valueName: 'A4' },
              { attributeId: 'attr-colour', attributeName: 'Colour', valueId: 'val-brown', valueName: 'Brown' },
            ],
            exists: true,
            eligible: false,
            warnings: ['Combination already exists'],
          },
          {
            combinationKey: 'attr-size:val-a3|attr-colour:val-black',
            label: 'A3 / Black',
            attributeValues: [
              { attributeId: 'attr-size', attributeName: 'Size', valueId: 'val-a3', valueName: 'A3' },
              { attributeId: 'attr-colour', attributeName: 'Colour', valueId: 'val-black', valueName: 'Black' },
            ],
            exists: false,
            eligible: true,
            warnings: [],
          },
          {
            combinationKey: 'attr-size:val-a3|attr-colour:val-brown',
            label: 'A3 / Brown',
            attributeValues: [
              { attributeId: 'attr-size', attributeName: 'Size', valueId: 'val-a3', valueName: 'A3' },
              { attributeId: 'attr-colour', attributeName: 'Colour', valueId: 'val-brown', valueName: 'Brown' },
            ],
            exists: false,
            eligible: true,
            warnings: [],
          },
        ],
      };
    }

    const response = await fetch(`${API_BASE}/admin/products/${productId}/variations/generate-preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(input),
    });
    const json = await response.json();
    if (!response.ok) throw new Error(json.message || 'Failed to generate preview');
    return json.data;
  },

  async generateVariations(productId: string, input: GenerateVariationsInput) {
    if (config.useMockApi) {
      const createdCount = input.combinations.length;
      return { createdCount, skippedCount: 0, rejectedCount: 0, created: [], skipped: [], rejected: [], errors: [] };
    }

    const response = await fetch(`${API_BASE}/admin/products/${productId}/variations/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(input),
    });
    const json = await response.json();
    if (!response.ok) throw new Error(json.message || 'Failed to generate variations');
    return json.data;
  },

  async createVariation(productId: string, input: CreateVariationInput): Promise<ProductVariationDetail> {
    if (config.useMockApi) {
      const id = `var-${Date.now()}`;
      const key = input.combinationKey || buildCombinationKey(input.attributeValues);
      const newVar: ProductVariationDetail = {
        id,
        productId,
        combinationKey: key,
        title: input.title || key,
        sku: input.sku || null,
        barcode: input.barcode || null,
        status: input.status || 'ACTIVE',
        isDefault: input.isDefault || false,
        mrp: input.mrp ? String(input.mrp) : null,
        sellingPrice: input.sellingPrice ? String(input.sellingPrice) : null,
        costPrice: input.costPrice ? String(input.costPrice) : null,
        effectiveMrp: input.mrp ? String(input.mrp) : null,
        effectiveSellingPrice: input.sellingPrice ? String(input.sellingPrice) : null,
        priceSource: 'OVERRIDE',
        taxRateId: input.taxRateId || null,
        taxRateName: null,
        taxRateValue: null,
        priceIncludesTax: true,
        manageStock: true,
        stockQuantity: input.stockQuantity ?? 10,
        reservedStock: 0,
        availableStock: input.stockQuantity ?? 10,
        stockStatus: 'IN_STOCK',
        lowStockThreshold: input.lowStockThreshold ?? 5,
        allowBackorder: false,
        weightGrams: null,
        lengthCm: null,
        widthCm: null,
        heightCm: null,
        preparationTimeMinutes: null,
        packingTimeMinutes: null,
        sameDayEligible: true,
        nextDayEligible: true,
        expressEligible: true,
        maximumSameDayDistanceKm: null,
        externalLabRequired: false,
        requiresManualDeliveryReview: false,
        mainImageFileId: null,
        mainImageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80',
        sortOrder: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
        values: input.attributeValues.map((av, idx) => ({
          id: `vv-${Date.now()}-${idx}`,
          variationId: id,
          attributeId: av.attributeId,
          attributeName: av.attributeId,
          attributeValueId: av.attributeValueId,
          valueName: av.attributeValueId,
          displayValue: av.attributeValueId,
          colourHex: null,
          sortOrder: idx + 1,
        })),
        media: [],
      };
      mockVariations.push(newVar);
      return newVar;
    }

    const response = await fetch(`${API_BASE}/admin/products/${productId}/variations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(input),
    });
    const json = await response.json();
    if (!response.ok) throw new Error(json.message || 'Failed to create variation');
    return json.data;
  },

  async updateVariation(productId: string, variationId: string, input: Partial<CreateVariationInput>): Promise<ProductVariationDetail> {
    if (config.useMockApi) {
      const idx = mockVariations.findIndex((v) => v.id === variationId);
      if (idx !== -1) {
        mockVariations[idx] = { ...mockVariations[idx], ...input as any, updatedAt: new Date().toISOString() };
        return mockVariations[idx];
      }
    }

    const response = await fetch(`${API_BASE}/admin/products/${productId}/variations/${variationId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(input),
    });
    const json = await response.json();
    if (!response.ok) throw new Error(json.message || 'Failed to update variation');
    return json.data;
  },

  async updateStatus(productId: string, variationId: string, status: string) {
    if (config.useMockApi) {
      const idx = mockVariations.findIndex((v) => v.id === variationId);
      if (idx !== -1) mockVariations[idx].status = status as any;
      return true;
    }

    const response = await fetch(`${API_BASE}/admin/products/${productId}/variations/${variationId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status }),
    });
    const json = await response.json();
    if (!response.ok) throw new Error(json.message || 'Failed to update status');
    return json;
  },

  async setDefault(productId: string, variationId: string) {
    if (config.useMockApi) {
      mockVariations.forEach((v) => {
        if (v.productId === productId) v.isDefault = v.id === variationId;
      });
      return true;
    }

    const response = await fetch(`${API_BASE}/admin/products/${productId}/variations/${variationId}/default`, {
      method: 'PATCH',
      credentials: 'include',
    });
    const json = await response.json();
    if (!response.ok) throw new Error(json.message || 'Failed to set default variation');
    return json;
  },

  async bulkUpdate(productId: string, input: BulkUpdateInput) {
    if (config.useMockApi) {
      return { success: true, count: input.variationIds.length };
    }

    const response = await fetch(`${API_BASE}/admin/products/${productId}/variations/bulk-update`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(input),
    });
    const json = await response.json();
    if (!response.ok) throw new Error(json.message || 'Failed to apply bulk update');
    return json;
  },

  async deleteVariation(productId: string, variationId: string) {
    if (config.useMockApi) {
      const idx = mockVariations.findIndex((v) => v.id === variationId);
      if (idx !== -1) mockVariations[idx].deletedAt = new Date().toISOString();
      return true;
    }

    const response = await fetch(`${API_BASE}/admin/products/${productId}/variations/${variationId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    const json = await response.json();
    if (!response.ok) throw new Error(json.message || 'Failed to delete variation');
    return json;
  },

  async restoreVariation(productId: string, variationId: string) {
    if (config.useMockApi) {
      const idx = mockVariations.findIndex((v) => v.id === variationId);
      if (idx !== -1) mockVariations[idx].deletedAt = null;
      return true;
    }

    const response = await fetch(`${API_BASE}/admin/products/${productId}/variations/${variationId}/restore`, {
      method: 'POST',
      credentials: 'include',
    });
    const json = await response.json();
    if (!response.ok) throw new Error(json.message || 'Failed to restore variation');
    return json;
  },

  async getPublicVariations(productId: string) {
    const response = await fetch(`${API_BASE}/products/${productId}/variations`);
    const json = await response.json();
    if (!response.ok) throw new Error(json.message || 'Failed to fetch public variations');
    return json.data;
  },
};
