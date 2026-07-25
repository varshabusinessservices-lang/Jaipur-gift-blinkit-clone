import { Router } from 'express';
import * as productController from './products.controller';
import { ProductVariationController } from './productVariation.controller';

export const publicProductRouter = Router();
const variationController = new ProductVariationController();

// Public list products (filtered to active/public)
publicProductRouter.get('/', (req, res, next) => {
  req.query.status = 'ACTIVE';
  req.query.visibility = 'PUBLIC';
  return productController.listProducts(req, res, next);
});

// Public variations for a product
publicProductRouter.get('/:productId/variations', variationController.getPublicVariations);

// Public single product details
publicProductRouter.get('/:id', productController.getProductById);

