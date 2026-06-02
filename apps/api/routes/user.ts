import type { FastifyInstance } from 'fastify';

import { me } from '@/controllers/user.ts';
import { requireToken } from '@/middleware/index.ts';

export const userRoutes = async (app: FastifyInstance) => {
  app.get('/me', { preHandler: requireToken }, me);
};
