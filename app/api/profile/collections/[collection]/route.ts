import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  type ProfileCollectionKey,
  updateOwnedProfileCollection,
} from "@/lib/server/domain/profile-base";
import { handleRouteError, jsonError, jsonOk } from "@/lib/server/api";
import {
  achievementSchema,
  experienceSchema,
  highlightSchema,
  profileLinkSchema,
  projectSchema,
  proofSchema,
  skillSchema,
} from "@/lib/validations";

const collectionSchemaMap = {
  highlights: z.object({ items: z.array(highlightSchema) }),
  experiences: z.object({ items: z.array(experienceSchema) }),
  skills: z.object({ items: z.array(skillSchema) }),
  projects: z.object({ items: z.array(projectSchema) }),
  achievements: z.object({ items: z.array(achievementSchema) }),
  proofs: z.object({ items: z.array(proofSchema) }),
  links: z.object({ items: z.array(profileLinkSchema) }),
} satisfies Record<ProfileCollectionKey, z.ZodType<{ items: unknown[] }>>;

function isProfileCollectionKey(value: string): value is ProfileCollectionKey {
  return Object.prototype.hasOwnProperty.call(collectionSchemaMap, value);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ collection: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return jsonError("UNAUTHORIZED", 401);
    }

    const { collection } = await context.params;

    if (!isProfileCollectionKey(collection)) {
      return jsonError("NOT_FOUND", 404);
    }

    const body = await request.json();
    const parsed = collectionSchemaMap[collection].parse(body);
    const items = await updateOwnedProfileCollection(
      prisma,
      session.user.id,
      collection,
      parsed.items
    );

    return jsonOk({ collection, items }, { status: 200 });
  } catch (error) {
    return handleRouteError("PUT /api/profile/collections/[collection]", error);
  }
}
