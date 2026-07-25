import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import { env } from './config/env';
import { v1Routes } from './routes/v1.routes';
import { errorHandler } from './middlewares/error-handler';
import { notFoundHandler } from './middlewares/not-found';
import { requestIdMiddleware } from './middlewares/request-id';

export const app = express();

// Security and utility middlewares
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: env.CORS_ALLOWED_ORIGINS }));
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(requestIdMiddleware);

if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// API Routes
app.use(env.API_PREFIX, v1Routes);

// 404 & Error Handling
app.use(notFoundHandler);
app.use(errorHandler);
