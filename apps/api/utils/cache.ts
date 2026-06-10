import { redis } from '@/lib/index.ts';

export const createListCache = (namespace: string) => {
  const versionKey = `${namespace}:cacheVersion`;

  return {
    getVersion: async () => (await redis.get<number>(versionKey)) ?? 0,
    bumpVersion: () => redis.incr(versionKey),
    cacheKey: (page: number, limit: number, version: number) =>
      `${namespace}:v${version}:p${page}:l${limit}`
  };
};

export const pageView = async (keyFor: string) => {
  const newVal = await redis.incr(keyFor);

  return +newVal;
};
