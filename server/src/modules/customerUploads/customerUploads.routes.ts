import { Router } from 'express';
import multer from 'multer';
import * as controller from './customerUploads.controller';

const upload = multer({
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB max payload for multer, validated in service
});

export const customerUploadRouter = Router();

// 1. Create upload session
customerUploadRouter.post('/upload-sessions', controller.createSession);

// 2. Retrieve upload session detail & uploads
customerUploadRouter.get('/upload-sessions/:token', controller.getSession);

// 3. Handle upload file
customerUploadRouter.post('/upload-sessions/:token/upload', upload.single('file'), controller.handleUpload);

// 4. Delete file from session
customerUploadRouter.delete('/upload-sessions/:token/uploads/:uploadId', controller.deleteUpload);

// 5. View secure file
customerUploadRouter.get('/customer-uploads/view/:uploadId', controller.viewFile);
