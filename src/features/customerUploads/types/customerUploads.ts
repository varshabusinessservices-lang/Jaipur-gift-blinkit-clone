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
  | 'REJECTED';

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
  expiresAt: string; // ISO string
  lastActivityAt: string; // ISO string
  convertedAt: string | null;
  abandonedAt: string | null;
  createdAt: string;
  updatedAt: string;
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
  retentionStartsAt: string | null;
  retentionExpiresAt: string | null;
  purgedAt: string | null;
  metadataJson: string | null;
  validationResultJson: string | null; // Parsed into object in frontend UI
  createdAt: string;
  updatedAt: string;
  signedUrl?: string;
  progress?: number; // for tracking upload progress
  error?: string; // for tracking upload error
}

export interface CustomerUploadCleanupRun {
  id: string;
  startedAt: string;
  completedAt: string | null;
  status: CleanupRunStatus;
  dryRun: boolean;
  scannedCount: number;
  eligibleCount: number;
  purgedCount: number;
  skippedCount: number;
  failedCount: number;
  errorSummaryJson: string | null;
  createdAt: string;
}

export interface ValidationResult {
  valid: boolean;
  flags: string[];
  dimensions?: {
    width: number;
    height: number;
    aspectRatio: string;
  };
}
