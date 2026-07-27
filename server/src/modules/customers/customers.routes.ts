import { Router } from 'express';
import * as controller from './customers.controller';
import { requireCustomerAuth } from '../../middlewares/customerAuth.middleware';

export const customerRouter = Router();

// 1. Authentication Endpoints
customerRouter.post('/otp/request', controller.requestOtp);
customerRouter.post('/otp/verify', controller.verifyOtp);
customerRouter.post('/register', controller.register);
customerRouter.post('/login', controller.loginPassword);

// 2. Profile Endpoints (Protected)
customerRouter.get('/profile', requireCustomerAuth, controller.getProfile);
customerRouter.put('/profile', requireCustomerAuth, controller.updateProfile);

// 3. Address Endpoints (Protected)
customerRouter.get('/addresses', requireCustomerAuth, controller.getAddresses);
customerRouter.post('/addresses', requireCustomerAuth, controller.addAddress);
customerRouter.put('/addresses/:id', requireCustomerAuth, controller.updateAddress);
customerRouter.delete('/addresses/:id', requireCustomerAuth, controller.deleteAddress);

// 4. Wallet Endpoints (Protected)
customerRouter.get('/wallet/ledger', requireCustomerAuth, controller.getWalletLedger);
customerRouter.post('/wallet/topup', requireCustomerAuth, controller.topupWallet);

// 5. Referral Endpoints (Protected)
customerRouter.get('/referral', requireCustomerAuth, controller.getReferralsInfo);
