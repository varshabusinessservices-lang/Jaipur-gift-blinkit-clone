import { describe, it, expect, beforeEach } from 'vitest';
import { NotificationsService } from './notifications.service';
import { NotificationsRepository } from './notifications.repository';

describe('Communication and Notification Engine - Batch 21', () => {
  const service = new NotificationsService();
  const repo = new NotificationsRepository();

  beforeEach(async () => {
    await service.seedDefaultTemplatesAndRules();
  });

  it('should seed default templates and rules successfully', async () => {
    const templates = await repo.listTemplates();
    expect(templates.length).toBeGreaterThan(0);

    const rules = await repo.listRules();
    expect(rules.length).toBeGreaterThan(0);
  });

  it('should publish event and store in outbox table', async () => {
    const event = await service.publishEvent({
      eventType: 'ORDER_CREATED',
      aggregateType: 'Order',
      aggregateId: 'ord-test-123',
      customerId: 'cust-notif-1',
      payload: {
        orderNumber: 'ORD-2026-999999',
        totalAmount: 1499,
        deliverySlot: '10:00 AM - 12:00 PM',
        email: 'test@example.com',
        phone: '+919876543210',
      },
    });

    expect(event).toBeDefined();
    expect(event.eventType).toBe('ORDER_CREATED');
    expect(event.status).toBe('PENDING');
  });

  it('should process outbox events and generate notifications with idempotency', async () => {
    await service.publishEvent({
      eventType: 'ORDER_CREATED',
      aggregateType: 'Order',
      aggregateId: 'ord-test-456',
      customerId: 'cust-notif-1',
      payload: {
        orderNumber: 'ORD-2026-888888',
        totalAmount: 2499,
        deliverySlot: '2:00 PM - 4:00 PM',
        email: 'test2@example.com',
        phone: '+919876543211',
      },
    });

    await service.processOutboxEvents();

    const notifs = await repo.adminListNotifications({ customerId: 'cust-notif-1' });
    expect(notifs.items.length).toBeGreaterThan(0);
  });

  it('should render templates correctly with variable interpolation', () => {
    const templateStr = 'Hello {{customerName}}, your order #{{orderNumber}} is confirmed.';
    const rendered = service.renderTemplateString(templateStr, {
      customerName: 'Rahul',
      orderNumber: 'ORD-123',
    });

    expect(rendered).toBe('Hello Rahul, your order #ORD-123 is confirmed.');
  });

  it('should fetch notification stats correctly', async () => {
    const stats = await repo.getNotificationStats();
    expect(stats).toBeDefined();
    expect(typeof stats.queued).toBe('number');
  });
});
