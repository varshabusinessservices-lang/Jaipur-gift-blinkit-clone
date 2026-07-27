import { Router } from 'express';
import { ProductionReadinessController } from './productionReadiness.controller';

const router = Router();
const controller = new ProductionReadinessController();

router.get('/health', controller.getHealth);
router.get('/metrics', controller.getMetrics);
router.get('/workers', controller.listWorkers);
router.post('/workers/:id/trigger', controller.triggerWorker);
router.get('/audit-logs', controller.getAuditLogs);

export default router;
