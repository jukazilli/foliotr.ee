import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { handleRouteError, jsonError, jsonOk } from "@/lib/server/api";
import {
  removeOwnedPageBlock,
  updateOwnedPageBlock,
} from "@/lib/server/domain/templates";
import { pageBlockUpdateSchema } from "@/lib/validations";

interface RouteContext {
  params: Promise<{ pageId: string; blockId: string }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return jsonError("UNAUTHORIZED", 401);
    }

    const { pageId, blockId } = await context.params;
    const body = await request.json();
    const input = pageBlockUpdateSchema.parse(body);
    const block = await updateOwnedPageBlock(
      prisma,
      session.user.id,
      pageId,
      blockId,
      input
    );

    return jsonOk({ block }, { status: 200 });
  } catch (error) {
    return handleRouteError("PATCH /api/pages/[pageId]/blocks/[blockId]", error);
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return jsonError("UNAUTHORIZED", 401);
    }

    const { pageId, blockId } = await context.params;
    const block = await removeOwnedPageBlock(prisma, session.user.id, pageId, blockId);

    return jsonOk({ block }, { status: 200 });
  } catch (error) {
    return handleRouteError("DELETE /api/pages/[pageId]/blocks/[blockId]", error);
  }
}
