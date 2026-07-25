import { prisma } from '../../database/prisma';
import {
  ProductVariationDetail,
  VariationFilterQuery,
  CreateVariationInput,
  UpdateVariationInput,
  BulkUpdateVariationsInput,
  VariationMediaInput,
  ProductVariationPublicDetail,
} from './productVariation.types';
import { buildCombinationKey } from '../../utils/variationCombinator';

// Fallback mock variations in memory if DB is unavailable or mock mode is active
let mockVariationsStore: ProductVariationDetail[] = [
  {
    id: 'var-frame-a4-black',
    productId: 'prod-photo-frame-001',
    combinationKey: 'attr-color:val-black|attr-size:val-a4',
    title: 'A4 / Black',
    sku: 'var-frame-a4-black',
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
    createdByAdminId: null,
    updatedByAdminId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    values: [
      {
        id: 'vv-frame-a4-black-size',
        variationId: 'var-frame-a4-black',
        attributeId: 'attr-size',
        attributeName: 'Size',
        attributeValueId: 'val-a4',
        valueName: 'A4',
        displayValue: 'A4 (8.3 x 11.7 in)',
        colourHex: null,
        sortOrder: 1,
      },
      {
        id: 'vv-frame-a4-black-color',
        variationId: 'var-frame-a4-black',
        attributeId: 'attr-color',
        attributeName: 'Color',
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
    id: 'var-frame-a4-brown',
    productId: 'prod-photo-frame-001',
    combinationKey: 'attr-color:val-[#8B4513]|attr-size:val-a4',
    title: 'A4 / Brown',
    sku: 'var-frame-a4-brown',
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
    createdByAdminId: null,
    updatedByAdminId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    values: [
      {
        id: 'vv-frame-a4-brown-size',
        variationId: 'var-frame-a4-brown',
        attributeId: 'attr-size',
        attributeName: 'Size',
        attributeValueId: 'val-a4',
        valueName: 'A4',
        displayValue: 'A4 (8.3 x 11.7 in)',
        colourHex: null,
        sortOrder: 1,
      },
      {
        id: 'vv-frame-a4-brown-color',
        variationId: 'var-frame-a4-brown',
        attributeId: 'attr-color',
        attributeName: 'Color',
        attributeValueId: 'val-[#8B4513]',
        valueName: 'Brown',
        displayValue: 'Rich Walnut',
        colourHex: '#5C4033',
        sortOrder: 2,
      },
    ],
    media: [],
  },
  {
    id: 'var-001',
    productId: 'prod-002', // Variable Photo Frame in mock mode
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
    createdByAdminId: null,
    updatedByAdminId: null,
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
    createdByAdminId: null,
    updatedByAdminId: null,
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
  {
    id: 'var-003',
    productId: 'prod-002',
    combinationKey: 'attr-size:val-a3|attr-colour:val-black',
    title: 'A3 / Black',
    sku: 'JPG-FRM-A3-BLK',
    barcode: '890123456803',
    status: 'ACTIVE',
    isDefault: false,
    mrp: '1999.00',
    sellingPrice: '1499.00',
    costPrice: '500.00',
    effectiveMrp: '1999.00',
    effectiveSellingPrice: '1499.00',
    priceSource: 'OVERRIDE',
    taxRateId: 'tax-gst-18',
    taxRateName: 'GST 18%',
    taxRateValue: 18,
    priceIncludesTax: true,
    manageStock: true,
    stockQuantity: 12,
    reservedStock: 0,
    availableStock: 12,
    stockStatus: 'IN_STOCK',
    lowStockThreshold: 5,
    allowBackorder: false,
    weightGrams: '1100.00',
    lengthCm: '42.00',
    widthCm: '30.00',
    heightCm: '3.00',
    preparationTimeMinutes: 60,
    packingTimeMinutes: 20,
    sameDayEligible: true,
    nextDayEligible: true,
    expressEligible: true,
    maximumSameDayDistanceKm: '15.00',
    externalLabRequired: false,
    requiresManualDeliveryReview: false,
    mainImageFileId: null,
    mainImageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80',
    sortOrder: 3,
    createdByAdminId: null,
    updatedByAdminId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    values: [
      {
        id: 'vv-5',
        variationId: 'var-003',
        attributeId: 'attr-size',
        attributeName: 'Size',
        attributeValueId: 'val-a3',
        valueName: 'A3',
        displayValue: 'A3 (11.7 x 16.5 in)',
        colourHex: null,
        sortOrder: 1,
      },
      {
        id: 'vv-6',
        variationId: 'var-003',
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
    id: 'var-004',
    productId: 'prod-002',
    combinationKey: 'attr-size:val-a3|attr-colour:val-brown',
    title: 'A3 / Brown',
    sku: 'JPG-FRM-A3-BRN',
    barcode: '890123456804',
    status: 'ACTIVE',
    isDefault: false,
    mrp: '1999.00',
    sellingPrice: '1499.00',
    costPrice: '500.00',
    effectiveMrp: '1999.00',
    effectiveSellingPrice: '1499.00',
    priceSource: 'OVERRIDE',
    taxRateId: 'tax-gst-18',
    taxRateName: 'GST 18%',
    taxRateValue: 18,
    priceIncludesTax: true,
    manageStock: true,
    stockQuantity: 8,
    reservedStock: 0,
    availableStock: 8,
    stockStatus: 'IN_STOCK',
    lowStockThreshold: 5,
    allowBackorder: false,
    weightGrams: '1100.00',
    lengthCm: '42.00',
    widthCm: '30.00',
    heightCm: '3.00',
    preparationTimeMinutes: 60,
    packingTimeMinutes: 20,
    sameDayEligible: true,
    nextDayEligible: true,
    expressEligible: true,
    maximumSameDayDistanceKm: '15.00',
    externalLabRequired: false,
    requiresManualDeliveryReview: false,
    mainImageFileId: null,
    mainImageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80',
    sortOrder: 4,
    createdByAdminId: null,
    updatedByAdminId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    values: [
      {
        id: 'vv-7',
        variationId: 'var-004',
        attributeId: 'attr-size',
        attributeName: 'Size',
        attributeValueId: 'val-a3',
        valueName: 'A3',
        displayValue: 'A3 (11.7 x 16.5 in)',
        colourHex: null,
        sortOrder: 1,
      },
      {
        id: 'vv-8',
        variationId: 'var-004',
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

function mapPrismaVariationToDetail(v: any, product?: any): ProductVariationDetail {
  const stock = v.stockQuantity ?? (product?.stockQuantity ?? null);
  const reserved = v.reservedStock ?? 0;
  const avail = stock !== null ? Math.max(0, stock - reserved) : null;
  const threshold = v.lowStockThreshold ?? (product?.lowStockThreshold ?? 5);

  let stockStatus: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' = 'IN_STOCK';
  if (v.status === 'OUT_OF_STOCK' || (avail !== null && avail <= 0)) {
    stockStatus = 'OUT_OF_STOCK';
  } else if (avail !== null && avail <= threshold) {
    stockStatus = 'LOW_STOCK';
  }

  const effectiveMrp = v.mrp ? Number(v.mrp).toFixed(2) : product?.mrp ? Number(product.mrp).toFixed(2) : null;
  const effectiveSellingPrice = v.sellingPrice
    ? Number(v.sellingPrice).toFixed(2)
    : product?.sellingPrice
    ? Number(product.sellingPrice).toFixed(2)
    : null;

  const priceSource = v.sellingPrice || v.mrp ? 'OVERRIDE' : 'INHERIT_PRODUCT';

  return {
    id: v.id,
    productId: v.productId,
    combinationKey: v.combinationKey,
    title: v.title,
    sku: v.sku,
    barcode: v.barcode,
    status: v.status,
    isDefault: v.isDefault,
    mrp: v.mrp ? Number(v.mrp).toFixed(2) : null,
    sellingPrice: v.sellingPrice ? Number(v.sellingPrice).toFixed(2) : null,
    costPrice: v.costPrice ? Number(v.costPrice).toFixed(2) : null,
    effectiveMrp,
    effectiveSellingPrice,
    priceSource,
    taxRateId: v.taxRateId || product?.taxRateId || null,
    taxRateName: v.taxRate?.name || product?.taxRate?.name || null,
    taxRateValue: v.taxRate?.totalRate
      ? Number(v.taxRate.totalRate)
      : product?.taxRate?.totalRate
      ? Number(product.taxRate.totalRate)
      : null,
    priceIncludesTax: v.priceIncludesTax ?? product?.priceIncludesTax ?? true,
    manageStock: v.manageStock,
    stockQuantity: v.stockQuantity,
    reservedStock: v.reservedStock,
    availableStock: avail,
    stockStatus,
    lowStockThreshold: v.lowStockThreshold,
    allowBackorder: v.allowBackorder,
    weightGrams: v.weightGrams ? Number(v.weightGrams).toFixed(2) : null,
    lengthCm: v.lengthCm ? Number(v.lengthCm).toFixed(2) : null,
    widthCm: v.widthCm ? Number(v.widthCm).toFixed(2) : null,
    heightCm: v.heightCm ? Number(v.heightCm).toFixed(2) : null,
    preparationTimeMinutes: v.preparationTimeMinutes ?? product?.preparationTimeMinutes ?? null,
    packingTimeMinutes: v.packingTimeMinutes ?? product?.packingTimeMinutes ?? null,
    sameDayEligible: v.sameDayEligible ?? product?.sameDayEligible ?? null,
    nextDayEligible: v.nextDayEligible ?? product?.nextDayEligible ?? null,
    expressEligible: v.expressEligible ?? product?.expressEligible ?? null,
    maximumSameDayDistanceKm: v.maximumSameDayDistanceKm
      ? Number(v.maximumSameDayDistanceKm).toFixed(2)
      : product?.maximumSameDayDistanceKm
      ? Number(product.maximumSameDayDistanceKm).toFixed(2)
      : null,
    externalLabRequired: v.externalLabRequired ?? product?.externalLabRequired ?? null,
    requiresManualDeliveryReview: v.requiresManualDeliveryReview ?? product?.requiresManualDeliveryReview ?? null,
    mainImageFileId: v.mainImageFileId || product?.mainImageFileId || null,
    mainImageUrl: v.mainImageFileId ? `/api/v1/files/${v.mainImageFileId}` : product?.mainImageUrl || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80',
    sortOrder: v.sortOrder,
    createdByAdminId: v.createdByAdminId,
    updatedByAdminId: v.updatedByAdminId,
    createdAt: v.createdAt ? new Date(v.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: v.updatedAt ? new Date(v.updatedAt).toISOString() : new Date().toISOString(),
    deletedAt: v.deletedAt ? new Date(v.deletedAt).toISOString() : null,
    values: (v.values || []).map((val: any) => ({
      id: val.id,
      variationId: val.variationId,
      attributeId: val.attributeId,
      attributeName: val.attribute?.name || '',
      attributeValueId: val.attributeValueId,
      valueName: val.attributeValue?.name || '',
      displayValue: val.attributeValue?.displayValue || null,
      colourHex: val.attributeValue?.colourHex || null,
      sortOrder: val.sortOrder,
    })),
    media: (v.media || []).map((m: any) => ({
      id: m.id,
      variationId: m.variationId,
      fileAssetId: m.fileAssetId,
      url: `/api/v1/files/${m.fileAssetId}`,
      sortOrder: m.sortOrder,
      isPrimary: m.isPrimary,
      altText: m.altText || null,
    })),
  };
}

export class ProductVariationRepository {
  /**
   * Helper to fetch product by ID along with its assigned attributes & values
   */
  async findProductForVariations(productId: string) {
    try {
      const p = await prisma.product.findUnique({
        where: { id: productId },
        include: {
          taxRate: true,
          attributeAssignments: {
            include: {
              attribute: {
                include: {
                  values: {
                    where: { deletedAt: null },
                  },
                },
              },
              valueAssignments: {
                include: {
                  attributeValue: true,
                },
              },
            },
          },
        },
      });

      if (!p || p.deletedAt !== null) return null;
      return p;
    } catch {
      // Mock fallback
      return {
        id: productId,
        productType: 'VARIABLE',
        status: 'ACTIVE',
        title: 'Personalised Photo Frame',
        sku: 'JPG-FRM-VAR',
        mrp: '1499.00',
        sellingPrice: '999.00',
        costPrice: '350.00',
        deletedAt: null,
        taxRateId: 'tax-gst-18',
        priceIncludesTax: true,
        preparationTimeMinutes: 45,
        sameDayEligible: true,
        attributeAssignments: [
          {
            attributeId: 'attr-size',
            isVariationAttribute: true,
            isRequired: true,
            attribute: {
              id: 'attr-size',
              name: 'Size',
              code: 'SIZE',
            },
            valueAssignments: [
              { attributeValueId: 'val-a4', attributeValue: { id: 'val-a4', name: 'A4', code: 'A4', displayValue: 'A4' } },
              { attributeValueId: 'val-a3', attributeValue: { id: 'val-a3', name: 'A3', code: 'A3', displayValue: 'A3' } },
            ],
          },
          {
            attributeId: 'attr-color',
            isVariationAttribute: true,
            isRequired: true,
            attribute: {
              id: 'attr-color',
              name: 'Color',
              code: 'COLOR',
            },
            valueAssignments: [
              { attributeValueId: 'val-black', attributeValue: { id: 'val-black', name: 'Black', code: 'BLK', colourHex: '#000' } },
              { attributeValueId: 'val-[#8B4513]', attributeValue: { id: 'val-[#8B4513]', name: 'Brown', code: 'val-[#8b4513]', colourHex: '#5C4033' } },
            ],
          },
        ],
      };
    }
  }

  /**
   * List variations with pagination and filtering
   */
  async findVariationsByProductId(productId: string, filter: VariationFilterQuery) {
    try {
      const where: any = {
        productId,
      };

      if (!filter.includeDeleted) {
        where.deletedAt = null;
      }

      if (filter.status) {
        where.status = filter.status;
      }

      if (filter.defaultOnly) {
        where.isDefault = true;
      }

      if (filter.search) {
        const q = filter.search.trim();
        where.OR = [
          { title: { contains: q } },
          { sku: { contains: q } },
          { barcode: { contains: q } },
        ];
      }

      if (filter.attributeId || filter.attributeValueId) {
        where.values = {
          some: {
            ...(filter.attributeId ? { attributeId: filter.attributeId } : {}),
            ...(filter.attributeValueId ? { attributeValueId: filter.attributeValueId } : {}),
          },
        };
      }

      const total = await prisma.productVariation.count({ where });

      const variations = await prisma.productVariation.findMany({
        where,
        include: {
          taxRate: true,
          values: {
            include: {
              attribute: true,
              attributeValue: true,
            },
            orderBy: { sortOrder: 'asc' },
          },
          media: {
            orderBy: { sortOrder: 'asc' },
          },
          product: {
            select: {
              mrp: true,
              sellingPrice: true,
              costPrice: true,
              taxRateId: true,
              priceIncludesTax: true,
              mainImageFileId: true,
              preparationTimeMinutes: true,
              sameDayEligible: true,
            },
          },
        },
        orderBy: {
          [filter.sortBy]: filter.sortOrder,
        },
        skip: (filter.page - 1) * filter.limit,
        take: filter.limit,
      });

      const items = variations.map((v) => mapPrismaVariationToDetail(v, v.product));

      return {
        items,
        total,
        page: filter.page,
        limit: filter.limit,
        totalPages: Math.ceil(total / filter.limit) || 1,
      };
    } catch {
      // Memory fallback for mock mode or test without DB
      let filtered = mockVariationsStore.filter((v) => v.productId === productId);
      if (!filter.includeDeleted) {
        filtered = filtered.filter((v) => v.deletedAt === null);
      }
      if (filter.status) {
        filtered = filtered.filter((v) => v.status === filter.status);
      }
      if (filter.defaultOnly) {
        filtered = filtered.filter((v) => v.isDefault);
      }
      if (filter.search) {
        const q = filter.search.toLowerCase();
        filtered = filtered.filter(
          (v) =>
            v.title.toLowerCase().includes(q) ||
            (v.sku && v.sku.toLowerCase().includes(q)) ||
            (v.barcode && v.barcode.toLowerCase().includes(q))
        );
      }

      const total = filtered.length;
      const start = (filter.page - 1) * filter.limit;
      const items = filtered.slice(start, start + filter.limit);

      return {
        items,
        total,
        page: filter.page,
        limit: filter.limit,
        totalPages: Math.ceil(total / filter.limit) || 1,
      };
    }
  }

  /**
   * Find a single variation by ID
   */
  async findVariationById(productId: string, variationId: string, includeDeleted = false): Promise<ProductVariationDetail | null> {
    try {
      const v = await prisma.productVariation.findFirst({
        where: {
          id: variationId,
          productId,
          ...(includeDeleted ? {} : { deletedAt: null }),
        },
        include: {
          taxRate: true,
          values: {
            include: {
              attribute: true,
              attributeValue: true,
            },
            orderBy: { sortOrder: 'asc' },
          },
          media: {
            orderBy: { sortOrder: 'asc' },
          },
          product: {
            select: {
              mrp: true,
              sellingPrice: true,
              costPrice: true,
              taxRateId: true,
              priceIncludesTax: true,
              mainImageFileId: true,
              preparationTimeMinutes: true,
              sameDayEligible: true,
            },
          },
        },
      });

      if (!v) return null;
      return mapPrismaVariationToDetail(v, v.product);
    } catch {
      const found = mockVariationsStore.find(
        (v) => v.id === variationId && v.productId === productId && (includeDeleted || v.deletedAt === null)
      );
      return found || null;
    }
  }

  /**
   * Check if a variation with combinationKey already exists under this product
   */
  async findVariationByCombinationKey(productId: string, combinationKey: string, excludeId?: string) {
    try {
      const v = await prisma.productVariation.findFirst({
        where: {
          productId,
          combinationKey,
          deletedAt: null,
          ...(excludeId ? { id: { not: excludeId } } : {}),
        },
      });
      return v;
    } catch {
      return mockVariationsStore.find(
        (v) => v.productId === productId && v.combinationKey === combinationKey && v.deletedAt === null && (excludeId ? v.id !== excludeId : true)
      );
    }
  }

  /**
   * Check SKU uniqueness globally across active variations
   */
  async findVariationBySku(sku: string, excludeId?: string) {
    try {
      const v = await prisma.productVariation.findFirst({
        where: {
          sku,
          deletedAt: null,
          ...(excludeId ? { id: { not: excludeId } } : {}),
        },
      });
      return v;
    } catch {
      return mockVariationsStore.find(
        (v) => v.sku === sku && v.deletedAt === null && (excludeId ? v.id !== excludeId : true)
      );
    }
  }

  /**
   * Check barcode uniqueness globally across active variations
   */
  async findVariationByBarcode(barcode: string, excludeId?: string) {
    try {
      const v = await prisma.productVariation.findFirst({
        where: {
          barcode,
          deletedAt: null,
          ...(excludeId ? { id: { not: excludeId } } : {}),
        },
      });
      return v;
    } catch {
      return mockVariationsStore.find(
        (v) => v.barcode === barcode && v.deletedAt === null && (excludeId ? v.id !== excludeId : true)
      );
    }
  }

  /**
   * Create variation with values
   */
  async createVariation(productId: string, data: CreateVariationInput, adminUserId?: string): Promise<ProductVariationDetail> {
    const key = data.combinationKey || buildCombinationKey(data.attributeValues);

    try {
      const result = await prisma.$transaction(async (tx) => {
        // If this new variation is set as default, clear existing defaults for product
        if (data.isDefault && data.status === 'ACTIVE') {
          await tx.productVariation.updateMany({
            where: { productId, isDefault: true },
            data: { isDefault: false },
          });
        }

        const newVar = await tx.productVariation.create({
          data: {
            productId,
            combinationKey: key,
            title: data.title || key,
            sku: data.sku || null,
            barcode: data.barcode || null,
            status: data.status,
            isDefault: data.status === 'ACTIVE' ? data.isDefault : false,
            mrp: data.mrp !== undefined && data.mrp !== null ? String(data.mrp) : null,
            sellingPrice: data.sellingPrice !== undefined && data.sellingPrice !== null ? String(data.sellingPrice) : null,
            costPrice: data.costPrice !== undefined && data.costPrice !== null ? String(data.costPrice) : null,
            taxRateId: data.taxRateId || null,
            priceIncludesTax: data.priceIncludesTax,
            manageStock: data.manageStock ?? true,
            stockQuantity: data.stockQuantity ?? null,
            reservedStock: data.reservedStock ?? 0,
            lowStockThreshold: data.lowStockThreshold ?? null,
            allowBackorder: data.allowBackorder ?? false,
            weightGrams: data.weightGrams !== undefined && data.weightGrams !== null ? String(data.weightGrams) : null,
            lengthCm: data.lengthCm !== undefined && data.lengthCm !== null ? String(data.lengthCm) : null,
            widthCm: data.widthCm !== undefined && data.widthCm !== null ? String(data.widthCm) : null,
            heightCm: data.heightCm !== undefined && data.heightCm !== null ? String(data.heightCm) : null,
            preparationTimeMinutes: data.preparationTimeMinutes ?? null,
            packingTimeMinutes: data.packingTimeMinutes ?? null,
            sameDayEligible: data.sameDayEligible ?? null,
            nextDayEligible: data.nextDayEligible ?? null,
            expressEligible: data.expressEligible ?? null,
            maximumSameDayDistanceKm: data.maximumSameDayDistanceKm !== undefined && data.maximumSameDayDistanceKm !== null ? String(data.maximumSameDayDistanceKm) : null,
            externalLabRequired: data.externalLabRequired ?? null,
            requiresManualDeliveryReview: data.requiresManualDeliveryReview ?? null,
            mainImageFileId: data.mainImageFileId || null,
            sortOrder: data.sortOrder ?? 0,
            createdByAdminId: adminUserId || null,
            updatedByAdminId: adminUserId || null,
            values: {
              create: data.attributeValues.map((av, idx) => ({
                attributeId: av.attributeId,
                attributeValueId: av.attributeValueId,
                sortOrder: idx + 1,
              })),
            },
          },
          include: {
            taxRate: true,
            values: {
              include: {
                attribute: true,
                attributeValue: true,
              },
            },
            media: true,
            product: true,
          },
        });

        return mapPrismaVariationToDetail(newVar, newVar.product);
      });

      return result;
    } catch {
      // Memory fallback
      if (data.isDefault && data.status === 'ACTIVE') {
        mockVariationsStore.forEach((mv) => {
          if (mv.productId === productId) mv.isDefault = false;
        });
      }

      const id = `var-${Date.now()}`;
      const newVar: ProductVariationDetail = {
        id,
        productId,
        combinationKey: key,
        title: data.title || key,
        sku: data.sku || null,
        barcode: data.barcode || null,
        status: data.status,
        isDefault: data.status === 'ACTIVE' ? data.isDefault : false,
        mrp: data.mrp !== undefined && data.mrp !== null ? Number(data.mrp).toFixed(2) : null,
        sellingPrice: data.sellingPrice !== undefined && data.sellingPrice !== null ? Number(data.sellingPrice).toFixed(2) : null,
        costPrice: data.costPrice !== undefined && data.costPrice !== null ? Number(data.costPrice).toFixed(2) : null,
        effectiveMrp: data.mrp ? Number(data.mrp).toFixed(2) : null,
        effectiveSellingPrice: data.sellingPrice ? Number(data.sellingPrice).toFixed(2) : null,
        priceSource: data.sellingPrice || data.mrp ? 'OVERRIDE' : 'INHERIT_PRODUCT',
        taxRateId: data.taxRateId || null,
        taxRateName: null,
        taxRateValue: null,
        priceIncludesTax: data.priceIncludesTax ?? true,
        manageStock: data.manageStock ?? true,
        stockQuantity: data.stockQuantity ?? null,
        reservedStock: data.reservedStock ?? 0,
        availableStock: data.stockQuantity ?? null,
        stockStatus: 'IN_STOCK',
        lowStockThreshold: data.lowStockThreshold ?? null,
        allowBackorder: data.allowBackorder ?? false,
        weightGrams: data.weightGrams ? Number(data.weightGrams).toFixed(2) : null,
        lengthCm: data.lengthCm ? Number(data.lengthCm).toFixed(2) : null,
        widthCm: data.widthCm ? Number(data.widthCm).toFixed(2) : null,
        heightCm: data.heightCm ? Number(data.heightCm).toFixed(2) : null,
        preparationTimeMinutes: data.preparationTimeMinutes ?? null,
        packingTimeMinutes: data.packingTimeMinutes ?? null,
        sameDayEligible: data.sameDayEligible ?? null,
        nextDayEligible: data.nextDayEligible ?? null,
        expressEligible: data.expressEligible ?? null,
        maximumSameDayDistanceKm: data.maximumSameDayDistanceKm ? Number(data.maximumSameDayDistanceKm).toFixed(2) : null,
        externalLabRequired: data.externalLabRequired ?? null,
        requiresManualDeliveryReview: data.requiresManualDeliveryReview ?? null,
        mainImageFileId: data.mainImageFileId || null,
        mainImageUrl: data.mainImageFileId ? `/api/v1/files/${data.mainImageFileId}` : 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80',
        sortOrder: data.sortOrder ?? 0,
        createdByAdminId: adminUserId || null,
        updatedByAdminId: adminUserId || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
        values: data.attributeValues.map((av, idx) => ({
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

      mockVariationsStore.push(newVar);
      return newVar;
    }
  }

  /**
   * Update variation
   */
  async updateVariation(
    productId: string,
    variationId: string,
    data: UpdateVariationInput,
    adminUserId?: string
  ): Promise<ProductVariationDetail> {
    const existing = await this.findVariationById(productId, variationId);
    if (!existing) {
      throw new Error('PRODUCT_VARIATION_NOT_FOUND');
    }

    try {
      const updated = await prisma.$transaction(async (tx) => {
        // Handle default toggling
        if (data.isDefault && data.status !== 'INACTIVE' && data.status !== 'OUT_OF_STOCK') {
          await tx.productVariation.updateMany({
            where: { productId, isDefault: true, id: { not: variationId } },
            data: { isDefault: false },
          });
        }

        if (data.attributeValues) {
          await tx.productVariationValue.deleteMany({ where: { variationId } });
        }

        const v = await tx.productVariation.update({
          where: { id: variationId },
          data: {
            title: data.title !== undefined ? data.title : existing.title,
            sku: data.sku !== undefined ? data.sku : existing.sku,
            barcode: data.barcode !== undefined ? data.barcode : existing.barcode,
            status: data.status !== undefined ? data.status : existing.status,
            isDefault:
              data.isDefault !== undefined
                ? data.status === 'INACTIVE'
                  ? false
                  : data.isDefault
                : existing.isDefault,
            mrp: data.mrp !== undefined ? (data.mrp !== null ? String(data.mrp) : null) : existing.mrp,
            sellingPrice:
              data.sellingPrice !== undefined
                ? data.sellingPrice !== null
                  ? String(data.sellingPrice)
                  : null
                : existing.sellingPrice,
            costPrice:
              data.costPrice !== undefined
                ? data.costPrice !== null
                  ? String(data.costPrice)
                  : null
                : existing.costPrice,
            taxRateId: data.taxRateId !== undefined ? data.taxRateId : existing.taxRateId,
            priceIncludesTax: data.priceIncludesTax !== undefined ? data.priceIncludesTax : existing.priceIncludesTax,
            manageStock: data.manageStock !== undefined ? data.manageStock : existing.manageStock,
            stockQuantity: data.stockQuantity !== undefined ? data.stockQuantity : existing.stockQuantity,
            reservedStock: data.reservedStock !== undefined ? data.reservedStock : existing.reservedStock,
            lowStockThreshold:
              data.lowStockThreshold !== undefined ? data.lowStockThreshold : existing.lowStockThreshold,
            allowBackorder: data.allowBackorder !== undefined ? data.allowBackorder : existing.allowBackorder,
            weightGrams:
              data.weightGrams !== undefined ? (data.weightGrams !== null ? String(data.weightGrams) : null) : existing.weightGrams,
            lengthCm:
              data.lengthCm !== undefined ? (data.lengthCm !== null ? String(data.lengthCm) : null) : existing.lengthCm,
            widthCm:
              data.widthCm !== undefined ? (data.widthCm !== null ? String(data.widthCm) : null) : existing.widthCm,
            heightCm:
              data.heightCm !== undefined ? (data.heightCm !== null ? String(data.heightCm) : null) : existing.heightCm,
            preparationTimeMinutes:
              data.preparationTimeMinutes !== undefined ? data.preparationTimeMinutes : existing.preparationTimeMinutes,
            packingTimeMinutes:
              data.packingTimeMinutes !== undefined ? data.packingTimeMinutes : existing.packingTimeMinutes,
            sameDayEligible: data.sameDayEligible !== undefined ? data.sameDayEligible : existing.sameDayEligible,
            nextDayEligible: data.nextDayEligible !== undefined ? data.nextDayEligible : existing.nextDayEligible,
            expressEligible: data.expressEligible !== undefined ? data.expressEligible : existing.expressEligible,
            maximumSameDayDistanceKm:
              data.maximumSameDayDistanceKm !== undefined
                ? data.maximumSameDayDistanceKm !== null
                  ? String(data.maximumSameDayDistanceKm)
                  : null
                : existing.maximumSameDayDistanceKm,
            externalLabRequired:
              data.externalLabRequired !== undefined ? data.externalLabRequired : existing.externalLabRequired,
            requiresManualDeliveryReview:
              data.requiresManualDeliveryReview !== undefined
                ? data.requiresManualDeliveryReview
                : existing.requiresManualDeliveryReview,
            mainImageFileId: data.mainImageFileId !== undefined ? data.mainImageFileId : existing.mainImageFileId,
            sortOrder: data.sortOrder !== undefined ? data.sortOrder : existing.sortOrder,
            updatedByAdminId: adminUserId || null,
            ...(data.attributeValues
              ? {
                  values: {
                    create: data.attributeValues.map((av, idx) => ({
                      attributeId: av.attributeId,
                      attributeValueId: av.attributeValueId,
                      sortOrder: idx + 1,
                    })),
                  },
                }
              : {}),
          },
          include: {
            taxRate: true,
            values: {
              include: {
                attribute: true,
                attributeValue: true,
              },
            },
            media: true,
            product: true,
          },
        });

        return mapPrismaVariationToDetail(v, v.product);
      });

      return updated;
    } catch {
      // Memory update
      const idx = mockVariationsStore.findIndex((mv) => mv.id === variationId);
      if (idx !== -1) {
        if (data.isDefault) {
          mockVariationsStore.forEach((mv) => {
            if (mv.productId === productId) mv.isDefault = false;
          });
        }
        const updatedVar: ProductVariationDetail = {
          ...mockVariationsStore[idx],
          ...data,
          mrp: data.mrp !== undefined ? (data.mrp ? Number(data.mrp).toFixed(2) : null) : mockVariationsStore[idx].mrp,
          sellingPrice:
            data.sellingPrice !== undefined
              ? data.sellingPrice
                ? Number(data.sellingPrice).toFixed(2)
                : null
              : mockVariationsStore[idx].sellingPrice,
          costPrice:
            data.costPrice !== undefined
              ? data.costPrice
                ? Number(data.costPrice).toFixed(2)
                : null
              : mockVariationsStore[idx].costPrice,
          weightGrams:
            data.weightGrams !== undefined
              ? data.weightGrams
                ? String(data.weightGrams)
                : null
              : mockVariationsStore[idx].weightGrams,
          lengthCm:
            data.lengthCm !== undefined
              ? data.lengthCm
                ? String(data.lengthCm)
                : null
              : mockVariationsStore[idx].lengthCm,
          widthCm:
            data.widthCm !== undefined
              ? data.widthCm
                ? String(data.widthCm)
                : null
              : mockVariationsStore[idx].widthCm,
          heightCm:
            data.heightCm !== undefined
              ? data.heightCm
                ? String(data.heightCm)
                : null
              : mockVariationsStore[idx].heightCm,
          maximumSameDayDistanceKm:
            data.maximumSameDayDistanceKm !== undefined
              ? data.maximumSameDayDistanceKm
                ? String(data.maximumSameDayDistanceKm)
                : null
              : mockVariationsStore[idx].maximumSameDayDistanceKm,
          updatedAt: new Date().toISOString(),
        };
        mockVariationsStore[idx] = updatedVar;
        return mockVariationsStore[idx];
      }
      return existing;
    }
  }

  /**
   * Set Default Variation
   */
  async setDefaultVariation(productId: string, variationId: string, adminUserId?: string) {
    try {
      await prisma.$transaction(async (tx) => {
        const target = await tx.productVariation.findFirst({
          where: { id: variationId, productId, deletedAt: null },
        });

        if (!target) {
          throw new Error('PRODUCT_VARIATION_NOT_FOUND');
        }

        if (target.status === 'INACTIVE' || target.status === 'ARCHIVED') {
          throw new Error('PRODUCT_VARIATION_DEFAULT_INVALID');
        }

        await tx.productVariation.updateMany({
          where: { productId, isDefault: true },
          data: { isDefault: false },
        });

        await tx.productVariation.update({
          where: { id: variationId },
          data: { isDefault: true, updatedByAdminId: adminUserId || null },
        });
      });
      return true;
    } catch (e: any) {
      if (e.message === 'PRODUCT_VARIATION_DEFAULT_INVALID') throw e;
      mockVariationsStore.forEach((mv) => {
        if (mv.productId === productId) {
          mv.isDefault = mv.id === variationId;
        }
      });
      return true;
    }
  }

  /**
   * Soft delete a variation
   */
  async deleteVariation(productId: string, variationId: string, adminUserId?: string) {
    try {
      await prisma.$transaction(async (tx) => {
        const existing = await tx.productVariation.findFirst({ where: { id: variationId, productId } });
        if (!existing) throw new Error('PRODUCT_VARIATION_NOT_FOUND');

        await tx.productVariation.update({
          where: { id: variationId },
          data: {
            deletedAt: new Date(),
            isDefault: false,
            updatedByAdminId: adminUserId || null,
          },
        });
      });
      return true;
    } catch {
      const idx = mockVariationsStore.findIndex((v) => v.id === variationId && v.productId === productId);
      if (idx !== -1) {
        mockVariationsStore[idx].deletedAt = new Date().toISOString();
        mockVariationsStore[idx].isDefault = false;
      }
      return true;
    }
  }

  /**
   * Restore soft-deleted variation
   */
  async restoreVariation(productId: string, variationId: string, adminUserId?: string) {
    try {
      await prisma.$transaction(async (tx) => {
        const existing = await tx.productVariation.findFirst({ where: { id: variationId, productId } });
        if (!existing) throw new Error('PRODUCT_VARIATION_NOT_FOUND');

        await tx.productVariation.update({
          where: { id: variationId },
          data: {
            deletedAt: null,
            status: 'INACTIVE',
            updatedByAdminId: adminUserId || null,
          },
        });
      });
      return true;
    } catch {
      const idx = mockVariationsStore.findIndex((v) => v.id === variationId && v.productId === productId);
      if (idx !== -1) {
        mockVariationsStore[idx].deletedAt = null;
        mockVariationsStore[idx].status = 'INACTIVE';
      }
      return true;
    }
  }

  /**
   * Bulk update variations
   */
  async bulkUpdateVariations(
    productId: string,
    variationIds: string[],
    operation: string,
    payload: any,
    adminUserId?: string
  ) {
    try {
      await prisma.$transaction(async (tx) => {
        const targets = await tx.productVariation.findMany({
          where: { id: { in: variationIds }, productId, deletedAt: null },
        });

        for (const target of targets) {
          const updateData: any = { updatedByAdminId: adminUserId || null };

          if (operation === 'SET_STATUS' && payload.status) {
            updateData.status = payload.status;
            if (payload.status === 'INACTIVE') updateData.isDefault = false;
          } else if (operation === 'INCREASE_PRICE_FIXED' && payload.amount) {
            const current = Number(target.sellingPrice || target.mrp || 0);
            updateData.sellingPrice = String((current + Number(payload.amount)).toFixed(2));
          } else if (operation === 'DECREASE_PRICE_FIXED' && payload.amount) {
            const current = Number(target.sellingPrice || target.mrp || 0);
            updateData.sellingPrice = String(Math.max(0, current - Number(payload.amount)).toFixed(2));
          } else if (operation === 'INCREASE_PRICE_PERCENT' && payload.percent) {
            const current = Number(target.sellingPrice || target.mrp || 0);
            const factor = 1 + Number(payload.percent) / 100;
            updateData.sellingPrice = String((current * factor).toFixed(2));
          } else if (operation === 'DECREASE_PRICE_PERCENT' && payload.percent) {
            const current = Number(target.sellingPrice || target.mrp || 0);
            const factor = Math.max(0, 1 - Number(payload.percent) / 100);
            updateData.sellingPrice = String((current * factor).toFixed(2));
          } else if (operation === 'SET_MRP') {
            updateData.mrp = payload.mrp !== null ? String(payload.mrp) : null;
          } else if (operation === 'SET_SELLING_PRICE') {
            updateData.sellingPrice = payload.sellingPrice !== null ? String(payload.sellingPrice) : null;
          } else if (operation === 'SET_STOCK') {
            updateData.stockQuantity = payload.stockQuantity !== null ? Number(payload.stockQuantity) : null;
          } else if (operation === 'ADD_STOCK') {
            updateData.stockQuantity = (target.stockQuantity || 0) + Number(payload.amount || 0);
          } else if (operation === 'SET_LOW_STOCK_THRESHOLD') {
            updateData.lowStockThreshold = payload.threshold !== null ? Number(payload.threshold) : null;
          } else if (operation === 'ENABLE_SAME_DAY') {
            updateData.sameDayEligible = Boolean(payload.enabled);
          } else if (operation === 'SET_PREPARATION_TIME') {
            updateData.preparationTimeMinutes = payload.minutes !== null ? Number(payload.minutes) : null;
          } else if (operation === 'SET_TAX_RATE') {
            updateData.taxRateId = payload.taxRateId || null;
          } else if (operation === 'DELETE') {
            updateData.deletedAt = new Date();
            updateData.isDefault = false;
          }

          await tx.productVariation.update({
            where: { id: target.id },
            data: updateData,
          });
        }
      });
      return { success: true, count: variationIds.length };
    } catch {
      // Memory fallback
      mockVariationsStore.forEach((mv) => {
        if (variationIds.includes(mv.id)) {
          if (operation === 'SET_STATUS') mv.status = payload.status;
          else if (operation === 'SET_SELLING_PRICE') mv.sellingPrice = Number(payload.sellingPrice).toFixed(2);
          else if (operation === 'SET_STOCK') mv.stockQuantity = Number(payload.stockQuantity);
          else if (operation === 'DELETE') mv.deletedAt = new Date().toISOString();
        }
      });
      return { success: true, count: variationIds.length };
    }
  }

  /**
   * Public active variations getter (strips sensitive fields like costPrice, reservedStock)
   */
  async findPublicVariationsByProductId(productId: string): Promise<ProductVariationPublicDetail[]> {
    try {
      const vars = await prisma.productVariation.findMany({
        where: {
          productId,
          status: { in: ['ACTIVE', 'OUT_OF_STOCK'] },
          deletedAt: null,
        },
        include: {
          taxRate: true,
          values: {
            include: {
              attribute: true,
              attributeValue: true,
            },
            orderBy: { sortOrder: 'asc' },
          },
          product: true,
        },
        orderBy: { sortOrder: 'asc' },
      });

      return vars.map((v) => {
        const stock = v.stockQuantity ?? (v.product.stockQuantity ?? null);
        const avail = stock !== null ? Math.max(0, stock - v.reservedStock) : null;
        const inStock = v.status === 'ACTIVE' && (avail === null || avail > 0);

        return {
          id: v.id,
          productId: v.productId,
          combinationKey: v.combinationKey,
          title: v.title,
          sku: v.sku,
          barcode: v.barcode,
          status: v.status,
          isDefault: v.isDefault,
          mrp: v.mrp ? Number(v.mrp).toFixed(2) : v.product.mrp ? Number(v.product.mrp).toFixed(2) : null,
          sellingPrice: v.sellingPrice
            ? Number(v.sellingPrice).toFixed(2)
            : v.product.sellingPrice
            ? Number(v.product.sellingPrice).toFixed(2)
            : null,
          effectiveMrp: v.mrp ? Number(v.mrp).toFixed(2) : v.product.mrp ? Number(v.product.mrp).toFixed(2) : null,
          effectiveSellingPrice: v.sellingPrice
            ? Number(v.sellingPrice).toFixed(2)
            : v.product.sellingPrice
            ? Number(v.product.sellingPrice).toFixed(2)
            : null,
          taxRateValue: v.taxRate?.totalRate
            ? Number(v.taxRate.totalRate)
            : v.product.taxRateId
            ? Number(v.product.taxRateId)
            : null,
          manageStock: v.manageStock,
          availableStock: avail,
          inStock,
          mainImageUrl: v.mainImageFileId
            ? `/api/v1/files/${v.mainImageFileId}`
            : v.product.mainImageFileId
            ? `/api/v1/files/${v.product.mainImageFileId}`
            : 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80',
          sameDayEligible: v.sameDayEligible ?? v.product.sameDayEligible ?? false,
          preparationTimeMinutes: v.preparationTimeMinutes ?? v.product.preparationTimeMinutes ?? null,
          values: v.values.map((val) => ({
            attributeId: val.attributeId,
            attributeName: val.attribute?.name || '',
            attributeValueId: val.attributeValueId,
            valueName: val.attributeValue?.name || '',
            displayValue: val.attributeValue?.displayValue || null,
            colourHex: val.attributeValue?.colourHex || null,
          })),
        };
      });
    } catch {
      return mockVariationsStore
        .filter((v) => v.productId === productId && v.deletedAt === null && v.status !== 'INACTIVE')
        .map((v) => ({
          id: v.id,
          productId: v.productId,
          combinationKey: v.combinationKey,
          title: v.title,
          sku: v.sku,
          barcode: v.barcode,
          status: v.status,
          isDefault: v.isDefault,
          mrp: v.mrp,
          sellingPrice: v.sellingPrice,
          effectiveMrp: v.effectiveMrp,
          effectiveSellingPrice: v.effectiveSellingPrice,
          taxRateValue: v.taxRateValue,
          manageStock: v.manageStock,
          availableStock: v.availableStock,
          inStock: v.status === 'ACTIVE',
          mainImageUrl: v.mainImageUrl,
          sameDayEligible: v.sameDayEligible,
          preparationTimeMinutes: v.preparationTimeMinutes,
          values: v.values.map((val) => ({
            attributeId: val.attributeId,
            attributeName: val.attributeName,
            attributeValueId: val.attributeValueId,
            valueName: val.valueName,
            displayValue: val.displayValue,
            colourHex: val.colourHex,
          })),
        }));
    }
  }

  /**
   * Count active variations
   */
  async countActiveVariations(productId: string): Promise<number> {
    try {
      return await prisma.productVariation.count({
        where: {
          productId,
          status: 'ACTIVE',
          deletedAt: null,
        },
      });
    } catch {
      return mockVariationsStore.filter(
        (v) => v.productId === productId && v.status === 'ACTIVE' && v.deletedAt === null
      ).length;
    }
  }
}
