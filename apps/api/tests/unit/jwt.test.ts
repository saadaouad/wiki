import { createSecretKey } from 'node:crypto';
import { decodeProtectedHeader, SignJWT } from 'jose';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { env } from '@/env.ts';
import { generateToken, verifyToken } from '@/utils/index.ts';

describe('generateToken', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-15T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns a compact JWS with HS256', async () => {
    const token = await generateToken({
      id: 'user-1',
      email: 'user@example.com',
      username: 'testuser'
    });

    expect(token.split('.')).toHaveLength(3);
    expect(decodeProtectedHeader(token).alg).toBe('HS256');
  });

  it('embeds payload claims and expiry from JWT_EXPIRES_IN', async () => {
    const payload = {
      id: 'user-1',
      email: 'user@example.com',
      username: 'testuser'
    };

    const token = await generateToken(payload);
    const decoded = await verifyToken(token);

    expect(decoded).toMatchObject(payload);
    expect(decoded.iat).toBe(Math.floor(Date.now() / 1000));
    expect(decoded.exp).toBe(decoded.iat! + 2 * 60 * 60);
  });
});

describe('verifyToken', () => {
  const secretKey = createSecretKey(env.JWT_SECRET, 'utf-8');

  it('resolves with the payload for a valid token', async () => {
    const payload = {
      id: 'user-1',
      email: 'user@example.com',
      username: 'testuser'
    };

    const token = await generateToken(payload);

    await expect(verifyToken(token)).resolves.toMatchObject(payload);
  });

  it('rejects when the token was signed with a different secret', async () => {
    const otherKey = createSecretKey('y'.repeat(32), 'utf-8');
    const token = await new SignJWT({
      id: 'user-1',
      email: 'user@example.com',
      username: 'testuser'
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('2h')
      .sign(otherKey);

    await expect(verifyToken(token)).rejects.toThrow();
  });

  it('rejects expired tokens', async () => {
    const nowSec = Math.floor(Date.now() / 1000);
    const token = await new SignJWT({
      id: 'user-1',
      email: 'user@example.com',
      username: 'testuser'
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt(nowSec - 120)
      .setExpirationTime(nowSec - 60)
      .sign(secretKey);

    await expect(verifyToken(token)).rejects.toThrow();
  });

  it('rejects malformed tokens', async () => {
    await expect(verifyToken('not-a-valid-jwt')).rejects.toThrow();
  });
});
