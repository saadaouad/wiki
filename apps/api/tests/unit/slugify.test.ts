import { describe, expect, it } from 'vitest';

import { slugify } from '@/utils/slugify.ts';

describe('slugify', () => {
  it('lowercases, trims, and uses hyphens between words', () => {
    expect(slugify('  Hello Wiki World  ')).toBe('hello-wiki-world');
  });

  it('collapses separators and strips edge punctuation', () => {
    expect(slugify('Foo!!!Bar')).toBe('foo-bar');
    expect(slugify('-x-y-')).toBe('x-y');
  });

  it('returns empty string when no alphanumeric characters remain', () => {
    expect(slugify('')).toBe('');
    expect(slugify('   ---   ')).toBe('');
  });
});
