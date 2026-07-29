import { Router } from 'express';
import multer from 'multer';
import * as brandController from './brand.controller';

const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

export const brandRouter = Router();

brandRouter.get('/', brandController.getBrands);
brandRouter.get('/options', brandController.getBrandOptions);
brandRouter.get('/:id', brandController.getBrandById);
brandRouter.post('/', brandController.createBrand);
brandRouter.post('/media', upload.single('file'), brandController.uploadBrandMedia);
brandRouter.patch('/reorder-bulk', brandController.reorderBrandsBulk);
brandRouter.patch('/:id', brandController.updateBrand);
brandRouter.patch('/:id/status', brandController.updateBrandStatus);
brandRouter.patch('/:id/featured', brandController.updateBrandFeatured);
brandRouter.delete('/:id', brandController.deleteBrand);
brandRouter.post('/:id/restore', brandController.restoreBrand);
brandRouter.post('/:id/duplicate', brandController.duplicateBrand);
