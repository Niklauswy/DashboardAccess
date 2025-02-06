import NextAuth from "next-auth"
// Import your providers here, for example:
// import CredentialsProvider from "next-auth/providers/credentials";

export default NextAuth({
  providers: [
    // ...existing providers...
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 60, // Session expires after 30 minutes
    updateAge: 5 * 60, // Session updated every 5 minutes
  },
  jwt: {
    secret: process.env.JWT_SECRET, // Ensure this is set in .env.local
  },
  callbacks: {
    // Optionally add callbacks to control session behavior
    async session({ session, token }) {
      // Customize session if needed
      return session;
    },
  },
});
