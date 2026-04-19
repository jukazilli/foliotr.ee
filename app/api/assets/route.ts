import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createOwnedAsset } from "@/lib/server/domain/assets";
import { handleRouteError, jsonError, jsonOk } from "@/lib/server/api";
import { assetInputSchema } from "@/lib/validations";

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
