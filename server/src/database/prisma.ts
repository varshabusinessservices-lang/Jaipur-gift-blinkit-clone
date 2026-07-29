import { PrismaClient } from '@prisma/client';

if (!process.env.DATABASE_URL || (!process.env.DATABASE_URL.startsWith('mysql://') && !process.env.DATABASE_URL.startsWith('mysqls://'))) {
  process.env.DATABASE_URL = 'mysql://root:password@127.0.0.1:3306/jaipurgifting';
}

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: [],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export function shouldAllowFallback(): boolean {
  if (process.env.ALLOW_JSON_STORAGE_FALLBACK === 'true') {
    return true;
  }
  if (process.env.VITEST === 'true' || process.env.NODE_ENV === 'test') {
    return true;
  }
  if (process.env.CATEGORY_FILE_FALLBACK_ENABLED === 'false' && process.env.NODE_ENV === 'production') {
    return false;
  }
  // In development / sandbox preview where local MySQL server is not running, allow fallback
  return true;
}

