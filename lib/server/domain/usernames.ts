import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { usernameSchema } from "@/lib/validations";
import { normalizeUsernameInput, suggestAvailableUsernames } from "@/lib/usernames";

export function isUniqueUsernameError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002" &&
    "meta" in error &&
    typeof error.meta === "object" &&
    error.meta !== null &&
    "target" in error.meta &&
    Array.isArray(error.meta.target) &&
    error.meta.target.includes("username")
  );
}

export function parseUsernameInput(value: unknown) {
  const username = normalizeUsernameInput(String(value ?? ""));
  const parsed = usernameSchema.safeParse(username);

  if (!parsed.success) {
    throw new ZodError(parsed.error.issues);
  }

  return parsed.data;
}

export async function usernameExists(username: string, currentUserId?: string) {
  const existingUsername = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });

  return Boolean(existingUsername && existingUsername.id !== currentUserId);
}

export async function usernameConflictDetails(username: string, currentUserId?: string) {
  const suggestions = await suggestAvailableUsernames(
    username,
    (candidate) => usernameExists(candidate, currentUserId),
    { count: 3 }
  );

  return {
    message: "Esse username ja esta em uso.",
    username,
    suggestions,
  };
}

export async function getUsernameAvailability(username: string, currentUserId?: string) {
  if (await usernameExists(username, currentUserId)) {
    return {
      available: false,
      ...(await usernameConflictDetails(username, currentUserId)),
    };
  }

  return {
    available: true,
    username,
    suggestions: [],
  };
}
