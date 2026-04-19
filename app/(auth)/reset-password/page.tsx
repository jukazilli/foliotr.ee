"use client";

import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [completed, setCompleted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token,
    },
  });

  async function onSubmit(data: ResetPasswordInput) {
    setFormError(null);

    const response = await fetch("/api/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).catch(() => null);

    if (response?.status === 429) {
      setFormError("Muitas tentativas. Aguarde alguns instantes e tente novamente.");
      return;
    }

    if (!response?.ok) {
      setFormError("Esse link não pode ser usado. Solicite uma nova recuperação.");
      return;
    }

    setCompleted(true);
  }

  if (!token) {
    return (
      <div className="space-y-7">
        <div>
          <p className="font-data text-xs font-semibold uppercase text-blue-700">
            Redefinir senha
          </p>
          <h1 className="mt-3 font-display text-4xl font-extrabold leading-tight text-neutral-950">
            Link inválido.
          </h1>
          <p className="mt-3 text-sm font-semibold leading-6 text-neutral-600">
            Solicite uma nova recuperação para receber um link válido e expirável.
          </p>
        </div>
        <Link
          href="/forgot-password"
          className="inline-flex items-center gap-2 text-sm font-bold text-blue-700 hover:text-blue-900 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Solicitar novo link
        </Link>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="space-y-7">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-100 text-lime-900">
          <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
        </div>
        <div>
          <p className="font-data text-xs font-semibold uppercase text-blue-700">
            Senha atualizada
          </p>
          <h1 className="mt-3 font-display text-4xl font-extrabold leading-tight text-neutral-950">
            Acesso recuperado.
          </h1>
          <p className="mt-3 text-sm font-semibold leading-6 text-neutral-600">
            Sua senha foi redefinida. Entre novamente para continuar.
          </p>
        </div>
        <Link
          href="/login"
          className="liquid-button inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-lime-900"
        >
          Ir para o login
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <div>
        <p className="font-data text-xs font-semibold uppercase text-blue-700">
          Redefinir senha
        </p>
        <h1 className="mt-3 font-display text-4xl font-extrabold leading-tight text-neutral-950">
          Crie uma nova senha.
        </h1>
        <p className="mt-3 text-sm font-semibold leading-6 text-neutral-600">
          Use uma senha com pelo menos 8 caracteres. Este link só pode ser usado uma
          vez.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <input type="hidden" value={token} {...register("token")} />

        <div className="space-y-1.5">
          <Label htmlFor="password">Nova senha</Label>
          <Input
            id="password"
            type="password"
            placeholder="Mínimo de 8 caracteres"
            autoComplete="new-password"
            error={!!errors.password}
            disabled={isSubmitting}
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs font-semibold text-coral-700">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Repita a senha"
            autoComplete="new-password"
            error={!!errors.confirmPassword}
            disabled={isSubmitting}
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-xs font-semibold text-coral-700">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {formError && (
          <div
            className="rounded-2xl border border-coral-200 bg-coral-50 px-4 py-3"
            role="alert"
            aria-live="polite"
          >
            <p className="text-sm font-semibold text-coral-900">{formError}</p>
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isSubmitting}
          className="w-full rounded-full"
        >
          Atualizar senha
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="h-96" aria-hidden="true" />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
