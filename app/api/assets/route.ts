import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createOwnedAsset, listOwnedAssets } from "@/lib/server/domain/assets";
import { handleRouteError, jsonError, jsonOk } from "@/lib/server/api";
import { assetInputSchema } from "@/lib/validations";

const assetListQuerySchema = z.object({
  kind: z.enum(["IMAGE", "DOCUMENT", "VIDEO", "AUDIO", "OTHER"]).optional(),
  status: z.enum(["PENDING", "READY", "FAILED"]).optional(),
  limit: z.coerce.number().int().min(1).max(96).optional(),
  cursor: z.string().cuid().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return jsonError("UNAUTHORIZED", 401);
    }

    const query = assetListQuerySchema.parse(
      Object.fromEntries(request.nextUrl.searchParams.entries())
    );
    const result = await listOwnedAssets(prisma, session.user.id, query);

    return jsonOk(result);
  } catch (error) {
    return handleRouteError("GET /api/assets", error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return jsonError("UNAUTHORIZED", 401);
    }

    const body = await request.json();
    const input = assetInputSchema.parse(body);
    const asset = await createOwnedAsset(prisma, session.user.id, input);

    return jsonOk({ asset }, { status: 201 });
  } catch (error) {
    return handleRouteError("POST /api/assets", error);
  }
}
