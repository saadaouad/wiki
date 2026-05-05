import Fastify from 'fastify';

import { healthRoute } from '@/routes/health.ts';

const fastify = Fastify({
  logger: true
});

fastify.register(healthRoute);

const port = Number(process.env.PORT) || 3001;

const start = async () => {
  try {
    await fastify.listen({ port });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
