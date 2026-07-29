import { z } from 'zod';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env relative to server root
dotenv.config({ path: path.resolve(process.cwd(), 'server/.env') });

// Enforce PORT 3000 due to AI Studio constraints

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  API_PREFIX: z.string().default('/api/v1'),
  DATABASE_URL: z.string().optional().transform(val => (!val || val.trim() === '') ? undefined : val),
  CORS_ALLOWED_ORIGINS: z.string().default('*').transform((str) => str.split(',')),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(200),
  RAZORPAY_KEY_ID: z.string().default('rzp_test_mock_key_id'),
  RAZORPAY_KEY_SECRET: z.string().default('rzp_test_mock_key_secret'),
  RAZORPAY_WEBHOOK_SECRET: z.string().default('rzp_test_mock_webhook_secret'),
  RAZORPAY_ACCOUNT_ID: z.string().optional(),
  PAYMENT_GATEWAY_MODE: z.enum(['live', 'mock', 'auto']).default('auto'),
  PAYMENT_ENVIRONMENT: z.string().default('sandbox'),
  PAYMENT_WEBHOOK_TOLERANCE_SECONDS: z.coerce.number().default(300),
  PAYMENT_RECONCILIATION_ENABLED: z.coerce.boolean().default(true),
  WALLET_TOPUP_ENABLED: z.coerce.boolean().default(true),
  WALLET_TOPUP_MIN_AMOUNT: z.coerce.number().default(100),
  WALLET_TOPUP_MAX_AMOUNT: z.coerce.number().default(5000),
  WALLET_TOPUP_MAX_DAILY_AMOUNT: z.coerce.number().default(10000),
  WALLET_TOPUP_MAX_MONTHLY_AMOUNT: z.coerce.number().default(25000),
  WALLET_MAX_BALANCE: z.coerce.number().default(20000),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('Invalid environment variables:', parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;
