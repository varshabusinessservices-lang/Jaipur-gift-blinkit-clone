import { apiClient } from '../../../lib/axios';
import { config } from '../../../config/env';
import {
  UploadSession,
  CustomerUpload,
  CustomerUploadCleanupRun,
  CustomerUploadRole,
  CustomerUploadLifecycleStatus,
} from '../types/customerUploads';

// Client-side mock state for mock mode
let mockSessions: UploadSession[] = [];
let mockUploads: CustomerUpload[] = [];
let mockCleanupRuns: CustomerUploadCleanupRun[] = [
  {
    id: 'run-1',
    startedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000 + 5000).toISOString(),
    status: 'COMPLETED',
    dryRun: false,
    scannedCount: 20,
    eligibleCount: 4,
    purgedCount: 4,
    skippedCount: 0,
    failedCount: 0,
    errorSummaryJson: null,
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'run-2',
    startedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 12 * 3600 * 1000 + 3000).toISOString(),
    status: 'COMPLETED',
    dryRun: true,
    scannedCount: 15,
    eligibleCount: 2,
    purgedCount: 0,
    skippedCount: 2,
    failedCount: 0,
    errorSummaryJson: null,
    createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
  }
];

// Helper to generate IDs
const generateId = (prefix: string) => `${prefix}-${Math.random().toString(36).substring(2, 9)}`;

export const customerUploadsService = {
  // ==========================================
  // CUSTOMER-FACING SERVICE METHODS
  // ==========================================

  async createSession(payload: {
    productId: string;
    personalisationFormId: string;
    variationId?: string | null;
    source?: string;
  }): Promise<UploadSession> {
    if (config.useMockApi) {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
      const session: UploadSession = {
        id: generateId('sess'),
        publicToken: `token_${Math.random().toString(36).substring(2, 15)}`,
        customerId: null,
        anonymousSessionId: generateId('anon'),
        storeId: 'store-001',
        productId: payload.productId,
        variationId: payload.variationId || null,
        personalisationFormId: payload.personalisationFormId,
        formVersion: 1,
        status: 'ACTIVE',
        source: (payload.source as any) || 'WEBSITE',
        expiresAt: expiresAt.toISOString(),
        lastActivityAt: now.toISOString(),
        convertedAt: null,
        abandonedAt: null,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };
      mockSessions.push(session);
      return session;
    }

    const { data } = await apiClient.post('/upload-sessions', payload);
    return data.session;
  },

  async getSession(token: string): Promise<{ session: UploadSession; uploads: CustomerUpload[] }> {
    if (config.useMockApi) {
      const session = mockSessions.find((s) => s.publicToken === token);
      if (!session) {
        throw new Error('UPLOAD_SESSION_NOT_FOUND');
      }
      const sessionUploads = mockUploads.filter((u) => u.uploadSessionId === session.id && !u.isCustomerDeleted);
      return { session, uploads: sessionUploads };
    }

    const { data } = await apiClient.get(`/upload-sessions/${token}`);
    return { session: data.session, uploads: data.uploads };
  },

  async uploadFile(
    token: string,
    fieldId: string,
    role: CustomerUploadRole,
    file: File,
    onProgress?: (pct: number) => void
  ): Promise<CustomerUpload> {
    if (config.useMockApi) {
      const session = mockSessions.find((s) => s.publicToken === token);
      if (!session) {
        throw new Error('UPLOAD_SESSION_NOT_FOUND');
      }

      // Read image dimensions if applicable
      let width: number | null = null;
      let height: number | null = null;
      const isImg = file.type.startsWith('image/');

      if (isImg) {
        await new Promise<void>((resolve) => {
          const img = new Image();
          img.src = URL.createObjectURL(file);
          img.onload = () => {
            width = img.width;
            height = img.height;
            URL.revokeObjectURL(img.src);
            resolve();
          };
          img.onerror = () => {
            resolve();
          };
        });
      }

      // Simulate upload progress
      if (onProgress) {
        for (let pct = 10; pct <= 100; pct += 30) {
          await new Promise((r) => setTimeout(r, 150));
          onProgress(pct > 100 ? 100 : pct);
        }
      }

      const flags: string[] = [];
      let lifecycleStatus: CustomerUploadLifecycleStatus = 'VALIDATED';

      if (isImg && width && height) {
        if (width < 1000 || height < 1000) {
          flags.push('RESOLUTION_TOO_LOW');
          lifecycleStatus = 'VALIDATION_FAILED';
        }
        if (file.size > 5 * 1024 * 1024) {
          flags.push('FILE_SIZE_TOO_LARGE');
          lifecycleStatus = 'VALIDATION_FAILED';
        }
      }

      const nowStr = new Date().toISOString();
      const uploadId = generateId('upl');
      const mockUpload: CustomerUpload = {
        id: uploadId,
        uploadSessionId: session.id,
        fileAssetId: generateId('asset'),
        productId: session.productId,
        variationId: session.variationId,
        personalisationFormId: session.personalisationFormId,
        personalisationFieldId: fieldId,
        fieldKey: `field_${fieldId}`,
        uploadRole: role,
        lifecycleStatus,
        originalFileName: file.name,
        safeFileName: file.name.replace(/[^a-zA-Z0-9.-]/g, '_'),
        mimeType: file.type,
        extension: file.name.split('.').pop() || '',
        sizeBytes: file.size,
        width,
        height,
        orientation: 'PORTRAIT',
        checksum: `mock_checksum_${Date.now()}`,
        sortOrder: mockUploads.filter((u) => u.uploadSessionId === session.id).length,
        isPrimary: mockUploads.filter((u) => u.uploadSessionId === session.id).length === 0,
        isCustomerDeleted: false,
        isAdminProtected: false,
        protectionReason: null,
        retentionStartsAt: nowStr,
        retentionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        purgedAt: null,
        metadataJson: JSON.stringify({ device: 'Browser Mock' }),
        validationResultJson: JSON.stringify({
          valid: flags.length === 0,
          flags,
          dimensions: width && height ? { width, height, aspectRatio: `${width}:${height}` } : null,
        }),
        createdAt: nowStr,
        updatedAt: nowStr,
        signedUrl: URL.createObjectURL(file), // use object URL so browser can preview it directly!
      };

      mockUploads.push(mockUpload);
      return mockUpload;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('fieldId', fieldId);
    formData.append('uploadRole', role);

    const { data } = await apiClient.post(`/upload-sessions/${token}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(pct);
        }
      },
    });

    return data.upload;
  },

  async deleteUpload(token: string, uploadId: string): Promise<boolean> {
    if (config.useMockApi) {
      const idx = mockUploads.findIndex((u) => u.id === uploadId);
      if (idx !== -1) {
        mockUploads[idx].isCustomerDeleted = true;
        return true;
      }
      return false;
    }

    const { data } = await apiClient.delete(`/upload-sessions/${token}/uploads/${uploadId}`);
    return data.success;
  },

  // ==========================================
  // ADMIN PANEL SERVICE METHODS
  // ==========================================

  async adminListSessions(filters?: {
    status?: string;
    source?: string;
    productId?: string;
    customerId?: string;
  }): Promise<UploadSession[]> {
    if (config.useMockApi) {
      let filtered = [...mockSessions];
      if (filters?.status) filtered = filtered.filter((s) => s.status === filters.status);
      if (filters?.source) filtered = filtered.filter((s) => s.source === filters.source);
      if (filters?.productId) filtered = filtered.filter((s) => s.productId === filters.productId);
      return filtered;
    }

    const { data } = await apiClient.get('/admin/customer-uploads/sessions', { params: filters });
    return data.sessions;
  },

  async adminGetSession(id: string): Promise<{ session: UploadSession; uploads: CustomerUpload[] }> {
    if (config.useMockApi) {
      const session = mockSessions.find((s) => s.id === id);
      if (!session) throw new Error('Session not found');
      const uploads = mockUploads.filter((u) => u.uploadSessionId === id);
      return { session, uploads };
    }

    const { data } = await apiClient.get(`/admin/customer-uploads/sessions/${id}`);
    return { session: data.session, uploads: data.uploads };
  },

  async adminListUploads(filters?: {
    lifecycleStatus?: string;
    uploadRole?: string;
    productId?: string;
    search?: string;
  }): Promise<{ uploads: CustomerUpload[]; total: number }> {
    if (config.useMockApi) {
      let filtered = [...mockUploads];
      if (filters?.lifecycleStatus) filtered = filtered.filter((u) => u.lifecycleStatus === filters.lifecycleStatus);
      if (filters?.uploadRole) filtered = filtered.filter((u) => u.uploadRole === filters.uploadRole);
      if (filters?.productId) filtered = filtered.filter((u) => u.productId === filters.productId);
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        filtered = filtered.filter(
          (u) => u.originalFileName.toLowerCase().includes(q) || u.id.toLowerCase().includes(q)
        );
      }
      return { uploads: filtered, total: filtered.length };
    }

    const { data } = await apiClient.get('/admin/customer-uploads/uploads', { params: filters });
    return { uploads: data.uploads, total: data.total };
  },

  async adminToggleProtect(id: string, isAdminProtected: boolean, protectionReason?: string): Promise<CustomerUpload> {
    if (config.useMockApi) {
      const idx = mockUploads.findIndex((u) => u.id === id);
      if (idx === -1) throw new Error('Upload not found');
      mockUploads[idx].isAdminProtected = isAdminProtected;
      mockUploads[idx].protectionReason = isAdminProtected ? protectionReason || 'Admin locked' : null;
      return mockUploads[idx];
    }

    const { data } = await apiClient.patch(`/admin/customer-uploads/uploads/${id}/protect`, {
      isAdminProtected,
      protectionReason,
    });
    return data.upload;
  },

  async adminTriggerCleanup(dryRun: boolean): Promise<CustomerUploadCleanupRun> {
    if (config.useMockApi) {
      const scannedCount = mockUploads.length;
      // In mock, let's treat any upload that is older than 2 hours and validation failed, or is customer deleted as eligible for cleanup
      const eligibleUploads = mockUploads.filter(
        (u) => u.isCustomerDeleted || u.lifecycleStatus === 'VALIDATION_FAILED'
      );
      const eligibleCount = eligibleUploads.length;
      const purgedCount = dryRun ? 0 : eligibleCount;

      if (!dryRun) {
        // Purge them
        eligibleUploads.forEach((u) => {
          u.lifecycleStatus = 'PURGED';
          u.purgedAt = new Date().toISOString();
        });
      }

      const run: CustomerUploadCleanupRun = {
        id: generateId('run'),
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        status: 'COMPLETED',
        dryRun,
        scannedCount,
        eligibleCount,
        purgedCount,
        skippedCount: dryRun ? eligibleCount : 0,
        failedCount: 0,
        errorSummaryJson: null,
        createdAt: new Date().toISOString(),
      };
      mockCleanupRuns.unshift(run);
      return run;
    }

    const { data } = await apiClient.post('/admin/customer-uploads/cleanup', { dryRun });
    return data.run;
  },

  async adminGetCleanupHistory(): Promise<CustomerUploadCleanupRun[]> {
    if (config.useMockApi) {
      return [...mockCleanupRuns];
    }

    const { data } = await apiClient.get('/admin/customer-uploads/cleanup-history');
    return data.history;
  },
};
