import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { z } from 'zod';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  API_PREFIX: z.string().default('/api/v1'),
  MONGODB_URI: z.string().optional().default(''),
  MONGODB_DB_NAME: z.string().default('auren_roofing'),

  JWT_ACCESS_SECRET: z
    .string()
    .min(16)
    .default('auren_roofing_dev_access_secret_key_2026_architectural'),
  JWT_REFRESH_SECRET: z
    .string()
    .min(16)
    .default('auren_roofing_dev_refresh_secret_key_2026_architectural'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_DAYS: z.coerce.number().int().positive().default(30),

  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
  COOKIE_SECURE: z
    .string()
    .optional()
    .transform((v) => v === 'true'),

  LOGIN_MAX_ATTEMPTS: z.coerce.number().int().positive().default(5),
  LOGIN_LOCKOUT_MINUTES: z.coerce.number().int().positive().default(15),

  SEED_OWNER_NAME: z.string().default('Auren Managing Partner'),
  SEED_OWNER_EMAIL: z.string().email().default('admin@aurenroofing.co'),
  SEED_OWNER_PHONE: z.string().default('5550142200'),
  SEED_OWNER_PASSWORD: z.string().min(6).default('AurenOwner2026!'),

  RESEND_API_KEY: z.string().optional().default(''),
  CONTACT_RECIPIENT_EMAIL: z.string().optional().default(''),
  RESEND_FROM_EMAIL: z
    .string()
    .optional()
    .default('Auren Roofing <estimates@your-verified-domain.com>'),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid Auren server environment:', parsed.error.issues);
  process.exit(1);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';

export function isAllowedOrigin(origin: string | undefined, requestHost?: string): boolean {
  if (!origin) return true;
  const trimmed = origin.trim().replace(/\/$/, '').toLowerCase();
  const configured = env.CLIENT_ORIGIN.split(',')
    .map((s) => s.trim().replace(/\/$/, '').toLowerCase())
    .filter(Boolean);
  if (configured.includes(trimmed)) return true;

  if (requestHost) {
    try {
      if (new URL(trimmed).host.toLowerCase() === requestHost.toLowerCase()) return true;
    } catch {
      return false;
    }
  }

  if (!isProd && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(trimmed)) return true;
  if (process.env.VERCEL && /^https:\/\/[a-z0-9-]+(?:\.[a-z0-9-]+)*\.vercel\.app$/.test(trimmed)) {
    return true;
  }
  return false;
}

