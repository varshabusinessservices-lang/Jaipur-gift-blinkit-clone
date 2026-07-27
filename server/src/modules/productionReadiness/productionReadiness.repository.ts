import fs from 'fs';
import path from 'path';

const AUDIT_FILE = path.join(process.cwd(), 'server', 'src', 'modules', 'productionReadiness', 'audit_logs.json');

function ensureFile(filePath: string) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([], null, 2));
    }
  } catch (e) {}
}

export class ProductionReadinessRepository {
  constructor() {
    ensureFile(AUDIT_FILE);
  }

  async logAudit(data: { action: string; userId?: string; storeId?: string; details: any; ip?: string }): Promise<any> {
    try {
      const logs = JSON.parse(fs.readFileSync(AUDIT_FILE, 'utf-8') || '[]');
      const record = {
        id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        timestamp: new Date().toISOString(),
        ...data,
      };
      logs.unshift(record);
      // Keep last 500 logs
      if (logs.length > 500) logs.length = 500;
      fs.writeFileSync(AUDIT_FILE, JSON.stringify(logs, null, 2));
      return record;
    } catch (e) {
      return null;
    }
  }

  async getAuditLogs(limit = 50): Promise<any[]> {
    try {
      const logs = JSON.parse(fs.readFileSync(AUDIT_FILE, 'utf-8') || '[]');
      return logs.slice(0, limit);
    } catch (e) {
      return [];
    }
  }
}
