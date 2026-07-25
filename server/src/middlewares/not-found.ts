import { Request, Response, NextFunction } from 'express';

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith('/api')) {
    res.status(404).json({
      success: false,
      message: 'Route not found',
      code: 'NOT_FOUND',
      requestId: req.headers['x-request-id'] || 'unknown',
    });
  } else {
    next();
  }
};
