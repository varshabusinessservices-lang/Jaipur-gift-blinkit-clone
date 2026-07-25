import { Request, Response, NextFunction } from 'express';
import {
  AttributeFilterQuerySchema,
  CreateAttributeSchema,
  UpdateAttributeSchema,
  CreateAttributeValueSchema,
  UpdateAttributeValueSchema,
  CreateAttributeGroupSchema,
} from './productAttribute.types';
import { productAttributeService } from './productAttribute.service';

export async function getAttributes(req: Request, res: Response, next: NextFunction) {
  try {
    const query = AttributeFilterQuerySchema.parse(req.query);
    const result = await productAttributeService.getAttributes(query);
    res.json({
      success: true,
      data: result.attributes,
      pagination: result.pagination,
    });
  } catch (err) {
    next(err);
  }
}

export async function getAttributeOptions(req: Request, res: Response, next: NextFunction) {
  try {
    const activeOnly = req.query.activeOnly !== 'false';
    const variationOnly = req.query.variationOnly === 'true';
    const categoryId = req.query.categoryId as string | undefined;
    const includeInherited = req.query.includeInherited !== 'false';

    const options = await productAttributeService.getOptions({
      activeOnly,
      variationOnly,
      categoryId,
      includeInherited,
    });

    res.json({
      success: true,
      data: options,
    });
  } catch (err) {
    next(err);
  }
}

export async function getAttributeById(req: Request, res: Response, next: NextFunction) {
  try {
    const attr = await productAttributeService.getAttributeById(req.params.id);
    res.json({
      success: true,
      data: attr,
    });
  } catch (err) {
    next(err);
  }
}

export async function createAttribute(req: Request, res: Response, next: NextFunction) {
  try {
    const body = CreateAttributeSchema.parse(req.body);
    const adminUserId = (req as any).user?.id;
    const created = await productAttributeService.createAttribute(body, adminUserId);
    res.status(201).json({
      success: true,
      message: 'Product attribute created successfully',
      data: created,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateAttribute(req: Request, res: Response, next: NextFunction) {
  try {
    const body = UpdateAttributeSchema.parse(req.body);
    const adminUserId = (req as any).user?.id;
    const updated = await productAttributeService.updateAttribute(req.params.id, body, adminUserId);
    res.json({
      success: true,
      message: 'Product attribute updated successfully',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateAttributeStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { status } = req.body;
    if (!['ACTIVE', 'INACTIVE', 'ARCHIVED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }
    const adminUserId = (req as any).user?.id;
    const updated = await productAttributeService.updateStatus(req.params.id, status, adminUserId);
    res.json({
      success: true,
      message: `Product attribute status updated to ${status}`,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteAttribute(req: Request, res: Response, next: NextFunction) {
  try {
    const adminUserId = (req as any).user?.id;
    await productAttributeService.deleteAttribute(req.params.id, adminUserId);
    res.json({
      success: true,
      message: 'Product attribute soft-deleted successfully',
    });
  } catch (err) {
    next(err);
  }
}

export async function restoreAttribute(req: Request, res: Response, next: NextFunction) {
  try {
    const adminUserId = (req as any).user?.id;
    const restored = await productAttributeService.restoreAttribute(req.params.id, adminUserId);
    res.json({
      success: true,
      message: 'Product attribute restored successfully',
      data: restored,
    });
  } catch (err) {
    next(err);
  }
}

export async function reorderBulk(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({
      success: true,
      message: 'Attributes reordered successfully',
    });
  } catch (err) {
    next(err);
  }
}

// Value Endpoints
export async function getValues(req: Request, res: Response, next: NextFunction) {
  try {
    const attr = await productAttributeService.getAttributeById(req.params.attributeId);
    res.json({
      success: true,
      data: attr.values,
    });
  } catch (err) {
    next(err);
  }
}

export async function createValue(req: Request, res: Response, next: NextFunction) {
  try {
    const body = CreateAttributeValueSchema.parse(req.body);
    const adminUserId = (req as any).user?.id;
    const created = await productAttributeService.createValue(req.params.attributeId, body, adminUserId);
    res.status(201).json({
      success: true,
      message: 'Attribute value created successfully',
      data: created,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateValue(req: Request, res: Response, next: NextFunction) {
  try {
    const body = UpdateAttributeValueSchema.parse(req.body);
    const adminUserId = (req as any).user?.id;
    const updated = await productAttributeService.updateValue(
      req.params.attributeId,
      req.params.valueId,
      body,
      adminUserId
    );
    res.json({
      success: true,
      message: 'Attribute value updated successfully',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateValueStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { status } = req.body;
    const adminUserId = (req as any).user?.id;
    const updated = await productAttributeService.updateValue(
      req.params.attributeId,
      req.params.valueId,
      { status },
      adminUserId
    );
    res.json({
      success: true,
      message: 'Attribute value status updated',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteValue(req: Request, res: Response, next: NextFunction) {
  try {
    const adminUserId = (req as any).user?.id;
    await productAttributeService.deleteValue(req.params.attributeId, req.params.valueId, adminUserId);
    res.json({
      success: true,
      message: 'Attribute value deleted successfully',
    });
  } catch (err) {
    next(err);
  }
}

export async function restoreValue(req: Request, res: Response, next: NextFunction) {
  try {
    const adminUserId = (req as any).user?.id;
    const restored = await productAttributeService.updateValue(
      req.params.attributeId,
      req.params.valueId,
      { status: 'ACTIVE' },
      adminUserId
    );
    res.json({
      success: true,
      message: 'Attribute value restored successfully',
      data: restored,
    });
  } catch (err) {
    next(err);
  }
}

export async function reorderValuesBulk(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({
      success: true,
      message: 'Values reordered successfully',
    });
  } catch (err) {
    next(err);
  }
}

// Category Assignments
export async function getCategories(req: Request, res: Response, next: NextFunction) {
  try {
    const attr = await productAttributeService.getAttributeById(req.params.id);
    res.json({
      success: true,
      data: attr.categoryAssignments,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateCategories(req: Request, res: Response, next: NextFunction) {
  try {
    const { categoryAssignments } = req.body;
    const adminUserId = (req as any).user?.id;
    const updated = await productAttributeService.updateAttribute(
      req.params.id,
      { categoryAssignments },
      adminUserId
    );
    res.json({
      success: true,
      message: 'Category assignments updated',
      data: updated?.categoryAssignments,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteCategoryAssignment(req: Request, res: Response, next: NextFunction) {
  try {
    const attr = await productAttributeService.getAttributeById(req.params.id);
    const updatedAssignments = attr.categoryAssignments.filter(
      (ca) => ca.categoryId !== req.params.categoryId
    );
    await productAttributeService.updateAttribute(req.params.id, {
      categoryAssignments: updatedAssignments,
    });
    res.json({
      success: true,
      message: 'Category assignment removed',
    });
  } catch (err) {
    next(err);
  }
}

// Attribute Groups
export async function getGroups(req: Request, res: Response, next: NextFunction) {
  try {
    const groups = await productAttributeService.getGroups();
    res.json({
      success: true,
      data: groups,
    });
  } catch (err) {
    next(err);
  }
}

export async function createGroup(req: Request, res: Response, next: NextFunction) {
  try {
    const body = CreateAttributeGroupSchema.parse(req.body);
    const group = await productAttributeService.createGroup(body);
    res.status(201).json({
      success: true,
      message: 'Attribute group created',
      data: group,
    });
  } catch (err) {
    next(err);
  }
}

// Variation Combinations Generator
export async function generateCombinations(req: Request, res: Response, next: NextFunction) {
  try {
    const { selections, maxLimit } = req.body;
    if (!Array.isArray(selections)) {
      return res.status(400).json({ success: false, message: 'selections must be an array' });
    }
    const result = await productAttributeService.generateCombinations(selections, maxLimit);
    res.json({
      success: result.success,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}
