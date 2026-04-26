import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { handleRouteError, jsonError, jsonOk } from "@/lib/server/api";
import { METHOD_VERSION } from "@/lib/vocational-test/validation";

const visibilitySchema = z.object({
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

    const updated = await prisma.vocationalTestSession.update({
      where: {
        id: existing.id,
      },
      data: {
        publicInPortfolio: input.publicInPortfolio,
        publicInResume: input.publicInResume,
      },
      select: {
        id: true,
        publicInPortfolio: true,
        publicInResume: true,
      },
    });

    return jsonOk({ session: updated });
  } catch (error) {
    return handleRouteError("PATCH /api/vocational-test/sessions/[sessionId]", error);
  }
}
