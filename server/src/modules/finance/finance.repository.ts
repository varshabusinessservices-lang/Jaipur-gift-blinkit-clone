import fs from 'fs';
import path from 'path';
import { prisma, shouldAllowFallback } from '../../database/prisma';

const LEDGER_FILE = path.join(process.cwd(), 'server', 'src', 'modules', 'finance', 'finance_ledgers.json');
const WALLET_FILE = path.join(process.cwd(), 'server', 'src', 'modules', 'finance', 'wallet_ledgers.json');
const SETTLEMENT_FILE = path.join(process.cwd(), 'server', 'src', 'modules', 'finance', 'settlements.json');
const SCHEDULED_FILE = path.join(process.cwd(), 'server', 'src', 'modules', 'finance', 'scheduled_reports.json');
const EXPORT_FILE = path.join(process.cwd(), 'server', 'src', 'modules', 'finance', 'export_jobs.json');

function ensureFile(filePath: string, defaultData: any = []) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
    }
  } catch (e) {}
}

export class FinanceRepository {
  constructor() {
    ensureFile(LEDGER_FILE);
    ensureFile(WALLET_FILE);
    ensureFile(SETTLEMENT_FILE);
    ensureFile(SCHEDULED_FILE);
    ensureFile(EXPORT_FILE);
  }

  async createLedgerEntry(data: {
    transactionType: string;
    referenceType?: string;
    referenceId?: string;
    customerId?: string;
    orderId?: string;
    storeId?: string;
    debit?: number;
    credit?: number;
    narration?: string;
    createdBy?: string;
  }): Promise<any> {
    const items = JSON.parse(fs.readFileSync(LEDGER_FILE, 'utf-8') || '[]');
    const count = items.length;
    const ledgerNumber = `LED-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;
    
    // calculate running balance
    const lastBalance = items.length > 0 ? items[items.length - 1].runningBalance : 0;
    const debit = data.debit || 0;
    const credit = data.credit || 0;
    const runningBalance = lastBalance + credit - debit;

    const record = {
      id: `led-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      ledgerNumber,
      ...data,
      debit,
      credit,
      runningBalance,
      currency: 'INR',
      createdAt: new Date().toISOString(),
    };

    try {
      if (!shouldAllowFallback()) {
        return await prisma.financeLedger.create({
          data: {
            ledgerNumber,
            transactionType: data.transactionType,
            referenceType: data.referenceType,
            referenceId: data.referenceId,
            customerId: data.customerId,
            orderId: data.orderId,
            storeId: data.storeId,
            debit,
            credit,
            runningBalance,
            narration: data.narration,
            createdBy: data.createdBy,
          },
        });
      }
    } catch (err) {}

    items.push(record);
    fs.writeFileSync(LEDGER_FILE, JSON.stringify(items, null, 2));
    return record;
  }

  async listLedgerEntries(query: { storeId?: string; customerId?: string; transactionType?: string; limit?: number }): Promise<any[]> {
    try {
      if (!shouldAllowFallback()) {
        const where: any = {};
        if (query.storeId) where.storeId = query.storeId;
        if (query.customerId) where.customerId = query.customerId;
        if (query.transactionType) where.transactionType = query.transactionType;
        return await prisma.financeLedger.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: query.limit || 50,
        });
      }
    } catch (err) {}

    let items = JSON.parse(fs.readFileSync(LEDGER_FILE, 'utf-8') || '[]');
    if (query.storeId) items = items.filter((i: any) => i.storeId === query.storeId);
    if (query.customerId) items = items.filter((i: any) => i.customerId === query.customerId);
    if (query.transactionType) items = items.filter((i: any) => i.transactionType === query.transactionType);
    return items.reverse().slice(0, query.limit || 50);
  }

  async createWalletEntry(data: {
    customerId: string;
    transactionType: string;
    amount: number;
    referenceType?: string;
    referenceId?: string;
    narration?: string;
  }): Promise<any> {
    const items = JSON.parse(fs.readFileSync(WALLET_FILE, 'utf-8') || '[]');
    const count = items.length;
    const ledgerNumber = `WAL-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;

    // get last balance for customer
    const customerItems = items.filter((i: any) => i.customerId === data.customerId);
    const lastBalance = customerItems.length > 0 ? customerItems[customerItems.length - 1].balanceAfter : 0;
    
    let delta = data.amount;
    if (data.transactionType === 'WALLET_USAGE' || data.transactionType === 'WALLET_EXPIRY' || data.transactionType === 'WALLET_REVERSAL') {
      delta = -Math.abs(data.amount);
    } else {
      delta = Math.abs(data.amount);
    }
    const balanceAfter = lastBalance + delta;

    const record = {
      id: `wal-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      ledgerNumber,
      customerId: data.customerId,
      transactionType: data.transactionType,
      amount: Math.abs(data.amount),
      balanceAfter,
      referenceType: data.referenceType,
      referenceId: data.referenceId,
      narration: data.narration,
      createdAt: new Date().toISOString(),
    };

    try {
      if (!shouldAllowFallback()) {
        const account = await prisma.walletAccount.findUnique({ where: { customerId: data.customerId } });
        return await prisma.walletLedgerEntry.create({
          data: {
            walletAccountId: account?.id || 'acc_default',
            customerId: data.customerId,
            transactionType: data.transactionType,
            direction: data.transactionType === 'DEBIT' ? 'DEBIT' : 'CREDIT',
            amount: Math.abs(data.amount),
            bucketType: 'SELF_LOADED',
            referenceType: data.referenceType,
            referenceId: data.referenceId,
            narration: data.narration,
          },
        });
      }
    } catch (err) {}

    items.push(record);
    fs.writeFileSync(WALLET_FILE, JSON.stringify(items, null, 2));
    return record;
  }

  async getWalletHistory(customerId: string): Promise<any[]> {
    try {
      if (!shouldAllowFallback()) {
        return await prisma.walletLedgerEntry.findMany({
          where: { customerId },
          orderBy: { createdAt: 'desc' },
        });
      }
    } catch (err) {}

    const items = JSON.parse(fs.readFileSync(WALLET_FILE, 'utf-8') || '[]');
    return items.filter((i: any) => i.customerId === customerId).reverse();
  }

  async getWalletBalance(customerId: string): Promise<number> {
    const history = await this.getWalletHistory(customerId);
    if (history.length === 0) return 0;
    return history[0].balanceAfter;
  }

  async listSettlements(query: any): Promise<any[]> {
    try {
      if (!shouldAllowFallback()) {
        return await prisma.settlement.findMany({
          orderBy: { createdAt: 'desc' },
        });
      }
    } catch (err) {}

    return JSON.parse(fs.readFileSync(SETTLEMENT_FILE, 'utf-8') || '[]');
  }

  async createSettlement(data: any): Promise<any> {
    const count = JSON.parse(fs.readFileSync(SETTLEMENT_FILE, 'utf-8') || '[]').length;
    const settlementNumber = `SET-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;
    const record = {
      id: `set-${Date.now()}`,
      settlementNumber,
      ...data,
      netAmount: data.amount - (data.commission || 0),
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      if (!shouldAllowFallback()) {
        return await prisma.settlement.create({
          data: {
            settlementNumber,
            entityType: data.entityType,
            entityId: data.entityId,
            amount: data.amount,
            commission: data.commission || 0,
            netAmount: data.amount - (data.commission || 0),
            status: 'PENDING',
          },
        });
      }
    } catch (err) {}

    const items = JSON.parse(fs.readFileSync(SETTLEMENT_FILE, 'utf-8') || '[]');
    items.push(record);
    fs.writeFileSync(SETTLEMENT_FILE, JSON.stringify(items, null, 2));
    return record;
  }

  async listScheduledReports(): Promise<any[]> {
    try {
      if (!shouldAllowFallback()) {
        return await prisma.scheduledReport.findMany();
      }
    } catch (err) {}
    return JSON.parse(fs.readFileSync(SCHEDULED_FILE, 'utf-8') || '[]');
  }

  async createScheduledReport(data: any): Promise<any> {
    const record = { id: `sch-${Date.now()}`, ...data, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    try {
      if (!shouldAllowFallback()) {
        return await prisma.scheduledReport.create({ data });
      }
    } catch (err) {}
    const items = JSON.parse(fs.readFileSync(SCHEDULED_FILE, 'utf-8') || '[]');
    items.push(record);
    fs.writeFileSync(SCHEDULED_FILE, JSON.stringify(items, null, 2));
    return record;
  }

  async createExportJob(data: any): Promise<any> {
    const record = { id: `exp-${Date.now()}`, ...data, status: 'COMPLETED', fileUrl: `/api/v1/admin/reports/download/${Date.now()}.${data.exportType === 'EXCEL' ? 'xlsx' : data.exportType.toLowerCase()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    try {
      if (!shouldAllowFallback()) {
        return await prisma.exportJob.create({
          data: {
            exportType: data.exportType,
            module: data.module,
            status: 'COMPLETED',
            fileUrl: record.fileUrl,
            filterParams: JSON.stringify(data.filterParams || {}),
          },
        });
      }
    } catch (err) {}
    const items = JSON.parse(fs.readFileSync(EXPORT_FILE, 'utf-8') || '[]');
    items.push(record);
    fs.writeFileSync(EXPORT_FILE, JSON.stringify(items, null, 2));
    return record;
  }
}
