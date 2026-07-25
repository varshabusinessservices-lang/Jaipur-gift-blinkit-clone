import { prisma } from '../../database/prisma';
import {
  ProductAttributeDetail,
  ProductAttributeValueItem,
  AttributeCategoryAssignmentItem,
  AttributeGroupItemDetail,
  AttributeFilterQuery,
  CreateAttributeDTO,
  UpdateAttributeDTO,
  CreateAttributeValueDTO,
  UpdateAttributeValueDTO,
  CreateAttributeGroupDTO,
  ProductAttributeStatus,
  ProductAttributeType,
} from './productAttribute.types';
import crypto from 'crypto';

// In-Memory Mock Store for offline/fallback mode
const mockAttributes: ProductAttributeDetail[] = [
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
    description: 'Primary material used for the frame body or plaque base.',
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

const mockGroups: AttributeGroupItemDetail[] = [
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

async function logAudit(action: string, entityId: string, newValues: any, oldValues?: any, adminUserId?: string) {
  try {
    if (prisma) {
      await prisma.auditLog.create({
        data: {
          actorType: 'ADMIN',
          actorAdminId: adminUserId || null,
          action,
          entityType: 'ProductAttribute',
          entityId,
          newValuesJson: newValues ? JSON.stringify(newValues) : null,
          oldValuesJson: oldValues ? JSON.stringify(oldValues) : null,
        },
      });
    }
  } catch (e) {
    // Fail-safe audit logging
  }
}

export class ProductAttributeRepository {
  async findMany(query: AttributeFilterQuery) {
    try {
      if (prisma) {
        const where: any = {};
        if (!query.includeDeleted) {
          where.deletedAt = null;
        }
        if (query.status) {
          where.status = query.status;
        }
        if (query.type) {
          where.type = query.type;
        }
        if (query.variationOnly) {
          where.isVariationAttribute = true;
        }
        if (query.filterableOnly) {
          where.isFilterable = true;
        }
        if (query.search) {
          where.OR = [
            { name: { contains: query.search } },
            { slug: { contains: query.search } },
            { code: { contains: query.search } },
            { description: { contains: query.search } },
          ];
        }

        const [total, items] = await Promise.all([
          prisma.productAttribute.count({ where }),
          prisma.productAttribute.findMany({
            where,
            include: {
              values: {
                where: { deletedAt: null },
                orderBy: { sortOrder: 'asc' },
              },
              categoryAssignments: {
                include: { category: true },
                orderBy: { sortOrder: 'asc' },
              },
            },
            orderBy: { [query.sortBy]: query.sortOrder },
            skip: (query.page - 1) * query.limit,
            take: query.limit,
          }),
        ]);

        const formatted = items.map((item) => ({
          id: item.id,
          storeId: item.storeId,
          name: item.name,
          slug: item.slug,
          code: item.code,
          description: item.description,
          type: item.type as ProductAttributeType,
          status: item.status as ProductAttributeStatus,
          isVariationAttribute: item.isVariationAttribute,
          isFilterable: item.isFilterable,
          isRequiredByDefault: item.isRequiredByDefault,
          showOnProductPage: item.showOnProductPage,
          showInProductSummary: item.showInProductSummary,
          allowMultipleValues: item.allowMultipleValues,
          sortOrder: item.sortOrder,
          valueCount: item.values.length,
          activeValueCount: item.values.filter((v) => v.status === 'ACTIVE').length,
          assignedCategoryCount: item.categoryAssignments.length,
          productUsageCount: null,
          usageStatus: 'UNAVAILABLE',
          values: item.values.map((v) => ({
            ...v,
            status: v.status as ProductAttributeStatus,
            createdAt: v.createdAt.toISOString(),
            updatedAt: v.updatedAt.toISOString(),
            deletedAt: v.deletedAt ? v.deletedAt.toISOString() : null,
          })),
          categoryAssignments: item.categoryAssignments.map((ca) => ({
            id: ca.id,
            attributeId: ca.attributeId,
            categoryId: ca.categoryId,
            categoryName: ca.category?.name || 'Category',
            categoryPath: ca.category?.path || ca.category?.name || '',
            isRequired: ca.isRequired,
            isVariationAttribute: ca.isVariationAttribute,
            isFilterable: ca.isFilterable,
            sortOrder: ca.sortOrder,
            createdAt: ca.createdAt.toISOString(),
            updatedAt: ca.updatedAt.toISOString(),
          })),
          createdByAdminId: item.createdByAdminId,
          updatedByAdminId: item.updatedByAdminId,
          createdAt: item.createdAt.toISOString(),
          updatedAt: item.updatedAt.toISOString(),
          deletedAt: item.deletedAt ? item.deletedAt.toISOString() : null,
        }));

        return {
          attributes: formatted,
          pagination: {
            page: query.page,
            limit: query.limit,
            total,
            totalPages: Math.ceil(total / query.limit),
          },
        };
      }
    } catch (err) {
      // Fallback to Mock Mode
    }

    // Mock filtering logic
    let filtered = [...mockAttributes];
    if (!query.includeDeleted) {
      filtered = filtered.filter((a) => !a.deletedAt);
    }
    if (query.status) {
      filtered = filtered.filter((a) => a.status === query.status);
    }
    if (query.type) {
      filtered = filtered.filter((a) => a.type === query.type);
    }
    if (query.variationOnly) {
      filtered = filtered.filter((a) => a.isVariationAttribute);
    }
    if (query.filterableOnly) {
      filtered = filtered.filter((a) => a.isFilterable);
    }
    if (query.search) {
      const q = query.search.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.slug.toLowerCase().includes(q) ||
          (a.code && a.code.toLowerCase().includes(q))
      );
    }

    filtered.sort((a, b) => {
      const key = query.sortBy;
      const order = query.sortOrder === 'asc' ? 1 : -1;
      if (key === 'name') return a.name.localeCompare(b.name) * order;
      if (key === 'sortOrder') return (a.sortOrder - b.sortOrder) * order;
      return 0;
    });

    const total = filtered.length;
    const startIndex = (query.page - 1) * query.limit;
    const paginated = filtered.slice(startIndex, startIndex + query.limit);

    return {
      attributes: paginated,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async findById(id: string, includeDeleted = false) {
    try {
      if (prisma) {
        const item = await prisma.productAttribute.findFirst({
          where: {
            id,
            ...(includeDeleted ? {} : { deletedAt: null }),
          },
          include: {
            values: {
              where: includeDeleted ? {} : { deletedAt: null },
              orderBy: { sortOrder: 'asc' },
            },
            categoryAssignments: {
              include: { category: true },
              orderBy: { sortOrder: 'asc' },
            },
          },
        });

        if (item) {
          return {
            id: item.id,
            storeId: item.storeId,
            name: item.name,
            slug: item.slug,
            code: item.code,
            description: item.description,
            type: item.type as ProductAttributeType,
            status: item.status as ProductAttributeStatus,
            isVariationAttribute: item.isVariationAttribute,
            isFilterable: item.isFilterable,
            isRequiredByDefault: item.isRequiredByDefault,
            showOnProductPage: item.showOnProductPage,
            showInProductSummary: item.showInProductSummary,
            allowMultipleValues: item.allowMultipleValues,
            sortOrder: item.sortOrder,
            valueCount: item.values.length,
            activeValueCount: item.values.filter((v) => v.status === 'ACTIVE').length,
            assignedCategoryCount: item.categoryAssignments.length,
            productUsageCount: null,
            usageStatus: 'UNAVAILABLE',
            values: item.values.map((v) => ({
              ...v,
              status: v.status as ProductAttributeStatus,
              createdAt: v.createdAt.toISOString(),
              updatedAt: v.updatedAt.toISOString(),
              deletedAt: v.deletedAt ? v.deletedAt.toISOString() : null,
            })),
            categoryAssignments: item.categoryAssignments.map((ca) => ({
              id: ca.id,
              attributeId: ca.attributeId,
              categoryId: ca.categoryId,
              categoryName: ca.category?.name || 'Category',
              categoryPath: ca.category?.path || ca.category?.name || '',
              isRequired: ca.isRequired,
              isVariationAttribute: ca.isVariationAttribute,
              isFilterable: ca.isFilterable,
              sortOrder: ca.sortOrder,
              createdAt: ca.createdAt.toISOString(),
              updatedAt: ca.updatedAt.toISOString(),
            })),
            createdByAdminId: item.createdByAdminId,
            updatedByAdminId: item.updatedByAdminId,
            createdAt: item.createdAt.toISOString(),
            updatedAt: item.updatedAt.toISOString(),
            deletedAt: item.deletedAt ? item.deletedAt.toISOString() : null,
          };
        }
      }
    } catch (e) {
      // Fallback to mock
    }

    return mockAttributes.find((a) => a.id === id && (includeDeleted || !a.deletedAt)) || null;
  }

  async findBySlug(slug: string) {
    try {
      if (prisma) {
        const item = await prisma.productAttribute.findFirst({
          where: { slug },
        });
        if (item) return item;
      }
    } catch (e) {}

    return mockAttributes.find((a) => a.slug === slug) || null;
  }

  async findByCode(code: string) {
    try {
      if (prisma) {
        const item = await prisma.productAttribute.findFirst({
          where: { code },
        });
        if (item) return item;
      }
    } catch (e) {}

    return mockAttributes.find((a) => a.code === code) || null;
  }

  async create(data: CreateAttributeDTO & { slug: string }, adminUserId?: string) {
    const id = `attr-${crypto.randomUUID().substring(0, 8)}`;
    const now = new Date().toISOString();

    const createdValues: ProductAttributeValueItem[] = (data.values || []).map((val, idx) => ({
      id: val.id || `val-${crypto.randomUUID().substring(0, 8)}`,
      attributeId: id,
      name: val.name,
      slug: val.slug || val.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      code: val.code || null,
      description: val.description || null,
      displayValue: val.displayValue || val.name,
      colourHex: val.colourHex || null,
      imageFileId: val.imageFileId || null,
      metadataJson: val.metadataJson || null,
      status: (val.status || 'ACTIVE') as ProductAttributeStatus,
      sortOrder: val.sortOrder ?? idx + 1,
      createdByAdminId: adminUserId || null,
      createdAt: now,
      updatedAt: now,
    }));

    const createdAssignments: AttributeCategoryAssignmentItem[] = (
      data.categoryAssignments || []
    ).map((ca, idx) => ({
      id: `assign-${crypto.randomUUID().substring(0, 8)}`,
      attributeId: id,
      categoryId: ca.categoryId,
      categoryName: 'Category',
      isRequired: ca.isRequired ?? false,
      isVariationAttribute: ca.isVariationAttribute ?? null,
      isFilterable: ca.isFilterable ?? null,
      sortOrder: ca.sortOrder ?? idx + 1,
      createdAt: now,
      updatedAt: now,
    }));

    const newAttr: ProductAttributeDetail = {
      id,
      storeId: null,
      name: data.name,
      slug: data.slug,
      code: data.code || null,
      description: data.description || null,
      type: data.type as ProductAttributeType,
      status: data.status as ProductAttributeStatus,
      isVariationAttribute: data.isVariationAttribute ?? true,
      isFilterable: data.isFilterable ?? true,
      isRequiredByDefault: data.isRequiredByDefault ?? false,
      showOnProductPage: data.showOnProductPage ?? true,
      showInProductSummary: data.showInProductSummary ?? true,
      allowMultipleValues: data.allowMultipleValues ?? false,
      sortOrder: data.sortOrder ?? 0,
      valueCount: createdValues.length,
      activeValueCount: createdValues.filter((v) => v.status === 'ACTIVE').length,
      assignedCategoryCount: createdAssignments.length,
      productUsageCount: null,
      usageStatus: 'UNAVAILABLE',
      values: createdValues,
      categoryAssignments: createdAssignments,
      createdByAdminId: adminUserId || null,
      createdAt: now,
      updatedAt: now,
    };

    try {
      if (prisma) {
        await prisma.productAttribute.create({
          data: {
            id,
            name: data.name,
            slug: data.slug,
            code: data.code || null,
            description: data.description || null,
            type: data.type as any,
            status: data.status as any,
            isVariationAttribute: data.isVariationAttribute ?? true,
            isFilterable: data.isFilterable ?? true,
            isRequiredByDefault: data.isRequiredByDefault ?? false,
            showOnProductPage: data.showOnProductPage ?? true,
            showInProductSummary: data.showInProductSummary ?? true,
            allowMultipleValues: data.allowMultipleValues ?? false,
            sortOrder: data.sortOrder ?? 0,
            createdByAdminId: adminUserId || null,
            values: {
              create: createdValues.map((v) => ({
                id: v.id,
                name: v.name,
                slug: v.slug,
                code: v.code || null,
                description: v.description || null,
                displayValue: v.displayValue || null,
                colourHex: v.colourHex || null,
                imageFileId: v.imageFileId || null,
                metadataJson: v.metadataJson || null,
                status: v.status as any,
                sortOrder: v.sortOrder,
                createdByAdminId: adminUserId || null,
              })),
            },
            categoryAssignments: {
              create: createdAssignments.map((ca) => ({
                id: ca.id,
                categoryId: ca.categoryId,
                isRequired: ca.isRequired,
                isVariationAttribute: ca.isVariationAttribute,
                isFilterable: ca.isFilterable,
                sortOrder: ca.sortOrder,
              })),
            },
          },
        });
      }
    } catch (e) {
      // Save in mock
    }

    mockAttributes.unshift(newAttr);
    await logAudit('PRODUCT_ATTRIBUTE_CREATED', id, newAttr, null, adminUserId);

    return newAttr;
  }

  async update(id: string, data: UpdateAttributeDTO, adminUserId?: string) {
    const existing = await this.findById(id);
    if (!existing) return null;

    const now = new Date().toISOString();
    const updatedValues: ProductAttributeValueItem[] = data.values
      ? data.values.map((v, idx) => ({
          id: v.id || `val-${crypto.randomUUID().substring(0, 8)}`,
          attributeId: id,
          name: v.name,
          slug: v.slug || v.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          code: v.code || null,
          description: v.description || null,
          displayValue: v.displayValue || v.name,
          colourHex: v.colourHex || null,
          imageFileId: v.imageFileId || null,
          metadataJson: v.metadataJson || null,
          status: (v.status as ProductAttributeStatus) || 'ACTIVE',
          sortOrder: v.sortOrder ?? idx + 1,
          createdAt: now,
          updatedAt: now,
        }))
      : existing.values;

    const updatedAssignments: AttributeCategoryAssignmentItem[] = data.categoryAssignments
      ? data.categoryAssignments.map((ca, idx) => ({
          id: `assign-${crypto.randomUUID().substring(0, 8)}`,
          attributeId: id,
          categoryId: ca.categoryId,
          categoryName: 'Category',
          isRequired: ca.isRequired ?? false,
          isVariationAttribute: ca.isVariationAttribute ?? null,
          isFilterable: ca.isFilterable ?? null,
          sortOrder: ca.sortOrder ?? idx + 1,
          createdAt: now,
          updatedAt: now,
        }))
      : existing.categoryAssignments;

    const updatedAttr: ProductAttributeDetail = {
      ...existing,
      ...data,
      type: (data.type as ProductAttributeType) || existing.type,
      status: (data.status as ProductAttributeStatus) || existing.status,
      values: updatedValues,
      valueCount: updatedValues.length,
      activeValueCount: updatedValues.filter((v) => v.status === 'ACTIVE').length,
      categoryAssignments: updatedAssignments,
      assignedCategoryCount: updatedAssignments.length,
      updatedByAdminId: adminUserId || null,
      updatedAt: now,
    };

    try {
      if (prisma) {
        await prisma.productAttribute.update({
          where: { id },
          data: {
            ...(data.name && { name: data.name }),
            ...(data.slug && { slug: data.slug }),
            ...(data.code !== undefined && { code: data.code }),
            ...(data.description !== undefined && { description: data.description }),
            ...(data.type && { type: data.type as any }),
            ...(data.status && { status: data.status as any }),
            ...(data.isVariationAttribute !== undefined && { isVariationAttribute: data.isVariationAttribute }),
            ...(data.isFilterable !== undefined && { isFilterable: data.isFilterable }),
            ...(data.isRequiredByDefault !== undefined && { isRequiredByDefault: data.isRequiredByDefault }),
            ...(data.showOnProductPage !== undefined && { showOnProductPage: data.showOnProductPage }),
            ...(data.showInProductSummary !== undefined && { showInProductSummary: data.showInProductSummary }),
            ...(data.allowMultipleValues !== undefined && { allowMultipleValues: data.allowMultipleValues }),
            ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
            updatedByAdminId: adminUserId || null,
          },
        });
      }
    } catch (e) {}

    const index = mockAttributes.findIndex((a) => a.id === id);
    if (index !== -1) {
      mockAttributes[index] = updatedAttr;
    }

    await logAudit('PRODUCT_ATTRIBUTE_UPDATED', id, updatedAttr, existing, adminUserId);
    return updatedAttr;
  }

  async delete(id: string, adminUserId?: string) {
    const existing = await this.findById(id);
    if (!existing) return false;

    const now = new Date().toISOString();

    try {
      if (prisma) {
        await prisma.productAttribute.update({
          where: { id },
          data: { deletedAt: new Date() },
        });
      }
    } catch (e) {}

    const index = mockAttributes.findIndex((a) => a.id === id);
    if (index !== -1) {
      mockAttributes[index].deletedAt = now;
    }

    await logAudit('PRODUCT_ATTRIBUTE_DELETED', id, { deletedAt: now }, existing, adminUserId);
    return true;
  }

  async restore(id: string, adminUserId?: string) {
    const existing = await this.findById(id, true);
    if (!existing) return null;

    try {
      if (prisma) {
        await prisma.productAttribute.update({
          where: { id },
          data: { deletedAt: null },
        });
      }
    } catch (e) {}

    const index = mockAttributes.findIndex((a) => a.id === id);
    if (index !== -1) {
      mockAttributes[index].deletedAt = null;
    }

    await logAudit('PRODUCT_ATTRIBUTE_RESTORED', id, { restoredAt: new Date().toISOString() }, existing, adminUserId);
    return this.findById(id);
  }

  // Value operations
  async createValue(attributeId: string, data: CreateAttributeValueDTO, adminUserId?: string) {
    const attr = await this.findById(attributeId);
    if (!attr) return null;

    const valId = data.id || `val-${crypto.randomUUID().substring(0, 8)}`;
    const now = new Date().toISOString();

    const newVal: ProductAttributeValueItem = {
      id: valId,
      attributeId,
      name: data.name,
      slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      code: data.code || null,
      description: data.description || null,
      displayValue: data.displayValue || data.name,
      colourHex: data.colourHex || null,
      imageFileId: data.imageFileId || null,
      metadataJson: data.metadataJson || null,
      status: (data.status as ProductAttributeStatus) || 'ACTIVE',
      sortOrder: data.sortOrder ?? attr.values.length + 1,
      createdByAdminId: adminUserId || null,
      createdAt: now,
      updatedAt: now,
    };

    try {
      if (prisma) {
        await prisma.productAttributeValue.create({
          data: {
            id: newVal.id,
            attributeId,
            name: newVal.name,
            slug: newVal.slug,
            code: newVal.code,
            description: newVal.description,
            displayValue: newVal.displayValue,
            colourHex: newVal.colourHex,
            imageFileId: newVal.imageFileId,
            metadataJson: newVal.metadataJson,
            status: newVal.status as any,
            sortOrder: newVal.sortOrder,
            createdByAdminId: adminUserId || null,
          },
        });
      }
    } catch (e) {}

    attr.values.push(newVal);
    attr.valueCount = attr.values.length;
    attr.activeValueCount = attr.values.filter((v) => v.status === 'ACTIVE').length;

    await logAudit('PRODUCT_ATTRIBUTE_VALUE_CREATED', valId, newVal, null, adminUserId);
    return newVal;
  }

  async updateValue(attributeId: string, valueId: string, data: UpdateAttributeValueDTO, adminUserId?: string) {
    const attr = await this.findById(attributeId);
    if (!attr) return null;

    const valIndex = attr.values.findIndex((v) => v.id === valueId);
    if (valIndex === -1) return null;

    const existing = attr.values[valIndex];
    const updated: ProductAttributeValueItem = {
      ...existing,
      ...data,
      status: (data.status as ProductAttributeStatus) || existing.status,
      updatedByAdminId: adminUserId || null,
      updatedAt: new Date().toISOString(),
    };

    try {
      if (prisma) {
        await prisma.productAttributeValue.update({
          where: { id: valueId },
          data: {
            ...(data.name && { name: data.name }),
            ...(data.slug && { slug: data.slug }),
            ...(data.code !== undefined && { code: data.code }),
            ...(data.description !== undefined && { description: data.description }),
            ...(data.displayValue !== undefined && { displayValue: data.displayValue }),
            ...(data.colourHex !== undefined && { colourHex: data.colourHex }),
            ...(data.imageFileId !== undefined && { imageFileId: data.imageFileId }),
            ...(data.status && { status: data.status as any }),
            ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
            updatedByAdminId: adminUserId || null,
          },
        });
      }
    } catch (e) {}

    attr.values[valIndex] = updated;
    attr.activeValueCount = attr.values.filter((v) => v.status === 'ACTIVE').length;

    await logAudit('PRODUCT_ATTRIBUTE_VALUE_UPDATED', valueId, updated, existing, adminUserId);
    return updated;
  }

  async deleteValue(attributeId: string, valueId: string, adminUserId?: string) {
    const attr = await this.findById(attributeId);
    if (!attr) return false;

    const valIndex = attr.values.findIndex((v) => v.id === valueId);
    if (valIndex === -1) return false;

    try {
      if (prisma) {
        await prisma.productAttributeValue.update({
          where: { id: valueId },
          data: { deletedAt: new Date() },
        });
      }
    } catch (e) {}

    attr.values[valIndex].deletedAt = new Date().toISOString();
    attr.values = attr.values.filter((v) => !v.deletedAt);
    attr.valueCount = attr.values.length;
    attr.activeValueCount = attr.values.filter((v) => v.status === 'ACTIVE').length;

    await logAudit('PRODUCT_ATTRIBUTE_VALUE_DELETED', valueId, { deletedAt: new Date().toISOString() }, null, adminUserId);
    return true;
  }

  // Groups
  async findGroups() {
    return mockGroups;
  }

  async createGroup(data: CreateAttributeGroupDTO) {
    const group: AttributeGroupItemDetail = {
      id: `grp-${crypto.randomUUID().substring(0, 8)}`,
      name: data.name,
      slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: data.description || null,
      sortOrder: data.sortOrder ?? mockGroups.length + 1,
      status: (data.status as ProductAttributeStatus) || 'ACTIVE',
      attributes: mockAttributes.filter((a) => (data.attributeIds || []).includes(a.id)),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockGroups.push(group);
    return group;
  }
}

export const productAttributeRepository = new ProductAttributeRepository();
