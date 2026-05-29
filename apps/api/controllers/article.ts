import { eq } from 'drizzle-orm';
import type { FastifyRequest, FastifyReply } from 'fastify';

import { db } from '@/db/connection.ts';
import { articles } from '@/db/schema.ts';
import { resolveImageUrl, slugify } from '@/utils/index.ts';
import type { CreateArticleBody, UpdateArticleBody } from '@repo/schema-validation';

const articleColumns = { authorId: false } as const;

const withAuthor = {
  author: {
    columns: { password: false }
  }
} as const;

const loadArticleResponseBySlug = async (slug: string) => {
  return db.query.articles.findFirst({
    columns: articleColumns,
    where: eq(articles.slug, slug),
    with: withAuthor
  });
};

const loadArticleResponseById = async (id: string) => {
  return db.query.articles.findFirst({
    columns: articleColumns,
    where: eq(articles.id, id),
    with: withAuthor
  });
};

const allocateUniqueSlug = async (base: string): Promise<string> => {
  const max = 255;

  if (!base) {
    return '';
  }

  const withNumericSuffix = (num: number): string => {
    const suffix = `-${num}`;
    const maxBase = max - suffix.length;
    if (maxBase < 1) {
      return String(num).slice(0, max);
    }
    const trimmed = base.length <= maxBase ? base : base.slice(0, maxBase).replace(/-+$/g, '');
    return `${trimmed}${suffix}`;
  };

  let attempt = 0;
  while (attempt < 10_000) {
    const candidate = attempt === 0 ? base : withNumericSuffix(attempt + 1);

    const clash = await db.query.articles.findFirst({
      columns: { id: true },
      where: eq(articles.slug, candidate)
    });

    if (!clash) {
      return candidate;
    }
    attempt += 1;
  }

  throw new Error('Could not allocate a unique slug');
};

export const getArticles = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const articlesList = await db.query.articles.findMany({
      columns: articleColumns,
      with: withAuthor
    });
    return reply.status(200).send({ articles: articlesList });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ error: 'Failed to get articles' });
  }
};

export const getArticle = async (
  request: FastifyRequest<{ Params: { slug: string } }>,
  reply: FastifyReply
) => {
  try {
    const article = await loadArticleResponseBySlug(request.params.slug);
    return reply.status(200).send({ article });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ error: 'Failed to get article' });
  }
};

export const createArticle = async (request: FastifyRequest, reply: FastifyReply) => {
  const userId = request.user!.id;
  const {
    title,
    content,
    published = false,
    imageUrl: bodyImageUrl
  } = request.body as CreateArticleBody;
  const imageUrl = await resolveImageUrl(request, bodyImageUrl);
  const baseSlug = slugify(title);

  try {
    const slug = await allocateUniqueSlug(baseSlug);

    await db.insert(articles).values({
      title,
      slug,
      content,
      imageUrl,
      published,
      authorId: userId,
      updatedAt: new Date()
    });

    const article = await loadArticleResponseBySlug(slug);
    return reply.status(201).send({ article });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ error: 'Failed to create article' });
  }
};

export const updateArticle = async (request: FastifyRequest, reply: FastifyReply) => {
  const userId = request.user!.id;
  const { id } = request.params as { id: string };
  const updates = { ...(request.body as UpdateArticleBody) };

  if (request.articleImageBuffer || updates.imageUrl !== undefined) {
    updates.imageUrl = await resolveImageUrl(request, updates.imageUrl);
  }

  try {
    const existing = await db.query.articles.findFirst({
      where: eq(articles.id, id)
    });

    if (!existing) {
      return reply.status(404).send({ error: 'Article not found' });
    }

    if (existing.authorId !== userId) {
      return reply.status(403).send({ error: 'Forbidden' });
    }

    const slug = updates.title ? await allocateUniqueSlug(slugify(updates.title)) : existing.slug;

    await db
      .update(articles)
      .set({ ...updates, slug, updatedAt: new Date() })
      .where(eq(articles.id, id));

    const article = await loadArticleResponseById(id);
    return reply.status(200).send({ article });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ error: 'Failed to update article' });
  }
};

export const deleteArticle = async (request: FastifyRequest, reply: FastifyReply) => {
  const userId = request.user!.id;
  const id = (request.params as { id: string }).id;

  try {
    const existing = await db.query.articles.findFirst({
      where: eq(articles.id, id)
    });

    if (!existing) {
      return reply.status(404).send({ error: 'Article not found' });
    }

    if (existing.authorId !== userId) {
      return reply.status(403).send({ error: 'Forbidden' });
    }

    await db.delete(articles).where(eq(articles.id, id));
    return reply.status(204).send();
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ error: 'Failed to delete article' });
  }
};
