import { Request, Response, NextFunction } from 'express';
import { AddonGroupService } from './addonGroup.service';
import { ListAddonGroupQuerySchema, CreateAddonGroupSchema, UpdateAddonGroupSchema } from './productAddon.types';

const service = new AddonGroupService();

export async function listGroups(req: Request, res: Response, next: NextFunction) {
  try {
    const query = ListAddonGroupQuerySchema.parse(req.query);
    const result = await service.listGroups(query);
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

export async function getGroupById(req: Request, res: Response, next: NextFunction) {
  try {
    const includeDeleted = req.query.includeDeleted === 'true';
    const group = await service.getGroupById(req.params.id, includeDeleted);
    res.json({ success: true, data: group });
  } catch (error) {
    next(error);
  }
}

export async function createGroup(req: Request, res: Response, next: NextFunction) {
  try {
    const body = CreateAddonGroupSchema.parse(req.body);
    const created = await service.createGroup(body);
    res.status(201).json({
      success: true,
      message: 'Add-on group created successfully',
      data: created,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateGroup(req: Request, res: Response, next: NextFunction) {
  try {
    const body = UpdateAddonGroupSchema.parse(req.body);
    const updated = await service.updateGroup(req.params.id, body);
    res.json({
      success: true,
      message: 'Add-on group updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateGroupItems(req: Request, res: Response, next: NextFunction) {
  try {
    const { items } = req.body;
    const updated = await service.updateGroupItems(req.params.id, items);
    res.json({
      success: true,
      message: 'Add-on group items updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteGroup(req: Request, res: Response, next: NextFunction) {
  try {
    const deleted = await service.deleteGroup(req.params.id);
    res.json({
      success: true,
      message: 'Add-on group deleted successfully',
      data: deleted,
    });
  } catch (error) {
    next(error);
  }
}

export async function restoreGroup(req: Request, res: Response, next: NextFunction) {
  try {
    const restored = await service.restoreGroup(req.params.id);
    res.json({
      success: true,
      message: 'Add-on group restored successfully',
      data: restored,
    });
  } catch (error) {
    next(error);
  }
}
