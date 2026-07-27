import { Router } from 'express';
import { SettingsController } from './settings.controller';
import { requireAuth } from '../../middlewares/auth.middleware';

const router = Router();
const controller = new SettingsController();

router.post('/admin/settings/authentication/firebase/test-config', requireAuth, (req, res) => {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (projectId && clientEmail && privateKey) {
    res.json({ success: true, message: `Firebase Admin SDK configured for project: ${projectId}` });
  } else {
    res.json({ success: false, message: 'Firebase Admin SDK is missing configuration (Project ID, Client Email, or Private Key).' });
  }
});

router.post('/admin/settings/email/test', requireAuth, (req, res) => {
  // Mock test email endpoint
  setTimeout(() => {
    res.json({ success: true, message: 'Test email dispatched.' });
  }, 1000);
});

router.get('/admin/settings/:namespace', requireAuth, controller.getSettings);
router.patch('/admin/settings/:namespace', requireAuth, controller.saveSettings);

export default router;
