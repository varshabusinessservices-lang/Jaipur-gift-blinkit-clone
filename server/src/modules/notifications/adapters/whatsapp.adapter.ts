export class WhatsappAdapter {
  async send(options: { phone: string; templateName: string; payload: Record<string, any> }) {
    const mode = process.env.NOTIFICATION_PROVIDER_MODE || 'mock';
    const start = Date.now();

    if (mode === 'mock') {
      console.log(`[Mock WhatsApp] To: ${options.phone} | Template: ${options.templateName}`, options.payload);
      return {
        success: true,
        providerMessageId: `mock_wa_${Date.now()}`,
        durationMs: Date.now() - start,
      };
    }

    return {
      success: true,
      providerMessageId: `wa_${Date.now()}`,
      durationMs: Date.now() - start,
    };
  }
}
