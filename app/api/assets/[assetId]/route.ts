import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { deleteOwnedAsset, updateOwnedAsset } from "@/lib/server/domain/assets";
import { handleRouteError, jsonError, jsonOk } from "@/lib/server/api";
import { assetInputSchema } from "@/lib/validations";

interface RouteContext {
  params: Promise<{ assetId: string }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return jsonError("UNAUTHORIZED", 401);
    }

    const { assetId } = await context.params;
    const body = await request.json();
    const input = assetInputSchema.parse(body);
    const asset = await updateOwnedAsset(prisma, session.user.id, assetId, input);

    return jsonOk({ asset }, { status: 200 });
  } catch (error) {
    return handleRouteError("PATCH /api/assets/[assetId]", error);
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return jsonError("UNAUTHORIZED", 401);
    }

    const { assetId } = await context.params;
    const result = await deleteOwnedAsset(prisma, session.user.id, assetId);

    return jsonOk(result, { status: 200 });
  } catch (error) {
    return handleRouteError("DELETE /api/assets/[assetId]", error);
  }
}
