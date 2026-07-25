import { Router } from 'express';
import { checkHealth, checkDatabaseHealth } from './health.controller';

export const healthRouter = Router();

healthRouter.get('/', checkHealth);
healthRouter.get('/database', checkDatabaseHealth);
