import { Router } from 'express';
import * as controller from './productAddon.controller';

export const productAddonRouter = Router();

// Options search choices
productAddonRouter.get('/options', controller.getAddonOptionChoices);

// Reorder bulk
productAddonRouter.patch('/reorder-bulk', controller.reorderBulk);

// List and Create
productAddonRouter.get('/', controller.listAddons);
productAddonRouter.post('/', controller.createAddon);

// Detail, Update, Status, Delete, Restore, Duplicate
productAddonRouter.get('/:id', controller.getAddonById);
productAddonRouter.patch('/:id', controller.updateAddon);
productAddonRouter.patch('/:id/status', controller.updateStatus);
productAddonRouter.delete('/:id', controller.softDeleteAddon);
productAddonRouter.post('/:id/restore', controller.restoreAddon);
productAddonRouter.post('/:id/duplicate', controller.duplicateAddon);

// Options Sub-routes
productAddonRouter.post('/:addonId/options', controller.createOption);
productAddonRouter.patch('/:addonId/options/reorder-bulk', controller.reorderOptions);
productAddonRouter.patch('/:addonId/options/:optionId', controller.updateOption);
productAddonRouter.delete('/:addonId/options/:optionId', controller.deleteOption);
productAddonRouter.post('/:addonId/options/:optionId/restore', controller.restoreOption);

// Assignments Sub-routes
productAddonRouter.get('/:addonId/assignments', controller.getAssignments);
productAddonRouter.put('/:addonId/assignments', controller.updateAssignments);
productAddonRouter.delete('/:addonId/assignments/:assignmentId', controller.deleteAssignment);
