import { Router } from 'express';
import { DeliveryZonesController } from './deliveryZones.controller';

const router = Router();
const controller = new DeliveryZonesController();

router.get('/admin/delivery-zones', controller.listZones);
router.post('/admin/delivery-zones', controller.createZone);
router.get('/admin/delivery-zones/analytics', controller.getAnalytics);
router.get('/admin/delivery-zones/pricing-matrix', controller.getPricingMatrix);
router.get('/admin/delivery-zones/:id', controller.getZoneById);
router.patch('/admin/delivery-zones/:id', controller.updateZone);
router.delete('/admin/delivery-zones/:id', controller.deleteZone);
router.post('/admin/delivery-zones/:id/duplicate', controller.duplicateZone);

router.post('/delivery/check-zone', controller.checkZone);

export default router;
