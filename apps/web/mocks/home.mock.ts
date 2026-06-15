export const homeMock = {
  articles: [
    {
      id: 'article-1',
      title: 'Getting Started with Wiki',
      slug: 'getting-started',
      content: 'This is the full article content for getting started.',
      summary: 'A short summary of getting started.',
      createdAt: '2024-03-15T12:00:00.000Z',
      author: {
        id: 'user-1',
        email: 'jane@example.com',
        firstName: 'Jane',
        lastName: 'Doe',
        createdAt: '2024-01-01T00:00:00.000Z'
      }
    },
    {
      id: 'article-2',
      title: 'Advanced Tips',
      slug: 'advanced-tips',
      content: 'Full content without a summary field.',
      createdAt: '2024-04-20T08:30:00.000Z',
      author: {
        id: 'user-2',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Smith',
        createdAt: '2024-01-01T00:00:00.000Z'
      }
    }
  ],
  responses: {
    articles: {
      articles: [
        {
          id: 'article-1',
          title: 'Getting Started with Wiki',
          slug: 'getting-started',
          content: 'This is the full article content for getting started.',
          summary: 'A short summary of getting started.',
          createdAt: '2024-03-15T12:00:00.000Z',
          author: {
            id: 'user-1',
            email: 'jane@example.com',
            firstName: 'Jane',
            lastName: 'Doe',
            createdAt: '2024-01-01T00:00:00.000Z'
          }
        },
        {
          id: 'article-2',
          title: 'Advanced Tips',
          slug: 'advanced-tips',
          content: 'Full content without a summary field.',
          createdAt: '2024-04-20T08:30:00.000Z',
          author: {
            id: 'user-2',
            email: 'john@example.com',
            firstName: 'John',
            lastName: 'Smith',
            createdAt: '2024-01-01T00:00:00.000Z'
          }
        }
      ]
    },
    emptyArticles: { articles: [] }
  }
} as const;
