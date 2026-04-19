import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { upsertOwnedPageOutput } from "@/lib/server/domain/versions";
import { handleRouteError, jsonError, jsonOk } from "@/lib/server/api";
import { pageOutputSchema } from "@/lib/validations";

interface RouteContext {
  params: Promise<{ versionId: string }>;
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return jsonError("UNAUTHORIZED", 401);
    }

    const { versionId } = await context.params;
    const body = await request.json();
    const input = pageOutputSchema.parse(body);
    const version = await upsertOwnedPageOutput(prisma, session.user.id, versionId, input);

    return jsonOk({ version }, { status: 200 });
  } catch (error) {
    return handleRouteError("PUT /api/versions/[versionId]/page", error);
  }
}
