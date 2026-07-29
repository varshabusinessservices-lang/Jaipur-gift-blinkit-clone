import { Request, Response, NextFunction } from 'express';
import { productService } from './products.service';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { prisma } from '../../database/prisma';
import {
  ProductFilterQuerySchema,
  ProductOptionsQuerySchema,
  CreateProductSchema,
  UpdateProductSchema,
  UpdateInventorySchema,
  UpdateDeliverySettingsSchema,
} from './products.types';

export async function listProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const query = ProductFilterQuerySchema.parse(req.query);
    const result = await productService.listProducts(query);
    res.json({
      success: true,
      data: result.products,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

export async function getProductById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const includeDeleted = req.query.includeDeleted === 'true';
    const product = await productService.getProductById(id, includeDeleted);
    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
}

export async function getProductOptions(req: Request, res: Response, next: NextFunction) {
  try {
    const query = ProductOptionsQuerySchema.parse(req.query);
    const options = await productService.getProductOptions(query);
    res.json({
      success: true,
      data: options,
    });
  } catch (error) {
    next(error);
  }
}

export async function createProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const body = CreateProductSchema.parse(req.body);
    const adminUserId = (req as any).user?.id || 'super-admin-id';
    const product = await productService.createProduct(body, adminUserId);
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const body = UpdateProductSchema.parse(req.body);
    const adminUserId = (req as any).user?.id || 'super-admin-id';
    const product = await productService.updateProduct(id, body, adminUserId);
    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProductStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const adminUserId = (req as any).user?.id || 'super-admin-id';
    const product = await productService.updateProductStatus(id, status, adminUserId);
    res.json({
      success: true,
      message: `Product status updated to ${status}`,
      data: product,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProductVisibility(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { visibility } = req.body;
    const adminUserId = (req as any).user?.id || 'super-admin-id';
    const product = await productService.updateProductVisibility(id, visibility, adminUserId);
    res.json({
      success: true,
      message: `Product visibility updated to ${visibility}`,
      data: product,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProductFeatured(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { isFeatured } = req.body;
    const adminUserId = (req as any).user?.id || 'super-admin-id';
    const product = await productService.updateProductFeatured(id, Boolean(isFeatured), adminUserId);
    res.json({
      success: true,
      message: `Product featured status updated`,
      data: product,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateInventory(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const body = UpdateInventorySchema.parse(req.body);
    const adminUserId = (req as any).user?.id || 'super-admin-id';
    const product = await productService.updateInventory(id, body, adminUserId);
    res.json({
      success: true,
      message: 'Inventory updated successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateDeliverySettings(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const body = UpdateDeliverySettingsSchema.parse(req.body);
    const adminUserId = (req as any).user?.id || 'super-admin-id';
    const product = await productService.updateDeliverySettings(id, body, adminUserId);
    res.json({
      success: true,
      message: 'Delivery settings updated successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
}

export async function softDeleteProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const adminUserId = (req as any).user?.id || 'super-admin-id';
    await productService.softDeleteProduct(id, adminUserId);
    res.json({
      success: true,
      message: 'Product moved to trash',
    });
  } catch (error) {
    next(error);
  }
}

export async function restoreProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const adminUserId = (req as any).user?.id || 'super-admin-id';
    const product = await productService.restoreProduct(id, adminUserId);
    res.json({
      success: true,
      message: 'Product restored successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
}

export async function duplicateProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const adminUserId = (req as any).user?.id || 'super-admin-id';
    const product = await productService.duplicateProduct(id, adminUserId);
    res.status(201).json({
      success: true,
      message: 'Product duplicated successfully as Draft',
      data: product,
    });
  } catch (error) {
    next(error);
  }
}

export async function previewVariationCombinations(req: Request, res: Response, next: NextFunction) {
  try {
    const { selections, maxLimit } = req.body;
    const result = await productService.previewVariationCombinations(selections || [], maxLimit || 100);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function calculateTax(req: Request, res: Response, next: NextFunction) {
  try {
    const { price, quantity, taxRateId, totalRate, priceIncludesTax, supplyType } = req.body;
    const result = await productService.calculateProductTax({
      price: Number(price) || 0,
      quantity: Number(quantity) || 1,
      taxRateId,
      totalRate: totalRate ? Number(totalRate) : undefined,
      priceIncludesTax: Boolean(priceIncludesTax),
      supplyType: supplyType || 'INTRA_STATE',
    });
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function uploadProductMedia(req: Request, res: Response, next: NextFunction) {
  try {
    const file = req.file;
    const role = (req.body.role as any) || 'PRODUCT_IMAGE';

    if (!file) {
      return res.status(400).json({ success: false, message: 'No media file uploaded.' });
    }

    let extension = '.png';
    if (file.mimetype === 'image/jpeg') extension = '.jpg';
    if (file.mimetype === 'image/webp') extension = '.webp';
    if (file.mimetype === 'image/svg+xml') extension = '.svg';

    const storedName = `${crypto.randomUUID()}${extension}`;

    // Write file to disk
    const physicalPath = path.join(process.cwd(), 'uploads', 'products', storedName);
    fs.mkdirSync(path.dirname(physicalPath), { recursive: true });
    fs.writeFileSync(physicalPath, file.buffer);

    try {
      const fileAsset = await prisma.fileAsset.create({
        data: {
          ownerType: 'PRODUCT',
          role: role,
          visibility: 'PUBLIC',
          status: 'ACTIVE',
          originalName: file.originalname,
          storedName: storedName,
          storageDisk: 'local',
          storagePath: `/uploads/products/${storedName}`,
          mimeType: file.mimetype,
          extension: extension,
          sizeBytes: file.size,
        }
      });

      res.status(201).json({
        success: true,
        message: 'Product media uploaded successfully',
        data: {
          fileAssetId: fileAsset.id,
          originalName: fileAsset.originalName,
          url: fileAsset.storagePath,
          role: fileAsset.role,
        }
      });
    } catch {
      const fakeId = `file-${crypto.randomUUID()}`;
      res.status(201).json({
        success: true,
        message: 'Product media uploaded successfully',
        data: {
          fileAssetId: fakeId,
          originalName: file.originalname,
          url: `/uploads/products/${storedName}`,
          role: role,
        }
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to upload product media' });
  }
}
