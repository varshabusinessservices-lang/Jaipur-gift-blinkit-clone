import { Router } from 'express';
import { NotificationsController } from './notifications.controller';

const router = Router();
const controller = new NotificationsController();

// Customer / General Notifications
router.get('/', controller.getNotifications);
router.get('/unread-count', controller.getUnreadCount);
router.patch('/:id/read', controller.markAsRead);
router.post('/read-all', controller.markAllAsRead);

router.get('/preferences', controller.getPreferences);
router.patch('/preferences', controller.updatePreferences);

router.post('/devices', controller.registerDevice);
router.delete('/devices/:id', controller.unregisterDevice);

export { router as notificationRoutes };
export { router as adminNotificationRoutes };
