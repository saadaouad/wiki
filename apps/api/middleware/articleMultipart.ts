import type { FastifyReply, FastifyRequest } from 'fastify';
import type { ZodError } from 'zod';

import { updateArticleFieldsSchema } from '@repo/schema-validation';

const sendValidationError = (reply: FastifyReply, error: ZodError) =>
  reply.status(400).send({
    error: 'Validation Error',
    issues: error.flatten()
  });

export const parseArticleMultipart = async (
  request: FastifyRequest,
  _reply: FastifyReply
): Promise<void> => {
  if (!request.isMultipart()) return;

  const body: Record<string, unknown> = {};

  for await (const part of request.parts()) {
    if (part.type === 'file') {
      request.articleImageBuffer = await part.toBuffer();
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
    !!request.articleImageBuffer ||
    Object.values(parsed.data).some((value) => value !== undefined);

  if (!hasUpdate) {
    return reply.status(400).send({
      error: 'Validation Error',
      issues: { formErrors: ['At least one field is required to update'], fieldErrors: {} }
    });
  }

  request.body = parsed.data;
};
