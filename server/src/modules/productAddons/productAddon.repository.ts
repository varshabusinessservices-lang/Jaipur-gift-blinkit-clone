import { prisma } from '../../database/prisma';
import { Prisma } from '@prisma/client';
import { ListProductAddonQuery } from './productAddon.types';

export class ProductAddonRepository {
  /**
   * Find List of Product Add-ons
   */
  async findList(query: ListProductAddonQuery) {
    const {
      page,
      limit,
      search,
      status,
      inputType,
      pricingType,
      assignmentType,
      productId,
      categoryId,
      personalisedOnly,
      stockStatus,
      scheduled,
      includeDeleted,
      sortBy,
      sortOrder,
    } = query;

    const skip = (page - 1) * limit;
    const where: Prisma.ProductAddonWhereInput = {};

    if (!includeDeleted) {
      where.deletedAt = null;
    }

    if (status) {
      where.status = status as any;
    }

    if (inputType) {
      where.inputType = inputType as any;
    }

    if (pricingType) {
      where.pricingType = pricingType as any;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { slug: { contains: search } },
        { code: { contains: search } },
        { customerLabel: { contains: search } },
        { internalLabel: { contains: search } },
      ];
    }

    if (scheduled) {
      where.status = 'SCHEDULED';
    }

    if (stockStatus) {
      if (stockStatus === 'IN_STOCK') {
        where.OR = [
          { manageStock: false },
          { AND: [{ manageStock: true }, { stockQuantity: { gt: 0 } }] },
        ];
      } else if (stockStatus === 'LOW_STOCK') {
        where.manageStock = true;
        where.stockQuantity = { lte: prisma.productAddon.fields.lowStockThreshold || 5, gt: 0 };
      } else if (stockStatus === 'OUT_OF_STOCK') {
        where.manageStock = true;
        where.stockQuantity = { lte: 0 };
      }
    }

    if (assignmentType || productId || categoryId || personalisedOnly) {
      where.assignments = {
        some: {
          ...(assignmentType ? { assignmentType: assignmentType as any } : {}),
          ...(productId ? { productId } : {}),
          ...(categoryId ? { categoryId } : {}),
          ...(personalisedOnly ? { assignmentType: 'ALL_PERSONALISED_PRODUCTS' } : {}),
          status: 'ACTIVE',
        },
      };
    }

    const orderBy: Prisma.ProductAddonOrderByWithRelationInput = {};
    if (sortBy === 'name') orderBy.name = sortOrder;
    else if (sortBy === 'createdAt') orderBy.createdAt = sortOrder;
    else if (sortBy === 'updatedAt') orderBy.updatedAt = sortOrder;
    else if (sortBy === 'fixedPrice') orderBy.fixedPrice = sortOrder;
    else if (sortBy === 'stockQuantity') orderBy.stockQuantity = sortOrder;
    else if (sortBy === 'status') orderBy.status = sortOrder;
    else orderBy.sortOrder = sortOrder;

    const [items, total] = await Promise.all([
      prisma.productAddon.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          taxRate: true,
          options: {
            where: { deletedAt: null },
            orderBy: { sortOrder: 'asc' },
          },
          assignments: {
            where: { status: 'ACTIVE' },
            include: {
              product: { select: { id: true, title: true, slug: true } },
              category: { select: { id: true, name: true, slug: true } },
              variation: { select: { id: true, title: true, sku: true } },
            },
          },
        },
      }),
      prisma.productAddon.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  /**
   * Find Addon By ID
   */
  async findById(id: string, includeDeleted = false) {
    return prisma.productAddon.findFirst({
      where: {
        id,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
      include: {
        taxRate: true,
        options: {
          where: includeDeleted ? {} : { deletedAt: null },
          orderBy: { sortOrder: 'asc' },
        },
        assignments: {
          include: {
            product: { select: { id: true, title: true, slug: true, sku: true } },
            category: { select: { id: true, name: true, slug: true } },
            variation: { select: { id: true, title: true, sku: true } },
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
  }

  /**
   * Find Addon By Slug
   */
  async findBySlug(slug: string) {
    return prisma.productAddon.findUnique({
      where: { slug },
    });
  }

  /**
   * Find Addon By Code
   */
  async findByCode(code: string) {
    if (!code) return null;
    return prisma.productAddon.findFirst({
      where: { code, deletedAt: null },
    });
  }

  /**
   * Create Product Add-on
   */
  async create(data: Prisma.ProductAddonCreateInput) {
    return prisma.productAddon.create({
      data,
      include: {
        taxRate: true,
        options: { orderBy: { sortOrder: 'asc' } },
        assignments: true,
      },
    });
  }

  /**
   * Update Product Add-on
   */
  async update(id: string, data: Prisma.ProductAddonUpdateInput) {
    return prisma.productAddon.update({
      where: { id },
      data,
      include: {
        taxRate: true,
        options: { where: { deletedAt: null }, orderBy: { sortOrder: 'asc' } },
        assignments: true,
      },
    });
  }

  /**
   * Soft Delete Add-on
   */
  async softDelete(id: string) {
    return prisma.productAddon.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: 'INACTIVE',
      },
    });
  }

  /**
   * Restore Add-on
   */
  async restore(id: string) {
    return prisma.productAddon.update({
      where: { id },
      data: {
        deletedAt: null,
        status: 'INACTIVE',
      },
    });
  }

  /**
   * Reorder Bulk Add-ons
   */
  async reorderBulk(items: { id: string; sortOrder: number }[]) {
    return prisma.$transaction(
      items.map((item) =>
        prisma.productAddon.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        })
      )
    );
  }

  /**
   * Options CRUD
   */
  async findOptionById(optionId: string) {
    return prisma.productAddonOption.findUnique({
      where: { id: optionId },
    });
  }

  async createOption(data: Prisma.ProductAddonOptionCreateInput) {
    return prisma.productAddonOption.create({ data });
  }

  async updateOption(optionId: string, data: Prisma.ProductAddonOptionUpdateInput) {
    return prisma.productAddonOption.update({
      where: { id: optionId },
      data,
    });
  }

  async deleteOption(optionId: string) {
    return prisma.productAddonOption.update({
      where: { id: optionId },
      data: { deletedAt: new Date(), status: 'INACTIVE' },
    });
  }

  async restoreOption(optionId: string) {
    return prisma.productAddonOption.update({
      where: { id: optionId },
      data: { deletedAt: null, status: 'ACTIVE' },
    });
  }

  async reorderOptions(items: { id: string; sortOrder: number }[]) {
    return prisma.$transaction(
      items.map((item) =>
        prisma.productAddonOption.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        })
      )
    );
  }

  /**
   * Assignments Replacement / Management
   */
  async updateAssignments(addonId: string, assignments: Prisma.AddonAssignmentCreateManyInput[]) {
    await prisma.addonAssignment.deleteMany({
      where: { addonId },
    });

    if (assignments.length > 0) {
      await prisma.addonAssignment.createMany({
        data: assignments,
      });
    }

    return prisma.addonAssignment.findMany({
      where: { addonId },
      include: {
        product: { select: { id: true, title: true, slug: true } },
        category: { select: { id: true, name: true, slug: true } },
        variation: { select: { id: true, title: true, sku: true } },
      },
    });
  }

  async deleteAssignment(assignmentId: string) {
    return prisma.addonAssignment.delete({
      where: { id: assignmentId },
    });
  }

  /**
   * Effective Product Add-ons Precedence Resolver
   */
  async resolveEffectiveAddons(productId: string, variationId?: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        primaryCategory: true,
        categoryAssignments: { select: { categoryId: true } },
      },
    });

    if (!product || product.deletedAt || product.status === 'ARCHIVED') {
      return [];
    }

    const isPersonalised = product.isPersonalised || product.productType === 'PERSONALISED';

    // Collect category IDs (primary + assigned + parent categories if enabled)
    const categoryIdsSet = new Set<string>();
    categoryIdsSet.add(product.primaryCategoryId);
    product.categoryAssignments.forEach((c) => categoryIdsSet.add(c.categoryId));

    if (process.env.ADDON_CATEGORY_INHERITANCE !== 'false') {
      const allCategories = await prisma.category.findMany({
        where: { deletedAt: null },
        select: { id: true, parentId: true },
      });
      const catMap = new Map(allCategories.map((c) => [c.id, c.parentId]));

      const initialCats = Array.from(categoryIdsSet);
      for (const catId of initialCats) {
        let curr: string | null | undefined = catId;
        while (curr) {
          categoryIdsSet.add(curr);
          curr = catMap.get(curr);
        }
      }
    }

    const categoryIds = Array.from(categoryIdsSet);

    // Fetch all active assignments matching target criteria
    const activeAssignments = await prisma.addonAssignment.findMany({
      where: {
        status: 'ACTIVE',
        addon: {
          status: 'ACTIVE',
          deletedAt: null,
        },
        OR: [
          { assignmentType: 'GLOBAL' },
          ...(isPersonalised ? [{ assignmentType: 'ALL_PERSONALISED_PRODUCTS' as const }] : []),
          ...(categoryIds.length ? [{ assignmentType: 'CATEGORY' as const, categoryId: { in: categoryIds } }] : []),
          { assignmentType: 'PRODUCT' as const, productId },
          ...(variationId ? [{ assignmentType: 'VARIATION' as const, variationId }] : []),
        ],
      },
      include: {
        addon: {
          include: {
            taxRate: true,
            options: {
              where: { status: 'ACTIVE', deletedAt: null },
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    // Precedence hierarchy map
    const precedenceOrder: Record<string, number> = {
      VARIATION: 5,
      PRODUCT: 4,
      CATEGORY: 3,
      ALL_PERSONALISED_PRODUCTS: 2,
      GLOBAL: 1,
    };

    // Group by addon ID and resolve highest precedence assignment
    const addonAssignmentMap = new Map<string, typeof activeAssignments[0]>();

    for (const assign of activeAssignments) {
      const addonId = assign.addonId;
      const existing = addonAssignmentMap.get(addonId);

      if (!existing) {
        addonAssignmentMap.set(addonId, assign);
      } else {
        const currentScore = precedenceOrder[existing.assignmentType] || 0;
        const newScore = precedenceOrder[assign.assignmentType] || 0;
        if (newScore > currentScore) {
          addonAssignmentMap.set(addonId, assign);
        }
      }
    }

    // Build resolved effective add-ons list
    const resolvedList = Array.from(addonAssignmentMap.values()).map((assign) => {
      const addon = assign.addon;
      const effectiveRequired = assign.isRequiredOverride ?? addon.isRequired;
      const effectivePrice = assign.priceOverride ?? addon.fixedPrice;
      const effectivePercentage = assign.percentageOverride ?? addon.percentageRate;

      return {
        id: addon.id,
        name: addon.name,
        slug: addon.slug,
        customerLabel: addon.customerLabel || addon.name,
        shortDescription: addon.shortDescription,
        description: addon.description,
        inputType: addon.inputType,
        pricingType: addon.pricingType,
        fixedPrice: effectivePrice ? String(effectivePrice) : null,
        percentageRate: effectivePercentage ? String(effectivePercentage) : null,
        minimumAmount: addon.minimumAmount ? String(addon.minimumAmount) : null,
        maximumAmount: addon.maximumAmount ? String(addon.maximumAmount) : null,
        defaultAmount: addon.defaultAmount ? String(addon.defaultAmount) : null,
        isRequired: effectiveRequired,
        allowQuantity: addon.allowQuantity,
        minimumQuantity: addon.minimumQuantity,
        maximumQuantity: addon.maximumQuantity,
        defaultQuantity: addon.defaultQuantity,
        placeholder: addon.placeholder,
        helpText: addon.helpText,
        validationJson: addon.validationJson,
        imageFileId: addon.imageFileId,
        taxRate: addon.taxRate
          ? {
              id: addon.taxRate.id,
              name: addon.taxRate.name,
              totalRate: String(addon.taxRate.totalRate),
            }
          : null,
        priceIncludesTax: addon.priceIncludesTax,
        options: addon.options.map((opt) => ({
          id: opt.id,
          name: opt.name,
          code: opt.code,
          description: opt.description,
          pricingType: opt.pricingType || addon.pricingType,
          fixedPrice: opt.fixedPrice ? String(opt.fixedPrice) : null,
          percentageRate: opt.percentageRate ? String(opt.percentageRate) : null,
          isDefault: opt.isDefault,
          imageFileId: opt.imageFileId,
        })),
        assignmentSource: assign.assignmentType,
      };
    });

    return resolvedList;
  }

  /**
   * Helper: Audit Log recorder
   */
  async createAuditLog(data: {
    action: string;
    entityType: string;
    entityId: string;
    actorAdminId?: string;
    oldValuesJson?: string;
    newValuesJson?: string;
    metadataJson?: string;
  }) {
    return prisma.auditLog.create({
      data: {
        actorType: 'ADMIN',
        actorAdminId: data.actorAdminId,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        oldValuesJson: data.oldValuesJson,
        newValuesJson: data.newValuesJson,
        metadataJson: data.metadataJson,
      },
    });
  }
}
