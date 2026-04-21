import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  getUsernameAvailability,
  isUniqueUsernameError,
  parseUsernameInput,
  usernameConflictDetails,
} from "@/lib/server/domain/usernames";
import {
  handleRouteError,
  jsonError,
  jsonOk,
  jsonValidationError,
} from "@/lib/server/api";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return jsonError("UNAUTHORIZED", 401);
    }

    const username = parseUsernameInput(new URL(request.url).searchParams.get("username"));
    return jsonOk(await getUsernameAvailability(username, session.user.id), { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonValidationError(error);
    }

    return handleRouteError("GET /api/username", error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return jsonError("UNAUTHORIZED", 401);
    }

    const body = await request.json();
    const username = parseUsernameInput(body?.username);
    const availability = await getUsernameAvailability(username, session.user.id);

    if (!availability.available) {
      return jsonError("CONFLICT", 409, availability);
    }

    try {
      const user = await prisma.user.update({
        where: { id: session.user.id },
        data: { username },
        select: {
          id: true,
          username: true,
        },
      });

      return jsonOk({ user }, { status: 200 });
    } catch (error) {
      if (isUniqueUsernameError(error)) {
        return jsonError(
          "CONFLICT",
          409,
          await usernameConflictDetails(username, session.user.id)
        );
      }

      throw error;
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonValidationError(error);
    }

    return handleRouteError("PATCH /api/username", error);
  }
}
