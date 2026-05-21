import type { FastifyRequest, RouteGenericInterface } from 'fastify';
import type { JWTPayload } from 'jose';

export type JwtPayload = JWTPayload & {
  id: string;
  email: string;
};

export type AuthenticatedRequest<
  RouteGeneric extends RouteGenericInterface = RouteGenericInterface
> = FastifyRequest<RouteGeneric>;

export type RegisterBody = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

export type LoginBody = {
  email: string;
  password: string;
};
