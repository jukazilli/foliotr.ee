import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { onboardingSchema } from "@/lib/validations";
import { normalizeUsernameInput, suggestAvailableUsernames } from "@/lib/usernames";
import {
  handleRouteError,
  jsonError,
  jsonOk,
  jsonValidationError,
} from "@/lib/server/api";

function isUniqueUsernameError(error: unknown) {
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

async function usernameExists(username: string, currentUserId?: string) {
  const existingUsername = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });

  return Boolean(existingUsername && existingUsername.id !== currentUserId);
}

async function usernameConflictDetails(username: string, currentUserId?: string) {
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

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return jsonError("UNAUTHORIZED", 401);
    }

    const rawUsername = new URL(request.url).searchParams.get("username") ?? "";
    const username = normalizeUsernameInput(rawUsername);
    const parsed = onboardingSchema.shape.username.safeParse(username);

    if (!parsed.success) {
      return jsonValidationError(new ZodError(parsed.error.issues));
    }

    if (await usernameExists(parsed.data, session.user.id)) {
      return jsonOk(
        {
          available: false,
          ...(await usernameConflictDetails(parsed.data, session.user.id)),
        },
        { status: 200 }
      );
    }

    return jsonOk({ available: true, username: parsed.data, suggestions: [] }, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonValidationError(error);
    }

    return handleRouteError("GET /api/onboarding", error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return jsonError("UNAUTHORIZED", 401);
    }

    const userId = session.user.id;
    const body = await request.json();
    const data = onboardingSchema.parse({
      ...body,
      username: normalizeUsernameInput(String(body?.username ?? "")),
    });

    if (await usernameExists(data.username, userId)) {
      return jsonError("CONFLICT", 409, await usernameConflictDetails(data.username, userId));
    }

    try {
      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: userId },
          data: { username: data.username },
        });

        await tx.profile.update({
          where: { userId },
          data: {
            headline: data.headline,
            onboardingDone: true,
          },
        });
      });
    } catch (error) {
      if (isUniqueUsernameError(error)) {
        return jsonError("CONFLICT", 409, await usernameConflictDetails(data.username, userId));
      }

      throw error;
    }

    return jsonOk({ success: true }, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonValidationError(error);
    }

    return handleRouteError("POST /api/onboarding", error);
  }
}
