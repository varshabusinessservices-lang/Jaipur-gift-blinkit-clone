import fs from 'fs';
import path from 'path';
import { prisma, shouldAllowFallback } from '../../database/prisma';

const OUTBOX_FILE = path.join(process.cwd(), 'server', 'src', 'modules', 'notifications', 'outbox_events.json');
const NOTIFICATIONS_FILE = path.join(process.cwd(), 'server', 'src', 'modules', 'notifications', 'notifications.json');
const TEMPLATES_FILE = path.join(process.cwd(), 'server', 'src', 'modules', 'notifications', 'notification_templates.json');
const RULES_FILE = path.join(process.cwd(), 'server', 'src', 'modules', 'notifications', 'event_notification_rules.json');
const PREFS_FILE = path.join(process.cwd(), 'server', 'src', 'modules', 'notifications', 'notification_preferences.json');
const DEVICES_FILE = path.join(process.cwd(), 'server', 'src', 'modules', 'notifications', 'device_registrations.json');

function ensureFile(filePath: string, defaultData: any = []) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
    }
  } catch (e) {
    // ignore
  }
}

export class NotificationsRepository {
  constructor() {
    ensureFile(OUTBOX_FILE);
    ensureFile(NOTIFICATIONS_FILE);
    ensureFile(TEMPLATES_FILE);
    ensureFile(RULES_FILE);
    ensureFile(PREFS_FILE);
    ensureFile(DEVICES_FILE);
  }

  async createOutboxEvent(data: {
    eventType: string;
    aggregateType: string;
    aggregateId: string;
    storeId?: string;
    customerId?: string;
    actorId?: string;
    correlationId?: string;
    causationId?: string;
    payload: string;
  }): Promise<any> {
    const record = {
      id: `outbox-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      ...data,
      status: 'PENDING',
      attempts: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      if (!shouldAllowFallback()) {
        return await prisma.outboxEvent.create({
          data: {
            eventType: data.eventType,
            aggregateType: data.aggregateType,
            aggregateId: data.aggregateId,
            storeId: data.storeId,
            customerId: data.customerId,
            actorId: data.actorId,
            correlationId: data.correlationId,
            causationId: data.causationId,
            payload: data.payload,
            status: 'PENDING',
            attempts: 0,
          },
        });
      }
    } catch (err) {
      // fallback
    }

    const items = JSON.parse(fs.readFileSync(OUTBOX_FILE, 'utf-8') || '[]');
    items.push(record);
    fs.writeFileSync(OUTBOX_FILE, JSON.stringify(items, null, 2));
    return record;
  }

  async getPendingOutboxEvents(limit = 50): Promise<any[]> {
    try {
      if (!shouldAllowFallback()) {
        return await prisma.outboxEvent.findMany({
          where: {
            status: { in: ['PENDING', 'FAILED'] },
          },
          orderBy: { createdAt: 'asc' },
          take: limit,
        });
      }
    } catch (err) {
      // fallback
    }

    const items = JSON.parse(fs.readFileSync(OUTBOX_FILE, 'utf-8') || '[]');
    return items.filter((i: any) => i.status === 'PENDING' || i.status === 'FAILED').slice(0, limit);
  }

  async updateOutboxStatus(id: string, status: string, error?: string, nextAttemptAt?: Date): Promise<any> {
    try {
      if (!shouldAllowFallback()) {
        return await prisma.outboxEvent.update({
          where: { id },
          data: {
            status,
            lastError: error,
            nextAttemptAt,
            processedAt: status === 'PROCESSED' ? new Date() : undefined,
          },
        });
      }
    } catch (err) {
      // fallback
    }

    const items = JSON.parse(fs.readFileSync(OUTBOX_FILE, 'utf-8') || '[]');
    const idx = items.findIndex((i: any) => i.id === id);
    if (idx !== -1) {
      items[idx].status = status;
      items[idx].lastError = error;
      if (status === 'PROCESSED') items[idx].processedAt = new Date().toISOString();
      fs.writeFileSync(OUTBOX_FILE, JSON.stringify(items, null, 2));
      return items[idx];
    }
    return null;
  }

  async findNotificationByIdempotencyKey(idempotencyKey: string): Promise<any> {
    try {
      if (!shouldAllowFallback()) {
        return await prisma.notification.findUnique({ where: { idempotencyKey } });
      }
    } catch (err) {}

    const items = JSON.parse(fs.readFileSync(NOTIFICATIONS_FILE, 'utf-8') || '[]');
    return items.find((i: any) => i.idempotencyKey === idempotencyKey) || null;
  }

  async createNotification(data: any): Promise<any> {
    const count = JSON.parse(fs.readFileSync(NOTIFICATIONS_FILE, 'utf-8') || '[]').length;
    const notificationNumber = `NTF-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;
    const record = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      notificationNumber,
      ...data,
      attempts: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      if (!shouldAllowFallback()) {
        return await prisma.notification.create({
          data: {
            ...data,
            notificationNumber,
          },
        });
      }
    } catch (err) {
      // fallback
    }

    const items = JSON.parse(fs.readFileSync(NOTIFICATIONS_FILE, 'utf-8') || '[]');
    items.push(record);
    fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify(items, null, 2));
    return record;
  }

  async getNotificationById(id: string): Promise<any> {
    try {
      if (!shouldAllowFallback()) {
        return await prisma.notification.findUnique({
          where: { id },
          include: { attemptsList: true },
        });
      }
    } catch (err) {}

    const items = JSON.parse(fs.readFileSync(NOTIFICATIONS_FILE, 'utf-8') || '[]');
    return items.find((i: any) => i.id === id) || null;
  }

  async listCustomerNotifications(customerId: string, query: { status?: string; category?: string; channel?: string; page?: number; limit?: number }): Promise<any> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    try {
      if (!shouldAllowFallback()) {
        const where: any = { customerId };
        if (query.status) where.status = query.status;
        if (query.category) where.category = query.category;
        if (query.channel) where.channel = query.channel;

        const [items, total] = await Promise.all([
          prisma.notification.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
          }),
          prisma.notification.count({ where }),
        ]);
        return { items, total, page, limit };
      }
    } catch (err) {}

    let items = JSON.parse(fs.readFileSync(NOTIFICATIONS_FILE, 'utf-8') || '[]');
    items = items.filter((i: any) => i.customerId === customerId);
    if (query.status) items = items.filter((i: any) => i.status === query.status);
    if (query.category) items = items.filter((i: any) => i.category === query.category);
    if (query.channel) items = items.filter((i: any) => i.channel === query.channel);

    const total = items.length;
    const paginated = items.slice(skip, skip + limit);
    return { items: paginated, total, page, limit };
  }

  async getUnreadCount(customerId: string): Promise<number> {
    try {
      if (!shouldAllowFallback()) {
        return await prisma.notification.count({
          where: {
            customerId,
            readAt: null,
            status: { notIn: ['CANCELLED', 'SKIPPED'] },
          },
        });
      }
    } catch (err) {}

    const items = JSON.parse(fs.readFileSync(NOTIFICATIONS_FILE, 'utf-8') || '[]');
    return items.filter((i: any) => i.customerId === customerId && !i.readAt && i.status !== 'CANCELLED' && i.status !== 'SKIPPED').length;
  }

  async markAsRead(id: string, customerId: string): Promise<any> {
    try {
      if (!shouldAllowFallback()) {
        return await prisma.notification.updateMany({
          where: { id, customerId },
          data: { readAt: new Date(), status: 'READ' },
        });
      }
    } catch (err) {}

    const items = JSON.parse(fs.readFileSync(NOTIFICATIONS_FILE, 'utf-8') || '[]');
    const idx = items.findIndex((i: any) => i.id === id && i.customerId === customerId);
    if (idx !== -1) {
      items[idx].readAt = new Date().toISOString();
      items[idx].status = 'READ';
      fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify(items, null, 2));
    }
    return { count: 1 };
  }

  async markAllAsRead(customerId: string): Promise<any> {
    try {
      if (!shouldAllowFallback()) {
        return await prisma.notification.updateMany({
          where: { customerId, readAt: null },
          data: { readAt: new Date(), status: 'READ' },
        });
      }
    } catch (err) {}

    const items = JSON.parse(fs.readFileSync(NOTIFICATIONS_FILE, 'utf-8') || '[]');
    items.forEach((i: any) => {
      if (i.customerId === customerId && !i.readAt) {
        i.readAt = new Date().toISOString();
        i.status = 'READ';
      }
    });
    fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify(items, null, 2));
    return { success: true };
  }

  async getTemplateByCode(code: string, channel: string, locale = 'en'): Promise<any> {
    try {
      if (!shouldAllowFallback()) {
        return await prisma.notificationTemplate.findFirst({
          where: { code, channel, locale, isActive: true, deletedAt: null },
          orderBy: { version: 'desc' },
        });
      }
    } catch (err) {}

    const items = JSON.parse(fs.readFileSync(TEMPLATES_FILE, 'utf-8') || '[]');
    return items.find((t: any) => t.code === code && t.channel === channel && t.locale === locale && t.isActive) || null;
  }

  async getRulesForEvent(eventType: string): Promise<any[]> {
    try {
      if (!shouldAllowFallback()) {
        return await prisma.eventNotificationRule.findMany({
          where: { eventType, isEnabled: true },
        });
      }
    } catch (err) {}

    const items = JSON.parse(fs.readFileSync(RULES_FILE, 'utf-8') || '[]');
    return items.filter((r: any) => r.eventType === eventType && r.isEnabled);
  }

  async getCustomerPreferences(customerId: string): Promise<any[]> {
    try {
      if (!shouldAllowFallback()) {
        return await prisma.notificationPreference.findMany({
          where: { customerId },
        });
      }
    } catch (err) {}

    const items = JSON.parse(fs.readFileSync(PREFS_FILE, 'utf-8') || '[]');
    return items.filter((p: any) => p.customerId === customerId);
  }

  async updateCustomerPreference(customerId: string, category: string, prefs: any): Promise<any> {
    const record = { customerId, category, ...prefs, updatedAt: new Date().toISOString() };
    try {
      if (!shouldAllowFallback()) {
        return await prisma.notificationPreference.upsert({
          where: { customerId_category: { customerId, category } },
          update: prefs,
          create: { customerId, category, ...prefs },
        });
      }
    } catch (err) {}

    const items = JSON.parse(fs.readFileSync(PREFS_FILE, 'utf-8') || '[]');
    const idx = items.findIndex((p: any) => p.customerId === customerId && p.category === category);
    if (idx !== -1) {
      items[idx] = { ...items[idx], ...record };
    } else {
      items.push({ id: `pref-${Date.now()}`, ...record, createdAt: new Date().toISOString() });
    }
    fs.writeFileSync(PREFS_FILE, JSON.stringify(items, null, 2));
    return record;
  }

  async registerDevice(data: any): Promise<any> {
    const record = { id: data.deviceId || `dev-${Date.now()}`, ...data, lastSeenAt: new Date().toISOString(), isActive: true };
    try {
      if (!shouldAllowFallback()) {
        return await prisma.deviceRegistration.upsert({
          where: { id: data.deviceId },
          update: { pushToken: data.pushToken, lastSeenAt: new Date(), isActive: true },
          create: { ...data },
        });
      }
    } catch (err) {}

    const items = JSON.parse(fs.readFileSync(DEVICES_FILE, 'utf-8') || '[]');
    const idx = items.findIndex((d: any) => d.id === record.id);
    if (idx !== -1) {
      items[idx] = { ...items[idx], ...record };
    } else {
      items.push(record);
    }
    fs.writeFileSync(DEVICES_FILE, JSON.stringify(items, null, 2));
    return record;
  }

  async unregisterDevice(id: string): Promise<any> {
    try {
      if (!shouldAllowFallback()) {
        return await prisma.deviceRegistration.update({
          where: { id },
          data: { isActive: false, revokedAt: new Date() },
        });
      }
    } catch (err) {}

    const items = JSON.parse(fs.readFileSync(DEVICES_FILE, 'utf-8') || '[]');
    const idx = items.findIndex((d: any) => d.id === id);
    if (idx !== -1) {
      items[idx].isActive = false;
      items[idx].revokedAt = new Date().toISOString();
      fs.writeFileSync(DEVICES_FILE, JSON.stringify(items, null, 2));
      return items[idx];
    }
    return null;
  }

  async updateNotification(id: string, data: any): Promise<any> {
    try {
      if (!shouldAllowFallback()) {
        return await prisma.notification.update({
          where: { id },
          data,
        });
      }
    } catch (err) {}

    const items = JSON.parse(fs.readFileSync(NOTIFICATIONS_FILE, 'utf-8') || '[]');
    const idx = items.findIndex((i: any) => i.id === id);
    if (idx !== -1) {
      items[idx] = { ...items[idx], ...data, updatedAt: new Date().toISOString() };
      fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify(items, null, 2));
      return items[idx];
    }
    return null;
  }

  async recordAttempt(data: any): Promise<any> {
    const record = { id: `att-${Date.now()}`, ...data, createdAt: new Date().toISOString() };
    try {
      if (!shouldAllowFallback()) {
        return await prisma.notificationDeliveryAttempt.create({ data });
      }
    } catch (err) {}
    return record;
  }

  async recordCallback(data: any): Promise<any> {
    return { id: `cb-${Date.now()}`, ...data, receivedAt: new Date().toISOString() };
  }

  async adminListNotifications(query: any): Promise<any> {
    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '20');
    const skip = (page - 1) * limit;

    try {
      if (!shouldAllowFallback()) {
        const where: any = {};
        if (query.status) where.status = query.status;
        if (query.channel) where.channel = query.channel;
        if (query.category) where.category = query.category;
        if (query.customerId) where.customerId = query.customerId;

        const [items, total] = await Promise.all([
          prisma.notification.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
            include: { attemptsList: true },
          }),
          prisma.notification.count({ where }),
        ]);
        return { items, total, page, limit };
      }
    } catch (err) {}

    let items = JSON.parse(fs.readFileSync(NOTIFICATIONS_FILE, 'utf-8') || '[]');
    if (query.status) items = items.filter((i: any) => i.status === query.status);
    if (query.channel) items = items.filter((i: any) => i.channel === query.channel);
    if (query.category) items = items.filter((i: any) => i.category === query.category);
    if (query.customerId) items = items.filter((i: any) => i.customerId === query.customerId);

    const total = items.length;
    const paginated = items.slice(skip, skip + limit);
    return { items: paginated, total, page, limit };
  }

  async getNotificationStats(): Promise<any> {
    try {
      if (!shouldAllowFallback()) {
        const [queued, sent, delivered, failed, deadLetter] = await Promise.all([
          prisma.notification.count({ where: { status: 'QUEUED' } }),
          prisma.notification.count({ where: { status: 'SENT' } }),
          prisma.notification.count({ where: { status: 'DELIVERED' } }),
          prisma.notification.count({ where: { status: 'FAILED' } }),
          prisma.notification.count({ where: { status: 'DEAD_LETTER' } }),
        ]);
        return { queued, sent, delivered, failed, deadLetter };
      }
    } catch (err) {}

    const items = JSON.parse(fs.readFileSync(NOTIFICATIONS_FILE, 'utf-8') || '[]');
    return {
      queued: items.filter((i: any) => i.status === 'QUEUED').length,
      sent: items.filter((i: any) => i.status === 'SENT').length,
      delivered: items.filter((i: any) => i.status === 'DELIVERED').length,
      failed: items.filter((i: any) => i.status === 'FAILED').length,
      deadLetter: items.filter((i: any) => i.status === 'DEAD_LETTER').length,
    };
  }

  async listTemplates(): Promise<any[]> {
    try {
      if (!shouldAllowFallback()) {
        return await prisma.notificationTemplate.findMany({
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
        });
      }
    } catch (err) {}

    return JSON.parse(fs.readFileSync(TEMPLATES_FILE, 'utf-8') || '[]');
  }

  async upsertTemplate(data: any): Promise<any> {
    const record = { id: `tpl-${Date.now()}`, ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    try {
      if (!shouldAllowFallback()) {
        return await prisma.notificationTemplate.create({ data });
      }
    } catch (err) {}

    const items = JSON.parse(fs.readFileSync(TEMPLATES_FILE, 'utf-8') || '[]');
    items.push(record);
    fs.writeFileSync(TEMPLATES_FILE, JSON.stringify(items, null, 2));
    return record;
  }

  async updateTemplate(id: string, data: any): Promise<any> {
    try {
      if (!shouldAllowFallback()) {
        return await prisma.notificationTemplate.update({ where: { id }, data });
      }
    } catch (err) {}

    const items = JSON.parse(fs.readFileSync(TEMPLATES_FILE, 'utf-8') || '[]');
    const idx = items.findIndex((t: any) => t.id === id);
    if (idx !== -1) {
      items[idx] = { ...items[idx], ...data, updatedAt: new Date().toISOString() };
      fs.writeFileSync(TEMPLATES_FILE, JSON.stringify(items, null, 2));
      return items[idx];
    }
    return null;
  }

  async listRules(): Promise<any[]> {
    try {
      if (!shouldAllowFallback()) {
        return await prisma.eventNotificationRule.findMany({ orderBy: { eventType: 'asc' } });
      }
    } catch (err) {}

    return JSON.parse(fs.readFileSync(RULES_FILE, 'utf-8') || '[]');
  }

  async upsertRule(data: any): Promise<any> {
    const record = { id: `rule-${Date.now()}`, ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    try {
      if (!shouldAllowFallback()) {
        return await prisma.eventNotificationRule.create({ data });
      }
    } catch (err) {}

    const items = JSON.parse(fs.readFileSync(RULES_FILE, 'utf-8') || '[]');
    items.push(record);
    fs.writeFileSync(RULES_FILE, JSON.stringify(items, null, 2));
    return record;
  }

  async updateRule(id: string, data: any): Promise<any> {
    try {
      if (!shouldAllowFallback()) {
        return await prisma.eventNotificationRule.update({ where: { id }, data });
      }
    } catch (err) {}

    const items = JSON.parse(fs.readFileSync(RULES_FILE, 'utf-8') || '[]');
    const idx = items.findIndex((r: any) => r.id === id);
    if (idx !== -1) {
      items[idx] = { ...items[idx], ...data, updatedAt: new Date().toISOString() };
      fs.writeFileSync(RULES_FILE, JSON.stringify(items, null, 2));
      return items[idx];
    }
    return null;
  }
}
