import { Router } from 'express';
import * as controller from './customers.controller';
import { requireAuth, requireRole } from '../../middlewares/auth.middleware';

export const customerAdminRouter = Router();

// Protect all admin customer routes
customerAdminRouter.use(requireAuth);
customerAdminRouter.use(requireRole(['SUPER_ADMIN', 'ADMIN']));

// 1. Customer Lists & Details
customerAdminRouter.get('/', controller.adminListCustomers);
customerAdminRouter.get('/:id', controller.adminGetCustomerDetail);
customerAdminRouter.put('/:id', controller.adminUpdateCustomer);

// 2. Wallet override controls
customerAdminRouter.get('/:id/wallet', controller.adminGetWalletLedger);
customerAdminRouter.post('/:id/wallet/credit', controller.adminUpdateWallet);

// 3. Referral Campaign seeding
customerAdminRouter.post('/referrals/rules/seed', controller.adminSeedReferralRule);
