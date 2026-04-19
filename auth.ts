import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { getEnv } from "@/lib/env";
import { loginSchema } from "@/lib/validations";
import {
  AUTH_LOGIN_RATE_LIMIT,
  checkRateLimit,
  getRateLimitKey,
} from "@/lib/security/rate-limit";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: getEnv().AUTH_SECRET,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials, request) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const email = parsed.data.email.toLowerCase();
        const rateLimit = checkRateLimit(
          getRateLimitKey(request, "auth:login", email),
          AUTH_LOGIN_RATE_LIMIT
        );

        if (!rateLimit.allowed) return null;

        const user = await prisma.user.findUnique({
          where: { email },
        });
        if (!user || !user.passwordHash) return null;
        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!valid) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = (user as { username?: string }).username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        if (typeof token.id === "string") {
          session.user.id = token.id;
        }
        session.user.username =
          typeof token.username === "string" ? token.username : null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
});
