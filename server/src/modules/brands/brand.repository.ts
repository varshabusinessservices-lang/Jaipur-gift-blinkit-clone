import { prisma, shouldAllowFallback } from '../../database/prisma';
import { 
  BrandFilterQuery, 
  CreateBrandDto, 
  UpdateBrandDto, 
  BrandReorderItem,
  BrandOptionsQuery,
  BrandOption,
  BrandStatus
} from './brand.types';

// In-memory fallback brand store
const memoryBrands: any[] = [
  {
    id: 'brand-001',
    storeId: null,
    name: 'Photo Frame Studio',
    slug: 'photo-frame-studio',
    code: 'BRD-PFS-01',
    shortDescription: 'In-house studio crafting custom acrylic & wooden LED photo frames.',
    description: 'Premier Jaipur photo frame studio specializing in high-definition UV printed acrylic frames, customized LED wooden frames, and memory shadow boxes.',
    logoFileId: 'img-logo-001',
    seoImageFileId: null,
    websiteUrl: 'https://jaipurgifts.example.com/brands/photo-frame-studio',
    status: 'ACTIVE',
    isFeatured: true,
    sortOrder: 1,
    seoTitle: 'Photo Frame Studio Jaipur | Custom Acrylic & LED Frames',
    seoDescription: 'Order custom personalised photo frames from Photo Frame Studio in Jaipur with 90-min instant delivery.',
    seoKeywordsJson: JSON.stringify(['photo frame studio', 'acrylic photo frame', 'jaipur customised frames']),
    createdByAdminId: 'super-admin-id',
    updatedByAdminId: 'super-admin-id',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    deletedAt: null,
  },
  {
    id: 'brand-002',
    storeId: null,
    name: 'Jaipur Gifts',
    slug: 'jaipur-gifts',
    code: 'BRD-JPG-02',
    shortDescription: 'Handcrafted authentic Jaipuri keepsakes and personalised wooden crafts.',
    description: 'Traditional and contemporary gift collection showcasing handcrafted blue pottery motifs, brass engravings, and custom name plaques.',
    logoFileId: null,
    seoImageFileId: null,
    websiteUrl: 'https://jaipurgifts.example.com',
    status: 'ACTIVE',
    isFeatured: true,
    sortOrder: 2,
    seoTitle: 'Jaipur Gifts | Artisanal Keepsakes & Custom Name Gifts',
    seoDescription: 'Handmade Jaipuri gifts with custom engraving options.',
    seoKeywordsJson: JSON.stringify(['jaipur gifts', 'artisanal keepsakes', 'custom plaque']),
    createdByAdminId: 'super-admin-id',
    updatedByAdminId: 'super-admin-id',
    createdAt: new Date('2026-01-02'),
    updatedAt: new Date('2026-01-02'),
    deletedAt: null,
  },
  {
    id: 'brand-003',
    storeId: null,
    name: 'Celebration Collection',
    slug: 'celebration-collection',
    code: 'BRD-CEL-03',
    shortDescription: 'Curated gift hampers for birthdays, anniversaries, and festive moments.',
    description: 'Exclusive celebration kits combining personalised memory items, premium chocolates, and greeting cards.',
    logoFileId: null,
    seoImageFileId: null,
    websiteUrl: null,
    status: 'ACTIVE',
    isFeatured: false,
    sortOrder: 3,
    seoTitle: 'Celebration Collection | Birthday & Anniversary Gift Hampers',
    seoDescription: 'Express celebration gift hampers with instant 90-minute delivery in Jaipur.',
    seoKeywordsJson: JSON.stringify(['gift hampers', 'celebration kit', 'instant gift jaipur']),
    createdByAdminId: 'super-admin-id',
    updatedByAdminId: 'super-admin-id',
    createdAt: new Date('2026-01-03'),
    updatedAt: new Date('2026-01-03'),
    deletedAt: null,
  }
];

export class BrandRepository {
  async findBrands(filters: BrandFilterQuery) {
    const page = filters.page || 1;
    const limit = Math.min(100, Math.max(1, filters.limit || 20));
    const skip = (page - 1) * limit;

    try {
      const where: any = {};

      if (filters.includeDeleted !== 'true' && filters.includeDeleted !== true) {
        where.deletedAt = null;
      }

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.featured !== undefined && filters.featured !== '') {
        where.isFeatured = filters.featured === 'true' || filters.featured === true;
      }

      if (filters.storeId) {
        where.storeId = filters.storeId;
      }

      if (filters.search) {
        const searchStr = filters.search.trim();
        where.OR = [
          { name: { contains: searchStr } },
          { slug: { contains: searchStr } },
          { code: { contains: searchStr } },
          { description: { contains: searchStr } },
        ];
      }

      const sortBy = filters.sortBy || 'sortOrder';
      const sortOrder = filters.sortOrder || 'asc';

      const [total, items] = await Promise.all([
        prisma.brand.count({ where }),
        prisma.brand.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
        }),
      ]);

      const formattedItems = items.map((b) => ({
        ...b,
        productCount: null, // Placeholder as Product model is deferred
      }));

      return {
        brands: formattedItems,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      };
    } catch (dbError) {
      if (!shouldAllowFallback()) throw dbError;
      // Memory fallback
      let filtered = memoryBrands.filter((b) => {
        if (filters.includeDeleted !== 'true' && filters.includeDeleted !== true && b.deletedAt !== null) {
          return false;
        }
        if (filters.status && b.status !== filters.status) {
          return false;
        }
        if (filters.featured !== undefined && filters.featured !== '') {
          const isFeat = filters.featured === 'true' || filters.featured === true;
          if (b.isFeatured !== isFeat) return false;
        }
        if (filters.search) {
          const q = filters.search.toLowerCase();
          const matches =
            b.name.toLowerCase().includes(q) ||
            b.slug.toLowerCase().includes(q) ||
            (b.code && b.code.toLowerCase().includes(q));
          if (!matches) return false;
        }
        return true;
      });

      const total = filtered.length;
      const paginated = filtered.slice(skip, skip + limit).map((b) => ({
        ...b,
        productCount: null,
      }));

      return {
        brands: paginated,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      };
    }
  }

  async findBrandById(id: string) {
    try {
      const item = await prisma.brand.findUnique({
        where: { id },
      });
      if (!item) return null;
      return {
        ...item,
        productCount: null,
      };
    } catch (err) {
      if (!shouldAllowFallback()) throw err;
      const item = memoryBrands.find((b) => b.id === id);
      if (!item) return null;
      return { ...item, productCount: null };
    }
  }

  async findBrandBySlug(slug: string, excludeId?: string) {
    try {
      const item = await prisma.brand.findFirst({
        where: {
          slug,
          deletedAt: null,
          ...(excludeId ? { NOT: { id: excludeId } } : {}),
        },
      });
      return item;
    } catch (err) {
      return memoryBrands.find(
        (b) => b.slug === slug && b.deletedAt === null && (!excludeId || b.id !== excludeId)
      ) || null;
    }
  }

  async findBrandByCode(code: string, excludeId?: string) {
    if (!code) return null;
    try {
      const item = await prisma.brand.findFirst({
        where: {
          code,
          deletedAt: null,
          ...(excludeId ? { NOT: { id: excludeId } } : {}),
        },
      });
      return item;
    } catch (err) {
      return memoryBrands.find(
        (b) => b.code === code && b.deletedAt === null && (!excludeId || b.id !== excludeId)
      ) || null;
    }
  }

  async createBrand(dto: CreateBrandDto, adminId?: string) {
    try {
      const created = await prisma.brand.create({
        data: {
          storeId: dto.storeId || null,
          name: dto.name,
          slug: dto.slug!,
          code: dto.code || null,
          description: dto.description || null,
          shortDescription: dto.shortDescription || null,
          logoFileId: dto.logoFileId || null,
          logoAltText: dto.logoAltText || null,
          seoImageFileId: dto.seoImageFileId || null,
          seoImageAltText: dto.seoImageAltText || null,
          websiteUrl: dto.websiteUrl || null,
          status: dto.status || 'ACTIVE',
          isFeatured: dto.isFeatured ?? false,
          sortOrder: dto.sortOrder ?? 0,
          seoTitle: dto.seoTitle || null,
          seoDescription: dto.seoDescription || null,
          seoKeywordsJson: dto.seoKeywordsJson || null,
          createdByAdminId: adminId || null,
          updatedByAdminId: adminId || null,
        },
      });

      // Audit Log
      await prisma.auditLog.create({
        data: {
          actorType: 'ADMIN',
          actorAdminId: adminId || null,
          action: 'BRAND_CREATED',
          entityType: 'BRAND',
          entityId: created.id,
          newValuesJson: JSON.stringify(created),
        },
      }).catch(() => {});

      return { ...created, productCount: null };
    } catch (dbError) {
      if (!shouldAllowFallback()) throw dbError;
      const newBrand = {
        id: `brand-${Date.now()}`,
        storeId: dto.storeId || null,
        name: dto.name,
        slug: dto.slug!,
        code: dto.code || null,
        description: dto.description || null,
        shortDescription: dto.shortDescription || null,
        logoFileId: dto.logoFileId || null,
        logoAltText: dto.logoAltText || null,
        seoImageFileId: dto.seoImageFileId || null,
        seoImageAltText: dto.seoImageAltText || null,
        websiteUrl: dto.websiteUrl || null,
        status: dto.status || 'ACTIVE',
        isFeatured: dto.isFeatured ?? false,
        sortOrder: dto.sortOrder ?? 0,
        seoTitle: dto.seoTitle || null,
        seoDescription: dto.seoDescription || null,
        seoKeywordsJson: dto.seoKeywordsJson || null,
        createdByAdminId: adminId || 'super-admin-id',
        updatedByAdminId: adminId || 'super-admin-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      memoryBrands.push(newBrand);
      return { ...newBrand, productCount: null };
    }
  }

  async updateBrand(id: string, dto: UpdateBrandDto, adminId?: string) {
    const existing = await this.findBrandById(id);
    if (!existing) {
      throw new Error(`Brand with ID ${id} not found`);
    }

    try {
      const updated = await prisma.brand.update({
        where: { id },
        data: {
          ...(dto.name !== undefined && { name: dto.name }),
          ...(dto.slug !== undefined && { slug: dto.slug }),
          ...(dto.code !== undefined && { code: dto.code }),
          ...(dto.description !== undefined && { description: dto.description }),
          ...(dto.shortDescription !== undefined && { shortDescription: dto.shortDescription }),
          ...(dto.logoFileId !== undefined && { logoFileId: dto.logoFileId }),
          ...(dto.logoAltText !== undefined && { logoAltText: dto.logoAltText }),
          ...(dto.seoImageFileId !== undefined && { seoImageFileId: dto.seoImageFileId }),
          ...(dto.seoImageAltText !== undefined && { seoImageAltText: dto.seoImageAltText }),
          ...(dto.websiteUrl !== undefined && { websiteUrl: dto.websiteUrl }),
          ...(dto.status !== undefined && { status: dto.status }),
          ...(dto.isFeatured !== undefined && { isFeatured: dto.isFeatured }),
          ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
          ...(dto.seoTitle !== undefined && { seoTitle: dto.seoTitle }),
          ...(dto.seoDescription !== undefined && { seoDescription: dto.seoDescription }),
          ...(dto.seoKeywordsJson !== undefined && { seoKeywordsJson: dto.seoKeywordsJson }),
          updatedByAdminId: adminId || null,
        },
      });

      // Audit Log
      await prisma.auditLog.create({
        data: {
          actorType: 'ADMIN',
          actorAdminId: adminId || null,
          action: 'BRAND_UPDATED',
          entityType: 'BRAND',
          entityId: id,
          oldValuesJson: JSON.stringify(existing),
          newValuesJson: JSON.stringify(updated),
        },
      }).catch(() => {});

      return { ...updated, productCount: null };
    } catch (dbError) {
      if (!shouldAllowFallback()) throw dbError;
      const idx = memoryBrands.findIndex((b) => b.id === id);
      if (idx !== -1) {
        memoryBrands[idx] = {
          ...memoryBrands[idx],
          ...dto,
          updatedByAdminId: adminId || memoryBrands[idx].updatedByAdminId,
          updatedAt: new Date(),
        };
        return { ...memoryBrands[idx], productCount: null };
      }
      throw new Error(`Failed to update brand ${id}`);
    }
  }

  async updateBrandStatus(id: string, status: BrandStatus, adminId?: string) {
    return this.updateBrand(id, { status }, adminId);
  }

  async updateBrandFeatured(id: string, isFeatured: boolean, adminId?: string) {
    return this.updateBrand(id, { isFeatured }, adminId);
  }

  async reorderBrands(items: BrandReorderItem[], adminId?: string) {
    try {
      await prisma.$transaction(
        items.map((item) =>
          prisma.brand.update({
            where: { id: item.id },
            data: { sortOrder: item.sortOrder, updatedByAdminId: adminId || null },
          })
        )
      );
      return { success: true, count: items.length };
    } catch (err) {
      items.forEach((item) => {
        const found = memoryBrands.find((b) => b.id === item.id);
        if (found) {
          found.sortOrder = item.sortOrder;
          found.updatedAt = new Date();
        }
      });
      return { success: true, count: items.length };
    }
  }

  async deleteBrand(id: string, adminId?: string) {
    const existing = await this.findBrandById(id);
    if (!existing) {
      throw new Error(`Brand with ID ${id} not found`);
    }

    try {
      const updated = await prisma.brand.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          status: 'INACTIVE',
          updatedByAdminId: adminId || null,
        },
      });

      await prisma.auditLog.create({
        data: {
          actorType: 'ADMIN',
          actorAdminId: adminId || null,
          action: 'BRAND_SOFT_DELETED',
          entityType: 'BRAND',
          entityId: id,
          oldValuesJson: JSON.stringify(existing),
        },
      }).catch(() => {});

      return { success: true, message: 'Brand soft deleted successfully' };
    } catch (err) {
      const item = memoryBrands.find((b) => b.id === id);
      if (item) {
        item.deletedAt = new Date();
        item.status = 'INACTIVE';
      }
      return { success: true, message: 'Brand soft deleted successfully' };
    }
  }

  async restoreBrand(id: string, adminId?: string) {
    const existing = await this.findBrandById(id);
    if (!existing) {
      throw new Error(`Brand with ID ${id} not found`);
    }

    try {
      const updated = await prisma.brand.update({
        where: { id },
        data: {
          deletedAt: null,
          status: 'INACTIVE', // Restore as INACTIVE by default per specification
          updatedByAdminId: adminId || null,
        },
      });

      await prisma.auditLog.create({
        data: {
          actorType: 'ADMIN',
          actorAdminId: adminId || null,
          action: 'BRAND_RESTORED',
          entityType: 'BRAND',
          entityId: id,
          newValuesJson: JSON.stringify(updated),
        },
      }).catch(() => {});

      return { ...updated, productCount: null };
    } catch (err) {
      const item = memoryBrands.find((b) => b.id === id);
      if (item) {
        item.deletedAt = null;
        item.status = 'INACTIVE';
      }
      return { ...item, productCount: null };
    }
  }

  async getOptions(query: BrandOptionsQuery): Promise<BrandOption[]> {
    try {
      const where: any = { deletedAt: null };
      if (query.activeOnly === 'true' || query.activeOnly === true || query.activeOnly === undefined) {
        where.status = 'ACTIVE';
      }
      if (query.storeId) {
        where.storeId = query.storeId;
      }
      if (query.search) {
        where.name = { contains: query.search.trim() };
      }

      const items = await prisma.brand.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          code: true,
          status: true,
        },
        orderBy: { name: 'asc' },
      });

      return items.map((b) => ({
        id: b.id,
        name: b.name,
        slug: b.slug,
        code: b.code,
        status: b.status as BrandStatus,
        selectable: b.status === 'ACTIVE',
      }));
    } catch (err) {
      let filtered = memoryBrands.filter((b) => b.deletedAt === null);
      if (query.activeOnly === 'true' || query.activeOnly === true || query.activeOnly === undefined) {
        filtered = filtered.filter((b) => b.status === 'ACTIVE');
      }
      if (query.search) {
        const q = query.search.toLowerCase();
        filtered = filtered.filter((b) => b.name.toLowerCase().includes(q));
      }
      return filtered.map((b) => ({
        id: b.id,
        name: b.name,
        slug: b.slug,
        code: b.code,
        status: b.status,
        selectable: b.status === 'ACTIVE',
      }));
    }
  }
}
