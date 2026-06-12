import request from 'supertest';
import { afterEach, describe, expect, it } from 'vitest';

import { serviceApp } from '@/server.ts';
import { cleanupDatabase, createTestUser } from '../helpers/dbHelpers.ts';

const app = await serviceApp();

describe('Authentication Endpoints', () => {
  afterEach(async () => {
    await cleanupDatabase();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user with valid data', async () => {
      const userData = {
        email: `test-${Date.now()}@example.com`,
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User'
      };

      const response = await request(app.server)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should return 400 for invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User'
      };

      const response = await request(app.server)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for short password', async () => {
      const userData = {
        email: `test-${Date.now()}@example.com`,
        password: 'short',
        firstName: 'Test',
        lastName: 'User'
      };

      const response = await request(app.server)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const { user, rawPassword } = await createTestUser({
        email: `test-${Date.now()}@example.com`,
        password: 'TestPassword123!'
      });

      const credentials = {
        email: user.email,
        password: rawPassword
      };

      const response = await request(app.server)
        .post('/api/auth/login')
        .send(credentials)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should return 400 for missing email', async () => {
      const credentials = {
        password: 'TestPassword123!'
      };

      const response = await request(app.server)
        .post('/api/auth/login')
        .send(credentials)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 for invalid credentials', async () => {
      const { user } = await createTestUser();

      const credentials = {
        email: user.email,
        password: 'wrongpassword'
      };

      const response = await request(app.server)
        .post('/api/auth/login')
        .send(credentials)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });
});
