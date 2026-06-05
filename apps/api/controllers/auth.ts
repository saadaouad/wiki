import { eq } from 'drizzle-orm';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { db } from '@/db/connection.ts';
import { users } from '@/db/schema.ts';
import {
  comparePasswords,
  generateToken,
  hashPassword,
  isDuplicateKeyError
} from '@/utils/index.ts';
import type { RegisterBody, LoginBody } from '@/types/auth.ts';

export const register = async (
  request: FastifyRequest<{
    Body: RegisterBody;
  }>,
  reply: FastifyReply
) => {
  try {
    const { email, password, firstName, lastName } = request.body;
    const hashedPassword = await hashPassword(password);

    const [user] = await db
      .insert(users)
      .values({
        email,
        password: hashedPassword,
        firstName,
        lastName
      })
      .returning({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        createdAt: users.createdAt
      });

    if (!user) {
      return reply.status(500).send({ error: 'Failed to create user' });
    }

    const token = await generateToken({
      id: user.id,
      email: user.email
    });

    return reply.status(201).send({
      message: 'User created',
      user,
      token
    });
  } catch (error) {
    if (isDuplicateKeyError(error, 'users_email_unique')) {
      request.log.warn('Registration rejected: email already registered');
      return reply.status(409).send({
        error: 'An account with this email already exists'
      });
    }

    request.log.error(error);

    return reply.status(500).send({
      error: 'Failed to create user'
    });
  }
};

export const login = async (
  request: FastifyRequest<{
    Body: LoginBody;
  }>,
  reply: FastifyReply
) => {
  try {
    const { email, password } = request.body;

    const user = await db.query.users.findFirst({
      where: eq(users.email, email)
    });

    if (!user) {
      return reply.status(401).send({
        error: 'Invalid credentials'
      });
    }

    const isValidPassword = await comparePasswords(password, user.password);

    if (!isValidPassword) {
      return reply.status(401).send({
        error: 'Invalid credentials'
      });
    }

    const token = await generateToken({
      id: user.id,
      email: user.email
    });

    return reply.status(200).send({
      message: 'Login successful',
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
      error: 'Failed to login'
    });
  }
};
