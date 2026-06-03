import { z } from 'zod';

const title = z
  .string()
  .trim()
  .min(1, 'Title is required')
  .max(255, 'Title must be at most 255 characters');

const content = z.string().min(1, 'Content is required');

const imageUrl = z
  .union([z.string().trim().url(), z.literal('')])
  .transform((value) => (value === '' ? null : value))
  .nullable()
  .optional();

export const createArticleSchema = z.object({
  title,
  content,
  imageUrl
});

export const updateArticleFieldsSchema = z.object({
  title,
  content,
  imageUrl
}).partial();

export const updateArticleSchema = updateArticleFieldsSchema.refine(
  (body) => Object.values(body).some((v) => v !== undefined),
  { message: 'At least one field is required to update' }
);

export const articleIdParamsSchema = z.object({
  id: z.string().uuid()
});

export type CreateArticleBody = z.infer<typeof createArticleSchema>;
export type UpdateArticleBody = z.infer<typeof updateArticleFieldsSchema>;
