import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { getEnv } from "@/lib/env";
import {
  generatePasswordResetToken,
  getPasswordResetExpiresAt,
  hashPasswordResetToken,
} from "@/lib/auth/password-reset";
import { forgotPasswordSchema } from "@/lib/validations";
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

const GENERIC_RESET_RESPONSE = {
  success: true,
  message:
    "Se existir uma conta com esse e-mail, as instruções de recuperação serão enviadas.",
};

async function deliverPasswordResetInstructions(
  _email: string,
  _resetUrl: string
): Promise<void> {
  // Email delivery is intentionally a private server hook. This cut prepares the
  // expirable token flow without returning or logging reset tokens.
}

function buildResetUrl(request: NextRequest, token: string): string {
  const origin = getEnv().NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
  const url = new URL("/reset-password", origin);
  url.searchParams.set("token", token);
  return url.toString();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = forgotPasswordSchema.parse(body);

    const rateLimit = checkRateLimit(
      getRateLimitKey(request, "auth:forgot-password", data.email),
      AUTH_MUTATION_RATE_LIMIT
    );

    if (!rateLimit.allowed) {
      return jsonError("RATE_LIMITED", 429);
    }

    const user = await prisma.user.findUnique({
      where: { email: data.email },
      select: { id: true, email: true },
    });

    if (user) {
      const token = generatePasswordResetToken();
      const tokenHash = hashPasswordResetToken(token);
      const expiresAt = getPasswordResetExpiresAt();
      const resetUrl = buildResetUrl(request, token);

      await prisma.$transaction(async (tx) => {
        await tx.passwordResetToken.updateMany({
          where: { userId: user.id, usedAt: null },
          data: { usedAt: new Date() },
        });

        await tx.passwordResetToken.create({
          data: {
            userId: user.id,
            tokenHash,
            expiresAt,
          },
        });
      });

      await deliverPasswordResetInstructions(user.email, resetUrl);
    }

    return jsonOk(GENERIC_RESET_RESPONSE);
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonValidationError(error);
    }

    return handleRouteError("POST /api/forgot-password", error);
  }
}
