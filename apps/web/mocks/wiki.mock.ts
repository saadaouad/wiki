import { userMock } from './user.mock';

const article = {
  id: 'article-1',
  title: 'Getting Started with Wiki',
  slug: 'getting-started',
  content: 'Welcome to the wiki.\n\nThis is the article body.',
  summary: 'A short summary of getting started.',
  createdAt: '2024-03-15T12:00:00.000Z',
  articleView: 42,
  author: userMock.users[0]
} as const;

const updatedArticle = {
  ...article,
  title: 'Updated Wiki Guide',
  content: 'Updated article content.'
};

export const wikiMock = {
  slug: article.slug,
  article,
  responses: {
    article: { article },
    meAsAuthor: { user: userMock.users[0] },
    meAsOtherUser: { user: userMock.users[1] },
    updateSuccess: { article: updatedArticle }
  },
  validation: {
    titleRequired: 'Title is required',
    contentRequired: 'Content is required'
  },
  messages: {
    updateSuccess: 'Article updated successfully!'
  }
} as const;
