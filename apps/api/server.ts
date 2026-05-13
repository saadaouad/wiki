import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import Fastify from 'fastify';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';

import { errorHandler } from '@/middleware/errorHandler.ts';
import { authRoutes, healthRoute, userRoutes } from '@/routes/index.ts';
import { env } from '@/env.ts';

const app = Fastify({
  logger: true,
  disableRequestLogging: process.env.NODE_ENV === 'test'
});

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

await app.register(helmet);
await app.register(cors, {
  origin: env.CORS_ORIGIN,
  credentials: true
});

await app.register(healthRoute);

await app.register(authRoutes, {
  prefix: '/api/auth'
});

await app.register(userRoutes, {
  prefix: '/api'
});

errorHandler(app);

const start = async () => {
  try {
    await app.listen({
      host: env.HOST,
      port: env.PORT
    });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
