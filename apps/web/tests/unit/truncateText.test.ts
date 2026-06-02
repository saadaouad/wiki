import { describe, expect, it } from 'vitest';

import { truncateText } from '@/utils/index';

describe('truncateText', () => {
  it('returns short text unchanged', () => {
    const text = 'a'.repeat(200);
    expect(truncateText(text)).toBe(text);
  });
});
