import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/request';

let locales = ['es', 'en'];
let defaultLocale = 'es';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Comprobar si el pathname ya incluye un idioma soportado
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return;

  // Redirigir si no hay idioma en la URL
  request.nextUrl.pathname = `/${defaultLocale}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: [
    // Evitar que el middleware se ejecute en archivos estáticos, imágenes o api interna
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)',
  ],
};
