import fs from 'fs';
import path from 'path';
import { prisma, shouldAllowFallback } from '../../database/prisma';

const TASKS_FILE = path.join(process.cwd(), 'server', 'src', 'modules', 'delivery', 'delivery_tasks.json');
const RIDERS_FILE = path.join(process.cwd(), 'server', 'src', 'modules', 'delivery', 'riders.json');
const TIMELINES_FILE = path.join(process.cwd(), 'server', 'src', 'modules', 'delivery', 'delivery_timelines.json');

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

export class DeliveryRepository {
  constructor() {
    ensureFile(TASKS_FILE);
    ensureFile(RIDERS_FILE, [
      { id: 'rider-1', name: 'Rajesh Rider', phone: '9829011111', vehicle: 'EV_SCOOTER', storeId: 'store-jaipur-main', availability: true, status: 'AVAILABLE', activeOrdersCount: 0, capacity: 5 },
      { id: 'rider-2', name: 'Manoj Delivery', phone: '9829022222', vehicle: 'MOTORCYCLE', storeId: 'store-jaipur-main', availability: true, status: 'AVAILABLE', activeOrdersCount: 0, capacity: 6 },
    ]);
    ensureFile(TIMELINES_FILE);
  }

  async createTask(taskData: any, timelineData: any): Promise<any> {
    try {
      if (!shouldAllowFallback()) {
        return await prisma.$transaction(async (tx) => {
          const task = await tx.deliveryTask.create({ data: taskData });
          await tx.deliveryTimeline.create({ data: { ...timelineData, taskId: task.id } });
          return await tx.deliveryTask.findUnique({
            where: { id: task.id },
            include: { rider: true, timelines: true },
          });
        });
      }
    } catch (err) {
      console.warn('Prisma delivery task creation fallback:', err);
    }

    const tasks = JSON.parse(fs.readFileSync(TASKS_FILE, 'utf-8') || '[]');
    const timelines = JSON.parse(fs.readFileSync(TIMELINES_FILE, 'utf-8') || '[]');

    const record = {
      ...taskData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    tasks.push(record);

    const timelineRecord = {
      ...timelineData,
      taskId: record.id,
      createdAt: new Date().toISOString(),
    };
    timelines.push(timelineRecord);

    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
    fs.writeFileSync(TIMELINES_FILE, JSON.stringify(timelines, null, 2));

    const riders = JSON.parse(fs.readFileSync(RIDERS_FILE, 'utf-8') || '[]');
    const rider = riders.find((r: any) => r.id === record.riderId) || null;

    return {
      ...record,
      rider,
      timelines: [timelineRecord],
    };
  }

  async findTaskById(id: string): Promise<any> {
    try {
      if (!shouldAllowFallback()) {
        return await prisma.deliveryTask.findUnique({
          where: { id },
          include: { rider: true, timelines: true },
        });
      }
    } catch (err) {}

    const tasks = JSON.parse(fs.readFileSync(TASKS_FILE, 'utf-8') || '[]');
    const riders = JSON.parse(fs.readFileSync(RIDERS_FILE, 'utf-8') || '[]');
    const timelines = JSON.parse(fs.readFileSync(TIMELINES_FILE, 'utf-8') || '[]');

    const task = tasks.find((t: any) => t.id === id);
    if (!task) return null;

    return {
      ...task,
      rider: riders.find((r: any) => r.id === task.riderId) || null,
      timelines: timelines.filter((tl: any) => tl.taskId === id),
    };
  }

  async findTaskByOrderId(orderId: string): Promise<any> {
    try {
      if (!shouldAllowFallback()) {
        return await prisma.deliveryTask.findFirst({
          where: { orderId },
          include: { rider: true, timelines: true },
        });
      }
    } catch (err) {}

    const tasks = JSON.parse(fs.readFileSync(TASKS_FILE, 'utf-8') || '[]');
    const riders = JSON.parse(fs.readFileSync(RIDERS_FILE, 'utf-8') || '[]');
    const timelines = JSON.parse(fs.readFileSync(TIMELINES_FILE, 'utf-8') || '[]');

    const task = tasks.find((t: any) => t.orderId === orderId);
    if (!task) return null;

    return {
      ...task,
      rider: riders.find((r: any) => r.id === task.riderId) || null,
      timelines: timelines.filter((tl: any) => tl.taskId === task.id),
    };
  }

  async findAllTasks(filters?: { status?: string; riderId?: string; storeId?: string }): Promise<any[]> {
    try {
      if (!shouldAllowFallback()) {
        const where: any = {};
        if (filters?.status) where.status = filters.status as any;
        if (filters?.riderId) where.riderId = filters.riderId;
        if (filters?.storeId) where.storeId = filters.storeId;

        return await prisma.deliveryTask.findMany({
          where,
          include: { rider: true, timelines: true },
          orderBy: { createdAt: 'desc' },
        });
      }
    } catch (err) {}

    let tasks = JSON.parse(fs.readFileSync(TASKS_FILE, 'utf-8') || '[]');
    if (filters?.status) tasks = tasks.filter((t: any) => t.status === filters.status);
    if (filters?.riderId) tasks = tasks.filter((t: any) => t.riderId === filters.riderId);
    if (filters?.storeId) tasks = tasks.filter((t: any) => t.storeId === filters.storeId);

    const riders = JSON.parse(fs.readFileSync(RIDERS_FILE, 'utf-8') || '[]');
    const timelines = JSON.parse(fs.readFileSync(TIMELINES_FILE, 'utf-8') || '[]');

    return tasks.map((t: any) => ({
      ...t,
      rider: riders.find((r: any) => r.id === t.riderId) || null,
      timelines: timelines.filter((tl: any) => tl.taskId === t.id),
    })).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async updateTask(id: string, data: any): Promise<any> {
    try {
      if (!shouldAllowFallback()) {
        return await prisma.deliveryTask.update({
          where: { id },
          data,
          include: { rider: true, timelines: true },
        });
      }
    } catch (err) {}

    const tasks = JSON.parse(fs.readFileSync(TASKS_FILE, 'utf-8') || '[]');
    const idx = tasks.findIndex((t: any) => t.id === id);
    if (idx === -1) throw new Error('Delivery task not found');

    tasks[idx] = { ...tasks[idx], ...data, updatedAt: new Date().toISOString() };
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
    return this.findTaskById(id);
  }

  async addTimeline(data: { taskId: string; status: string; title: string; description?: string; metadataJson?: string }): Promise<any> {
    try {
      if (!shouldAllowFallback()) {
        return await prisma.deliveryTimeline.create({ data });
      }
    } catch (err) {}

    const timelines = JSON.parse(fs.readFileSync(TIMELINES_FILE, 'utf-8') || '[]');
    const record = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    timelines.push(record);
    fs.writeFileSync(TIMELINES_FILE, JSON.stringify(timelines, null, 2));
    return record;
  }

  async getRiders(storeId?: string): Promise<any[]> {
    try {
      if (!shouldAllowFallback()) {
        return await prisma.rider.findMany({ where: storeId ? { storeId } : undefined });
      }
    } catch (err) {}
    const riders = JSON.parse(fs.readFileSync(RIDERS_FILE, 'utf-8') || '[]');
    return storeId ? riders.filter((r: any) => r.storeId === storeId) : riders;
  }

  async findRiderById(id: string): Promise<any> {
    try {
      if (!shouldAllowFallback()) {
        return await prisma.rider.findUnique({ where: { id } });
      }
    } catch (err) {}
    const riders = JSON.parse(fs.readFileSync(RIDERS_FILE, 'utf-8') || '[]');
    return riders.find((r: any) => r.id === id) || null;
  }

  async updateRider(id: string, data: any): Promise<any> {
    try {
      if (!shouldAllowFallback()) {
        return await prisma.rider.update({ where: { id }, data });
      }
    } catch (err) {}
    const riders = JSON.parse(fs.readFileSync(RIDERS_FILE, 'utf-8') || '[]');
    const idx = riders.findIndex((r: any) => r.id === id);
    if (idx === -1) throw new Error('Rider not found');
    riders[idx] = { ...riders[idx], ...data, updatedAt: new Date().toISOString() };
    fs.writeFileSync(RIDERS_FILE, JSON.stringify(riders, null, 2));
    return riders[idx];
  }
}
