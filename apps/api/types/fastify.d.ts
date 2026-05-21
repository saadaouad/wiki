import type { JwtPayload } from './auth.ts';

declare module 'fastify' {
  interface FastifyRequest {
    user?: JwtPayload;
  }
}
