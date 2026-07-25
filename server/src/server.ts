import { app } from './app';
import { env } from './config/env';
import { prisma } from './database/prisma';
import path from 'path';
import express from 'express';

async function startServer() {
  try {
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
