import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getOwnedProfileBase, updateOwnedProfileBase } from "@/lib/server/domain/profile-base";
import { handleRouteError, jsonError, jsonOk } from "@/lib/server/api";
import { profileBaseSchema, profileSchema } from "@/lib/validations";

const collectionPayloadKeys = [
  "assets",
  "highlights",
  "experiences",
  "skills",
  "projects",
  "achievements",
  "proofs",
  "links",
] as const;

function hasCollectionPayload(input: Record<string, unknown>) {
  return collectionPayloadKeys.some((key) => Object.prototype.hasOwnProperty.call(input, key));
}

function sanitizeNullable(value: string | null | undefined) {
  if (value === undefined) return undefined;
  if (value === "") return null;
  return value;
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
    const profile = await updateOwnedProfileBase(prisma, session.user.id, input);

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

    if (!hasCollectionPayload(input)) {
      const profile = await prisma.profile.update({
        where: { userId: session.user.id },
        data: {
          displayName: sanitizeNullable(input.displayName),
          avatarUrl: sanitizeNullable(input.avatarUrl),
          headline: sanitizeNullable(input.headline),
          bio: sanitizeNullable(input.bio),
          location: sanitizeNullable(input.location),
          pronouns: sanitizeNullable(input.pronouns),
          websiteUrl: sanitizeNullable(input.websiteUrl),
          publicEmail: sanitizeNullable(input.publicEmail),
          phone: sanitizeNullable(input.phone),
          birthDate: input.birthDate ?? null,
        },
        select: {
          id: true,
          displayName: true,
          avatarUrl: true,
          headline: true,
          bio: true,
          location: true,
          pronouns: true,
          websiteUrl: true,
          publicEmail: true,
          phone: true,
          birthDate: true,
        },
      });

      return jsonOk({ profile }, { status: 200 });
    }

    const profile = await updateOwnedProfileBase(prisma, session.user.id, input);

    return jsonOk({ profile }, { status: 200 });
  } catch (error) {
    return handleRouteError("PUT /api/profile", error);
  }
}
