import { screen, waitFor } from '@testing-library/react';
import { getCookie } from 'cookies-next/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import Home from '@/app/page';
import { authMock, mockFetchResponse, setupAuthTest } from '@/mocks/auth.mock';
import { homeMock } from '@/mocks/home.mock';
import { renderWithProviders } from '@/tests/helpers/renderWithProviders';

async function renderHome() {
  const ui = await Home();
  const result = await renderWithProviders(ui);

  await waitFor(() => {
    expect(screen.getByTestId('articles-list')).toBeInTheDocument();
  });

  return result;
}

describe('Home page integration', () => {
  beforeEach(async () => {
    await setupAuthTest();
  });

  it('fetches and renders articles from the API', async () => {
    mockFetchResponse(homeMock.responses.articles);

    await renderHome();

    expect(fetch).toHaveBeenCalledWith(`${process.env.NEXT_PUBLIC_API_URL}/articles`, {
      cache: 'no-cache'
    });
    expect(screen.getAllByTestId('article-card')).toHaveLength(homeMock.articles.length);
    expect(screen.getByText('Getting Started with Wiki')).toBeInTheDocument();
    expect(screen.getByText('Advanced Tips')).toBeInTheDocument();
  });

  it('renders article author and read links', async () => {
    mockFetchResponse(homeMock.responses.articles);

    await renderHome();

    expect(screen.getByText('By Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('By John Smith')).toBeInTheDocument();

    const links = screen.getAllByTestId('article-link');
    expect(links[0]).toHaveAttribute('href', '/wiki/getting-started');
    expect(links[1]).toHaveAttribute('href', '/wiki/advanced-tips');
  });

  it('renders an empty list when there are no articles', async () => {
    mockFetchResponse(homeMock.responses.emptyArticles);

    await renderHome();

    expect(screen.getByTestId('articles-list')).toBeEmptyDOMElement();
    expect(screen.queryByTestId('article-card')).not.toBeInTheDocument();
  });

  it('does not show the new article button when unauthenticated', async () => {
    mockFetchResponse(homeMock.responses.articles);

    await renderHome();

    expect(screen.queryByTestId('new-article')).not.toBeInTheDocument();
  });

  it('shows the new article button when authenticated', async () => {
    vi.mocked(getCookie).mockReturnValue('jwt-token');
    mockFetchResponse(homeMock.responses.articles);
    const ui = await Home();
    mockFetchResponse(authMock.responses.me);

    await renderWithProviders(ui);

    await waitFor(() => {
      expect(screen.getByTestId('new-article')).toBeInTheDocument();
    });

    expect(screen.getByTestId('new-article-link')).toHaveAttribute('href', 'wiki/new');
    expect(screen.getByRole('button', { name: /new article/i })).toBeInTheDocument();
  });
});
