import { describe, expect, it, vi } from 'vitest';

import { pageView } from '@/utils/page-view.ts';

const incr = vi.fn();

vi.mock('@/lib/redis.ts', () => ({
  redis: { incr: (...args: unknown[]) => incr(...args) }
}));

describe('pageView', () => {
  it('increments the key and returns the count', async () => {
    incr.mockResolvedValue(3);

    await expect(pageView('pageviews:article:abc')).resolves.toBe(3);
    expect(incr).toHaveBeenCalledWith('pageviews:article:abc');
  });
});
