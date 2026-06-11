import type { FastifyInstance } from 'fastify';

import {
  articleIdParamsSchema,
  articleSlugParamsSchema,
  createArticleSchema,
  listArticlesQuerySchema,
  updateArticleFieldsSchema
} from '@repo/schema-validation';
import {
  createArticle,
  deleteArticle,
  getArticles,
  getArticle,
  updateArticle
} from '@/controllers/article.ts';
import { bearerAuthSecurity, multipartArticleDescription } from '@/openapi.ts';
import {
  requireToken,
  parseArticleMultipart,
  validateUpdateArticleBody
} from '@/middleware/index.ts';

export const articleRoutes = async (app: FastifyInstance) => {
  app.get(
    '/articles',
    {
      schema: {
        tags: ['Articles'],
        querystring: listArticlesQuerySchema
      }
    },
    getArticles
  );

  app.get(
    '/articles/:slug',
    {
      schema: {
        tags: ['Articles'],
        params: articleSlugParamsSchema
      }
    },
    getArticle
  );

  app.post(
    '/articles',
    {
      preValidation: parseArticleMultipart,
      preHandler: requireToken,
      schema: {
        tags: ['Articles'],
        security: bearerAuthSecurity,
        description: multipartArticleDescription,
        body: createArticleSchema
      }
    },
    createArticle
  );

  app.patch(
    '/articles/:id',
    {
      preValidation: parseArticleMultipart,
      preHandler: [requireToken, validateUpdateArticleBody],
      schema: {
        tags: ['Articles'],
        security: bearerAuthSecurity,
        description: multipartArticleDescription,
        params: articleIdParamsSchema,
        body: updateArticleFieldsSchema
      }
    },
    updateArticle
  );

  app.delete(
    '/articles/:id',
    {
      preHandler: requireToken,
      schema: {
        tags: ['Articles'],
        security: bearerAuthSecurity,
        params: articleIdParamsSchema
      }
    },
    deleteArticle
  );
};
