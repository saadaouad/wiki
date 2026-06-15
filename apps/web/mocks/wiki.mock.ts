export const wikiMock = {
  slug: 'getting-started',
  article: {
    id: 'article-1',
    title: 'Getting Started with Wiki',
    slug: 'getting-started',
    content: 'Welcome to the wiki.\n\nThis is the article body.',
    summary: 'A short summary of getting started.',
    createdAt: '2024-03-15T12:00:00.000Z',
    articleView: 42,
    author: {
      id: 'user-1',
      email: 'jane@example.com',
      firstName: 'Jane',
      lastName: 'Doe',
      createdAt: '2024-01-01T00:00:00.000Z'
    }
  },
  responses: {
    article: {
      article: {
        id: 'article-1',
        title: 'Getting Started with Wiki',
        slug: 'getting-started',
        content: 'Welcome to the wiki.\n\nThis is the article body.',
        summary: 'A short summary of getting started.',
        createdAt: '2024-03-15T12:00:00.000Z',
        articleView: 42,
        author: {
          id: 'user-1',
          email: 'jane@example.com',
          firstName: 'Jane',
          lastName: 'Doe',
          createdAt: '2024-01-01T00:00:00.000Z'
        }
      }
    },
    meAsAuthor: {
      user: {
        id: 'user-1',
        email: 'jane@example.com',
        firstName: 'Jane',
        lastName: 'Doe',
        createdAt: '2024-01-01T00:00:00.000Z'
      }
    },
    meAsOtherUser: {
      user: {
        id: 'user-2',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Smith',
        createdAt: '2024-01-01T00:00:00.000Z'
      }
    }
  }
} as const;
