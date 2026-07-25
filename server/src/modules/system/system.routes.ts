import { Router } from 'express';
import { getSystemConfig, getSystemFeatures } from './system.controller';

export const systemRouter = Router();

systemRouter.get('/config', getSystemConfig);
systemRouter.get('/features', getSystemFeatures);
