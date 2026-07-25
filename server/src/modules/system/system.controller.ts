import { Request, Response } from 'express';
import { prisma } from '../../database/prisma';
import { AppError } from '../../middlewares/error-handler';

export const getSystemConfig = async (req: Request, res: Response, next: any) => {
  try {
    // Only return safe public settings
    const settings = await prisma.appSetting.findMany({
      where: {
        isPublic: true,
      },
    });
    
    // Default safe settings if DB fails or empty
    res.json({
      success: true,
      data: {
        appName: 'Jaipur Personalised Gifts',
        currency: 'INR',
        timezone: 'Asia/Kolkata',
        storeMode: 'SINGLE_STORE',
        settings: settings.map(s => ({ namespace: s.namespace, key: s.key, value: JSON.parse(s.valueJson) })),
      },
    });
  } catch (error) {
    // Return fallback config instead of breaking the app if DB is down
    res.json({
      success: true,
      data: {
        appName: 'Jaipur Personalised Gifts',
        currency: 'INR',
        timezone: 'Asia/Kolkata',
        storeMode: 'SINGLE_STORE',
        settings: []
      },
      meta: { dbConnected: false }
    });
  }
};

export const getSystemFeatures = async (req: Request, res: Response, next: any) => {
  try {
    const features = await prisma.featureFlag.findMany({
      where: { scope: 'GLOBAL' },
    });
    
    res.json({
      success: true,
      data: features,
    });
  } catch (error) {
    // Fallback safe features
    res.json({
      success: true,
      data: [
        { key: 'personalised_products', enabled: true },
        { key: 'same_day_delivery', enabled: true },
        { key: 'next_day_delivery', enabled: true },
      ],
      meta: { dbConnected: false }
    });
  }
};
