import type { CookieOptions } from 'express';

const isProduction = process.env.ISPRODACTION === 'production';

export const getAccessCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax',
  path: '/',
  maxAge: 2 * 60 * 60 * 1000,
});

export const getRefreshCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax',
  path: '/auth/refresh',
  maxAge: 7 * 24 * 60 * 60 * 1000,
});
