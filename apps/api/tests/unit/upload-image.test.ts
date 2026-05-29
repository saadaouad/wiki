import multipart from '@fastify/multipart';
import type { FastifyInstance } from 'fastify';
import Fastify from 'fastify';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { parseArticleMultipart } from '@/middleware/articleBody.ts';
import { resolveImageUrl, uploadImageToCloudinary } from '@/utils/index.ts';

const uploadStream = vi.fn();

const cloudinaryResult = {
  secure_url: 'https://res.cloudinary.com/demo/image.jpg',
  public_id: 'articles/abc123'
};

vi.mock('@/lib/cloudinary.ts', () => ({
  default: {
    uploader: {
      upload_stream: (...args: unknown[]) => uploadStream(...args)
    }
  }
}));

const buildTestApp = async (): Promise<FastifyInstance> => {
  const app = Fastify({ logger: false });
  await app.register(multipart);
  app.post(
    '/test-resolve-image',
    { preValidation: parseArticleMultipart },
    async (request, reply) => {
      const body = (request.body ?? {}) as { imageUrl?: string };
      const imageUrl = await resolveImageUrl(request, body.imageUrl);
      return reply.send({ imageUrl });
    }
  );
  await app.ready();
  return app;
};

describe('uploadImageToCloudinary', () => {
  beforeEach(() => {
    uploadStream.mockImplementation((_options, callback) => ({
      end: () => callback(undefined, cloudinaryResult)
    }));
  });

  it('rejects when Cloudinary reports an error', async () => {
    uploadStream.mockImplementation((_options, callback) => ({
      end: () => callback(new Error('upload failed'), undefined)
    }));

    await expect(uploadImageToCloudinary(Buffer.from('x'))).rejects.toThrow('upload failed');
  });
});

describe('resolveImageUrl', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    uploadStream.mockImplementation((_options, callback) => ({
      end: () => callback(undefined, cloudinaryResult)
    }));
  });

  it('uploads to the articles folder when multipart includes an image file', async () => {
    const response = await request(app.server)
      .post('/test-resolve-image')
      .field('imageUrl', 'https://old.example/img.jpg')
      .attach('image', Buffer.from('fake-image'), 'test.png')
      .expect(200);

    expect(response.body).toEqual({ imageUrl: cloudinaryResult.secure_url });
    expect(uploadStream).toHaveBeenCalledWith({ folder: 'articles' }, expect.any(Function));
  });

  it('returns imageUrl when no image file is attached', async () => {
    const response = await request(app.server)
      .post('/test-resolve-image')
      .field('imageUrl', 'https://example.com/img.jpg')
      .expect(200);

    expect(response.body).toEqual({ imageUrl: 'https://example.com/img.jpg' });
    expect(uploadStream).not.toHaveBeenCalled();
  });

  it('returns null when there is no image file and no imageUrl', async () => {
    const response = await request(app.server).post('/test-resolve-image').expect(200);

    expect(response.body).toEqual({ imageUrl: null });
  });
});
