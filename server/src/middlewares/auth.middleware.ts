import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { prisma } from '../database/prisma';

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthorized', code: 'UNAUTHORIZED' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    const user = await prisma.adminUser.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true, status: true, email: true, name: true, deletedAt: true }
    });

    if (!user || user.status !== 'ACTIVE' || user.deletedAt !== null) {
      return res.status(401).json({ success: false, message: 'Unauthorized or account inactive', code: 'UNAUTHORIZED' });
    }

    // Attach user to request
    (req as any).user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token', code: 'UNAUTHORIZED' });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden', code: 'FORBIDDEN' });
    }
    next();
  };
};
