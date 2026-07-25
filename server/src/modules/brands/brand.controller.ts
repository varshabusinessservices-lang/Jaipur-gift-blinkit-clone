import { Request, Response } from 'express';
import { BrandService } from './brand.service';
import { BrandFilterQuery, CreateBrandDto, UpdateBrandDto } from './brand.types';

const brandService = new BrandService();

export const getBrands = async (req: Request, res: Response) => {
  try {
    const filters: BrandFilterQuery = {
      search: req.query.search as string,
      status: req.query.status as any,
      featured: req.query.featured as string,
      storeId: req.query.storeId as string,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 20,
      sortBy: (req.query.sortBy as any) || 'sortOrder',
      sortOrder: (req.query.sortOrder as any) || 'asc',
      includeDeleted: req.query.includeDeleted as string,
    };

    const result = await brandService.getBrands(filters);
    res.json({
      success: true,
      data: result.brands,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch brands' });
  }
};

export const getBrandOptions = async (req: Request, res: Response) => {
  try {
    const options = await brandService.getOptions({
      activeOnly: req.query.activeOnly as string,
      search: req.query.search as string,
      storeId: req.query.storeId as string,
    });
    res.json({
      success: true,
      data: options,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch brand options' });
  }
};

export const getBrandById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const brand = await brandService.getBrandById(id);
    res.json({
      success: true,
      data: brand,
    });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message || 'Brand not found' });
  }
};

export const createBrand = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const dto: CreateBrandDto = req.body;
    const brand = await brandService.createBrand(dto, user?.id);

    res.status(201).json({
      success: true,
      message: 'Brand created successfully',
      data: brand,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to create brand' });
  }
};

export const updateBrand = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;
    const dto: UpdateBrandDto = req.body;

    const brand = await brandService.updateBrand(id, dto, user?.id);
    res.json({
      success: true,
      message: 'Brand updated successfully',
      data: brand,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to update brand' });
  }
};

export const updateBrandStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user = (req as any).user;

    const brand = await brandService.updateBrandStatus(id, status, user?.id);
    res.json({
      success: true,
      message: 'Brand status updated successfully',
      data: brand,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to update brand status' });
  }
};

export const updateBrandFeatured = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isFeatured } = req.body;
    const user = (req as any).user;

    const brand = await brandService.updateBrandFeatured(id, isFeatured, user?.id);
    res.json({
      success: true,
      message: 'Brand featured status updated successfully',
      data: brand,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to update brand featured status' });
  }
};

export const reorderBrandsBulk = async (req: Request, res: Response) => {
  try {
    const { items } = req.body;
    const user = (req as any).user;

    const result = await brandService.reorderBrands(items, user?.id);
    res.json({
      success: true,
      message: 'Brands reordered successfully',
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to reorder brands' });
  }
};

export const deleteBrand = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    const result = await brandService.deleteBrand(id, user?.id);
    res.json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to delete brand' });
  }
};

export const restoreBrand = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    const brand = await brandService.restoreBrand(id, user?.id);
    res.json({
      success: true,
      message: 'Brand restored successfully',
      data: brand,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to restore brand' });
  }
};

export const duplicateBrand = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    const existing = await brandService.getBrandById(id);
    const duplicated = await brandService.createBrand({
      name: `${existing.name} (Copy)`,
      code: existing.code ? `${existing.code}-COPY` : null,
      description: existing.description,
      shortDescription: existing.shortDescription,
      logoFileId: existing.logoFileId,
      bannerFileId: existing.bannerFileId,
      seoImageFileId: existing.seoImageFileId,
      websiteUrl: existing.websiteUrl,
      status: 'INACTIVE',
      isFeatured: false,
      sortOrder: existing.sortOrder + 1,
      seoTitle: existing.seoTitle,
      seoDescription: existing.seoDescription,
      seoKeywordsJson: existing.seoKeywordsJson,
    }, user?.id);

    res.status(201).json({
      success: true,
      message: 'Brand duplicated successfully',
      data: duplicated,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to duplicate brand' });
  }
};
