import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { handleRouteError, jsonError, jsonOk } from "@/lib/server/api";
import { listCanonicalTemplates } from "@/lib/server/domain/canonical-templates";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return jsonError("UNAUTHORIZED", 401);
    }

    const templates = await listCanonicalTemplates(prisma);
    return jsonOk({ templates }, { status: 200 });
  } catch (error) {
    return handleRouteError("GET /api/templates", error);
  }
}
