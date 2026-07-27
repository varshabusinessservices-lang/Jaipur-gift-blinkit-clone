import { NotificationsRepository } from './notifications.repository';
import { EmailAdapter } from './adapters/email.adapter';
import { SmsAdapter } from './adapters/sms.adapter';
import { WhatsappAdapter } from './adapters/whatsapp.adapter';
import { PushAdapter } from './adapters/push.adapter';
import crypto from 'crypto';

const repo = new NotificationsRepository();
const emailAdapter = new EmailAdapter();
const smsAdapter = new SmsAdapter();
const whatsappAdapter = new WhatsappAdapter();
const pushAdapter = new PushAdapter();

export class NotificationsService {
  async publishEvent(data: {
    eventType: string;
    aggregateType: string;
    aggregateId: string;
    storeId?: string;
    customerId?: string;
    actorId?: string;
    correlationId?: string;
    causationId?: string;
    payload: Record<string, any>;
  }) {
    const eventRecord = await repo.createOutboxEvent({
      eventType: data.eventType,
      aggregateType: data.aggregateType,
      aggregateId: data.aggregateId,
      storeId: data.storeId,
      customerId: data.customerId,
      actorId: data.actorId,
      correlationId: data.correlationId,
      causationId: data.causationId,
      payload: JSON.stringify(data.payload),
    });

    // Optionally trigger immediate processing or leave for outbox worker
    return eventRecord;
  }

  async seedDefaultTemplatesAndRules() {
    const defaultTemplates = [
      { code: 'OTP_SMS', name: 'Login OTP SMS', channel: 'SMS', category: 'AUTHENTICATION', locale: 'en', isActive: true, bodyTemplate: 'Your Jaipur Gifting OTP is {{otp}}. Valid for 10 minutes.' },
      { code: 'ORDER_PLACED_EMAIL', name: 'Order Placed Email', channel: 'EMAIL', category: 'ORDER', locale: 'en', isActive: true, subjectTemplate: 'Order Confirmed - #{{orderNumber}}', bodyTemplate: 'Thank you for your order! Total amount: ₹{{totalAmount}}. Delivery slot: {{deliverySlot}}.' },
      { code: 'ORDER_PLACED_WA', name: 'Order Placed WhatsApp', channel: 'WHATSAPP', category: 'ORDER', locale: 'en', isActive: true, bodyTemplate: 'order_placed', payloadTemplate: '{"orderNumber":"{{orderNumber}}","amount":"{{totalAmount}}"}' },
      { code: 'DELIVERY_OUT_PUSH', name: 'Out For Delivery Push', channel: 'PUSH', category: 'DELIVERY', locale: 'en', isActive: true, subjectTemplate: 'Out for Delivery', bodyTemplate: 'Your order #{{orderNumber}} is out for delivery with rider {{riderName}}.' },
      { code: 'REFUND_COMPLETED_EMAIL', name: 'Refund Completed Email', channel: 'EMAIL', category: 'REFUND', locale: 'en', isActive: true, subjectTemplate: 'Refund Processed - #{{orderNumber}}', bodyTemplate: 'Your refund of ₹{{refundAmount}} has been processed successfully.' },
    ];

    for (const t of defaultTemplates) {
      const existing = await repo.getTemplateByCode(t.code, t.channel);
      if (!existing) {
        await repo.upsertTemplate(t);
      }
    }

    const defaultRules = [
      { eventType: 'OTP_REQUESTED', channel: 'SMS', recipientRule: 'CUSTOMER', templateCode: 'OTP_SMS', priority: 'CRITICAL', isEnabled: true },
      { eventType: 'ORDER_CREATED', channel: 'EMAIL', recipientRule: 'CUSTOMER', templateCode: 'ORDER_PLACED_EMAIL', priority: 'HIGH', isEnabled: true },
      { eventType: 'ORDER_CREATED', channel: 'WHATSAPP', recipientRule: 'CUSTOMER', templateCode: 'ORDER_PLACED_WA', priority: 'HIGH', isEnabled: true },
      { eventType: 'ORDER_OUT_FOR_DELIVERY', channel: 'PUSH', recipientRule: 'CUSTOMER', templateCode: 'DELIVERY_OUT_PUSH', priority: 'HIGH', isEnabled: true },
      { eventType: 'REFUND_COMPLETED', channel: 'EMAIL', recipientRule: 'CUSTOMER', templateCode: 'REFUND_COMPLETED_EMAIL', priority: 'HIGH', isEnabled: true },
    ];

    for (const r of defaultRules) {
      const rules = await repo.getRulesForEvent(r.eventType);
      const found = rules.find((rule: any) => rule.channel === r.channel && rule.templateCode === r.templateCode);
      if (!found) {
        await repo.upsertRule(r);
      }
    }
  }

  async processOutboxEvents() {
    const events = await repo.getPendingOutboxEvents(20);
    for (const ev of events) {
      try {
        await repo.updateOutboxStatus(ev.id, 'PROCESSING');
        const payloadObj = JSON.parse(ev.payload);

        // Find rules for this eventType
        const rules = await repo.getRulesForEvent(ev.eventType);
        for (const rule of rules) {
          await this.dispatchNotificationFromRule(ev, rule, payloadObj);
        }

        await repo.updateOutboxStatus(ev.id, 'PROCESSED');
      } catch (err: any) {
        const attempts = ev.attempts + 1;
        const maxAttempts = 5;
        const status = attempts >= maxAttempts ? 'DEAD_LETTER' : 'FAILED';
        const nextAttemptAt = new Date(Date.now() + Math.pow(2, attempts) * 1000);
        await repo.updateOutboxStatus(ev.id, status, err.message, nextAttemptAt);
      }
    }
  }

  async dispatchNotificationFromRule(eventRecord: any, rule: any, payload: Record<string, any>) {
    const customerId = eventRecord.customerId || payload.customerId;
    const channel = rule.channel;
    const category = this.mapCategory(eventRecord.eventType);

    // Check preferences unless category is SECURITY / AUTHENTICATION
    if (customerId && category !== 'SECURITY' && category !== 'AUTHENTICATION') {
      const prefs = await repo.getCustomerPreferences(customerId);
      const catPref = prefs.find((p: any) => p.category === category);
      if (catPref) {
        if (channel === 'EMAIL' && !catPref.emailEnabled) return;
        if (channel === 'SMS' && !catPref.smsEnabled) return;
        if (channel === 'WHATSAPP' && !catPref.whatsappEnabled) return;
        if (channel === 'PUSH' && !catPref.pushEnabled) return;
        if (channel === 'IN_APP' && !catPref.inAppEnabled) return;
      }
    }

    // Load template
    const template = await repo.getTemplateByCode(rule.templateCode, channel);
    let subject = template?.subjectTemplate || '';
    let body = template?.bodyTemplate || 'Notification message';

    // Render variables
    subject = this.renderTemplateString(subject, payload);
    body = this.renderTemplateString(body, payload);

    const idempotencyKey = crypto
      .createHash('sha256')
      .update(`${eventRecord.id}-${channel}-${rule.templateCode}-${customerId || 'global'}`)
      .digest('hex');

    // Check existing notification with idempotencyKey
    const existing = await repo.findNotificationByIdempotencyKey(idempotencyKey);
    if (existing) {
      return; // Already generated / sent
    }

    const notification = await repo.createNotification({
      eventId: eventRecord.id,
      recipientType: rule.recipientRule,
      customerId,
      channel,
      category,
      templateId: template?.id,
      renderedSubject: subject,
      renderedBody: body,
      priority: rule.priority,
      status: 'QUEUED',
      idempotencyKey,
      metadataJson: JSON.stringify(payload),
    });

    await this.executeNotificationDelivery(notification, payload);
  }

  async executeNotificationDelivery(notification: any, payload: Record<string, any>) {
    const start = Date.now();
    try {
      let res: any = { success: true };
      if (notification.channel === 'EMAIL') {
        res = await emailAdapter.send({
          to: payload.email || 'customer@example.com',
          subject: notification.renderedSubject || 'Notification',
          body: notification.renderedBody,
        });
      } else if (notification.channel === 'SMS') {
        res = await smsAdapter.send({
          phone: payload.phone || '+919876543210',
          message: notification.renderedBody,
        });
      } else if (notification.channel === 'WHATSAPP') {
        res = await whatsappAdapter.send({
          phone: payload.phone || '+919876543210',
          templateName: notification.renderedBody,
          payload,
        });
      } else if (notification.channel === 'PUSH') {
        res = await pushAdapter.send({
          pushToken: payload.pushToken || 'mock_token',
          title: notification.renderedSubject || 'Alert',
          body: notification.renderedBody,
        });
      } else if (notification.channel === 'IN_APP') {
        // In-app is automatically delivered in db queue
        res = { success: true, providerMessageId: `inapp_${Date.now()}` };
      }

      const duration = Date.now() - start;
      await repo.recordAttempt({
        notificationId: notification.id,
        channel: notification.channel,
        provider: 'mock',
        status: res.success ? 'SUCCESS' : 'FAILED',
        durationMs: duration,
      });

      await repo.updateNotification(notification.id, {
        status: 'SENT',
        sentAt: new Date(),
        providerMessageId: res.providerMessageId,
        attempts: (notification.attempts || 0) + 1,
      });
    } catch (err: any) {
      await repo.recordAttempt({
        notificationId: notification.id,
        channel: notification.channel,
        provider: 'mock',
        status: 'FAILED',
        errorMessage: err.message,
        durationMs: Date.now() - start,
      });

      await repo.updateNotification(notification.id, {
        status: 'FAILED',
        lastError: err.message,
        attempts: (notification.attempts || 0) + 1,
      });
    }
  }

  renderTemplateString(templateStr: string, payload: Record<string, any>): string {
    if (!templateStr) return '';
    return templateStr.replace(/\{\{(.+?)\}\}/g, (match, key) => {
      const trimmed = key.trim();
      return payload[trimmed] !== undefined ? String(payload[trimmed]) : match;
    });
  }

  mapCategory(eventType: string): string {
    if (eventType.includes('OTP') || eventType.includes('SECURITY')) return 'AUTHENTICATION';
    if (eventType.includes('ORDER') || eventType.includes('CART') || eventType.includes('CHECKOUT')) return 'ORDER';
    if (eventType.includes('PAYMENT')) return 'PAYMENT';
    if (eventType.includes('PRODUCTION') || eventType.includes('ARTWORK') || eventType.includes('QC') || eventType.includes('PACKING')) return 'PRODUCTION';
    if (eventType.includes('DELIVERY')) return 'DELIVERY';
    if (eventType.includes('RETURN')) return 'RETURN';
    if (eventType.includes('REFUND')) return 'REFUND';
    if (eventType.includes('REPLACEMENT')) return 'REPLACEMENT';
    if (eventType.includes('SUPPORT')) return 'SUPPORT';
    return 'SYSTEM';
  }
}
