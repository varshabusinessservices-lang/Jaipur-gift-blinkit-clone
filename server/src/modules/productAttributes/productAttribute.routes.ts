import { Router } from 'express';
import * as controller from './productAttribute.controller';

export const productAttributeRouter = Router();

// Options and Combinations
productAttributeRouter.get('/options', controller.getAttributeOptions);
productAttributeRouter.post('/generate-combinations', controller.generateCombinations);

// Bulk Reorder
productAttributeRouter.patch('/reorder-bulk', controller.reorderBulk);

// Base Attribute CRUD
productAttributeRouter.get('/', controller.getAttributes);
productAttributeRouter.get('/:id', controller.getAttributeById);
productAttributeRouter.post('/', controller.createAttribute);
productAttributeRouter.patch('/:id', controller.updateAttribute);
productAttributeRouter.patch('/:id/status', controller.updateAttributeStatus);
productAttributeRouter.delete('/:id', controller.deleteAttribute);
productAttributeRouter.post('/:id/restore', controller.restoreAttribute);

// Values Endpoints
productAttributeRouter.get('/:attributeId/values', controller.getValues);
productAttributeRouter.post('/:attributeId/values', controller.createValue);
productAttributeRouter.patch('/:attributeId/values/reorder-bulk', controller.reorderValuesBulk);
productAttributeRouter.patch('/:attributeId/values/:valueId', controller.updateValue);
productAttributeRouter.patch('/:attributeId/values/:valueId/status', controller.updateValueStatus);
productAttributeRouter.delete('/:attributeId/values/:valueId', controller.deleteValue);
productAttributeRouter.post('/:attributeId/values/:valueId/restore', controller.restoreValue);

// Category Assignment Endpoints
productAttributeRouter.get('/:id/categories', controller.getCategories);
productAttributeRouter.put('/:id/categories', controller.updateCategories);
productAttributeRouter.delete('/:id/categories/:categoryId', controller.deleteCategoryAssignment);

// Attribute Group Endpoints
export const attributeGroupRouter = Router();
attributeGroupRouter.get('/', controller.getGroups);
attributeGroupRouter.post('/', controller.createGroup);
