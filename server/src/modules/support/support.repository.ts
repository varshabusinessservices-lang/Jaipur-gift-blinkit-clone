import fs from 'fs';
import path from 'path';
import { prisma, shouldAllowFallback } from '../../database/prisma';

const TICKETS_FILE = path.join(process.cwd(), 'server', 'src', 'modules', 'support', 'support_tickets.json');
const MESSAGES_FILE = path.join(process.cwd(), 'server', 'src', 'modules', 'support', 'support_messages.json');

function ensureFile(filePath: string, defaultData: any = []) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
    }
  } catch (err) {
    console.error(`Failed to ensure file ${filePath}:`, err);
  }
}

export class SupportRepository {
  constructor() {
    ensureFile(TICKETS_FILE);
    ensureFile(MESSAGES_FILE);
  }

  async createTicket(ticketData: any, initialMessageData: any): Promise<any> {
    try {
      if (!shouldAllowFallback()) {
        return await prisma.$transaction(async (tx) => {
          const ticket = await tx.supportTicket.create({ data: ticketData });
          await tx.supportMessage.create({ data: { ...initialMessageData, ticketId: ticket.id } });
          return await tx.supportTicket.findUnique({
            where: { id: ticket.id },
            include: { messages: true },
          });
        });
      }
    } catch (err) {
      console.warn('Prisma support ticket creation fallback:', err);
    }

    const tickets = JSON.parse(fs.readFileSync(TICKETS_FILE, 'utf-8') || '[]');
    const messages = JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf-8') || '[]');

    const record = {
      ...ticketData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    tickets.push(record);

    const msgRecord = {
      ...initialMessageData,
      ticketId: record.id,
      createdAt: new Date().toISOString(),
    };
    messages.push(msgRecord);

    fs.writeFileSync(TICKETS_FILE, JSON.stringify(tickets, null, 2));
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));

    return {
      ...record,
      messages: [msgRecord],
    };
  }

  async findTicketById(id: string): Promise<any> {
    try {
      if (!shouldAllowFallback()) {
        return await prisma.supportTicket.findUnique({
          where: { id },
          include: { messages: true },
        });
      }
    } catch (err) {}

    const tickets = JSON.parse(fs.readFileSync(TICKETS_FILE, 'utf-8') || '[]');
    const messages = JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf-8') || '[]');

    const ticket = tickets.find((t: any) => t.id === id);
    if (!ticket) return null;

    return {
      ...ticket,
      messages: messages.filter((m: any) => m.ticketId === id),
    };
  }

  async listTickets(filter: { customerId?: string; status?: string; category?: string } = {}): Promise<any[]> {
    try {
      if (!shouldAllowFallback()) {
        const where: any = {};
        if (filter.customerId) where.customerId = filter.customerId;
        if (filter.status) where.status = filter.status;
        if (filter.category) where.category = filter.category;
        return await prisma.supportTicket.findMany({
          where,
          include: { messages: true },
          orderBy: { createdAt: 'desc' },
        });
      }
    } catch (err) {}

    const tickets = JSON.parse(fs.readFileSync(TICKETS_FILE, 'utf-8') || '[]');
    const messages = JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf-8') || '[]');

    let list = tickets;
    if (filter.customerId) list = list.filter((t: any) => t.customerId === filter.customerId);
    if (filter.status) list = list.filter((t: any) => t.status === filter.status);
    if (filter.category) list = list.filter((t: any) => t.category === filter.category);

    return list
      .map((t: any) => ({
        ...t,
        messages: messages.filter((m: any) => m.ticketId === t.id),
      }))
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async addMessage(messageData: any): Promise<any> {
    try {
      if (!shouldAllowFallback()) {
        return await prisma.supportMessage.create({ data: messageData });
      }
    } catch (err) {}

    const messages = JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf-8') || '[]');
    const record = {
      ...messageData,
      createdAt: new Date().toISOString(),
    };
    messages.push(record);
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));
    return record;
  }

  async updateTicket(id: string, data: any): Promise<any> {
    try {
      if (!shouldAllowFallback()) {
        return await prisma.supportTicket.update({
          where: { id },
          data,
          include: { messages: true },
        });
      }
    } catch (err) {}

    const tickets = JSON.parse(fs.readFileSync(TICKETS_FILE, 'utf-8') || '[]');
    const idx = tickets.findIndex((t: any) => t.id === id);
    if (idx === -1) throw new Error('Ticket not found');

    tickets[idx] = {
      ...tickets[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    fs.writeFileSync(TICKETS_FILE, JSON.stringify(tickets, null, 2));
    return await this.findTicketById(id);
  }
}
