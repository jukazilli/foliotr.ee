import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  getOwnedProfileBase,
  updateOwnedProfileFields,
} from "@/lib/server/domain/profile-base";
import { handleRouteError, jsonError, jsonOk } from "@/lib/server/api";
import { profileBaseSchema, profileSchema } from "@/lib/validations";

const collectionPayloadKeys = [
  "assets",
  "highlights",
  "experiences",
  "educations",
  "skills",
  "projects",
  "achievements",
  "proofs",
  "presentations",
  "links",
] as const;

function hasCollectionPayload(input: Record<string, unknown>) {
  return collectionPayloadKeys.some((key) =>
    Object.prototype.hasOwnProperty.call(input, key)
  );
}

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return jsonError("UNAUTHORIZED", 401);
    }

    const profile = await getOwnedProfileBase(prisma, session.user.id);
    return jsonOk({ profile }, { status: 200 });
  } catch (error) {
    return handleRouteError("GET /api/profile", error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return jsonError("UNAUTHORIZED", 401);
    }

    const body = await request.json();
    const input = profileSchema.parse(body);
    const profile = await updateOwnedProfileFields(prisma, session.user.id, input);

    return jsonOk({ profile }, { status: 200 });
  } catch (error) {
    return handleRouteError("PATCH /api/profile", error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return jsonError("UNAUTHORIZED", 401);
    }

    const body = await request.json();
    const input = profileBaseSchema.parse(body);

    if (hasCollectionPayload(input)) {
      return jsonError("BAD_REQUEST", 400, {
        message:
          "Colecoes grandes devem ser atualizadas por /api/profile/collections/[collection]",
      });
    }

    const profile = await updateOwnedProfileFields(prisma, session.user.id, input);

    return jsonOk({ profile }, { status: 200 });
  } catch (error) {
    return handleRouteError("PUT /api/profile", error);
  }
}
