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
        // Users hardcodeados por mientras, a posteriori implementar con BDD
        const users = [
          { id: 1, username: "Admin", password: "secret", name: "Administrator", role: "admin" },
          { id: 2, username: "user", password: "secret", name: "Regular User", role: "user" },
          { id: 3, username: "nico", password: "nico", name: "Nicolas", role: "user" }
        ];
        
        const user = users.find(u => 
          u.username === credentials.username && 
          u.password === credentials.password
        );
        
        if (user) {
          //  devolver información segura 
          return {
            id: user.id.toString(),
            name: user.name,
            username: user.username,
            role: user.role
          };
        }
        
        console.log("Intento de login fallido:", credentials.username);
        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Si el usuario se acaba de autenticar, añadir datos adicionales al token
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      // Enviar propiedades del token al cliente
      if (session?.user) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.role = token.role;
      }
      return session;
    }
  },
  pages: { 
    signIn: "/login",
    signOut: "/login",
    error: "/login"
  },
  session: { 
    strategy: "jwt",
    maxAge: 1 * 60  // Nomas 1 hora de sesión
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
