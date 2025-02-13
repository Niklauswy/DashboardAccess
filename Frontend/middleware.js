import { withAuth } from "next-auth/middleware";

export default withAuth({
  // Se verifica que exista un token para autorizar
  authorized: ({ token }) => !!token,
  pages: { signIn: '/login' }
});

// Pa proteger todas las rutas excepto _next, login, etc.
export const config = { 
  matcher: [
    '/((?!login|_next/static|favicon.ico).*)'
  ]
};