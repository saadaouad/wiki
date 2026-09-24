import { Redis } from '@upstash/redis';

import { env } from '@/env.ts';

const client = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN
});

const fallback = async <T>(label: string, value: T, run: () => Promise<T>): Promise<T> => {
  try {
    return await run();
  } catch (error) {
    console.error(`Redis ${label} failed`, error);
    return value;
  }
};

export const redis = {
  get: <TData>(key: string) => fallback('get', null as TData | null, () => client.get<TData>(key)),
  set: (key: string, value: unknown, opts?: { ex: number }) =>
    fallback('set', 'OK', () => client.set(key, value, opts)),
  del: (...keys: string[]) => fallback('del', 0, () => client.del(...keys)),
  incr: (key: string) => fallback('incr', 0, () => client.incr(key))
};
