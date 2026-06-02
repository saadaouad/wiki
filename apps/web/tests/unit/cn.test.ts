import { describe, expect, it } from 'vitest';

import { cn } from '@/utils/index';

describe('cn', () => {
  it('combines class names and skips falsy values', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
  });

  it('lets the last conflicting Tailwind utility win', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });
});
