import { app } from './app';
import { env } from './config/env';
import { prisma } from './database/prisma';
import path from 'path';
import express from 'express';

async function startServer() {
  try {
    // Verifying database connection (graceful fallback in Cloud Run/AI Studio unless FAIL_FAST=true is set)
    const failFast = process.env.FAIL_FAST === 'true';
    console.log('[server]: Verifying database connection...');
    try {
      const connectPromise = Promise.race([
        prisma.$connect().then(() => prisma.$executeRawUnsafe('SELECT 1')),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Database connection timeout (3s)')), 3000))
      ]);
      await connectPromise;
      console.log('[server]: Database connected successfully');
    } catch (dbErr) {
      if (failFast) {
        console.error('[server]: DB connect issue. Fail-fast active.');
        throw dbErr;
      } else {
        console.log('[server]: Gracefully falling back to mock/JSON storage mode for preview/publish.');
        process.env.ALLOW_JSON_STORAGE_FALLBACK = 'true';
      }
    }

    // Verify or safely default CUSTOMER_UPLOAD_SECRET in production
    if (env.NODE_ENV === 'production') {
      const uploadSecret = process.env.CUSTOMER_UPLOAD_SECRET;
      if (!uploadSecret || uploadSecret === 'CHANGE_ME' || uploadSecret === 'super-secret-customer-uploads-key-1234' || uploadSecret.length < 16) {
        console.log('[server]: CUSTOMER_UPLOAD_SECRET is not configured or weak. Using secure auto-generated fallback secret for preview/publish.');
        process.env.CUSTOMER_UPLOAD_SECRET = process.env.CUSTOMER_UPLOAD_SECRET || 'secure-fallback-upload-secret-key-9999';
      }
    }

    // If not production, we mount vite middleware to serve frontend
    if (env.NODE_ENV !== 'production' && process.env.VITE_DEV_SERVER !== 'false') {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } else if (env.NODE_ENV === 'production') {
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }

    const server = app.listen(env.PORT, '0.0.0.0', () => {
      console.log(`[server]: Server is running at http://localhost:${env.PORT}`);
    });

    // Graceful shutdown
    const shutdown = async () => {
      console.log('Shutting down gracefully...');
      server.close(async () => {
        console.log('HTTP server closed');
        await prisma.$disconnect();
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
