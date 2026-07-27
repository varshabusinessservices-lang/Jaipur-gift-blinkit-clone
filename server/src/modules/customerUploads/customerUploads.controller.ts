import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import { CustomerUploadsRepository } from './customerUploads.repository';
import { PersonalisationFormRepository } from '../personalisationForms/personalisationForms.repository';
import { ProductRepository } from '../products/products.repository';
import { CustomerUploadsService } from './customerUploads.service';
import { CreateSessionSchema, CustomerUploadRole } from './customerUploads.types';

const repo = new CustomerUploadsRepository();
const formRepo = new PersonalisationFormRepository();
const productRepo = new ProductRepository();
export const uploadService = new CustomerUploadsService(repo, formRepo, productRepo);

// ==========================================
// PUBLIC CUSTOMER HANDLERS
// ==========================================

export async function createSession(req: Request, res: Response, next: NextFunction) {
  try {
    const validated = CreateSessionSchema.safeParse(req.body);
    if (!validated.success) {
      res.status(400).json({
        success: false,
        message: 'INVALID_INPUT',
        errors: validated.error.issues,
      });
      return;
    }

    const session = await uploadService.createSession({
      productId: validated.data.productId,
      variationId: validated.data.variationId,
      personalisationFormId: validated.data.personalisationFormId,
      anonymousSessionId: validated.data.anonymousSessionId,
      source: validated.data.source,
      customerId: (req as any).user?.id || null, // if authentication is present
    });

    res.status(201).json({
      success: true,
      session: {
        id: session.id,
        publicToken: session.publicToken,
        expiresAt: session.expiresAt,
        status: session.status,
      },
    });
  } catch (err: any) {
    if (err.message === 'PRODUCT_NOT_FOUND') {
      res.status(404).json({ success: false, message: 'PRODUCT_NOT_FOUND' });
      return;
    }
    if (err.message === 'PERSONALISATION_FORM_NOT_FOUND') {
      res.status(404).json({ success: false, message: 'PERSONALISATION_FORM_NOT_FOUND' });
      return;
    }
    next(err);
  }
}

export async function getSession(req: Request, res: Response, next: NextFunction) {
  try {
    const { token } = req.params;
    const session = await uploadService.getSession(token);
    if (!session) {
      res.status(404).json({ success: false, message: 'UPLOAD_SESSION_NOT_FOUND' });
      return;
    }

    const uploads = await repo.findUploadBySessionId(session.id);
    const uploadsWithSignedUrls = uploads.map((u) => ({
      id: u.id,
      productId: u.productId,
      variationId: u.variationId,
      personalisationFieldId: u.personalisationFieldId,
      fieldKey: u.fieldKey,
      uploadRole: u.uploadRole,
      lifecycleStatus: u.lifecycleStatus,
      originalFileName: u.originalFileName,
      safeFileName: u.safeFileName,
      sizeBytes: u.sizeBytes,
      width: u.width,
      height: u.height,
      checksum: u.checksum,
      sortOrder: u.sortOrder,
      isPrimary: u.isPrimary,
      isCustomerDeleted: u.isCustomerDeleted,
      validationResultJson: u.validationResultJson ? JSON.parse(u.validationResultJson) : null,
      signedUrl: uploadService.generateSignedUrl(u.id),
    }));

    res.json({
      success: true,
      session: {
        id: session.id,
        publicToken: session.publicToken,
        expiresAt: session.expiresAt,
        status: session.status,
        productId: session.productId,
        variationId: session.variationId,
        personalisationFormId: session.personalisationFormId,
        formVersion: session.formVersion,
      },
      uploads: uploadsWithSignedUrls,
    });
  } catch (err) {
    next(err);
  }
}

export async function handleUpload(req: Request, res: Response, next: NextFunction) {
  try {
    const { token } = req.params;
    const { fieldId, uploadRole, clientUploadId, sortOrder, isPrimary } = req.body;
    const file = req.file;

    if (!file) {
      res.status(400).json({ success: false, message: 'FILE_REQUIRED' });
      return;
    }
    if (!fieldId) {
      res.status(400).json({ success: false, message: 'FIELD_ID_REQUIRED' });
      return;
    }

    const role = (uploadRole as CustomerUploadRole) || 'OTHER';
    const numSortOrder = sortOrder ? parseInt(sortOrder as string, 10) : 0;
    const boolIsPrimary = isPrimary === 'true' || isPrimary === true;

    const upload = await uploadService.handleUpload(
      token,
      fieldId,
      role,
      file,
      clientUploadId,
      numSortOrder,
      boolIsPrimary
    );

    res.status(201).json({
      success: true,
      upload: {
        id: upload.id,
        productId: upload.productId,
        variationId: upload.variationId,
        personalisationFieldId: upload.personalisationFieldId,
        fieldKey: upload.fieldKey,
        uploadRole: upload.uploadRole,
        lifecycleStatus: upload.lifecycleStatus,
        originalFileName: upload.originalFileName,
        safeFileName: upload.safeFileName,
        sizeBytes: upload.sizeBytes,
        width: upload.width,
        height: upload.height,
        checksum: upload.checksum,
        sortOrder: upload.sortOrder,
        isPrimary: upload.isPrimary,
        validationResultJson: upload.validationResultJson ? JSON.parse(upload.validationResultJson) : null,
        signedUrl: uploadService.generateSignedUrl(upload.id),
      },
    });
  } catch (err: any) {
    const statusMap: Record<string, number> = {
      UPLOAD_SESSION_NOT_FOUND: 404,
      UPLOAD_SESSION_EXPIRED: 410,
      UPLOAD_SESSION_BLOCKED: 403,
      UPLOAD_SESSION_LIMIT_EXCEEDED: 429,
      UPLOAD_SESSION_SIZE_EXCEEDED: 413,
      CUSTOMER_UPLOAD_FIELD_INVALID: 400,
      CUSTOMER_UPLOAD_FILE_TOO_LARGE: 413,
      CUSTOMER_UPLOAD_COUNT_MAXIMUM_EXCEEDED: 429,
      CUSTOMER_UPLOAD_FORMAT_UNSUPPORTED: 415,
      CUSTOMER_UPLOAD_SIGNATURE_INVALID: 422,
      CUSTOMER_UPLOAD_DUPLICATE: 409,
      CUSTOMER_UPLOAD_CORRUPTED: 422,
    };

    const status = statusMap[err.message] || 500;
    res.status(status).json({
      success: false,
      message: err.message || 'UPLOAD_FAILED',
    });
  }
}

export async function deleteUpload(req: Request, res: Response, next: NextFunction) {
  try {
    const { token, uploadId } = req.params;
    const session = await uploadService.getSession(token);
    if (!session) {
      res.status(404).json({ success: false, message: 'UPLOAD_SESSION_NOT_FOUND' });
      return;
    }

    const upload = await repo.findUploadById(uploadId);
    if (!upload || upload.uploadSessionId !== session.id) {
      res.status(404).json({ success: false, message: 'CUSTOMER_UPLOAD_NOT_FOUND' });
      return;
    }

    if (upload.isAdminProtected) {
      res.status(403).json({ success: false, message: 'ADMIN_PROTECTED_CANNOT_DELETE' });
      return;
    }

    // Soft delete
    await repo.updateUpload(upload.id, {
      isCustomerDeleted: true,
      deletedAt: new Date(),
    });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

export async function viewFile(req: Request, res: Response, next: NextFunction) {
  try {
    const { uploadId } = req.params;
    const { expires, signature } = req.query;

    if (!expires || !signature) {
      res.status(401).json({ success: false, message: 'UNAUTHORIZED_ACCESS_DENIED' });
      return;
    }

    const isValid = uploadService.verifySignedUrl(
      uploadId,
      parseInt(expires as string, 10),
      signature as string
    );

    if (!isValid) {
      res.status(403).json({ success: false, message: 'LINK_INVALID_OR_EXPIRED' });
      return;
    }

    const upload = await repo.findUploadById(uploadId);
    if (!upload) {
      res.status(404).json({ success: false, message: 'CUSTOMER_UPLOAD_NOT_FOUND' });
      return;
    }

    const physicalPath = await uploadService.getPhysicalFilePath(uploadId);
    if (!fs.existsSync(physicalPath)) {
      res.status(404).json({ success: false, message: 'FILE_NOT_FOUND_ON_DISK' });
      return;
    }

    res.setHeader('Content-Type', upload.mimeType);
    res.sendFile(physicalPath);
  } catch (err) {
    next(err);
  }
}

// ==========================================
// ADMIN HANDLERS
// ==========================================

export async function adminListSessions(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, source, productId, customerId } = req.query;
    const sessions = await repo.listSessions({ status, source, productId, customerId });
    res.json({ success: true, sessions });
  } catch (err) {
    next(err);
  }
}

export async function adminGetSession(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const session = await repo.findSessionById(id);
    if (!session) {
      res.status(404).json({ success: false, message: 'UPLOAD_SESSION_NOT_FOUND' });
      return;
    }

    const uploads = await repo.findUploadBySessionId(session.id);
    const uploadsWithSignedUrls = uploads.map((u) => ({
      ...u,
      validationResultJson: u.validationResultJson ? JSON.parse(u.validationResultJson) : null,
      signedUrl: uploadService.generateSignedUrl(u.id, 60), // admin gets 60-minute links
    }));

    res.json({
      success: true,
      session,
      uploads: uploadsWithSignedUrls,
    });
  } catch (err) {
    next(err);
  }
}

export async function adminListUploads(req: Request, res: Response, next: NextFunction) {
  try {
    const { lifecycleStatus, uploadRole, productId, personalisationFieldId, search } = req.query;
    const { items, total } = await repo.listUploads({
      lifecycleStatus,
      uploadRole,
      productId,
      personalisationFieldId,
      search,
    });

    const itemsWithSignedUrls = items.map((u) => ({
      ...u,
      validationResultJson: u.validationResultJson ? JSON.parse(u.validationResultJson) : null,
      signedUrl: uploadService.generateSignedUrl(u.id, 60),
    }));

    res.json({
      success: true,
      uploads: itemsWithSignedUrls,
      total,
    });
  } catch (err) {
    next(err);
  }
}

export async function adminToggleProtect(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { isAdminProtected, protectionReason } = req.body;

    const upload = await repo.findUploadById(id);
    if (!upload) {
      res.status(404).json({ success: false, message: 'CUSTOMER_UPLOAD_NOT_FOUND' });
      return;
    }

    const updated = await repo.updateUpload(id, {
      isAdminProtected: isAdminProtected === true,
      protectionReason: isAdminProtected ? protectionReason || 'Admin locked' : null,
    });

    res.json({ success: true, upload: updated });
  } catch (err) {
    next(err);
  }
}

export async function adminTriggerCleanup(req: Request, res: Response, next: NextFunction) {
  try {
    const dryRun = req.body.dryRun === true;
    const result = await uploadService.runCleanup(dryRun);

    res.json({
      success: true,
      run: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function adminGetCleanupHistory(req: Request, res: Response, next: NextFunction) {
  try {
    const history = await repo.listCleanupRuns();
    res.json({ success: true, history });
  } catch (err) {
    next(err);
  }
}
