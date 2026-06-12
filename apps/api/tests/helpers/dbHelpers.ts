import { db } from '@/db/connection.ts';
import { users, articles } from '@/db/schema.ts';
import type { NewArticle, NewUser } from '@/db/schema.ts';
import { hashPassword, generateToken, slugify } from '@/utils/index.ts';

export async function createTestUser(userData: Partial<NewUser> = {}) {
  const defaultData = {
    email: `test-${Date.now()}-${Math.random()}@example.com`,
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User',
    ...userData
  };

  const hashedPassword = await hashPassword(defaultData.password);
  const [user] = await db
    .insert(users)
    .values({
      ...defaultData,
      password: hashedPassword
    })
    .returning();

  if (!user) {
    throw new Error('Failed to create test user');
  }

  const token = await generateToken({
    id: user.id,
    email: user.email
  });

  return { user, token, rawPassword: defaultData.password };
}

export async function createTestArticle(
  authorId: string,
  articleData: Partial<Omit<NewArticle, 'authorId'>> = {}
) {
  const title = articleData.title ?? `Test Article ${Date.now()}`;
  const defaultData = {
    title,
    slug: slugify(`${title}-${Math.random()}`),
    content: 'Test article content',
    ...articleData
  };

  const [article] = await db
    .insert(articles)
    .values({
      ...defaultData,
      authorId
    })
    .returning();

  return article;
}

export async function cleanupDatabase() {
  await db.delete(articles);
  await db.delete(users);
}
