import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { prisma } from '../../database/prisma';
import { generateTokens, verifyRefreshToken } from '../../utils/jwt';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  rememberMe: z.boolean().optional(),
});

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.adminUser.findUnique({
      where: { email },
    });

    if (!user || user.deletedAt !== null) {
      return res.status(401).json({ success: false, message: 'Invalid credentials', code: 'UNAUTHORIZED' });
    }
    
    if (user.status === 'LOCKED') {
      return res.status(401).json({ success: false, message: 'Account locked. Please contact support.', code: 'UNAUTHORIZED' });
    }
    if (user.status === 'INACTIVE') {
      return res.status(401).json({ success: false, message: 'Account is inactive.', code: 'UNAUTHORIZED' });
    }

    const isValid = user.passwordHash ? await bcrypt.compare(password, user.passwordHash) : false;

    if (!isValid) {
      const attempts = user.failedLoginAttempts + 1;
      const updates: any = { failedLoginAttempts: attempts };
      if (attempts >= 5) {
        updates.status = 'LOCKED';
        updates.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins lock
      }
      await prisma.adminUser.update({ where: { id: user.id }, data: updates });

      return res.status(401).json({ success: false, message: 'Invalid credentials', code: 'UNAUTHORIZED' });
    }

    // Reset attempts on success
    await prisma.adminUser.update({
      where: { id: user.id },
      data: { failedLoginAttempts: 0, lastLoginAt: new Date(), lockedUntil: null },
    });

    const { accessToken, refreshToken } = generateTokens(user.id, user.role);
    
    // Hash refresh token to store in db
    const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');

    await prisma.adminSession.create({
      data: {
        adminUserId: user.id,
        refreshTokenHash: hashedToken,
        userAgent: req.headers['user-agent'] || null,
        ipAddress: req.ip || null,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      }
    });

    res.json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      }
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Validation error' });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'No refresh token' });
    }

    const decoded = verifyRefreshToken(refreshToken);
    const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');

    // Find active session
    const session = await prisma.adminSession.findFirst({
      where: {
        adminUserId: decoded.userId,
        refreshTokenHash: hashedToken,
        revokedAt: null,
        expiresAt: { gt: new Date() }
      }
    });

    if (!session) {
      return res.status(401).json({ success: false, message: 'Session expired or invalid' });
    }

    const user = await prisma.adminUser.findUnique({
      where: { id: decoded.userId }
    });

    if (!user || user.status !== 'ACTIVE') {
      return res.status(401).json({ success: false, message: 'User inactive' });
    }

    const tokens = generateTokens(user.id, user.role);
    const newHashedToken = crypto.createHash('sha256').update(tokens.refreshToken).digest('hex');

    // Revoke old session and create new
    await prisma.$transaction([
      prisma.adminSession.update({
        where: { id: session.id },
        data: { revokedAt: new Date() }
      }),
      prisma.adminSession.create({
        data: {
          adminUserId: user.id,
          refreshTokenHash: newHashedToken,
          userAgent: req.headers['user-agent'] || null,
          ipAddress: req.ip || null,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        }
      })
    ]);

    res.json({ success: true, data: tokens });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
      await prisma.adminSession.updateMany({
        where: { refreshTokenHash: hashedToken },
        data: { revokedAt: new Date() }
      });
    }
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.json({ success: true, message: 'Logged out successfully (with error)' });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const reqUser = (req as any).user;
    const user = await prisma.adminUser.findUnique({
      where: { id: reqUser.id },
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        role: true,
        status: true,
        isSuperAdmin: true,
        emailVerifiedAt: true,
        lastLoginAt: true,
        passwordChangedAt: true,
        createdAt: true,
        updatedAt: true,
        avatarFileId: true,
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let avatarUrl: string | null = null;
    if (user.avatarFileId) {
      const asset = await prisma.fileAsset.findUnique({
        where: { id: user.avatarFileId }
      });
      if (asset && asset.status === 'ACTIVE') {
        avatarUrl = asset.storagePath;
      }
    }

    res.json({
      success: true,
      data: {
        ...user,
        avatarUrl
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  // To implement fully: Generate OTP/Token, store in DB, send email
  res.json({ success: true, message: 'Password reset link sent (simulated)' });
};

export const resetPassword = async (req: Request, res: Response) => {
  // To implement fully: Verify token, hash new password, update user
  res.json({ success: true, message: 'Password reset successfully (simulated)' });
};

export const changePassword = async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { oldPassword, newPassword } = req.body;
  
  if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Old and new password required' });
  }
  
  const admin = await prisma.adminUser.findUnique({ where: { id: user.id } });
  if (!admin || !admin.passwordHash) {
      return res.status(400).json({ success: false, message: 'User not found or no password set' });
  }
  
  const isValid = await bcrypt.compare(oldPassword, admin.passwordHash);
  if (!isValid) {
      return res.status(400).json({ success: false, message: 'Incorrect old password' });
  }
  
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.adminUser.update({
      where: { id: user.id },
      data: { passwordHash, passwordChangedAt: new Date() }
  });
  
  res.json({ success: true, message: 'Password changed successfully' });
};

export const updateProfile = async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { name, mobile } = req.body;
  const updated = await prisma.adminUser.update({
    where: { id: user.id },
    data: { name, mobile }
  });
  res.json({ success: true, data: { name: updated.name, mobile: updated.mobile } });
};
