import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { serviceApp } from '@/server.ts';
import { cleanupDatabase, createTestArticle, createTestUser } from '../helpers/dbHelpers.ts';

vi.mock('@/lib/redis.ts', () => ({
  redis: {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue('OK'),
    del: vi.fn().mockResolvedValue(1),
    incr: vi.fn().mockResolvedValue(1)
  }
}));

vi.mock('@/utils/summarize-article.ts', () => ({
  summarizeArticle: vi.fn().mockResolvedValue('Test summary')
}));

const app = await serviceApp();

describe('Article Endpoints', () => {
  afterEach(async () => {
    await cleanupDatabase();
  });

  describe('GET /api/articles', () => {
    it('should return a paginated list of articles', async () => {
      const { user } = await createTestUser();
      await createTestArticle(user.id, { title: 'First Article' });

      const response = await request(app.server).get('/api/articles').expect(200);

      expect(response.body).toHaveProperty('articles');
      expect(response.body.articles).toHaveLength(1);
      expect(response.body.articles[0]).toMatchObject({
        title: 'First Article'
      });
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination).toMatchObject({
        page: 1,
        limit: 12,
        total: 1
      });
    });
  });

  describe('GET /api/articles/:slug', () => {
    it('should return an article by slug', async () => {
      const { user } = await createTestUser();
      const article = await createTestArticle(user.id, {
        title: 'My Article',
        slug: 'my-article'
      });

      if (!article) {
        throw new Error('Failed to create test article');
      }

      const response = await request(app.server)
        .get(`/api/articles/${article.slug}`)
        .expect(200);

      expect(response.body).toHaveProperty('article');
      expect(response.body.article).toMatchObject({
        title: 'My Article',
        slug: 'my-article'
      });
      expect(response.body.article).toHaveProperty('articleView');
    });

    it('should return 404 for a missing article', async () => {
      const response = await request(app.server)
        .get('/api/articles/does-not-exist')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Article not found');
    });
  });

  describe('POST /api/articles', () => {
    it('should return 401 without a token', async () => {
      const response = await request(app.server)
        .post('/api/articles')
        .send({ title: 'New Article', content: 'Content here' })
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Access token required');
    });
  });

  describe('PATCH /api/articles/:id', () => {
    it('should update an article as the author', async () => {
      const { user, token } = await createTestUser();
      const article = await createTestArticle(user.id, {
        title: 'Original Title',
        slug: 'original-title'
      });

      if (!article) {
        throw new Error('Failed to create test article');
      }

      const response = await request(app.server)
        .patch(`/api/articles/${article.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated Title' })
        .expect(200);

      expect(response.body).toHaveProperty('article');
      expect(response.body.article).toMatchObject({
        id: article.id,
        title: 'Updated Title',
        slug: 'updated-title'
      });
    });

    it('should return 401 without a token', async () => {
      const { user } = await createTestUser();
      const article = await createTestArticle(user.id);

      if (!article) {
        throw new Error('Failed to create test article');
      }

      const response = await request(app.server)
        .patch(`/api/articles/${article.id}`)
        .send({ title: 'Updated Title' })
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Access token required');
    });

    it('should return 403 when updating another user\'s article', async () => {
      const { user } = await createTestUser();
      const { token: otherToken } = await createTestUser();
      const article = await createTestArticle(user.id);

      if (!article) {
        throw new Error('Failed to create test article');
      }

      const response = await request(app.server)
        .patch(`/api/articles/${article.id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ title: 'Updated Title' })
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Forbidden');
    });

    it('should return 404 for a missing article', async () => {
      const { token } = await createTestUser();

      const response = await request(app.server)
        .patch('/api/articles/00000000-0000-4000-8000-000000000000')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated Title' })
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Article not found');
    });
  });

  describe('DELETE /api/articles/:id', () => {
    it('should delete an article as the author', async () => {
      const { user, token } = await createTestUser();
      const article = await createTestArticle(user.id);

      if (!article) {
        throw new Error('Failed to create test article');
      }

      await request(app.server)
        .delete(`/api/articles/${article.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204);

      await request(app.server).get(`/api/articles/${article.slug}`).expect(404);
    });

    it('should return 401 without a token', async () => {
      const { user } = await createTestUser();
      const article = await createTestArticle(user.id);

      if (!article) {
        throw new Error('Failed to create test article');
      }

      const response = await request(app.server)
        .delete(`/api/articles/${article.id}`)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Access token required');
    });

    it('should return 403 when deleting another user\'s article', async () => {
      const { user } = await createTestUser();
      const { token: otherToken } = await createTestUser();
      const article = await createTestArticle(user.id);

      if (!article) {
        throw new Error('Failed to create test article');
      }

      const response = await request(app.server)
        .delete(`/api/articles/${article.id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Forbidden');
    });

    it('should return 404 for a missing article', async () => {
      const { token } = await createTestUser();

      const response = await request(app.server)
        .delete('/api/articles/00000000-0000-4000-8000-000000000000')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Article not found');
    });
  });
});
