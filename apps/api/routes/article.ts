import type { FastifyInstance } from 'fastify';

import {
  createArticle,
  deleteArticle,
  getArticles,
  getArticle,
  updateArticle
} from '@/controllers/article.ts';
import { requireAuthenticateToken } from '@/middleware/auth.ts';
import { parseArticleMultipart, validateUpdateArticleBody } from '@/middleware/articleBody.ts';
import { articleIdParamsSchema, createArticleSchema } from '@repo/schema-validation';

export const articleRoutes = async (app: FastifyInstance) => {
  app.get('/articles', getArticles);
  app.get('/articles/:slug', getArticle);
  app.post(
    '/articles',
    {
      preValidation: parseArticleMultipart,
      preHandler: requireAuthenticateToken,
      schema: { body: createArticleSchema }
    },
    createArticle
  );
  app.patch(
    '/articles/:id',
    {
      preValidation: parseArticleMultipart,
      preHandler: [requireAuthenticateToken, validateUpdateArticleBody],
      schema: { params: articleIdParamsSchema }
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
