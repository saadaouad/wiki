import type { FastifyInstance } from 'fastify';

export const healthRoute = (fastify: FastifyInstance) => {
  fastify.get(
    '/health',
    {
      config: {
        rateLimit: false
      },
      schema: {
        tags: ['Health']
      }
    },
    (_request, reply) => {
      return reply.code(200).send({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'Wiki API'
      });
    }
  );
};
