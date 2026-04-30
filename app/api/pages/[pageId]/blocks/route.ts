import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { handleRouteError, jsonError, jsonOk } from "@/lib/server/api";
import { addOwnedPageBlock, replaceOwnedPageBlocks } from "@/lib/server/domain/templates";
import { rateLimitResponse } from "@/lib/security/api-rate-limit";
import { APP_MUTATION_RATE_LIMIT } from "@/lib/security/rate-limit";
import { pageBlockBulkSaveSchema, pageBlockCreateSchema } from "@/lib/validations";

interface RouteContext {
  params: Promise<{ pageId: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return jsonError("UNAUTHORIZED", 401);
    }

    const limited = await rateLimitResponse(
      request,
      "pages:blocks:create",
      session.user.id,
      APP_MUTATION_RATE_LIMIT
    );
    if (limited) return limited;

    const { pageId } = await context.params;
    const body = await request.json();
    const input = pageBlockCreateSchema.parse(body);
    const block = await addOwnedPageBlock(prisma, session.user.id, pageId, input);

    return jsonOk({ block }, { status: 201 });
  } catch (error) {
    return handleRouteError("POST /api/pages/[pageId]/blocks", error);
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return jsonError("UNAUTHORIZED", 401);
    }

    const limited = await rateLimitResponse(
      request,
      "pages:blocks:replace",
      session.user.id,
      APP_MUTATION_RATE_LIMIT
    );
    if (limited) return limited;

    const { pageId } = await context.params;
    const body = await request.json();
    const input = pageBlockBulkSaveSchema.parse(body);
    const blocks = await replaceOwnedPageBlocks(prisma, session.user.id, pageId, input);

    return jsonOk({ blocks }, { status: 200 });
  } catch (error) {
    return handleRouteError("PUT /api/pages/[pageId]/blocks", error);
  }
}
