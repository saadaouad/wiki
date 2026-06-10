import { describe, expect, it, vi } from 'vitest';

import { createListCache, pageView } from '@/utils/index.ts';

const incr = vi.fn();

vi.mock('@/lib/redis.ts', () => ({
  redis: { incr: (...args: unknown[]) => incr(...args) }
}));

describe('createListCache', () => {
  it('builds a versioned cache key for the namespace', () => {
    const cache = createListCache('articles');

    expect(cache.cacheKey(2, 12, 5)).toBe('articles:v5:p2:l12');
  });
});

describe('pageView', () => {
  it('increments the key and returns the count', async () => {
    incr.mockResolvedValue(3);

    await expect(pageView('pageviews:article:abc')).resolves.toBe(3);
    expect(incr).toHaveBeenCalledWith('pageviews:article:abc');
  });
});
