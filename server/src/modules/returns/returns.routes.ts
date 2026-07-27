import { Router } from 'express';
import { ReturnsController } from './returns.controller';

const router = Router();
const controller = new ReturnsController();

// Customer / General Returns
router.post('/', controller.createReturn);
router.get('/', controller.listReturns);
router.get('/:id', controller.getReturn);

// Admin / Workflow Endpoints
router.patch('/:id/status', controller.adminUpdateStatus);
router.post('/:id/inspection', controller.recordInspection);
router.post('/:id/replacement', controller.createReplacement);

// Refunds
router.post('/refunds', controller.processRefund);
router.get('/refunds/ledger', controller.listRefunds);

export { router as returnsRoutes };
