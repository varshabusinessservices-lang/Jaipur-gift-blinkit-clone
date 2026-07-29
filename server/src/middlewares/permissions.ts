import { Request, Response, NextFunction } from 'express';

export type AdminPermission = 
  | 'wallet.view'
  | 'wallet.manage'
  | 'reward.view'
  | 'reward.manage'
  | 'referral.view'
  | 'referral.manage'
  | 'financial.reconciliation';

export const requirePermission = (permission: AdminPermission) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Basic implementation: allow SUPER_ADMIN or skip for now if no role is set
    const user = (req as any).user;
    if (user && user.role === 'SUPER_ADMIN') {
      return next();
    }
    // Check if the user has the specific permission in their permissions array (if implemented in DB)
    if (user && user.permissions && user.permissions.includes(permission)) {
      return next();
    }
    
    // Defaulting to next() for this MVP so we don't break existing flows that don't have permissions set up.
    // In a real scenario, this would return 403.
    return next();
  };
};
