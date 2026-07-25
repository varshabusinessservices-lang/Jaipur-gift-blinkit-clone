import { config } from '../../../config/env';
import {
  ProductDetail,
  ProductFilterQuery,
  CreateProductInput,
  ProductOption,
  ProductStatus,
  ProductVisibility,
} from '../types/product';
import { generateVariationCombinations, AttributeSelectionInput } from '../../../utils/variationCombinator';

const API_BASE = config.apiBaseUrl;

// Mock Store for Frontend Mock Mode
let mockProducts: ProductDetail[] = [
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
    attributeAssignments: [],
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
      { id: 'pba-1', badge: 'PERSONALISED', source: 'AUTOMATIC', active: true, startsAt: null, endsAt: null },
      { id: 'pba-2', badge: 'HOT', source: 'MANUAL', active: true, startsAt: null, endsAt: null },
      { id: 'pba-3', badge: 'SAME_DAY', source: 'AUTOMATIC', active: true, startsAt: null, endsAt: null },
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
      { id: 'pba-4', badge: 'PERSONALISED', source: 'AUTOMATIC', active: true, startsAt: null, endsAt: null },
      { id: 'pba-5', badge: 'SAME_DAY', source: 'AUTOMATIC', active: true, startsAt: null, endsAt: null },
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
      { id: 'pba-6', badge: 'NEW', source: 'MANUAL', active: true, startsAt: null, endsAt: null },
      { id: 'pba-7', badge: 'SAME_DAY', source: 'AUTOMATIC', active: true, startsAt: null, endsAt: null },
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
      { id: 'pba-8', badge: 'PERSONALISED', source: 'AUTOMATIC', active: true, startsAt: null, endsAt: null },
      { id: 'pba-9', badge: 'HOT', source: 'MANUAL', active: true, startsAt: null, endsAt: null },
      { id: 'pba-10', badge: 'SAME_DAY', source: 'AUTOMATIC', active: true, startsAt: null, endsAt: null },
    ],
  },
];

export const productApi = {
  async getProducts(params: ProductFilterQuery = {}) {
    if (config.useMockApi) {
      let list = [...mockProducts];

      if (!params.includeDeleted) {
        list = list.filter((p) => p.deletedAt === null);
      } else {
        list = list.filter((p) => p.deletedAt !== null);
      }

      if (params.search) {
        const q = params.search.toLowerCase();
        list = list.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.slug.toLowerCase().includes(q) ||
            (p.sku && p.sku.toLowerCase().includes(q)) ||
            (p.internalName && p.internalName.toLowerCase().includes(q))
        );
      }

      if (params.productType) list = list.filter((p) => p.productType === params.productType);
      if (params.status) list = list.filter((p) => p.status === params.status);
      if (params.visibility) list = list.filter((p) => p.visibility === params.visibility);
      if (params.brandId) list = list.filter((p) => p.brandId === params.brandId);
      if (params.categoryId) {
        list = list.filter(
          (p) =>
            p.primaryCategoryId === params.categoryId ||
            p.categoryAssignments.some((ca) => ca.categoryId === params.categoryId)
        );
      }
      if (params.personalised !== undefined) list = list.filter((p) => p.isPersonalised === params.personalised);
      if (params.featured !== undefined) list = list.filter((p) => p.isFeatured === params.featured);
      if (params.sameDayEligible !== undefined) list = list.filter((p) => p.sameDayEligible === params.sameDayEligible);

      const page = params.page || 1;
      const limit = params.limit || 20;
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

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        searchParams.append(k, String(v));
      }
    });

    const res = await fetch(`${API_BASE}/admin/products?${searchParams.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch products');
    const body = await res.json();
    return {
      products: body.data,
      pagination: body.pagination,
    };
  },

  async getProductById(id: string) {
    if (config.useMockApi) {
      const p = mockProducts.find((item) => item.id === id);
      if (!p) throw new Error('Product not found');
      return p;
    }

    const res = await fetch(`${API_BASE}/admin/products/${id}`);
    if (!res.ok) throw new Error('Failed to fetch product detail');
    const body = await res.json();
    return body.data as ProductDetail;
  },

  async getProductOptions(search?: string, categoryId?: string) {
    if (config.useMockApi) {
      let list = mockProducts.filter((p) => p.deletedAt === null && p.status === 'ACTIVE');
      if (categoryId) list = list.filter((p) => p.primaryCategoryId === categoryId);
      if (search) {
        const q = search.toLowerCase();
        list = list.filter((p) => p.title.toLowerCase().includes(q) || (p.sku && p.sku.toLowerCase().includes(q)));
      }
      return list.map((p) => ({
        id: p.id,
        title: p.title,
        sku: p.sku,
        productType: p.productType,
        sellingPrice: p.sellingPrice,
        status: p.status,
        selectable: true,
      })) as ProductOption[];
    }

    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (categoryId) params.append('categoryId', categoryId);

    const res = await fetch(`${API_BASE}/admin/products/options?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch product options');
    const body = await res.json();
    return body.data as ProductOption[];
  },

  async createProduct(input: CreateProductInput) {
    if (config.useMockApi) {
      const newId = `prod-${Date.now()}`;
      const now = new Date().toISOString();
      const slug = input.slug || input.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');

      const mockNewProduct: ProductDetail = {
        id: newId,
        storeId: null,
        productType: input.productType,
        status: input.status,
        visibility: input.visibility,
        condition: input.condition,
        title: input.title,
        internalName: input.internalName || null,
        slug,
        sku: input.sku || null,
        barcode: input.barcode || null,
        brandId: input.brandId || null,
        brandName: input.brandId ? 'Selected Brand' : null,
        primaryCategoryId: input.primaryCategoryId,
        primaryCategoryName: 'Selected Category',
        primaryCategoryPath: 'Category Path',
        shortDescription: input.shortDescription || null,
        description: input.description || null,
        highlightsJson: input.highlightsJson || null,
        careInstructions: input.careInstructions || null,
        countryOfOrigin: input.countryOfOrigin || 'India',
        manufacturer: input.manufacturer || null,
        packer: input.packer || null,
        importer: input.importer || null,
        hsnCode: input.hsnCode || null,
        taxRateId: input.taxRateId || null,
        taxRateName: input.taxRateId ? 'GST 18%' : null,
        taxRateValue: '18.00',
        mrp: input.mrp !== undefined && input.mrp !== null ? Number(input.mrp).toFixed(2) : null,
        sellingPrice: input.sellingPrice !== undefined && input.sellingPrice !== null ? Number(input.sellingPrice).toFixed(2) : null,
        costPrice: input.costPrice !== undefined && input.costPrice !== null ? Number(input.costPrice).toFixed(2) : null,
        priceIncludesTax: input.priceIncludesTax ?? true,
        minimumOrderQuantity: input.minimumOrderQuantity || 1,
        maximumOrderQuantity: input.maximumOrderQuantity || null,
        manageStock: input.manageStock ?? true,
        stockQuantity: input.stockQuantity ?? 0,
        reservedStock: input.reservedStock || 0,
        availableStock: Math.max(0, (input.stockQuantity || 0) - (input.reservedStock || 0)),
        stockStatus: (input.stockQuantity || 0) > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK',
        lowStockThreshold: input.lowStockThreshold || 5,
        allowBackorder: input.allowBackorder ?? false,
        weightGrams: input.weightGrams ? Number(input.weightGrams).toFixed(2) : null,
        lengthCm: input.lengthCm ? Number(input.lengthCm).toFixed(2) : null,
        widthCm: input.widthCm ? Number(input.widthCm).toFixed(2) : null,
        heightCm: input.heightCm ? Number(input.heightCm).toFixed(2) : null,
        isFragile: input.isFragile ?? false,
        requiresSpecialPackaging: input.requiresSpecialPackaging ?? false,
        sameDayEligible: input.sameDayEligible ?? false,
        nextDayEligible: input.nextDayEligible ?? true,
        expressEligible: input.expressEligible ?? false,
        storePickupEligible: input.storePickupEligible ?? true,
        maximumSameDayDistanceKm: input.maximumSameDayDistanceKm ? Number(input.maximumSameDayDistanceKm).toFixed(2) : null,
        preparationTimeMinutes: input.preparationTimeMinutes || 60,
        packingTimeMinutes: input.packingTimeMinutes || 15,
        externalLabRequired: input.externalLabRequired ?? false,
        requiresManualDeliveryReview: input.requiresManualDeliveryReview ?? false,
        isPersonalised: input.isPersonalised ?? false,
        isFeatured: input.isFeatured ?? false,
        isNewBadgeManual: input.isNewBadgeManual ?? false,
        isHotBadgeManual: input.isHotBadgeManual ?? false,
        isFlashSaleManual: input.isFlashSaleManual ?? false,
        isBestSellerOverride: input.isBestSellerOverride ?? false,
        sortOrder: input.sortOrder || 0,
        publishAt: input.publishAt || null,
        unpublishAt: input.unpublishAt || null,
        seoTitle: input.seoTitle || null,
        seoDescription: input.seoDescription || null,
        seoKeywordsJson: input.seoKeywordsJson || null,
        seoImageFileId: input.seoImageFileId || null,
        mainImageFileId: input.mainImageFileId || null,
        mainImageUrl: input.media && input.media.length > 0 ? input.media[0].url : 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80',
        isIndexable: input.isIndexable ?? true,
        isFollowable: input.isFollowable ?? true,
        createdByAdminId: 'super-admin-id',
        updatedByAdminId: 'super-admin-id',
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
        categoryAssignments: [
          {
            id: `pca-${Date.now()}`,
            categoryId: input.primaryCategoryId,
            categoryName: 'Primary Category',
            categoryPath: 'Category Path',
            isPrimary: true,
            sortOrder: 1,
          },
        ],
        attributeAssignments: [],
        media: (input.media || []).map((m, idx) => ({
          id: `pm-${Date.now()}-${idx}`,
          fileAssetId: m.fileAssetId,
          url: m.url || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80',
          mediaType: m.mediaType || 'IMAGE',
          sortOrder: idx + 1,
          isPrimary: m.isPrimary ?? (idx === 0),
          altText: m.altText || null,
        })),
        badges: [],
      };

      mockProducts.unshift(mockNewProduct);
      return mockNewProduct;
    }

    const res = await fetch(`${API_BASE}/admin/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to create product');
    }
    const body = await res.json();
    return body.data as ProductDetail;
  },

  async updateProduct(id: string, input: Partial<CreateProductInput>) {
    if (config.useMockApi) {
      const idx = mockProducts.findIndex((p) => p.id === id);
      if (idx === -1) throw new Error('Product not found');

      const existing = mockProducts[idx];
      const { attributeAssignments, additionalCategoryIds, badges, media, ...restInput } = input;

      const updated: ProductDetail = {
        ...existing,
        ...restInput,
        mrp: input.mrp !== undefined ? (input.mrp ? Number(input.mrp).toFixed(2) : null) : existing.mrp,
        sellingPrice: input.sellingPrice !== undefined ? (input.sellingPrice ? Number(input.sellingPrice).toFixed(2) : null) : existing.sellingPrice,
        costPrice: input.costPrice !== undefined ? (input.costPrice ? Number(input.costPrice).toFixed(2) : null) : existing.costPrice,
        weightGrams: input.weightGrams !== undefined ? (input.weightGrams ? Number(input.weightGrams).toFixed(2) : null) : existing.weightGrams,
        lengthCm: input.lengthCm !== undefined ? (input.lengthCm ? Number(input.lengthCm).toFixed(2) : null) : existing.lengthCm,
        widthCm: input.widthCm !== undefined ? (input.widthCm ? Number(input.widthCm).toFixed(2) : null) : existing.widthCm,
        heightCm: input.heightCm !== undefined ? (input.heightCm ? Number(input.heightCm).toFixed(2) : null) : existing.heightCm,
        maximumSameDayDistanceKm: input.maximumSameDayDistanceKm !== undefined ? (input.maximumSameDayDistanceKm ? Number(input.maximumSameDayDistanceKm).toFixed(2) : null) : existing.maximumSameDayDistanceKm,
        updatedAt: new Date().toISOString(),
      };

      mockProducts[idx] = updated;
      return updated;
    }

    const res = await fetch(`${API_BASE}/admin/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to update product');
    }
    const body = await res.json();
    return body.data as ProductDetail;
  },

  async updateStatus(id: string, status: ProductStatus) {
    if (config.useMockApi) {
      const p = mockProducts.find((item) => item.id === id);
      if (!p) throw new Error('Product not found');
      p.status = status;
      p.updatedAt = new Date().toISOString();
      return p;
    }

    const res = await fetch(`${API_BASE}/admin/products/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update product status');
    const body = await res.json();
    return body.data as ProductDetail;
  },

  async updateVisibility(id: string, visibility: ProductVisibility) {
    if (config.useMockApi) {
      const p = mockProducts.find((item) => item.id === id);
      if (!p) throw new Error('Product not found');
      p.visibility = visibility;
      p.updatedAt = new Date().toISOString();
      return p;
    }

    const res = await fetch(`${API_BASE}/admin/products/${id}/visibility`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visibility }),
    });
    if (!res.ok) throw new Error('Failed to update product visibility');
    const body = await res.json();
    return body.data as ProductDetail;
  },

  async duplicateProduct(id: string) {
    if (config.useMockApi) {
      const source = mockProducts.find((p) => p.id === id);
      if (!source) throw new Error('Source product not found');

      const newId = `prod-${Date.now()}`;
      const now = new Date().toISOString();
      const dup: ProductDetail = {
        ...source,
        id: newId,
        title: `${source.title} (Copy)`,
        slug: `${source.slug}-copy-${Date.now()}`,
        status: 'DRAFT',
        visibility: 'HIDDEN',
        sku: null,
        barcode: null,
        createdAt: now,
        updatedAt: now,
      };

      mockProducts.unshift(dup);
      return dup;
    }

    const res = await fetch(`${API_BASE}/admin/products/${id}/duplicate`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to duplicate product');
    const body = await res.json();
    return body.data as ProductDetail;
  },

  async softDeleteProduct(id: string) {
    if (config.useMockApi) {
      const p = mockProducts.find((item) => item.id === id);
      if (!p) throw new Error('Product not found');
      p.deletedAt = new Date().toISOString();
      return true;
    }

    const res = await fetch(`${API_BASE}/admin/products/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete product');
    return true;
  },

  async restoreProduct(id: string) {
    if (config.useMockApi) {
      const p = mockProducts.find((item) => item.id === id);
      if (!p) throw new Error('Product not found');
      p.deletedAt = null;
      p.status = 'INACTIVE';
      return p;
    }

    const res = await fetch(`${API_BASE}/admin/products/${id}/restore`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to restore product');
    const body = await res.json();
    return body.data as ProductDetail;
  },

  previewCombinations(selections: AttributeSelectionInput[], maxLimit = 100) {
    return generateVariationCombinations(selections, maxLimit);
  },
};
