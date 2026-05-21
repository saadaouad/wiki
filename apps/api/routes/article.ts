import type { FastifyInstance } from 'fastify';

import {
  createArticle,
  deleteArticle,
  getArticles,
  getArticle,
  updateArticle
} from '@/controllers/article.ts';
import { requireAuthenticateToken } from '@/middleware/auth.ts';
import {
  articleIdParamsSchema,
  createArticleSchema,
  updateArticleSchema
} from '@repo/schema-validation';

export const articleRoutes = async (app: FastifyInstance) => {
  app.get('/articles', getArticles);
  app.get('/articles/:slug', getArticle);
  app.post(
    '/articles',
    {
      preHandler: requireAuthenticateToken,
      schema: { body: createArticleSchema }
    },
    createArticle
  );
  app.patch(
    '/articles/:id',
    {
      preHandler: requireAuthenticateToken,
      schema: { body: updateArticleSchema, params: articleIdParamsSchema }
    },
    updateArticle
  );
  app.delete(
    '/articles/:id',
    {
      preHandler: requireAuthenticateToken,
      schema: { params: articleIdParamsSchema }
    },
    deleteArticle
  );
};
