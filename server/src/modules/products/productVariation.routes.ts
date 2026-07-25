import { Router } from 'express';
import { ProductVariationController } from './productVariation.controller';
import { requireAuth } from '../../middlewares/auth.middleware';

const router = Router({ mergeParams: true });
const controller = new ProductVariationController();

// Admin routes (Protected by authentication)
router.post('/generate-preview', requireAuth, controller.generatePreview);
router.post('/generate', requireAuth, controller.generateVariations);

router.get('/', requireAuth, controller.listVariations);
router.post('/', requireAuth, controller.createVariation);
router.patch('/bulk-update', requireAuth, controller.bulkUpdate);

router.get('/:variationId', requireAuth, controller.getVariationDetail);
router.patch('/:variationId', requireAuth, controller.updateVariation);
router.patch('/:variationId/status', requireAuth, controller.updateStatus);
router.patch('/:variationId/default', requireAuth, controller.setDefault);
router.delete('/:variationId', requireAuth, controller.deleteVariation);
router.post('/:variationId/restore', requireAuth, controller.restoreVariation);

export default router;
