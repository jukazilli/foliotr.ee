import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { handleRouteError, jsonError, jsonOk } from "@/lib/server/api";
import { nullableAssetUrlSchema } from "@/lib/validations";

export const runtime = "nodejs";

const projectCoverPatchSchema = z.object({
  imageUrl: nullableAssetUrlSchema.optional(),
  coverAssetId: z.string().cuid().nullable().optional(),
  coverFitMode: z.enum(["fit", "fill", "crop"]).optional(),
  coverPositionX: z.coerce.number().int().min(0).max(100).optional(),
  coverPositionY: z.coerce.number().int().min(0).max(100).optional(),
});

interface ProjectCoverRouteProps {
  params: Promise<{ projectId: string }>;
}

export async function PATCH(request: Request, { params }: ProjectCoverRouteProps) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return jsonError("UNAUTHORIZED", 401);
    }

    const { projectId } = await params;
    const payload = projectCoverPatchSchema.parse(await request.json());
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        profile: {
          userId: session.user.id,
        },
      },
      select: {
        id: true,
        profileId: true,
      },
    });

    if (!project) {
      return jsonError("NOT_FOUND", 404);
    }

    if (payload.coverAssetId) {
      const asset = await prisma.asset.findFirst({
        where: {
          id: payload.coverAssetId,
          profileId: project.profileId,
        },
        select: { id: true },
      });

      if (!asset) {
        return jsonError("FORBIDDEN", 403);
      }
    }

    const updatedProject = await prisma.project.update({
      where: { id: project.id },
      data: {
        imageUrl: payload.imageUrl === undefined ? undefined : payload.imageUrl,
        coverAssetId: payload.coverAssetId === undefined ? undefined : payload.coverAssetId,
        coverFitMode: payload.coverFitMode,
        coverPositionX: payload.coverPositionX,
        coverPositionY: payload.coverPositionY,
      },
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        url: true,
        repoUrl: true,
        tags: true,
        featured: true,
        coverAssetId: true,
        coverFitMode: true,
        coverPositionX: true,
        coverPositionY: true,
        startDate: true,
        endDate: true,
        order: true,
      },
    });

    return jsonOk({ project: updatedProject });
  } catch (error) {
    return handleRouteError("PATCH /api/profile/projects/[projectId]/cover", error);
  }
}
