import { userMock } from './user.mock';

const { users } = userMock;

const articles = [
  {
    id: 'article-1',
    title: 'Getting Started with Wiki',
    slug: 'getting-started',
    content: 'Welcome to the wiki.\n\nThis is the article body.',
    summary: 'A short summary of getting started.',
    createdAt: '2024-03-15T12:00:00.000Z',
    articleView: 42,
    author: users[0]
  },
  {
    id: 'article-new',
    title: 'New Wiki Guide',
    slug: 'new-wiki-guide',
    content: 'Brand new article content.',
    summary: 'A brand new article.',
    createdAt: '2024-06-15T12:00:00.000Z',
    articleView: 0,
    author: users[0]
  }
] as const;

const updatedArticle = {
  ...articles[0],
  title: 'Updated Wiki Guide',
  content: 'Updated article content.'
};

export const wikiMock = {
  articles,
  slug: articles[0].slug,
  responses: {
    article: { article: articles[0] },
    meAsAuthor: { user: users[0] },
    meAsOtherUser: { user: users[1] },
    updateSuccess: { article: updatedArticle },
    createSuccess: { article: articles[1] }
  },
  validation: {
    titleRequired: 'Title is required',
    contentRequired: 'Content is required'
  },
  messages: {
    updateSuccess: 'Article updated successfully!',
    createSuccess: 'Article created successfully!'
  }
} as const;
