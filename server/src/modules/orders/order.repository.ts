import fs from 'fs';
import path from 'path';
import { prisma, shouldAllowFallback } from '../../database/prisma';

const ORDERS_FILE = path.join(process.cwd(), 'server', 'src', 'modules', 'orders', 'orders.json');
const ORDER_ITEMS_FILE = path.join(process.cwd(), 'server', 'src', 'modules', 'orders', 'order_items.json');
const ORDER_TIMELINES_FILE = path.join(process.cwd(), 'server', 'src', 'modules', 'orders', 'order_timelines.json');
const ORDER_PAYMENTS_FILE = path.join(process.cwd(), 'server', 'src', 'modules', 'orders', 'order_payments.json');
const INVENTORY_RESERVATIONS_FILE = path.join(process.cwd(), 'server', 'src', 'modules', 'orders', 'inventory_reservations.json');
const INVOICES_FILE = path.join(process.cwd(), 'server', 'src', 'modules', 'orders', 'invoices.json');

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

export class OrderRepository {
  constructor() {
    ensureFile(ORDERS_FILE);
    ensureFile(ORDER_ITEMS_FILE);
    ensureFile(ORDER_TIMELINES_FILE);
    ensureFile(ORDER_PAYMENTS_FILE);
    ensureFile(INVENTORY_RESERVATIONS_FILE);
    ensureFile(INVOICES_FILE);
  }

  async createOrderWithRelations(data: {
    order: any;
    items: any[];
    timeline: any;
    payment: any;
    inventoryReservations: any[];
    invoice: any;
  }): Promise<any> {
    try {
      if (!shouldAllowFallback()) {
        return await prisma.$transaction(async (tx) => {
          const createdOrder = await tx.order.create({ data: data.order });
          for (const item of data.items) {
            await tx.orderItem.create({ data: { ...item, orderId: createdOrder.id } });
          }
          await tx.orderTimeline.create({ data: { ...data.timeline, orderId: createdOrder.id } });
          await tx.orderPayment.create({ data: { ...data.payment, orderId: createdOrder.id } });
          for (const inv of data.inventoryReservations) {
            await tx.inventoryReservation.create({ data: { ...inv, orderId: createdOrder.id } });
          }
          await tx.invoice.create({ data: { ...data.invoice, orderId: createdOrder.id } });

          return await tx.order.findUnique({
            where: { id: createdOrder.id },
            include: { items: true, timelines: true, payments: true, invoices: true },
          });
        });
      }
    } catch (err) {
      console.warn('Prisma transaction order creation failed, falling back to JSON storage:', err);
    }

    // JSON Fallback
    const orders = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf-8') || '[]');
    const itemsList = JSON.parse(fs.readFileSync(ORDER_ITEMS_FILE, 'utf-8') || '[]');
    const timelines = JSON.parse(fs.readFileSync(ORDER_TIMELINES_FILE, 'utf-8') || '[]');
    const payments = JSON.parse(fs.readFileSync(ORDER_PAYMENTS_FILE, 'utf-8') || '[]');
    const inventories = JSON.parse(fs.readFileSync(INVENTORY_RESERVATIONS_FILE, 'utf-8') || '[]');
    const invoices = JSON.parse(fs.readFileSync(INVOICES_FILE, 'utf-8') || '[]');

    const orderRecord = {
      ...data.order,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    orders.push(orderRecord);

    const createdItems = data.items.map(item => ({
      ...item,
      orderId: orderRecord.id,
      createdAt: new Date().toISOString(),
    }));
    itemsList.push(...createdItems);

    const timelineRecord = {
      ...data.timeline,
      orderId: orderRecord.id,
      createdAt: new Date().toISOString(),
    };
    timelines.push(timelineRecord);

    const paymentRecord = {
      ...data.payment,
      orderId: orderRecord.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    payments.push(paymentRecord);

    const createdInv = data.inventoryReservations.map(inv => ({
      ...inv,
      orderId: orderRecord.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    inventories.push(...createdInv);

    const invoiceRecord = {
      ...data.invoice,
      orderId: orderRecord.id,
      createdAt: new Date().toISOString(),
    };
    invoices.push(invoiceRecord);

    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
    fs.writeFileSync(ORDER_ITEMS_FILE, JSON.stringify(itemsList, null, 2));
    fs.writeFileSync(ORDER_TIMELINES_FILE, JSON.stringify(timelines, null, 2));
    fs.writeFileSync(ORDER_PAYMENTS_FILE, JSON.stringify(payments, null, 2));
    fs.writeFileSync(INVENTORY_RESERVATIONS_FILE, JSON.stringify(inventories, null, 2));
    fs.writeFileSync(INVOICES_FILE, JSON.stringify(invoices, null, 2));

    return {
      ...orderRecord,
      items: createdItems,
      timelines: [timelineRecord],
      payments: [paymentRecord],
      invoices: [invoiceRecord],
    };
  }

  async findOrderById(id: string): Promise<any> {
    try {
      if (!shouldAllowFallback()) {
        return await prisma.order.findUnique({
          where: { id },
          include: { items: true, timelines: true, payments: true, invoices: true },
        });
      }
    } catch (err) {}

    const orders = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf-8') || '[]');
    const items = JSON.parse(fs.readFileSync(ORDER_ITEMS_FILE, 'utf-8') || '[]');
    const timelines = JSON.parse(fs.readFileSync(ORDER_TIMELINES_FILE, 'utf-8') || '[]');
    const payments = JSON.parse(fs.readFileSync(ORDER_PAYMENTS_FILE, 'utf-8') || '[]');
    const invoices = JSON.parse(fs.readFileSync(INVOICES_FILE, 'utf-8') || '[]');

    const order = orders.find((o: any) => o.id === id);
    if (!order) return null;

    return {
      ...order,
      items: items.filter((i: any) => i.orderId === id),
      timelines: timelines.filter((t: any) => t.orderId === id),
      payments: payments.filter((p: any) => p.orderId === id),
      invoices: invoices.filter((inv: any) => inv.orderId === id),
    };
  }

  async findOrdersByCustomer(customerId: string): Promise<any[]> {
    try {
      if (!shouldAllowFallback()) {
        return await prisma.order.findMany({
          where: { customerId },
          include: { items: true, timelines: true, payments: true, invoices: true },
          orderBy: { createdAt: 'desc' },
        });
      }
    } catch (err) {}

    const orders = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf-8') || '[]');
    const items = JSON.parse(fs.readFileSync(ORDER_ITEMS_FILE, 'utf-8') || '[]');
    const timelines = JSON.parse(fs.readFileSync(ORDER_TIMELINES_FILE, 'utf-8') || '[]');
    const payments = JSON.parse(fs.readFileSync(ORDER_PAYMENTS_FILE, 'utf-8') || '[]');
    const invoices = JSON.parse(fs.readFileSync(INVOICES_FILE, 'utf-8') || '[]');

    return orders
      .filter((o: any) => o.customerId === customerId)
      .map((o: any) => ({
        ...o,
        items: items.filter((i: any) => i.orderId === o.id),
        timelines: timelines.filter((t: any) => t.orderId === o.id),
        payments: payments.filter((p: any) => p.orderId === o.id),
        invoices: invoices.filter((inv: any) => inv.orderId === o.id),
      }))
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async findAllOrders(filters?: { status?: string; customerId?: string }): Promise<any[]> {
    try {
      if (!shouldAllowFallback()) {
        const where: any = {};
        if (filters?.status) where.status = filters.status;
        if (filters?.customerId) where.customerId = filters.customerId;
        return await prisma.order.findMany({
          where,
          include: { items: true, timelines: true, payments: true, invoices: true },
          orderBy: { createdAt: 'desc' },
        });
      }
    } catch (err) {}

    let orders = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf-8') || '[]');
    if (filters?.status) orders = orders.filter((o: any) => o.status === filters.status);
    if (filters?.customerId) orders = orders.filter((o: any) => o.customerId === filters.customerId);

    const items = JSON.parse(fs.readFileSync(ORDER_ITEMS_FILE, 'utf-8') || '[]');
    const timelines = JSON.parse(fs.readFileSync(ORDER_TIMELINES_FILE, 'utf-8') || '[]');
    const payments = JSON.parse(fs.readFileSync(ORDER_PAYMENTS_FILE, 'utf-8') || '[]');
    const invoices = JSON.parse(fs.readFileSync(INVOICES_FILE, 'utf-8') || '[]');

    return orders
      .map((o: any) => ({
        ...o,
        items: items.filter((i: any) => i.orderId === o.id),
        timelines: timelines.filter((t: any) => t.orderId === o.id),
        payments: payments.filter((p: any) => p.orderId === o.id),
        invoices: invoices.filter((inv: any) => inv.orderId === o.id),
      }))
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async updateOrderStatus(id: string, status: string, paymentStatus?: string): Promise<any> {
    try {
      if (!shouldAllowFallback()) {
        const data: any = { status: status as any };
        if (paymentStatus) data.paymentStatus = paymentStatus as any;
        return await prisma.order.update({
          where: { id },
          data,
          include: { items: true, timelines: true, payments: true, invoices: true },
        });
      }
    } catch (err) {}

    const orders = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf-8') || '[]');
    const index = orders.findIndex((o: any) => o.id === id);
    if (index === -1) throw new Error('Order not found');
    orders[index].status = status;
    if (paymentStatus) orders[index].paymentStatus = paymentStatus;
    orders[index].updatedAt = new Date().toISOString();
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
    return this.findOrderById(id);
  }

  async addTimelineEntry(data: { orderId: string; status: string; title: string; description?: string }): Promise<any> {
    try {
      if (!shouldAllowFallback()) {
        return await prisma.orderTimeline.create({ data });
      }
    } catch (err) {}

    const timelines = JSON.parse(fs.readFileSync(ORDER_TIMELINES_FILE, 'utf-8') || '[]');
    const record = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    timelines.push(record);
    fs.writeFileSync(ORDER_TIMELINES_FILE, JSON.stringify(timelines, null, 2));
    return record;
  }
}
