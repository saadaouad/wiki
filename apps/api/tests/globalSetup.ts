import { execSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { env as loadDotenv } from 'custom-env';
import { sql } from 'drizzle-orm';

import {db} from '@/db/connection.ts';
import { users, articles } from '@/db/schema.ts';
import "@/env.ts";

const apiRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../");

loadDotenv('test', apiRoot);

const execSyncCmd = `npx drizzle-kit push --url="${process.env.DATABASE_URL}" --schema="./db/schema.ts" --dialect="postgresql"`;

export default async function setup() {
  console.log('Setting up the test db');

  try {
    await db.execute(sql`DROP TABLE IF EXISTS ${articles} CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS ${users} CASCADE`);

    console.log('Pushing schema using drizzle-kit...');
    execSync(execSyncCmd, {
      stdio: 'inherit',
      cwd: apiRoot
    });

    console.log('Test DB created');
  } catch (e) {
    console.error('Fail to setup test db', e);
    throw e;
  }

  return async () => {
    try {
      await db.execute(sql`DROP TABLE IF EXISTS ${articles} CASCADE`);
      await db.execute(sql`DROP TABLE IF EXISTS ${users} CASCADE`);

      process.exit(0);
    } catch (e) {
      console.error('Fail to teardown test db', e);
      throw e;
    }
  };
}
