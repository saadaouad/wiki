import { describe, expect, it } from 'vitest';

import { isDuplicateKeyError } from '@/utils/duplicate-key-error';

describe('isDuplicateKeyError', () => {
  it('detects unique violations on the error or its cause', () => {
    expect(
      isDuplicateKeyError({ code: '23505', constraint: 'users_email_unique' }, 'users_email_unique')
    ).toBe(true);
    expect(
      isDuplicateKeyError(
        { cause: { code: '23505', constraint: 'users_email_unique' } },
        'users_email_unique'
      )
    ).toBe(true);
  });

  it('rejects other errors and constraint mismatches', () => {
    expect(isDuplicateKeyError({ code: '23503' })).toBe(false);
    expect(
      isDuplicateKeyError(
        { code: '23505', constraint: 'articles_slug_unique' },
        'users_email_unique'
      )
    ).toBe(false);
  });
});
