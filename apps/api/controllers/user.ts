import { eq } from 'drizzle-orm';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { db } from '@/db/connection.ts';
import { articles, users } from '@/db/schema.ts';
import { generateToken } from '@/utils/index.ts';
import { redis } from '@/lib/redis.ts';
import type { User } from '@/types/user.ts';

const userMeCacheKey = (userId: string) => `user:me:${userId}`;

export const invalidateUserCaches = async (userId: string) => {
  const authorArticles = await db.query.articles.findMany({
    columns: { slug: true },
    where: eq(articles.authorId, userId)
  });

  const articleKeys = authorArticles.map((article) => `article:${article.slug}`);

  await Promise.all([
    redis.del(userMeCacheKey(userId)),
    redis.del('articles'),
    articleKeys.length > 0 ? redis.del(...articleKeys) : Promise.resolve(0)
  ]);
};

export const me = async (request: FastifyRequest, reply: FastifyReply) => {
  const userId = request.user!.id;
  const cacheKey = userMeCacheKey(userId);

  try {
    let profile = await redis.get<User>(cacheKey);

    if (!profile) {
      const user = await db.query.users.findFirst({
        columns: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          createdAt: true
        },
        where: eq(users.id, userId)
      });
      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
      }
      profile = user;
      await redis.set(cacheKey, profile, { ex: 60 });
    }
    const token = await generateToken({
      id: profile.id,
      email: profile.email
    });
    return reply.status(200).send({
      user: profile,
      token
    });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({
      error: 'Failed to load user'
    });
  }
};
