import fs from 'fs';
import path from 'path';
import { prisma, shouldAllowFallback } from '../../database/prisma';
import {
  UploadSession,
  CustomerUpload,
  CustomerUploadCleanupRun,
  UploadSessionStatus,
  UploadSessionSource,
  CustomerUploadRole,
  CustomerUploadLifecycleStatus,
  CleanupRunStatus,
} from './customerUploads.types';

const SESSIONS_FILE = path.join(process.cwd(), 'server', 'src', 'modules', 'customerUploads', 'uploadSessions.json');
const UPLOADS_FILE = path.join(process.cwd(), 'server', 'src', 'modules', 'customerUploads', 'customerUploads.json');
const FILE_ASSETS_FILE = path.join(process.cwd(), 'server', 'src', 'modules', 'customerUploads', 'fileAssets.json');
const CLEANUP_RUNS_FILE = path.join(process.cwd(), 'server', 'src', 'modules', 'customerUploads', 'cleanupRuns.json');

// Helper to ensure files exist
function ensureJsonFile(filePath: string, defaultData: any = []) {
  if (!fs.existsSync(filePath)) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), 'utf-8');
  }
}

// Helpers to read/write JSON data
function readJsonFile<T>(filePath: string): T[] {
  ensureJsonFile(filePath);
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(raw);
    
    // Parse Dates
    return parsed.map((item: any) => {
      const cloned = { ...item };
      for (const key of Object.keys(cloned)) {
        if (typeof cloned[key] === 'string' && (
          key.endsWith('At') || 
          key.endsWith('ExpiresAt') || 
          key.endsWith('Expires') || 
          key.endsWith('Until') ||
          key === 'expiresAt' ||
          key === 'lastActivityAt' ||
          key === 'startedAt' ||
          key === 'completedAt' ||
          key === 'retentionStartsAt' ||
          key === 'retentionExpiresAt' ||
          key === 'purgedAt'
        )) {
          cloned[key] = new Date(cloned[key]);
        }
      }
      return cloned;
    });
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return [];
  }
}

function writeJsonFile<T>(filePath: string, data: T[]) {
  ensureJsonFile(filePath);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing to ${filePath}:`, err);
  }
}

export class CustomerUploadsRepository {
  // ==========================================
  // 1. UPLOAD SESSION ACTIONS
  // ==========================================
  async createSession(data: Partial<UploadSession>): Promise<UploadSession> {
    try {
      const created = await prisma.uploadSession.create({
        data: {
          id: data.id || crypto.randomUUID(),
          publicToken: data.publicToken!,
          customerId: data.customerId || null,
          anonymousSessionId: data.anonymousSessionId || null,
          storeId: data.storeId || null,
          productId: data.productId || null,
          variationId: data.variationId || null,
          personalisationFormId: data.personalisationFormId || null,
          formVersion: data.formVersion || null,
          status: (data.status as any) || 'ACTIVE',
          source: (data.source as any) || 'WEBSITE',
          deviceFingerprintHash: data.deviceFingerprintHash || null,
          ipHash: data.ipHash || null,
          userAgentSummary: data.userAgentSummary || null,
          expiresAt: data.expiresAt!,
          lastActivityAt: data.lastActivityAt || new Date(),
        },
      });
      return created as unknown as UploadSession;
    } catch (err) {
      if (!shouldAllowFallback()) throw err;
      // JSON Fallback
      const sessions = readJsonFile<UploadSession>(SESSIONS_FILE);
      const newSession: UploadSession = {
        id: data.id || crypto.randomUUID(),
        publicToken: data.publicToken!,
        customerId: data.customerId || null,
        anonymousSessionId: data.anonymousSessionId || null,
        storeId: data.storeId || null,
        productId: data.productId || null,
        variationId: data.variationId || null,
        personalisationFormId: data.personalisationFormId || null,
        formVersion: data.formVersion || null,
        status: data.status || 'ACTIVE',
        source: data.source || 'WEBSITE',
        deviceFingerprintHash: data.deviceFingerprintHash || null,
        ipHash: data.ipHash || null,
        userAgentSummary: data.userAgentSummary || null,
        expiresAt: data.expiresAt!,
        lastActivityAt: data.lastActivityAt || new Date(),
        convertedAt: null,
        abandonedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      sessions.push(newSession);
      writeJsonFile(SESSIONS_FILE, sessions);
      return newSession;
    }
  }

  async findSessionById(id: string): Promise<UploadSession | null> {
    try {
      const found = await prisma.uploadSession.findUnique({ where: { id } });
      return found as unknown as UploadSession | null;
    } catch (err) {
      if (!shouldAllowFallback()) throw err;
      const sessions = readJsonFile<UploadSession>(SESSIONS_FILE);
      return sessions.find((s) => s.id === id && !s.deletedAt) || null;
    }
  }

  async findSessionByToken(token: string): Promise<UploadSession | null> {
    try {
      const found = await prisma.uploadSession.findUnique({ where: { publicToken: token } });
      return found as unknown as UploadSession | null;
    } catch (err) {
      if (!shouldAllowFallback()) throw err;
      const sessions = readJsonFile<UploadSession>(SESSIONS_FILE);
      return sessions.find((s) => s.publicToken === token && !s.deletedAt) || null;
    }
  }

  async updateSession(id: string, data: Partial<UploadSession>): Promise<UploadSession> {
    try {
      const updated = await prisma.uploadSession.update({
        where: { id },
        data: {
          ...data,
          status: data.status as any,
          source: data.source as any,
        } as any,
      });
      return updated as unknown as UploadSession;
    } catch (err) {
      if (!shouldAllowFallback()) throw err;
      const sessions = readJsonFile<UploadSession>(SESSIONS_FILE);
      const idx = sessions.findIndex((s) => s.id === id);
      if (idx === -1) throw new Error('Upload session not found');
      const updatedSession = {
        ...sessions[idx],
        ...data,
        updatedAt: new Date(),
      };
      sessions[idx] = updatedSession as UploadSession;
      writeJsonFile(SESSIONS_FILE, sessions);
      return updatedSession;
    }
  }

  async listSessions(filters: any = {}): Promise<UploadSession[]> {
    try {
      const where: any = { deletedAt: null };
      if (filters.status) where.status = filters.status;
      if (filters.source) where.source = filters.source;
      if (filters.productId) where.productId = filters.productId;
      if (filters.customerId) where.customerId = filters.customerId;

      const items = await prisma.uploadSession.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });
      return items as unknown as UploadSession[];
    } catch (err) {
      if (!shouldAllowFallback()) throw err;
      let sessions = readJsonFile<UploadSession>(SESSIONS_FILE).filter((s) => !s.deletedAt);
      if (filters.status) sessions = sessions.filter((s) => s.status === filters.status);
      if (filters.source) sessions = sessions.filter((s) => s.source === filters.source);
      if (filters.productId) sessions = sessions.filter((s) => s.productId === filters.productId);
      if (filters.customerId) sessions = sessions.filter((s) => s.customerId === filters.customerId);
      return sessions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
  }

  // ==========================================
  // 2. CUSTOMER UPLOAD ACTIONS
  // ==========================================
  async createUpload(data: Partial<CustomerUpload>): Promise<CustomerUpload> {
    try {
      const created = await prisma.customerUpload.create({
        data: {
          id: data.id || crypto.randomUUID(),
          uploadSessionId: data.uploadSessionId!,
          fileAssetId: data.fileAssetId!,
          productId: data.productId || null,
          variationId: data.variationId || null,
          personalisationFormId: data.personalisationFormId || null,
          personalisationFieldId: data.personalisationFieldId || null,
          fieldKey: data.fieldKey || null,
          uploadRole: data.uploadRole as any,
          lifecycleStatus: data.lifecycleStatus as any,
          originalFileName: data.originalFileName!,
          safeFileName: data.safeFileName!,
          mimeType: data.mimeType!,
          extension: data.extension!,
          sizeBytes: data.sizeBytes!,
          width: data.width || null,
          height: data.height || null,
          orientation: data.orientation || null,
          checksum: data.checksum || null,
          sortOrder: data.sortOrder !== undefined ? data.sortOrder : 0,
          isPrimary: data.isPrimary || false,
          isCustomerDeleted: data.isCustomerDeleted || false,
          isAdminProtected: data.isAdminProtected || false,
          protectionReason: data.protectionReason || null,
          retentionStartsAt: data.retentionStartsAt || null,
          retentionExpiresAt: data.retentionExpiresAt || null,
          purgedAt: data.purgedAt || null,
          metadataJson: data.metadataJson || null,
          validationResultJson: data.validationResultJson || null,
        },
      });
      return created as unknown as CustomerUpload;
    } catch (err) {
      if (!shouldAllowFallback()) throw err;
      const uploads = readJsonFile<CustomerUpload>(UPLOADS_FILE);
      const newUpload: CustomerUpload = {
        id: data.id || crypto.randomUUID(),
        uploadSessionId: data.uploadSessionId!,
        fileAssetId: data.fileAssetId!,
        productId: data.productId || null,
        variationId: data.variationId || null,
        personalisationFormId: data.personalisationFormId || null,
        personalisationFieldId: data.personalisationFieldId || null,
        fieldKey: data.fieldKey || null,
        uploadRole: data.uploadRole || 'OTHER',
        lifecycleStatus: data.lifecycleStatus || 'TEMPORARY',
        originalFileName: data.originalFileName!,
        safeFileName: data.safeFileName!,
        mimeType: data.mimeType!,
        extension: data.extension!,
        sizeBytes: data.sizeBytes!,
        width: data.width || null,
        height: data.height || null,
        orientation: data.orientation || null,
        checksum: data.checksum || null,
        sortOrder: data.sortOrder !== undefined ? data.sortOrder : 0,
        isPrimary: data.isPrimary || false,
        isCustomerDeleted: data.isCustomerDeleted || false,
        isAdminProtected: data.isAdminProtected || false,
        protectionReason: data.protectionReason || null,
        retentionStartsAt: data.retentionStartsAt || null,
        retentionExpiresAt: data.retentionExpiresAt || null,
        purgedAt: data.purgedAt || null,
        metadataJson: data.metadataJson || null,
        validationResultJson: data.validationResultJson || null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      uploads.push(newUpload);
      writeJsonFile(UPLOADS_FILE, uploads);
      return newUpload;
    }
  }

  async findUploadById(id: string): Promise<CustomerUpload | null> {
    try {
      const found = await prisma.customerUpload.findUnique({
        where: { id },
      });
      return found as unknown as CustomerUpload | null;
    } catch (err) {
      if (!shouldAllowFallback()) throw err;
      const uploads = readJsonFile<CustomerUpload>(UPLOADS_FILE);
      return uploads.find((u) => u.id === id && !u.deletedAt) || null;
    }
  }

  async findUploadBySessionId(sessionId: string): Promise<CustomerUpload[]> {
    try {
      const found = await prisma.customerUpload.findMany({
        where: { uploadSessionId: sessionId, deletedAt: null },
        orderBy: { sortOrder: 'asc' },
      });
      return found as unknown as CustomerUpload[];
    } catch (err) {
      if (!shouldAllowFallback()) throw err;
      const uploads = readJsonFile<CustomerUpload>(UPLOADS_FILE);
      return uploads
        .filter((u) => u.uploadSessionId === sessionId && !u.deletedAt)
        .sort((a, b) => a.sortOrder - b.sortOrder);
    }
  }

  async updateUpload(id: string, data: Partial<CustomerUpload>): Promise<CustomerUpload> {
    try {
      const updated = await prisma.customerUpload.update({
        where: { id },
        data: {
          ...data,
          uploadRole: data.uploadRole as any,
          lifecycleStatus: data.lifecycleStatus as any,
        } as any,
      });
      return updated as unknown as CustomerUpload;
    } catch (err) {
      if (!shouldAllowFallback()) throw err;
      const uploads = readJsonFile<CustomerUpload>(UPLOADS_FILE);
      const idx = uploads.findIndex((u) => u.id === id);
      if (idx === -1) throw new Error('Customer upload not found');
      const updatedUpload = {
        ...uploads[idx],
        ...data,
        updatedAt: new Date(),
      };
      uploads[idx] = updatedUpload as CustomerUpload;
      writeJsonFile(UPLOADS_FILE, uploads);
      return updatedUpload;
    }
  }

  async listUploads(filters: any = {}): Promise<{ items: CustomerUpload[]; total: number }> {
    try {
      const where: any = { deletedAt: null };
      if (filters.uploadSessionId) where.uploadSessionId = filters.uploadSessionId;
      if (filters.lifecycleStatus) where.lifecycleStatus = filters.lifecycleStatus;
      if (filters.uploadRole) where.uploadRole = filters.uploadRole;
      if (filters.productId) where.productId = filters.productId;
      if (filters.personalisationFieldId) where.personalisationFieldId = filters.personalisationFieldId;
      if (filters.search) {
        where.originalFileName = { contains: filters.search };
      }

      const total = await prisma.customerUpload.count({ where });
      const items = await prisma.customerUpload.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });
      return { items: items as unknown as CustomerUpload[], total };
    } catch (err) {
      if (!shouldAllowFallback()) throw err;
      let uploads = readJsonFile<CustomerUpload>(UPLOADS_FILE).filter((u) => !u.deletedAt);
      if (filters.uploadSessionId) uploads = uploads.filter((u) => u.uploadSessionId === filters.uploadSessionId);
      if (filters.lifecycleStatus) uploads = uploads.filter((u) => u.lifecycleStatus === filters.lifecycleStatus);
      if (filters.uploadRole) uploads = uploads.filter((u) => u.uploadRole === filters.uploadRole);
      if (filters.productId) uploads = uploads.filter((u) => u.productId === filters.productId);
      if (filters.personalisationFieldId) uploads = uploads.filter((u) => u.personalisationFieldId === filters.personalisationFieldId);
      if (filters.search) {
        uploads = uploads.filter((u) => u.originalFileName.toLowerCase().includes(filters.search.toLowerCase()));
      }

      return {
        items: uploads.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
        total: uploads.length,
      };
    }
  }

  async deleteUpload(id: string, soft = true): Promise<boolean> {
    try {
      if (soft) {
        await prisma.customerUpload.update({
          where: { id },
          data: { deletedAt: new Date() },
        });
      } else {
        await prisma.customerUpload.delete({
          where: { id },
        });
      }
      return true;
    } catch (err) {
      if (!shouldAllowFallback()) throw err;
      const uploads = readJsonFile<CustomerUpload>(UPLOADS_FILE);
      const idx = uploads.findIndex((u) => u.id === id);
      if (idx === -1) return false;
      if (soft) {
        uploads[idx].deletedAt = new Date();
      } else {
        uploads.splice(idx, 1);
      }
      writeJsonFile(UPLOADS_FILE, uploads);
      return true;
    }
  }

  // ==========================================
  // 3. FILE ASSET ACTIONS
  // ==========================================
  async createFileAsset(data: any): Promise<any> {
    try {
      return await prisma.fileAsset.create({ data });
    } catch (err) {
      if (!shouldAllowFallback()) throw err;
      const assets = readJsonFile<any>(FILE_ASSETS_FILE);
      const newAsset = {
        id: data.id || crypto.randomUUID(),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      assets.push(newAsset);
      writeJsonFile(FILE_ASSETS_FILE, assets);
      return newAsset;
    }
  }

  async findFileAssetById(id: string): Promise<any | null> {
    try {
      return await prisma.fileAsset.findUnique({ where: { id } });
    } catch (err) {
      if (!shouldAllowFallback()) throw err;
      const assets = readJsonFile<any>(FILE_ASSETS_FILE);
      return assets.find((a) => a.id === id && !a.deletedAt) || null;
    }
  }

  async updateFileAsset(id: string, data: any): Promise<any> {
    try {
      return await prisma.fileAsset.update({ where: { id }, data });
    } catch (err) {
      if (!shouldAllowFallback()) throw err;
      const assets = readJsonFile<any>(FILE_ASSETS_FILE);
      const idx = assets.findIndex((a) => a.id === id);
      if (idx === -1) throw new Error('File asset not found');
      const updated = {
        ...assets[idx],
        ...data,
        updatedAt: new Date(),
      };
      assets[idx] = updated;
      writeJsonFile(FILE_ASSETS_FILE, assets);
      return updated;
    }
  }

  // ==========================================
  // 4. CLEANUP RUN ACTIONS
  // ==========================================
  async createCleanupRun(data: any): Promise<any> {
    try {
      return await prisma.customerUploadCleanupRun.create({ data });
    } catch (err) {
      if (!shouldAllowFallback()) throw err;
      const runs = readJsonFile<any>(CLEANUP_RUNS_FILE);
      const newRun = {
        id: data.id || crypto.randomUUID(),
        ...data,
        createdAt: new Date(),
      };
      runs.push(newRun);
      writeJsonFile(CLEANUP_RUNS_FILE, runs);
      return newRun;
    }
  }

  async updateCleanupRun(id: string, data: any): Promise<any> {
    try {
      return await prisma.customerUploadCleanupRun.update({ where: { id }, data });
    } catch (err) {
      if (!shouldAllowFallback()) throw err;
      const runs = readJsonFile<any>(CLEANUP_RUNS_FILE);
      const idx = runs.findIndex((r) => r.id === id);
      if (idx === -1) throw new Error('Cleanup run not found');
      const updated = {
        ...runs[idx],
        ...data,
      };
      runs[idx] = updated;
      writeJsonFile(CLEANUP_RUNS_FILE, runs);
      return updated;
    }
  }

  async listCleanupRuns(): Promise<any[]> {
    try {
      return await prisma.customerUploadCleanupRun.findMany({
        orderBy: { startedAt: 'desc' },
      });
    } catch (err) {
      if (!shouldAllowFallback()) throw err;
      const runs = readJsonFile<any>(CLEANUP_RUNS_FILE);
      return runs.sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
    }
  }
}
