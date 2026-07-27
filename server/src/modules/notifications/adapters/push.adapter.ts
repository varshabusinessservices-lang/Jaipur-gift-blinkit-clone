import { getFirebaseAdmin } from '../../../integrations/firebase/firebaseAdmin';

export class PushAdapter {
  async send(options: { pushToken: string; title: string; body: string; data?: Record<string, any> }) {
    const mode = process.env.NOTIFICATION_PROVIDER_MODE || 'mock';
    const start = Date.now();

    if (mode === 'live' || (process.env.FIREBASE_ADMIN_PROJECT_ID && options.pushToken && !options.pushToken.startsWith('mock'))) {
      try {
        const { messaging } = getFirebaseAdmin();
        const response = await messaging.send({
          token: options.pushToken,
          notification: {
            title: options.title,
            body: options.body,
          },
          data: options.data ? Object.fromEntries(Object.entries(options.data).map(([k, v]) => [k, String(v)])) : undefined,
        });
        return {
          success: true,
          providerMessageId: response,
          durationMs: Date.now() - start,
        };
      } catch (err: any) {
        console.error('[FCM Push Error]', err);
        throw err;
      }
    }

    console.log(`[Mock Push] Token: ${options.pushToken} | Title: ${options.title} | Body: ${options.body}`);
    return {
      success: true,
      providerMessageId: `mock_push_${Date.now()}`,
      durationMs: Date.now() - start,
    };
  }
}

