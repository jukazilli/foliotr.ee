import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { profileSchema } from "@/lib/validations";
import { ZodError } from "zod";

/**
 * GET /api/profile
 * Returns the authenticated user's full profile with all relations.
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json(
        { error: "Não autorizado." },
        { status: 401 }
      );
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            name: true,
            createdAt: true,
          },
        },
        experiences: {
          orderBy: { order: "asc" },
        },
        educations: {
          orderBy: { order: "asc" },
        },
        skills: {
          orderBy: { order: "asc" },
        },
        projects: {
          orderBy: { order: "asc" },
        },
        achievements: {
          orderBy: { order: "asc" },
        },
        links: {
          orderBy: { order: "asc" },
        },
        proofs: {
          orderBy: { order: "asc" },
        },
        versions: {
          orderBy: { createdAt: "asc" },
          include: {
            pages: {
              include: {
                template: true,
                blocks: {
                  orderBy: { order: "asc" },
                },
              },
            },
            resumeConfig: true,
          },
        },
        assets: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!profile) {
      return Response.json(
        { error: "Perfil não encontrado." },
        { status: 404 }
      );
    }

    return Response.json({ profile }, { status: 200 });
  } catch (error) {
    console.error("[GET /api/profile]", error);
    return Response.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/profile
 * Updates the authenticated user's profile fields.
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json(
        { error: "Não autorizado." },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate with profileSchema
    const data = profileSchema.parse(body);

    // Filter out undefined values so we only update fields that were provided
    const updateData = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== undefined)
    );

    // Convert empty strings to null for optional URL/email fields
    const sanitized = Object.fromEntries(
      Object.entries(updateData).map(([key, value]) => [
        key,
        value === "" ? null : value,
      ])
    );

    const updated = await prisma.profile.update({
      where: { userId: session.user.id },
      data: sanitized,
    });

    return Response.json({ profile: updated }, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        { error: "Dados inválidos.", details: error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    console.error("[PATCH /api/profile]", error);
    return Response.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
