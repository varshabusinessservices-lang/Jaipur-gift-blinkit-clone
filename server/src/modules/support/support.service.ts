import { SupportRepository } from './support.repository';

export class SupportService {
  private repo = new SupportRepository();

  private generateTicketNumber(): string {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    return `TKT-2026-${randomNum}`;
  }

  async createTicket(data: {
    customerId: string;
    orderId?: string;
    returnId?: string;
    category: string;
    priority?: string;
    subject: string;
    message: string;
    attachments?: string[];
  }): Promise<any> {
    const ticketNumber = this.generateTicketNumber();
    const ticket = await this.repo.createTicket(
      {
        id: `tkt-${Date.now()}`,
        ticketNumber,
        customerId: data.customerId,
        orderId: data.orderId || null,
        returnId: data.returnId || null,
        category: data.category,
        priority: data.priority || 'NORMAL',
        status: 'OPEN',
        subject: data.subject,
      },
      {
        id: `msg-${Date.now()}`,
        senderType: 'CUSTOMER',
        senderName: 'Customer',
        message: data.message,
        attachmentsJson: JSON.stringify(data.attachments || []),
      }
    );
    return ticket;
  }

  async listTickets(filter: { customerId?: string; status?: string; category?: string } = {}): Promise<any[]> {
    return await this.repo.listTickets(filter);
  }

  async getTicketById(id: string): Promise<any> {
    const t = await this.repo.findTicketById(id);
    if (!t) throw new Error('Support ticket not found');
    return t;
  }

  async addMessage(data: {
    ticketId: string;
    senderType: 'CUSTOMER' | 'ADMIN' | 'SYSTEM';
    senderName?: string;
    message: string;
    attachments?: string[];
  }): Promise<any> {
    await this.getTicketById(data.ticketId);
    const msg = await this.repo.addMessage({
      id: `msg-${Date.now()}`,
      ticketId: data.ticketId,
      senderType: data.senderType,
      senderName: data.senderName || (data.senderType === 'ADMIN' ? 'Support Agent' : 'Customer'),
      message: data.message,
      attachmentsJson: JSON.stringify(data.attachments || []),
    });
    return msg;
  }

  async updateTicketStatus(id: string, status: string, assignedStaff?: string): Promise<any> {
    await this.getTicketById(id);
    const updateData: any = { status };
    if (assignedStaff) updateData.assignedStaff = assignedStaff;
    return await this.repo.updateTicket(id, updateData);
  }
}
