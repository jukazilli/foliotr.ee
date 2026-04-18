import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";
import { ZodError } from "zod";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 1. Validate with registerSchema
    const data = registerSchema.parse(body);

    // 2. Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return Response.json(
        { error: "Este e-mail já está em uso." },
        { status: 409 }
      );
    }

    // 3. Hash password with bcrypt (12 rounds)
    const passwordHash = await bcrypt.hash(data.password, 12);

    // 4 & 5. Create User, Profile and default Version in a transaction
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          name: data.name,
          passwordHash,
        },
      });

      const profile = await tx.profile.create({
        data: {
          userId: user.id,
          displayName: data.name,
          onboardingDone: false,
        },
      });

      // 6. Create default Version linked to the profile
      await tx.version.create({
        data: {
          profileId: profile.id,
          name: "Principal",
          isDefault: true,
        },
      });
    });

    // 7. Return success
    return Response.json({ success: true }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        { error: "Dados inválidos.", details: error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    console.error("[POST /api/register]", error);
    return Response.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
