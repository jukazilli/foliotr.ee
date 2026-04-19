import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getOwnedVersion, updateOwnedVersion } from "@/lib/server/domain/versions";
import { handleRouteError, jsonError, jsonOk } from "@/lib/server/api";
import { versionSchema } from "@/lib/validations";

interface RouteContext {
  params: Promise<{ versionId: string }>;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return jsonError("UNAUTHORIZED", 401);
    }

    const { versionId } = await context.params;
    const version = await getOwnedVersion(prisma, session.user.id, versionId);

    return jsonOk({ version }, { status: 200 });
  } catch (error) {
    return handleRouteError("GET /api/versions/[versionId]", error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return jsonError("UNAUTHORIZED", 401);
    }

    const { versionId } = await context.params;
    const body = await request.json();
    const input = versionSchema.parse(body);
    const version = await updateOwnedVersion(prisma, session.user.id, versionId, input);

    return jsonOk({ version }, { status: 200 });
  } catch (error) {
    return handleRouteError("PATCH /api/versions/[versionId]", error);
  }
}
