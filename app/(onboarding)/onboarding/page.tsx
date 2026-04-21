"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { CheckCircle2, ChevronRight, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { normalizeUsernameInput } from "@/lib/usernames";
import { z } from "zod";

const step1Schema = z.object({
  username: z
    .string()
    .min(3, "Username deve ter pelo menos 3 caracteres")
    .max(20, "Username deve ter no maximo 20 caracteres")
    .regex(
      /^[a-z0-9._-]+$/,
      "Apenas letras minusculas, numeros, ponto, underline e hifen sao permitidos"
    ),
});

const step2Schema = z.object({
  headline: z
    .string()
    .min(5, "Titulo deve ter pelo menos 5 caracteres")
    .max(120, "Titulo deve ter no maximo 120 caracteres"),
  focus: z.string().optional(),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;
type UsernameAvailability = {
  available: boolean;
  username: string;
  message?: string;
  suggestions?: string[];
};

const FOCUS_OPTIONS = [
  { value: "developer", label: "Desenvolvedor(a)" },
  { value: "designer", label: "Designer" },
  { value: "product", label: "Produto" },
  { value: "marketing", label: "Marketing" },
  { value: "freelancer", label: "Freelancer" },
  { value: "other", label: "Outro" },
];

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="mb-8 flex items-center gap-3">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-all",
              i < current
                ? "bg-lime-500 text-lime-900"
                : i === current
                  ? "bg-green-500 text-green-900"
                  : "bg-neutral-200 text-neutral-500"
            )}
          >
            {i < current ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
          </div>
          {i < total - 1 ? (
            <div
              className={cn(
                "h-px w-12 transition-all",
                i < current ? "bg-lime-500" : "bg-neutral-200"
              )}
            />
          ) : null}
        </div>
      ))}
      <span className="ml-2 text-sm text-neutral-500">
        Passo {current + 1} de {total}
      </span>
    </div>
  );
}

function readApiMessage(body: unknown) {
  if (!body || typeof body !== "object") return null;
  const error = (body as { error?: { message?: string; details?: { message?: string } } }).error;
  return error?.details?.message ?? error?.message ?? null;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [step1Values, setStep1Values] = useState<Step1Data | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [usernameMessage, setUsernameMessage] = useState("");

  const form1 = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
  });

  const form2 = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
  });

  const username = form1.watch("username") ?? "";
  const normalizedUsername = useMemo(() => normalizeUsernameInput(username), [username]);

  async function checkUsername(usernameValue: string) {
    const response = await fetch(
      `/api/username?username=${encodeURIComponent(usernameValue)}`,
      { method: "GET" }
    );
    const body = (await response.json().catch(() => null)) as UsernameAvailability | unknown;

    if (!response.ok) {
      throw new Error(readApiMessage(body) ?? "Nao foi possivel validar o username.");
    }

    return body as UsernameAvailability;
  }

  useEffect(() => {
    setUsernameSuggestions([]);
    setUsernameMessage("");

    if (!username.trim()) {
      setUsernameStatus("idle");
      return;
    }

    const parsed = step1Schema.shape.username.safeParse(normalizedUsername);
    if (!parsed.success) {
      setUsernameStatus("idle");
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      setUsernameStatus("checking");
      fetch(`/api/username?username=${encodeURIComponent(normalizedUsername)}`, {
        method: "GET",
        signal: controller.signal,
      })
        .then(async (response) => {
          const body = (await response.json().catch(() => null)) as
            | UsernameAvailability
            | unknown;

          if (!response.ok) {
            throw new Error(readApiMessage(body) ?? "Nao foi possivel validar o username.");
          }

          const availability = body as UsernameAvailability;
          if (availability.available) {
            setUsernameStatus("available");
            setUsernameMessage("Username disponivel.");
            setUsernameSuggestions([]);
            form1.clearErrors("username");
            return;
          }

          setUsernameStatus("taken");
          setUsernameMessage(availability.message ?? "Esse username ja esta em uso.");
          setUsernameSuggestions(availability.suggestions ?? []);
          form1.setError("username", {
            type: "validate",
            message: availability.message ?? "Esse username ja esta em uso.",
          });
        })
        .catch((error: unknown) => {
          if (controller.signal.aborted) return;
          setUsernameStatus("idle");
          setUsernameMessage(
            error instanceof Error ? error.message : "Nao foi possivel validar o username."
          );
        });
    }, 450);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [form1, normalizedUsername, username]);

  async function handleStep1(data: Step1Data) {
    const normalizedUsername = normalizeUsernameInput(data.username);
    form1.setValue("username", normalizedUsername, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setUsernameSuggestions([]);
    setServerError(null);
    setUsernameMessage("");

    const availability = await checkUsername(normalizedUsername);
    if (!availability.available) {
      setUsernameSuggestions(availability.suggestions ?? []);
      setUsernameStatus("taken");
      setUsernameMessage(availability.message ?? "Esse username ja esta em uso.");
      form1.setError("username", {
        type: "validate",
        message: availability.message ?? "Esse username ja esta em uso.",
      });
      return;
    }

    setUsernameStatus("available");
    setStep1Values({ username: availability.username });
    setStep(1);
  }

  function applyUsernameSuggestion(suggestion: string) {
    form1.setValue("username", suggestion, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setUsernameSuggestions([]);
    setUsernameMessage("");
    setUsernameStatus("idle");
    form1.clearErrors("username");
  }

  async function handleStep2(data: Step2Data) {
    if (!step1Values) return;
    setServerError(null);

    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: normalizeUsernameInput(step1Values.username),
        headline: data.headline,
        focus: data.focus,
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const details = body?.error?.details;

      if (res.status === 409 && Array.isArray(details?.suggestions)) {
        setUsernameSuggestions(details.suggestions);
        setStep(0);
        form1.setError("username", {
          type: "validate",
          message: details.message ?? "Esse username ja esta em uso.",
        });
        return;
      }

      setServerError(readApiMessage(body) ?? "Ocorreu um erro. Tente novamente.");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="mx-auto max-w-lg">
      <StepIndicator current={step} total={2} />

      {step === 0 ? (
        <div className="space-y-8">
          <div className="space-y-2">
            <h1 className="font-display text-3xl font-bold text-neutral-900">
              Escolha seu username
            </h1>
            <p className="text-neutral-500">
              Essa sera a URL da sua pagina publica. Voce pode mudar depois.
            </p>
          </div>

          <form
            onSubmit={form1.handleSubmit(handleStep1)}
            className="space-y-6"
            noValidate
          >
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="ana.souza"
                autoComplete="off"
                autoFocus
                error={!!form1.formState.errors.username}
                {...form1.register("username", { setValueAs: normalizeUsernameInput })}
              />
              {form1.formState.errors.username ? (
                <p className="text-xs text-coral-600">
                  {form1.formState.errors.username.message}
                </p>
              ) : null}

              {usernameMessage ? (
                <p
                  className={
                    usernameStatus === "available"
                      ? "text-xs font-medium text-lime-800"
                      : "text-xs font-medium text-coral-700"
                  }
                >
                  {usernameMessage}
                </p>
              ) : null}

              {usernameSuggestions.length > 0 ? (
                <div className="rounded-xl border border-lime-200 bg-lime-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lime-900">
                    Sugestoes disponiveis
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {usernameSuggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => applyUsernameSuggestion(suggestion)}
                        className="rounded-full border border-lime-300 bg-white px-3 py-1.5 font-mono text-xs font-semibold text-lime-950 transition hover:bg-lime-100"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {username ? (
                <div className="mt-2 flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-100 px-3 py-2">
                  <Globe className="h-4 w-4 shrink-0 text-neutral-400" />
                  <span className="font-mono text-sm text-neutral-500">
                    foliotr.ee/
                  </span>
                  <span
                    className={cn(
                      "font-mono text-sm font-semibold transition-colors",
                      form1.formState.errors.username
                        ? "text-coral-600"
                        : "text-neutral-900"
                    )}
                  >
                    {normalizeUsernameInput(username)}
                  </span>
                  {usernameStatus === "checking" ? (
                    <span className="ml-auto text-xs text-neutral-400">verificando</span>
                  ) : null}
                </div>
              ) : null}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={form1.formState.isSubmitting || usernameStatus === "checking"}
              disabled={usernameStatus === "taken"}
              className="w-full"
            >
              {form1.formState.isSubmitting || usernameStatus === "checking"
                ? "Validando"
                : "Continuar"}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </form>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="space-y-8">
          <div className="space-y-2">
            <h1 className="font-display text-3xl font-bold text-neutral-900">
              Conte um pouco sobre voce
            </h1>
            <p className="text-neutral-500">
              Essas informacoes aparecem no topo da sua pagina publica.
            </p>
          </div>

          <form
            onSubmit={form2.handleSubmit(handleStep2)}
            className="space-y-6"
            noValidate
          >
            <div className="space-y-2">
              <Label htmlFor="headline">Titulo profissional</Label>
              <Input
                id="headline"
                type="text"
                placeholder="Designer de Produto em Sao Paulo"
                autoFocus
                error={!!form2.formState.errors.headline}
                {...form2.register("headline")}
              />
              {form2.formState.errors.headline ? (
                <p className="text-xs text-coral-600">
                  {form2.formState.errors.headline.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="focus">
                Area de atuacao{" "}
                <span className="font-normal text-neutral-400">(opcional)</span>
              </Label>
              <select
                id="focus"
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-lime-500"
                {...form2.register("focus")}
              >
                <option value="">Selecione uma area...</option>
                {FOCUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {serverError ? (
              <div className="rounded-xl border border-coral-200 bg-coral-50 px-4 py-3">
                <p className="text-sm text-coral-700">{serverError}</p>
              </div>
            ) : null}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => setStep(0)}
                className="flex-1"
              >
                Voltar
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={form2.formState.isSubmitting}
                className="flex-[2]"
              >
                Criar minha conta FolioTree
              </Button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
