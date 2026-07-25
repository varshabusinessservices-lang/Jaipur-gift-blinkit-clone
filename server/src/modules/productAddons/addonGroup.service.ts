import { prisma } from '../../database/prisma';
import { ListAddonGroupQuery } from './productAddon.types';
import { Prisma } from '@prisma/client';

export class AddonGroupService {
  async listGroups(query: ListAddonGroupQuery) {
    const { page, limit, search, status, includeDeleted, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.AddonGroupWhereInput = {};

    if (!includeDeleted) {
      where.deletedAt = null;
    }

    if (status) {
      where.status = status as any;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { slug: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const orderBy: Prisma.AddonGroupOrderByWithRelationInput = {};
    if (sortBy === 'name') orderBy.name = sortOrder;
    else if (sortBy === 'createdAt') orderBy.createdAt = sortOrder;
    else if (sortBy === 'updatedAt') orderBy.updatedAt = sortOrder;
    else if (sortBy === 'status') orderBy.status = sortOrder;
    else orderBy.sortOrder = sortOrder;

    const [items, total] = await Promise.all([
      prisma.addonGroup.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          items: {
            orderBy: { sortOrder: 'asc' },
            include: {
              addon: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                  inputType: true,
                  pricingType: true,
                  fixedPrice: true,
                  status: true,
                },
              },
            },
          },
        },
      }),
      prisma.addonGroup.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getGroupById(id: string, includeDeleted = false) {
    const group = await prisma.addonGroup.findFirst({
      where: {
        id,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
      include: {
        items: {
          orderBy: { sortOrder: 'asc' },
          include: {
            addon: {
              select: {
                id: true,
                name: true,
                slug: true,
                code: true,
                inputType: true,
                pricingType: true,
                fixedPrice: true,
                status: true,
              },
            },
          },
        },
      },
    });

    if (!group) {
      const err = new Error('Add-on Group not found') as any;
      err.code = 'ADDON_GROUP_NOT_FOUND';
      err.statusCode = 404;
      throw err;
    }

    return group;
  }

  async createGroup(input: any) {
    if (!input.name || input.name.trim().length < 2) {
      const err = new Error('Group name must be at least 2 characters') as any;
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

    const existingSlug = await prisma.addonGroup.findUnique({ where: { slug } });
    if (existingSlug) {
      const err = new Error(`Add-on Group slug "${slug}" already exists`) as any;
      err.code = 'ADDON_SLUG_EXISTS';
      err.statusCode = 409;
      throw err;
    }

    // Selection rules
    if (input.selectionType === 'SINGLE') {
      if (input.maximumSelections && input.maximumSelections > 1) {
        const err = new Error('Single selection groups cannot have maximum selections > 1') as any;
        err.code = 'ADDON_GROUP_SELECTION_INVALID';
        err.statusCode = 400;
        throw err;
      }
    } else if (input.maximumSelections && input.maximumSelections < input.minimumSelections) {
      const err = new Error('Maximum selections cannot be less than minimum selections') as any;
      err.code = 'ADDON_GROUP_SELECTION_INVALID';
      err.statusCode = 400;
      throw err;
    }

    const createPayload: any = {
      storeId: input.storeId || null,
      name: input.name.trim(),
      slug,
      description: input.description || null,
      selectionType: input.selectionType || 'SINGLE',
      minimumSelections: input.minimumSelections || 0,
      maximumSelections: input.selectionType === 'SINGLE' ? 1 : input.maximumSelections || null,
      isRequired: input.isRequired || false,
      status: input.status || 'ACTIVE',
      sortOrder: input.sortOrder || 0,
    };

    if (input.items && input.items.length > 0) {
      createPayload.items = {
        create: input.items.map((item: any, idx: number) => ({
          addonId: item.addonId,
          sortOrder: item.sortOrder ?? idx,
          isDefault: item.isDefault || false,
        })),
      };
    }

    return prisma.addonGroup.create({
      data: createPayload,
      include: {
        items: {
          include: { addon: true },
        },
      },
    });
  }

  async updateGroup(id: string, input: any) {
    const existing = await this.getGroupById(id, true);

    if (input.slug && input.slug !== existing.slug) {
      const slugCheck = await prisma.addonGroup.findUnique({ where: { slug: input.slug } });
      if (slugCheck && slugCheck.id !== id) {
        const err = new Error(`Add-on group slug "${input.slug}" already exists`) as any;
        err.code = 'ADDON_SLUG_EXISTS';
        err.statusCode = 409;
        throw err;
      }
    }

    return prisma.addonGroup.update({
      where: { id },
      data: {
        ...(input.name ? { name: input.name.trim() } : {}),
        ...(input.slug ? { slug: input.slug } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.selectionType ? { selectionType: input.selectionType } : {}),
        ...(input.minimumSelections !== undefined ? { minimumSelections: input.minimumSelections } : {}),
        ...(input.maximumSelections !== undefined ? { maximumSelections: input.maximumSelections } : {}),
        ...(input.isRequired !== undefined ? { isRequired: input.isRequired } : {}),
        ...(input.status ? { status: input.status } : {}),
        ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
      },
      include: {
        items: { include: { addon: true } },
      },
    });
  }

  async updateGroupItems(id: string, items: { addonId: string; sortOrder?: number; isDefault?: boolean }[]) {
    await this.getGroupById(id, true);

    await prisma.addonGroupItem.deleteMany({
      where: { groupId: id },
    });

    if (items.length > 0) {
      await prisma.addonGroupItem.createMany({
        data: items.map((it, idx) => ({
          groupId: id,
          addonId: it.addonId,
          sortOrder: it.sortOrder ?? idx,
          isDefault: it.isDefault || false,
        })),
      });
    }

    return this.getGroupById(id, true);
  }

  async deleteGroup(id: string) {
    await this.getGroupById(id, false);
    return prisma.addonGroup.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'INACTIVE' },
    });
  }

  async restoreGroup(id: string) {
    await this.getGroupById(id, true);
    return prisma.addonGroup.update({
      where: { id },
      data: { deletedAt: null, status: 'INACTIVE' },
    });
  }
}
