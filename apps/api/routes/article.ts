import type { FastifyInstance } from 'fastify';

import { articleIdParamsSchema, createArticleSchema } from '@repo/schema-validation';
import {
  createArticle,
  deleteArticle,
  getArticles,
  getArticle,
  updateArticle
} from '@/controllers/article.ts';
import { requireToken, parseArticleMultipart, validateUpdateArticleBody } from '@/middleware/index.ts';

export const articleRoutes = async (app: FastifyInstance) => {
  app.get('/articles', getArticles);
  app.get('/articles/:slug', getArticle);
  app.post(
    '/articles',
    {
      preValidation: parseArticleMultipart,
      preHandler: requireToken,
      schema: { body: createArticleSchema }
    },
    createArticle
  );
  app.patch(
    '/articles/:id',
    {
      preValidation: parseArticleMultipart,
      preHandler: [requireToken, validateUpdateArticleBody],
      schema: { params: articleIdParamsSchema }
    },
    updateArticle
  );
  app.delete(
    '/articles/:id',
    {
      preHandler: requireToken,
      schema: { params: articleIdParamsSchema }
    },
    deleteArticle
  );
};
