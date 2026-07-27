import { Request, Response } from 'express';
import { SupportService } from './support.service';

const service = new SupportService();

export class SupportController {
  async createTicket(req: Request, res: Response) {
    try {
      const { customerId, orderId, returnId, category, priority, subject, message, attachments } = req.body;
      if (!customerId || !category || !subject || !message) {
        return res.status(400).json({ error: 'customerId, category, subject, and message are required' });
      }
      const ticket = await service.createTicket({
        customerId,
        orderId,
        returnId,
        category,
        priority,
        subject,
        message,
        attachments,
      });
      return res.status(201).json({ success: true, data: ticket });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  async listTickets(req: Request, res: Response) {
    try {
      const { customerId, status, category } = req.query;
      const list = await service.listTickets({
        customerId: customerId ? String(customerId) : undefined,
        status: status ? String(status) : undefined,
        category: category ? String(category) : undefined,
      });
      return res.json({ success: true, data: list });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  async getTicket(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const ticket = await service.getTicketById(id);
      return res.json({ success: true, data: ticket });
    } catch (err: any) {
      return res.status(404).json({ success: false, error: err.message });
    }
  }

  async addMessage(req: Request, res: Response) {
    try {
      const { id } = req.params; // ticketId
      const { senderType, senderName, message, attachments } = req.body;
      if (!message) return res.status(400).json({ error: 'message is required' });
      const msg = await service.addMessage({
        ticketId: id,
        senderType: senderType || 'CUSTOMER',
        senderName,
        message,
        attachments,
      });
      return res.status(201).json({ success: true, data: msg });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  async updateTicketStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, assignedStaff } = req.body;
      if (!status) return res.status(400).json({ error: 'status is required' });
      const updated = await service.updateTicketStatus(id, status, assignedStaff);
      return res.json({ success: true, data: updated });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }
}
