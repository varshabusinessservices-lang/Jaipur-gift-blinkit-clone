import { Router } from 'express';
import * as controller from './productAddon.controller';

export const publicProductAddonRouter = Router();

// GET /api/v1/products/:productId/addons
publicProductAddonRouter.get('/:productId/addons', controller.resolveProductAddons);
