export class EmailAdapter {
  async send(options: { to: string; subject: string; body: string; replyTo?: string }) {
    const mode = process.env.NOTIFICATION_PROVIDER_MODE || 'mock';
    const start = Date.now();

    if (mode === 'mock') {
      console.log(`[Mock Email] To: ${options.to} | Subject: ${options.subject}`);
      return {
        success: true,
        providerMessageId: `mock_email_${Date.now()}`,
        durationMs: Date.now() - start,
      };
    }

    // Real SMTP / SendGrid / Resend logic placeholder
    return {
      success: true,
      providerMessageId: `email_${Date.now()}`,
      durationMs: Date.now() - start,
    };
  }
}
