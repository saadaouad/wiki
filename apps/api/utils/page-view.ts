import redis from '@/cache/index.ts';

export const pageView = async (keyFor: string) => {
  const newVal = await redis.incr(keyFor);

  return +newVal;
};
