import { screen, waitFor } from '@testing-library/react';
import { getCookie } from 'cookies-next/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ViewArticle from '@/app/wiki/[slug]/page';
import { mockFetchResponse, setupAuthTest } from '@/mocks/auth.mock';
import { wikiMock } from '@/mocks/wiki.mock';
import { renderWithProviders } from '@/tests/helpers/renderWithProviders';

async function renderViewArticle(slug = wikiMock.slug) {
  mockFetchResponse(wikiMock.responses.article);

  const ui = await ViewArticle({ params: Promise.resolve({ slug }) });
  const result = await renderWithProviders(ui);

  await waitFor(() => {
    expect(screen.getByTestId('article-viewer')).toBeInTheDocument();
  });

  return result;
}

async function renderViewArticleAsUser(
  meResponse: (typeof wikiMock.responses)[keyof typeof wikiMock.responses],
  slug = wikiMock.slug
) {
  vi.mocked(getCookie).mockReturnValue('jwt-token');
  mockFetchResponse(wikiMock.responses.article);
  const ui = await ViewArticle({ params: Promise.resolve({ slug }) });
  mockFetchResponse(meResponse);

  await renderWithProviders(ui);

  await waitFor(() => {
    expect(screen.getByTestId('article-viewer')).toBeInTheDocument();
  });
}

describe('View article page integration', () => {
  beforeEach(async () => {
    await setupAuthTest();
  });

  it('fetches and renders the article from the API', async () => {
    await renderViewArticle();

    expect(fetch).toHaveBeenCalledWith(
      `${process.env.NEXT_PUBLIC_API_URL}/articles/${wikiMock.slug}`,
      { cache: 'no-cache' }
    );
    expect(screen.getByTestId('article-title')).toHaveTextContent(wikiMock.articles[0].title);
    expect(screen.getByTestId('article-author')).toHaveTextContent('By Jane Doe');
    expect(screen.getByTestId('article-view-count')).toHaveTextContent(/42/);
    expect(screen.getByTestId('article-view-count')).toHaveTextContent(/views/);
  });

  it('renders breadcrumb and back navigation links', async () => {
    await renderViewArticle();

    expect(screen.getByTestId('article-home-link')).toHaveAttribute('href', '/');
    expect(screen.getByTestId('back-to-articles-link')).toHaveAttribute('href', '/');
    expect(screen.getByRole('button', { name: /back to articles/i })).toBeInTheDocument();
  });

  it('renders markdown article content', async () => {
    await renderViewArticle();

    await waitFor(() => {
      expect(screen.getByTestId('article-content')).toHaveTextContent('Welcome to the wiki.');
      expect(screen.getByTestId('article-content')).toHaveTextContent('This is the article body.');
    });
  });

  it('hides author actions when unauthenticated', async () => {
    await renderViewArticle();

    expect(screen.queryByTestId('article-author-actions')).not.toBeInTheDocument();
    expect(screen.queryByTestId('article-footer-actions')).not.toBeInTheDocument();
    expect(screen.queryByTestId('edit-article-link')).not.toBeInTheDocument();
    expect(screen.queryByTestId('delete-article-button')).not.toBeInTheDocument();
  });

  it('shows edit and delete actions when authenticated as the author', async () => {
    await renderViewArticleAsUser(wikiMock.responses.meAsAuthor);

    await waitFor(() => {
      expect(screen.getByTestId('article-author-actions')).toBeInTheDocument();
    });

    expect(screen.getByTestId('edit-article-link')).toHaveAttribute(
      'href',
      `/wiki/edit/${wikiMock.slug}`
    );
    expect(screen.getByTestId('edit-this-article-link')).toHaveAttribute(
      'href',
      `/wiki/edit/${wikiMock.slug}`
    );
    expect(screen.getAllByTestId('delete-article-button')).toHaveLength(2);
    expect(screen.getByRole('button', { name: /^edit article$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /edit this article/i })).toBeInTheDocument();
  });

  it('hides author actions when authenticated as a different user', async () => {
    await renderViewArticleAsUser(wikiMock.responses.meAsOtherUser);

    expect(screen.queryByTestId('article-author-actions')).not.toBeInTheDocument();
    expect(screen.queryByTestId('article-footer-actions')).not.toBeInTheDocument();
  });
});
