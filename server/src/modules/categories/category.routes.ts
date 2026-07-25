import { Router } from 'express';
import multer from 'multer';
import * as categoryController from './category.controller';

const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

export const categoryRouter = Router();

// List & Tree
categoryRouter.get('/', categoryController.getCategories);
categoryRouter.get('/tree', categoryController.getCategoryTree);

// Reorder
categoryRouter.post('/reorder', categoryController.reorderCategories);

// Media upload
categoryRouter.post('/media', upload.single('file'), categoryController.uploadCategoryMedia);

// Single category CRUD
categoryRouter.get('/:id', categoryController.getCategoryById);
categoryRouter.post('/', categoryController.createCategory);
categoryRouter.put('/:id', categoryController.updateCategory);
categoryRouter.patch('/:id', categoryController.updateCategory);
categoryRouter.patch('/:id/status', categoryController.updateCategoryStatus);
categoryRouter.delete('/:id', categoryController.deleteCategory);
categoryRouter.post('/:id/restore', categoryController.restoreCategory);
