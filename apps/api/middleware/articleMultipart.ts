import type { FastifyReply, FastifyRequest } from 'fastify';
import type { ZodError } from 'zod';

import { updateArticleFieldsSchema } from '@repo/schema-validation';

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

const validateImageUpload = (type: string | undefined, size: number) => {
  if (!type || !ALLOWED_IMAGE_TYPES.includes(type)) {
    throw new Error('Invalid file type');
  }

  if (size > MAX_FILE_SIZE) {
    throw new Error('File too large');
  }
};

const sendValidationError = (reply: FastifyReply, error: ZodError) =>
  reply.status(400).send({
    error: 'Validation Error',
    issues: error.flatten()
  });

export const parseArticleMultipart = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  if (!request.isMultipart()) return;

  const body: Record<string, unknown> = {};

  for await (const part of request.parts()) {
    if (part.type === 'file') {
      try {
        const buffer = await part.toBuffer();
        validateImageUpload(part.mimetype, buffer.length);
        request.articleImageBuffer = buffer;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Invalid upload';
        return reply.status(message === 'File too large' ? 413 : 400).send({ error: message });
      }
    } else {
      body[part.fieldname] = part.value;
    }
  }

  request.body = body;
};

export const validateUpdateArticleBody = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  const parsed = updateArticleFieldsSchema.safeParse(request.body);
  if (!parsed.success) {
    return sendValidationError(reply, parsed.error);
  }

  const hasUpdate =
    !!request.articleImageBuffer || Object.values(parsed.data).some((value) => value !== undefined);

  if (!hasUpdate) {
    return reply.status(400).send({
      error: 'Validation Error',
      issues: { formErrors: ['At least one field is required to update'], fieldErrors: {} }
    });
  }

  request.body = parsed.data;
};
