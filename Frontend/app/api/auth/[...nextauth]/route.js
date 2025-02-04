import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Usuario", type: "text", placeholder: "usuario" },
        password: { label: "Contraseña", type: "password" }
      },
      async authorize(credentials) {
        // Usuarios definidos localmente
        const users = [
          { id: 1, username: "admin", password: "secret", name: "Admin User" },
          { id: 2, username: "user", password: "secret", name: "Regular User" },
          { id: 3, username: "Nico", password: "nico", name: "Nicooo User" }

        ];
        const user = users.find(u => u.username === credentials.username && u.password === credentials.password);
        return user || null;
      }
    })
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret' // <-- Asegura el uso de una clave secreta
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
