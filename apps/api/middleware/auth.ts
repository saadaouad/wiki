import type { FastifyReply, FastifyRequest } from 'fastify';

import { verifyToken } from '@/utils/index.ts';
import type { JwtPayload } from '@/types/auth.ts';

export const requireToken = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    const authHeader = request.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return reply.status(401).send({ error: 'Access token required' });
    }

    const payload = await verifyToken(token);
    request.user = payload as JwtPayload;
  } catch (err) {
    console.error('Authentication error', err);
    return reply.status(401).send({ error: 'Invalid or expired token' });
  }
};
