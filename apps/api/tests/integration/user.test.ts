import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { serviceApp } from '@/server.ts';
import { cleanupDatabase, createTestUser } from '../helpers/dbHelpers.ts';

vi.mock('@/lib/redis.ts', () => ({
  redis: {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue('OK'),
    del: vi.fn().mockResolvedValue(1),
    incr: vi.fn().mockResolvedValue(1)
  }
}));

const app = await serviceApp();

describe('User Endpoints', () => {
  afterEach(async () => {
    await cleanupDatabase();
  });

  describe('GET /api/me', () => {
    it('should return the authenticated user profile', async () => {
      const { user, token } = await createTestUser();

      const response = await request(app.server)
        .get('/api/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toMatchObject({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      });
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should return 401 without a token', async () => {
      const response = await request(app.server).get('/api/me').expect(401);

      expect(response.body).toHaveProperty('error', 'Access token required');
    });

    it('should return 401 for an invalid token', async () => {
      const response = await request(app.server)
        .get('/api/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid or expired token');
    });
  });
});
