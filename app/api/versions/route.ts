import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createOwnedVersion, listOwnedVersions } from "@/lib/server/domain/versions";
import { handleRouteError, jsonError, jsonOk } from "@/lib/server/api";
import { versionSchema } from "@/lib/validations";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return jsonError("UNAUTHORIZED", 401);
    }

    const versions = await listOwnedVersions(prisma, session.user.id);
    return jsonOk({ versions }, { status: 200 });
  } catch (error) {
    return handleRouteError("GET /api/versions", error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return jsonError("UNAUTHORIZED", 401);
    }

    const body = await request.json();
    const input = versionSchema.parse(body);
    const version = await createOwnedVersion(prisma, session.user.id, input);

    return jsonOk({ version }, { status: 201 });
  } catch (error) {
    return handleRouteError("POST /api/versions", error);
  }
}
