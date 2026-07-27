import fs from 'fs';
import path from 'path';
import { prisma, shouldAllowFallback } from '../../database/prisma';

const RETURNS_FILE = path.join(process.cwd(), 'server', 'src', 'modules', 'returns', 'returns.json');
const INSPECTIONS_FILE = path.join(process.cwd(), 'server', 'src', 'modules', 'returns', 'return_inspections.json');
const REPLACEMENTS_FILE = path.join(process.cwd(), 'server', 'src', 'modules', 'returns', 'replacements.json');
const REFUNDS_FILE = path.join(process.cwd(), 'server', 'src', 'modules', 'returns', 'refund_ledgers.json');
const REVERSE_PICKUPS_FILE = path.join(process.cwd(), 'server', 'src', 'modules', 'returns', 'reverse_pickups.json');
const TIMELINES_FILE = path.join(process.cwd(), 'server', 'src', 'modules', 'returns', 'return_timelines.json');

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

export class ReturnsRepository {
  constructor() {
    ensureFile(RETURNS_FILE);
    ensureFile(INSPECTIONS_FILE);
    ensureFile(REPLACEMENTS_FILE);
    ensureFile(REFUNDS_FILE);
    ensureFile(REVERSE_PICKUPS_FILE);
    ensureFile(TIMELINES_FILE);
  }

  async createReturnRequest(data: any, timelineData: any): Promise<any> {
    try {
      if (!shouldAllowFallback()) {
        return await prisma.$transaction(async (tx) => {
          const ret = await tx.returnRequest.create({ data });
          await tx.returnTimeline.create({ data: { ...timelineData, returnId: ret.id } });
          return await tx.returnRequest.findUnique({
            where: { id: ret.id },
            include: { inspection: true, replacement: true, reversePickup: true, timelines: true },
          });
        });
      }
    } catch (err) {
      console.warn('Prisma return creation fallback:', err);
    }

    const returns = JSON.parse(fs.readFileSync(RETURNS_FILE, 'utf-8') || '[]');
    const timelines = JSON.parse(fs.readFileSync(TIMELINES_FILE, 'utf-8') || '[]');

    const record = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    returns.push(record);

    const tl = {
      ...timelineData,
      returnId: record.id,
      createdAt: new Date().toISOString(),
    };
    timelines.push(tl);

    fs.writeFileSync(RETURNS_FILE, JSON.stringify(returns, null, 2));
    fs.writeFileSync(TIMELINES_FILE, JSON.stringify(timelines, null, 2));

    return {
      ...record,
      inspection: null,
      replacement: null,
      reversePickup: null,
      timelines: [tl],
    };
  }

  async findReturnById(id: string): Promise<any> {
    try {
      if (!shouldAllowFallback()) {
        return await prisma.returnRequest.findUnique({
          where: { id },
          include: { inspection: true, replacement: true, reversePickup: true, timelines: true },
        });
      }
    } catch (err) {}

    const returns = JSON.parse(fs.readFileSync(RETURNS_FILE, 'utf-8') || '[]');
    const inspections = JSON.parse(fs.readFileSync(INSPECTIONS_FILE, 'utf-8') || '[]');
    const replacements = JSON.parse(fs.readFileSync(REPLACEMENTS_FILE, 'utf-8') || '[]');
    const pickups = JSON.parse(fs.readFileSync(REVERSE_PICKUPS_FILE, 'utf-8') || '[]');
    const timelines = JSON.parse(fs.readFileSync(TIMELINES_FILE, 'utf-8') || '[]');

    const ret = returns.find((r: any) => r.id === id);
    if (!ret) return null;

    return {
      ...ret,
      inspection: inspections.find((i: any) => i.returnId === id) || null,
      replacement: replacements.find((rep: any) => rep.returnId === id) || null,
      reversePickup: pickups.find((p: any) => p.returnId === id) || null,
      timelines: timelines.filter((t: any) => t.returnId === id),
    };
  }

  async listReturns(filter: { customerId?: string; status?: string } = {}): Promise<any[]> {
    try {
      if (!shouldAllowFallback()) {
        const where: any = {};
        if (filter.customerId) where.customerId = filter.customerId;
        if (filter.status) where.status = filter.status;
        return await prisma.returnRequest.findMany({
          where,
          include: { inspection: true, replacement: true, reversePickup: true, timelines: true },
          orderBy: { createdAt: 'desc' },
        });
      }
    } catch (err) {}

    const returns = JSON.parse(fs.readFileSync(RETURNS_FILE, 'utf-8') || '[]');
    const inspections = JSON.parse(fs.readFileSync(INSPECTIONS_FILE, 'utf-8') || '[]');
    const replacements = JSON.parse(fs.readFileSync(REPLACEMENTS_FILE, 'utf-8') || '[]');
    const pickups = JSON.parse(fs.readFileSync(REVERSE_PICKUPS_FILE, 'utf-8') || '[]');
    const timelines = JSON.parse(fs.readFileSync(TIMELINES_FILE, 'utf-8') || '[]');

    let list = returns;
    if (filter.customerId) list = list.filter((r: any) => r.customerId === filter.customerId);
    if (filter.status) list = list.filter((r: any) => r.status === filter.status);

    return list
      .map((ret: any) => ({
        ...ret,
        inspection: inspections.find((i: any) => i.returnId === ret.id) || null,
        replacement: replacements.find((rep: any) => rep.returnId === ret.id) || null,
        reversePickup: pickups.find((p: any) => p.returnId === ret.id) || null,
        timelines: timelines.filter((t: any) => t.returnId === ret.id),
      }))
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async updateReturn(id: string, data: any, timelineData?: any): Promise<any> {
    try {
      if (!shouldAllowFallback()) {
        return await prisma.$transaction(async (tx) => {
          const updated = await tx.returnRequest.update({
            where: { id },
            data,
            include: { inspection: true, replacement: true, reversePickup: true, timelines: true },
          });
          if (timelineData) {
            await tx.returnTimeline.create({ data: { ...timelineData, returnId: id } });
          }
          return await tx.returnRequest.findUnique({
            where: { id },
            include: { inspection: true, replacement: true, reversePickup: true, timelines: true },
          });
        });
      }
    } catch (err) {
      console.warn('Prisma return update fallback:', err);
    }

    const returns = JSON.parse(fs.readFileSync(RETURNS_FILE, 'utf-8') || '[]');
    const idx = returns.findIndex((r: any) => r.id === id);
    if (idx === -1) throw new Error('Return request not found');

    returns[idx] = {
      ...returns[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    fs.writeFileSync(RETURNS_FILE, JSON.stringify(returns, null, 2));

    if (timelineData) {
      const timelines = JSON.parse(fs.readFileSync(TIMELINES_FILE, 'utf-8') || '[]');
      timelines.push({
        ...timelineData,
        returnId: id,
        createdAt: new Date().toISOString(),
      });
      fs.writeFileSync(TIMELINES_FILE, JSON.stringify(timelines, null, 2));
    }

    return await this.findReturnById(id);
  }

  async createInspection(data: any): Promise<any> {
    try {
      if (!shouldAllowFallback()) {
        return await prisma.returnInspection.create({ data });
      }
    } catch (err) {}

    const inspections = JSON.parse(fs.readFileSync(INSPECTIONS_FILE, 'utf-8') || '[]');
    // upsert by returnId
    const existingIdx = inspections.findIndex((i: any) => i.returnId === data.returnId);
    const record = {
      ...data,
      id: data.id || `insp-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (existingIdx >= 0) {
      inspections[existingIdx] = { ...inspections[existingIdx], ...record };
    } else {
      inspections.push(record);
    }
    fs.writeFileSync(INSPECTIONS_FILE, JSON.stringify(inspections, null, 2));
    return record;
  }

  async createReplacement(data: any): Promise<any> {
    try {
      if (!shouldAllowFallback()) {
        return await prisma.replacementOrder.create({ data });
      }
    } catch (err) {}

    const reps = JSON.parse(fs.readFileSync(REPLACEMENTS_FILE, 'utf-8') || '[]');
    const record = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    reps.push(record);
    fs.writeFileSync(REPLACEMENTS_FILE, JSON.stringify(reps, null, 2));
    return record;
  }

  async createRefundLedger(data: any): Promise<any> {
    try {
      if (!shouldAllowFallback()) {
        return await prisma.refundLedger.create({ data });
      }
    } catch (err) {}

    const refunds = JSON.parse(fs.readFileSync(REFUNDS_FILE, 'utf-8') || '[]');
    const record = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    refunds.push(record);
    fs.writeFileSync(REFUNDS_FILE, JSON.stringify(refunds, null, 2));
    return record;
  }

  async listRefunds(filter: { orderId?: string } = {}): Promise<any[]> {
    try {
      if (!shouldAllowFallback()) {
        const where: any = {};
        if (filter.orderId) where.orderId = filter.orderId;
        return await prisma.refundLedger.findMany({ where, orderBy: { createdAt: 'desc' } });
      }
    } catch (err) {}

    const refunds = JSON.parse(fs.readFileSync(REFUNDS_FILE, 'utf-8') || '[]');
    let list = refunds;
    if (filter.orderId) list = list.filter((r: any) => r.orderId === filter.orderId);
    return list.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createReversePickup(data: any): Promise<any> {
    try {
      if (!shouldAllowFallback()) {
        return await prisma.reversePickupTask.create({ data });
      }
    } catch (err) {}

    const pickups = JSON.parse(fs.readFileSync(REVERSE_PICKUPS_FILE, 'utf-8') || '[]');
    const record = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    pickups.push(record);
    fs.writeFileSync(REVERSE_PICKUPS_FILE, JSON.stringify(pickups, null, 2));
    return record;
  }
}
