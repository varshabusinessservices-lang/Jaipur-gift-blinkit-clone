import { Router } from 'express';
import { ProductionController } from './production.controller';

const router = Router();
const controller = new ProductionController();

// Jobs
router.post('/jobs', controller.initJob);
router.get('/jobs', controller.listJobs);
router.get('/jobs/:id', controller.getJob);

// Machines & Staff
router.get('/machines', controller.getMachines);
router.get('/staff', controller.getStaff);

// Item Production Workflows
router.post('/items/:itemId/artwork', controller.reviewArtwork);
router.post('/items/:itemId/print/start', controller.assignPrint);
router.post('/items/:itemId/print/complete', controller.completePrinting);
router.post('/items/:itemId/qc', controller.qualityCheck);
router.post('/items/:itemId/reprint', controller.reprint);
router.post('/items/:itemId/pack', controller.packing);

// Customer Visibility
router.get('/customer/order/:orderId/status', controller.customerStatus);

export { router as productionRoutes };
