import { Router } from 'express';
import * as controller from './customerUploads.controller';

export const customerUploadAdminRouter = Router();

// 1. List upload sessions
customerUploadAdminRouter.get('/sessions', controller.adminListSessions);

// 2. Get specific upload session details & uploads
customerUploadAdminRouter.get('/sessions/:id', controller.adminGetSession);

// 3. Search and list files
customerUploadAdminRouter.get('/uploads', controller.adminListUploads);

// 4. Toggle admin protection
customerUploadAdminRouter.patch('/uploads/:id/protect', controller.adminToggleProtect);

// 5. Trigger manual cleanup run
customerUploadAdminRouter.post('/cleanup', controller.adminTriggerCleanup);

// 6. List cleanup history
customerUploadAdminRouter.get('/cleanup-history', controller.adminGetCleanupHistory);
