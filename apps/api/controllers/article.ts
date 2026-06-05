import { count, desc, eq } from 'drizzle-orm';
import type { FastifyRequest, FastifyReply } from 'fastify';

import { redis } from '@/lib/index.ts';
import { db } from '@/db/connection.ts';
import { articles } from '@/db/schema.ts';
import { createListCache } from '@/utils/list-cache.ts';
import { resolveImageUrl, slugify, pageView, summarizeArticle } from '@/utils/index.ts';
import type { CreateArticleBody, ListArticlesQuery, UpdateArticleBody } from '@repo/schema-validation';

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

  if (!base)  {
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

const invalidateArticleCaches = (...slugs: string[]) => {
  const keys = [...new Set(slugs.filter(Boolean))].map((slug) => `article:${slug}`);

  return Promise.all([
    createListCache('articles').bumpVersion(),
    keys.length > 0 ? redis.del(...keys) : Promise.resolve(0)
  ]);
};

// Get articles
export const getArticles = async (
  request: FastifyRequest<{ Querystring: ListArticlesQuery }>,
  reply: FastifyReply
) => {
  try {
    const { page, limit } = request.query;
    const cacheVersion = await createListCache('articles').getVersion();
    const cacheKey = createListCache('articles').cacheKey(page, limit, cacheVersion);

    let response = await redis.get(cacheKey);

    if (!response) {
      const offset = (page - 1) * limit;

      const [articlesList, totalResult] = await Promise.all([
        db.query.articles.findMany({
          columns: articleColumns,
          with: withAuthor,
          orderBy: desc(articles.createdAt),
          limit,
          offset
        }),
        db.select({ value: count() }).from(articles)
      ]);

      const total = totalResult[0]?.value ?? 0;
      const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

      response = {
        articles: articlesList,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasMore: page < totalPages
        }
      };

      await redis.set(cacheKey, response, { ex: 60 });
    }

    return reply.status(200).send(response);
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ error: 'Failed to get articles' });
  }
};

// Get article
export const getArticle = async (
  request: FastifyRequest<{ Params: { slug: string } }>,
  reply: FastifyReply
) => {
  try {
    const slug = request.params.slug;
    let article = await redis.get(`article:${slug}`);

    if (!article) {
      article = await loadArticleResponseBySlug(slug);
      if (!article) {
        return reply.status(404).send({ error: 'Article not found' });
      }
      await redis.set(`article:${slug}`, article, { ex: 60 });
    }

    return reply.status(200).send({
      article: {
        ...article,
        articleView: await pageView(`pageviews:article:${(article as { id: string }).id}`)
      }
    });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ error: 'Failed to get article' });
  }
};

// Create article
export const createArticle = async (request: FastifyRequest, reply: FastifyReply) => {
  const userId = request.user!.id;
  const { title, content, imageUrl: bodyImageUrl } = request.body as CreateArticleBody;
  const imageUrl = await resolveImageUrl(request, bodyImageUrl);
  const baseSlug = slugify(title);

  try {
    const slug = await allocateUniqueSlug(baseSlug);
    const summary = await summarizeArticle(title, content);

    await db.insert(articles).values({
      title,
      slug,
      content,
      summary,
      imageUrl,
      authorId: userId,
      updatedAt: new Date()
    });

    await invalidateArticleCaches(slug);

    const article = await loadArticleResponseBySlug(slug);
    return reply.status(201).send({ article });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ error: 'Failed to create article' });
  }
};

// Update article
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
    const shouldRefreshSummary = updates.content !== undefined || updates.title !== undefined;

    await db
      .update(articles)
      .set({
        ...updates,
        slug,
        updatedAt: new Date(),
        ...(shouldRefreshSummary && {
          summary: await summarizeArticle(
            updates.title ?? existing.title,
            updates.content ?? existing.content
          )
        })
      })
      .where(eq(articles.id, id));

    await invalidateArticleCaches(existing.slug, slug);

    const article = await loadArticleResponseById(id);
    return reply.status(200).send({ article });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ error: 'Failed to update article' });
  }
};

// Delete article
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
    await invalidateArticleCaches(existing.slug);
    return reply.status(204).send();
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ error: 'Failed to delete article' });
  }
};
