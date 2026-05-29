import type { FastifyRequest } from 'fastify';

import cloudinary from '@/lib/cloudinary.ts';

type CloudinaryResult = {
  secure_url: string;
  public_id: string;
};

export const uploadImageToCloudinary = async (fileBuffer: Buffer): Promise<CloudinaryResult> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'articles'
      },
      (error: Error | undefined, result: CloudinaryResult | undefined) => {
        if (error || !result) {
          reject(error);
          return;
        }

        resolve(result as CloudinaryResult);
      }
    );

    stream.end(fileBuffer);
  });
}

export const resolveImageUrl = async (
  request: FastifyRequest,
  imageUrl?: string | null
): Promise<string | null> => {
  if (request.articleImageBuffer) {
    const result = await uploadImageToCloudinary(request.articleImageBuffer);
    return result.secure_url;
  }

  return imageUrl ?? null;
}
