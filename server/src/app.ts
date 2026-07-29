import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';
import { env } from './config/env';
import { v1Routes } from './routes/v1.routes';
import { checkHealth } from './modules/health/health.controller';
import { requestIdMiddleware } from './middlewares/request-id';

export const app = express();

// 1. Security and utility middlewares
app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: env.CORS_ALLOWED_ORIGINS }));
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(requestIdMiddleware);

if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 2. Direct health endpoint (/api/health)
app.get('/api/health', checkHealth);

// 3. API v1 Routes (/api/v1)
app.use(env.API_PREFIX, v1Routes);

// 4. Static media uploads route
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

