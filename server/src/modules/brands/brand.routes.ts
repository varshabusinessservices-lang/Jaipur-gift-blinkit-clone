import { Router } from 'express';
import * as brandController from './brand.controller';

export const brandRouter = Router();

brandRouter.get('/', brandController.getBrands);
brandRouter.get('/options', brandController.getBrandOptions);
brandRouter.get('/:id', brandController.getBrandById);
brandRouter.post('/', brandController.createBrand);
brandRouter.patch('/reorder-bulk', brandController.reorderBrandsBulk);
brandRouter.patch('/:id', brandController.updateBrand);
brandRouter.patch('/:id/status', brandController.updateBrandStatus);
brandRouter.patch('/:id/featured', brandController.updateBrandFeatured);
brandRouter.delete('/:id', brandController.deleteBrand);
brandRouter.post('/:id/restore', brandController.restoreBrand);
brandRouter.post('/:id/duplicate', brandController.duplicateBrand);
