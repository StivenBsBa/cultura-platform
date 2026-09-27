import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { userRepository } from "@/lib/repositories/user.repository";
import { verifyPassword } from "./password";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        if (!email || !credentials?.password) return null;
        const user = await userRepository.findAuthByEmail(email);
        if (!user || !(await verifyPassword(user.passwordHash, credentials.password))) return null;
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          mustChangePassword: user.mustChangePassword,
        };
      },
    }),
  ],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.role = user.role;
        token.mustChangePassword = user.mustChangePassword;
      }
      return token;
    },
    session: ({ session, token }) => {
      if (session.user) {
        session.user.id = token.sub;
        session.user.role = token.role;
        session.user.mustChangePassword = token.mustChangePassword;
      }
      return session;
    },
  },
};
