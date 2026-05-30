import type { FastifyRequest } from 'fastify';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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

const mockRequest = (articleImageBuffer?: Buffer): FastifyRequest =>
  ({ articleImageBuffer }) as FastifyRequest;

describe('uploadImageToCloudinary', () => {
  beforeEach(() => {
    uploadStream.mockImplementation((_options, callback) => ({
      end: () => callback(undefined, cloudinaryResult)
    }));
  });

  it('uploads to the articles folder and returns the Cloudinary result', async () => {
    const buffer = Buffer.from('fake-image');

    const result = await uploadImageToCloudinary(buffer);

    expect(result).toEqual(cloudinaryResult);
    expect(uploadStream).toHaveBeenCalledWith({ folder: 'articles' }, expect.any(Function));
  });

  it('rejects when Cloudinary reports an error', async () => {
    uploadStream.mockImplementation((_options, callback) => ({
      end: () => callback(new Error('upload failed'), undefined)
    }));

    await expect(uploadImageToCloudinary(Buffer.from('x'))).rejects.toThrow('upload failed');
  });
});

describe('resolveImageUrl', () => {
  beforeEach(() => {
    uploadStream.mockImplementation((_options, callback) => ({
      end: () => callback(undefined, cloudinaryResult)
    }));
  });

  it('uploads and returns secure_url when request has an image buffer', async () => {
    const imageUrl = await resolveImageUrl(
      mockRequest(Buffer.from('fake-image')),
      'https://old.example/img.jpg'
    );

    expect(imageUrl).toBe(cloudinaryResult.secure_url);
    expect(uploadStream).toHaveBeenCalledWith({ folder: 'articles' }, expect.any(Function));
  });

  it('returns imageUrl when no image buffer is present', async () => {
    const imageUrl = await resolveImageUrl(mockRequest(), 'https://example.com/img.jpg');

    expect(imageUrl).toBe('https://example.com/img.jpg');
    expect(uploadStream).not.toHaveBeenCalled();
  });

  it('returns null when there is no image buffer and no imageUrl', async () => {
    const imageUrl = await resolveImageUrl(mockRequest());

    expect(imageUrl).toBeNull();
    expect(uploadStream).not.toHaveBeenCalled();
  });
});
