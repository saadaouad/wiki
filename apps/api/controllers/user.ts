import { eq } from 'drizzle-orm';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { db } from '@/db/connection.ts';
import { users } from '@/db/schema.ts';
import { generateToken } from '@/utils/index.ts';

export const me = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, request.user!.id)
    });

    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }

    const token = await generateToken({
      id: user.id,
      email: user.email
    });

    return reply.status(200).send({
      user: {
        id: user.id,
        email: user.email,
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
