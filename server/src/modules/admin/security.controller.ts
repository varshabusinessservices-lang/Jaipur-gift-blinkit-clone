import { Request, Response } from 'express';
import { prisma } from '../../database/prisma';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { z } from 'zod';
import { createOtpChallenge, verifyOtp } from '../../services/otp.service';
import { sendEmail } from '../../utils/email';
import * as templates from '../../utils/email-templates';

const EXPIRY_MINUTES = parseInt(process.env.ADMIN_OTP_EXPIRY_MINUTES || '10');

// PASSWORD
export const requestPasswordOtp = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { currentPassword } = req.body;
    
    if (!currentPassword) {
      return res.status(400).json({ success: false, message: 'Current password is required' });
    }

    const admin = await prisma.adminUser.findUnique({ where: { id: user.id } });
    if (!admin || !admin.passwordHash) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }

    const isValid = await bcrypt.compare(currentPassword, admin.passwordHash);
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Incorrect current password' });
    }

    const { otp, challenge } = await createOtpChallenge('PASSWORD_CHANGE', admin.email, admin.id);
    const emailContent = templates.getPasswordChangeOtpEmail(otp, EXPIRY_MINUTES);
    await sendEmail(admin.email, emailContent.subject, emailContent.html, emailContent.text);

    await prisma.auditLog.create({
      data: {
        actorType: 'ADMIN', actorAdminId: user.id, action: 'PASSWORD_OTP_REQUESTED',
        entityType: 'AdminUser', entityId: user.id,
        ipAddress: req.ip || null, userAgent: req.headers['user-agent'] || null,
      }
    });

    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const verifyPasswordOtp = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { otp } = req.body;
    if (!otp) return res.status(400).json({ success: false, message: 'OTP is required' });

    const admin = await prisma.adminUser.findUnique({ where: { id: user.id } });
    if (!admin) return res.status(400).json({ success: false, message: 'User not found' });

    const result = await verifyOtp('PASSWORD_CHANGE', admin.email, otp);
    if (!result.success) {
      return res.status(400).json(result);
    }

    await prisma.auditLog.create({
      data: {
        actorType: 'ADMIN', actorAdminId: user.id, action: 'PASSWORD_OTP_VERIFIED',
        entityType: 'AdminUser', entityId: user.id,
        ipAddress: req.ip || null, userAgent: req.headers['user-agent'] || null,
      }
    });

    res.json({ success: true, message: 'OTP verified successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

const passwordSchema = z.string()
  .min(12, 'Must be at least 12 characters')
  .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character')
  .max(128, 'Maximum 128 characters');

export const changePassword = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { currentPassword, newPassword } = req.body;
    
    passwordSchema.parse(newPassword);

    const admin = await prisma.adminUser.findUnique({ where: { id: user.id } });
    if (!admin || !admin.passwordHash) return res.status(400).json({ success: false, message: 'User not found' });

    if (newPassword.toLowerCase().includes(admin.email.toLowerCase()) || 
        newPassword.toLowerCase().includes(admin.name.toLowerCase())) {
      return res.status(400).json({ success: false, message: 'Password must not contain your name or email' });
    }

    const isValid = await bcrypt.compare(currentPassword, admin.passwordHash);
    if (!isValid) return res.status(400).json({ success: false, message: 'Incorrect current password' });
    
    const isSame = await bcrypt.compare(newPassword, admin.passwordHash);
    if (isSame) return res.status(400).json({ success: false, message: 'New password must be different from current' });

    // Check if OTP was verified recently (within last 15 minutes)
    const recentVerifiedOtp = await prisma.otpChallenge.findFirst({
      where: {
        purpose: 'PASSWORD_CHANGE',
        destination: admin.email,
        verifiedAt: { gte: new Date(Date.now() - 15 * 60 * 1000) }
      }
    });

    if (!recentVerifiedOtp) {
      return res.status(400).json({ success: false, message: 'Please verify OTP first' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Revoke all other sessions
    const currentRefreshToken = req.headers.authorization?.split(' ')[1]; // Not really refresh token, we need the session id or something... 
    // Actually we can't easily get current session from accessToken. We will just revoke all others by not revoking the one matched with user agent/ip... wait, better is we should extract session info from token if possible, or just revoke all. Let's revoke all for simplicity and security, or maybe not.
    // The prompt says: "All other sessions are revoked. Current session may remain active with rotated tokens."
    // We will just revoke all others based on id if we can, but since access token doesn't have session ID by default, let's look up all sessions and revoke them except maybe one?
    // Let's just update the user's password.
    
    await prisma.$transaction(async (tx) => {
      await tx.adminUser.update({
        where: { id: user.id },
        data: { passwordHash }
      });
      // Invalidate the OTP so it can't be reused
      await tx.otpChallenge.update({
        where: { id: recentVerifiedOtp.id },
        data: { invalidatedAt: new Date() }
      });
      
      // We don't have session id in token right now. We will just revoke all sessions to be safe? 
      // Actually, if we revoke all, the user has to login again, which is acceptable for password change but prompt said "Current session may remain active".
      // We'll leave sessions untouched here and handle it in the next step, or just revoke all where id != currentSessionId. We don't have currentSessionId. 
      // Let's skip session revocation here and rely on logout-all or we can revoke all.
      // Wait, let's revoke all sessions.
      await tx.adminSession.updateMany({
        where: { adminUserId: user.id },
        data: { revokedAt: new Date() }
      });
    });

    const emailContent = templates.getPasswordChangedEmail();
    await sendEmail(admin.email, emailContent.subject, emailContent.html, emailContent.text);

    await prisma.auditLog.create({
      data: {
        actorType: 'ADMIN', actorAdminId: user.id, action: 'PASSWORD_CHANGED',
        entityType: 'AdminUser', entityId: user.id,
        ipAddress: req.ip || null, userAgent: req.headers['user-agent'] || null,
      }
    });

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.issues[0].message });
    }
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// EMAIL CHANGE
export const requestOldEmailOtp = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const admin = await prisma.adminUser.findUnique({ where: { id: user.id } });
    if (!admin) return res.status(400).json({ success: false, message: 'User not found' });

    const { otp, challenge } = await createOtpChallenge('EMAIL_CHANGE_OLD_EMAIL', admin.email, admin.id);
    const emailContent = templates.getOldEmailChangeOtpEmail(otp, EXPIRY_MINUTES);
    await sendEmail(admin.email, emailContent.subject, emailContent.html, emailContent.text);

    await prisma.auditLog.create({
      data: {
        actorType: 'ADMIN', actorAdminId: user.id, action: 'EMAIL_CHANGE_INITIATED',
        entityType: 'AdminUser', entityId: user.id,
        ipAddress: req.ip || null, userAgent: req.headers['user-agent'] || null,
      }
    });

    res.json({ success: true, message: 'OTP sent to current email' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const verifyOldEmailOtp = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { otp, newEmail } = req.body;
    if (!otp || !newEmail) return res.status(400).json({ success: false, message: 'OTP and newEmail are required' });

    const admin = await prisma.adminUser.findUnique({ where: { id: user.id } });
    if (!admin) return res.status(400).json({ success: false, message: 'User not found' });

    const result = await verifyOtp('EMAIL_CHANGE_OLD_EMAIL', admin.email, otp);
    if (!result.success) return res.status(400).json(result);

    await prisma.adminUser.update({
      where: { id: user.id },
      data: {
        pendingEmail: newEmail,
        pendingEmailRequestedAt: new Date(),
        pendingEmailExpiresAt: new Date(Date.now() + EXPIRY_MINUTES * 60 * 1000)
      }
    });

    await prisma.auditLog.create({
      data: {
        actorType: 'ADMIN', actorAdminId: user.id, action: 'OLD_EMAIL_VERIFIED',
        entityType: 'AdminUser', entityId: user.id,
        ipAddress: req.ip || null, userAgent: req.headers['user-agent'] || null,
      }
    });

    res.json({ success: true, message: 'Old email verified successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const requestNewEmailOtp = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const admin = await prisma.adminUser.findUnique({ where: { id: user.id } });
    if (!admin || !admin.pendingEmail || !admin.pendingEmailExpiresAt || admin.pendingEmailExpiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'No valid pending email change request' });
    }

    const { otp, challenge } = await createOtpChallenge('EMAIL_CHANGE_NEW_EMAIL', admin.pendingEmail, admin.id);
    const emailContent = templates.getNewEmailVerificationOtpEmail(otp, EXPIRY_MINUTES);
    await sendEmail(admin.pendingEmail, emailContent.subject, emailContent.html, emailContent.text);

    res.json({ success: true, message: 'OTP sent to new email' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const verifyNewEmailOtp = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { otp } = req.body;
    if (!otp) return res.status(400).json({ success: false, message: 'OTP is required' });

    const admin = await prisma.adminUser.findUnique({ where: { id: user.id } });
    if (!admin || !admin.pendingEmail) return res.status(400).json({ success: false, message: 'No pending email' });

    const result = await verifyOtp('EMAIL_CHANGE_NEW_EMAIL', admin.pendingEmail, otp);
    if (!result.success) return res.status(400).json(result);

    await prisma.auditLog.create({
      data: {
        actorType: 'ADMIN', actorAdminId: user.id, action: 'NEW_EMAIL_VERIFIED',
        entityType: 'AdminUser', entityId: user.id,
        ipAddress: req.ip || null, userAgent: req.headers['user-agent'] || null,
      }
    });

    res.json({ success: true, message: 'New email verified successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const changeEmail = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { currentPassword } = req.body;
    
    const admin = await prisma.adminUser.findUnique({ where: { id: user.id } });
    if (!admin || !admin.passwordHash || !admin.pendingEmail) {
      return res.status(400).json({ success: false, message: 'Invalid request state' });
    }

    const isValid = await bcrypt.compare(currentPassword, admin.passwordHash);
    if (!isValid) return res.status(400).json({ success: false, message: 'Incorrect current password' });

    const recentVerifiedNewEmailOtp = await prisma.otpChallenge.findFirst({
      where: {
        purpose: 'EMAIL_CHANGE_NEW_EMAIL',
        destination: admin.pendingEmail,
        verifiedAt: { gte: new Date(Date.now() - 15 * 60 * 1000) }
      }
    });

    if (!recentVerifiedNewEmailOtp) {
      return res.status(400).json({ success: false, message: 'Please verify new email OTP first' });
    }

    const oldEmail = admin.email;
    const newEmail = admin.pendingEmail;

    await prisma.$transaction(async (tx) => {
      await tx.adminUser.update({
        where: { id: user.id },
        data: {
          email: newEmail,
          pendingEmail: null,
          pendingEmailRequestedAt: null,
          pendingEmailExpiresAt: null,
        }
      });
      await tx.otpChallenge.update({
        where: { id: recentVerifiedNewEmailOtp.id },
        data: { invalidatedAt: new Date() }
      });
      await tx.adminSession.updateMany({
        where: { adminUserId: user.id },
        data: { revokedAt: new Date() }
      });
    });

    const emailContent = templates.getEmailChangedEmail();
    await sendEmail(oldEmail, emailContent.subject, emailContent.html, emailContent.text);
    await sendEmail(newEmail, emailContent.subject, emailContent.html, emailContent.text);

    await prisma.auditLog.create({
      data: {
        actorType: 'ADMIN', actorAdminId: user.id, action: 'EMAIL_CHANGED',
        entityType: 'AdminUser', entityId: user.id,
        ipAddress: req.ip || null, userAgent: req.headers['user-agent'] || null,
        oldValuesJson: JSON.stringify({ email: oldEmail }),
        newValuesJson: JSON.stringify({ email: newEmail }),
      }
    });

    res.json({ success: true, message: 'Email changed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// SESSIONS
export const getSessions = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const currentRefreshToken = req.headers['x-refresh-token'] as string;
    let currentSessionId: string | null = null;
    if (currentRefreshToken) {
      const hashedToken = crypto.createHash('sha256').update(currentRefreshToken).digest('hex');
      const session = await prisma.adminSession.findFirst({
        where: { refreshTokenHash: hashedToken, adminUserId: user.id }
      });
      if (session) currentSessionId = session.id;
    }

    const sessions = await prisma.adminSession.findMany({
      where: { adminUserId: user.id, revokedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { lastActivityAt: 'desc' }
    });

    if (!currentSessionId && sessions.length > 0) {
      currentSessionId = sessions[0].id;
    }

    const safeSessions = sessions.map(s => ({
      id: s.id,
      userAgent: s.userAgent,
      ipAddress: s.ipAddress ? s.ipAddress.replace(/\.\d+$/, '.***') : null,
      createdAt: s.createdAt,
      lastActivityAt: s.lastActivityAt,
      expiresAt: s.expiresAt,
      isCurrent: s.id === currentSessionId,
    }));

    res.json({ success: true, data: safeSessions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const revokeSession = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { sessionId } = req.params;

    const session = await prisma.adminSession.findFirst({
      where: { id: sessionId, adminUserId: user.id }
    });

    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

    await prisma.adminSession.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() }
    });

    await prisma.auditLog.create({
      data: {
        actorType: 'ADMIN', actorAdminId: user.id, action: 'SESSION_REVOKED',
        entityType: 'AdminSession', entityId: sessionId,
        ipAddress: req.ip || null, userAgent: req.headers['user-agent'] || null,
      }
    });

    res.json({ success: true, message: 'Session revoked' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const revokeAllOtherSessions = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const currentRefreshToken = req.headers['x-refresh-token'] as string;
    let currentSessionId: string | null = null;
    if (currentRefreshToken) {
      const hashedToken = crypto.createHash('sha256').update(currentRefreshToken).digest('hex');
      const session = await prisma.adminSession.findFirst({
        where: { refreshTokenHash: hashedToken, adminUserId: user.id, revokedAt: null }
      });
      if (session) currentSessionId = session.id;
    }

    if (!currentSessionId) {
      const recentSession = await prisma.adminSession.findFirst({
        where: { adminUserId: user.id, revokedAt: null, expiresAt: { gt: new Date() } },
        orderBy: { lastActivityAt: 'desc' }
      });
      if (recentSession) currentSessionId = recentSession.id;
    }

    if (!currentSessionId) {
      return res.status(400).json({ success: false, message: 'Current session identifier missing' });
    }

    await prisma.adminSession.updateMany({
      where: { adminUserId: user.id, id: { not: currentSessionId }, revokedAt: null },
      data: { revokedAt: new Date() }
    });

    await prisma.auditLog.create({
      data: {
        actorType: 'ADMIN', actorAdminId: user.id, action: 'OTHER_SESSIONS_REVOKED',
        entityType: 'AdminUser', entityId: user.id,
        ipAddress: req.ip || null, userAgent: req.headers['user-agent'] || null,
      }
    });

    res.json({ success: true, message: 'Other sessions revoked' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const logoutAllSessions = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    await prisma.adminSession.updateMany({
      where: { adminUserId: user.id },
      data: { revokedAt: new Date() }
    });

    await prisma.auditLog.create({
      data: {
        actorType: 'ADMIN', actorAdminId: user.id, action: 'ALL_SESSIONS_REVOKED',
        entityType: 'AdminUser', entityId: user.id,
        ipAddress: req.ip || null, userAgent: req.headers['user-agent'] || null,
      }
    });

    res.json({ success: true, message: 'All sessions revoked' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// ACTIVITY LOGS
export const getSecurityActivity = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    const logs = await prisma.auditLog.findMany({
      where: { 
        actorAdminId: user.id, 
        action: { 
          in: ['PASSWORD_CHANGED', 'LOGIN_SUCCESS', 'FAILED_LOGIN', 'LOGOUT', 'EMAIL_CHANGE_INITIATED', 'EMAIL_CHANGED', 'SESSION_REVOKED', 'ALL_SESSIONS_REVOKED', 'OTHER_SESSIONS_REVOKED', 'PROFILE_UPDATED', 'AVATAR_ADDED', 'AVATAR_REMOVED'] 
        } 
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const safeLogs = logs.map(l => ({
      id: l.id,
      action: l.action,
      ipAddress: l.ipAddress ? l.ipAddress.replace(/\.\d+$/, '.***') : null,
      userAgent: l.userAgent,
      createdAt: l.createdAt,
    }));

    res.json({ success: true, data: safeLogs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
