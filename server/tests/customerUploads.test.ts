import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { CustomerUploadsService } from '../src/modules/customerUploads/customerUploads.service';
import { CustomerUploadsRepository } from '../src/modules/customerUploads/customerUploads.repository';
import { PersonalisationFormRepository } from '../src/modules/personalisationForms/personalisationForms.repository';
import { ProductRepository } from '../src/modules/products/products.repository';

// Safe PNG mock buffer with valid IHDR dimensions (800x800)
const validPngBuffer = Buffer.from('89504e470000000d49484452000003200000032008060000005724b025', 'hex');

describe('Customer Upload Manager (Batch 13)', () => {
  let service: CustomerUploadsService;
  let repo: CustomerUploadsRepository;
  let formRepo: PersonalisationFormRepository;
  let productRepo: ProductRepository;

  beforeEach(() => {
    repo = new CustomerUploadsRepository();
    formRepo = new PersonalisationFormRepository();
    productRepo = new ProductRepository();
    service = new CustomerUploadsService(repo, formRepo, productRepo);

    // Seed temporary directories/files for clean environment
    const testUploadsFile = path.join(process.cwd(), 'server', 'src', 'modules', 'customerUploads', 'customerUploads.json');
    const testSessionsFile = path.join(process.cwd(), 'server', 'src', 'modules', 'customerUploads', 'uploadSessions.json');
    if (fs.existsSync(testUploadsFile)) fs.unlinkSync(testUploadsFile);
    if (fs.existsSync(testSessionsFile)) fs.unlinkSync(testSessionsFile);
  });

  describe('1. Upload Sessions', () => {
    it('should create an active upload session with 48h expiry', async () => {
      // Seed a product frame first
      const session = await service.createSession({
        productId: 'prod-001', // Baby Birth Frame seed
        personalisationFormId: 'form-baby-frame',
        source: 'WEBSITE',
      });

      expect(session).toBeDefined();
      expect(session.publicToken).toHaveLength(48); // 24 bytes = 48 hex characters
      expect(session.status).toBe('ACTIVE');
      expect(session.expiresAt.getTime()).toBeGreaterThan(Date.now() + 47 * 60 * 60 * 1000);
    });

    it('should reject session creation with invalid product or form', async () => {
      await expect(
        service.createSession({
          productId: 'non-existent',
          personalisationFormId: 'form-baby-frame',
        })
      ).rejects.toThrow('PRODUCT_NOT_FOUND');

      await expect(
        service.createSession({
          productId: 'prod-001',
          personalisationFormId: 'non-existent',
        })
      ).rejects.toThrow('PERSONALISATION_FORM_NOT_FOUND');
    });
  });

  describe('2. File Validations and Uploads', () => {
    it('should reject unsupported MIME formats', async () => {
      const session = await service.createSession({
        productId: 'prod-001',
        personalisationFormId: 'form-baby-frame',
      });

      const badFile = {
        originalname: 'virus.exe',
        buffer: Buffer.from('MZ000000'),
        size: 8,
        mimetype: 'application/x-msdownload',
      };

      await expect(
        service.handleUpload(session.publicToken, 'field-baby-main-photo', 'MAIN_PHOTO', badFile)
      ).rejects.toThrow('CUSTOMER_UPLOAD_FORMAT_UNSUPPORTED');
    });

    it('should reject files with invalid magic signatures', async () => {
      const session = await service.createSession({
        productId: 'prod-001',
        personalisationFormId: 'form-baby-frame',
      });

      // Mime claim says PNG, but buffer content is empty/fake
      const fakePng = {
        originalname: 'photo.png',
        buffer: Buffer.from('NOT_A_PNG_MAGIC_BYTES_1234'),
        size: 26,
        mimetype: 'image/png',
      };

      await expect(
        service.handleUpload(session.publicToken, 'field-baby-main-photo', 'MAIN_PHOTO', fakePng)
      ).rejects.toThrow('CUSTOMER_UPLOAD_SIGNATURE_INVALID');
    });

    it('should successfully upload a valid PNG image and extract metadata', async () => {
      const session = await service.createSession({
        productId: 'prod-001',
        personalisationFormId: 'form-baby-frame',
      });

      const goodFile = {
        originalname: 'baby_baby.png',
        buffer: validPngBuffer,
        size: validPngBuffer.length,
        mimetype: 'image/png',
      };

      const upload = await service.handleUpload(
        session.publicToken,
        'field-baby-main-photo',
        'MAIN_PHOTO',
        goodFile
      );

      expect(upload).toBeDefined();
      expect(upload.originalFileName).toBe('baby_baby.png');
      expect(upload.width).toBe(800);
      expect(upload.height).toBe(800);
      expect(upload.lifecycleStatus).toBe('TEMPORARY');

      const parsedValidation = JSON.parse(upload.validationResultJson!);
      expect(parsedValidation.qualityResult).toBe('WARNING');
      expect(parsedValidation.flags).toContain('RESOLUTION_TOO_LOW');
    });

    it('should reject duplicate file uploads in the same session', async () => {
      const session = await service.createSession({
        productId: 'prod-001',
        personalisationFormId: 'form-baby-frame',
      });

      const file = {
        originalname: 'baby.png',
        buffer: validPngBuffer,
        size: validPngBuffer.length,
        mimetype: 'image/png',
      };

      // Upload first time -> success
      await service.handleUpload(session.publicToken, 'field-baby-main-photo', 'MAIN_PHOTO', file);

      // Upload second time -> duplicate error
      await expect(
        service.handleUpload(session.publicToken, 'field-baby-main-photo', 'MAIN_PHOTO', file)
      ).rejects.toThrow('CUSTOMER_UPLOAD_DUPLICATE');
    });
  });

  describe('3. Signed Previews', () => {
    it('should generate verifiable, secure signed preview URLs', async () => {
      const uploadId = 'test-upload-uuid-1234';
      const signedUrl = service.generateSignedUrl(uploadId, 10);

      expect(signedUrl).toContain(`/api/v1/customer-uploads/view/${uploadId}`);
      expect(signedUrl).toContain('signature=');
      expect(signedUrl).toContain('expires=');

      // Parse signature & expires to verify
      const url = new URL(`http://localhost${signedUrl}`);
      const expires = parseInt(url.searchParams.get('expires')!, 10);
      const signature = url.searchParams.get('signature')!;

      const isVerified = service.verifySignedUrl(uploadId, expires, signature);
      expect(isVerified).toBe(true);
    });

    it('should fail verification for tampered signed URLs', async () => {
      const uploadId = 'test-upload-uuid-1234';
      const signedUrl = service.generateSignedUrl(uploadId, 10);

      const url = new URL(`http://localhost${signedUrl}`);
      const expires = parseInt(url.searchParams.get('expires')!, 10);
      const tamperedSignature = 'badsignature' + url.searchParams.get('signature')!.substring(5);

      const isVerified = service.verifySignedUrl(uploadId, expires, tamperedSignature);
      expect(isVerified).toBe(false);
    });
  });

  describe('4. Lifecycle Retention Cleanup Engine', () => {
    it('should run cleanup dryRun without deleting active temporary uploads', async () => {
      const session = await service.createSession({
        productId: 'prod-001',
        personalisationFormId: 'form-baby-frame',
      });

      const file = {
        originalname: 'fresh.png',
        buffer: validPngBuffer,
        size: validPngBuffer.length,
        mimetype: 'image/png',
      };

      const upload = await service.handleUpload(
        session.publicToken,
        'field-baby-main-photo',
        'MAIN_PHOTO',
        file
      );

      const run = await service.runCleanup(true); // dryRun
      expect(run.scannedCount).toBeGreaterThanOrEqual(1);
      expect(run.eligibleCount).toBe(0); // fresh uploads are not expired
    });
  });
});
