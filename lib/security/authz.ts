import { auth } from "@/auth";

export class AuthorizationError extends Error {
  constructor(message = "Forbidden") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export async function requireSessionUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new AuthorizationError("Unauthorized");
  }

  return session.user.id;
}

export function assertResourceOwner(ownerId: string, actorId: string): void {
  if (ownerId !== actorId) {
    throw new AuthorizationError();
  }
}
