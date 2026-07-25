import { prisma } from '../../database/prisma';
import crypto from 'crypto';
import {
  ProductFilterQuery,
  ProductOptionsQuery,
  CreateProductDTO,
  UpdateProductDTO,
  UpdateInventoryDTO,
  UpdateDeliverySettingsDTO,
  ProductDetailItem,
  ProductStatus,
  ProductVisibility,
  ProductBadge,
} from './products.types';

// In-Memory Mock Store for offline/fallback mode
const mockProducts: ProductDetailItem[] = [
  {
    id: 'prod-001',
    storeId: null,
    productType: 'PERSONALISED',
    status: 'ACTIVE',
    visibility: 'PUBLIC',
    condition: 'NEW',
    title: 'Personalised A4 Baby Birth Details Frame',
    internalName: 'Baby Birth Frame A4',
    slug: 'personalised-a4-baby-birth-details-frame',
    sku: 'JPG-FRM-BABY-A4',
    barcode: '890123456701',
    brandId: 'brand-001',
    brandName: 'Photo Frame Studio',
    primaryCategoryId: 'cat-personalised-frames',
    primaryCategoryName: 'Personalised Frames',
    primaryCategoryPath: 'Gifts > Personalised Frames',
    shortDescription: 'Custom A4 acrylic LED frame showcasing baby name, weight, birth time and hospital photo.',
    description: 'Immortalize your newborn baby’s precious birth details in an elegant A4 size LED photo frame. Crafted with high-clarity 3mm acrylic sheet and warm yellow wooden base backlight.',
    highlightsJson: JSON.stringify(['Custom Name & Photo UV Printed', 'High Grade Acrylic Sheet', 'Warm Ambient LED Base', 'Fast 90-Min Delivery in Jaipur']),
    careInstructions: 'Wipe clean with soft microfiber cloth. Keep away from water and direct moisture.',
    countryOfOrigin: 'India',
    manufacturer: 'Jaipur Gifting Crafts Ltd',
    packer: 'Jaipur Gifting Crafts Ltd',
    importer: null,
    hsnCode: '44140000',
    taxRateId: 'tax-gst-18',
    taxRateName: 'GST 18%',
    taxRateValue: '18.00',
    mrp: '1499.00',
    sellingPrice: '999.00',
    costPrice: '350.00',
    priceIncludesTax: true,
    minimumOrderQuantity: 1,
    maximumOrderQuantity: 10,
    manageStock: true,
    stockQuantity: 45,
    reservedStock: 2,
    availableStock: 43,
    stockStatus: 'IN_STOCK',
    lowStockThreshold: 5,
    allowBackorder: false,
    weightGrams: '650.00',
    lengthCm: '30.00',
    widthCm: '21.00',
    heightCm: '3.00',
    isFragile: true,
    requiresSpecialPackaging: true,
    sameDayEligible: true,
    nextDayEligible: true,
    expressEligible: true,
    storePickupEligible: true,
    maximumSameDayDistanceKm: '15.00',
    preparationTimeMinutes: 45,
    packingTimeMinutes: 15,
    externalLabRequired: false,
    requiresManualDeliveryReview: false,
    isPersonalised: true,
    isFeatured: true,
    isNewBadgeManual: false,
    isHotBadgeManual: true,
    isFlashSaleManual: false,
    isBestSellerOverride: true,
    sortOrder: 1,
    publishAt: '2026-01-01T00:00:00.000Z',
    unpublishAt: null,
    seoTitle: 'Personalised Baby Birth Photo Frame | Jaipur Instant Delivery',
    seoDescription: 'Buy custom A4 baby birth detail photo frame in Jaipur with photos and birth stats.',
    seoKeywordsJson: JSON.stringify(['baby birth frame', 'custom photo frame jaipur', 'baby gift personalised']),
    seoImageFileId: 'img-prod-001-main',
    mainImageFileId: 'img-prod-001-main',
    mainImageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80',
    isIndexable: true,
    isFollowable: true,
    createdByAdminId: 'super-admin-id',
    updatedByAdminId: 'super-admin-id',
    createdAt: '2026-01-01T10:00:00.000Z',
    updatedAt: '2026-01-15T12:30:00.000Z',
    deletedAt: null,
    categoryAssignments: [
      {
        id: 'pca-001-1',
        categoryId: 'cat-personalised-frames',
        categoryName: 'Personalised Frames',
        categoryPath: 'Gifts > Personalised Frames',
        isPrimary: true,
        sortOrder: 1,
      },
    ],
    attributeAssignments: [
      {
        id: 'paa-001-1',
        attributeId: 'attr-frame-size-01',
        attributeName: 'Frame Size',
        attributeCode: 'ATTR-SIZE-01',
        attributeType: 'BUTTON',
        isRequired: true,
        isVariationAttribute: true,
        isFilterable: true,
        sortOrder: 1,
        values: [
          {
            id: 'pava-001-1',
            valueId: 'val-a4',
            valueName: 'A4 Size (8.3 × 11.7 in)',
            displayValue: 'A4',
            colourHex: null,
            sortOrder: 1,
          },
        ],
      },
    ],
    media: [
      {
        id: 'pm-001-1',
        fileAssetId: 'img-prod-001-main',
        url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80',
        mediaType: 'IMAGE',
        sortOrder: 1,
        isPrimary: true,
        altText: 'A4 Baby Birth Details Frame',
      },
      {
        id: 'pm-001-2',
        fileAssetId: 'img-prod-001-gal1',
        url: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=800&q=80',
        mediaType: 'IMAGE',
        sortOrder: 2,
        isPrimary: false,
        altText: 'Baby Frame LED Base Detail',
      },
    ],
    badges: [
      {
        id: 'pba-001-1',
        badge: 'PERSONALISED',
        source: 'AUTOMATIC',
        active: true,
        startsAt: null,
        endsAt: null,
      },
      {
        id: 'pba-001-2',
        badge: 'HOT',
        source: 'MANUAL',
        active: true,
        startsAt: null,
        endsAt: null,
      },
      {
        id: 'pba-001-3',
        badge: 'SAME_DAY',
        source: 'AUTOMATIC',
        active: true,
        startsAt: null,
        endsAt: null,
      },
    ],
  },
  {
    id: 'prod-002',
    storeId: null,
    productType: 'PERSONALISED',
    status: 'ACTIVE',
    visibility: 'PUBLIC',
    condition: 'NEW',
    title: 'Custom Couple Anniversary Photo Mug',
    internalName: 'Anniversary Mug 350ml',
    slug: 'custom-couple-anniversary-photo-mug',
    sku: 'JPG-MUG-ANNIV-01',
    barcode: '890123456702',
    brandId: 'brand-002',
    brandName: 'Jaipur Gifts',
    primaryCategoryId: 'cat-custom-mugs',
    primaryCategoryName: 'Custom Mugs',
    primaryCategoryPath: 'Gifts > Custom Mugs',
    shortDescription: '350ml ceramic coffee mug printed with high gloss couple photo and anniversary date.',
    description: 'High quality ceramic mug with vibrant edge-to-edge sublimation printing. Microwave & dishwasher safe.',
    highlightsJson: JSON.stringify(['350ml Ceramic Capacity', 'Microwave Safe', 'High Gloss Finish', 'Custom Name & Date']),
    careInstructions: 'Dishwasher safe. Avoid harsh metallic scrubbing pads.',
    countryOfOrigin: 'India',
    manufacturer: 'Jaipur Ceramics Co',
    packer: 'Jaipur Gifting Crafts Ltd',
    importer: null,
    hsnCode: '69120010',
    taxRateId: 'tax-gst-18',
    taxRateName: 'GST 18%',
    taxRateValue: '18.00',
    mrp: '499.00',
    sellingPrice: '349.00',
    costPrice: '110.00',
    priceIncludesTax: true,
    minimumOrderQuantity: 1,
    maximumOrderQuantity: 20,
    manageStock: true,
    stockQuantity: 120,
    reservedStock: 0,
    availableStock: 120,
    stockStatus: 'IN_STOCK',
    lowStockThreshold: 10,
    allowBackorder: false,
    weightGrams: '380.00',
    lengthCm: '12.00',
    widthCm: '9.00',
    heightCm: '10.00',
    isFragile: true,
    requiresSpecialPackaging: true,
    sameDayEligible: true,
    nextDayEligible: true,
    expressEligible: true,
    storePickupEligible: true,
    maximumSameDayDistanceKm: '15.00',
    preparationTimeMinutes: 30,
    packingTimeMinutes: 10,
    externalLabRequired: false,
    requiresManualDeliveryReview: false,
    isPersonalised: true,
    isFeatured: true,
    isNewBadgeManual: false,
    isHotBadgeManual: false,
    isFlashSaleManual: false,
    isBestSellerOverride: false,
    sortOrder: 2,
    publishAt: '2026-01-01T00:00:00.000Z',
    unpublishAt: null,
    seoTitle: 'Personalised Anniversary Photo Mug Jaipur',
    seoDescription: 'Custom printed anniversary couple mug with photo delivery in Jaipur.',
    seoKeywordsJson: JSON.stringify(['photo mug jaipur', 'custom anniversary gift', 'mug printing']),
    seoImageFileId: 'img-prod-002-main',
    mainImageFileId: 'img-prod-002-main',
    mainImageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80',
    isIndexable: true,
    isFollowable: true,
    createdByAdminId: 'super-admin-id',
    updatedByAdminId: 'super-admin-id',
    createdAt: '2026-01-02T10:00:00.000Z',
    updatedAt: '2026-01-16T11:00:00.000Z',
    deletedAt: null,
    categoryAssignments: [
      {
        id: 'pca-002-1',
        categoryId: 'cat-custom-mugs',
        categoryName: 'Custom Mugs',
        categoryPath: 'Gifts > Custom Mugs',
        isPrimary: true,
        sortOrder: 1,
      },
    ],
    attributeAssignments: [],
    media: [
      {
        id: 'pm-002-1',
        fileAssetId: 'img-prod-002-main',
        url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80',
        mediaType: 'IMAGE',
        sortOrder: 1,
        isPrimary: true,
        altText: 'Personalised Photo Mug',
      },
    ],
    badges: [
      {
        id: 'pba-002-1',
        badge: 'PERSONALISED',
        source: 'AUTOMATIC',
        active: true,
        startsAt: null,
        endsAt: null,
      },
      {
        id: 'pba-002-2',
        badge: 'SAME_DAY',
        source: 'AUTOMATIC',
        active: true,
        startsAt: null,
        endsAt: null,
      },
    ],
  },
  {
    id: 'prod-003',
    storeId: null,
    productType: 'SIMPLE',
    status: 'ACTIVE',
    visibility: 'PUBLIC',
    condition: 'NEW',
    title: 'Jaipuri Handcrafted Velvet Teddy Bear (12 inch)',
    internalName: 'Soft Teddy Bear 12in',
    slug: 'jaipuri-handcrafted-velvet-teddy-bear',
    sku: 'JPG-TDY-RED-12',
    barcode: '890123456703',
    brandId: 'brand-002',
    brandName: 'Jaipur Gifts',
    primaryCategoryId: 'cat-soft-toys',
    primaryCategoryName: 'Soft Toys',
    primaryCategoryPath: 'Gifts > Soft Toys',
    shortDescription: 'Ultra-soft 12-inch plush teddy bear with embroidered heart motif.',
    description: 'Adorable crimson plush teddy bear made with skin-safe velvet plush and filled with high resilience polyfill.',
    highlightsJson: JSON.stringify(['12-Inch Plush Height', 'Non-Allergic Fabric', 'Embroidered Love Heart']),
    careInstructions: 'Surface washable with damp cloth.',
    countryOfOrigin: 'India',
    manufacturer: 'Soft Crafts India',
    packer: 'Jaipur Gifting Crafts Ltd',
    importer: null,
    hsnCode: '95030030',
    taxRateId: 'tax-gst-12',
    taxRateName: 'GST 12%',
    taxRateValue: '12.00',
    mrp: '799.00',
    sellingPrice: '499.00',
    costPrice: '180.00',
    priceIncludesTax: true,
    minimumOrderQuantity: 1,
    maximumOrderQuantity: 5,
    manageStock: true,
    stockQuantity: 30,
    reservedStock: 0,
    availableStock: 30,
    stockStatus: 'IN_STOCK',
    lowStockThreshold: 5,
    allowBackorder: false,
    weightGrams: '250.00',
    lengthCm: '20.00',
    widthCm: '15.00',
    heightCm: '30.00',
    isFragile: false,
    requiresSpecialPackaging: false,
    sameDayEligible: true,
    nextDayEligible: true,
    expressEligible: true,
    storePickupEligible: true,
    maximumSameDayDistanceKm: '20.00',
    preparationTimeMinutes: 15,
    packingTimeMinutes: 10,
    externalLabRequired: false,
    requiresManualDeliveryReview: false,
    isPersonalised: false,
    isFeatured: false,
    isNewBadgeManual: true,
    isHotBadgeManual: false,
    isFlashSaleManual: false,
    isBestSellerOverride: false,
    sortOrder: 3,
    publishAt: '2026-01-05T00:00:00.000Z',
    unpublishAt: null,
    seoTitle: 'Buy Plush Teddy Bear Online Jaipur | Instant Gift Delivery',
    seoDescription: 'Cute plush teddy bear gift delivery in Jaipur within 90 minutes.',
    seoKeywordsJson: JSON.stringify(['teddy bear jaipur', 'soft toy gift', 'birthday teddy']),
    seoImageFileId: 'img-prod-003-main',
    mainImageFileId: 'img-prod-003-main',
    mainImageUrl: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=800&q=80',
    isIndexable: true,
    isFollowable: true,
    createdByAdminId: 'super-admin-id',
    updatedByAdminId: 'super-admin-id',
    createdAt: '2026-01-05T09:00:00.000Z',
    updatedAt: '2026-01-10T14:20:00.000Z',
    deletedAt: null,
    categoryAssignments: [
      {
        id: 'pca-003-1',
        categoryId: 'cat-soft-toys',
        categoryName: 'Soft Toys',
        categoryPath: 'Gifts > Soft Toys',
        isPrimary: true,
        sortOrder: 1,
      },
    ],
    attributeAssignments: [],
    media: [
      {
        id: 'pm-003-1',
        fileAssetId: 'img-prod-003-main',
        url: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=800&q=80',
        mediaType: 'IMAGE',
        sortOrder: 1,
        isPrimary: true,
        altText: 'Plush Teddy Bear',
      },
    ],
    badges: [
      {
        id: 'pba-003-1',
        badge: 'NEW',
        source: 'MANUAL',
        active: true,
        startsAt: null,
        endsAt: null,
      },
      {
        id: 'pba-003-2',
        badge: 'SAME_DAY',
        source: 'AUTOMATIC',
        active: true,
        startsAt: null,
        endsAt: null,
      },
    ],
  },
  {
    id: 'prod-004',
    storeId: null,
    productType: 'GIFT_SET',
    status: 'ACTIVE',
    visibility: 'PUBLIC',
    condition: 'NEW',
    title: 'Luxury Birthday Hamper Gift Box',
    internalName: 'Birthday Luxe Box V1',
    slug: 'luxury-birthday-hamper-gift-box',
    sku: 'JPG-SET-BTH-LUX',
    barcode: '890123456704',
    brandId: 'brand-002',
    brandName: 'Jaipur Gifts',
    primaryCategoryId: 'cat-gift-hampers',
    primaryCategoryName: 'Gift Hampers',
    primaryCategoryPath: 'Gifts > Gift Hampers',
    shortDescription: 'Curated gift set containing custom photo mug, plush teddy bear, and artisan chocolates.',
    description: 'Surprise your loved ones with a premium gift box packaged in a luxury rigid ribbon box with customized birthday greeting card.',
    highlightsJson: JSON.stringify(['Custom Printed Mug Included', 'Soft Plush Teddy', 'Premium Chocolates Box', 'Free Birthday Card']),
    careInstructions: 'Store chocolates in cool dry place away from heat.',
    countryOfOrigin: 'India',
    manufacturer: 'Jaipur Gifting Crafts Ltd',
    packer: 'Jaipur Gifting Crafts Ltd',
    importer: null,
    hsnCode: '95059000',
    taxRateId: 'tax-gst-18',
    taxRateName: 'GST 18%',
    taxRateValue: '18.00',
    mrp: '2499.00',
    sellingPrice: '1799.00',
    costPrice: '620.00',
    priceIncludesTax: true,
    minimumOrderQuantity: 1,
    maximumOrderQuantity: 5,
    manageStock: true,
    stockQuantity: 18,
    reservedStock: 1,
    availableStock: 17,
    stockStatus: 'IN_STOCK',
    lowStockThreshold: 3,
    allowBackorder: false,
    weightGrams: '1200.00',
    lengthCm: '35.00',
    widthCm: '25.00',
    heightCm: '15.00',
    isFragile: true,
    requiresSpecialPackaging: true,
    sameDayEligible: true,
    nextDayEligible: true,
    expressEligible: true,
    storePickupEligible: true,
    maximumSameDayDistanceKm: '15.00',
    preparationTimeMinutes: 60,
    packingTimeMinutes: 20,
    externalLabRequired: false,
    requiresManualDeliveryReview: false,
    isPersonalised: true,
    isFeatured: true,
    isNewBadgeManual: false,
    isHotBadgeManual: true,
    isFlashSaleManual: false,
    isBestSellerOverride: true,
    sortOrder: 4,
    publishAt: '2026-01-10T00:00:00.000Z',
    unpublishAt: null,
    seoTitle: 'Luxury Birthday Gift Hamper Jaipur Delivery',
    seoDescription: 'Curated luxury birthday gift box with photo mug, teddy and chocolates in Jaipur.',
    seoKeywordsJson: JSON.stringify(['birthday gift hamper', 'luxury gift box jaipur', 'birthday hamper online']),
    seoImageFileId: 'img-prod-004-main',
    mainImageFileId: 'img-prod-004-main',
    mainImageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&q=80',
    isIndexable: true,
    isFollowable: true,
    createdByAdminId: 'super-admin-id',
    updatedByAdminId: 'super-admin-id',
    createdAt: '2026-01-10T10:00:00.000Z',
    updatedAt: '2026-01-18T16:00:00.000Z',
    deletedAt: null,
    categoryAssignments: [
      {
        id: 'pca-004-1',
        categoryId: 'cat-gift-hampers',
        categoryName: 'Gift Hampers',
        categoryPath: 'Gifts > Gift Hampers',
        isPrimary: true,
        sortOrder: 1,
      },
    ],
    attributeAssignments: [],
    media: [
      {
        id: 'pm-004-1',
        fileAssetId: 'img-prod-004-main',
        url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&q=80',
        mediaType: 'IMAGE',
        sortOrder: 1,
        isPrimary: true,
        altText: 'Luxury Birthday Gift Hamper',
      },
    ],
    badges: [
      {
        id: 'pba-004-1',
        badge: 'PERSONALISED',
        source: 'AUTOMATIC',
        active: true,
        startsAt: null,
        endsAt: null,
      },
      {
        id: 'pba-004-2',
        badge: 'HOT',
        source: 'MANUAL',
        active: true,
        startsAt: null,
        endsAt: null,
      },
      {
        id: 'pba-004-3',
        badge: 'SAME_DAY',
        source: 'AUTOMATIC',
        active: true,
        startsAt: null,
        endsAt: null,
      },
    ],
  },
];

function mapPrismaToDetail(p: any): ProductDetailItem {
  return {
    ...p,
    mrp: p.mrp ? Number(p.mrp).toFixed(2) : null,
    sellingPrice: p.sellingPrice ? Number(p.sellingPrice).toFixed(2) : null,
    costPrice: p.costPrice ? Number(p.costPrice).toFixed(2) : null,
    weightGrams: p.weightGrams ? Number(p.weightGrams).toFixed(2) : null,
    lengthCm: p.lengthCm ? Number(p.lengthCm).toFixed(2) : null,
    widthCm: p.widthCm ? Number(p.widthCm).toFixed(2) : null,
    heightCm: p.heightCm ? Number(p.heightCm).toFixed(2) : null,
    maximumSameDayDistanceKm: p.maximumSameDayDistanceKm ? Number(p.maximumSameDayDistanceKm).toFixed(2) : null,
    brandName: p.brand?.name || null,
    primaryCategoryName: p.primaryCategory?.name || null,
    primaryCategoryPath: p.primaryCategory?.path || null,
    taxRateName: p.taxRate?.name || null,
    taxRateValue: p.taxRate?.totalRate ? Number(p.taxRate.totalRate) : null,
    categoryAssignments: (p.categoryAssignments || []).map((ca: any) => ({
      id: ca.id,
      categoryId: ca.categoryId,
      categoryName: ca.category?.name || '',
      categoryPath: ca.category?.path || '',
      isPrimary: ca.isPrimary,
      sortOrder: ca.sortOrder,
    })),
    attributeAssignments: (p.attributeAssignments || []).map((paa: any) => ({
      id: paa.id,
      attributeId: paa.attributeId,
      attributeName: paa.attribute?.name || '',
      attributeCode: paa.attribute?.code || null,
      attributeType: paa.attribute?.type || 'TEXT',
      isRequired: paa.isRequired,
      isVariationAttribute: paa.isVariationAttribute,
      isFilterable: paa.isFilterable,
      sortOrder: paa.sortOrder,
      values: (paa.valueAssignments || []).map((va: any) => ({
        valueId: va.attributeValueId,
        valueName: va.attributeValue?.name || '',
        displayValue: va.attributeValue?.displayValue || null,
        colourHex: va.attributeValue?.colourHex || null,
      })),
    })),
    media: (p.media || []).map((m: any) => ({
      id: m.id,
      fileAssetId: m.fileAssetId,
      url: m.url || `/api/v1/files/${m.fileAssetId}`,
      mediaType: m.mediaType,
      sortOrder: m.sortOrder,
      isPrimary: m.isPrimary,
      altText: m.altText || '',
    })),
    badges: (p.badges || []).map((b: any) => ({
      id: b.id,
      badge: b.badge,
      source: b.source,
      active: b.active,
      startsAt: b.startsAt ? new Date(b.startsAt).toISOString() : null,
      endsAt: b.endsAt ? new Date(b.endsAt).toISOString() : null,
    })),
  };
}

export class ProductRepository {
  /**
   * Helper to write audit log in DB
   */
  private async createAuditLog(
    action: string,
    entityId: string,
    adminUserId: string | null,
    oldValues?: any,
    newValues?: any
  ) {
    try {
      await prisma.auditLog.create({
        data: {
          actorType: adminUserId ? 'ADMIN' : 'SYSTEM',
          actorAdminId: adminUserId || null,
          action,
          entityType: 'PRODUCT',
          entityId,
          oldValuesJson: oldValues ? JSON.stringify(oldValues) : null,
          newValuesJson: newValues ? JSON.stringify(newValues) : null,
        },
      });
    } catch {
      // Ignore failure in mock or audit log fallback mode
    }
  }

  async findMany(query: ProductFilterQuery) {
    try {
      const page = Math.max(1, query.page);
      const limit = Math.min(100, Math.max(1, query.limit));
      const skip = (page - 1) * limit;

      const where: any = {};

      if (!query.includeDeleted) {
        where.deletedAt = null;
      }

      if (query.search) {
        where.OR = [
          { title: { contains: query.search } },
          { internalName: { contains: query.search } },
          { sku: { contains: query.search } },
          { barcode: { contains: query.search } },
          { slug: { contains: query.search } },
        ];
      }

      if (query.productType) where.productType = query.productType;
      if (query.status) where.status = query.status;
      if (query.visibility) where.visibility = query.visibility;
      if (query.brandId) where.brandId = query.brandId;
      if (query.taxRateId) where.taxRateId = query.taxRateId;
      if (query.personalised !== undefined) where.isPersonalised = query.personalised;
      if (query.featured !== undefined) where.isFeatured = query.featured;
      if (query.sameDayEligible !== undefined) where.sameDayEligible = query.sameDayEligible;

      if (query.categoryId) {
        where.OR = [
          { primaryCategoryId: query.categoryId },
          { categoryAssignments: { some: { categoryId: query.categoryId } } },
        ];
      }

      if (query.minPrice !== undefined || query.maxPrice !== undefined) {
        where.sellingPrice = {};
        if (query.minPrice !== undefined) where.sellingPrice.gte = query.minPrice;
        if (query.maxPrice !== undefined) where.sellingPrice.lte = query.maxPrice;
      }

      if (query.stockStatus === 'IN_STOCK') {
        where.stockQuantity = { gt: 0 };
      } else if (query.stockStatus === 'OUT_OF_STOCK') {
        where.stockQuantity = { lte: 0 };
      }

      const orderBy: any = {};
      const sortField = query.sortBy || 'createdAt';
      const sortDir = query.sortOrder || 'desc';
      orderBy[sortField] = sortDir;

      const [total, items] = await Promise.all([
        prisma.product.count({ where }),
        prisma.product.findMany({
          where,
          skip,
          take: limit,
          orderBy,
          include: {
            brand: true,
            primaryCategory: true,
            taxRate: true,
            categoryAssignments: {
              include: { category: true },
            },
            attributeAssignments: {
              include: {
                attribute: true,
                valueAssignments: {
                  include: { attributeValue: true },
                },
              },
            },
            media: true,
            badges: true,
          },
        }),
      ]);

      const formattedProducts = items.map((p) => mapPrismaToDetail(p));

      return {
        products: formattedProducts,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit) || 1,
        },
      };
    } catch {
      // Fallback to in-memory mock store
      return this.findManyMock(query);
    }
  }

  private findManyMock(query: ProductFilterQuery) {
    let list = [...mockProducts];

    if (!query.includeDeleted) {
      list = list.filter((p) => p.deletedAt === null);
    }

    if (query.search) {
      const q = query.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          (p.sku && p.sku.toLowerCase().includes(q)) ||
          (p.internalName && p.internalName.toLowerCase().includes(q))
      );
    }

    if (query.productType) list = list.filter((p) => p.productType === query.productType);
    if (query.status) list = list.filter((p) => p.status === query.status);
    if (query.visibility) list = list.filter((p) => p.visibility === query.visibility);
    if (query.brandId) list = list.filter((p) => p.brandId === query.brandId);
    if (query.taxRateId) list = list.filter((p) => p.taxRateId === query.taxRateId);
    if (query.personalised !== undefined) list = list.filter((p) => p.isPersonalised === query.personalised);
    if (query.featured !== undefined) list = list.filter((p) => p.isFeatured === query.featured);
    if (query.sameDayEligible !== undefined) list = list.filter((p) => p.sameDayEligible === query.sameDayEligible);

    if (query.categoryId) {
      list = list.filter(
        (p) =>
          p.primaryCategoryId === query.categoryId ||
          p.categoryAssignments.some((ca) => ca.categoryId === query.categoryId)
      );
    }

    if (query.badge) {
      list = list.filter((p) => p.badges.some((b) => b.badge === query.badge && b.active));
    }

    if (query.minPrice !== undefined) {
      list = list.filter((p) => p.sellingPrice !== null && parseFloat(p.sellingPrice) >= query.minPrice!);
    }
    if (query.maxPrice !== undefined) {
      list = list.filter((p) => p.sellingPrice !== null && parseFloat(p.sellingPrice) <= query.maxPrice!);
    }

    if (query.stockStatus === 'IN_STOCK') {
      list = list.filter((p) => (p.stockQuantity ?? 0) > 0);
    } else if (query.stockStatus === 'OUT_OF_STOCK') {
      list = list.filter((p) => (p.stockQuantity ?? 0) <= 0);
    }

    const sortField = query.sortBy || 'createdAt';
    const sortDir = query.sortOrder || 'desc';

    list.sort((a: any, b: any) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    const page = Math.max(1, query.page);
    const limit = Math.min(100, Math.max(1, query.limit));
    const total = list.length;
    const startIndex = (page - 1) * limit;
    const paginated = list.slice(startIndex, startIndex + limit);

    return {
      products: paginated,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findById(id: string, includeDeleted = false): Promise<ProductDetailItem | null> {
    try {
      const p = await prisma.product.findFirst({
        where: {
          id,
          ...(includeDeleted ? {} : { deletedAt: null }),
        },
        include: {
          brand: true,
          primaryCategory: true,
          taxRate: true,
          categoryAssignments: {
            include: { category: true },
          },
          attributeAssignments: {
            include: {
              attribute: true,
              valueAssignments: {
                include: { attributeValue: true },
              },
            },
          },
          media: true,
          badges: true,
        },
      });

      if (!p) return null;
      return mapPrismaToDetail(p);
    } catch {
      const found = mockProducts.find((p) => p.id === id && (includeDeleted || p.deletedAt === null));
      return found || null;
    }
  }

  async findBySlug(slug: string, excludeId?: string): Promise<ProductDetailItem | null> {
    try {
      const p = await prisma.product.findFirst({
        where: {
          slug,
          deletedAt: null,
          ...(excludeId ? { id: { not: excludeId } } : {}),
        },
        include: {
          brand: true,
          primaryCategory: true,
          taxRate: true,
          categoryAssignments: { include: { category: true } },
          attributeAssignments: {
            include: {
              attribute: true,
              valueAssignments: { include: { attributeValue: true } },
            },
          },
          media: true,
          badges: true,
        },
      });

      if (!p) return null;
      return mapPrismaToDetail(p);
    } catch {
      const found = mockProducts.find(
        (p) => p.slug === slug && p.deletedAt === null && (excludeId ? p.id !== excludeId : true)
      );
      return found || null;
    }
  }

  async findBySku(sku: string, excludeId?: string): Promise<ProductDetailItem | null> {
    if (!sku) return null;
    try {
      const p = await prisma.product.findFirst({
        where: {
          sku,
          deletedAt: null,
          ...(excludeId ? { id: { not: excludeId } } : {}),
        },
      });
      if (!p) return null;
      return this.findById(p.id);
    } catch {
      const found = mockProducts.find(
        (p) => p.sku === sku && p.deletedAt === null && (excludeId ? p.id !== excludeId : true)
      );
      return found || null;
    }
  }

  async getOptions(query: ProductOptionsQuery) {
    try {
      const where: any = { deletedAt: null };
      if (query.activeOnly) where.status = 'ACTIVE';
      if (query.excludeId) where.id = { not: query.excludeId };
      if (query.productType) where.productType = query.productType;
      if (query.categoryId) where.primaryCategoryId = query.categoryId;
      if (query.search) {
        where.OR = [
          { title: { contains: query.search } },
          { sku: { contains: query.search } },
        ];
      }

      const items = await prisma.product.findMany({
        where,
        take: 50,
        select: {
          id: true,
          title: true,
          sku: true,
          productType: true,
          sellingPrice: true,
          status: true,
          mainImageFileId: true,
        },
        orderBy: { title: 'asc' },
      });

      return items.map((i) => ({
        id: i.id,
        title: i.title,
        sku: i.sku,
        productType: i.productType,
        sellingPrice: i.sellingPrice ? i.sellingPrice.toString() : null,
        status: i.status,
        selectable: i.status === 'ACTIVE',
      }));
    } catch {
      let list = mockProducts.filter((p) => p.deletedAt === null);
      if (query.activeOnly) list = list.filter((p) => p.status === 'ACTIVE');
      if (query.excludeId) list = list.filter((p) => p.id !== query.excludeId);
      if (query.productType) list = list.filter((p) => p.productType === query.productType);
      if (query.search) {
        const q = query.search.toLowerCase();
        list = list.filter((p) => p.title.toLowerCase().includes(q) || (p.sku && p.sku.toLowerCase().includes(q)));
      }

      return list.map((p) => ({
        id: p.id,
        title: p.title,
        sku: p.sku,
        productType: p.productType,
        sellingPrice: p.sellingPrice,
        status: p.status,
        selectable: p.status === 'ACTIVE',
      }));
    }
  }

  async create(data: CreateProductDTO & { slug: string }, adminUserId?: string): Promise<ProductDetailItem> {
    const id = `prod-${crypto.randomUUID().substring(0, 8)}`;
    const now = new Date().toISOString();

    const stockQty = data.stockQuantity ?? 0;
    const reserved = data.reservedStock ?? 0;
    const available = Math.max(0, stockQty - reserved);
    let stockStatus: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' = 'IN_STOCK';
    if (stockQty <= 0) stockStatus = 'OUT_OF_STOCK';
    else if (data.lowStockThreshold && stockQty <= data.lowStockThreshold) stockStatus = 'LOW_STOCK';

    // Auto-derive badges
    const derivedBadges: Array<{
      id: string;
      badge: ProductBadge;
      source: 'MANUAL' | 'AUTOMATIC' | 'SYSTEM';
      active: boolean;
      startsAt: string | null;
      endsAt: string | null;
    }> = [];

    if (data.isPersonalised) {
      derivedBadges.push({
        id: `pba-${crypto.randomUUID().substring(0, 8)}`,
        badge: 'PERSONALISED',
        source: 'AUTOMATIC',
        active: true,
        startsAt: null,
        endsAt: null,
      });
    }

    if (data.sameDayEligible) {
      derivedBadges.push({
        id: `pba-${crypto.randomUUID().substring(0, 8)}`,
        badge: 'SAME_DAY',
        source: 'AUTOMATIC',
        active: true,
        startsAt: null,
        endsAt: null,
      });
    }

    (data.badges || []).forEach((b) => {
      if (!derivedBadges.some((db) => db.badge === b.badge)) {
        derivedBadges.push({
          id: `pba-${crypto.randomUUID().substring(0, 8)}`,
          badge: b.badge as ProductBadge,
          source: (b.source || 'MANUAL') as any,
          active: b.active ?? true,
          startsAt: b.startsAt || null,
          endsAt: b.endsAt || null,
        });
      }
    });

    const categoryAssignments = [
      {
        id: `pca-${crypto.randomUUID().substring(0, 8)}`,
        categoryId: data.primaryCategoryId,
        categoryName: 'Category',
        categoryPath: 'Category Path',
        isPrimary: true,
        sortOrder: 1,
      },
      ...(data.additionalCategoryIds || []).map((catId, idx) => ({
        id: `pca-${crypto.randomUUID().substring(0, 8)}`,
        categoryId: catId,
        categoryName: 'Additional Category',
        categoryPath: 'Additional Category Path',
        isPrimary: false,
        sortOrder: idx + 2,
      })),
    ];

    const attributeAssignments = (data.attributeAssignments || []).map((attrInput, idx) => {
      const assignmentId = `paa-${crypto.randomUUID().substring(0, 8)}`;
      return {
        id: assignmentId,
        attributeId: attrInput.attributeId,
        attributeName: 'Attribute',
        isRequired: attrInput.isRequired ?? false,
        isVariationAttribute: attrInput.isVariationAttribute ?? true,
        isFilterable: attrInput.isFilterable ?? true,
        sortOrder: attrInput.sortOrder ?? idx + 1,
        values: (attrInput.valueIds || []).map((vId, vIdx) => ({
          id: `pava-${crypto.randomUUID().substring(0, 8)}`,
          valueId: vId,
          valueName: 'Value',
          sortOrder: vIdx + 1,
        })),
      };
    });

    const media = (data.media || []).map((m, idx) => ({
      id: `pm-${crypto.randomUUID().substring(0, 8)}`,
      fileAssetId: m.fileAssetId,
      mediaType: m.mediaType as any,
      sortOrder: m.sortOrder ?? idx + 1,
      isPrimary: m.isPrimary ?? (idx === 0),
      altText: m.altText || null,
    }));

    const mainMedia = media.find((m) => m.isPrimary) || media[0];

    const newProduct: ProductDetailItem = {
      id,
      storeId: null,
      productType: data.productType,
      status: data.status,
      visibility: data.visibility,
      condition: data.condition || 'NEW',
      title: data.title,
      internalName: data.internalName || null,
      slug: data.slug,
      sku: data.sku || null,
      barcode: data.barcode || null,
      brandId: data.brandId || null,
      brandName: data.brandId ? 'Selected Brand' : null,
      primaryCategoryId: data.primaryCategoryId,
      primaryCategoryName: 'Selected Category',
      primaryCategoryPath: 'Category Path',
      shortDescription: data.shortDescription || null,
      description: data.description || null,
      highlightsJson: data.highlightsJson || null,
      careInstructions: data.careInstructions || null,
      countryOfOrigin: data.countryOfOrigin || 'India',
      manufacturer: data.manufacturer || null,
      packer: data.packer || null,
      importer: data.importer || null,
      hsnCode: data.hsnCode || null,
      taxRateId: data.taxRateId || null,
      taxRateName: data.taxRateId ? 'GST 18%' : null,
      taxRateValue: '18.00',
      mrp: data.mrp !== undefined && data.mrp !== null ? Number(data.mrp).toFixed(2) : null,
      sellingPrice: data.sellingPrice !== undefined && data.sellingPrice !== null ? Number(data.sellingPrice).toFixed(2) : null,
      costPrice: data.costPrice !== undefined && data.costPrice !== null ? Number(data.costPrice).toFixed(2) : null,
      priceIncludesTax: data.priceIncludesTax ?? true,
      minimumOrderQuantity: data.minimumOrderQuantity || 1,
      maximumOrderQuantity: data.maximumOrderQuantity || null,
      manageStock: data.manageStock ?? true,
      stockQuantity: stockQty,
      reservedStock: reserved,
      availableStock: available,
      stockStatus,
      lowStockThreshold: data.lowStockThreshold ?? 5,
      allowBackorder: data.allowBackorder ?? false,
      weightGrams: data.weightGrams ? Number(data.weightGrams).toFixed(2) : null,
      lengthCm: data.lengthCm ? Number(data.lengthCm).toFixed(2) : null,
      widthCm: data.widthCm ? Number(data.widthCm).toFixed(2) : null,
      heightCm: data.heightCm ? Number(data.heightCm).toFixed(2) : null,
      isFragile: data.isFragile ?? false,
      requiresSpecialPackaging: data.requiresSpecialPackaging ?? false,
      sameDayEligible: data.sameDayEligible ?? false,
      nextDayEligible: data.nextDayEligible ?? true,
      expressEligible: data.expressEligible ?? false,
      storePickupEligible: data.storePickupEligible ?? true,
      maximumSameDayDistanceKm: data.maximumSameDayDistanceKm ? Number(data.maximumSameDayDistanceKm).toFixed(2) : null,
      preparationTimeMinutes: data.preparationTimeMinutes ?? 60,
      packingTimeMinutes: data.packingTimeMinutes ?? 15,
      externalLabRequired: data.externalLabRequired ?? false,
      requiresManualDeliveryReview: data.requiresManualDeliveryReview ?? false,
      isPersonalised: data.isPersonalised ?? false,
      isFeatured: data.isFeatured ?? false,
      isNewBadgeManual: data.isNewBadgeManual ?? false,
      isHotBadgeManual: data.isHotBadgeManual ?? false,
      isFlashSaleManual: data.isFlashSaleManual ?? false,
      isBestSellerOverride: data.isBestSellerOverride ?? false,
      sortOrder: data.sortOrder ?? 0,
      publishAt: data.publishAt || null,
      unpublishAt: data.unpublishAt || null,
      seoTitle: data.seoTitle || null,
      seoDescription: data.seoDescription || null,
      seoKeywordsJson: data.seoKeywordsJson || null,
      seoImageFileId: data.seoImageFileId || null,
      mainImageFileId: data.mainImageFileId || (mainMedia ? mainMedia.fileAssetId : null),
      mainImageUrl: mainMedia ? (mainMedia as any).url || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80' : 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80',
      isIndexable: data.isIndexable ?? true,
      isFollowable: data.isFollowable ?? true,
      createdByAdminId: adminUserId || null,
      updatedByAdminId: adminUserId || null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      categoryAssignments,
      attributeAssignments,
      media,
      badges: derivedBadges,
    };

    mockProducts.unshift(newProduct);
    await this.createAuditLog('PRODUCT_CREATED', newProduct.id, adminUserId || null, null, newProduct);

    return newProduct;
  }

  async update(id: string, data: UpdateProductDTO, adminUserId?: string): Promise<ProductDetailItem | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const now = new Date().toISOString();

    const stockQty = data.stockQuantity !== undefined ? (data.stockQuantity ?? 0) : (existing.stockQuantity ?? 0);
    const reserved = data.reservedStock !== undefined ? (data.reservedStock ?? 0) : existing.reservedStock;
    const available = Math.max(0, stockQty - reserved);
    let stockStatus: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' = 'IN_STOCK';
    if (stockQty <= 0) stockStatus = 'OUT_OF_STOCK';

    const isPers = data.isPersonalised !== undefined ? data.isPersonalised : existing.isPersonalised;
    const sameDay = data.sameDayEligible !== undefined ? data.sameDayEligible : existing.sameDayEligible;

    // Derived Badges
    const currentBadges = [...existing.badges];
    if (isPers && !currentBadges.some((b) => b.badge === 'PERSONALISED')) {
      currentBadges.push({
        id: `pba-${crypto.randomUUID().substring(0, 8)}`,
        badge: 'PERSONALISED',
        source: 'AUTOMATIC',
        active: true,
        startsAt: null,
        endsAt: null,
      });
    }
    if (sameDay && !currentBadges.some((b) => b.badge === 'SAME_DAY')) {
      currentBadges.push({
        id: `pba-${crypto.randomUUID().substring(0, 8)}`,
        badge: 'SAME_DAY',
        source: 'AUTOMATIC',
        active: true,
        startsAt: null,
        endsAt: null,
      });
    }

    const { attributeAssignments, additionalCategoryIds, media, ...restData } = data;

    const updatedProduct: ProductDetailItem = {
      ...existing,
      ...restData,
      mrp: data.mrp !== undefined ? (data.mrp !== null ? Number(data.mrp).toFixed(2) : null) : existing.mrp,
      sellingPrice: data.sellingPrice !== undefined ? (data.sellingPrice !== null ? Number(data.sellingPrice).toFixed(2) : null) : existing.sellingPrice,
      costPrice: data.costPrice !== undefined ? (data.costPrice !== null ? Number(data.costPrice).toFixed(2) : null) : existing.costPrice,
      weightGrams: data.weightGrams !== undefined ? (data.weightGrams !== null ? Number(data.weightGrams).toFixed(2) : null) : existing.weightGrams,
      lengthCm: data.lengthCm !== undefined ? (data.lengthCm !== null ? Number(data.lengthCm).toFixed(2) : null) : existing.lengthCm,
      widthCm: data.widthCm !== undefined ? (data.widthCm !== null ? Number(data.widthCm).toFixed(2) : null) : existing.widthCm,
      heightCm: data.heightCm !== undefined ? (data.heightCm !== null ? Number(data.heightCm).toFixed(2) : null) : existing.heightCm,
      maximumSameDayDistanceKm: data.maximumSameDayDistanceKm !== undefined ? (data.maximumSameDayDistanceKm !== null ? Number(data.maximumSameDayDistanceKm).toFixed(2) : null) : existing.maximumSameDayDistanceKm,
      stockQuantity: stockQty,
      reservedStock: reserved,
      availableStock: available,
      stockStatus,
      badges: currentBadges,
      updatedByAdminId: adminUserId || null,
      updatedAt: now,
    };

    const idx = mockProducts.findIndex((p) => p.id === id);
    if (idx !== -1) {
      mockProducts[idx] = updatedProduct;
    }

    await this.createAuditLog('PRODUCT_UPDATED', id, adminUserId || null, existing, updatedProduct);
    return updatedProduct;
  }

  async updateStatus(id: string, status: ProductStatus, adminUserId?: string): Promise<ProductDetailItem | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    existing.status = status;
    existing.updatedAt = new Date().toISOString();
    existing.updatedByAdminId = adminUserId || null;

    await this.createAuditLog('PRODUCT_STATUS_UPDATED', id, adminUserId || null, { status: existing.status }, { status });
    return existing;
  }

  async updateVisibility(id: string, visibility: ProductVisibility, adminUserId?: string): Promise<ProductDetailItem | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    existing.visibility = visibility;
    existing.updatedAt = new Date().toISOString();
    existing.updatedByAdminId = adminUserId || null;

    await this.createAuditLog('PRODUCT_VISIBILITY_UPDATED', id, adminUserId || null, { visibility: existing.visibility }, { visibility });
    return existing;
  }

  async updateFeatured(id: string, isFeatured: boolean, adminUserId?: string): Promise<ProductDetailItem | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    existing.isFeatured = isFeatured;
    existing.updatedAt = new Date().toISOString();
    existing.updatedByAdminId = adminUserId || null;

    await this.createAuditLog('PRODUCT_FEATURED_UPDATED', id, adminUserId || null, { isFeatured: existing.isFeatured }, { isFeatured });
    return existing;
  }

  async updateInventory(id: string, data: UpdateInventoryDTO, adminUserId?: string): Promise<ProductDetailItem | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    existing.manageStock = data.manageStock;
    if (data.stockQuantity !== undefined) existing.stockQuantity = data.stockQuantity;
    if (data.reservedStock !== undefined) existing.reservedStock = data.reservedStock;
    if (data.lowStockThreshold !== undefined) existing.lowStockThreshold = data.lowStockThreshold;
    if (data.allowBackorder !== undefined) existing.allowBackorder = data.allowBackorder;

    const stockQty = existing.stockQuantity ?? 0;
    existing.availableStock = Math.max(0, stockQty - existing.reservedStock);
    if (stockQty <= 0) existing.stockStatus = 'OUT_OF_STOCK';
    else if (existing.lowStockThreshold && stockQty <= existing.lowStockThreshold) existing.stockStatus = 'LOW_STOCK';
    else existing.stockStatus = 'IN_STOCK';

    existing.updatedAt = new Date().toISOString();
    existing.updatedByAdminId = adminUserId || null;

    await this.createAuditLog('PRODUCT_INVENTORY_UPDATED', id, adminUserId || null, null, data);
    return existing;
  }

  async updateDeliverySettings(id: string, data: UpdateDeliverySettingsDTO, adminUserId?: string): Promise<ProductDetailItem | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    existing.sameDayEligible = data.sameDayEligible;
    existing.nextDayEligible = data.nextDayEligible;
    existing.expressEligible = data.expressEligible;
    existing.storePickupEligible = data.storePickupEligible;
    if (data.maximumSameDayDistanceKm !== undefined) existing.maximumSameDayDistanceKm = data.maximumSameDayDistanceKm ? data.maximumSameDayDistanceKm.toFixed(2) : null;
    if (data.preparationTimeMinutes !== undefined) existing.preparationTimeMinutes = data.preparationTimeMinutes;
    if (data.packingTimeMinutes !== undefined) existing.packingTimeMinutes = data.packingTimeMinutes;
    if (data.isFragile !== undefined) existing.isFragile = data.isFragile;
    if (data.requiresSpecialPackaging !== undefined) existing.requiresSpecialPackaging = data.requiresSpecialPackaging;
    if (data.externalLabRequired !== undefined) existing.externalLabRequired = data.externalLabRequired;
    if (data.requiresManualDeliveryReview !== undefined) existing.requiresManualDeliveryReview = data.requiresManualDeliveryReview;

    existing.updatedAt = new Date().toISOString();
    existing.updatedByAdminId = adminUserId || null;

    await this.createAuditLog('PRODUCT_DELIVERY_SETTINGS_UPDATED', id, adminUserId || null, null, data);
    return existing;
  }

  async softDelete(id: string, adminUserId?: string): Promise<boolean> {
    const existing = await this.findById(id);
    if (!existing) return false;

    const now = new Date().toISOString();
    existing.deletedAt = now;
    existing.updatedAt = now;
    existing.updatedByAdminId = adminUserId || null;

    await this.createAuditLog('PRODUCT_DELETED', id, adminUserId || null, null, { deletedAt: now });
    return true;
  }

  async restore(id: string, adminUserId?: string): Promise<ProductDetailItem | null> {
    const existing = await this.findById(id, true);
    if (!existing) return null;

    existing.deletedAt = null;
    existing.status = 'INACTIVE'; // Safe default after restore
    existing.updatedAt = new Date().toISOString();
    existing.updatedByAdminId = adminUserId || null;

    await this.createAuditLog('PRODUCT_RESTORED', id, adminUserId || null, null, { status: 'INACTIVE' });
    return existing;
  }

  async duplicate(id: string, adminUserId?: string): Promise<ProductDetailItem | null> {
    const source = await this.findById(id);
    if (!source) return null;

    const newSlug = `${source.slug}-copy-${crypto.randomUUID().substring(0, 4)}`;
    const newTitle = `${source.title} (Copy)`;

    const duplicatedDTO: CreateProductDTO = {
      productType: source.productType,
      status: 'DRAFT',
      visibility: 'HIDDEN',
      condition: source.condition || 'NEW',
      title: newTitle,
      internalName: source.internalName ? `${source.internalName} (Copy)` : null,
      slug: newSlug,
      sku: null, // Clear SKU
      barcode: null, // Clear Barcode
      brandId: source.brandId,
      primaryCategoryId: source.primaryCategoryId,
      additionalCategoryIds: source.categoryAssignments.filter((ca) => !ca.isPrimary).map((ca) => ca.categoryId),
      shortDescription: source.shortDescription,
      description: source.description,
      highlightsJson: source.highlightsJson,
      careInstructions: source.careInstructions,
      countryOfOrigin: source.countryOfOrigin,
      manufacturer: source.manufacturer,
      packer: source.packer,
      importer: source.importer,
      hsnCode: source.hsnCode,
      taxRateId: source.taxRateId,
      mrp: source.mrp ? parseFloat(source.mrp) : null,
      sellingPrice: source.sellingPrice ? parseFloat(source.sellingPrice) : null,
      costPrice: source.costPrice ? parseFloat(source.costPrice) : null,
      priceIncludesTax: source.priceIncludesTax,
      minimumOrderQuantity: source.minimumOrderQuantity,
      maximumOrderQuantity: source.maximumOrderQuantity,
      manageStock: source.manageStock,
      stockQuantity: source.stockQuantity,
      reservedStock: 0,
      lowStockThreshold: source.lowStockThreshold,
      allowBackorder: source.allowBackorder,
      weightGrams: source.weightGrams ? parseFloat(source.weightGrams) : null,
      lengthCm: source.lengthCm ? parseFloat(source.lengthCm) : null,
      widthCm: source.widthCm ? parseFloat(source.widthCm) : null,
      heightCm: source.heightCm ? parseFloat(source.heightCm) : null,
      isFragile: source.isFragile,
      requiresSpecialPackaging: source.requiresSpecialPackaging,
      sameDayEligible: source.sameDayEligible,
      nextDayEligible: source.nextDayEligible,
      expressEligible: source.expressEligible,
      storePickupEligible: source.storePickupEligible,
      maximumSameDayDistanceKm: source.maximumSameDayDistanceKm ? parseFloat(source.maximumSameDayDistanceKm) : null,
      preparationTimeMinutes: source.preparationTimeMinutes,
      packingTimeMinutes: source.packingTimeMinutes,
      externalLabRequired: source.externalLabRequired,
      requiresManualDeliveryReview: source.requiresManualDeliveryReview,
      isPersonalised: source.isPersonalised,
      isFeatured: false,
      isNewBadgeManual: true,
      isHotBadgeManual: false,
      isFlashSaleManual: false,
      isBestSellerOverride: false,
      sortOrder: source.sortOrder,
      publishAt: null,
      unpublishAt: null,
      seoTitle: source.seoTitle ? `${source.seoTitle} Copy` : null,
      seoDescription: source.seoDescription,
      seoKeywordsJson: source.seoKeywordsJson,
      seoImageFileId: source.seoImageFileId,
      mainImageFileId: source.mainImageFileId,
      isIndexable: source.isIndexable,
      isFollowable: source.isFollowable,
      attributeAssignments: source.attributeAssignments.map((paa) => ({
        attributeId: paa.attributeId,
        isRequired: paa.isRequired,
        isVariationAttribute: paa.isVariationAttribute,
        isFilterable: paa.isFilterable,
        sortOrder: paa.sortOrder,
        valueIds: paa.values.map((v) => v.valueId),
      })),
      media: source.media.map((m) => ({
        fileAssetId: m.fileAssetId,
        mediaType: m.mediaType,
        isPrimary: m.isPrimary,
        altText: m.altText,
        sortOrder: m.sortOrder,
      })),
      badges: [],
    };

    const created = await this.create({ ...duplicatedDTO, slug: newSlug }, adminUserId);
    await this.createAuditLog('PRODUCT_DUPLICATED', created.id, adminUserId || null, { sourceId: id }, { newId: created.id });
    return created;
  }
}

export const productRepository = new ProductRepository();
