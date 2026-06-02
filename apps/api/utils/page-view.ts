import { redis } from '@/lib/index.ts';

export const pageView = async (keyFor: string) => {
  const newVal = await redis.incr(keyFor);

  return +newVal;
};
