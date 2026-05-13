import type { FastifyReply } from 'fastify';

import type { AuthenticatedRequest } from '@/types/auth.ts';
import { verifyToken } from '@/utils/index.ts';

export const authenticateToken = async (
  request: AuthenticatedRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    const authHeader = request.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return reply.status(401).send({ error: 'Access token required' });
    }

    const payload = await verifyToken(token);
    request.user = payload;
  } catch (err) {
    console.error('Authentication error', err);
    return reply.status(403).send({ error: 'Invalid or expired token' });
  }
};
