import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";
import {
  handleRouteError,
  jsonError,
  jsonOk,
  jsonValidationError,
} from "@/lib/server/api";
import {
  AUTH_MUTATION_RATE_LIMIT,
  checkRateLimit,
  getRateLimitKey,
} from "@/lib/security/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = registerSchema.parse(body);
    const email = data.email.toLowerCase();

    const rateLimit = checkRateLimit(
      getRateLimitKey(request, "auth:register", email),
      AUTH_MUTATION_RATE_LIMIT
    );

    if (!rateLimit.allowed) {
      return jsonError("RATE_LIMITED", 429);
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return jsonError("CONFLICT", 409);
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          name: data.name,
          passwordHash,
        },
      });

      const profile = await tx.profile.create({
        data: {
          userId: user.id,
          displayName: data.name,
          onboardingDone: false,
        },
      });

      await tx.version.create({
        data: {
          profileId: profile.id,
          name: "Principal",
          isDefault: true,
        },
      });
    });

    return jsonOk({ success: true }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonValidationError(error);
    }

    return handleRouteError("POST /api/register", error);
  }
}
