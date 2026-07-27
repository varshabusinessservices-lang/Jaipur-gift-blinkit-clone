import { Router } from 'express';
import { NotificationsController } from './notifications.controller';

const router = Router();
const controller = new NotificationsController();

router.get('/', controller.adminListNotifications);
router.get('/stats', controller.adminGetStats);
router.get('/provider-health', controller.adminProviderHealth);
router.get('/:id', controller.adminGetNotification);

router.get('/templates/all', controller.adminListTemplates);
router.post('/templates', controller.adminCreateTemplate);
router.patch('/templates/:id', controller.adminUpdateTemplate);

router.get('/rules/all', controller.adminListRules);
router.post('/rules', controller.adminCreateRule);
router.patch('/rules/:id', controller.adminUpdateRule);

export { router as adminNotificationRoutes };
