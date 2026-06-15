import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getCookie } from 'cookies-next/client';
import { createElement } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { mutate } from 'swr';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import NewArticle from '@/app/wiki/new/page';
import { AuthProvider } from '@/providers/authentication';
import { setupAuthTest } from '@/mocks/auth.mock';
import { wikiMock } from '@/mocks/wiki.mock';

vi.mock('@uiw/react-md-editor', () => ({
  default: (props: { value?: string; onChange?: (value: string) => void }) =>
    createElement('textarea', {
      'data-testid': 'content-input',
      value: props.value,
      onChange: (event: Event & { currentTarget: HTMLTextAreaElement }) =>
        props.onChange?.(event.currentTarget.value)
    })
}));

function mockNewArticleFetches(options: { includePost?: boolean } = {}) {
  vi.mocked(fetch).mockImplementation((url, requestOptions) => {
    const urlString = url.toString();
    const method = requestOptions?.method ?? 'GET';

    if (urlString.endsWith('/me')) {
      return Promise.resolve({
        ok: true,
        json: async () => wikiMock.responses.meAsAuthor
      } as Response);
    }

    if (options.includePost && urlString.endsWith('/articles') && method === 'POST') {
      return Promise.resolve({
        ok: true,
        json: async () => wikiMock.responses.createSuccess
      } as Response);
    }

    return Promise.reject(new Error(`Unexpected fetch: ${method} ${urlString}`));
  });
}

async function renderNewArticleAsAuthenticated(options: { includePost?: boolean } = {}) {
  vi.mocked(getCookie).mockReturnValue('jwt-token');
  mockNewArticleFetches(options);

  const meKey = [`${process.env.NEXT_PUBLIC_API_URL}/me`, 'jwt-token'] as const;
  await mutate(meKey, wikiMock.responses.meAsAuthor, { revalidate: false });

  const user = userEvent.setup();

  render(createElement(AuthProvider, null, createElement(NewArticle)));

  await waitFor(() => {
    expect(screen.getByTestId('wiki-editor-form')).toBeInTheDocument();
  });

  return { user };
}

async function renderNewArticleUnauthenticated() {
  render(createElement(AuthProvider, null, createElement(NewArticle)));

  await waitFor(() => {
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
}

describe('New article page integration', () => {
  beforeEach(async () => {
    await setupAuthTest();
  });

  it('blocks unauthenticated users and redirects to sign in', async () => {
    await renderNewArticleUnauthenticated();

    expect(screen.queryByTestId('wiki-editor-form')).not.toBeInTheDocument();
    expect(useRouter().replace).toHaveBeenCalledWith('/auth/signin');
  });

  it('renders the create form with empty initial values', async () => {
    await renderNewArticleAsAuthenticated();

    expect(screen.getByTestId('wiki-editor-title')).toHaveTextContent('Create New Article');
    expect(screen.queryByTestId('wiki-editor-subtitle')).not.toBeInTheDocument();
    expect(screen.getByTestId('title-input')).toHaveValue('');
    expect(screen.getByTestId('content-input')).toHaveValue('');
    expect(screen.getByTestId('submit-button')).toHaveTextContent('Save Article');
    expect(screen.getByTestId('cancel-button')).toBeInTheDocument();
  });

  it('shows validation errors when required fields are empty', async () => {
    const { user } = await renderNewArticleAsAuthenticated();

    await user.click(screen.getByTestId('submit-button'));

    expect(await screen.findByTestId('title-error')).toHaveTextContent(
      wikiMock.validation.titleRequired
    );
    expect(screen.getByTestId('content-error')).toHaveTextContent(
      wikiMock.validation.contentRequired
    );

    const postCall = vi.mocked(fetch).mock.calls.find(([, options]) => options?.method === 'POST');
    expect(postCall).toBeUndefined();
  });

  it('creates the article and redirects to the article page', async () => {
    const { user } = await renderNewArticleAsAuthenticated({ includePost: true });

    await user.type(screen.getByTestId('title-input'), wikiMock.articles[1].title);
    await user.type(screen.getByTestId('content-input'), wikiMock.articles[1].content);
    await user.click(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        `${process.env.NEXT_PUBLIC_API_URL}/articles`,
        expect.objectContaining({
          method: 'POST',
          headers: { Authorization: 'Bearer jwt-token' }
        })
      );
    });

    const postOptions = vi
      .mocked(fetch)
      .mock.calls.find(([, options]) => options?.method === 'POST')?.[1];
    expect(postOptions?.body).toBeInstanceOf(FormData);

    const formData = postOptions?.body as FormData;
    expect(formData.get('title')).toBe(wikiMock.articles[1].title);
    expect(formData.get('content')).toBe(wikiMock.articles[1].content);

    expect(toast.success).toHaveBeenCalledWith(wikiMock.messages.createSuccess);
    expect(useRouter().push).toHaveBeenCalledWith(`/wiki/${wikiMock.articles[1].slug}`);
  });
});
