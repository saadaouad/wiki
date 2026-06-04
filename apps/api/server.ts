import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import multipart from '@fastify/multipart';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';

import { errorHandler, registerRateLimit } from '@/middleware/index.ts';
import { authRoutes, healthRoute, userRoutes, articleRoutes } from '@/routes/index.ts';
import { env } from '@/env.ts';

const app = Fastify({
  logger: true,
  disableRequestLogging: process.env.NODE_ENV === 'test'
});

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

await app.register(helmet);
await app.register(multipart, {
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1
  }
});
await app.register(cors, {
  origin: env.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'HEAD', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS']
});

await registerRateLimit(app);

await app.register(healthRoute);
await app.register(authRoutes, {
  prefix: '/api/auth'
});
await app.register(userRoutes, {
  prefix: '/api'
});
await app.register(articleRoutes, {
  prefix: '/api'
});

errorHandler(app);

const start = async () => {
  try {
    await app.listen({
      host: '0.0.0.0',
      port: env.PORT
    });

    app.log.info(`Server running on port ${env.PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
