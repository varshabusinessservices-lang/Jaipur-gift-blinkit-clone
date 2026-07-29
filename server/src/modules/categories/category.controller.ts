import { Request, Response } from 'express';
import { CategoryService } from './category.service';
import { CategoryFilterQuery, CreateCategoryDto, UpdateCategoryDto } from './category.types';
import { prisma } from '../../database/prisma';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const categoryService = new CategoryService();

export const getCategories = async (req: Request, res: Response) => {
  try {
    const filters: CategoryFilterQuery = {
      search: req.query.search as string,
      status: req.query.status as any,
      parentId: req.query.parentId as string,
      isFeatured: req.query.isFeatured as string,
      showOnHomepage: req.query.showOnHomepage as string,
      storeId: req.query.storeId as string,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 50,
      sortBy: (req.query.sortBy as any) || 'sortOrder',
      sortOrder: (req.query.sortOrder as any) || 'asc',
      view: (req.query.view as any) || 'list',
      includeDeleted: req.query.includeDeleted as string,
    };

    const result = await categoryService.getCategories(filters);
    res.json({
      success: true,
      data: result.categories,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        view: result.view,
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch categories' });
  }
};

export const getCategoryTree = async (req: Request, res: Response) => {
  try {
    const tree = await categoryService.getCategoryTree();
    res.json({
      success: true,
      data: tree,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch category tree' });
  }
};

export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const category = await categoryService.getCategoryById(id);
    res.json({
      success: true,
      data: category,
    });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message || 'Category not found' });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const dto: CreateCategoryDto = req.body;
    const category = await categoryService.createCategory(dto, user?.id);

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to create category' });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;
    const dto: UpdateCategoryDto = req.body;

    const category = await categoryService.updateCategory(id, dto, user?.id);
    res.json({
      success: true,
      message: 'Category updated successfully',
      data: category,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to update category' });
  }
};

export const updateCategoryStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user = (req as any).user;

    if (!['ACTIVE', 'INACTIVE', 'ARCHIVED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value. Must be ACTIVE, INACTIVE, or ARCHIVED.' });
    }

    const category = await categoryService.updateCategoryStatus(id, status, user?.id);
    res.json({
      success: true,
      message: `Category status updated to ${status}`,
      data: category,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to update category status' });
  }
};

export const reorderCategories = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { items } = req.body;

    const result = await categoryService.reorderCategories(items, user?.id);
    res.json({
      success: true,
      message: 'Categories reordered successfully',
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to reorder categories' });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { mode, targetParentId, reason } = req.body || {};
    const user = (req as any).user;

    const result = await categoryService.deleteCategory(id, { mode, targetParentId, reason }, user?.id);
    res.json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error: any) {
    if (error.code === 'CATEGORY_HAS_DESCENDANTS') {
      return res.status(409).json({
        success: false,
        code: 'CATEGORY_HAS_DESCENDANTS',
        message: error.message || 'Category contains active subcategories. Choose a deletion strategy.',
        data: error.data || {}
      });
    }
    res.status(400).json({ success: false, message: error.message || 'Failed to delete category' });
  }
};

export const restoreCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    const restored = await categoryService.restoreCategory(id, user?.id);
    res.json({
      success: true,
      message: 'Category restored successfully',
      data: restored,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to restore category' });
  }
};

export const uploadCategoryMedia = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const file = req.file;
    const role = (req.body.role as any) || 'CATEGORY_IMAGE';

    if (!file) {
      return res.status(400).json({ success: false, message: 'No media file uploaded.' });
    }

    let extension = '.png';
    if (file.mimetype === 'image/jpeg') extension = '.jpg';
    if (file.mimetype === 'image/webp') extension = '.webp';
    if (file.mimetype === 'image/svg+xml') extension = '.svg';

    const storedName = `${crypto.randomUUID()}${extension}`;

    // Write file to disk
    const physicalPath = path.join(process.cwd(), 'uploads', 'categories', storedName);
    fs.mkdirSync(path.dirname(physicalPath), { recursive: true });
    fs.writeFileSync(physicalPath, file.buffer);

    try {
      const fileAsset = await prisma.fileAsset.create({
        data: {
          ownerType: 'CATEGORY',
          role: role,
          visibility: 'PUBLIC',
          status: 'ACTIVE',
          originalName: file.originalname,
          storedName: storedName,
          storageDisk: 'local',
          storagePath: `/uploads/categories/${storedName}`,
          mimeType: file.mimetype,
          extension: extension,
          sizeBytes: file.size,
        }
      });

      res.status(201).json({
        success: true,
        message: 'Category media uploaded successfully',
        data: {
          fileAssetId: fileAsset.id,
          originalName: fileAsset.originalName,
          url: fileAsset.storagePath,
          role: fileAsset.role,
        }
      });
    } catch {
      // JSON Storage Fallback for FileAsset
      const assetId = crypto.randomUUID();
      const relativeUrl = `/uploads/categories/${storedName}`;
      const newAsset = {
        id: assetId,
        ownerType: 'CATEGORY',
        role: role,
        visibility: 'PUBLIC',
        status: 'ACTIVE',
        originalName: file.originalname,
        storedName: storedName,
        storageDisk: 'local',
        storagePath: relativeUrl,
        mimeType: file.mimetype,
        extension: extension,
        sizeBytes: file.size,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      try {
        const fileAssetsFilePath = path.join(process.cwd(), 'server', 'src', 'modules', 'customerUploads', 'fileAssets.json');
        let assets: any[] = [];
        if (fs.existsSync(fileAssetsFilePath)) {
          assets = JSON.parse(fs.readFileSync(fileAssetsFilePath, 'utf-8'));
        }
        assets.push(newAsset);
        fs.writeFileSync(fileAssetsFilePath, JSON.stringify(assets, null, 2), 'utf-8');
      } catch (fErr) {
        console.error('Failed to write to fileAssets.json:', fErr);
      }

      res.status(201).json({
        success: true,
        message: 'Category media uploaded successfully',
        data: {
          fileAssetId: assetId,
          originalName: file.originalname,
          url: relativeUrl,
          role: role,
        }
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to upload category media' });
  }
};


export const createParentCategory = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const dto: CreateCategoryDto = req.body;
    dto.parentId = null;
    dto.level = 1;
    dto.categoryType = 'PARENT';
    const category = await categoryService.createCategory(dto, user?.id);
    res.status(201).json({ success: true, message: 'Parent Category created successfully', data: category });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to create parent category' });
  }
};

export const createChildCategory = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const dto: CreateCategoryDto = req.body;
    if (!dto.parentId) throw new Error('Parent ID is required for a Child Category.');
    
    const parent = await categoryService.getCategoryById(dto.parentId);
    if (parent.level !== 1 || parent.categoryType !== 'PARENT') {
       throw new Error('Child Category must belong to a LEVEL 1 Parent Category.');
    }
    
    dto.level = 2;
    dto.categoryType = 'CHILD';
    const category = await categoryService.createCategory(dto, user?.id);
    res.status(201).json({ success: true, message: 'Child Category created successfully', data: category });
  } catch (error: any) {
    res.status(422).json({ success: false, message: error.message || 'Failed to create child category' });
  }
};

export const createSubChildCategory = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const dto: CreateCategoryDto = req.body;
    if (!dto.parentId) throw new Error('Parent ID is required for a Sub-Child Category.');
    
    const parent = await categoryService.getCategoryById(dto.parentId);
    if (parent.level !== 2 || parent.categoryType !== 'CHILD') {
       throw new Error('Sub-Child Category must belong to a LEVEL 2 Child Category.');
    }
    
    dto.level = 3;
    dto.categoryType = 'SUB_CHILD';
    const category = await categoryService.createCategory(dto, user?.id);
    res.status(201).json({ success: true, message: 'Sub-Child Category created successfully', data: category });
  } catch (error: any) {
    res.status(422).json({ success: false, message: error.message || 'Failed to create sub-child category' });
  }
};

export const getParentCategories = async (req: Request, res: Response) => {
  try {
    const categories = await categoryService.getCategories({ ...req.query, level: 1 } as any);
    res.status(200).json({ success: true, data: categories });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getChildCategories = async (req: Request, res: Response) => {
  try {
    const categories = await categoryService.getCategories({ ...req.query, level: 2 } as any);
    res.status(200).json({ success: true, data: categories });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const moveCategory = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const id = req.params.id;
    const { parentId } = req.body;
    
    // basic validation
    if (id === parentId) throw new Error('Category cannot be its own parent.');
    
    const dto: any = { parentId };
    const category = await categoryService.updateCategory(id, dto, user?.id);
    res.status(200).json({ success: true, message: 'Category moved successfully', data: category });
  } catch (error: any) {
    res.status(422).json({ success: false, message: error.message });
  }
};
