import { Router } from 'express';
import * as controller from './personalisationForms.controller';

// Admin Routes (Authenticated)
export const personalisationFormRouter = Router();

personalisationFormRouter.get('/', controller.listForms);
personalisationFormRouter.post('/', controller.createForm);

// Global settings
personalisationFormRouter.get('/global-settings', controller.getGlobalSettings);
personalisationFormRouter.put('/global-settings', controller.updateGlobalSettings);

// Assignments lookups & updates
personalisationFormRouter.get('/assignments', controller.getAssignment);
personalisationFormRouter.delete('/assignments', controller.removeAssignment);

// Form CRUD and operations
personalisationFormRouter.get('/:id', controller.getForm);
personalisationFormRouter.put('/:id', controller.updateForm);
personalisationFormRouter.delete('/:id', controller.deleteForm);
personalisationFormRouter.post('/:id/duplicate', controller.duplicateForm);
personalisationFormRouter.post('/:id/assign', controller.assignForm);

// Fields operations
personalisationFormRouter.post('/:id/fields/reorder', controller.reorderFields);
personalisationFormRouter.post('/:id/fields/:fieldId/duplicate', controller.duplicateField);


// Public Routes (Unauthenticated)
export const publicPersonalisationFormRouter = Router();

publicPersonalisationFormRouter.get('/:idOrSlug', controller.getFormBySlugOrIdPublic);
publicPersonalisationFormRouter.post('/:id/validate', controller.validateSubmission);
