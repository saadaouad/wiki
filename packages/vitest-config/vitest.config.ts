import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

export default defineConfig({
  root: repoRoot,
  test: {
    globals: true,
    clearMocks: true,
    restoreMocks: true,
    pool: 'threads',
    maxWorkers: 1,
    projects: [
      {
        extends: true,
        resolve: {
          alias: { '@': resolve(repoRoot, 'apps/api') }
        },
        test: {
          name: 'api-unit',
          include: ['apps/api/tests/unit/*.test.ts']        
        }
      },
      {
        extends: true,
        resolve: {
          alias: { '@': resolve(repoRoot, 'apps/web') }
        },
        test: {
          name: 'web-unit',
          include: ['apps/web/tests/unit/*.test.ts']
        }
      },
      {
        extends: true,
        resolve: {
          alias: { '@': resolve(repoRoot, 'apps/api') }
        },
        test: {
          name: 'api-integration',
          include: ['apps/api/tests/integration/*.test.ts'],
          globalSetup: ['apps/api/tests/setup.ts']
        }
      },
      {
        extends: true,
        plugins: [react()],
        resolve: {
          alias: { '@': resolve(repoRoot, 'apps/web') }
        },
        test: {
          name: 'web-integration',
          include: ['apps/web/tests/integration/**/*.test.ts'],
          setupFiles: ['apps/web/tests/setup.ts'],
          environment: 'jsdom'
        }
      }
    ]
  },
  plugins: []
});
