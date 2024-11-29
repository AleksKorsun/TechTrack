// middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwtDecode from 'jwt-decode';

export function middleware(request: NextRequest) {
  console.log(`[Middleware] Запрошенный URL: ${request.nextUrl.pathname}`);

  const token = request.cookies.get('access_token')?.value;
  console.log(`[Middleware] Токен из куки: ${token ? "Токен найден" : "Токен отсутствует"}`);

  const protectedPaths = [
    { path: '/profile', allowedRoles: ['user', 'admin'] },
    { path: '/orders', allowedRoles: ['user', 'technician'] },
  ];

  const url = request.nextUrl.clone();

  // Проверка для страниц, которые не нужно обрабатывать
  if (
    request.nextUrl.pathname.startsWith('/authentication/login') ||
    request.nextUrl.pathname.startsWith('/authentication/register')
  ) {
    console.log(`[Middleware] Пропускаем проверку для страницы: ${request.nextUrl.pathname}`);
    return NextResponse.next();
  }

  const matchedRoute = protectedPaths.find((route) =>
    request.nextUrl.pathname.startsWith(route.path)
  );

  if (matchedRoute) {
    console.log(`[Middleware] Попытка доступа к защищённому маршруту: ${matchedRoute.path}`);
    if (!token) {
      console.warn(`[Middleware] Токен отсутствует. Перенаправляем на страницу логина.`);
      url.pathname = '/authentication/login';
      url.searchParams.set('callbackUrl', request.nextUrl.pathname); // Добавляем callbackUrl
      return NextResponse.redirect(url);
    }

    try {
      const decodedToken: { role: string } = jwtDecode(token);
      console.log(`[Middleware] Расшифрованный токен:`, decodedToken);

      if (!matchedRoute.allowedRoles.includes(decodedToken.role)) {
        console.warn(`[Middleware] Роль "${decodedToken.role}" не разрешена для маршрута: ${matchedRoute.path}`);
        url.pathname = '/unauthorized';
        return NextResponse.redirect(url);
      }

      console.log(`[Middleware] Доступ к маршруту разрешён для роли: ${decodedToken.role}`);
    } catch (error) {
      console.error(`[Middleware] Ошибка при расшифровке токена:`, error);
      url.pathname = '/authentication/login';
      url.searchParams.set('callbackUrl', request.nextUrl.pathname); // Добавляем callbackUrl
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/profile', '/orders'], // Убираем '/authentication/login' из matcher
};




