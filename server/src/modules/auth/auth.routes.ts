import { Router } from 'express';
import { login, refreshToken, logout, getMe, forgotPassword, resetPassword, changePassword, updateProfile } from './auth.controller';
import { verifyFirebaseOTP } from './auth.firebase';
import { requireAuth } from '../../middlewares/auth.middleware';

export const authRouter = Router();

authRouter.post('/login', login);
authRouter.post('/refresh-token', refreshToken);
authRouter.post('/logout', logout);
authRouter.post('/forgot-password', forgotPassword);
authRouter.post('/reset-password', resetPassword);

authRouter.post('/firebase/verify', verifyFirebaseOTP);

authRouter.use(requireAuth);
authRouter.get('/me', getMe);
authRouter.post('/change-password', changePassword);
authRouter.put('/profile', updateProfile);
