"use client";

import { useState } from "react";
import Link from "next/link";
import { RedesignFooter, RedesignHeader } from "@/components/landing/RedesignShell";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    const response = await fetch("/api/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => null);

    setIsSubmitting(false);

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

  return (
    <>
      <RedesignHeader />

      <main>
        <section
          className="login-screen forgot-screen"
          id="forgot-password"
          aria-labelledby="forgot-title"
        >
          <div className="login-panel">
            <div className="login-copy">
              <p className="eyebrow">Recuperar acesso</p>
              <h1 id="forgot-title">Esqueceu sua senha?</h1>
              <p>
                Informe o email cadastrado e enviaremos um link seguro para você
                criar uma nova senha.
              </p>
            </div>

            {submitted ? (
              <p className="signup-success" role="status" aria-live="polite">
                Se existir uma conta com esse email, as instruções de recuperação serão
                enviadas. O link expira em 30 minutos.
              </p>
            ) : (
              <form className="login-form password-recovery-form" onSubmit={onSubmit}>
                <label className="sr-only" htmlFor="recovery-email">
                  Email cadastrado
                </label>
                <input
                  id="recovery-email"
                  name="email"
                  type="email"
                  placeholder="Email cadastrado"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={isSubmitting}
                  required
                />

                {formError ? (
                  <p className="signup-success" role="alert">
                    {formError}
                  </p>
                ) : null}

                <button className="button login-submit" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Enviando..." : "Enviar link de recuperação"}
                </button>
              </form>
            )}

            <Link className="back-to-login" href="/login">
              Voltar para o login
            </Link>
          </div>

          <div
            className="login-art forgot-art"
            aria-label="Ilustração animada para recuperação de senha"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/redesign/forgotaJoe.gif" alt="" aria-hidden="true" />
          </div>
        </section>
      </main>

      <RedesignFooter />
    </>
  );
}
