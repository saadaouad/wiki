import rateLimit from '@fastify/rate-limit';
import type { FastifyInstance } from 'fastify';

import { env, isTestEnv } from '@/env.ts';

export const registerRateLimit = async (app: FastifyInstance) => {
  await app.register(rateLimit, {
    global: true,
    max: isTestEnv() ? 0 : env.RATE_LIMIT_MAX_REQUESTS,
    timeWindow: env.RATE_LIMIT_WINDOW_MS,
    skipOnError: true
  });
};

export const authRateLimitConfig = {
  rateLimit: {
    max: isTestEnv() ? 0 : env.RATE_LIMIT_AUTH_MAX_REQUESTS,
    timeWindow: env.RATE_LIMIT_WINDOW_MS
  }
} as const;
