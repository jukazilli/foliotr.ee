import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { handleRouteError, jsonError, jsonOk } from "@/lib/server/api";
import { METHOD_VERSION } from "@/lib/vocational-test/validation";

const visibilitySchema = z.object({
  publicInProfile: z.boolean().optional(),
  publicInPortfolio: z.boolean().optional(),
  publicInResume: z.boolean().optional(),
});

interface RouteProps {
  params: Promise<{ sessionId: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteProps) {
  try {
    const [session, { sessionId }] = await Promise.all([auth(), params]);

    if (!session?.user?.id) {
      return jsonError("UNAUTHORIZED", 401);
    }

    const input = visibilitySchema.parse(await request.json());
    const existing = await prisma.vocationalTestSession.findFirst({
      where: {
        id: sessionId,
        userId: session.user.id,
        methodVersion: METHOD_VERSION,
        status: "completed",
      },
      select: {
        id: true,
      },
    });

    if (!existing) {
      return jsonError("NOT_FOUND", 404);
    }

    const visibilityData = {
      publicInProfile: input.publicInProfile,
      publicInPortfolio: input.publicInPortfolio,
      publicInResume: input.publicInResume,
    };

    const updated = await prisma.$transaction(async (tx) => {
      const fields = [
        "publicInProfile",
        "publicInPortfolio",
        "publicInResume",
      ] as const;

      await Promise.all(
        fields
          .filter((field) => input[field] === true)
          .map((field) =>
            tx.vocationalTestSession.updateMany({
              where: {
                userId: session.user.id,
                methodVersion: METHOD_VERSION,
                status: "completed",
                id: {
                  not: existing.id,
                },
              },
              data: {
                [field]: false,
              },
            })
          )
      );

      return tx.vocationalTestSession.update({
        where: {
          id: existing.id,
        },
        data: visibilityData,
        select: {
          id: true,
          publicInProfile: true,
          publicInPortfolio: true,
          publicInResume: true,
        },
      });
    });

    return jsonOk({ session: updated });
  } catch (error) {
    return handleRouteError("PATCH /api/vocational-test/sessions/[sessionId]", error);
  }
}
