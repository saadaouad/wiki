import { deleteCookie, getCookie, setCookie } from 'cookies-next/client';

const TOKEN_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

const cookieOptions = {
  path: '/',
  maxAge: TOKEN_MAX_AGE_SECONDS,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production'
};

export const getAuthToken = (): string | null => {
  const token = getCookie('token');
  return typeof token === 'string' ? token : null;
};

export const setAuthToken = (token: string) => {
  setCookie('token', token, cookieOptions);
};

export const clearAuthToken = () => {
  deleteCookie('token', { path: '/' });
};
