import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import {
  hashPasswordResetToken,
  isPasswordResetExpired,
} from "@/lib/auth/password-reset";
import { resetPasswordSchema } from "@/lib/validations";
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
    const data = resetPasswordSchema.parse(body);
    const tokenHash = hashPasswordResetToken(data.token);

    const rateLimit = checkRateLimit(
      getRateLimitKey(request, "auth:reset-password", tokenHash),
      AUTH_MUTATION_RATE_LIMIT
    );

    if (!rateLimit.allowed) {
      return jsonError("RATE_LIMITED", 429);
    }

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      select: {
        id: true,
        userId: true,
        expiresAt: true,
        usedAt: true,
      },
    });

    if (
      !resetToken ||
      resetToken.usedAt ||
      isPasswordResetExpired(resetToken.expiresAt)
    ) {
      return jsonError("BAD_REQUEST", 400);
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      });

      await tx.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      });
    });

    return jsonOk({
      success: true,
      message: "Senha atualizada com segurança.",
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonValidationError(error);
    }

    return handleRouteError("POST /api/reset-password", error);
  }
}
