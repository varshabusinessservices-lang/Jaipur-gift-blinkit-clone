export class SmsAdapter {
  async send(options: { phone: string; message: string; templateId?: string }) {
    const mode = process.env.NOTIFICATION_PROVIDER_MODE || 'mock';
    const start = Date.now();

    if (mode === 'mock') {
      console.log(`[Mock SMS] To: ${options.phone} | Msg: ${options.message}`);
      return {
        success: true,
        providerMessageId: `mock_sms_${Date.now()}`,
        durationMs: Date.now() - start,
      };
    }

    return {
      success: true,
      providerMessageId: `sms_${Date.now()}`,
      durationMs: Date.now() - start,
    };
  }
}
