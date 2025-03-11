import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request) {
  const path = request.nextUrl.pathname;
  
  // Rutas públicas que no requieren autenticación
  const isPublicRoute = 
    path === '/login' ||
    path.startsWith('/api/auth') ||
    path.startsWith('/_next') ||
    path === '/favicon.ico';
  
  // Verificar si hay sesión activa
  const session = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });
  
  // Si es ruta de login y ya hay sesión, redirigir al dashboard
  if (path === '/login' && session) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // Si es una ruta protegida y no hay sesión, redirigir a login
  if (!isPublicRoute && !session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', path);
    return NextResponse.redirect(loginUrl);
  }
  
  return NextResponse.next();
}

export const config = { 
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)'
  ]
};