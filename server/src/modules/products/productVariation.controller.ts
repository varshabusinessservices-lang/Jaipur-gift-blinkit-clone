import { Request, Response } from 'express';
import { ProductVariationService } from './productVariation.service';
import {
  VariationFilterQuerySchema,
  GeneratePreviewInputSchema,
  GenerateVariationsInputSchema,
  CreateVariationSchema,
  UpdateVariationSchema,
  BulkUpdateVariationsSchema,
} from './productVariation.types';

export class ProductVariationController {
  private service = new ProductVariationService();

  generatePreview = async (req: Request, res: Response) => {
    try {
      const productId = req.params.productId;
      const input = GeneratePreviewInputSchema.parse(req.body);
      const result = await this.service.generatePreview(productId, input);
      return res.status(200).json({
        success: true,
        message: 'Variation preview generated successfully',
        data: result,
      });
    } catch (err: any) {
      if (err.message === 'PRODUCT_NOT_FOUND') {
        return res.status(404).json({ success: false, errorCode: 'PRODUCT_NOT_FOUND', message: 'Product not found' });
      }
      if (err.message === 'PRODUCT_NOT_VARIABLE') {
        return res.status(400).json({ success: false, errorCode: 'PRODUCT_NOT_VARIABLE', message: 'Product is not of type VARIABLE' });
      }
      if (err.message === 'VARIATION_COMBINATION_LIMIT_EXCEEDED') {
        return res.status(400).json({
          success: false,
          errorCode: 'VARIATION_COMBINATION_LIMIT_EXCEEDED',
          message: 'Variation combinations limit exceeded maximum allowed (100)',
        });
      }
      return res.status(400).json({ success: false, errorCode: 'INVALID_INPUT', message: err.message });
    }
  };

  generateVariations = async (req: Request, res: Response) => {
    try {
      const productId = req.params.productId;
      const input = GenerateVariationsInputSchema.parse(req.body);
      const adminUserId = (req as any).adminUser?.id;
      const result = await this.service.generateVariations(productId, input, adminUserId);
      return res.status(201).json({
        success: true,
        message: 'Variations generated successfully',
        data: result,
      });
    } catch (err: any) {
      if (err.message === 'PRODUCT_NOT_FOUND') {
        return res.status(404).json({ success: false, errorCode: 'PRODUCT_NOT_FOUND', message: 'Product not found' });
      }
      if (err.message === 'PRODUCT_NOT_VARIABLE') {
        return res.status(400).json({ success: false, errorCode: 'PRODUCT_NOT_VARIABLE', message: 'Product is not of type VARIABLE' });
      }
      if (err.message === 'VARIATION_COMBINATION_LIMIT_EXCEEDED') {
        return res.status(400).json({
          success: false,
          errorCode: 'VARIATION_COMBINATION_LIMIT_EXCEEDED',
          message: 'Requested combinations exceed maximum allowed limit',
        });
      }
      return res.status(400).json({ success: false, errorCode: 'INVALID_INPUT', message: err.message });
    }
  };

  listVariations = async (req: Request, res: Response) => {
    try {
      const productId = req.params.productId;
      const query = VariationFilterQuerySchema.parse(req.query);
      const result = await this.service.listVariations(productId, query);
      return res.status(200).json({
        success: true,
        data: result.items,
        meta: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      });
    } catch (err: any) {
      if (err.message === 'PRODUCT_NOT_FOUND') {
        return res.status(404).json({ success: false, errorCode: 'PRODUCT_NOT_FOUND', message: 'Product not found' });
      }
      if (err.message === 'PRODUCT_NOT_VARIABLE') {
        return res.status(400).json({ success: false, errorCode: 'PRODUCT_NOT_VARIABLE', message: 'Product is not of type VARIABLE' });
      }
      return res.status(400).json({ success: false, errorCode: 'INVALID_QUERY', message: err.message });
    }
  };

  getVariationDetail = async (req: Request, res: Response) => {
    try {
      const { productId, variationId } = req.params;
      const detail = await this.service.getVariationDetail(productId, variationId);
      return res.status(200).json({ success: true, data: detail });
    } catch (err: any) {
      if (err.message === 'PRODUCT_VARIATION_NOT_FOUND') {
        return res.status(404).json({ success: false, errorCode: 'PRODUCT_VARIATION_NOT_FOUND', message: 'Variation not found' });
      }
      return res.status(400).json({ success: false, errorCode: 'INVALID_INPUT', message: err.message });
    }
  };

  createVariation = async (req: Request, res: Response) => {
    try {
      const productId = req.params.productId;
      const input = CreateVariationSchema.parse(req.body);
      const adminUserId = (req as any).adminUser?.id;
      const created = await this.service.createVariation(productId, input, adminUserId);
      return res.status(201).json({ success: true, message: 'Variation created successfully', data: created });
    } catch (err: any) {
      if (err.message === 'PRODUCT_NOT_FOUND') {
        return res.status(404).json({ success: false, errorCode: 'PRODUCT_NOT_FOUND', message: 'Product not found' });
      }
      if (err.message === 'PRODUCT_NOT_VARIABLE') {
        return res.status(400).json({ success: false, errorCode: 'PRODUCT_NOT_VARIABLE', message: 'Product is not of type VARIABLE' });
      }
      if (err.message === 'PRODUCT_VARIATION_DUPLICATE') {
        return res.status(400).json({ success: false, errorCode: 'PRODUCT_VARIATION_DUPLICATE', message: 'A variation with this combination already exists' });
      }
      if (err.message === 'PRODUCT_VARIATION_SKU_EXISTS') {
        return res.status(400).json({ success: false, errorCode: 'PRODUCT_VARIATION_SKU_EXISTS', message: 'A variation with this SKU already exists' });
      }
      if (err.message === 'PRODUCT_VARIATION_BARCODE_EXISTS') {
        return res.status(400).json({ success: false, errorCode: 'PRODUCT_VARIATION_BARCODE_EXISTS', message: 'A variation with this barcode already exists' });
      }
      return res.status(400).json({ success: false, errorCode: 'INVALID_INPUT', message: err.message });
    }
  };

  updateVariation = async (req: Request, res: Response) => {
    try {
      const { productId, variationId } = req.params;
      const input = UpdateVariationSchema.parse(req.body);
      const adminUserId = (req as any).adminUser?.id;
      const updated = await this.service.updateVariation(productId, variationId, input, adminUserId);
      return res.status(200).json({ success: true, message: 'Variation updated successfully', data: updated });
    } catch (err: any) {
      if (err.message === 'PRODUCT_VARIATION_NOT_FOUND') {
        return res.status(404).json({ success: false, errorCode: 'PRODUCT_VARIATION_NOT_FOUND', message: 'Variation not found' });
      }
      if (err.message === 'PRODUCT_VARIATION_SKU_EXISTS') {
        return res.status(400).json({ success: false, errorCode: 'PRODUCT_VARIATION_SKU_EXISTS', message: 'A variation with this SKU already exists' });
      }
      if (err.message === 'PRODUCT_VARIATION_BARCODE_EXISTS') {
        return res.status(400).json({ success: false, errorCode: 'PRODUCT_VARIATION_BARCODE_EXISTS', message: 'A variation with this barcode already exists' });
      }
      return res.status(400).json({ success: false, errorCode: 'INVALID_INPUT', message: err.message });
    }
  };

  updateStatus = async (req: Request, res: Response) => {
    try {
      const { productId, variationId } = req.params;
      const { status } = req.body;
      const adminUserId = (req as any).adminUser?.id;
      const updated = await this.service.updateStatus(productId, variationId, status, adminUserId);
      return res.status(200).json({ success: true, message: 'Status updated successfully', data: updated });
    } catch (err: any) {
      if (err.message === 'PRODUCT_VARIATION_NOT_FOUND') {
        return res.status(404).json({ success: false, errorCode: 'PRODUCT_VARIATION_NOT_FOUND', message: 'Variation not found' });
      }
      return res.status(400).json({ success: false, errorCode: 'INVALID_INPUT', message: err.message });
    }
  };

  setDefault = async (req: Request, res: Response) => {
    try {
      const { productId, variationId } = req.params;
      const adminUserId = (req as any).adminUser?.id;
      await this.service.setDefaultVariation(productId, variationId, adminUserId);
      return res.status(200).json({ success: true, message: 'Default variation updated successfully' });
    } catch (err: any) {
      if (err.message === 'PRODUCT_VARIATION_NOT_FOUND') {
        return res.status(404).json({ success: false, errorCode: 'PRODUCT_VARIATION_NOT_FOUND', message: 'Variation not found' });
      }
      if (err.message === 'PRODUCT_VARIATION_DEFAULT_INVALID') {
        return res.status(400).json({
          success: false,
          errorCode: 'PRODUCT_VARIATION_DEFAULT_INVALID',
          message: 'Inactive or deleted variation cannot be set as default',
        });
      }
      return res.status(400).json({ success: false, errorCode: 'INVALID_INPUT', message: err.message });
    }
  };

  bulkUpdate = async (req: Request, res: Response) => {
    try {
      const productId = req.params.productId;
      const input = BulkUpdateVariationsSchema.parse(req.body);
      const adminUserId = (req as any).adminUser?.id;
      const result = await this.service.bulkUpdate(productId, input, adminUserId);
      return res.status(200).json({ success: true, message: 'Bulk update applied successfully', data: result });
    } catch (err: any) {
      if (err.message === 'PRODUCT_NOT_FOUND') {
        return res.status(404).json({ success: false, errorCode: 'PRODUCT_NOT_FOUND', message: 'Product not found' });
      }
      return res.status(400).json({ success: false, errorCode: 'PRODUCT_VARIATION_BULK_UPDATE_FAILED', message: err.message });
    }
  };

  deleteVariation = async (req: Request, res: Response) => {
    try {
      const { productId, variationId } = req.params;
      const adminUserId = (req as any).adminUser?.id;
      await this.service.deleteVariation(productId, variationId, adminUserId);
      return res.status(200).json({ success: true, message: 'Variation soft deleted successfully' });
    } catch (err: any) {
      if (err.message === 'PRODUCT_VARIATION_NOT_FOUND') {
        return res.status(404).json({ success: false, errorCode: 'PRODUCT_VARIATION_NOT_FOUND', message: 'Variation not found' });
      }
      return res.status(400).json({ success: false, errorCode: 'INVALID_INPUT', message: err.message });
    }
  };

  restoreVariation = async (req: Request, res: Response) => {
    try {
      const { productId, variationId } = req.params;
      const adminUserId = (req as any).adminUser?.id;
      await this.service.restoreVariation(productId, variationId, adminUserId);
      return res.status(200).json({ success: true, message: 'Variation restored successfully' });
    } catch (err: any) {
      if (err.message === 'PRODUCT_VARIATION_NOT_FOUND') {
        return res.status(404).json({ success: false, errorCode: 'PRODUCT_VARIATION_NOT_FOUND', message: 'Variation not found' });
      }
      if (err.message === 'PRODUCT_VARIATION_RESTORE_CONFLICT') {
        return res.status(400).json({
          success: false,
          errorCode: 'PRODUCT_VARIATION_RESTORE_CONFLICT',
          message: 'Cannot restore variation due to a conflicting active variation, SKU, or combination key',
        });
      }
      return res.status(400).json({ success: false, errorCode: 'INVALID_INPUT', message: err.message });
    }
  };

  getPublicVariations = async (req: Request, res: Response) => {
    try {
      const productId = req.params.productId;
      const variations = await this.service.getPublicVariations(productId);
      return res.status(200).json({ success: true, data: variations });
    } catch (err: any) {
      return res.status(400).json({ success: false, errorCode: 'INVALID_REQUEST', message: err.message });
    }
  };
}
