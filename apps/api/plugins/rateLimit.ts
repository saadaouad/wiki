import rateLimit from '@fastify/rate-limit';
import type { FastifyInstance } from 'fastify';

import { env, isTestEnv } from '@/env.ts';

export const registerRateLimit = async (app: FastifyInstance) => {
  if (isTestEnv()) {
    return;
  }

  await app.register(rateLimit, {
    global: true,
    max: env.RATE_LIMIT_MAX_REQUESTS,
    timeWindow: env.RATE_LIMIT_WINDOW_MS,
    skipOnError: true,
    allowList: (request) => request.url.startsWith('/docs')
  });
};

export const authRateLimitConfig = isTestEnv()
  ? {}
  : ({
      rateLimit: {
        max: env.RATE_LIMIT_AUTH_MAX_REQUESTS,
        timeWindow: env.RATE_LIMIT_WINDOW_MS
      }
    } as const);
