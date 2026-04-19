"use client";

import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, type LoginInput } from "@/lib/validations";

function getSafeCallbackUrl(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard";
  }

  return value;
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginInput) {
    setAuthError(null);

    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      setAuthError("Não foi possível entrar. Confira os dados e tente novamente.");
      return;
    }

    router.push(getSafeCallbackUrl(searchParams.get("callbackUrl")));
  }

  return (
    <div className="space-y-7">
      <div>
        <p className="font-data text-xs font-semibold uppercase text-blue-700">
          Entrar
        </p>
        <h1 className="mt-3 font-display text-4xl font-extrabold leading-tight text-neutral-950">
          Bem-vindo de volta.
        </h1>
        <p className="mt-3 text-sm font-semibold leading-6 text-neutral-600">
          Acesse sua base profissional para continuar organizando provas, versões e
          páginas.
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

        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="password">Senha</Label>
            <Link
              href="/forgot-password"
              className="text-xs font-bold text-blue-700 hover:text-blue-900 hover:underline"
            >
              Esqueci a senha
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="Sua senha"
            autoComplete="current-password"
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

        {authError && (
          <div
            className="rounded-2xl border border-coral-200 bg-coral-50 px-4 py-3"
            role="alert"
            aria-live="polite"
          >
            <p className="text-sm font-semibold text-coral-900">{authError}</p>
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isSubmitting}
          className="w-full rounded-full"
        >
          Entrar
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </form>

      <p className="text-center text-sm font-semibold text-neutral-600">
        Ainda não tem conta?{" "}
        <Link
          href="/register"
          className="font-bold text-blue-700 hover:text-blue-900 hover:underline"
        >
          Criar conta
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="h-96" aria-hidden="true" />}>
      <LoginContent />
    </Suspense>
  );
}
