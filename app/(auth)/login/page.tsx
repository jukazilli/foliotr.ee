"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { RedesignFooter, RedesignHeader } from "@/components/landing/RedesignShell";

function getSafeCallbackUrl(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard";
  }

  return value;
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthError(null);
    setIsSubmitting(true);

    const result = await signIn("credentials", {
      email: identifier,
      password,
      redirect: false,
    });

    setIsSubmitting(false);

    if (result?.error) {
      setAuthError("Não foi possível entrar. Confira os dados e tente novamente.");
      return;
    }

    router.push(
      getSafeCallbackUrl(searchParams.get("callbackUrl") ?? searchParams.get("redirect"))
    );
  }

  return (
    <form className="login-form" onSubmit={onSubmit}>
      <label className="sr-only" htmlFor="login-email">
        Email ou nome de usuário
      </label>
      <input
        id="login-email"
        name="email"
        type="text"
        placeholder="Email ou nome de usuário"
        autoComplete="username"
        value={identifier}
        onChange={(event) => setIdentifier(event.target.value)}
        disabled={isSubmitting}
        required
      />

      <label className="sr-only" htmlFor="login-password">
        Senha
      </label>
      <input
        id="login-password"
        name="password"
        type="password"
        placeholder="Senha"
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        disabled={isSubmitting}
        required
      />

      <Link className="forgot-password" href="/forgot-password">
        Esqueci a senha
      </Link>

      {authError ? (
        <p className="signup-success" role="alert">
          {authError}
        </p>
      ) : null}

      <button className="button login-submit" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Entrando..." : "Continuar"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <>
      <RedesignHeader />

      <main>
        <section className="login-screen" id="login" aria-labelledby="login-title">
          <div className="login-panel">
            <div className="login-copy">
              <p className="eyebrow">Acesse sua conta</p>
              <h1 id="login-title">Bem-vindo de volta</h1>
              <p>
                Entre para editar seu portfólio, atualizar versões e acompanhar
                seus links publicados.
              </p>
            </div>

            <Suspense fallback={<div className="login-form" aria-hidden="true" />}>
              <LoginContent />
            </Suspense>
          </div>

          <div className="login-art" aria-label="Ilustração animada do Linkfolio">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/redesign/dog.gif" alt="" aria-hidden="true" />
          </div>
        </section>
      </main>

      <RedesignFooter />
    </>
  );
}
