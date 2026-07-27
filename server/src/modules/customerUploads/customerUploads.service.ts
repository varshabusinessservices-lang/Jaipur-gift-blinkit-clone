import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { CustomerUploadsRepository } from './customerUploads.repository';
import { PersonalisationFormRepository } from '../personalisationForms/personalisationForms.repository';
import { ProductRepository } from '../products/products.repository';
import { getImageDimensions } from './imageParser';
import {
  UploadSession,
  CustomerUpload,
  CustomerUploadCleanupRun,
  UploadSessionStatus,
  UploadSessionSource,
  CustomerUploadRole,
  CustomerUploadLifecycleStatus,
} from './customerUploads.types';

// Read config with fallback defaults
const STORAGE_ROOT = process.env.CUSTOMER_UPLOAD_PRIVATE_ROOT || 'storage/customer-uploads';
const TEMP_RETENTION_HOURS = parseInt(process.env.CUSTOMER_UPLOAD_TEMP_RETENTION_HOURS || '48', 10);
const ORDER_RETENTION_DAYS = parseInt(process.env.CUSTOMER_UPLOAD_ORDER_RETENTION_DAYS || '30', 10);
const SESSION_EXPIRY_HOURS = parseInt(process.env.CUSTOMER_UPLOAD_SESSION_EXPIRY_HOURS || '48', 10);
const MAX_FILE_SIZE_MB = parseInt(process.env.CUSTOMER_UPLOAD_MAX_FILE_SIZE_MB || '15', 10);
const MAX_SESSION_SIZE_MB = parseInt(process.env.CUSTOMER_UPLOAD_MAX_SESSION_SIZE_MB || '500', 10);
const MAX_FILES_PER_SESSION = parseInt(process.env.CUSTOMER_UPLOAD_MAX_FILES_PER_SESSION || '100', 10);
const SIGNATURE_SECRET = process.env.CUSTOMER_UPLOAD_SECRET || 'super-secret-customer-uploads-key-1234';

export class CustomerUploadsService {
  private repo: CustomerUploadsRepository;
  private formRepo: PersonalisationFormRepository;
  private productRepo: ProductRepository;

  constructor(
    repo: CustomerUploadsRepository,
    formRepo: PersonalisationFormRepository,
    productRepo: ProductRepository
  ) {
    this.repo = repo;
    this.formRepo = formRepo;
    this.productRepo = productRepo;
  }

  // ==========================================
  // 1. UPLOAD SESSION ACTIONS
  // ==========================================
  async createSession(dto: {
    productId: string;
    variationId?: string | null;
    personalisationFormId: string;
    anonymousSessionId?: string | null;
    source?: UploadSessionSource;
    customerId?: string | null;
  }): Promise<UploadSession> {
    // Validate product is active / exists
    const product = await this.productRepo.findById(dto.productId);
    if (!product) {
      throw new Error('PRODUCT_NOT_FOUND');
    }

    // Validate personalization form exists
    const form = await this.formRepo.findById(dto.personalisationFormId);
    if (!form) {
      throw new Error('PERSONALISATION_FORM_NOT_FOUND');
    }

    const publicToken = crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + SESSION_EXPIRY_HOURS * 60 * 60 * 1000);

    const session = await this.repo.createSession({
      publicToken,
      customerId: dto.customerId || null,
      anonymousSessionId: dto.anonymousSessionId || null,
      productId: dto.productId,
      variationId: dto.variationId || null,
      personalisationFormId: dto.personalisationFormId,
      formVersion: form.version || 1,
      status: 'ACTIVE',
      source: dto.source || 'WEBSITE',
      expiresAt,
      lastActivityAt: new Date(),
    });

    return session;
  }

  async getSession(token: string): Promise<UploadSession | null> {
    return await this.repo.findSessionByToken(token);
  }

  async touchSession(id: string): Promise<void> {
    const expiresAt = new Date(Date.now() + SESSION_EXPIRY_HOURS * 60 * 60 * 1000);
    await this.repo.updateSession(id, {
      lastActivityAt: new Date(),
      expiresAt,
    });
  }

  // ==========================================
  // 2. CUSTOMER UPLOAD MANAGEMENT
  // ==========================================
  async handleUpload(
    token: string,
    fieldId: string,
    role: CustomerUploadRole,
    file: { originalname: string; buffer: Buffer; size: number; mimetype: string },
    clientUploadId?: string,
    sortOrder = 0,
    isPrimary = false
  ): Promise<CustomerUpload> {
    // Find active session
    const session = await this.repo.findSessionByToken(token);
    if (!session) {
      throw new Error('UPLOAD_SESSION_NOT_FOUND');
    }
    if (session.status === 'EXPIRED') {
      throw new Error('UPLOAD_SESSION_EXPIRED');
    }
    if (session.status === 'BLOCKED') {
      throw new Error('UPLOAD_SESSION_BLOCKED');
    }

    // Touch session activity
    await this.touchSession(session.id);

    // Fetch existing uploads in session to enforce limits
    const existingUploads = await this.repo.findUploadBySessionId(session.id);

    // 1. Check Retry-Safe clientUploadId
    if (clientUploadId) {
      const existing = existingUploads.find(
        (u) => u.metadataJson && JSON.parse(u.metadataJson).clientUploadId === clientUploadId
      );
      if (existing) {
        return existing; // Return already uploaded file
      }
    }

    // 2. Check duplicate file using SHA-256 Checksum
    const checksum = crypto.createHash('sha256').update(file.buffer).digest('hex');
    const isDuplicate = existingUploads.some((u) => u.checksum === checksum && u.personalisationFieldId === fieldId);
    if (isDuplicate) {
      throw new Error('CUSTOMER_UPLOAD_DUPLICATE');
    }

    // 3. Enforce limits: max files per session
    if (existingUploads.length >= MAX_FILES_PER_SESSION) {
      throw new Error('UPLOAD_SESSION_LIMIT_EXCEEDED');
    }

    // Enforce limits: total session size
    const totalSessionSize = existingUploads.reduce((sum, u) => sum + u.sizeBytes, 0) + file.size;
    if (totalSessionSize > MAX_SESSION_SIZE_MB * 1024 * 1024) {
      throw new Error('UPLOAD_SESSION_SIZE_EXCEEDED');
    }

    // 4. Get Field settings
    const form = await this.formRepo.findById(session.personalisationFormId!);
    const field = form?.fields.find((f) => f.id === fieldId);
    if (!field) {
      throw new Error('CUSTOMER_UPLOAD_FIELD_INVALID');
    }

    const imgSettings = field.settingsJson?.imageSettings;
    const maxFileBytes = imgSettings?.maxSizeBytes || MAX_FILE_SIZE_MB * 1024 * 1024;

    // Enforce limits: size per file
    if (file.size > maxFileBytes) {
      throw new Error('CUSTOMER_UPLOAD_FILE_TOO_LARGE');
    }

    // Enforce limits: max files per field
    const fieldUploadsCount = existingUploads.filter((u) => u.personalisationFieldId === fieldId).length;
    const maxFieldImages = imgSettings?.maxImages || (field.fieldType === 'MAIN_PHOTO' ? 1 : 100);
    if (fieldUploadsCount >= maxFieldImages) {
      throw new Error('CUSTOMER_UPLOAD_COUNT_MAXIMUM_EXCEEDED');
    }

    // 4. File extension and Magic Bytes validation
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanName = path.basename(file.originalname).replace(/[^a-zA-Z0-9.-]/g, '_');
    const storedName = `${crypto.randomUUID()}${ext || '.png'}`;

    // Validate mime type & extension
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new Error('CUSTOMER_UPLOAD_FORMAT_UNSUPPORTED');
    }

    // Validate magic bytes/signature where practical
    let isSignatureValid = false;
    const head = file.buffer.slice(0, 4);
    if (file.mimetype.includes('jpeg') || file.mimetype.includes('jpg')) {
      isSignatureValid = head[0] === 0xff && head[1] === 0xd8;
    } else if (file.mimetype.includes('png')) {
      isSignatureValid = head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4e && head[3] === 0x47;
    } else if (file.mimetype.includes('webp')) {
      isSignatureValid = head[0] === 0x52 && head[1] === 0x49 && head[2] === 0x46 && head[3] === 0x46; // RIFF
    } else if (file.mimetype.includes('pdf')) {
      isSignatureValid = head[0] === 0x25 && head[1] === 0x50 && head[2] === 0x44 && head[3] === 0x46; // %PDF
    }

    if (!isSignatureValid) {
      throw new Error('CUSTOMER_UPLOAD_SIGNATURE_INVALID');
    }

    // 6. Image Dimension parsing & quality checks
    const dims = getImageDimensions(file.buffer);
    const qualityFlags: string[] = [];
    let validationPassed = true;
    let qualityResult: 'PASS' | 'WARNING' | 'FAIL' = 'PASS';

    if (dims) {
      let minRes = 800;
      if (imgSettings?.minResolution) {
        const matches = String(imgSettings.minResolution).match(/(\d+)/);
        if (matches) {
          minRes = parseInt(matches[0], 10);
        }
      }
      if (dims.width < minRes || dims.height < minRes) {
        qualityFlags.push('RESOLUTION_TOO_LOW');
        if (imgSettings?.imageQualityCheckEnabled) {
          qualityResult = 'WARNING';
        }
      }
    } else if (file.mimetype.startsWith('image/')) {
      qualityFlags.push('CORRUPTED_FILE');
      validationPassed = false;
      qualityResult = 'FAIL';
    }

    if (!validationPassed || qualityResult === 'FAIL') {
      throw new Error('CUSTOMER_UPLOAD_CORRUPTED');
    }

    // 7. Store file physically in PRIVATE storage
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const relativeStorePath = `temporary/${year}/${month}/${session.publicToken}/${fieldId}/${storedName}`;
    const physicalPath = path.join(process.cwd(), STORAGE_ROOT, relativeStorePath);

    // Create folder and save
    fs.mkdirSync(path.dirname(physicalPath), { recursive: true });
    fs.writeFileSync(physicalPath, file.buffer);

    // Generate smaller thumbnail/preview copy (simply write to preview folder for local)
    const relativePreviewPath = `previews/${storedName}`;
    const previewPhysicalPath = path.join(process.cwd(), STORAGE_ROOT, relativePreviewPath);
    fs.mkdirSync(path.dirname(previewPhysicalPath), { recursive: true });
    fs.writeFileSync(previewPhysicalPath, file.buffer); // local simulator saves same file as preview

    // 8. Create FileAsset
    const fileAsset = await this.repo.createFileAsset({
      ownerType: 'PERSONALISATION_SUBMISSION',
      ownerId: session.id,
      storeId: session.storeId,
      uploadSessionId: session.id,
      role: 'CUSTOMER_UPLOAD',
      visibility: 'PRIVATE',
      status: 'TEMPORARY',
      originalName: file.originalname,
      storedName,
      storageDisk: 'local',
      storagePath: relativeStorePath,
      thumbnailPath: relativePreviewPath,
      previewPath: relativePreviewPath,
      mimeType: file.mimetype,
      extension: ext,
      sizeBytes: file.size,
      width: dims?.width || null,
      height: dims?.height || null,
      checksum,
    });

    // 9. Create CustomerUpload
    const customerUpload = await this.repo.createUpload({
      uploadSessionId: session.id,
      fileAssetId: fileAsset.id,
      productId: session.productId,
      variationId: session.variationId,
      personalisationFormId: session.personalisationFormId,
      personalisationFieldId: fieldId,
      fieldKey: field.label,
      uploadRole: role,
      lifecycleStatus: 'TEMPORARY',
      originalFileName: file.originalname,
      safeFileName: cleanName,
      mimeType: file.mimetype,
      extension: ext,
      sizeBytes: file.size,
      width: dims?.width || null,
      height: dims?.height || null,
      checksum,
      sortOrder,
      isPrimary,
      retentionExpiresAt: new Date(Date.now() + TEMP_RETENTION_HOURS * 60 * 60 * 1000),
      metadataJson: JSON.stringify({ clientUploadId }),
      validationResultJson: JSON.stringify({
        qualityResult,
        flags: qualityFlags,
        dimensions: dims,
      }),
    });

    return customerUpload;
  }

  // ==========================================
  // 3. CRYPTOGRAPHIC SIGNED URLS FOR SECURE PREVIEW
  // ==========================================
  generateSignedUrl(uploadId: string, minutes = 15): string {
    const expires = Date.now() + minutes * 60 * 1000;
    const hmac = crypto.createHmac('sha256', SIGNATURE_SECRET);
    hmac.update(`${uploadId}:${expires}`);
    const signature = hmac.digest('hex');

    return `/api/v1/customer-uploads/view/${uploadId}?expires=${expires}&signature=${signature}`;
  }

  verifySignedUrl(uploadId: string, expires: number, signature: string): boolean {
    if (Date.now() > expires) {
      return false; // Expired
    }
    const hmac = crypto.createHmac('sha256', SIGNATURE_SECRET);
    hmac.update(`${uploadId}:${expires}`);
    const expected = hmac.digest('hex');

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expected);
    if (sigBuf.length !== expBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(sigBuf, expBuf);
  }

  async getPhysicalFilePath(uploadId: string): Promise<string> {
    const upload = await this.repo.findUploadById(uploadId);
    if (!upload) throw new Error('CUSTOMER_UPLOAD_NOT_FOUND');
    const asset = await this.repo.findFileAssetById(upload.fileAssetId);
    if (!asset) throw new Error('FILE_ASSET_NOT_FOUND');

    return path.join(process.cwd(), STORAGE_ROOT, asset.storagePath);
  }

  // ==========================================
  // 4. RETENTION & CLEANUP ENGINE
  // ==========================================
  async runCleanup(dryRun = false): Promise<CustomerUploadCleanupRun> {
    const startedAt = new Date();
    
    // Find all expired sessions
    const sessions = await this.repo.listSessions();
    const expiredSessions = sessions.filter(
      (s) => s.status === 'ACTIVE' && s.expiresAt.getTime() < Date.now()
    );

    if (!dryRun) {
      for (const s of expiredSessions) {
        await this.repo.updateSession(s.id, { status: 'EXPIRED' });
      }
    }

    // Find all uploads eligible for cleanup
    const { items: allUploads } = await this.repo.listUploads();
    
    // Filter uploads that have expired temporary status and are not admin-protected
    const eligibleUploads = allUploads.filter((u) => {
      if (u.isAdminProtected) return false;
      if (u.lifecycleStatus === 'PURGED') return false;
      if (u.lifecycleStatus === 'CART_ACTIVE') return false;
      
      const isExpiredTemp =
        u.lifecycleStatus === 'TEMPORARY' &&
        u.retentionExpiresAt &&
        u.retentionExpiresAt.getTime() < Date.now();
        
      return isExpiredTemp;
    });

    let scannedCount = allUploads.length;
    let eligibleCount = eligibleUploads.length;
    let purgedCount = 0;
    let skippedCount = allUploads.length - eligibleCount;
    let failedCount = 0;
    const errors: Array<{ uploadId: string; error: string }> = [];

    for (const u of eligibleUploads) {
      try {
        if (!dryRun) {
          const asset = await this.repo.findFileAssetById(u.fileAssetId);
          if (asset) {
            // Delete original file
            const origPath = path.join(process.cwd(), STORAGE_ROOT, asset.storagePath);
            if (fs.existsSync(origPath)) {
              fs.unlinkSync(origPath);
            }
            
            // Delete thumbnail preview
            if (asset.thumbnailPath) {
              const prevPath = path.join(process.cwd(), STORAGE_ROOT, asset.thumbnailPath);
              if (fs.existsSync(prevPath)) {
                fs.unlinkSync(prevPath);
              }
            }

            // Update FileAsset status
            await this.repo.updateFileAsset(asset.id, {
              status: 'DELETED',
              deletedAt: new Date(),
            });
          }

          // Update CustomerUpload lifecycleStatus to PURGED
          await this.repo.updateUpload(u.id, {
            lifecycleStatus: 'PURGED',
            purgedAt: new Date(),
          });
        }
        purgedCount++;
      } catch (err: any) {
        failedCount++;
        errors.push({ uploadId: u.id, error: err.message || 'Purge failed' });
      }
    }

    const run = await this.repo.createCleanupRun({
      startedAt,
      completedAt: new Date(),
      status: failedCount > 0 ? 'PARTIAL' : 'COMPLETED',
      dryRun,
      scannedCount,
      eligibleCount,
      purgedCount,
      skippedCount,
      failedCount,
      errorSummaryJson: errors.length > 0 ? JSON.stringify(errors) : null,
    });

    return run;
  }
}
