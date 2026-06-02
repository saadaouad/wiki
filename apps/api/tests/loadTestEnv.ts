import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { env as loadDotenv } from 'custom-env';

const apiRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../');

loadDotenv('test', apiRoot);

await import('@/env.ts');
