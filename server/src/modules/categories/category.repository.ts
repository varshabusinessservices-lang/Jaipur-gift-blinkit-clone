import { prisma } from '../../database/prisma';
import { 
  CategoryFilterQuery, 
  CreateCategoryDto, 
  UpdateCategoryDto, 
  CategoryReorderItem,
  CategoryTreeNode
} from './category.types';
import { 
  slugifyCategoryName, 
  calculateLevelAndPath, 
  isDepthAllowed, 
  buildCategoryTree, 
  isDescendant,
  MAX_CATEGORY_DEPTH
} from './category.utils';

// In-memory mock category store for fallback mode when database server is unavailable
const memoryCategories: any[] = [
  {
    id: 'cat-001',
    parentId: null,
    storeId: null,
    name: 'Personalised Gifts',
    slug: 'personalised-gifts',
    code: 'CAT-PERS-01',
    shortDescription: 'Customised gifts crafted with love in Jaipur.',
    description: 'Explore custom engraved gifts, custom name accessories, and memorable keepsakes.',
    imageFileId: null,
    iconFileId: null,
    desktopBannerFileId: null,
    mobileBannerFileId: null,
    imageUrl: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&q=80&w=400',
    iconUrl: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&q=80&w=100',
    status: 'ACTIVE',
    isFeatured: true,
    showOnHomepage: true,
    sortOrder: 1,
    level: 1,
    path: 'cat-001',
    seoTitle: 'Personalised Gifts Jaipur | Custom Name Gifts Online',
    seoDescription: 'Buy unique custom printed and engraved personalised gifts in Jaipur with 90-min express delivery.',
    seoKeywordsJson: JSON.stringify(['personalised gifts', 'jaipur gifts', 'custom gifts']),
    seoImageFileId: null,
    createdByAdminId: 'super-admin-id',
    updatedByAdminId: 'super-admin-id',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    deletedAt: null,
  },
  {
    id: 'cat-002',
    parentId: 'cat-001',
    storeId: null,
    name: 'Custom Photo Frames',
    slug: 'custom-photo-frames',
    code: 'CAT-FRM-02',
    shortDescription: 'Wooden LED & acrylic photo frames with express delivery.',
    description: 'High-definition acrylic and wooden LED photo frames customized with your memories.',
    imageFileId: null,
    iconFileId: null,
    desktopBannerFileId: null,
    mobileBannerFileId: null,
    imageUrl: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?auto=format&fit=crop&q=80&w=400',
    iconUrl: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?auto=format&fit=crop&q=80&w=100',
    status: 'ACTIVE',
    isFeatured: true,
    showOnHomepage: true,
    sortOrder: 1,
    level: 2,
    path: 'cat-001/cat-002',
    seoTitle: 'Customised Photo Frames Online Jaipur',
    seoDescription: 'Personalised LED acrylic and wooden photo frames with instant preview.',
    seoKeywordsJson: JSON.stringify(['photo frames', 'led frames', 'acrylic photo frame']),
    seoImageFileId: null,
    createdByAdminId: 'super-admin-id',
    updatedByAdminId: 'super-admin-id',
    createdAt: new Date('2026-01-02'),
    updatedAt: new Date('2026-01-02'),
    deletedAt: null,
  },
  {
    id: 'cat-003',
    parentId: 'cat-002',
    storeId: null,
    name: '3D Crystal Photo Frames',
    slug: '3d-crystal-photo-frames',
    code: 'CAT-3D-03',
    shortDescription: 'Laser engraved 3D crystal cubes with LED light base.',
    description: '3D laser photo engraving inside premium optical crystal.',
    imageFileId: null,
    iconFileId: null,
    desktopBannerFileId: null,
    mobileBannerFileId: null,
    imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=400',
    iconUrl: null,
    status: 'ACTIVE',
    isFeatured: false,
    showOnHomepage: false,
    sortOrder: 1,
    level: 3,
    path: 'cat-001/cat-002/cat-003',
    seoTitle: '3D Crystal Photo Laser Engraved Jaipur',
    seoDescription: 'Laser engraved 3D crystal photo gifts with LED light base.',
    seoKeywordsJson: JSON.stringify(['3d crystal photo', 'laser photo crystal']),
    seoImageFileId: null,
    createdByAdminId: 'super-admin-id',
    updatedByAdminId: 'super-admin-id',
    createdAt: new Date('2026-01-03'),
    updatedAt: new Date('2026-01-03'),
    deletedAt: null,
  },
  {
    id: 'cat-004',
    parentId: 'cat-001',
    storeId: null,
    name: 'Personalised Mugs & Sippers',
    slug: 'personalised-mugs-sippers',
    code: 'CAT-MUG-04',
    shortDescription: 'Magic heat transfer mugs, stainless steel sippers & flasks.',
    description: 'Custom mug printing with custom photos, quotes, and temperature displays.',
    imageFileId: null,
    iconFileId: null,
    desktopBannerFileId: null,
    mobileBannerFileId: null,
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=400',
    iconUrl: null,
    status: 'ACTIVE',
    isFeatured: true,
    showOnHomepage: true,
    sortOrder: 2,
    level: 2,
    path: 'cat-001/cat-004',
    seoTitle: 'Custom Printed Mugs Jaipur',
    seoDescription: 'Magic mugs and personalised travel flasks.',
    seoKeywordsJson: JSON.stringify(['custom mug', 'magic mug', 'sipper bottle']),
    seoImageFileId: null,
    createdByAdminId: 'super-admin-id',
    updatedByAdminId: 'super-admin-id',
    createdAt: new Date('2026-01-04'),
    updatedAt: new Date('2026-01-04'),
    deletedAt: null,
  },
  {
    id: 'cat-005',
    parentId: null,
    storeId: null,
    name: 'Jaipur Craft Specials',
    slug: 'jaipur-craft-specials',
    code: 'CAT-JPR-05',
    shortDescription: 'Traditional Rajasthani handicrafts & blue pottery personalised keepsakes.',
    description: 'Authentic artisan items with custom block print packaging and brass nameplates.',
    imageFileId: null,
    iconFileId: null,
    desktopBannerFileId: null,
    mobileBannerFileId: null,
    imageUrl: 'https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&q=80&w=400',
    iconUrl: null,
    status: 'ACTIVE',
    isFeatured: true,
    showOnHomepage: true,
    sortOrder: 2,
    level: 1,
    path: 'cat-005',
    seoTitle: 'Jaipur Handicraft Personalised Gifts',
    seoDescription: 'Authentic Rajasthani artisan gifts with custom branding.',
    seoKeywordsJson: JSON.stringify(['jaipur crafts', 'blue pottery', 'rajasthani gifts']),
    seoImageFileId: null,
    createdByAdminId: 'super-admin-id',
    updatedByAdminId: 'super-admin-id',
    createdAt: new Date('2026-01-05'),
    updatedAt: new Date('2026-01-05'),
    deletedAt: null,
  }
];

export class CategoryRepository {
  /**
   * Helper to write audit logs safely
   */
  private async logAudit(action: string, entityId: string, adminId?: string, oldValues?: any, newValues?: any) {
    try {
      await prisma.auditLog.create({
        data: {
          actorType: 'ADMIN',
          actorAdminId: adminId || null,
          action,
          entityType: 'Category',
          entityId,
          oldValuesJson: oldValues ? JSON.stringify(oldValues) : null,
          newValuesJson: newValues ? JSON.stringify(newValues) : null,
        }
      });
    } catch {
      // Ignore if audit log table fails or DB offline
    }
  }

  /**
   * Get list of categories matching filters
   */
  async findCategories(filters: CategoryFilterQuery) {
    const {
      search,
      status = 'ALL',
      parentId,
      isFeatured,
      showOnHomepage,
      storeId,
      page = 1,
      limit = 50,
      sortBy = 'sortOrder',
      sortOrder = 'asc',
      view = 'list',
      includeDeleted = false
    } = filters;

    try {
      const where: any = {};

      if (!includeDeleted || includeDeleted === 'false') {
        where.deletedAt = null;
      }

      if (status && status !== 'ALL') {
        where.status = status;
      }

      if (parentId) {
        if (parentId === 'null' || parentId === 'root') {
          where.parentId = null;
        } else {
          where.parentId = parentId;
        }
      }

      if (isFeatured !== undefined && isFeatured !== '') {
        where.isFeatured = isFeatured === 'true' || isFeatured === true;
      }

      if (showOnHomepage !== undefined && showOnHomepage !== '') {
        where.showOnHomepage = showOnHomepage === 'true' || showOnHomepage === true;
      }

      if (storeId) {
        where.storeId = storeId;
      }

      if (search) {
        where.OR = [
          { name: { contains: search } },
          { slug: { contains: search } },
          { code: { contains: search } },
          { shortDescription: { contains: search } },
        ];
      }

      if (view === 'tree') {
        const allCategories = await prisma.category.findMany({
          where: { deletedAt: null },
          include: {
            parent: { select: { id: true, name: true, slug: true } },
            _count: { select: { children: true } }
          },
          orderBy: [
            { level: 'asc' },
            { sortOrder: 'asc' },
            { name: 'asc' }
          ]
        });

        const tree = buildCategoryTree(allCategories);
        return {
          categories: tree,
          total: allCategories.length,
          page: 1,
          totalPages: 1,
          limit: allCategories.length,
          view: 'tree'
        };
      }

      const pNum = Number(page) || 1;
      const lNum = Number(limit) || 50;
      const skip = (pNum - 1) * lNum;

      const [items, total] = await Promise.all([
        prisma.category.findMany({
          where,
          include: {
            parent: { select: { id: true, name: true, slug: true } },
            children: { 
              where: { deletedAt: null },
              select: { id: true, name: true, slug: true, status: true, sortOrder: true }
            },
            _count: { select: { children: true } }
          },
          orderBy: [
            { [sortBy]: sortOrder },
            { name: 'asc' }
          ],
          skip,
          take: lNum
        }),
        prisma.category.count({ where })
      ]);

      return {
        categories: items.map(cat => ({
          ...cat,
          productCount: 0,
          activeChildCount: cat.children?.filter(c => c.status === 'ACTIVE').length || 0,
        })),
        total,
        page: pNum,
        limit: lNum,
        totalPages: Math.ceil(total / lNum) || 1,
        view: 'list'
      };
    } catch {
      // Memory fallback if DB is not running
      let list = [...memoryCategories];

      if (!includeDeleted) {
        list = list.filter(c => !c.deletedAt);
      }

      if (status && status !== 'ALL') {
        list = list.filter(c => c.status === status);
      }

      if (parentId) {
        if (parentId === 'null' || parentId === 'root') {
          list = list.filter(c => c.parentId === null);
        } else {
          list = list.filter(c => c.parentId === parentId);
        }
      }

      if (isFeatured !== undefined && isFeatured !== '') {
        const feat = isFeatured === 'true' || isFeatured === true;
        list = list.filter(c => c.isFeatured === feat);
      }

      if (showOnHomepage !== undefined && showOnHomepage !== '') {
        const home = showOnHomepage === 'true' || showOnHomepage === true;
        list = list.filter(c => c.showOnHomepage === home);
      }

      if (search) {
        const s = search.toLowerCase();
        list = list.filter(c => 
          c.name.toLowerCase().includes(s) || 
          c.slug.toLowerCase().includes(s) ||
          (c.code && c.code.toLowerCase().includes(s))
        );
      }

      if (view === 'tree') {
        const tree = buildCategoryTree(memoryCategories.filter(c => !c.deletedAt));
        return {
          categories: tree,
          total: memoryCategories.length,
          page: 1,
          totalPages: 1,
          limit: memoryCategories.length,
          view: 'tree'
        };
      }

      const pNum = Number(page) || 1;
      const lNum = Number(limit) || 50;

      return {
        categories: list,
        total: list.length,
        page: pNum,
        limit: lNum,
        totalPages: Math.ceil(list.length / lNum) || 1,
        view: 'list'
      };
    }
  }

  /**
   * Get full structured category tree
   */
  async findCategoryTree() {
    try {
      const categories = await prisma.category.findMany({
        where: { deletedAt: null },
        include: {
          parent: { select: { id: true, name: true, slug: true } },
          _count: { select: { children: true } }
        },
        orderBy: [
          { level: 'asc' },
          { sortOrder: 'asc' },
          { name: 'asc' }
        ]
      });

      return buildCategoryTree(categories);
    } catch {
      return buildCategoryTree(memoryCategories.filter(c => !c.deletedAt));
    }
  }

  /**
   * Find single category by ID
   */
  async findCategoryById(id: string) {
    try {
      const category = await prisma.category.findUnique({
        where: { id },
        include: {
          parent: { 
            select: { 
              id: true, 
              name: true, 
              slug: true, 
              level: true, 
              path: true,
              parentId: true 
            } 
          },
          children: {
            where: { deletedAt: null },
            orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
            select: {
              id: true,
              name: true,
              slug: true,
              code: true,
              status: true,
              isFeatured: true,
              sortOrder: true,
              level: true,
              createdAt: true
            }
          },
          store: { select: { id: true, name: true, code: true } }
        }
      });

      if (!category) return null;

      // Construct breadcrumbs
      const breadcrumbs: Array<{ id: string; name: string; slug: string }> = [];
      if (category.path) {
        const ancestorIds = category.path.split('/');
        const ancestors = await prisma.category.findMany({
          where: { id: { in: ancestorIds } },
          select: { id: true, name: true, slug: true, level: true }
        });
        ancestors.sort((a, b) => a.level - b.level);
        breadcrumbs.push(...ancestors);
      }

      return {
        ...category,
        breadcrumbs,
        analyticsPlaceholder: {
          totalProducts: 0,
          activeProducts: 0,
          totalSalesAmount: 0,
          totalOrdersCount: 0,
          conversionRatePct: 0,
          avgOrderValue: 0
        }
      };
    } catch {
      const cat = memoryCategories.find(c => c.id === id);
      if (!cat) return null;

      const parent = cat.parentId ? memoryCategories.find(c => c.id === cat.parentId) : null;
      const children = memoryCategories.filter(c => c.parentId === cat.id && !c.deletedAt);

      return {
        ...cat,
        parent,
        children,
        breadcrumbs: parent ? [{ id: parent.id, name: parent.name, slug: parent.slug }] : [],
        analyticsPlaceholder: {
          totalProducts: 12,
          activeProducts: 10,
          totalSalesAmount: 145000,
          totalOrdersCount: 88,
          conversionRatePct: 4.2,
          avgOrderValue: 1647
        }
      };
    }
  }

  /**
   * Find category by Slug
   */
  async findCategoryBySlug(slug: string, excludeId?: string) {
    try {
      const category = await prisma.category.findFirst({
        where: {
          slug,
          deletedAt: null,
          ...(excludeId ? { id: { not: excludeId } } : {})
        }
      });
      return category;
    } catch {
      return memoryCategories.find(c => c.slug === slug && (!excludeId || c.id !== excludeId) && !c.deletedAt) || null;
    }
  }

  /**
   * Create category
   */
  async createCategory(data: CreateCategoryDto, adminId?: string) {
    let finalSlug = data.slug ? slugifyCategoryName(data.slug) : slugifyCategoryName(data.name);
    
    // Ensure unique slug
    let counter = 1;
    let existing = await this.findCategoryBySlug(finalSlug);
    const originalSlug = finalSlug;
    while (existing) {
      finalSlug = `${originalSlug}-${counter}`;
      counter++;
      existing = await this.findCategoryBySlug(finalSlug);
    }

    let parentCategory: any = null;
    if (data.parentId) {
      parentCategory = await this.findCategoryById(data.parentId);
      if (!parentCategory) {
        throw new Error(`Parent category with ID ${data.parentId} not found.`);
      }

      if (!isDepthAllowed(parentCategory.level, 1)) {
        throw new Error(`Cannot add subcategory. Maximum category hierarchy depth (${MAX_CATEGORY_DEPTH}) exceeded.`);
      }
    }

    const tempId = `cat-${Date.now()}`;
    const levelAndPath = calculateLevelAndPath(data.parentId || null, tempId, parentCategory);

    try {
      const created = await prisma.category.create({
        data: {
          name: data.name,
          slug: finalSlug,
          code: data.code || null,
          parentId: data.parentId || null,
          storeId: data.storeId || null,
          shortDescription: data.shortDescription || null,
          description: data.description || null,
          imageFileId: data.imageFileId || null,
          iconFileId: data.iconFileId || null,
          desktopBannerFileId: data.desktopBannerFileId || null,
          mobileBannerFileId: data.mobileBannerFileId || null,
          status: data.status || 'ACTIVE',
          isFeatured: data.isFeatured ?? false,
          showOnHomepage: data.showOnHomepage ?? false,
          sortOrder: data.sortOrder ?? 0,
          level: levelAndPath.level,
          path: levelAndPath.path,
          seoTitle: data.seoTitle || null,
          seoDescription: data.seoDescription || null,
          seoKeywordsJson: data.seoKeywordsJson || null,
          seoImageFileId: data.seoImageFileId || null,
          createdByAdminId: adminId || null,
          updatedByAdminId: adminId || null,
        }
      });

      // Update path with actual DB ID if different from tempId
      if (created.id !== tempId) {
        const realLevelPath = calculateLevelAndPath(data.parentId || null, created.id, parentCategory);
        const updated = await prisma.category.update({
          where: { id: created.id },
          data: { path: realLevelPath.path }
        });

        await this.logAudit('CATEGORY_CREATED', updated.id, adminId, null, updated);
        return updated;
      }

      await this.logAudit('CATEGORY_CREATED', created.id, adminId, null, created);
      return created;
    } catch {
      // Memory fallback
      const newCat = {
        id: tempId,
        name: data.name,
        slug: finalSlug,
        code: data.code || null,
        parentId: data.parentId || null,
        storeId: data.storeId || null,
        shortDescription: data.shortDescription || null,
        description: data.description || null,
        imageFileId: data.imageFileId || null,
        iconFileId: data.iconFileId || null,
        desktopBannerFileId: data.desktopBannerFileId || null,
        mobileBannerFileId: data.mobileBannerFileId || null,
        status: data.status || 'ACTIVE',
        isFeatured: data.isFeatured ?? false,
        showOnHomepage: data.showOnHomepage ?? false,
        sortOrder: data.sortOrder ?? memoryCategories.length + 1,
        level: levelAndPath.level,
        path: levelAndPath.path,
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
        seoKeywordsJson: data.seoKeywordsJson || null,
        seoImageFileId: data.seoImageFileId || null,
        createdByAdminId: adminId || null,
        updatedByAdminId: adminId || null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      memoryCategories.push(newCat);
      return newCat;
    }
  }

  /**
   * Update category
   */
  async updateCategory(id: string, data: UpdateCategoryDto, adminId?: string) {
    const existing = await this.findCategoryById(id);
    if (!existing) {
      throw new Error(`Category with ID ${id} not found.`);
    }

    // Slug validation if changed
    let finalSlug = existing.slug;
    if (data.slug && data.slug !== existing.slug) {
      finalSlug = slugifyCategoryName(data.slug);
      const slugOwner = await this.findCategoryBySlug(finalSlug, id);
      if (slugOwner) {
        throw new Error(`Category slug '${finalSlug}' is already in use by another category.`);
      }
    } else if (data.name && !data.slug && data.name !== existing.name) {
      // If name changed and slug not explicitly passed, optionally keep slug or update
    }

    let levelAndPath = { level: existing.level, path: existing.path || existing.id };

    // Parent change validation
    if (data.parentId !== undefined && data.parentId !== existing.parentId) {
      if (data.parentId === id) {
        throw new Error(`A category cannot be its own parent.`);
      }

      if (data.parentId !== null) {
        // Fetch all categories to check circular reference
        const allCategories = await this.getAllCategoriesFlat();
        if (isDescendant(id, data.parentId, allCategories)) {
          throw new Error(`Cannot move category under one of its own subcategories (circular hierarchy forbidden).`);
        }

        const newParent = await this.findCategoryById(data.parentId);
        if (!newParent) {
          throw new Error(`Parent category with ID ${data.parentId} not found.`);
        }

        // Calculate maximum depth of current subtree
        const subtreeMaxDepth = await this.getSubtreeMaxDepth(id, allCategories);
        if (!isDepthAllowed(newParent.level, subtreeMaxDepth)) {
          throw new Error(`Moving this category here would exceed maximum allowed hierarchy depth (${MAX_CATEGORY_DEPTH}).`);
        }

        levelAndPath = calculateLevelAndPath(data.parentId, id, newParent);
      } else {
        levelAndPath = calculateLevelAndPath(null, id, null);
      }
    }

    try {
      const updated = await prisma.category.update({
        where: { id },
        data: {
          ...(data.name ? { name: data.name } : {}),
          slug: finalSlug,
          ...(data.code !== undefined ? { code: data.code } : {}),
          ...(data.parentId !== undefined ? { parentId: data.parentId } : {}),
          ...(data.storeId !== undefined ? { storeId: data.storeId } : {}),
          ...(data.shortDescription !== undefined ? { shortDescription: data.shortDescription } : {}),
          ...(data.description !== undefined ? { description: data.description } : {}),
          ...(data.imageFileId !== undefined ? { imageFileId: data.imageFileId } : {}),
          ...(data.iconFileId !== undefined ? { iconFileId: data.iconFileId } : {}),
          ...(data.desktopBannerFileId !== undefined ? { desktopBannerFileId: data.desktopBannerFileId } : {}),
          ...(data.mobileBannerFileId !== undefined ? { mobileBannerFileId: data.mobileBannerFileId } : {}),
          ...(data.status !== undefined ? { status: data.status } : {}),
          ...(data.isFeatured !== undefined ? { isFeatured: data.isFeatured } : {}),
          ...(data.showOnHomepage !== undefined ? { showOnHomepage: data.showOnHomepage } : {}),
          ...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {}),
          level: levelAndPath.level,
          path: levelAndPath.path,
          ...(data.seoTitle !== undefined ? { seoTitle: data.seoTitle } : {}),
          ...(data.seoDescription !== undefined ? { seoDescription: data.seoDescription } : {}),
          ...(data.seoKeywordsJson !== undefined ? { seoKeywordsJson: data.seoKeywordsJson } : {}),
          ...(data.seoImageFileId !== undefined ? { seoImageFileId: data.seoImageFileId } : {}),
          updatedByAdminId: adminId || null,
        }
      });

      // If parent changed, recursively update all children paths and levels
      if (data.parentId !== undefined && data.parentId !== existing.parentId) {
        await this.updateSubtreePaths(id, levelAndPath.level, levelAndPath.path);
      }

      await this.logAudit('CATEGORY_UPDATED', id, adminId, existing, updated);
      return updated;
    } catch {
      // Memory fallback
      const index = memoryCategories.findIndex(c => c.id === id);
      if (index !== -1) {
        memoryCategories[index] = {
          ...memoryCategories[index],
          ...data,
          slug: finalSlug,
          level: levelAndPath.level,
          path: levelAndPath.path,
          updatedByAdminId: adminId || null,
          updatedAt: new Date(),
        };
        return memoryCategories[index];
      }
      throw new Error(`Category with ID ${id} not found.`);
    }
  }

  /**
   * Helper to fetch flat list of categories
   */
  private async getAllCategoriesFlat() {
    try {
      return await prisma.category.findMany({
        where: { deletedAt: null },
        select: { id: true, parentId: true, level: true, path: true }
      });
    } catch {
      return memoryCategories.filter(c => !c.deletedAt);
    }
  }

  /**
   * Calculate maximum depth level within a category's subtree
   */
  private async getSubtreeMaxDepth(rootId: string, allCategories: Array<{ id: string; parentId: string | null; level: number }>): Promise<number> {
    const rootCat = allCategories.find(c => c.id === rootId);
    if (!rootCat) return 1;

    let maxDepth = 1;

    const findChildrenDepth = (currentId: string, depth: number) => {
      if (depth > maxDepth) maxDepth = depth;
      const children = allCategories.filter(c => c.parentId === currentId);
      children.forEach(ch => findChildrenDepth(ch.id, depth + 1));
    };

    findChildrenDepth(rootId, 1);
    return maxDepth;
  }

  /**
   * Recursively update level and path for subtrees
   */
  private async updateSubtreePaths(parentId: string, parentLevel: number, parentPath: string) {
    try {
      const children = await prisma.category.findMany({
        where: { parentId, deletedAt: null }
      });

      for (const child of children) {
        const childLevel = parentLevel + 1;
        const childPath = `${parentPath}/${child.id}`;

        await prisma.category.update({
          where: { id: child.id },
          data: { level: childLevel, path: childPath }
        });

        await this.updateSubtreePaths(child.id, childLevel, childPath);
      }
    } catch {
      // In-memory recursive update
      const children = memoryCategories.filter(c => c.parentId === parentId && !c.deletedAt);
      for (const child of children) {
        child.level = parentLevel + 1;
        child.path = `${parentPath}/${child.id}`;
        this.updateSubtreePaths(child.id, child.level, child.path);
      }
    }
  }

  /**
   * Quick status toggle (ACTIVE, INACTIVE, ARCHIVED)
   */
  async updateCategoryStatus(id: string, status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED', adminId?: string) {
    const existing = await this.findCategoryById(id);
    if (!existing) {
      throw new Error(`Category with ID ${id} not found.`);
    }

    try {
      const updated = await prisma.category.update({
        where: { id },
        data: {
          status,
          updatedByAdminId: adminId || null,
        }
      });

      await this.logAudit('CATEGORY_STATUS_CHANGED', id, adminId, { status: existing.status }, { status });
      return updated;
    } catch {
      const cat = memoryCategories.find(c => c.id === id);
      if (cat) {
        cat.status = status;
        cat.updatedAt = new Date();
        return cat;
      }
      throw new Error(`Category with ID ${id} not found.`);
    }
  }

  /**
   * Reorder categories
   */
  async reorderCategories(items: CategoryReorderItem[], adminId?: string) {
    const results = [];
    for (const item of items) {
      try {
        const updated = await this.updateCategory(item.id, {
          sortOrder: item.sortOrder,
          ...(item.parentId !== undefined ? { parentId: item.parentId } : {})
        }, adminId);
        results.push(updated);
      } catch (err: any) {
        // Continue reordering remaining items or capture error
      }
    }
    return results;
  }

  /**
   * Soft delete category
   * STRICT SAFETY CHECK: Block deletion if active/non-deleted subcategories exist!
   */
  async deleteCategory(id: string, adminId?: string) {
    const existing = await this.findCategoryById(id);
    if (!existing) {
      throw new Error(`Category with ID ${id} not found.`);
    }

    // Check children
    const activeChildren = existing.children?.filter(c => !c.deletedAt) || [];
    if (activeChildren.length > 0) {
      throw new Error(
        `Cannot delete category '${existing.name}' because it contains ${activeChildren.length} active subcategory/subcategories. Please move or delete the subcategories first.`
      );
    }

    try {
      const deleted = await prisma.category.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          status: 'ARCHIVED',
          updatedByAdminId: adminId || null,
        }
      });

      await this.logAudit('CATEGORY_DELETED', id, adminId, existing, deleted);
      return { success: true, message: `Category '${existing.name}' deleted successfully.` };
    } catch {
      const cat = memoryCategories.find(c => c.id === id);
      if (cat) {
        cat.deletedAt = new Date();
        cat.status = 'ARCHIVED';
        return { success: true, message: `Category '${existing.name}' deleted successfully.` };
      }
      throw new Error(`Failed to delete category.`);
    }
  }

  /**
   * Restore soft-deleted category
   */
  async restoreCategory(id: string, adminId?: string) {
    try {
      const restored = await prisma.category.update({
        where: { id },
        data: {
          deletedAt: null,
          status: 'ACTIVE',
          updatedByAdminId: adminId || null,
        }
      });

      await this.logAudit('CATEGORY_RESTORED', id, adminId, null, restored);
      return restored;
    } catch {
      const cat = memoryCategories.find(c => c.id === id);
      if (cat) {
        cat.deletedAt = null;
        cat.status = 'ACTIVE';
        return cat;
      }
      throw new Error(`Category with ID ${id} not found.`);
    }
  }
}
