import type { FastifyRequest } from 'fastify';
import type { JWTPayload } from 'jose';

export type JwtPayload = JWTPayload & {
  id: string;
  email: string;
  username: string;
};

export interface AuthenticatedRequest extends FastifyRequest {
  user?: JwtPayload;
}

export type RegisterBody = {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
};

export type LoginBody = {
  email: string;
  password: string;
};
