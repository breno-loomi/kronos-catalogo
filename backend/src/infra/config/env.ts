import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3333),
  HOST: z.string().default('0.0.0.0'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL é obrigatório.'),
  CORS_ORIGIN: z.string().default(''),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET precisa ter pelo menos 16 caracteres.'),
  JWT_EXPIRES_IN: z.string().default('12h'),
  COOKIE_NAME: z.string().default('kronos_session'),
  UPLOAD_DIR: z.string().default('./uploads'),
  PUBLIC_UPLOAD_BASE_URL: z.string().default('/uploads'),
  // R2 (S3-compatible) — opcional. Se as cinco vierem preenchidas, o bootstrap usa
  // R2ImageStorage em vez de disco local; senão cai no disco local (bom pra dev).
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET: z.string().optional(),
  R2_PUBLIC_URL: z.string().optional(),
});

export type Env = z.infer<typeof EnvSchema> & { corsOrigins: string[] };

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const parsed = EnvSchema.parse(source);
  const corsOrigins = parsed.CORS_ORIGIN.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  return { ...parsed, corsOrigins };
}
