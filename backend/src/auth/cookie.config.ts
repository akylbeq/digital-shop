import type { CookieOptions } from 'express';

const isProduction = process.env.NODE_ENV === 'production';
const domain = process.env.DOMAIN || 'localhost';
export const getAccessCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax',
  path: '/',
  domain: process.env.DOMAIN || 'localhost',
  maxAge: 2 * 60 * 60 * 1000,
});

export const getRefreshCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax',
  path: '/auth/refresh',
  domain: domain,
  maxAge: 7 * 24 * 60 * 60 * 1000,
});
