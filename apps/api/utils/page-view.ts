import redis from '@/lib/redis.ts';

export const pageView = async (keyFor: string) => {
  const newVal = await redis.incr(keyFor);

  return +newVal;
};
