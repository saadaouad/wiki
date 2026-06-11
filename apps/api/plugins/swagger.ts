import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import type { FastifyInstance } from 'fastify';
import { jsonSchemaTransform } from 'fastify-type-provider-zod';

import { env, isDev } from '@/env.ts';

export const registerSwagger = async (app: FastifyInstance) => {
  if (!isDev()) {
    return;
  }

  await app.register(swagger, {
    openapi: {
      info: {
        title: 'Wiki API',
        description: 'Wiki backend API',
        version: '0.1.0'
      },
      servers: [{ url: `http://localhost:${env.PORT}` }],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        }
      }
    },
    transform: jsonSchemaTransform
  });

  await app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list'
    }
  });
};
