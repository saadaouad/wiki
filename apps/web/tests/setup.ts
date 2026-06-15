import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { env as loadDotenv } from 'custom-env';
import { afterEach, vi } from 'vitest';

const webRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../');

loadDotenv('test', webRoot);

vi.mock('next/navigation', () => {
  const router = { push: vi.fn(), replace: vi.fn() };

  return {
    useRouter: vi.fn(() => router)
  };
});

vi.mock('cookies-next/client', () => ({
  getCookie: vi.fn(() => undefined),
  setCookie: vi.fn(),
  deleteCookie: vi.fn()
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn()
  }
}));

afterEach(() => {
  cleanup();
});
