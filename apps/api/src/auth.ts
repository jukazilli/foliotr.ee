import type { FastifyRequest } from "fastify";

export type AuthContext = {
  clerkUserId: string;
};

export function getAuthContext(request: FastifyRequest): AuthContext {
  const devUserId = request.headers["x-clerk-user-id"];
  const authHeader = request.headers.authorization;

  if (typeof devUserId === "string" && devUserId.length > 0) {
    return { clerkUserId: devUserId };
  }

  if (authHeader?.startsWith("Bearer ")) {
    return { clerkUserId: "clerk-token-pending-verification" };
  }

  if (process.env.NODE_ENV !== "production") {
    return { clerkUserId: "dev-user" };
  }

  throw new Error("Unauthorized");
}
