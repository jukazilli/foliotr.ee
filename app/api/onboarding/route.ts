import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { onboardingSchema } from "@/lib/validations";
import { ZodError } from "zod";

export async function POST(request: NextRequest) {
  try {
    // 1. Check auth
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json(
        { error: "Não autorizado." },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await request.json();

    // 2. Validate with onboardingSchema
    const data = onboardingSchema.parse(body);

    // 3. Check if username already exists
    const existingUsername = await prisma.user.findUnique({
      where: { username: data.username },
    });

    if (existingUsername && existingUsername.id !== userId) {
      return Response.json(
        { error: "Este nome de usuário já está em uso." },
        { status: 409 }
      );
    }

    // 4 & 5. Update User.username and Profile in a transaction
    await prisma.$transaction(async (tx) => {
      // 4. Update User username
      await tx.user.update({
        where: { id: userId },
        data: { username: data.username },
      });

      // 5. Update Profile with headline and mark onboarding as done
      await tx.profile.update({
        where: { userId },
        data: {
          headline: data.headline,
          onboardingDone: true,
        },
      });
    });

    // 6. Return success
    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        { error: "Dados inválidos.", details: error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    console.error("[POST /api/onboarding]", error);
    return Response.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
