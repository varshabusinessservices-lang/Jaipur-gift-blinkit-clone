import { Request, Response, NextFunction } from 'express';
import { ProductAddonService } from './productAddon.service';
import { ProductAddonRepository } from './productAddon.repository';
import {
  ListProductAddonQuerySchema,
  CreateProductAddonSchema,
  UpdateProductAddonSchema,
} from './productAddon.types';

const service = new ProductAddonService();
const repository = new ProductAddonRepository();

export async function listAddons(req: Request, res: Response, next: NextFunction) {
  try {
    const parsedQuery = ListProductAddonQuerySchema.parse(req.query);
    const result = await service.listAddons(parsedQuery);
    res.json({
      success: true,
      data: result.items,
      meta: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getAddonOptionChoices(req: Request, res: Response, next: NextFunction) {
  try {
    const { search } = req.query;
    const query = ListProductAddonQuerySchema.parse({ search: search as string, limit: 50 });
    const result = await service.listAddons(query);
    const choices = result.items.map((item) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
      code: item.code,
      inputType: item.inputType,
      pricingType: item.pricingType,
      fixedPrice: item.fixedPrice,
    }));
    res.json({ success: true, data: choices });
  } catch (error) {
    next(error);
  }
}

export async function getAddonById(req: Request, res: Response, next: NextFunction) {
  try {
    const includeDeleted = req.query.includeDeleted === 'true';
    const addon = await service.getAddonById(req.params.id, includeDeleted);
    res.json({ success: true, data: addon });
  } catch (error) {
    next(error);
  }
}

export async function createAddon(req: Request, res: Response, next: NextFunction) {
  try {
    const body = CreateProductAddonSchema.parse(req.body);
    const adminUserId = (req as any).user?.id;
    const created = await service.createAddon(body, adminUserId);
    res.status(201).json({
      success: true,
      message: 'Product Add-on created successfully',
      data: created,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateAddon(req: Request, res: Response, next: NextFunction) {
  try {
    const body = UpdateProductAddonSchema.parse(req.body);
    const adminUserId = (req as any).user?.id;
    const updated = await service.updateAddon(req.params.id, body, adminUserId);
    res.json({
      success: true,
      message: 'Product Add-on updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { status } = req.body;
    const adminUserId = (req as any).user?.id;
    const updated = await service.updateStatus(req.params.id, status, adminUserId);
    res.json({
      success: true,
      message: `Product Add-on status updated to ${status}`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

export async function reorderBulk(req: Request, res: Response, next: NextFunction) {
  try {
    const { items } = req.body; // Array of { id, sortOrder }
    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'items array is required' });
    }
    await repository.reorderBulk(items);
    res.json({ success: true, message: 'Add-ons reordered successfully' });
  } catch (error) {
    next(error);
  }
}

export async function softDeleteAddon(req: Request, res: Response, next: NextFunction) {
  try {
    const adminUserId = (req as any).user?.id;
    const deleted = await service.softDeleteAddon(req.params.id, adminUserId);
    res.json({
      success: true,
      message: 'Product Add-on deleted successfully',
      data: deleted,
    });
  } catch (error) {
    next(error);
  }
}

export async function restoreAddon(req: Request, res: Response, next: NextFunction) {
  try {
    const adminUserId = (req as any).user?.id;
    const restored = await service.restoreAddon(req.params.id, adminUserId);
    res.json({
      success: true,
      message: 'Product Add-on restored successfully',
      data: restored,
    });
  } catch (error) {
    next(error);
  }
}

export async function duplicateAddon(req: Request, res: Response, next: NextFunction) {
  try {
    const adminUserId = (req as any).user?.id;
    const duplicated = await service.duplicateAddon(req.params.id, adminUserId);
    res.status(201).json({
      success: true,
      message: 'Product Add-on duplicated successfully',
      data: duplicated,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Options Endpoints
 */
export async function createOption(req: Request, res: Response, next: NextFunction) {
  try {
    const addonId = req.params.addonId;
    const option = await repository.createOption({
      ...req.body,
      addon: { connect: { id: addonId } },
    });
    res.status(201).json({ success: true, message: 'Option added', data: option });
  } catch (error) {
    next(error);
  }
}

export async function updateOption(req: Request, res: Response, next: NextFunction) {
  try {
    const { optionId } = req.params;
    const updated = await repository.updateOption(optionId, req.body);
    res.json({ success: true, message: 'Option updated', data: updated });
  } catch (error) {
    next(error);
  }
}

export async function deleteOption(req: Request, res: Response, next: NextFunction) {
  try {
    const { optionId } = req.params;
    const deleted = await repository.deleteOption(optionId);
    res.json({ success: true, message: 'Option deleted', data: deleted });
  } catch (error) {
    next(error);
  }
}

export async function restoreOption(req: Request, res: Response, next: NextFunction) {
  try {
    const { optionId } = req.params;
    const restored = await repository.restoreOption(optionId);
    res.json({ success: true, message: 'Option restored', data: restored });
  } catch (error) {
    next(error);
  }
}

export async function reorderOptions(req: Request, res: Response, next: NextFunction) {
  try {
    const { items } = req.body;
    await repository.reorderOptions(items);
    res.json({ success: true, message: 'Options reordered' });
  } catch (error) {
    next(error);
  }
}

/**
 * Assignments Endpoints
 */
export async function getAssignments(req: Request, res: Response, next: NextFunction) {
  try {
    const addon = await service.getAddonById(req.params.addonId);
    res.json({ success: true, data: addon.assignments });
  } catch (error) {
    next(error);
  }
}

export async function updateAssignments(req: Request, res: Response, next: NextFunction) {
  try {
    const addonId = req.params.addonId;
    const { assignments } = req.body;
    const formatted = assignments.map((assign: any) => ({
      addonId,
      assignmentType: assign.assignmentType,
      productId: assign.productId || null,
      variationId: assign.variationId || null,
      categoryId: assign.categoryId || null,
      isRequiredOverride: assign.isRequiredOverride ?? null,
      priceOverride: assign.priceOverride ? assign.priceOverride : null,
      percentageOverride: assign.percentageOverride ? assign.percentageOverride : null,
      sortOrder: assign.sortOrder || 0,
      status: assign.status || 'ACTIVE',
    }));
    const updated = await repository.updateAssignments(addonId, formatted);
    res.json({ success: true, message: 'Assignments updated', data: updated });
  } catch (error) {
    next(error);
  }
}

export async function deleteAssignment(req: Request, res: Response, next: NextFunction) {
  try {
    await repository.deleteAssignment(req.params.assignmentId);
    res.json({ success: true, message: 'Assignment removed' });
  } catch (error) {
    next(error);
  }
}

/**
 * Public Effective Addons Resolver
 */
export async function resolveProductAddons(req: Request, res: Response, next: NextFunction) {
  try {
    const productId = req.params.productId;
    const variationId = req.query.variationId as string | undefined;

    const resolved = await repository.resolveEffectiveAddons(productId, variationId);
    res.json({
      success: true,
      data: resolved,
    });
  } catch (error) {
    next(error);
  }
}
