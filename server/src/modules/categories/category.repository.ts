import fs from 'fs';
import path from 'path';
import { prisma, shouldAllowFallback } from '../../database/prisma';
import { 
  CategoryFilterQuery, 
  CreateCategoryDto, 
  UpdateCategoryDto, 
  CategoryReorderItem,
  CategoryTreeNode,
  DeleteCategoryOptions,
  DeleteCategoryMode
} from './category.types';
import { 
  slugifyCategoryName, 
  calculateLevelAndPath, 
  isDepthAllowed, 
  buildCategoryTree, 
  isDescendant,
  resolveMediaUrl,
  MAX_CATEGORY_DEPTH
} from './category.utils';

const CATEGORIES_FILE = path.join(process.cwd(), 'server', 'src', 'modules', 'categories', 'categories.json');

// Default initial category seed
const initialCategories: any[] = [
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

function loadCategoriesFromStorage(): any[] {
  try {
    if (fs.existsSync(CATEGORIES_FILE)) {
      const raw = fs.readFileSync(CATEGORIES_FILE, 'utf-8');
      const data = JSON.parse(raw);
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.error('Error loading categories from categories.json:', err);
  }
  return [...initialCategories];
}

function saveCategoriesToStorage(categories: any[]) {
  try {
    const dir = path.dirname(CATEGORIES_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(categories, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving categories to categories.json:', err);
  }
}

// Memory category store initialized from storage
const memoryCategories: any[] = loadCategoriesFromStorage();

export class CategoryRepository {
  /**
   * Enriches category objects with media asset objects and resolved URLs.
   */
  async enrichCategoriesWithMedia(categories: any[]) {
    if (!categories || categories.length === 0) return [];

    const fileAssetIds = new Set<string>();
    categories.forEach((cat) => {
      if (cat.imageFileId) fileAssetIds.add(cat.imageFileId);
      if (cat.mobileImageFileId) fileAssetIds.add(cat.mobileImageFileId);
      if (cat.iconFileId) fileAssetIds.add(cat.iconFileId);
      if (cat.desktopBannerFileId) fileAssetIds.add(cat.desktopBannerFileId);
      if (cat.mobileBannerFileId) fileAssetIds.add(cat.mobileBannerFileId);
      if (cat.seoImageFileId) fileAssetIds.add(cat.seoImageFileId);
    });

    const fileAssetMap = new Map<string, any>();
    if (fileAssetIds.size > 0) {
      try {
        const assets = await prisma.fileAsset.findMany({
          where: { id: { in: Array.from(fileAssetIds) } },
        });
        assets.forEach((asset) => fileAssetMap.set(asset.id, asset));
      } catch {
        // Fallback: Read from fileAssets.json
        try {
          const fileAssetsFilePath = path.join(process.cwd(), 'server', 'src', 'modules', 'customerUploads', 'fileAssets.json');
          if (fs.existsSync(fileAssetsFilePath)) {
            const raw = fs.readFileSync(fileAssetsFilePath, 'utf-8');
            const assets = JSON.parse(raw);
            assets.forEach((a: any) => {
              if (fileAssetIds.has(a.id)) {
                fileAssetMap.set(a.id, a);
              }
            });
          }
        } catch (fErr) {
          console.error('Failed to read fileAssets.json in CategoryRepository:', fErr);
        }
      }
    }

    return categories.map((cat) => {
      const mainAsset = cat.imageFileId ? fileAssetMap.get(cat.imageFileId) : null;
      const mobileAsset = cat.mobileImageFileId ? fileAssetMap.get(cat.mobileImageFileId) : null;
      const iconAsset = cat.iconFileId ? fileAssetMap.get(cat.iconFileId) : null;
      const desktopBannerAsset = cat.desktopBannerFileId ? fileAssetMap.get(cat.desktopBannerFileId) : null;
      const mobileBannerAsset = cat.mobileBannerFileId ? fileAssetMap.get(cat.mobileBannerFileId) : null;

      const mainImageUrl = resolveMediaUrl(mainAsset?.storagePath || cat.imageUrl);
      const mobileImageUrl = resolveMediaUrl(mobileAsset?.storagePath || cat.mobileImageUrl);
      const iconUrl = resolveMediaUrl(iconAsset?.storagePath || cat.iconUrl);
      const desktopBannerUrl = resolveMediaUrl(desktopBannerAsset?.storagePath || cat.desktopBannerUrl);
      const mobileBannerUrl = resolveMediaUrl(mobileBannerAsset?.storagePath || cat.mobileBannerUrl);

      return {
        ...cat,
        imageUrl: mainImageUrl,
        mobileImageUrl: mobileImageUrl,
        iconUrl: iconUrl,
        desktopBannerUrl: desktopBannerUrl,
        mobileBannerUrl: mobileBannerUrl,

        mainImage: mainImageUrl
          ? {
              id: cat.imageFileId || 'media-main',
              url: mainImageUrl,
              alt: cat.imageAltText || cat.name,
            }
          : null,
        mobileImage: mobileImageUrl
          ? {
              id: cat.mobileImageFileId || 'media-mobile',
              url: mobileImageUrl,
              alt: cat.imageAltText || cat.name,
            }
          : null,
        navigationIcon: iconUrl
          ? {
              id: cat.iconFileId || 'media-icon',
              url: iconUrl,
              alt: cat.name,
            }
          : null,
        desktopBanner: desktopBannerUrl
          ? {
              id: cat.desktopBannerFileId || 'media-dt-banner',
              url: desktopBannerUrl,
              alt: cat.bannerAltText || cat.name,
            }
          : null,
        mobileBanner: mobileBannerUrl
          ? {
              id: cat.mobileBannerFileId || 'media-mb-banner',
              url: mobileBannerUrl,
              alt: cat.bannerAltText || cat.name,
            }
          : null,
      };
    });
  }

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

        const enriched = await this.enrichCategoriesWithMedia(allCategories);
        const tree = buildCategoryTree(enriched);
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

      const enrichedItems = await this.enrichCategoriesWithMedia(items);

      return {
        categories: enrichedItems.map(cat => ({
          ...cat,
          productCount: 0,
          activeChildCount: cat.children?.filter((c: any) => c.status === 'ACTIVE').length || 0,
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

      const enriched = await this.enrichCategoriesWithMedia(categories);
      return buildCategoryTree(enriched);
    } catch (err) {
      if (!shouldAllowFallback()) throw err;
      const enrichedMemory = await this.enrichCategoriesWithMedia(memoryCategories.filter(c => !c.deletedAt));
      return buildCategoryTree(enrichedMemory);
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

      const enrichedList = await this.enrichCategoriesWithMedia([category]);
      const enrichedCat = enrichedList[0];

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
        ...enrichedCat,
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
    } catch (err) {
      if (!shouldAllowFallback()) throw err;
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
    } catch (err) {
      if (!shouldAllowFallback()) throw err;
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

    const normalizedParentId = (data.parentId && data.parentId !== 'null' && data.parentId !== 'undefined' && data.parentId.trim() !== '') ? data.parentId.trim() : null;

    let parentCategory: any = null;
    if (normalizedParentId) {
      parentCategory = await this.findCategoryById(normalizedParentId);
      if (!parentCategory) {
        throw new Error(`Parent category with ID ${normalizedParentId} not found.`);
      }

      if (!isDepthAllowed(parentCategory.level, 1)) {
        throw new Error(`Cannot add subcategory. Maximum category hierarchy depth (${MAX_CATEGORY_DEPTH}) exceeded.`);
      }
    }

    const tempId = `cat-${Date.now()}`;
    const levelAndPath = calculateLevelAndPath(normalizedParentId, tempId, parentCategory);

    try {
      const created = await prisma.category.create({
        data: {
          name: data.name,
          slug: finalSlug,
          code: data.code || null,
          parentId: normalizedParentId,
          storeId: data.storeId || null,
          shortDescription: data.shortDescription || null,
          description: data.description || null,
          imageFileId: data.imageFileId || null,
          iconFileId: data.iconFileId || null,
          desktopBannerFileId: data.desktopBannerFileId || null,
          mobileBannerFileId: data.mobileBannerFileId || null,
          categoryType: data.categoryType || (normalizedParentId ? "CHILD" : "PARENT"),
          mobileImageFileId: data.mobileImageFileId || null,
          showInNavigation: data.showInNavigation !== undefined ? data.showInNavigation : true,
          showInSearch: data.showInSearch !== undefined ? data.showInSearch : true,
          showOnDesktop: data.showOnDesktop !== undefined ? data.showOnDesktop : true,
          showOnMobile: data.showOnMobile !== undefined ? data.showOnMobile : true,
          imageAltText: data.imageAltText || null,
          bannerAltText: data.bannerAltText || null,
          bgColour: data.bgColour || null,
          textColour: data.textColour || null,
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

      // Update path with actual DB ID
      const realLevelPath = calculateLevelAndPath(normalizedParentId, created.id, parentCategory);
      const updated = await prisma.category.update({
        where: { id: created.id },
        data: { path: realLevelPath.path }
      });

      await this.logAudit('CATEGORY_CREATED', updated.id, adminId, null, updated);
      const memIdx = memoryCategories.findIndex(c => c.id === updated.id);
      if (memIdx !== -1) memoryCategories[memIdx] = updated;
      else memoryCategories.push(updated);
      saveCategoriesToStorage(memoryCategories);
      const enriched = await this.enrichCategoriesWithMedia([updated]);
      return enriched[0];
    } catch (err: any) {
      if (!shouldAllowFallback()) throw err;
      const newCat = {
        id: tempId,
        name: data.name,
        slug: finalSlug,
        code: data.code || null,
        parentId: normalizedParentId,
        storeId: data.storeId || null,
        shortDescription: data.shortDescription || null,
        description: data.description || null,
        imageFileId: data.imageFileId || null,
        iconFileId: data.iconFileId || null,
        desktopBannerFileId: data.desktopBannerFileId || null,
        mobileBannerFileId: data.mobileBannerFileId || null,
        categoryType: data.categoryType || (normalizedParentId ? "CHILD" : "PARENT"),
        mobileImageFileId: data.mobileImageFileId || null,
        showInNavigation: data.showInNavigation !== undefined ? data.showInNavigation : true,
        showInSearch: data.showInSearch !== undefined ? data.showInSearch : true,
        showOnDesktop: data.showOnDesktop !== undefined ? data.showOnDesktop : true,
        showOnMobile: data.showOnMobile !== undefined ? data.showOnMobile : true,
        imageAltText: data.imageAltText || null,
        bannerAltText: data.bannerAltText || null,
        bgColour: data.bgColour || null,
        textColour: data.textColour || null,
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
      saveCategoriesToStorage(memoryCategories);
      const enriched = await this.enrichCategoriesWithMedia([newCat]);
      return enriched[0];
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
          ...(data.categoryType !== undefined ? { categoryType: data.categoryType } : {}),
          ...(data.mobileImageFileId !== undefined ? { mobileImageFileId: data.mobileImageFileId } : {}),
          ...(data.showInNavigation !== undefined ? { showInNavigation: data.showInNavigation } : {}),
          ...(data.showInSearch !== undefined ? { showInSearch: data.showInSearch } : {}),
          ...(data.showOnDesktop !== undefined ? { showOnDesktop: data.showOnDesktop } : {}),
          ...(data.showOnMobile !== undefined ? { showOnMobile: data.showOnMobile } : {}),
          ...(data.imageAltText !== undefined ? { imageAltText: data.imageAltText } : {}),
          ...(data.bannerAltText !== undefined ? { bannerAltText: data.bannerAltText } : {}),
          ...(data.bgColour !== undefined ? { bgColour: data.bgColour } : {}),
          ...(data.textColour !== undefined ? { textColour: data.textColour } : {}),

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
      const memIdx = memoryCategories.findIndex(c => c.id === updated.id);
      if (memIdx !== -1) memoryCategories[memIdx] = { ...memoryCategories[memIdx], ...updated };
      saveCategoriesToStorage(memoryCategories);
      const enriched = await this.enrichCategoriesWithMedia([updated]);
      return enriched[0];
    } catch (err) {
      if (!shouldAllowFallback()) throw err;
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
        saveCategoriesToStorage(memoryCategories);
        const enriched = await this.enrichCategoriesWithMedia([memoryCategories[index]]);
        return enriched[0];
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
    } catch (err) {
      if (!shouldAllowFallback()) throw err;
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
    } catch (err) {
      if (!shouldAllowFallback()) throw err;
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
    } catch (err) {
      if (!shouldAllowFallback()) throw err;
      const cat = memoryCategories.find(c => c.id === id);
      if (cat) {
        cat.status = status;
        cat.updatedAt = new Date();
        saveCategoriesToStorage(memoryCategories);
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
   * Helper to fetch all active descendant categories recursively
   */
  async getAllDescendantCategories(rootId: string): Promise<any[]> {
    try {
      const all = await prisma.category.findMany({
        where: { deletedAt: null }
      });
      const descendants: any[] = [];
      const collect = (parentId: string) => {
        const children = all.filter(c => c.parentId === parentId);
        children.forEach(ch => {
          descendants.push(ch);
          collect(ch.id);
        });
      };
      collect(rootId);
      return descendants;
    } catch {
      const descendants: any[] = [];
      const collect = (parentId: string) => {
        const children = memoryCategories.filter(c => c.parentId === parentId && !c.deletedAt);
        children.forEach(ch => {
          descendants.push(ch);
          collect(ch.id);
        });
      };
      collect(rootId);
      return descendants;
    }
  }

  /**
   * Soft delete category with flexible strategies:
   * SINGLE (default), CASCADE_DESCENDANTS, MOVE_DESCENDANTS, DEACTIVATE_BRANCH
   */
  async deleteCategory(id: string, options?: DeleteCategoryOptions, adminId?: string) {
    const existing = await this.findCategoryById(id);
    if (!existing) {
      throw new Error(`Category with ID ${id} not found.`);
    }

    const mode = options?.mode || 'SINGLE';
    const targetParentId = options?.targetParentId;
    const descendants = await this.getAllDescendantCategories(id);
    const activeChildren = existing.children?.filter((c: any) => !c.deletedAt) || [];
    const directChildrenCount = activeChildren.length;
    const totalDescendantsCount = descendants.length;

    // Helper to sync memory and json file
    const syncMemoryAndStorageSoftDelete = (targetIds: string[]) => {
      const now = new Date();
      targetIds.forEach(tid => {
        const cat = memoryCategories.find(c => c.id === tid);
        if (cat) {
          cat.deletedAt = now;
          cat.status = 'ARCHIVED';
        }
      });
      saveCategoriesToStorage(memoryCategories);
    };

    const syncMemoryAndStorageStatusChange = (targetIds: string[], newStatus: string) => {
      targetIds.forEach(tid => {
        const cat = memoryCategories.find(c => c.id === tid);
        if (cat) {
          cat.status = newStatus;
          cat.updatedAt = new Date();
        }
      });
      saveCategoriesToStorage(memoryCategories);
    };

    if (mode === 'SINGLE') {
      if (directChildrenCount > 0) {
        const err: any = new Error(
          `Cannot delete category '${existing.name}' because it contains ${directChildrenCount} active subcategory/subcategories.`
        );
        err.code = 'CATEGORY_HAS_DESCENDANTS';
        err.data = {
          categoryId: id,
          categoryName: existing.name,
          directChildrenCount,
          totalDescendantsCount,
        };
        throw err;
      }

      // Perform soft delete on target category
      try {
        await prisma.category.update({
          where: { id },
          data: {
            deletedAt: new Date(),
            status: 'ARCHIVED',
            updatedByAdminId: adminId || null,
          }
        });
      } catch (err) {
        if (!shouldAllowFallback()) throw err;
      }

      syncMemoryAndStorageSoftDelete([id]);
      await this.logAudit('CATEGORY_DELETED', id, adminId, existing, { deletedAt: new Date(), status: 'ARCHIVED' });
      return {
        success: true,
        message: `Category '${existing.name}' deleted successfully.`,
        data: { id, mode: 'SINGLE' }
      };
    }

    if (mode === 'CASCADE_DESCENDANTS') {
      const targetIds = [id, ...descendants.map(d => d.id)];
      try {
        await prisma.category.updateMany({
          where: { id: { in: targetIds } },
          data: {
            deletedAt: new Date(),
            status: 'ARCHIVED',
            updatedByAdminId: adminId || null,
          }
        });
      } catch (err) {
        if (!shouldAllowFallback()) throw err;
      }

      syncMemoryAndStorageSoftDelete(targetIds);
      await this.logAudit('CATEGORY_CASCADE_DELETED', id, adminId, existing, { deletedCount: targetIds.length });
      return {
        success: true,
        message: `Category '${existing.name}' and ${descendants.length} descendant(s) deleted successfully.`,
        data: { id, mode: 'CASCADE_DESCENDANTS', deletedCount: targetIds.length }
      };
    }

    if (mode === 'MOVE_DESCENDANTS') {
      const normTargetParentId = (targetParentId && targetParentId !== 'null' && targetParentId !== 'root') ? targetParentId.trim() : null;

      if (normTargetParentId === id) {
        throw new Error('Cannot move subcategories to the category being deleted.');
      }

      const descendantIds = descendants.map(d => d.id);
      if (normTargetParentId && descendantIds.includes(normTargetParentId)) {
        throw new Error('Cannot move subcategories under one of its own subcategories.');
      }

      let newParentCategory: any = null;
      if (normTargetParentId) {
        newParentCategory = await this.findCategoryById(normTargetParentId);
        if (!newParentCategory) {
          throw new Error(`Target parent category with ID ${normTargetParentId} not found.`);
        }
      }

      // Re-assign direct children
      for (const child of activeChildren) {
        const levelAndPath = calculateLevelAndPath(normTargetParentId, child.id, newParentCategory);
        try {
          await prisma.category.update({
            where: { id: child.id },
            data: {
              parentId: normTargetParentId,
              level: levelAndPath.level,
              path: levelAndPath.path,
              updatedByAdminId: adminId || null,
            }
          });
          await this.updateSubtreePaths(child.id, levelAndPath.level, levelAndPath.path);
        } catch (err) {
          if (!shouldAllowFallback()) throw err;
        }

        // Update memory categories
        const memChild = memoryCategories.find(c => c.id === child.id);
        if (memChild) {
          memChild.parentId = normTargetParentId;
          memChild.level = levelAndPath.level;
          memChild.path = levelAndPath.path;
          this.updateSubtreePaths(child.id, levelAndPath.level, levelAndPath.path);
        }
      }

      // Now soft-delete target category
      try {
        await prisma.category.update({
          where: { id },
          data: {
            deletedAt: new Date(),
            status: 'ARCHIVED',
            updatedByAdminId: adminId || null,
          }
        });
      } catch (err) {
        if (!shouldAllowFallback()) throw err;
      }

      syncMemoryAndStorageSoftDelete([id]);
      await this.logAudit('CATEGORY_MOVED_AND_DELETED', id, adminId, existing, { movedCount: activeChildren.length });
      return {
        success: true,
        message: `Subcategories moved and category '${existing.name}' deleted successfully.`,
        data: { id, mode: 'MOVE_DESCENDANTS', movedCount: activeChildren.length }
      };
    }

    if (mode === 'DEACTIVATE_BRANCH') {
      const targetIds = [id, ...descendants.map(d => d.id)];
      try {
        await prisma.category.updateMany({
          where: { id: { in: targetIds } },
          data: {
            status: 'INACTIVE',
            updatedByAdminId: adminId || null,
          }
        });
      } catch (err) {
        if (!shouldAllowFallback()) throw err;
      }

      syncMemoryAndStorageStatusChange(targetIds, 'INACTIVE');
      await this.logAudit('CATEGORY_BRANCH_DEACTIVATED', id, adminId, existing, { deactivatedCount: targetIds.length });
      return {
        success: true,
        message: `Category '${existing.name}' and ${descendants.length} descendant(s) deactivated successfully.`,
        data: { id, mode: 'DEACTIVATE_BRANCH', deactivatedCount: targetIds.length }
      };
    }

    throw new Error(`Invalid deletion mode: ${mode}`);
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
    } catch (err) {
      if (!shouldAllowFallback()) throw err;
      const cat = memoryCategories.find(c => c.id === id);
      if (cat) {
        cat.deletedAt = null;
        cat.status = 'ACTIVE';
        saveCategoriesToStorage(memoryCategories);
        return cat;
      }
      throw new Error(`Category with ID ${id} not found.`);
    }
  }
}
