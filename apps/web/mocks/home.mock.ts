import { userMock } from './user.mock';

const gettingStartedArticle = {
  id: 'article-1',
  title: 'Getting Started with Wiki',
  slug: 'getting-started',
  content: 'This is the full article content for getting started.',
  summary: 'A short summary of getting started.',
  createdAt: '2024-03-15T12:00:00.000Z',
  author: userMock.users[0]
} as const;

const advancedTipsArticle = {
  id: 'article-2',
  title: 'Advanced Tips',
  slug: 'advanced-tips',
  content: 'Full content without a summary field.',
  createdAt: '2024-04-20T08:30:00.000Z',
  author: userMock.users[1]
} as const;

const articles = [gettingStartedArticle, advancedTipsArticle] as const;

export const homeMock = {
  articles,
  responses: {
    articles: { articles },
    emptyArticles: { articles: [] }
  }
} as const;
