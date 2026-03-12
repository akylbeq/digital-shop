import { NextRequest, NextResponse } from 'next/server';

function decodeToken(token: string) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(Buffer.from(payload, 'base64').toString());
  } catch {
    return null;
  }
}


export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('access_token')?.value;
  const { pathname } = request.nextUrl;
  const isAuthPage = pathname.startsWith('/auth');
  const isProtectedRoute = pathname.startsWith('/profile');
  const isAdminRoute = pathname.startsWith('/dashboard');

  if (isProtectedRoute && !accessToken) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  if (isAdminRoute && accessToken) {
    const payload = decodeToken(accessToken);

    if (!payload) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    if (payload.role !== 'admin') {
      return NextResponse.redirect(new URL('/profile', request.url));
    }
  }

  if (isAuthPage && accessToken) {
    return NextResponse.redirect(new URL('/profile', request.url));
  }

  return NextResponse.next();
}