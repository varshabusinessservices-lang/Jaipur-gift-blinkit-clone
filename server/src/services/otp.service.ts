import { prisma } from '../database/prisma';
import crypto from 'crypto';
import { OtpPurpose } from '@prisma/client';

const EXPIRY_MINUTES = parseInt(process.env.ADMIN_OTP_EXPIRY_MINUTES || '10');
const MAX_ATTEMPTS = parseInt(process.env.ADMIN_OTP_MAX_ATTEMPTS || '5');
const RESEND_SECONDS = parseInt(process.env.ADMIN_OTP_RESEND_SECONDS || '60');

export const generateOtpHash = (otp: string): string => {
  return crypto.createHash('sha256').update(otp).digest('hex');
};

export const generateRandomOtp = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
};

export const createOtpChallenge = async (
  purpose: OtpPurpose,
  destination: string,
  adminUserId?: string,
  transactionId?: string,
  metadataJson?: string
) => {
  const otp = generateRandomOtp();
  const otpHash = generateOtpHash(otp);
  
  // Invalidate previous active OTPs for the same destination & purpose
  await prisma.otpChallenge.updateMany({
    where: {
      destination,
      purpose,
      invalidatedAt: null,
      verifiedAt: null,
      expiresAt: { gt: new Date() }
    },
    data: {
      invalidatedAt: new Date()
    }
  });

  const challenge = await prisma.otpChallenge.create({
    data: {
      purpose,
      destination,
      otpHash,
      adminUserId,
      transactionId,
      metadataJson,
      expiresAt: new Date(Date.now() + EXPIRY_MINUTES * 60 * 1000),
      resendAvailableAt: new Date(Date.now() + RESEND_SECONDS * 1000),
      maxAttempts: MAX_ATTEMPTS,
    }
  });

  return { otp, challenge };
};

export const verifyOtp = async (purpose: OtpPurpose, destination: string, otp: string) => {
  const challenge = await prisma.otpChallenge.findFirst({
    where: {
      purpose,
      destination,
      invalidatedAt: null,
      verifiedAt: null,
    },
    orderBy: { createdAt: 'desc' }
  });

  if (!challenge) {
    return { success: false, message: 'No valid OTP request found' };
  }

  if (challenge.expiresAt < new Date()) {
    return { success: false, message: 'OTP expired' };
  }

  if (challenge.attemptCount >= challenge.maxAttempts) {
    await prisma.otpChallenge.update({
      where: { id: challenge.id },
      data: { invalidatedAt: new Date() }
    });
    return { success: false, message: 'Maximum attempts reached. Please request a new OTP.' };
  }

  const otpHash = generateOtpHash(otp);

  if (challenge.otpHash !== otpHash) {
    await prisma.otpChallenge.update({
      where: { id: challenge.id },
      data: { attemptCount: challenge.attemptCount + 1 }
    });
    return { success: false, message: 'Invalid OTP' };
  }

  const verifiedChallenge = await prisma.otpChallenge.update({
    where: { id: challenge.id },
    data: { verifiedAt: new Date() }
  });

  return { success: true, challenge: verifiedChallenge };
};
