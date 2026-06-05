import { describe, expect, it } from 'vitest';

import { createListCache } from '@/utils/list-cache.ts';

describe('createListCache', () => {
  it('builds a versioned cache key for the namespace', () => {
    const cache = createListCache('articles');

    expect(cache.cacheKey(2, 12, 5)).toBe('articles:v5:p2:l12');
  });
});
