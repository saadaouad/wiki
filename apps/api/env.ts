import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { env as loadEnv } from 'custom-env';
import { z } from '@repo/schema-validation';

const apiRoot = resolve(dirname(fileURLToPath(import.meta.url)));

// Determine application stage
process.env.APP_STAGE =
  process.env.APP_STAGE ||
  (process.env.NODE_ENV === 'production'
    ? 'prod'
    : process.env.NODE_ENV === 'test'
      ? 'test'
      : 'dev');

const isProduction = process.env.APP_STAGE === 'prod';
const isDevelopment = process.env.APP_STAGE === 'dev';
const isTest = process.env.APP_STAGE === 'test';

// Load .env files based on environment (apiRoot so cwd-independent e.g. Vitest monorepo root)
if (isDevelopment) {
  loadEnv(true, apiRoot);
} else if (isTest) {
  loadEnv('test', apiRoot);
}

// Define validation schema with Zod
const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  APP_STAGE: z.enum(['dev', 'prod', 'test']).default('dev'),

  // Server configuration
  PORT: z.coerce.number().positive().default(3000),

  // Database
  DATABASE_URL: z.string().startsWith('postgresql://'),
  DATABASE_POOL_MIN: z.coerce.number().min(0).default(2),
  DATABASE_POOL_MAX: z.coerce.number().positive().default(10),

  // JWT & Authentication
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // Security
  BCRYPT_ROUNDS: z.coerce.number().min(10).max(20).default(12),

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().positive().default(900_000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().positive().default(100),
  RATE_LIMIT_AUTH_MAX_REQUESTS: z.coerce.number().positive().default(10),

  // CORS configuration
  CORS_ORIGIN: z
    .string()
    .or(z.array(z.string()))
    .transform((val) => {
      if (typeof val === 'string') {
        return val.split(',').map((origin) => origin.trim());
      }
      return val;
    })
    .default([]),

  // Logging
  LOG_LEVEL: z
    .enum(['error', 'warn', 'info', 'debug', 'trace'])
    .default(isProduction ? 'info' : 'debug'),

  // Cloudinary (article images)
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),

  // Upstash Redis (caching)
  UPSTASH_REDIS_REST_URL: z.string().url(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1),

  // OpenRouter (article summaries)
  OPENROUTER_API_KEY: z.string().min(1),
  OPENROUTER_MODEL: z.string().min(1),
  OPENROUTER_SITE_URL: z.string().url().default('http://localhost:3000'),
  OPENROUTER_APP_NAME: z.string().min(1).default('wiki'),
  OPENROUTER_URL: z.string().url().default('https://openrouter.ai/api/v1/chat/completions')
});

// Type inference from schema
export type Env = z.infer<typeof envSchema>;

// Parse and validate environment variables
let env: Env;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('❌ Invalid environment variables:');
    console.error(JSON.stringify(error.flatten().fieldErrors, null, 2));

    // Detailed error messages
    error.issues.forEach((err) => {
      const path = err.path.join('.');
      console.error(`  ${path}: ${err.message}`);
    });

    process.exit(1); // Exit with error code
  }
  throw error;
}

// Helper functions for environment checks
export const isProd = () => env.NODE_ENV === 'production';
export const isDev = () => env.NODE_ENV === 'development';
export const isTestEnv = () => env.NODE_ENV === 'test';

// Export the validated environment
export { env };
export default env;
