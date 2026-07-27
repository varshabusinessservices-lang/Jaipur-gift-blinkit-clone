import { Request, Response } from 'express';
import { verifyFirebaseIdToken } from './services/firebaseTokenVerifier';
import { prisma } from '../../database/prisma';
import { generateTokens } from '../../utils/jwt';
import crypto from 'crypto';

export const verifyFirebaseOTP = async (req: Request, res: Response) => {
  try {
    const { idToken, accountType, device } = req.body;
    
    if (!idToken) {
      return res.status(400).json({ success: false, message: 'Missing Firebase ID Token' });
    }
    if (accountType !== 'CUSTOMER' && accountType !== 'RIDER') {
      return res.status(400).json({ success: false, message: 'Invalid account type' });
    }

    let decodedToken;
    try {
      decodedToken = await verifyFirebaseIdToken(idToken);
    } catch (e: any) {
      return res.status(401).json({ success: false, message: 'Invalid or expired Firebase token', error: e.message });
    }

    const phone_number = decodedToken.phone_number;
    const firebaseUid = decodedToken.uid;

    if (!phone_number) {
      return res.status(400).json({ success: false, message: 'Token does not contain a verified phone number' });
    }

    let userId: string;
    let finalRole: string;

    if (accountType === 'CUSTOMER') {
      let customer = await prisma.customer.findUnique({
        where: { mobile: phone_number }
      });

      if (customer) {
        if (customer.status === 'BLOCKED') {
          return res.status(403).json({ success: false, message: 'Customer account is blocked' });
        }
        // Could link Firebase UID here if needed (e.g., save to customer.firebaseUid if we add it)
        await prisma.customer.update({
          where: { id: customer.id },
          data: { isVerified: true }
        });
      } else {
        // Create new customer
        customer = await prisma.customer.create({
          data: {
            mobile: phone_number,
            status: 'ACTIVE',
            isVerified: true,
          }
        });
      }

      userId = customer.id;
      finalRole = 'CUSTOMER';

      const { accessToken, refreshToken } = generateTokens(userId, finalRole);
      const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');

      await prisma.customerSession.create({
        data: {
          customerId: userId,
          refreshTokenHash: hashedToken,
          userAgent: req.headers['user-agent'] || device?.deviceName || null,
          ipAddress: req.ip || null,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        }
      });

      return res.json({
        success: true,
        data: {
          accessToken,
          refreshToken,
          user: { id: userId, mobile: phone_number, role: finalRole }
        }
      });

    } else {
      // RIDER
      const rider = await prisma.rider.findUnique({
        where: { phone: phone_number }
      });

      if (!rider) {
        return res.status(404).json({ success: false, message: 'Rider account not found' });
      }
      if (rider.availability === false) {
        // Just note they are offline, still can log in
      }

      userId = rider.id;
      finalRole = 'RIDER';

      const { accessToken, refreshToken } = generateTokens(userId, finalRole);
      
      // Rider session not in schema right now. We just return the tokens.
      
      return res.json({
        success: true,
        data: {
          accessToken,
          refreshToken,
          user: { id: userId, mobile: phone_number, role: finalRole }
        }
      });
    }

  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
};
