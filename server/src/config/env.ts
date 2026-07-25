import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load .env relative to server root
dotenv.config({ path: path.resolve(process.cwd(), 'server/.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000), // Enforce 3000 due to AI Studio constraints
  API_PREFIX: z.string().default('/api/v1'),
  DATABASE_URL: z.string().url().optional(),
  CORS_ALLOWED_ORIGINS: z.string().default('*').transform((str) => str.split(',')),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(200),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('Invalid environment variables:', parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;
