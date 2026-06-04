import { beforeEach, describe, expect, it, vi } from 'vitest';

import { clearAuthToken, getAuthToken, setAuthToken } from '@/utils/auth-cookie';

const { deleteCookie, getCookie, setCookie } = vi.hoisted(() => ({
  getCookie: vi.fn(),
  setCookie: vi.fn(),
  deleteCookie: vi.fn()
}));

vi.mock('cookies-next/client', () => ({
  getCookie,
  setCookie,
  deleteCookie
}));

describe('auth-cookie', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAuthToken', () => {
    it('returns the token when present', () => {
      getCookie.mockReturnValue('jwt-token');

      expect(getAuthToken()).toBe('jwt-token');
      expect(getCookie).toHaveBeenCalledWith('token');
    });

    it('returns null when the cookie is missing or not a string', () => {
      getCookie.mockReturnValue(undefined);
      expect(getAuthToken()).toBeNull();

      getCookie.mockReturnValue(true);
      expect(getAuthToken()).toBeNull();
    });
  });

  describe('setAuthToken', () => {
    it('stores the token with shared cookie options', () => {
      setAuthToken('jwt-token');

      expect(setCookie).toHaveBeenCalledWith('token', 'jwt-token', {
        path: '/',
        maxAge: 7 * 24 * 60 * 60,
        sameSite: 'lax',
        secure: false
      });
    });
  });

  describe('clearAuthToken', () => {
    it('deletes the token cookie', () => {
      clearAuthToken();

      expect(deleteCookie).toHaveBeenCalledWith('token', { path: '/' });
    });
  });
});
