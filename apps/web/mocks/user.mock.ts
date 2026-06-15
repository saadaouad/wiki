export const userMock = {
  users: [
    {
      id: 'user-1',
      email: 'jane@example.com',
      firstName: 'Jane',
      lastName: 'Doe',
      createdAt: '2024-01-01T00:00:00.000Z'
    },
    {
      id: 'user-2',
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Smith',
      createdAt: '2024-01-01T00:00:00.000Z'
    }
  ]
} as const;
