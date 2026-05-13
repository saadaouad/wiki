import { eq } from 'drizzle-orm';
import type { FastifyReply } from 'fastify';

import { db } from '@/db/connection.ts';
import { users } from '@/db/schema.ts';
import type { AuthenticatedRequest } from '@/types/auth.ts';
import { generateToken } from '@/utils/index.ts';

export const me = async (request: AuthenticatedRequest, reply: FastifyReply) => {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, request.user!.id)
    });

    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }

    const token = await generateToken({
      id: user.id,
      email: user.email,
      username: user.username
    });

    return reply.status(200).send({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt
      },
      token
    });
  } catch (error) {
    request.log.error(error);

    return reply.status(500).send({
      error: 'Failed to load user'
    });
  }
};
