"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { RedesignFooter, RedesignHeader } from "@/components/landing/RedesignShell";
import { normalizeUsernameInput } from "@/lib/usernames";

const educationOptions = [
  "Ensino médio",
  "Técnico",
  "Graduação",
  "Pós-graduação",
  "Mestrado",
  "Doutorado",
  "Outro",
];

const carouselImages = [
  "/redesign/nicetomeet.gif",
  "/redesign/calmdog.gif",
  "/redesign/joinus1.gif",
  "/redesign/handcomputador.gif",
];

type AvailabilityResponse = {
  username?: {
    available: boolean;
    username: string;
    message?: string;
    suggestions?: string[];
  };
  email?: {
    available: boolean;
    email: string;
    message?: string;
  } | null;
};

type AvailabilityStatus = "idle" | "checking" | "available" | "taken" | "error";

function getSafeRedirect(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard";
  }

  return value;
}

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialUsername = useMemo(
    () => normalizeUsernameInput(searchParams.get("username") ?? ""),
    [searchParams]
  );
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    username: initialUsername,
    name: "",
    email: "",
    birthDate: "",
    country: "",
    city: "",
    state: "",
    profession: "",
    education: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [usernameStatus, setUsernameStatus] = useState<AvailabilityStatus>("idle");
  const [usernameMessage, setUsernameMessage] = useState("");
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);
  const [emailMessage, setEmailMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  useEffect(() => {
    if (step !== 1) return;

    const username = normalizeUsernameInput(form.username);
    setUsernameSuggestions([]);

    if (!username) {
      setUsernameStatus("idle");
      setUsernameMessage("");
      return;
    }

    if (username.length < 3) {
      setUsernameStatus("idle");
      setUsernameMessage("Username deve ter pelo menos 3 caracteres.");
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      setUsernameStatus("checking");
      setUsernameMessage("Verificando username...");

      fetch(`/api/register?username=${encodeURIComponent(username)}`, {
        method: "GET",
        signal: controller.signal,
      })
        .then(async (response) => {
          const body = (await response.json().catch(() => null)) as
            | (AvailabilityResponse & {
                error?: { message?: string; details?: { message?: string } };
              })
            | null;

          if (!response.ok) {
            throw new Error(
              body?.error?.details?.message ??
                body?.error?.message ??
                "Não foi possível validar o username."
            );
          }

          if (!body?.username) return;

          if (body.username.available) {
            setUsernameStatus("available");
            setUsernameMessage("Username disponível.");
            setUsernameSuggestions([]);
            return;
          }

          setUsernameStatus("taken");
          setUsernameMessage(body.username.message ?? "Esse username já está em uso.");
          setUsernameSuggestions(body.username.suggestions ?? []);
        })
        .catch((requestError: unknown) => {
          if (controller.signal.aborted) return;

          setUsernameStatus("error");
          setUsernameMessage(
            requestError instanceof Error
              ? requestError.message
              : "Não foi possível validar o username."
          );
        });
    }, 350);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [form.username, step]);

  function validateCurrentStep() {
    if (step === 1) {
      if (!form.username || !form.name || !form.email || !form.birthDate) {
        return "Preencha os dados principais para continuar.";
      }
    }

    if (step === 2) {
      if (!form.country || !form.city || !form.state) {
        return "Preencha sua localização para continuar.";
      }
    }

    if (step === 3) {
      if (!form.profession || !form.education || !form.password || !form.confirmPassword) {
        return "Preencha o perfil profissional e a senha para finalizar.";
      }

      if (form.password.length < 8) {
        return "A senha deve ter pelo menos 8 caracteres.";
      }

      if (form.password !== form.confirmPassword) {
        return "As senhas não coincidem.";
      }
    }

    return null;
  }

  function previousStep() {
    setError(null);
    setStep((current) => Math.max(1, current - 1));
  }

  function applyUsernameSuggestion(suggestion: string) {
    updateField("username", suggestion);
    setUsernameSuggestions([]);
    setUsernameMessage("");
    setUsernameStatus("idle");
    setError(null);
  }

  async function validateAccountIdentity() {
    setUsernameSuggestions([]);
    setEmailMessage("");

    const username = normalizeUsernameInput(form.username);
    updateField("username", username);

    const params = new URLSearchParams({
      username,
      email: form.email,
    });
    const response = await fetch(`/api/register?${params.toString()}`, {
      method: "GET",
    }).catch(() => null);
    const body = (await response?.json().catch(() => null)) as
      | (AvailabilityResponse & {
          error?: { message?: string; details?: { message?: string } };
        })
      | null;

    if (!response?.ok) {
      return (
        body?.error?.details?.message ??
        body?.error?.message ??
        "Não foi possível validar os dados. Tente novamente."
      );
    }

    const availability = body;

    if (availability?.email && !availability.email.available) {
      setEmailMessage(availability.email.message ?? "Esse email já está em uso.");
      return availability.email.message ?? "Esse email já está em uso.";
    }

    if (availability?.username && !availability.username.available) {
      setUsernameStatus("taken");
      setUsernameMessage(availability.username.message ?? "Esse username já está em uso.");
      setUsernameSuggestions(availability.username.suggestions ?? []);
      return availability.username.message ?? "Esse username já está em uso.";
    }

    setUsernameStatus("available");
    setUsernameMessage("Username disponível.");
    setEmailMessage("Email disponível.");
    return null;
  }

  async function submit() {
    const validationError = validateCurrentStep();

    if (validationError) {
      setError(validationError);
      return;
    }

    if (step < 3) {
      if (step === 1) {
        setIsSubmitting(true);
        const availabilityError = await validateAccountIdentity();
        setIsSubmitting(false);

        if (availabilityError) {
          setError(availabilityError);
          return;
        }
      }

      setError(null);
      setStep((current) => current + 1);
      return;
    }

    setError(null);
    setIsSubmitting(true);

    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: normalizeUsernameInput(form.username),
        name: form.name,
        email: form.email,
        birthDate: form.birthDate,
        country: form.country,
        city: form.city,
        state: form.state,
        profession: form.profession,
        education: form.education,
        password: form.password,
        confirmPassword: form.confirmPassword,
      }),
    }).catch(() => null);

    if (!response?.ok) {
      const body = await response?.json().catch(() => null);
      setIsSubmitting(false);
      const details = body?.error?.details;
      const message =
        details?.message ??
        body?.error?.message ??
        "Não foi possível criar a conta. Verifique os dados e tente novamente.";

      if (details?.field === "username" && Array.isArray(details?.suggestions)) {
        setUsernameSuggestions(details.suggestions);
        setUsernameMessage(message);
        setStep(1);
      }

      if (details?.field === "email") {
        setEmailMessage(message);
        setStep(1);
      }

      setError(message);
      return;
    }

    const signInResult = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    if (signInResult?.error) {
      setIsSubmitting(false);
      setError("Conta criada, mas não foi possível entrar automaticamente.");
      return;
    }

    setSuccess(true);
    router.push(getSafeRedirect(searchParams.get("redirect") ?? searchParams.get("callbackUrl")));
  }

  return (
    <section className="signup-screen" id="signup" aria-labelledby="signup-title">
      <div className="signup-panel">
        <div className="login-copy signup-copy">
          <p className="eyebrow">Criar conta grátis</p>
          <h1 id="signup-title">Vamos montar seu Linkfolio</h1>
          <p>Preencha os dados básicos para reservar seu usuário e abrir seu editor.</p>
        </div>

        <form
          className={`signup-form${success ? " is-complete" : ""}`}
          id="signup-form"
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
        >
          <div className="signup-progress" aria-label="Progresso do cadastro">
            {[1, 2, 3].map((item) => (
              <span
                key={item}
                className={step === item ? "is-active" : step > item ? "is-complete" : undefined}
                data-step-dot={item}
              >
                {item}
              </span>
            ))}
          </div>

          <fieldset className={`signup-step${step === 1 ? " is-active" : ""}`} data-signup-step="1" hidden={step !== 1}>
            <legend>Dados principais</legend>

            <label htmlFor="signup-username">Usuário</label>
            <div className="signup-username-field">
              <span>linkfolio.co/@</span>
              <input
              id="signup-username"
                name="username"
                type="text"
                placeholder="ana"
                autoComplete="username"
                value={form.username}
                onChange={(event) => updateField("username", normalizeUsernameInput(event.target.value))}
                disabled={step !== 1 || isSubmitting}
                aria-invalid={usernameStatus === "taken"}
                aria-describedby={usernameMessage ? "signup-username-status" : undefined}
                required
              />
            </div>
            {usernameMessage ? (
              <p
                className="signup-success"
                id="signup-username-status"
                role={usernameStatus === "taken" || usernameStatus === "error" ? "alert" : "status"}
              >
                {usernameMessage}
              </p>
            ) : null}
            {usernameSuggestions.length > 0 ? (
              <div className="signup-success" aria-label="Sugestões de username disponíveis">
                {usernameSuggestions.map((suggestion) => (
                  <button
                    className="button signup-back"
                    key={suggestion}
                    type="button"
                    onClick={() => applyUsernameSuggestion(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            ) : null}

            <label htmlFor="signup-name">Nome</label>
            <input
              id="signup-name"
              name="name"
              type="text"
              placeholder="Seu nome"
              autoComplete="name"
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              disabled={step !== 1 || isSubmitting}
              required
            />
            {emailMessage ? (
              <p className="signup-success" role={emailMessage.includes("uso") ? "alert" : "status"}>
                {emailMessage}
              </p>
            ) : null}

            <label htmlFor="signup-email">Email</label>
            <input
              id="signup-email"
              name="email"
              type="email"
              placeholder="voce@email.com"
              autoComplete="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              disabled={step !== 1 || isSubmitting}
              required
            />

            <label htmlFor="signup-birthdate">Data de nascimento</label>
            <input
              id="signup-birthdate"
              name="birthdate"
              type="date"
              value={form.birthDate}
              onChange={(event) => updateField("birthDate", event.target.value)}
              disabled={step !== 1 || isSubmitting}
              required
            />
          </fieldset>

          <fieldset className={`signup-step${step === 2 ? " is-active" : ""}`} data-signup-step="2" hidden={step !== 2}>
            <legend>Localização</legend>

            <label htmlFor="signup-country">País</label>
            <input
              id="signup-country"
              name="country"
              type="text"
              placeholder="Brasil"
              autoComplete="country-name"
              value={form.country}
              onChange={(event) => updateField("country", event.target.value)}
              disabled={step !== 2 || isSubmitting}
              required
            />

            <label htmlFor="signup-city">Cidade</label>
            <input
              id="signup-city"
              name="city"
              type="text"
              placeholder="São Paulo"
              autoComplete="address-level2"
              value={form.city}
              onChange={(event) => updateField("city", event.target.value)}
              disabled={step !== 2 || isSubmitting}
              required
            />

            <label htmlFor="signup-state">Estado</label>
            <input
              id="signup-state"
              name="state"
              type="text"
              placeholder="SP"
              autoComplete="address-level1"
              value={form.state}
              onChange={(event) => updateField("state", event.target.value)}
              disabled={step !== 2 || isSubmitting}
              required
            />
          </fieldset>

          <fieldset className={`signup-step${step === 3 ? " is-active" : ""}`} data-signup-step="3" hidden={step !== 3}>
            <legend>Perfil profissional</legend>

            <label htmlFor="signup-profession">Profissão</label>
            <input
              id="signup-profession"
              name="profession"
              type="text"
              placeholder="Product Designer"
              value={form.profession}
              onChange={(event) => updateField("profession", event.target.value)}
              disabled={step !== 3 || isSubmitting}
              required
            />

            <label htmlFor="signup-education">Grau de escolaridade</label>
            <select
              id="signup-education"
              name="education"
              value={form.education}
              onChange={(event) => updateField("education", event.target.value)}
              disabled={step !== 3 || isSubmitting}
              required
            >
              <option value="">Selecione</option>
              {educationOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <label htmlFor="signup-password">Senha</label>
            <input
              id="signup-password"
              name="password"
              type="password"
              placeholder="Mínimo de 8 caracteres"
              autoComplete="new-password"
              value={form.password}
              onChange={(event) => updateField("password", event.target.value)}
              disabled={step !== 3 || isSubmitting}
              required
            />

            <label htmlFor="signup-confirm-password">Confirmar senha</label>
            <input
              id="signup-confirm-password"
              name="confirmPassword"
              type="password"
              placeholder="Repita a senha"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={(event) => updateField("confirmPassword", event.target.value)}
              disabled={step !== 3 || isSubmitting}
              required
            />
          </fieldset>

          {error ? (
            <p className="signup-success" role="alert">
              {error}
            </p>
          ) : null}

          <p className="signup-success" role="status" aria-live="polite" hidden={!success}>
            Conta criada. Seu Linkfolio já está reservado.
          </p>

          <div className="signup-actions">
            <button
              className="button signup-back"
              type="button"
              data-signup-back
              disabled={step === 1 || isSubmitting}
              onClick={previousStep}
            >
              Voltar
            </button>
            <button
              className="button signup-next"
              type="submit"
              data-signup-next
              disabled={isSubmitting || (step === 1 && (usernameStatus === "checking" || usernameStatus === "taken"))}
            >
              {isSubmitting ? "Finalizando..." : step === 3 ? "Finalizar" : "Avançar"}
            </button>
          </div>

          <p className="back-to-login">
            Já tem conta? <Link href="/login">Entrar</Link>
          </p>
        </form>
      </div>

      <div className="signup-art" aria-label="Ilustrações animadas para criar conta">
        <div className="signup-carousel" aria-hidden="true">
          <div className="signup-carousel-track">
            {[...carouselImages, ...carouselImages].map((src, index) => (
              <figure className="signup-carousel-slide" key={`${src}-${index}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" />
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function RegisterPage() {
  return (
    <>
      <RedesignHeader />
      <main>
        <Suspense fallback={<div className="signup-screen" aria-hidden="true" />}>
          <RegisterContent />
        </Suspense>
      </main>
      <RedesignFooter />
    </>
  );
}
