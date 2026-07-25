import { ProductVariationRepository } from './productVariation.repository';
import {
  VariationFilterQuery,
  GeneratePreviewInput,
  GenerateVariationsInput,
  CreateVariationInput,
  UpdateVariationInput,
  BulkUpdateVariationsInput,
} from './productVariation.types';
import { generateVariationCombinations, buildCombinationKey } from '../../utils/variationCombinator';
import { prisma } from '../../database/prisma';

export class ProductVariationService {
  private repo = new ProductVariationRepository();

  /**
   * Helper to write audit logs
   */
  private async createAuditLog(
    action: string,
    entityId: string,
    actorAdminId?: string,
    oldValues?: any,
    newValues?: any
  ) {
    try {
      await prisma.auditLog.create({
        data: {
          actorType: 'ADMIN',
          actorAdminId: actorAdminId || null,
          action,
          entityType: 'ProductVariation',
          entityId,
          oldValuesJson: oldValues ? JSON.stringify(oldValues) : null,
          newValuesJson: newValues ? JSON.stringify(newValues) : null,
        },
      });
    } catch {
      // Audit log fail silent
    }
  }

  /**
   * Generate Combination Preview
   */
  async generatePreview(productId: string, input: GeneratePreviewInput) {
    const product = await this.repo.findProductForVariations(productId);
    if (!product) {
      throw new Error('PRODUCT_NOT_FOUND');
    }

    if (product.productType !== 'VARIABLE') {
      throw new Error('PRODUCT_NOT_VARIABLE');
    }

    // Filter product attribute assignments for variation attributes
    const assignedVariationAttrs = (product.attributeAssignments || []).filter(
      (pa: any) => pa.isVariationAttribute || pa.attribute?.isVariationAttribute
    );

    if (assignedVariationAttrs.length === 0) {
      throw new Error('PRODUCT_VARIATION_ATTRIBUTE_MISSING');
    }

    // Build selections input for combinator
    const selections = assignedVariationAttrs.map((pa: any) => {
      const attrId = pa.attributeId;
      const attrName = pa.attribute?.name || attrId;

      // Filter values selected by input
      const values = (pa.valueAssignments || [])
        .map((va: any) => va.attributeValue)
        .filter((v: any) => v && (input.selectedAttributeValueIds.length === 0 || input.selectedAttributeValueIds.includes(v.id)))
        .map((v: any) => ({
          id: v.id,
          name: v.name,
          status: v.status || 'ACTIVE',
        }));

      return {
        attributeId: attrId,
        attributeName: attrName,
        values,
      };
    });

    const maxLimit = Number(process.env.PRODUCT_MAX_VARIATION_COMBINATIONS || 100);
    const result = generateVariationCombinations(selections, maxLimit);

    if (result.exceededLimit) {
      throw new Error('VARIATION_COMBINATION_LIMIT_EXCEEDED');
    }

    // Enrich combinations with existence and eligibility checks
    const previewItems = await Promise.all(
      result.combinations.map(async (combo) => {
        const existing = await this.repo.findVariationByCombinationKey(productId, combo.combinationKey);
        const isDisabled = (input.disabledCombinations || []).includes(combo.combinationKey);

        const warnings: string[] = [];
        if (existing) {
          warnings.push('Combination already exists for this product');
        }
        if (isDisabled) {
          warnings.push('Disabled by user');
        }

        return {
          combinationKey: combo.combinationKey,
          label: combo.label,
          attributeValues: combo.attributeValues,
          exists: !!existing,
          eligible: !existing && !isDisabled,
          warnings,
        };
      })
    );

    return {
      productId,
      totalCombinations: result.totalCombinations,
      maxLimit,
      combinations: previewItems,
    };
  }

  /**
   * Save Generated Variations
   */
  async generateVariations(productId: string, input: GenerateVariationsInput, adminUserId?: string) {
    const product = await this.repo.findProductForVariations(productId);
    if (!product) throw new Error('PRODUCT_NOT_FOUND');
    if (product.productType !== 'VARIABLE') throw new Error('PRODUCT_NOT_VARIABLE');

    const maxLimit = Number(process.env.PRODUCT_MAX_VARIATION_COMBINATIONS || 100);
    if (input.combinations.length > maxLimit) {
      throw new Error('VARIATION_COMBINATION_LIMIT_EXCEEDED');
    }

    const created: any[] = [];
    const skipped: any[] = [];
    const rejected: any[] = [];
    const errors: string[] = [];

    const autoSkuEnabled = input.baseDefaults?.autoSku ?? process.env.PRODUCT_VARIATION_AUTO_SKU !== 'false';
    const baseSku =
      input.baseDefaults?.skuPrefix ||
      product.sku ||
      product.title.toUpperCase().slice(0, 10).replace(/[^A-Z0-9]/g, '');

    for (let i = 0; i < input.combinations.length; i++) {
      const item = input.combinations[i];
      const key = buildCombinationKey(item.attributeValues);

      // Check if combination exists
      const existing = await this.repo.findVariationByCombinationKey(productId, key);
      if (existing) {
        if (input.skipExisting) {
          skipped.push({ combinationKey: key, title: item.title || key, existingId: existing.id });
          continue;
        } else {
          rejected.push({ combinationKey: key, reason: 'Duplicate combination' });
          continue;
        }
      }

      // Generate title if not provided
      let title = item.title;
      if (!title) {
        title = item.attributeValues.map((av) => av.attributeValueId).join(' / ');
      }

      // Generate SKU if autoSku enabled
      let sku = item.sku;
      if (!sku && autoSkuEnabled) {
        const valCodes = item.attributeValues.map((av) => {
          const assignment = product.attributeAssignments?.find((a: any) => a.attributeId === av.attributeId);
          const valAss = assignment?.valueAssignments?.find((va: any) => va.attributeValueId === av.attributeValueId);
          const code = valAss?.attributeValue?.code;
          if (code) return code.toUpperCase();
          return av.attributeValueId.toUpperCase().slice(4);
        }).join('-');
        sku = `${baseSku}-${valCodes}`;
      }

      // Validate SKU uniqueness
      if (sku) {
        const skuExists = await this.repo.findVariationBySku(sku);
        if (skuExists) {
          sku = `${sku}-${i + 1}`;
        }
      }

      try {
        const createdVar = await this.repo.createVariation(
          productId,
          {
            combinationKey: key,
            title,
            sku,
            barcode: item.barcode || null,
            status: item.status || input.baseDefaults?.status || (input.activateNew ? 'ACTIVE' : 'INACTIVE'),
            isDefault: false,
            manageStock: true,
            reservedStock: 0,
            allowBackorder: false,
            sortOrder: i,
            mrp: item.mrp ?? input.baseDefaults?.mrp ?? null,
            sellingPrice: item.sellingPrice ?? input.baseDefaults?.sellingPrice ?? null,
            costPrice: item.costPrice ?? input.baseDefaults?.costPrice ?? null,
            stockQuantity: item.stockQuantity ?? input.baseDefaults?.stockQuantity ?? null,
            lowStockThreshold: input.baseDefaults?.lowStockThreshold ?? null,
            preparationTimeMinutes: input.baseDefaults?.preparationTimeMinutes ?? null,
            sameDayEligible: input.baseDefaults?.sameDayEligible ?? null,
            attributeValues: item.attributeValues,
          },
          adminUserId
        );

        await this.createAuditLog('VARIATION_GENERATED', createdVar.id, adminUserId, null, createdVar);
        created.push(createdVar);
      } catch (err: any) {
        errors.push(`Failed to create variation ${key}: ${err.message}`);
        rejected.push({ combinationKey: key, reason: err.message });
      }
    }

    return {
      createdCount: created.length,
      skippedCount: skipped.length,
      rejectedCount: rejected.length,
      created,
      skipped,
      rejected,
      errors,
    };
  }

  /**
   * List variations
   */
  async listVariations(productId: string, filter: VariationFilterQuery) {
    const product = await this.repo.findProductForVariations(productId);
    if (!product) throw new Error('PRODUCT_NOT_FOUND');
    if (product.productType !== 'VARIABLE') throw new Error('PRODUCT_NOT_VARIABLE');

    return this.repo.findVariationsByProductId(productId, filter);
  }

  /**
   * Get single variation
   */
  async getVariationDetail(productId: string, variationId: string) {
    const v = await this.repo.findVariationById(productId, variationId, true);
    if (!v) throw new Error('PRODUCT_VARIATION_NOT_FOUND');
    return v;
  }

  /**
   * Create variation manually
   */
  async createVariation(productId: string, input: CreateVariationInput, adminUserId?: string) {
    const product = await this.repo.findProductForVariations(productId);
    if (!product) throw new Error('PRODUCT_NOT_FOUND');
    if (product.productType !== 'VARIABLE') throw new Error('PRODUCT_NOT_VARIABLE');

    const combinationKey = buildCombinationKey(input.attributeValues);

    const existingKey = await this.repo.findVariationByCombinationKey(productId, combinationKey);
    if (existingKey) {
      throw new Error('PRODUCT_VARIATION_DUPLICATE');
    }

    if (input.sku) {
      const existingSku = await this.repo.findVariationBySku(input.sku);
      if (existingSku) throw new Error('PRODUCT_VARIATION_SKU_EXISTS');
    }

    if (input.barcode) {
      const existingBarcode = await this.repo.findVariationByBarcode(input.barcode);
      if (existingBarcode) throw new Error('PRODUCT_VARIATION_BARCODE_EXISTS');
    }

    const created = await this.repo.createVariation(
      productId,
      {
        ...input,
        combinationKey,
      },
      adminUserId
    );

    await this.createAuditLog('VARIATION_CREATED', created.id, adminUserId, null, created);
    return created;
  }

  /**
   * Update variation
   */
  async updateVariation(
    productId: string,
    variationId: string,
    input: UpdateVariationInput,
    adminUserId?: string
  ) {
    const existing = await this.repo.findVariationById(productId, variationId, true);
    if (!existing) throw new Error('PRODUCT_VARIATION_NOT_FOUND');

    if (input.sku && input.sku !== existing.sku) {
      const skuCheck = await this.repo.findVariationBySku(input.sku, variationId);
      if (skuCheck) throw new Error('PRODUCT_VARIATION_SKU_EXISTS');
    }

    if (input.barcode && input.barcode !== existing.barcode) {
      const barcodeCheck = await this.repo.findVariationByBarcode(input.barcode, variationId);
      if (barcodeCheck) throw new Error('PRODUCT_VARIATION_BARCODE_EXISTS');
    }

    if (input.attributeValues) {
      const key = buildCombinationKey(input.attributeValues);
      if (key !== existing.combinationKey) {
        const keyCheck = await this.repo.findVariationByCombinationKey(productId, key, variationId);
        if (keyCheck) throw new Error('PRODUCT_VARIATION_DUPLICATE');
      }
    }

    const updated = await this.repo.updateVariation(productId, variationId, input, adminUserId);
    await this.createAuditLog('VARIATION_UPDATED', variationId, adminUserId, existing, updated);
    return updated;
  }

  /**
   * Set default variation
   */
  async setDefaultVariation(productId: string, variationId: string, adminUserId?: string) {
    const existing = await this.repo.findVariationById(productId, variationId);
    if (!existing) throw new Error('PRODUCT_VARIATION_NOT_FOUND');

    if (existing.status === 'INACTIVE' || existing.status === 'ARCHIVED' || existing.deletedAt) {
      throw new Error('PRODUCT_VARIATION_DEFAULT_INVALID');
    }

    await this.repo.setDefaultVariation(productId, variationId, adminUserId);
    await this.createAuditLog('VARIATION_DEFAULT_SET', variationId, adminUserId, null, { isDefault: true });
    return true;
  }

  /**
   * Update status
   */
  async updateStatus(productId: string, variationId: string, status: string, adminUserId?: string) {
    const existing = await this.repo.findVariationById(productId, variationId);
    if (!existing) throw new Error('PRODUCT_VARIATION_NOT_FOUND');

    const updated = await this.repo.updateVariation(
      productId,
      variationId,
      { status: status as any, isDefault: status === 'INACTIVE' ? false : undefined },
      adminUserId
    );

    await this.createAuditLog('VARIATION_STATUS_CHANGED', variationId, adminUserId, { status: existing.status }, { status });
    return updated;
  }

  /**
   * Bulk update
   */
  async bulkUpdate(productId: string, input: BulkUpdateVariationsInput, adminUserId?: string) {
    const product = await this.repo.findProductForVariations(productId);
    if (!product) throw new Error('PRODUCT_NOT_FOUND');

    const res = await this.repo.bulkUpdateVariations(
      productId,
      input.variationIds,
      input.operation,
      input.payload,
      adminUserId
    );

    await this.createAuditLog(
      'VARIATION_BULK_UPDATE',
      productId,
      adminUserId,
      null,
      { operation: input.operation, count: res.count }
    );

    return res;
  }

  /**
   * Soft delete
   */
  async deleteVariation(productId: string, variationId: string, adminUserId?: string) {
    const existing = await this.repo.findVariationById(productId, variationId);
    if (!existing) throw new Error('PRODUCT_VARIATION_NOT_FOUND');

    await this.repo.deleteVariation(productId, variationId, adminUserId);
    await this.createAuditLog('VARIATION_DELETED', variationId, adminUserId, existing, null);
    return true;
  }

  /**
   * Restore variation
   */
  async restoreVariation(productId: string, variationId: string, adminUserId?: string) {
    const existing = await this.repo.findVariationById(productId, variationId, true);
    if (!existing) throw new Error('PRODUCT_VARIATION_NOT_FOUND');

    // Check key conflict
    const keyConflict = await this.repo.findVariationByCombinationKey(productId, existing.combinationKey, variationId);
    if (keyConflict) throw new Error('PRODUCT_VARIATION_RESTORE_CONFLICT');

    if (existing.sku) {
      const skuConflict = await this.repo.findVariationBySku(existing.sku, variationId);
      if (skuConflict) throw new Error('PRODUCT_VARIATION_RESTORE_CONFLICT');
    }

    await this.repo.restoreVariation(productId, variationId, adminUserId);
    await this.createAuditLog('VARIATION_RESTORED', variationId, adminUserId, null, { restored: true });
    return true;
  }

  /**
   * Get public product variations
   */
  async getPublicVariations(productId: string) {
    return this.repo.findPublicVariationsByProductId(productId);
  }
}
