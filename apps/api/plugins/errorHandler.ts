import type { FastifyInstance } from 'fastify';
import type { FastifyError } from '@fastify/error';

import { env } from '@/env.ts';

export class APIError extends Error {
  status: number;
  constructor(message: string, name: string, status: number) {
    super(message);
    this.name = name;
    this.status = status;
  }
}

export const errorHandler = (fastify: FastifyInstance): void => {
  fastify.setErrorHandler((err: FastifyError, _request, reply) => {
    if (reply.sent) {
      return;
    }

    console.error('Error handler', err instanceof Error ? err.stack : err);

    let status = 500;
    let message = 'Internal Server Error';

    if (err instanceof APIError) {
      status = err.status;
      message = err.message;
    } else if (err instanceof Error) {
      message = err.message;

      if (err.name === 'ValidationError') {
        status = 400;
        message = 'Validation Error';
      }

      if (err.name === 'UnauthorizedError') {
        status = 401;
        message = 'Unauthorized';
      }
    }

    reply.code(status);

    return {
      error: message,
      ...(env.APP_STAGE === 'dev' &&
        err instanceof Error && {
          stack: err.stack,
          details: err.message
        })
    };
  });
};
