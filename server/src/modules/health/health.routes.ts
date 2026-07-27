import { Router } from 'express';
import { 
  checkHealth, 
  checkDatabaseHealth, 
  checkStorageHealth, 
  checkCacheHealth, 
  checkPaymentHealth, 
  checkFirebaseHealth, 
  checkMapsHealth 
} from './health.controller';

export const healthRouter = Router();

healthRouter.get('/', checkHealth);
healthRouter.get('/database', checkDatabaseHealth);
healthRouter.get('/storage', checkStorageHealth);
healthRouter.get('/cache', checkCacheHealth);
healthRouter.get('/payment', checkPaymentHealth);
healthRouter.get('/firebase', checkFirebaseHealth);
healthRouter.get('/maps', checkMapsHealth);

