import type { FastifyInstance } from 'fastify';

import { me } from '@/controllers/user.ts';
import { authenticateToken } from '@/middleware/auth.ts';

export const userRoutes = async (app: FastifyInstance) => {
  app.get('/me', { preHandler: authenticateToken }, me);
};
