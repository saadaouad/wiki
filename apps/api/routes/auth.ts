import type { FastifyInstance } from 'fastify';

import { login, register } from '@/controllers/auth.ts';
import { authRateLimitConfig } from '@/middleware/index.ts';
import { loginSchema, registerSchema } from '@repo/schema-validation';

export const authRoutes = async (app: FastifyInstance) => {
  app.post(
    '/register',
    {
      config: authRateLimitConfig,
      schema: {
        tags: ['Auth'],
        body: registerSchema
      }
    },
    register
  );

  app.post(
    '/login',
    {
      config: authRateLimitConfig,
      schema: {
        tags: ['Auth'],
        body: loginSchema
      }
    },
    login
  );
};
