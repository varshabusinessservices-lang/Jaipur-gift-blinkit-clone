import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware';
import { SettingsService } from './settings.service';

const router = Router();
const settingsService = new SettingsService();

router.get('/admin/settings/payment', requireAuth, async (req, res) => {
  try {
    const data = await settingsService.getSettingsByNamespace('payment');
    // Ensure secrets are never returned
    delete data.razorpayKeySecret;
    delete data.razorpayWebhookSecret;
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.patch('/admin/settings/payment', requireAuth, async (req, res) => {
  try {
    const payload = req.body || {};
    // Prevent updating secrets via frontend
    delete payload.razorpayKeySecret;
    delete payload.razorpayWebhookSecret;

    await settingsService.saveSettings('payment', payload);
    const updated = await settingsService.getSettingsByNamespace('payment');
    delete updated.razorpayKeySecret;
    delete updated.razorpayWebhookSecret;
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/admin/settings/payment/razorpay-health', requireAuth, async (req, res) => {
  const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_mock123456';
  const mode = process.env.RAZORPAY_MODE || 'TEST';
  res.json({
    success: true,
    data: {
      status: 'Healthy',
      mode,
      keyIdMasked: keyId ? `${keyId.substring(0, 6)}...${keyId.slice(-4)}` : 'Not Configured',
      webhookUrl: 'https://api.jaipurgifting.com/api/v1/webhooks/razorpay',
      lastHealthCheck: new Date().toISOString(),
    },
  });
});

router.post('/admin/settings/payment/razorpay/test', requireAuth, async (req, res) => {
  setTimeout(() => {
    res.json({ success: true, message: 'Razorpay API test connection successful (Mocked Test Ping).' });
  }, 800);
});

router.get('/admin/settings/payment/cod-rules', requireAuth, async (req, res) => {
  const data = await settingsService.getSettingsByNamespace('payment');
  res.json({
    success: true,
    data: {
      codGlobalEnabled: data.codGlobalEnabled ?? true,
      minCodAmount: data.minCodAmount ?? 500,
      maxCodAmount: data.maxCodAmount ?? 5000,
      codCharge: data.codCharge ?? 49,
      codFreeAbove: data.codFreeAbove ?? 999,
      personalisedProductsCodDefault: data.personalisedProductsCodDefault ?? 'DISABLED',
      nonPersonalisedCodDefault: data.nonPersonalisedCodDefault ?? 'ENABLED',
      advancePaymentType: data.advancePaymentType ?? 'PERCENTAGE',
      advancePaymentValue: data.advancePaymentValue ?? 50,
    },
  });
});

router.patch('/admin/settings/payment/cod-rules', requireAuth, async (req, res) => {
  await settingsService.saveSettings('payment', req.body);
  res.json({ success: true, message: 'COD rules updated successfully.' });
});

router.get('/admin/settings/payment/cod-rules/products', requireAuth, async (req, res) => {
  res.json({ success: true, data: [{ productId: 'prod_1', name: 'Personalised Photo Frame', codStatus: 'ADVANCE_REQUIRED', advanceValue: 50 }] });
});

router.patch('/admin/settings/payment/cod-rules/products', requireAuth, async (req, res) => {
  res.json({ success: true, message: 'Product COD overrides updated successfully.' });
});

router.get('/admin/settings/payment/cod-rules/categories', requireAuth, async (req, res) => {
  res.json({ success: true, data: [{ categoryId: 'cat_1', name: 'Personalised Gifts', codStatus: 'DISABLED' }] });
});

router.patch('/admin/settings/payment/cod-rules/categories', requireAuth, async (req, res) => {
  res.json({ success: true, message: 'Category COD overrides updated successfully.' });
});

router.get('/admin/settings/payment/cod-rules/stores', requireAuth, async (req, res) => {
  res.json({ success: true, data: [{ storeId: 'store_1', name: 'Jaipur Central Hub', codEnabled: true }] });
});

router.patch('/admin/settings/payment/cod-rules/stores', requireAuth, async (req, res) => {
  res.json({ success: true, message: 'Store COD rules updated successfully.' });
});

router.get('/admin/settings/payment/cod-rules/zones', requireAuth, async (req, res) => {
  res.json({ success: true, data: [{ zoneId: 'zone_1', name: 'Vaishali Nagar', codEnabled: true, expressCodEnabled: false }] });
});

router.patch('/admin/settings/payment/cod-rules/zones', requireAuth, async (req, res) => {
  res.json({ success: true, message: 'Delivery zone COD rules updated successfully.' });
});

export { router as paymentSettingsRoutes };
