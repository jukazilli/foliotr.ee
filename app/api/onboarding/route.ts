import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { onboardingSchema } from "@/lib/validations";
import {
  handleRouteError,
  jsonError,
  jsonOk,
  jsonValidationError,
} from "@/lib/server/api";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return jsonError("UNAUTHORIZED", 401);
    }

    const userId = session.user.id;
    const body = await request.json();
    const data = onboardingSchema.parse(body);

    const existingUsername = await prisma.user.findUnique({
      where: { username: data.username },
    });

    if (existingUsername && existingUsername.id !== userId) {
      return jsonError("CONFLICT", 409);
    }

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

    return jsonOk({ success: true }, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonValidationError(error);
    }

    return handleRouteError("POST /api/onboarding", error);
  }
}
