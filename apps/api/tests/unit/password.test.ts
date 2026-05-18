import { describe, expect, it, vi } from 'vitest';

import { comparePasswords, hashPassword } from '@/utils/index.ts';

vi.mock('@/env.ts', () => ({
  env: {
    BCRYPT_ROUNDS: 10
  },
  default: {
    BCRYPT_ROUNDS: 10
  }
}));

describe('hashPassword', () => {
  it('returns a bcrypt hash string', async () => {
    const hash = await hashPassword('correct-horse-battery-staple');

    expect(hash).toMatch(/^\$2[aby]\$\d{2}\$/);
    expect(hash.length).toBeGreaterThan(50);
  });

  it('returns different hashes for the same password (salt)', async () => {
    const password = 'same-input';
    const [a, b] = await Promise.all([hashPassword(password), hashPassword(password)]);

    expect(a).not.toBe(b);
  });
});

describe('comparePasswords', () => {
  it('resolves true when the password matches the hash', async () => {
    const password = 'secret-value';
    const hash = await hashPassword(password);

    await expect(comparePasswords(password, hash)).resolves.toBe(true);
  });

  it('resolves false when the password does not match', async () => {
    const hash = await hashPassword('original');

    await expect(comparePasswords('wrong-guess', hash)).resolves.toBe(false);
  });

  it('resolves false for a malformed hash', async () => {
    await expect(comparePasswords('any', 'not-a-valid-bcrypt-hash')).resolves.toBe(false);
  });
});
