import type { FastifyInstance } from 'fastify';

import { login, register } from '@/controllers/auth.ts';
import { loginSchema, registerSchema } from '@/validators/auth.ts';

export const authRoutes = async (app: FastifyInstance) => {
  app.post(
    '/register',
    {
      schema: {
        body: registerSchema
      }
    },
    register
  );

  app.post(
    '/login',
    {
      schema: {
        body: loginSchema
      }
    },
    login
  );
};
