import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export function shouldAllowFallback(): boolean {
  if (process.env.ALLOW_JSON_STORAGE_FALLBACK === 'true') {
    return true;
  }
  if (process.env.NODE_ENV === 'production') {
    return false;
  }
  if (process.env.VITEST === 'true' || process.env.NODE_ENV === 'test') {
    return true;
  }
  return true;
}
