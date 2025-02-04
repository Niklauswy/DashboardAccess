import { withAuth } from "next-auth/middleware";

export default withAuth({
  // Se verifica que exista un token para autorizar
  authorized: ({ token }) => !!token,
  pages: { signIn: '/login' }
});

// Protege todas las rutas excepto _next, api, login, etc.
export const config = { 
   matcher: [
    '/((?!api|login|_next/static|favicon.ico).*)'
  ]
};
