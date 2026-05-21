import type { FastifyInstance } from 'fastify';

import { me } from '@/controllers/user.ts';
import { requireAuthenticateToken } from '@/middleware/auth.ts';

export const userRoutes = async (app: FastifyInstance) => {
  app.get('/me', { preHandler: requireAuthenticateToken }, me);
};
