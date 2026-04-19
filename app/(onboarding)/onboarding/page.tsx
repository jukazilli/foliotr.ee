"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { CheckCircle2, ChevronRight, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { z } from "zod";

const step1Schema = z.object({
  username: z
    .string()
    .min(3, "Username deve ter pelo menos 3 caracteres")
    .max(20, "Username deve ter no máximo 20 caracteres")
    .regex(/^[a-z0-9-]+$/, "Apenas letras minúsculas, números e hifens são permitidos"),
});

const step2Schema = z.object({
  headline: z
    .string()
    .min(5, "Título deve ter pelo menos 5 caracteres")
    .max(120, "Título deve ter no máximo 120 caracteres"),
  focus: z.string().optional(),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;

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
    <div className="flex items-center gap-3 mb-8">
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
          {i < total - 1 && (
            <div
              className={cn(
                "h-px w-12 transition-all",
                i < current ? "bg-lime-500" : "bg-neutral-200"
              )}
            />
          )}
        </div>
      ))}
      <span className="ml-2 text-sm text-neutral-500">
        Passo {current + 1} de {total}
      </span>
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [step1Values, setStep1Values] = useState<Step1Data | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const form1 = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
  });

  const form2 = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
  });

  const username = form1.watch("username") ?? "";

  function handleStep1(data: Step1Data) {
    setStep1Values(data);
    setStep(1);
  }

  async function handleStep2(data: Step2Data) {
    if (!step1Values) return;
    setServerError(null);

    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: step1Values.username,
        headline: data.headline,
        focus: data.focus,
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setServerError(body.message ?? "Ocorreu um erro. Tente novamente.");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="mx-auto max-w-lg">
      <StepIndicator current={step} total={2} />

      {step === 0 && (
        <div className="space-y-8">
          <div className="space-y-2">
            <h1 className="font-display text-3xl font-bold text-neutral-900">
              Escolha seu username
            </h1>
            <p className="text-neutral-500">
              Essa será a URL da sua página pública. Você pode mudar depois.
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
                placeholder="ana-souza"
                autoComplete="off"
                autoFocus
                error={!!form1.formState.errors.username}
                {...form1.register("username")}
              />
              {form1.formState.errors.username ? (
                <p className="text-xs text-coral-600">
                  {form1.formState.errors.username.message}
                </p>
              ) : null}

              {username && (
                <div className="flex items-center gap-2 rounded-xl bg-neutral-100 border border-neutral-200 px-3 py-2 mt-2">
                  <Globe className="h-4 w-4 text-neutral-400 shrink-0" />
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
                    {username}
                  </span>
                </div>
              )}
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full">
              Continuar
              <ChevronRight className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-8">
          <div className="space-y-2">
            <h1 className="font-display text-3xl font-bold text-neutral-900">
              Conte um pouco sobre você
            </h1>
            <p className="text-neutral-500">
              Essas informações aparecem no topo da sua página pública.
            </p>
          </div>

          <form
            onSubmit={form2.handleSubmit(handleStep2)}
            className="space-y-6"
            noValidate
          >
            <div className="space-y-2">
              <Label htmlFor="headline">Título profissional</Label>
              <Input
                id="headline"
                type="text"
                placeholder="Designer de Produto em São Paulo"
                autoFocus
                error={!!form2.formState.errors.headline}
                {...form2.register("headline")}
              />
              {form2.formState.errors.headline && (
                <p className="text-xs text-coral-600">
                  {form2.formState.errors.headline.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="focus">
                Área de atuação{" "}
                <span className="text-neutral-400 font-normal">(opcional)</span>
              </Label>
              <select
                id="focus"
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                {...form2.register("focus")}
              >
                <option value="">Selecione uma área...</option>
                {FOCUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {serverError && (
              <div className="rounded-xl bg-coral-50 border border-coral-200 px-4 py-3">
                <p className="text-sm text-coral-700">{serverError}</p>
              </div>
            )}

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
      )}
    </div>
  );
}
