import { remember } from '@epic-web/remember';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { env, isProd } from '@/env.ts';
import * as schema from './schema.ts';

const createPool = () => {
  return new Pool({
    connectionString: env.DATABASE_URL,
    min: env.DATABASE_POOL_MIN,
    max: env.DATABASE_POOL_MAX
  });
};

let client: Pool;

if (isProd()) {
  client = createPool();
} else {
  client = remember('dbPool', () => createPool());
}

export const db = drizzle({ client, schema });

export default db;
