"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { normalizeUsernameInput } from "@/lib/usernames";

interface OnboardingWizardProps {
  initialProfile: {
    displayName: string;
    username: string;
    headline: string;
    bio: string;
    location: string;
    openToOpportunities: boolean;
    opportunityMotivation: string;
  };
}

type Step = 1 | 2 | 3;

export function OnboardingWizard({ initialProfile }: OnboardingWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState(initialProfile);
  const [currentRole, setCurrentRole] = useState("");
  const [currentCompany, setCurrentCompany] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const progress = useMemo(() => Math.round((step / 3) * 100), [step]);

  function updateField(field: keyof typeof form, value: string | boolean) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function validateCurrentStep() {
    if (step === 1) {
      if (!form.username || !form.displayName) {
        return "Informe seu usuario e nome publico para continuar.";
      }
    }

    if (step === 2 && form.headline.trim().length < 5) {
      return "Informe uma profissao ou titulo com pelo menos 5 caracteres.";
    }

    return null;
  }

  function nextStep() {
    const validationError = validateCurrentStep();

    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setStep((current) => Math.min(3, current + 1) as Step);
  }

  async function finish() {
    const validationError = validateCurrentStep();

    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsSubmitting(true);

    const username = normalizeUsernameInput(form.username);
    const response = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        displayName: form.displayName,
        headline: form.headline,
        bio: form.bio,
        location: form.location,
        currentRole,
        currentCompany,
        openToOpportunities: form.openToOpportunities,
        opportunityMotivation: form.opportunityMotivation,
      }),
    }).catch(() => null);

    setIsSubmitting(false);

    if (!response?.ok) {
      const body = await response?.json().catch(() => null);
      setError(
        body?.error?.details?.message ??
          body?.error?.message ??
          "Nao foi possivel concluir seu onboarding."
      );
      return;
    }

    router.push(`/${username}`);
    router.refresh();
  }

  return (
    <section className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <aside className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-neutral-500">
          Configuracao inicial
        </p>
        <h1 className="mt-3 text-3xl font-bold text-neutral-950">
          Monte a base do seu perfil publico
        </h1>
        <p className="mt-3 text-sm leading-6 text-neutral-600">
          Primeiro criamos a conta. Agora completamos o minimo para sua pagina publica
          existir com contexto, localizacao e status profissional.
        </p>

        <div className="mt-6 h-2 rounded-full bg-neutral-100" aria-hidden="true">
          <div
            className="h-full rounded-full bg-neutral-950 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <ol className="mt-6 space-y-3 text-sm text-neutral-700">
          <li className={step === 1 ? "font-semibold text-neutral-950" : undefined}>
            1. Identidade publica
          </li>
          <li className={step === 2 ? "font-semibold text-neutral-950" : undefined}>
            2. Perfil base
          </li>
          <li className={step === 3 ? "font-semibold text-neutral-950" : undefined}>
            3. Status profissional
          </li>
        </ol>
      </aside>

      <form
        className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
        onSubmit={(event) => {
          event.preventDefault();
          if (step < 3) {
            nextStep();
          } else {
            void finish();
          }
        }}
      >
        {step === 1 ? (
          <fieldset className="space-y-4">
            <legend className="text-xl font-semibold text-neutral-950">
              Como as pessoas vao te encontrar
            </legend>
            <label
              className="block text-sm font-medium text-neutral-700"
              htmlFor="onboarding-username"
            >
              Usuario
            </label>
            <input
              id="onboarding-username"
              className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-950"
              value={form.username}
              onChange={(event) =>
                updateField("username", normalizeUsernameInput(event.target.value))
              }
              autoComplete="username"
              required
            />
            <label
              className="block text-sm font-medium text-neutral-700"
              htmlFor="onboarding-name"
            >
              Nome publico
            </label>
            <input
              id="onboarding-name"
              className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-950"
              value={form.displayName}
              onChange={(event) => updateField("displayName", event.target.value)}
              autoComplete="name"
              required
            />
          </fieldset>
        ) : null}

        {step === 2 ? (
          <fieldset className="space-y-4">
            <legend className="text-xl font-semibold text-neutral-950">
              Dados que aparecem no topo do perfil
            </legend>
            <label
              className="block text-sm font-medium text-neutral-700"
              htmlFor="onboarding-headline"
            >
              Profissao ou titulo
            </label>
            <input
              id="onboarding-headline"
              className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-950"
              value={form.headline}
              onChange={(event) => updateField("headline", event.target.value)}
              placeholder="Analista de sistemas, designer, desenvolvedor..."
              required
            />
            <label
              className="block text-sm font-medium text-neutral-700"
              htmlFor="onboarding-bio"
            >
              Apresentacao curta
            </label>
            <textarea
              id="onboarding-bio"
              className="min-h-28 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-950"
              value={form.bio}
              onChange={(event) => updateField("bio", event.target.value)}
              maxLength={500}
              placeholder="Conte em poucas linhas o que voce faz e que tipo de projeto procura."
            />
            <label
              className="block text-sm font-medium text-neutral-700"
              htmlFor="onboarding-location"
            >
              Localizacao
            </label>
            <input
              id="onboarding-location"
              className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-950"
              value={form.location}
              onChange={(event) => updateField("location", event.target.value)}
              placeholder="Joinville/SC"
            />
          </fieldset>
        ) : null}

        {step === 3 ? (
          <fieldset className="space-y-4">
            <legend className="text-xl font-semibold text-neutral-950">
              Contexto profissional
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  className="block text-sm font-medium text-neutral-700"
                  htmlFor="onboarding-role"
                >
                  Cargo atual
                </label>
                <input
                  id="onboarding-role"
                  className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-950"
                  value={currentRole}
                  onChange={(event) => setCurrentRole(event.target.value)}
                  placeholder="Analista de sistemas"
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium text-neutral-700"
                  htmlFor="onboarding-company"
                >
                  Empresa atual
                </label>
                <input
                  id="onboarding-company"
                  className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-950"
                  value={currentCompany}
                  onChange={(event) => setCurrentCompany(event.target.value)}
                  placeholder="TOTVS SC"
                />
              </div>
            </div>
            <label className="flex items-center gap-3 rounded-xl border border-neutral-200 p-4 text-sm text-neutral-700">
              <input
                type="checkbox"
                checked={form.openToOpportunities}
                onChange={(event) =>
                  updateField("openToOpportunities", event.target.checked)
                }
              />
              Aberto a oportunidades
            </label>
            <label
              className="block text-sm font-medium text-neutral-700"
              htmlFor="onboarding-motivation"
            >
              O que faria voce mudar de emprego
            </label>
            <textarea
              id="onboarding-motivation"
              className="min-h-24 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-950"
              value={form.opportunityMotivation}
              onChange={(event) =>
                updateField("opportunityMotivation", event.target.value)
              }
              maxLength={500}
              placeholder="Uma oportunidade na area de inovacao e tecnologia."
            />
          </fieldset>
        ) : null}

        {error ? (
          <p
            className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            className="rounded-full border border-neutral-200 px-5 py-2 text-sm font-semibold text-neutral-700 disabled:opacity-40"
            disabled={step === 1 || isSubmitting}
            onClick={() => setStep((current) => Math.max(1, current - 1) as Step)}
          >
            Voltar
          </button>
          <button
            type="submit"
            className="rounded-full bg-neutral-950 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Salvando..."
              : step === 3
                ? "Publicar base do perfil"
                : "Continuar"}
          </button>
        </div>
      </form>
    </section>
  );
}
