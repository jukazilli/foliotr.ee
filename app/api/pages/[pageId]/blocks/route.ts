import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { handleRouteError, jsonError, jsonOk } from "@/lib/server/api";
import { addOwnedPageBlock } from "@/lib/server/domain/templates";
import { pageBlockCreateSchema } from "@/lib/validations";

interface RouteContext {
  params: Promise<{ pageId: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return jsonError("UNAUTHORIZED", 401);
    }

    const { pageId } = await context.params;
    const body = await request.json();
    const input = pageBlockCreateSchema.parse(body);
    const block = await addOwnedPageBlock(prisma, session.user.id, pageId, input);

    return jsonOk({ block }, { status: 201 });
  } catch (error) {
    return handleRouteError("POST /api/pages/[pageId]/blocks", error);
  }
}
