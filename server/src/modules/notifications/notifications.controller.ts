import { Request, Response } from 'express';
import { NotificationsRepository } from './notifications.repository';
import { NotificationsService } from './notifications.service';

const repo = new NotificationsRepository();
const service = new NotificationsService();

export class NotificationsController {
  async getNotifications(req: Request, res: Response) {
    try {
      const customerId = req.query.customerId ? String(req.query.customerId) : 'cust-default';
      const { status, category, channel, page, limit } = req.query;
      const result = await repo.listCustomerNotifications(customerId, {
        status: status ? String(status) : undefined,
        category: category ? String(category) : undefined,
        channel: channel ? String(channel) : undefined,
        page: page ? parseInt(String(page)) : 1,
        limit: limit ? parseInt(String(limit)) : 20,
      });
      return res.json({ success: true, data: result });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  async getUnreadCount(req: Request, res: Response) {
    try {
      const customerId = req.query.customerId ? String(req.query.customerId) : 'cust-default';
      const count = await repo.getUnreadCount(customerId);
      return res.json({ success: true, data: { unreadCount: count } });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  async markAsRead(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const customerId = req.body.customerId || 'cust-default';
      await repo.markAsRead(id, customerId);
      return res.json({ success: true, message: 'Marked as read' });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  async markAllAsRead(req: Request, res: Response) {
    try {
      const customerId = req.body.customerId || 'cust-default';
      await repo.markAllAsRead(customerId);
      return res.json({ success: true, message: 'All marked as read' });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  async getPreferences(req: Request, res: Response) {
    try {
      const customerId = req.query.customerId ? String(req.query.customerId) : 'cust-default';
      const prefs = await repo.getCustomerPreferences(customerId);
      return res.json({ success: true, data: prefs });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  async updatePreferences(req: Request, res: Response) {
    try {
      const { customerId = 'cust-default', category, ...rest } = req.body;
      if (!category) return res.status(400).json({ error: 'category is required' });
      const updated = await repo.updateCustomerPreference(customerId, category, rest);
      return res.json({ success: true, data: updated });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  async registerDevice(req: Request, res: Response) {
    try {
      const device = await repo.registerDevice(req.body);
      return res.status(201).json({ success: true, data: device });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  async unregisterDevice(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await repo.unregisterDevice(id);
      return res.json({ success: true, message: 'Device revoked' });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  // Admin Endpoints
  async adminListNotifications(req: Request, res: Response) {
    try {
      const result = await repo.adminListNotifications(req.query);
      return res.json({ success: true, data: result });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  async adminGetNotification(req: Request, res: Response) {
    try {
      const notification = await repo.getNotificationById(req.params.id);
      return res.json({ success: true, data: notification });
    } catch (err: any) {
      return res.status(404).json({ success: false, error: err.message });
    }
  }

  async adminGetStats(req: Request, res: Response) {
    try {
      const stats = await repo.getNotificationStats();
      return res.json({ success: true, data: stats });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  async adminListTemplates(req: Request, res: Response) {
    try {
      const templates = await repo.listTemplates();
      return res.json({ success: true, data: templates });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  async adminCreateTemplate(req: Request, res: Response) {
    try {
      const template = await repo.upsertTemplate(req.body);
      return res.status(201).json({ success: true, data: template });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  async adminUpdateTemplate(req: Request, res: Response) {
    try {
      const updated = await repo.updateTemplate(req.params.id, req.body);
      return res.json({ success: true, data: updated });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  async adminListRules(req: Request, res: Response) {
    try {
      const rules = await repo.listRules();
      return res.json({ success: true, data: rules });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  async adminCreateRule(req: Request, res: Response) {
    try {
      const rule = await repo.upsertRule(req.body);
      return res.status(201).json({ success: true, data: rule });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  async adminUpdateRule(req: Request, res: Response) {
    try {
      const updated = await repo.updateRule(req.params.id, req.body);
      return res.json({ success: true, data: updated });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  async adminProviderHealth(req: Request, res: Response) {
    try {
      return res.json({
        success: true,
        data: {
          mode: process.env.NOTIFICATION_PROVIDER_MODE || 'mock',
          email: 'HEALTHY',
          sms: 'HEALTHY',
          whatsapp: 'HEALTHY',
          push: 'HEALTHY',
          timestamp: new Date().toISOString(),
        },
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }
}
