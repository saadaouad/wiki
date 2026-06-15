import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getCookie } from 'cookies-next/client';
import { createElement } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { mutate } from 'swr';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import EditArticle from '@/app/wiki/edit/[slug]/page';
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

function mockEditArticleFetches(
  meResponse: (typeof wikiMock.responses)[keyof typeof wikiMock.responses] = wikiMock.responses
    .meAsAuthor,
  options: { includePatch?: boolean } = {}
) {
  vi.mocked(fetch).mockImplementation((url, requestOptions) => {
    const urlString = url.toString();
    const method = requestOptions?.method ?? 'GET';

    if (urlString.endsWith(`/articles/${wikiMock.slug}`) && method === 'GET') {
      return Promise.resolve({
        ok: true,
        json: async () => wikiMock.responses.article
      } as Response);
    }

    if (urlString.endsWith('/me')) {
      return Promise.resolve({
        ok: true,
        json: async () => meResponse
      } as Response);
    }

    if (
      options.includePatch &&
      urlString.endsWith(`/articles/${wikiMock.articles[0].id}`) &&
      method === 'PATCH'
    ) {
      return Promise.resolve({
        ok: true,
        json: async () => wikiMock.responses.updateSuccess
      } as Response);
    }

    return Promise.reject(new Error(`Unexpected fetch: ${method} ${urlString}`));
  });
}

async function renderEditArticleAsAuthor(
  options: { includePatch?: boolean } = {}
) {
  vi.mocked(getCookie).mockReturnValue('jwt-token');
  mockEditArticleFetches(wikiMock.responses.meAsAuthor, options);

  const meKey = [`${process.env.NEXT_PUBLIC_API_URL}/me`, 'jwt-token'] as const;
  await mutate(meKey, wikiMock.responses.meAsAuthor, { revalidate: false });

  const ui = await EditArticle({ params: Promise.resolve({ slug: wikiMock.slug }) });
  const user = userEvent.setup();

  render(createElement(AuthProvider, null, ui));

  await waitFor(() => {
    expect(screen.getByTestId('wiki-editor-form')).toBeInTheDocument();
  });

  return { user };
}

async function renderEditArticleDenied(
  meResponse?: (typeof wikiMock.responses)[keyof typeof wikiMock.responses]
) {
  if (meResponse) {
    vi.mocked(getCookie).mockReturnValue('jwt-token');
    mockEditArticleFetches(meResponse);
  } else {
    mockEditArticleFetches();
  }

  const ui = await EditArticle({ params: Promise.resolve({ slug: wikiMock.slug }) });
  render(createElement(AuthProvider, null, ui));

  await waitFor(() => {
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
}

describe('Edit article page integration', () => {
  beforeEach(async () => {
    await setupAuthTest();
  });

  it('blocks unauthenticated users and redirects to sign in', async () => {
    await renderEditArticleDenied();

    expect(screen.queryByTestId('wiki-editor-form')).not.toBeInTheDocument();
    expect(useRouter().replace).toHaveBeenCalledWith('/auth/signin');
  });

  it('blocks users who are not the article author and redirects home', async () => {
    await renderEditArticleDenied(wikiMock.responses.meAsOtherUser);

    expect(screen.queryByTestId('wiki-editor-form')).not.toBeInTheDocument();
    expect(useRouter().replace).toHaveBeenCalledWith('/');
  });

  it('fetches the article and renders the edit form with initial values', async () => {
    await renderEditArticleAsAuthor();

    expect(fetch).toHaveBeenCalledWith(
      `${process.env.NEXT_PUBLIC_API_URL}/articles/${wikiMock.slug}`
    );
    expect(screen.getByTestId('wiki-editor-title')).toHaveTextContent('Edit Article');
    expect(screen.getByTestId('wiki-editor-subtitle')).toHaveTextContent(
      `Editing article: ${wikiMock.articles[0].title}`
    );
    expect(screen.getByTestId('title-input')).toHaveValue(wikiMock.articles[0].title);
    expect(screen.getByTestId('content-input')).toHaveValue(wikiMock.articles[0].content);
    expect(screen.getByTestId('submit-button')).toHaveTextContent('Save Article');
    expect(screen.getByTestId('cancel-button')).toBeInTheDocument();
  });

  it('shows validation errors when required fields are cleared', async () => {
    const { user } = await renderEditArticleAsAuthor();

    await user.clear(screen.getByTestId('title-input'));
    await user.clear(screen.getByTestId('content-input'));
    await user.click(screen.getByTestId('submit-button'));

    expect(await screen.findByTestId('title-error')).toHaveTextContent(
      wikiMock.validation.titleRequired
    );
    expect(screen.getByTestId('content-error')).toHaveTextContent(
      wikiMock.validation.contentRequired
    );

    const patchCall = vi
      .mocked(fetch)
      .mock.calls.find(([, options]) => options?.method === 'PATCH');
    expect(patchCall).toBeUndefined();
  });

  it('updates the article and redirects to the article page', async () => {
    const { user } = await renderEditArticleAsAuthor({ includePatch: true });

    await user.clear(screen.getByTestId('title-input'));
    await user.type(screen.getByTestId('title-input'), 'Updated Wiki Guide');
    await user.click(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        `${process.env.NEXT_PUBLIC_API_URL}/articles/${wikiMock.articles[0].id}`,
        expect.objectContaining({
          method: 'PATCH',
          headers: { Authorization: 'Bearer jwt-token' }
        })
      );
    });

    const patchOptions = vi
      .mocked(fetch)
      .mock.calls.find(([, options]) => options?.method === 'PATCH')?.[1];
    expect(patchOptions?.body).toBeInstanceOf(FormData);

    const formData = patchOptions?.body as FormData;
    expect(formData.get('title')).toBe('Updated Wiki Guide');
    expect(formData.get('content')).toBe(wikiMock.articles[0].content);

    expect(toast.success).toHaveBeenCalledWith(wikiMock.messages.updateSuccess);
    expect(useRouter().push).toHaveBeenCalledWith(`/wiki/${wikiMock.slug}`);
  });
});
