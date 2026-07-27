import { z } from 'zod';

export type UploadSessionStatus = 'ACTIVE' | 'COMPLETED' | 'CONVERTED' | 'EXPIRED' | 'ABANDONED' | 'BLOCKED';
export type UploadSessionSource = 'WEBSITE' | 'ANDROID_APP' | 'ADMIN' | 'WHATSAPP_ASSISTED' | 'OFFLINE_ORDER';

export type CustomerUploadRole =
  | 'MAIN_PHOTO'
  | 'SUPPORTING_PHOTO'
  | 'PROFILE_PHOTO'
  | 'LOGO'
  | 'QR_IMAGE'
  | 'DOCUMENT'
  | 'REFERENCE_IMAGE'
  | 'ADDON_UPLOAD'
  | 'OTHER';

export type CustomerUploadLifecycleStatus =
  | 'UPLOADING'
  | 'TEMPORARY'
  | 'VALIDATED'
  | 'VALIDATION_FAILED'
  | 'RESERVED'
  | 'ORDER_ATTACHED'
  | 'RETENTION_HOLD'
  | 'CLEANUP_ELIGIBLE'
  | 'PURGED'
  | 'QUARANTINED'
  | 'REJECTED'
  | 'CART_ACTIVE';

export type CleanupRunStatus = 'RUNNING' | 'COMPLETED' | 'PARTIAL' | 'FAILED';

export interface UploadSession {
  id: string;
  publicToken: string;
  customerId: string | null;
  anonymousSessionId: string | null;
  storeId: string | null;
  productId: string | null;
  variationId: string | null;
  personalisationFormId: string | null;
  formVersion: number | null;
  status: UploadSessionStatus;
  source: UploadSessionSource;
  deviceFingerprintHash: string | null;
  ipHash: string | null;
  userAgentSummary: string | null;
  expiresAt: Date;
  lastActivityAt: Date;
  convertedAt: Date | null;
  abandonedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface CustomerUpload {
  id: string;
  uploadSessionId: string;
  fileAssetId: string;
  productId: string | null;
  variationId: string | null;
  personalisationFormId: string | null;
  personalisationFieldId: string | null;
  fieldKey: string | null;
  uploadRole: CustomerUploadRole;
  lifecycleStatus: CustomerUploadLifecycleStatus;
  originalFileName: string;
  safeFileName: string;
  mimeType: string;
  extension: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  orientation: string | null;
  checksum: string | null;
  sortOrder: number;
  isPrimary: boolean;
  isCustomerDeleted: boolean;
  isAdminProtected: boolean;
  protectionReason: string | null;
  retentionStartsAt: Date | null;
  retentionExpiresAt: Date | null;
  purgedAt: Date | null;
  metadataJson: string | null;
  validationResultJson: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface CustomerUploadCleanupRun {
  id: string;
  startedAt: Date;
  completedAt: Date | null;
  status: CleanupRunStatus;
  dryRun: boolean;
  scannedCount: number;
  eligibleCount: number;
  purgedCount: number;
  skippedCount: number;
  failedCount: number;
  errorSummaryJson: string | null;
  createdAt: Date;
}

// Zod schemas for input validation
export const CreateSessionSchema = z.object({
  productId: z.string().min(1),
  variationId: z.string().optional().nullable(),
  personalisationFormId: z.string().min(1),
  anonymousSessionId: z.string().optional().nullable(),
  source: z.enum(['WEBSITE', 'ADMIN', 'OFFLINE_ORDER']).default('WEBSITE'),
});
