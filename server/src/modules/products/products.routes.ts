import { Router } from 'express';
import * as productController from './products.controller';
import productVariationRouter from './productVariation.routes';
import multer from 'multer';

const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
});

export const productRouter = Router();

// Mount product variations router
productRouter.use('/:productId/variations', productVariationRouter);

// Options dropdown list
productRouter.get('/options', productController.getProductOptions);

// List products
productRouter.get('/', productController.listProducts);

// Media upload endpoint
productRouter.post('/media', upload.single('file'), productController.uploadProductMedia);

// Variation combination preview utility
productRouter.post('/preview-combinations', productController.previewVariationCombinations);

// Tax calculator utility
productRouter.post('/calculate-tax', productController.calculateTax);

// Create product
productRouter.post('/', productController.createProduct);

// Get single product
productRouter.get('/:id', productController.getProductById);

// Update product
productRouter.put('/:id', productController.updateProduct);
productRouter.patch('/:id', productController.updateProduct);

// Quick status & visibility toggles
productRouter.patch('/:id/status', productController.updateProductStatus);
productRouter.patch('/:id/visibility', productController.updateProductVisibility);
productRouter.patch('/:id/featured', productController.updateProductFeatured);

// Section-wise updates
productRouter.patch('/:id/inventory', productController.updateInventory);
productRouter.patch('/:id/delivery-settings', productController.updateDeliverySettings);

// Actions
productRouter.post('/:id/duplicate', productController.duplicateProduct);
productRouter.post('/:id/restore', productController.restoreProduct);
productRouter.delete('/:id', productController.softDeleteProduct);
