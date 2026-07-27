import fs from 'fs';
import path from 'path';
import { prisma, shouldAllowFallback } from '../../database/prisma';

const JOBS_FILE = path.join(process.cwd(), 'server', 'src', 'modules', 'production', 'production_jobs.json');
const ITEMS_FILE = path.join(process.cwd(), 'server', 'src', 'modules', 'production', 'production_items.json');
const MACHINES_FILE = path.join(process.cwd(), 'server', 'src', 'modules', 'production', 'machines.json');
const STAFF_FILE = path.join(process.cwd(), 'server', 'src', 'modules', 'production', 'staff.json');
const TIMELINES_FILE = path.join(process.cwd(), 'server', 'src', 'modules', 'production', 'production_timelines.json');

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

export class ProductionRepository {
  constructor() {
    ensureFile(JOBS_FILE);
    ensureFile(ITEMS_FILE);
    ensureFile(MACHINES_FILE, [
      { id: 'mach-1', name: 'Canon Pro 1000', type: 'CANON_PRINTER', status: 'AVAILABLE', storeId: 'store-jaipur-main' },
      { id: 'mach-2', name: 'Mug Heat Press Pro', type: 'MUG_PRESS', status: 'AVAILABLE', storeId: 'store-jaipur-main' },
      { id: 'mach-3', name: 'T-Shirt Sublimation Press', type: 'TSHIRT_PRESS', status: 'AVAILABLE', storeId: 'store-jaipur-main' },
      { id: 'mach-4', name: 'Keychain Laser Cutter', type: 'KEYCHAIN_MACHINE', status: 'AVAILABLE', storeId: 'store-jaipur-main' },
    ]);
    ensureFile(STAFF_FILE, [
      { id: 'staff-1', name: 'Ramesh Designer', role: 'DESIGNER', storeId: 'store-jaipur-main', isActive: true },
      { id: 'staff-2', name: 'Sunil Operator', role: 'PRINTING_OPERATOR', storeId: 'store-jaipur-main', isActive: true },
      { id: 'staff-3', name: 'Anita Packer', role: 'PACKING_STAFF', storeId: 'store-jaipur-main', isActive: true },
      { id: 'staff-4', name: 'Vikram Supervisor', role: 'SUPERVISOR', storeId: 'store-jaipur-main', isActive: true },
    ]);
    ensureFile(TIMELINES_FILE);
  }

  async createJobWithItems(jobData: any, itemsData: any[], timelineData: any): Promise<any> {
    try {
      if (!shouldAllowFallback()) {
        return await prisma.$transaction(async (tx) => {
          const createdJob = await tx.productionJob.create({ data: jobData });
          for (const item of itemsData) {
            await tx.productionItem.create({ data: { ...item, jobId: createdJob.id } });
          }
          await tx.productionTimeline.create({ data: { ...timelineData, jobId: createdJob.id } });

          return await tx.productionJob.findUnique({
            where: { id: createdJob.id },
            include: { items: true, timelines: true },
          });
        });
      }
    } catch (err) {
      console.warn('Prisma transaction production job creation failed, falling back to JSON:', err);
    }

    const jobs = JSON.parse(fs.readFileSync(JOBS_FILE, 'utf-8') || '[]');
    const itemsList = JSON.parse(fs.readFileSync(ITEMS_FILE, 'utf-8') || '[]');
    const timelines = JSON.parse(fs.readFileSync(TIMELINES_FILE, 'utf-8') || '[]');

    const jobRecord = {
      ...jobData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    jobs.push(jobRecord);

    const createdItems = itemsData.map(item => ({
      ...item,
      jobId: jobRecord.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    itemsList.push(...createdItems);

    const timelineRecord = {
      ...timelineData,
      jobId: jobRecord.id,
      createdAt: new Date().toISOString(),
    };
    timelines.push(timelineRecord);

    fs.writeFileSync(JOBS_FILE, JSON.stringify(jobs, null, 2));
    fs.writeFileSync(ITEMS_FILE, JSON.stringify(itemsList, null, 2));
    fs.writeFileSync(TIMELINES_FILE, JSON.stringify(timelines, null, 2));

    return {
      ...jobRecord,
      items: createdItems,
      timelines: [timelineRecord],
    };
  }

  async findJobById(id: string): Promise<any> {
    try {
      if (!shouldAllowFallback()) {
        return await prisma.productionJob.findUnique({
          where: { id },
          include: { items: true, timelines: true },
        });
      }
    } catch (err) {}

    const jobs = JSON.parse(fs.readFileSync(JOBS_FILE, 'utf-8') || '[]');
    const items = JSON.parse(fs.readFileSync(ITEMS_FILE, 'utf-8') || '[]');
    const timelines = JSON.parse(fs.readFileSync(TIMELINES_FILE, 'utf-8') || '[]');

    const job = jobs.find((j: any) => j.id === id);
    if (!job) return null;

    return {
      ...job,
      items: items.filter((i: any) => i.jobId === id),
      timelines: timelines.filter((t: any) => t.jobId === id),
    };
  }

  async findJobByOrderId(orderId: string): Promise<any> {
    try {
      if (!shouldAllowFallback()) {
        return await prisma.productionJob.findFirst({
          where: { orderId },
          include: { items: true, timelines: true },
        });
      }
    } catch (err) {}

    const jobs = JSON.parse(fs.readFileSync(JOBS_FILE, 'utf-8') || '[]');
    const items = JSON.parse(fs.readFileSync(ITEMS_FILE, 'utf-8') || '[]');
    const timelines = JSON.parse(fs.readFileSync(TIMELINES_FILE, 'utf-8') || '[]');

    const job = jobs.find((j: any) => j.orderId === orderId);
    if (!job) return null;

    return {
      ...job,
      items: items.filter((i: any) => i.jobId === job.id),
      timelines: timelines.filter((t: any) => t.jobId === job.id),
    };
  }

  async findAllJobs(filters?: { status?: string; storeId?: string; priority?: string }): Promise<any[]> {
    try {
      if (!shouldAllowFallback()) {
        const where: any = {};
        if (filters?.status) where.status = filters.status as any;
        if (filters?.storeId) where.assignedStore = filters.storeId;
        if (filters?.priority) where.priority = filters.priority;

        return await prisma.productionJob.findMany({
          where,
          include: { items: true, timelines: true },
          orderBy: { createdAt: 'desc' },
        });
      }
    } catch (err) {}

    let jobs = JSON.parse(fs.readFileSync(JOBS_FILE, 'utf-8') || '[]');
    if (filters?.status) jobs = jobs.filter((j: any) => j.status === filters.status);
    if (filters?.storeId) jobs = jobs.filter((j: any) => j.assignedStore === filters.storeId);
    if (filters?.priority) jobs = jobs.filter((j: any) => j.priority === filters.priority);

    const items = JSON.parse(fs.readFileSync(ITEMS_FILE, 'utf-8') || '[]');
    const timelines = JSON.parse(fs.readFileSync(TIMELINES_FILE, 'utf-8') || '[]');

    return jobs
      .map((j: any) => ({
        ...j,
        items: items.filter((i: any) => i.jobId === j.id),
        timelines: timelines.filter((t: any) => t.jobId === j.id),
      }))
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async findItemById(itemId: string): Promise<any> {
    try {
      if (!shouldAllowFallback()) {
        return await prisma.productionItem.findUnique({
          where: { id: itemId },
        });
      }
    } catch (err) {}

    const items = JSON.parse(fs.readFileSync(ITEMS_FILE, 'utf-8') || '[]');
    return items.find((i: any) => i.id === itemId) || null;
  }

  async updateItem(itemId: string, data: any): Promise<any> {
    try {
      if (!shouldAllowFallback()) {
        return await prisma.productionItem.update({
          where: { id: itemId },
          data,
        });
      }
    } catch (err) {}

    const items = JSON.parse(fs.readFileSync(ITEMS_FILE, 'utf-8') || '[]');
    const idx = items.findIndex((i: any) => i.id === itemId);
    if (idx === -1) throw new Error('Production item not found');
    items[idx] = { ...items[idx], ...data, updatedAt: new Date().toISOString() };
    fs.writeFileSync(ITEMS_FILE, JSON.stringify(items, null, 2));
    return items[idx];
  }

  async updateJob(jobId: string, data: any): Promise<any> {
    try {
      if (!shouldAllowFallback()) {
        return await prisma.productionJob.update({
          where: { id: jobId },
          data,
          include: { items: true, timelines: true },
        });
      }
    } catch (err) {}

    const jobs = JSON.parse(fs.readFileSync(JOBS_FILE, 'utf-8') || '[]');
    const idx = jobs.findIndex((j: any) => j.id === jobId);
    if (idx === -1) throw new Error('Production job not found');
    jobs[idx] = { ...jobs[idx], ...data, updatedAt: new Date().toISOString() };
    fs.writeFileSync(JOBS_FILE, JSON.stringify(jobs, null, 2));
    return this.findJobById(jobId);
  }

  async addTimeline(data: { jobId: string; itemId?: string; status: string; title: string; description?: string; metadataJson?: string }): Promise<any> {
    try {
      if (!shouldAllowFallback()) {
        return await prisma.productionTimeline.create({ data });
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

  async getMachines(): Promise<any[]> {
    try {
      if (!shouldAllowFallback()) {
        return await prisma.machine.findMany();
      }
    } catch (err) {}
    return JSON.parse(fs.readFileSync(MACHINES_FILE, 'utf-8') || '[]');
  }

  async getStaff(): Promise<any[]> {
    try {
      if (!shouldAllowFallback()) {
        return await prisma.staff.findMany();
      }
    } catch (err) {}
    return JSON.parse(fs.readFileSync(STAFF_FILE, 'utf-8') || '[]');
  }
}
