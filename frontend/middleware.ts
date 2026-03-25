import { NextRequest, NextResponse } from 'next/server';

function decodeToken(token: string) {
  try {
    const payload = token.split('.')[1];
    // Используем atob для Edge Runtime и чистим строку от спецсимволов base64url
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch (error) {
    console.error('[Middleware] Decode error:', error);
    return null;
  }
}

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('access_token')?.value;
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname.startsWith('/auth');
  const isProtectedRoute = pathname.startsWith('/profile');
  const isAdminRoute = pathname.startsWith('/dashboard');

  // ЛОГ ДЛЯ ПРОВЕРКИ: Видит ли сервер куку вообще?
  console.log(`[Middleware] Target: ${pathname} | Token: ${accessToken ? 'FOUND' : 'MISSING'}`);

  // 1. Если пытаемся зайти в профиль без токена
  if (isProtectedRoute && !accessToken) {
    console.log('[Middleware] Redirect to login: No token for protected route');
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // 2. Логика для админки
  if (isAdminRoute) {
    if (!accessToken) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    const payload = decodeToken(accessToken);
    if (!payload || payload.role !== 'admin') {
      console.log(`[Middleware] Forbidden: Role is ${payload?.role || 'unknown'}`);
      return NextResponse.redirect(new URL('/profile', request.url));
    }
  }

  // 3. Если залогинен и лезет на страницу логина
  if (isAuthPage && accessToken) {
    return NextResponse.redirect(new URL('/profile', request.url));
  }

  return NextResponse.next();
}

// Важно: укажи matcher, чтобы middleware не срабатывал на картинки и статику
export const config = {
  matcher: ['/profile/:path*', '/dashboard/:path*', '/auth/:path*'],
};