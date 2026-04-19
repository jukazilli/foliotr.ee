"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerSchema, type RegisterInput } from "@/lib/validations";

function getRegisterErrorMessage(status: number): string {
  if (status === 429) {
    return "Muitas tentativas. Aguarde alguns instantes e tente novamente.";
  }

  return "Não foi possível criar a conta. Verifique os dados e tente novamente.";
}

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterInput) {
    setServerError(null);

    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).catch(() => null);

    if (!response?.ok) {
      setServerError(
        response
          ? getRegisterErrorMessage(response.status)
          : "Não foi possível criar a conta. Tente novamente."
      );
      return;
    }

    const signInResult = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (signInResult?.error) {
      setServerError(
        "Conta criada, mas não foi possível entrar automaticamente. Tente fazer login."
      );
      return;
    }

    router.push("/onboarding");
  }

  return (
    <div className="space-y-7">
      <div>
        <p className="font-data text-xs font-semibold uppercase text-blue-700">
          Criar conta
        </p>
        <h1 className="mt-3 font-display text-4xl font-extrabold leading-tight text-neutral-950">
          Comece pelo básico.
        </h1>
        <p className="mt-3 text-sm font-semibold leading-6 text-neutral-600">
          Crie sua base profissional inicial. Depois você ajusta página, currículo e
          versões.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="name">Nome</Label>
          <Input
            id="name"
            type="text"
            placeholder="Ana Souza"
            autoComplete="name"
            error={!!errors.name}
            disabled={isSubmitting}
            {...register("name")}
          />
          {errors.name && (
            <p className="text-xs font-semibold text-coral-700">
              {errors.name.message}
            </p>
          )}
        </div>

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

        <div className="space-y-1.5">
          <Label htmlFor="password">Senha</Label>
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
          <Label htmlFor="confirmPassword">Confirmar senha</Label>
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

        {serverError && (
          <div
            className="rounded-2xl border border-coral-200 bg-coral-50 px-4 py-3"
            role="alert"
            aria-live="polite"
          >
            <p className="text-sm font-semibold text-coral-900">{serverError}</p>
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isSubmitting}
          className="w-full rounded-full"
        >
          Criar conta
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </form>

      <p className="text-center text-sm font-semibold text-neutral-600">
        Já tem conta?{" "}
        <Link
          href="/login"
          className="font-bold text-blue-700 hover:text-blue-900 hover:underline"
        >
          Entrar
        </Link>
      </p>
    </div>
  );
}
