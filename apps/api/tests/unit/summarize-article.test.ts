import { beforeEach, describe, expect, it, vi } from 'vitest';

import { summarizeArticle } from '@/utils/summarize-article.ts';

const mockFetch = vi.fn<typeof fetch>();

beforeEach(() => {
  mockFetch.mockReset();
  vi.stubGlobal('fetch', mockFetch);
  vi.stubEnv('OPENROUTER_API_KEY', 'test-key');
  vi.stubEnv('OPENROUTER_MODEL', 'test-model');
});

describe('summarizeArticle', () => {
  it('rejects empty article content', async () => {
    await expect(summarizeArticle('Title', '   ')).rejects.toThrow(
      'Article content is required to generate a summary.'
    );
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('returns a trimmed summary', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: '  A short summary.  ' } }]
      })
    } as Response);

    expect(await summarizeArticle('My Page', 'Article body')).toBe('A short summary.');
  });

  it('throws on non-ok OpenRouter response', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 502,
      text: async () => 'bad gateway'
    } as Response);

    await expect(summarizeArticle('Title', 'content')).rejects.toThrow(
      'OpenRouter error 502: bad gateway'
    );
  });

  it('throws when OpenRouter returns an empty summary', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: '   ' } }] })
    } as Response);

    await expect(summarizeArticle('Title', 'content')).rejects.toThrow(
      'OpenRouter returned an empty summary'
    );
  });
});
