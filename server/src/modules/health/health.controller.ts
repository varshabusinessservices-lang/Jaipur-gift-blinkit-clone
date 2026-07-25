import { Request, Response } from 'express';
import { env } from '../../config/env';
import { prisma } from '../../database/prisma';

export const checkHealth = (req: Request, res: Response) => {
  res.json({
    success: true,
    service: env.API_PREFIX,
    status: 'up',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    version: '1.0.0'
  });
};

export const checkDatabaseHealth = async (req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      success: true,
      message: 'Database connection successful',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: env.NODE_ENV === 'development' ? (error as Error).message : 'Unknown error',
    });
  }
};
