import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getEnv } from "@/lib/env";
import { passwordSchema } from "@/lib/validations";
import {
  AUTH_LOGIN_RATE_LIMIT,
  checkRateLimit,
  getRateLimitKey,
} from "@/lib/security/rate-limit";
import { normalizeUsernameInput } from "@/lib/usernames";
import bcrypt from "bcryptjs";

const loginCredentialsSchema = z.object({
  email: z.string().trim().min(1),
  password: passwordSchema,
});

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
        const parsed = loginCredentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const identifier = parsed.data.email.toLowerCase();
        const rateLimit = checkRateLimit(
          getRateLimitKey(request, "auth:login", identifier),
          AUTH_LOGIN_RATE_LIMIT
        );

        if (!rateLimit.allowed) return null;

        const where = identifier.includes("@")
          ? { email: identifier }
          : { username: normalizeUsernameInput(identifier) };

        const user = await prisma.user.findUnique({
          where,
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
