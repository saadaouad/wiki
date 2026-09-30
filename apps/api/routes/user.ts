import type { FastifyInstance } from 'fastify';

import { me } from '@/controllers/user.ts';
import { bearerAuthSecurity } from '@/openapi.ts';
import { requireToken } from '@/hooks/auth.ts';

export const userRoutes = async (app: FastifyInstance) => {
  app.get(
    '/me',
    {
      preHandler: requireToken,
      schema: {
        tags: ['Users'],
        security: bearerAuthSecurity
      }
    },
    me
  );
};
