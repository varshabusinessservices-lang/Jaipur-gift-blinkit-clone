import express from 'express';
import path from 'path';

import { app } from './app';
import { env } from './config/env';
import { prisma } from './database/prisma';
import { notFoundHandler } from './middlewares/not-found';
import { errorHandler } from './middlewares/error-handler';

function validateProductionEnvironment(): void {
  if (env.NODE_ENV !== 'production') {
    return;
  }

  const failFast = process.env.FAIL_FAST === 'true';
  const uploadSecret = process.env.CUSTOMER_UPLOAD_SECRET;

  if (!uploadSecret || uploadSecret.length < 32) {
    if (failFast) {
      throw new Error(
        'CUSTOMER_UPLOAD_SECRET must be set and at least 32 characters in production.'
      );
    }
    console.warn('[server]: CUSTOMER_UPLOAD_SECRET missing or weak. Using fallback secret for preview/development.');
    process.env.CUSTOMER_UPLOAD_SECRET = process.env.CUSTOMER_UPLOAD_SECRET || 'secure-fallback-upload-secret-key-9999-long-enough-32chars';
  }
}

async function verifyDatabaseConnection(): Promise<void> {
  console.log('[server]: Verifying MySQL database connection...');
  const failFast = process.env.FAIL_FAST === 'true';

  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Database connection timed out after 3 seconds.'));
      }, 3_000);
    });

    await Promise.race([
      prisma.$connect().then(async () => {
        await prisma.$queryRaw`SELECT 1`;
      }),
      timeoutPromise,
    ]);

    console.log('[server]: MySQL database connected successfully.');
  } catch (dbErr: any) {
    if (failFast) {
      console.error('[server]: Database connection failed and FAIL_FAST is active.');
      throw dbErr;
    }
    console.warn('[server]: MySQL database not reachable:', dbErr?.message || dbErr);
    console.warn('[server]: Enabling JSON/Mock storage fallback for development & preview.');
    process.env.ALLOW_JSON_STORAGE_FALLBACK = 'true';
  }
}

function configureFrontend(): void {
  if (env.NODE_ENV !== 'production' && process.env.VITE_DEV_SERVER !== 'false') {
    return;
  }

  if (env.NODE_ENV === 'production') {
    const distPath = path.resolve(process.cwd(), 'dist');
    const indexPath = path.join(distPath, 'index.html');

    app.use(express.static(distPath));

    app.get('*', (req, res, next) => {
      /*
       * API requests must never receive React index.html.
       * They should continue to the API 404/error handlers.
       */
      if (req.path.startsWith('/api')) {
        return next();
      }

      return res.sendFile(indexPath);
    });
  }
}

async function startServer(): Promise<void> {
  try {
    validateProductionEnvironment();

    /*
     * Production must use the real MySQL database.
     * Do not silently enable JSON/mock fallback.
     */
    await verifyDatabaseConnection();

    /*
     * Public endpoint to verify that Express is actually running.
     * Place this before the SPA fallback and global 404 handler.
     */
    app.get('/api/health', async (_req, res) => {
      try {
        await prisma.$queryRaw`SELECT 1`;

        return res.status(200).json({
          success: true,
          status: 'ok',
          database: 'connected',
          environment: env.NODE_ENV,
        });
      } catch {
        return res.status(503).json({
          success: false,
          status: 'error',
          database: 'disconnected',
        });
      }
    });

    if (
      env.NODE_ENV !== 'production' &&
      process.env.VITE_DEV_SERVER !== 'false'
    ) {
      const { createServer: createViteServer } = await import('vite');

      const vite = await createViteServer({
        server: {
          middlewareMode: true,
        },
        appType: 'spa',
      });

      app.use(vite.middlewares);
    } else {
      configureFrontend();
    }

    /*
     * These must remain after API routes, static files and SPA fallback.
     */
    app.use(notFoundHandler);
    app.use(errorHandler);

    const port = Number(process.env.PORT) || 3000;

    const server = app.listen(port, '0.0.0.0', () => {
      console.log(`[server]: Express server listening on port ${port}`);
      console.log(`[server]: Environment: ${env.NODE_ENV}`);
      console.log(`[server]: Health endpoint: /api/health`);
      console.log(`[server]: API base path: /api/v1`);
    });

    const shutdown = async (signal: string): Promise<void> => {
      console.log(`[server]: Received ${signal}. Shutting down...`);

      server.close(async () => {
        try {
          await prisma.$disconnect();
          console.log('[server]: Database connection closed.');
          process.exit(0);
        } catch (error) {
          console.error('[server]: Shutdown error:', error);
          process.exit(1);
        }
      });
    };

    process.on('SIGINT', () => {
      void shutdown('SIGINT');
    });

    process.on('SIGTERM', () => {
      void shutdown('SIGTERM');
    });
  } catch (error) {
    console.error('[server]: Failed to start application.');

    if (error instanceof Error) {
      console.error('[server]: Error message:', error.message);
      console.error('[server]: Error stack:', error.stack);
    } else {
      console.error(error);
    }

    await prisma.$disconnect().catch(() => undefined);
    process.exit(1);
  }
}

void startServer();