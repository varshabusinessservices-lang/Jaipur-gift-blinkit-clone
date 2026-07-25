import { ProductAddonRepository } from './productAddon.repository';
import { ListProductAddonQuery } from './productAddon.types';
import { Prisma } from '@prisma/client';
const Decimal = Prisma.Decimal;

export class ProductAddonService {
  constructor(private repository: ProductAddonRepository = new ProductAddonRepository()) {}

  async listAddons(query: ListProductAddonQuery) {
    return this.repository.findList(query);
  }

  async getAddonById(id: string, includeDeleted = false) {
    const addon = await this.repository.findById(id, includeDeleted);
    if (!addon) {
      const err = new Error('Product Add-on not found') as any;
      err.code = 'ADDON_NOT_FOUND';
      err.statusCode = 404;
      throw err;
    }
    return addon;
  }

  async createAddon(input: any, adminUserId?: string) {
    // 1. Name & Slug
    if (!input.name || input.name.trim().length < 2) {
      const err = new Error('Name must be at least 2 characters') as any;
      err.code = 'ADDON_INPUT_VALIDATION_INVALID';
      err.statusCode = 400;
      throw err;
    }

    const slug =
      input.slug ||
      input.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

    const existingSlug = await this.repository.findBySlug(slug);
    if (existingSlug) {
      const err = new Error(`Add-on with slug "${slug}" already exists`) as any;
      err.code = 'ADDON_SLUG_EXISTS';
      err.statusCode = 409;
      throw err;
    }

    // 2. Code check
    if (input.code) {
      const existingCode = await this.repository.findByCode(input.code);
      if (existingCode) {
        const err = new Error(`Add-on code "${input.code}" already exists`) as any;
        err.code = 'ADDON_CODE_EXISTS';
        err.statusCode = 409;
        throw err;
      }
    }

    // 3. Pricing Validation
    this.validatePricing(input);

    // 4. Quantity & Stock Validation
    this.validateQuantityAndStock(input);

    // 5. Radio/Dropdown option requirements
    if (['RADIO', 'DROPDOWN'].includes(input.inputType)) {
      if (!input.options || input.options.length === 0) {
        const err = new Error(`${input.inputType} add-ons require at least one option`) as any;
        err.code = 'ADDON_OPTION_REQUIRED';
        err.statusCode = 400;
        throw err;
      }
    }

    // Prepare create payload
    const createData: any = {
      storeId: input.storeId || null,
      name: input.name.trim(),
      slug,
      code: input.code ? input.code.trim().toUpperCase() : null,
      shortDescription: input.shortDescription || null,
      description: input.description || null,
      inputType: input.inputType,
      pricingType: input.pricingType,
      fixedPrice: input.fixedPrice !== undefined && input.fixedPrice !== null ? new Decimal(input.fixedPrice) : null,
      percentageRate: input.percentageRate !== undefined && input.percentageRate !== null ? new Decimal(input.percentageRate) : null,
      minimumAmount: input.minimumAmount !== undefined && input.minimumAmount !== null ? new Decimal(input.minimumAmount) : null,
      maximumAmount: input.maximumAmount !== undefined && input.maximumAmount !== null ? new Decimal(input.maximumAmount) : null,
      defaultAmount: input.defaultAmount !== undefined && input.defaultAmount !== null ? new Decimal(input.defaultAmount) : null,
      taxRateId: input.taxRateId || null,
      priceIncludesTax: input.priceIncludesTax !== false,
      imageFileId: input.imageFileId || null,
      status: input.status || 'ACTIVE',
      isRequired: input.isRequired || false,
      allowQuantity: input.allowQuantity || false,
      minimumQuantity: input.minimumQuantity || 0,
      maximumQuantity: input.maximumQuantity || null,
      defaultQuantity: input.defaultQuantity || null,
      manageStock: input.manageStock || false,
      stockQuantity: input.stockQuantity ?? null,
      reservedStock: input.reservedStock || 0,
      lowStockThreshold: input.lowStockThreshold ?? null,
      allowBackorder: input.allowBackorder || false,
      placeholder: input.placeholder || null,
      helpText: input.helpText || null,
      validationJson: input.validationJson || null,
      customerLabel: input.customerLabel || null,
      internalLabel: input.internalLabel || null,
      sortOrder: input.sortOrder || 0,
      startsAt: input.startsAt ? new Date(input.startsAt) : null,
      endsAt: input.endsAt ? new Date(input.endsAt) : null,
      createdByAdminId: adminUserId || null,
      updatedByAdminId: adminUserId || null,
    };

    if (input.options && input.options.length > 0) {
      createData.options = {
        create: input.options.map((opt: any, idx: number) => ({
          name: opt.name.trim(),
          code: opt.code ? opt.code.trim().toUpperCase() : null,
          description: opt.description || null,
          pricingType: opt.pricingType || input.pricingType,
          fixedPrice: opt.fixedPrice !== undefined && opt.fixedPrice !== null ? new Decimal(opt.fixedPrice) : null,
          percentageRate: opt.percentageRate !== undefined && opt.percentageRate !== null ? new Decimal(opt.percentageRate) : null,
          imageFileId: opt.imageFileId || null,
          isDefault: opt.isDefault || false,
          status: opt.status || 'ACTIVE',
          sortOrder: opt.sortOrder ?? idx,
          metadataJson: opt.metadataJson || null,
        })),
      };
    }

    if (input.assignments && input.assignments.length > 0) {
      createData.assignments = {
        create: input.assignments.map((assign: any, idx: number) => ({
          assignmentType: assign.assignmentType,
          productId: assign.productId || null,
          variationId: assign.variationId || null,
          categoryId: assign.categoryId || null,
          isRequiredOverride: assign.isRequiredOverride ?? null,
          priceOverride: assign.priceOverride !== undefined && assign.priceOverride !== null ? new Decimal(assign.priceOverride) : null,
          percentageOverride: assign.percentageOverride !== undefined && assign.percentageOverride !== null ? new Decimal(assign.percentageOverride) : null,
          sortOrder: assign.sortOrder ?? idx,
          status: assign.status || 'ACTIVE',
        })),
      };
    }

    const created = await this.repository.create(createData);

    await this.repository.createAuditLog({
      action: 'ADDON_CREATED',
      entityType: 'ProductAddon',
      entityId: created.id,
      actorAdminId: adminUserId,
      newValuesJson: JSON.stringify({ id: created.id, name: created.name, inputType: created.inputType }),
    });

    return created;
  }

  async updateAddon(id: string, input: any, adminUserId?: string) {
    const existing = await this.getAddonById(id, true);

    if (input.name && input.name.trim().length < 2) {
      const err = new Error('Name must be at least 2 characters') as any;
      err.code = 'ADDON_INPUT_VALIDATION_INVALID';
      err.statusCode = 400;
      throw err;
    }

    if (input.slug && input.slug !== existing.slug) {
      const slugCheck = await this.repository.findBySlug(input.slug);
      if (slugCheck && slugCheck.id !== id) {
        const err = new Error(`Add-on slug "${input.slug}" already exists`) as any;
        err.code = 'ADDON_SLUG_EXISTS';
        err.statusCode = 409;
        throw err;
      }
    }

    if (input.code && input.code !== existing.code) {
      const codeCheck = await this.repository.findByCode(input.code);
      if (codeCheck && codeCheck.id !== id) {
        const err = new Error(`Add-on code "${input.code}" already exists`) as any;
        err.code = 'ADDON_CODE_EXISTS';
        err.statusCode = 409;
        throw err;
      }
    }

    const merged = { ...existing, ...input };
    this.validatePricing(merged);
    this.validateQuantityAndStock(merged);

    const updateData: any = {
      ...(input.name !== undefined ? { name: input.name.trim() } : {}),
      ...(input.slug !== undefined ? { slug: input.slug } : {}),
      ...(input.code !== undefined ? { code: input.code ? input.code.trim().toUpperCase() : null } : {}),
      ...(input.shortDescription !== undefined ? { shortDescription: input.shortDescription } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.inputType !== undefined ? { inputType: input.inputType } : {}),
      ...(input.pricingType !== undefined ? { pricingType: input.pricingType } : {}),
      ...(input.fixedPrice !== undefined ? { fixedPrice: input.fixedPrice !== null ? new Decimal(input.fixedPrice) : null } : {}),
      ...(input.percentageRate !== undefined ? { percentageRate: input.percentageRate !== null ? new Decimal(input.percentageRate) : null } : {}),
      ...(input.minimumAmount !== undefined ? { minimumAmount: input.minimumAmount !== null ? new Decimal(input.minimumAmount) : null } : {}),
      ...(input.maximumAmount !== undefined ? { maximumAmount: input.maximumAmount !== null ? new Decimal(input.maximumAmount) : null } : {}),
      ...(input.defaultAmount !== undefined ? { defaultAmount: input.defaultAmount !== null ? new Decimal(input.defaultAmount) : null } : {}),
      ...(input.taxRateId !== undefined ? { taxRateId: input.taxRateId } : {}),
      ...(input.priceIncludesTax !== undefined ? { priceIncludesTax: input.priceIncludesTax } : {}),
      ...(input.imageFileId !== undefined ? { imageFileId: input.imageFileId } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.isRequired !== undefined ? { isRequired: input.isRequired } : {}),
      ...(input.allowQuantity !== undefined ? { allowQuantity: input.allowQuantity } : {}),
      ...(input.minimumQuantity !== undefined ? { minimumQuantity: input.minimumQuantity } : {}),
      ...(input.maximumQuantity !== undefined ? { maximumQuantity: input.maximumQuantity } : {}),
      ...(input.defaultQuantity !== undefined ? { defaultQuantity: input.defaultQuantity } : {}),
      ...(input.manageStock !== undefined ? { manageStock: input.manageStock } : {}),
      ...(input.stockQuantity !== undefined ? { stockQuantity: input.stockQuantity } : {}),
      ...(input.reservedStock !== undefined ? { reservedStock: input.reservedStock } : {}),
      ...(input.lowStockThreshold !== undefined ? { lowStockThreshold: input.lowStockThreshold } : {}),
      ...(input.allowBackorder !== undefined ? { allowBackorder: input.allowBackorder } : {}),
      ...(input.placeholder !== undefined ? { placeholder: input.placeholder } : {}),
      ...(input.helpText !== undefined ? { helpText: input.helpText } : {}),
      ...(input.validationJson !== undefined ? { validationJson: input.validationJson } : {}),
      ...(input.customerLabel !== undefined ? { customerLabel: input.customerLabel } : {}),
      ...(input.internalLabel !== undefined ? { internalLabel: input.internalLabel } : {}),
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
      ...(input.startsAt !== undefined ? { startsAt: input.startsAt ? new Date(input.startsAt) : null } : {}),
      ...(input.endsAt !== undefined ? { endsAt: input.endsAt ? new Date(input.endsAt) : null } : {}),
      updatedByAdminId: adminUserId || null,
    };

    const updated = await this.repository.update(id, updateData);

    await this.repository.createAuditLog({
      action: 'ADDON_UPDATED',
      entityType: 'ProductAddon',
      entityId: id,
      actorAdminId: adminUserId,
      oldValuesJson: JSON.stringify({ name: existing.name, status: existing.status }),
      newValuesJson: JSON.stringify({ name: updated.name, status: updated.status }),
    });

    return updated;
  }

  async updateStatus(id: string, status: string, adminUserId?: string) {
    const existing = await this.getAddonById(id, true);
    const updated = await this.repository.update(id, { status: status as any, updatedByAdminId: adminUserId || null });

    await this.repository.createAuditLog({
      action: 'ADDON_STATUS_UPDATED',
      entityType: 'ProductAddon',
      entityId: id,
      actorAdminId: adminUserId,
      oldValuesJson: JSON.stringify({ status: existing.status }),
      newValuesJson: JSON.stringify({ status }),
    });

    return updated;
  }

  async softDeleteAddon(id: string, adminUserId?: string) {
    const existing = await this.getAddonById(id, false);
    const deleted = await this.repository.softDelete(id);

    await this.repository.createAuditLog({
      action: 'ADDON_DELETED',
      entityType: 'ProductAddon',
      entityId: id,
      actorAdminId: adminUserId,
      oldValuesJson: JSON.stringify({ name: existing.name, status: existing.status }),
    });

    return deleted;
  }

  async restoreAddon(id: string, adminUserId?: string) {
    const existing = await this.getAddonById(id, true);
    if (!existing.deletedAt) {
      return existing;
    }

    const restored = await this.repository.restore(id);

    await this.repository.createAuditLog({
      action: 'ADDON_RESTORED',
      entityType: 'ProductAddon',
      entityId: id,
      actorAdminId: adminUserId,
      newValuesJson: JSON.stringify({ name: restored.name, status: restored.status }),
    });

    return restored;
  }

  async duplicateAddon(id: string, adminUserId?: string) {
    const existing = await this.getAddonById(id, false);

    const newName = `${existing.name} (Copy)`;
    const newSlug = `${existing.slug}-copy-${Date.now().toString().slice(-4)}`;

    const createPayload = {
      storeId: existing.storeId,
      name: newName,
      slug: newSlug,
      code: existing.code ? `${existing.code}_COPY` : null,
      shortDescription: existing.shortDescription,
      description: existing.description,
      inputType: existing.inputType,
      pricingType: existing.pricingType,
      fixedPrice: existing.fixedPrice ? Number(existing.fixedPrice) : null,
      percentageRate: existing.percentageRate ? Number(existing.percentageRate) : null,
      minimumAmount: existing.minimumAmount ? Number(existing.minimumAmount) : null,
      maximumAmount: existing.maximumAmount ? Number(existing.maximumAmount) : null,
      defaultAmount: existing.defaultAmount ? Number(existing.defaultAmount) : null,
      taxRateId: existing.taxRateId,
      priceIncludesTax: existing.priceIncludesTax,
      imageFileId: existing.imageFileId,
      status: 'INACTIVE',
      isRequired: existing.isRequired,
      allowQuantity: existing.allowQuantity,
      minimumQuantity: existing.minimumQuantity,
      maximumQuantity: existing.maximumQuantity,
      defaultQuantity: existing.defaultQuantity,
      manageStock: existing.manageStock,
      stockQuantity: existing.stockQuantity,
      reservedStock: 0,
      lowStockThreshold: existing.lowStockThreshold,
      allowBackorder: existing.allowBackorder,
      placeholder: existing.placeholder,
      helpText: existing.helpText,
      validationJson: existing.validationJson,
      customerLabel: existing.customerLabel,
      internalLabel: existing.internalLabel,
      options: existing.options.map((opt) => ({
        name: opt.name,
        code: opt.code ? `${opt.code}_COPY` : null,
        description: opt.description,
        pricingType: opt.pricingType,
        fixedPrice: opt.fixedPrice ? Number(opt.fixedPrice) : null,
        percentageRate: opt.percentageRate ? Number(opt.percentageRate) : null,
        imageFileId: opt.imageFileId,
        isDefault: opt.isDefault,
        status: 'ACTIVE',
        sortOrder: opt.sortOrder,
      })),
      assignments: existing.assignments.map((assign) => ({
        assignmentType: assign.assignmentType,
        productId: assign.productId,
        variationId: assign.variationId,
        categoryId: assign.categoryId,
        isRequiredOverride: assign.isRequiredOverride,
        priceOverride: assign.priceOverride ? Number(assign.priceOverride) : null,
        percentageOverride: assign.percentageOverride ? Number(assign.percentageOverride) : null,
        sortOrder: assign.sortOrder,
        status: assign.status,
      })),
    };

    return this.createAddon(createPayload, adminUserId);
  }

  /**
   * Validation Helper Methods
   */
  private validatePricing(input: any) {
    const pricingType = input.pricingType;

    if (pricingType === 'FREE') {
      if (input.fixedPrice && Number(input.fixedPrice) !== 0) {
        const err = new Error('Free add-on cannot have non-zero fixed price') as any;
        err.code = 'ADDON_PRICING_INVALID';
        err.statusCode = 400;
        throw err;
      }
    } else if (pricingType === 'FIXED' || pricingType === 'PER_QUANTITY') {
      if (input.fixedPrice === undefined || input.fixedPrice === null || Number(input.fixedPrice) < 0) {
        const err = new Error('Fixed price is required and must be non-negative') as any;
        err.code = 'ADDON_PRICING_INVALID';
        err.statusCode = 400;
        throw err;
      }
    } else if (pricingType === 'PERCENTAGE') {
      const rate = Number(input.percentageRate);
      if (!input.percentageRate || isNaN(rate) || rate <= 0 || rate > 100) {
        const err = new Error('Percentage rate must be greater than 0 and at most 100') as any;
        err.code = 'ADDON_PERCENTAGE_INVALID';
        err.statusCode = 400;
        throw err;
      }
    } else if (pricingType === 'CUSTOM_AMOUNT') {
      if (input.minimumAmount === undefined || input.minimumAmount === null || Number(input.minimumAmount) < 0) {
        const err = new Error('Minimum amount is required for custom amount add-ons') as any;
        err.code = 'ADDON_CUSTOM_AMOUNT_INVALID';
        err.statusCode = 400;
        throw err;
      }
      if (input.maximumAmount !== undefined && input.maximumAmount !== null) {
        if (Number(input.maximumAmount) < Number(input.minimumAmount)) {
          const err = new Error('Maximum amount cannot be less than minimum amount') as any;
          err.code = 'ADDON_CUSTOM_AMOUNT_INVALID';
          err.statusCode = 400;
          throw err;
        }
      }
    }
  }

  private validateQuantityAndStock(input: any) {
    if (input.minimumQuantity !== undefined && input.minimumQuantity < 0) {
      const err = new Error('Minimum quantity cannot be negative') as any;
      err.code = 'ADDON_QUANTITY_INVALID';
      err.statusCode = 400;
      throw err;
    }

    if (input.maximumQuantity !== undefined && input.maximumQuantity !== null) {
      if (input.maximumQuantity < (input.minimumQuantity || 0)) {
        const err = new Error('Maximum quantity cannot be less than minimum quantity') as any;
        err.code = 'ADDON_QUANTITY_INVALID';
        err.statusCode = 400;
        throw err;
      }
    }

    if (input.manageStock) {
      if (input.stockQuantity !== undefined && input.stockQuantity < 0) {
        const err = new Error('Stock quantity cannot be negative') as any;
        err.code = 'ADDON_STOCK_INVALID';
        err.statusCode = 400;
        throw err;
      }
    }
  }
}
