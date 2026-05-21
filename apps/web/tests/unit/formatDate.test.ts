import { describe, expect, it, vi } from 'vitest';

import { formatDate } from '@/utils/formatDate.ts';

describe('formatDate', () => {
  it('calls toLocaleDateString with en-US and long month style', () => {
    const spy = vi.spyOn(Date.prototype, 'toLocaleDateString');

    formatDate('2024-01-15T00:00:00.000Z');

    expect(spy).toHaveBeenCalledWith('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  });

  it('returns whatever toLocaleDateString produces', () => {
    vi.spyOn(Date.prototype, 'toLocaleDateString').mockReturnValue('March 15, 2024');

    expect(formatDate('2024-03-15T12:00:00.000Z')).toBe('March 15, 2024');
  });
});
