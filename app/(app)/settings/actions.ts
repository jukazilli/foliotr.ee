"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { passwordSchema } from "@/lib/validations";
import { z } from "zod";

export type DeleteAccountActionState = {
  error: string | null;
};

const deleteAccountSchema = z.object({
  confirmation: z
    .string()
    .trim()
    .refine((value) => value === "DELETAR", {
      message: 'Digite "DELETAR" para confirmar.',
    }),
  password: passwordSchema,
});

export async function deleteAccountAction(
  _prevState: DeleteAccountActionState,
  formData: FormData
): Promise<DeleteAccountActionState> {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const parsed = deleteAccountSchema.safeParse({
    confirmation: formData.get("confirmation"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Nao foi possivel validar a exclusao da conta.",
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      passwordHash: true,
    },
  });

  if (!user?.passwordHash) {
    return {
      error: "Nao foi possivel validar sua senha. Entre em contato com o suporte.",
    };
  }

  const passwordMatches = await bcrypt.compare(parsed.data.password, user.passwordHash);

  if (!passwordMatches) {
    return {
      error: "Senha incorreta.",
    };
  }

  await prisma.user.delete({
    where: { id: user.id },
  });

  await signOut({ redirectTo: "/login" });

  return {
    error: null,
  };
}
