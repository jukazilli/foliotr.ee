"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { ArrowLeft, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations";

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(data: ForgotPasswordInput) {
    setFormError(null);

    const response = await fetch("/api/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).catch(() => null);

    if (response?.status === 429) {
      setFormError("Muitas tentativas. Aguarde alguns instantes e tente novamente.");
      return;
    }

    if (!response?.ok) {
      setFormError("Não foi possível processar a solicitação. Tente novamente.");
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="space-y-7">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-100 text-lime-900">
          <MailCheck className="h-6 w-6" aria-hidden="true" />
        </div>

        <div>
          <p className="font-data text-xs font-semibold uppercase text-blue-700">
            Recuperação solicitada
          </p>
          <h1 className="mt-3 font-display text-4xl font-extrabold leading-tight text-neutral-950">
            Confira seu e-mail.
          </h1>
          <p className="mt-3 text-sm font-semibold leading-6 text-neutral-600">
            Se existir uma conta com esse e-mail, as instruções de recuperação serão
            enviadas. O link expira em 30 minutos.
          </p>
        </div>

        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm font-bold text-blue-700 hover:text-blue-900 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Voltar ao login
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <div>
        <p className="font-data text-xs font-semibold uppercase text-blue-700">
          Esqueci a senha
        </p>
        <h1 className="mt-3 font-display text-4xl font-extrabold leading-tight text-neutral-950">
          Sem problema.
        </h1>
        <p className="mt-3 text-sm font-semibold leading-6 text-neutral-600">
          Informe seu e-mail e prepararemos a recuperação, se a conta existir.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            placeholder="voce@exemplo.com"
            autoComplete="email"
            error={!!errors.email}
            disabled={isSubmitting}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs font-semibold text-coral-700">
              {errors.email.message}
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
          Enviar instruções
        </Button>
      </form>

      <Link
        href="/login"
        className="inline-flex items-center gap-2 text-sm font-bold text-blue-700 hover:text-blue-900 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Voltar ao login
      </Link>
    </div>
  );
}
