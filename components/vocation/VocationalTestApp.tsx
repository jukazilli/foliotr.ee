"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  RotateCcw,
  Save,
} from "lucide-react";
import { affinityScale, agreementScale } from "@/lib/vocational-test/scales";
import { questions } from "@/lib/vocational-test/questions";
import { getBlockInstruction, getBlockLabel } from "@/lib/vocational-test/scoring";
import { dimensionLabels } from "@/lib/vocational-test/labels";
import type { Answers, TestResult, UserProfile } from "@/lib/vocational-test/types";
import { BehavioralAnalysisSection } from "./BehavioralAnalysisSection";

type Stage = "intro" | "profile" | "test" | "result";

type PersistedSession = {
  id: string;
  status: string;
  currentQuestionIndex: number;
  profile: UserProfile;
  answers: Answers;
  result?: TestResult | null;
  aiReport?: string | null;
  publicInProfile?: boolean;
  publicInPortfolio?: boolean;
  publicInResume?: boolean;
  completedAt?: string | null;
};

const emptyProfile: UserProfile = {
  name: "",
  moment: "escolhendoFaculdade",
  goal: "",
};

const momentOptions = [
  { value: "escolhendoFaculdade", label: "Estou escolhendo faculdade ou curso" },
  { value: "migracaoCarreira", label: "Quero migrar de carreira" },
  {
    value: "insatisfacaoProfissional",
    label: "Estou em dúvida sobre minha profissão atual",
  },
  { value: "autoconhecimento", label: "Busco autoconhecimento profissional" },
  { value: "outro", label: "Outro momento" },
] as const;

function getInitialStage(session: PersistedSession | null): Stage {
  if (!session) return "intro";
  if (session.status === "completed" && session.result) return "result";
  if (Object.keys(session.answers ?? {}).length > 0) return "test";
  if (session.profile?.name || session.profile?.goal) return "profile";
  return "intro";
}

function normalizeSession(input: unknown): PersistedSession | null {
  if (!input || typeof input !== "object") return null;

  const session = input as Partial<PersistedSession>;

  if (!session.id || !session.profile || !session.answers) return null;

  return {
    id: session.id,
    status: session.status ?? "draft",
    currentQuestionIndex: Number(session.currentQuestionIndex ?? 0),
    profile: {
      ...emptyProfile,
      ...session.profile,
    },
    answers: session.answers ?? {},
    result: session.result ?? null,
    aiReport: session.aiReport ?? null,
    publicInProfile: Boolean(session.publicInProfile),
    publicInPortfolio: Boolean(session.publicInPortfolio),
    publicInResume: Boolean(session.publicInResume),
    completedAt: session.completedAt ?? null,
  };
}

export function VocationalTestApp() {
  const [stage, setStage] = useState<Stage>("intro");
  const [profile, setProfile] = useState<UserProfile>(emptyProfile);
  const [answers, setAnswers] = useState<Answers>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [result, setResult] = useState<TestResult | null>(null);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoadedSession, setHasLoadedSession] = useState(false);
  const [completedSessions, setCompletedSessions] = useState<PersistedSession[]>([]);

  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);
  const progress = Math.round((answeredCount / questions.length) * 100);
  const currentQuestion = questions[currentQuestionIndex] ?? questions[0];
  const selectedAnswer = answers[currentQuestion.id];

  useEffect(() => {
    let active = true;

    async function loadSession() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/vocational-test/session", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Não foi possível carregar seu teste.");
        }

        const payload = (await response.json()) as {
          session?: unknown;
          sessions?: unknown[];
        };
        const session = normalizeSession(payload.session);
        const sessions = Array.isArray(payload.sessions)
          ? payload.sessions.flatMap((item) => {
              const normalized = normalizeSession(item);
              return normalized?.result ? [normalized] : [];
            })
          : [];

        if (!active) return;

        setCompletedSessions(sessions);

        if (session) {
          setProfile(session.profile);
          setAnswers(session.answers);
          setCurrentQuestionIndex(
            Math.min(Math.max(session.currentQuestionIndex, 0), questions.length - 1)
          );
          setResult(session.result ?? null);
          setAiReport(session.aiReport ?? null);
          setStage(getInitialStage(session));
        }
      } catch (requestError) {
        if (active) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Erro ao carregar o teste."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
          setHasLoadedSession(true);
        }
      }
    }

    loadSession();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hasLoadedSession || stage === "intro" || stage === "result") return;

    const timeout = window.setTimeout(async () => {
      setSaving(true);
      setError(null);

      try {
        const response = await fetch("/api/vocational-test/session", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            profile,
            answers,
            currentQuestionIndex,
          }),
        });

        if (!response.ok) {
          throw new Error("Não foi possível salvar o progresso.");
        }
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Erro ao salvar progresso."
        );
      } finally {
        setSaving(false);
      }
    }, 550);

    return () => window.clearTimeout(timeout);
  }, [answers, currentQuestionIndex, hasLoadedSession, profile, stage]);

  function updateAnswer(value: number) {
    setAnswers((previous) => ({
      ...previous,
      [currentQuestion.id]: value,
    }));
  }

  function restart() {
    setProfile(emptyProfile);
    setAnswers({});
    setCurrentQuestionIndex(0);
    setResult(null);
    setAiReport(null);
    setStage("profile");
  }

  async function finishTest() {
    if (answeredCount !== questions.length) {
      setError("Responda todas as perguntas antes de finalizar.");
      return;
    }

    setFinishing(true);
    setError(null);

    try {
      const response = await fetch("/api/vocational-test/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ profile, answers }),
      });

      if (!response.ok) {
        throw new Error("Não foi possível finalizar o relatório.");
      }

      const payload = (await response.json()) as {
        session?: {
          id?: string;
          status?: string;
          result?: TestResult;
          aiReport?: string | null;
          publicInProfile?: boolean;
          publicInPortfolio?: boolean;
          publicInResume?: boolean;
          completedAt?: string | null;
        };
      };

      if (!payload.session?.result) {
        throw new Error("A API não retornou o resultado calculado.");
      }

      setResult(payload.session.result);
      setAiReport(payload.session.aiReport ?? null);
      setCompletedSessions((previous) => [
        {
          id: payload.session?.id ?? `local-${Date.now()}`,
          status: payload.session?.status ?? "completed",
          currentQuestionIndex: 0,
          profile,
          answers,
          result: payload.session?.result ?? null,
          aiReport: payload.session?.aiReport ?? null,
          publicInProfile: Boolean(payload.session?.publicInProfile),
          publicInPortfolio: Boolean(payload.session?.publicInPortfolio),
          publicInResume: Boolean(payload.session?.publicInResume),
          completedAt: payload.session?.completedAt ?? new Date().toISOString(),
        },
        ...previous.filter((item) => item.id !== payload.session?.id),
      ]);
      setStage("result");
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Erro ao finalizar."
      );
    } finally {
      setFinishing(false);
    }
  }

  async function updateVisibility(
    sessionId: string,
    field: "publicInProfile" | "publicInPortfolio" | "publicInResume",
    value: boolean
  ) {
    const previousSessions = completedSessions;

    setCompletedSessions((previous) =>
      previous.map((session) =>
        session.id === sessionId
          ? { ...session, [field]: value }
          : value
            ? { ...session, [field]: false }
            : session
      )
    );

    try {
      const response = await fetch(`/api/vocational-test/sessions/${sessionId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ [field]: value }),
      });

      if (!response.ok) {
        throw new Error("Não foi possível atualizar a publicação do resultado.");
      }
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Erro ao atualizar publicação."
      );
      setCompletedSessions((previous) =>
        previous.map(
          (session) => previousSessions.find((item) => item.id === session.id) ?? session
        )
      );
    }
  }

  if (loading) {
    return (
      <section className="mx-auto max-w-3xl rounded-xl border border-[#dddfe2] bg-white p-8 shadow-[0_1px_2px_rgb(0_0_0/0.16)]">
        <p className="brand-eyebrow">Teste vocacional</p>
        <h1 className="mt-3 text-3xl font-bold tracking-[-0.02em] text-[#050505]">
          Carregando seu progresso
        </h1>
      </section>
    );
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-6 bg-[#f2f4f7] text-[#050505]">
      <header className="rounded-xl border border-[#dddfe2] bg-white p-6 shadow-[0_1px_2px_rgb(0_0_0/0.16)] sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="brand-eyebrow">Teste vocacional</p>
            <h1 className="mt-3 max-w-4xl text-3xl font-bold tracking-[-0.02em] text-[#050505] sm:text-4xl">
              Descubra caminhos com base em evidências do seu perfil.
            </h1>
            <p className="mt-4 max-w-2xl text-base font-normal leading-7 text-[#65676b]">
              Responda ao mapa de interesses, comportamento e motivação. O resultado fica
              salvo no seu perfil.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-[#f0f2f5] px-4 py-3 text-sm font-semibold text-[#050505]">
            <Save className="h-4 w-4" aria-hidden="true" />
            {saving ? "Salvando" : "Salvo automaticamente"}
          </div>
        </div>
      </header>

      {error ? (
        <div className="rounded-xl border border-[#dddfe2] bg-white px-5 py-4 font-semibold text-[#050505] shadow-[0_1px_2px_rgb(0_0_0/0.16)]">
          {error}
        </div>
      ) : null}

      {completedSessions.length > 0 ? (
        <section className="rounded-xl border border-[#dddfe2] bg-white p-5 shadow-[0_1px_2px_rgb(0_0_0/0.16)] sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="brand-eyebrow">Meus resultados</p>
              <h2 className="mt-2 text-2xl font-bold tracking-[-0.02em] text-[#050505]">
                Histórico do teste vocacional
              </h2>
            </div>
            <p className="max-w-xl text-sm font-normal leading-6 text-[#65676b]">
              Você controla qual resultado aparece no perfil, portfólio ou currículo
              público.
            </p>
          </div>
          <div className="mt-5 grid gap-3">
            {completedSessions.map((session) => (
              <article
                key={session.id}
                className="grid gap-4 rounded-xl border border-[#dddfe2] bg-[#f7f8fa] p-4 lg:grid-cols-[minmax(0,1fr)_auto]"
              >
                <div>
                  <h3 className="font-semibold text-[#050505]">
                    {session.result?.dominantArchetypeLabel
                      ? `Arquétipo ${session.result.dominantArchetypeLabel}`
                      : "Resultado vocacional"}
                  </h3>
                  <p className="mt-1 text-sm font-normal text-[#65676b]">
                    RIASEC {session.result?.riasecCode ?? "-"} ·{" "}
                    {session.completedAt
                      ? new Intl.DateTimeFormat("pt-BR").format(
                          new Date(session.completedAt)
                        )
                      : "sem data"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-semibold text-[#050505]">
                    <input
                      type="checkbox"
                      checked={Boolean(session.publicInProfile)}
                      onChange={(event) =>
                        updateVisibility(
                          session.id,
                          "publicInProfile",
                          event.target.checked
                        )
                      }
                    />
                    Perfil
                  </label>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-semibold text-[#050505]">
                    <input
                      type="checkbox"
                      checked={Boolean(session.publicInPortfolio)}
                      onChange={(event) =>
                        updateVisibility(
                          session.id,
                          "publicInPortfolio",
                          event.target.checked
                        )
                      }
                    />
                    Portfólio
                  </label>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-semibold text-[#050505]">
                    <input
                      type="checkbox"
                      checked={Boolean(session.publicInResume)}
                      onChange={(event) =>
                        updateVisibility(
                          session.id,
                          "publicInResume",
                          event.target.checked
                        )
                      }
                    />
                    Currículo
                  </label>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {stage === "intro" ? (
        <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-xl border border-[#dddfe2] bg-white p-6 shadow-[0_1px_2px_rgb(0_0_0/0.16)] sm:p-8">
            <p className="brand-eyebrow">Como funciona</p>
            <h2 className="mt-3 text-3xl font-bold tracking-[-0.02em] text-[#050505]">
              60 perguntas, três leituras e um relatório final.
            </h2>
            <p className="mt-4 text-base font-normal leading-7 text-[#65676b]">
              O teste cruza RIASEC, Big Five e arquétipos de motivação para sugerir
              forças, pontos de atenção e próximos passos práticos.
            </p>
            <button
              type="button"
              className="brand-button mt-7"
              onClick={() => setStage("profile")}
            >
              Começar agora
            </button>
          </div>

          <div className="rounded-xl border border-[#dddfe2] bg-white p-6 shadow-[0_1px_2px_rgb(0_0_0/0.16)] sm:p-8">
            <p className="text-sm font-bold uppercase text-[#65676b]">
              Uso responsável
            </p>
            <p className="mt-4 text-base font-normal leading-7 text-[#050505]">
              O resultado apoia reflexão e decisão. Ele não substitui orientação
              profissional humana, avaliação psicológica ou validação prática da rotina
              de cada carreira.
            </p>
          </div>
        </section>
      ) : null}

      {stage === "profile" ? (
        <form
          className="rounded-xl border border-[#dddfe2] bg-white p-6 shadow-[0_1px_2px_rgb(0_0_0/0.16)] sm:p-8"
          onSubmit={(event) => {
            event.preventDefault();
            setStage("test");
          }}
        >
          <p className="brand-eyebrow">Antes de começar</p>
          <h2 className="mt-3 text-3xl font-bold tracking-[-0.02em] text-[#050505]">
            Personalize a leitura do relatório.
          </h2>
          <p className="mt-3 max-w-2xl text-base font-normal leading-7 text-[#65676b]">
            Essas informações não alteram o cálculo. Elas ajudam o relatório final a
            conversar com o seu momento.
          </p>

          <div className="mt-8 grid gap-5">
            <label className="grid gap-2">
              <span className="text-sm font-semibold uppercase text-[#050505]">Nome</span>
              <input
                className="rounded-lg border border-[#dddfe2] bg-white px-4 py-3 text-[#050505] outline-none focus:border-[#1877f2]"
                value={profile.name}
                placeholder="Ex: Ana, João, Maria..."
                onChange={(event) =>
                  setProfile((prev) => ({ ...prev, name: event.target.value }))
                }
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold uppercase text-[#050505]">
                Momento atual
              </span>
              <select
                className="rounded-lg border border-[#dddfe2] bg-white px-4 py-3 text-[#050505] outline-none focus:border-[#1877f2]"
                value={profile.moment}
                onChange={(event) =>
                  setProfile((prev) => ({
                    ...prev,
                    moment: event.target.value as UserProfile["moment"],
                  }))
                }
              >
                {momentOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold uppercase text-[#050505]">
                O que você espera descobrir?
              </span>
              <textarea
                className="min-h-32 rounded-lg border border-[#dddfe2] bg-white px-4 py-3 font-normal text-[#050505] outline-none focus:border-[#1877f2]"
                value={profile.goal}
                placeholder="Ex: Quero entender quais áreas combinam comigo antes de escolher um curso."
                onChange={(event) =>
                  setProfile((prev) => ({ ...prev, goal: event.target.value }))
                }
              />
            </label>
          </div>

          <button type="submit" className="brand-button mt-8">
            Começar perguntas
          </button>
        </form>
      ) : null}

      {stage === "test" ? (
        <section className="rounded-xl border border-[#dddfe2] bg-white p-5 shadow-[0_1px_2px_rgb(0_0_0/0.16)] sm:p-8">
          <div className="mb-7">
            <div className="flex items-center justify-between gap-4 text-sm font-semibold uppercase text-[#65676b]">
              <span>
                {answeredCount} de {questions.length} respondidas
              </span>
              <span>{progress}%</span>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#f0f2f5]">
              <div className="h-full bg-orange" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <aside className="rounded-xl bg-[#f0f2f5] p-5 text-[#050505]">
              <p className="text-xs font-bold uppercase text-[#65676b]">Bloco atual</p>
              <h2 className="mt-3 text-2xl font-bold tracking-[-0.02em]">
                {getBlockLabel(currentQuestion.block)}
              </h2>
              <p className="mt-4 text-sm font-normal leading-6 text-[#65676b]">
                {getBlockInstruction(currentQuestion.block)}
              </p>
            </aside>

            <div>
              <div className="rounded-xl border border-[#dddfe2] bg-white p-5 sm:p-7">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="rounded-full bg-[#f0f2f5] px-4 py-2 text-sm font-semibold text-[#050505]">
                    {dimensionLabels[currentQuestion.dimension]}
                  </span>
                  <strong className="text-sm font-semibold uppercase text-[#65676b]">
                    Pergunta {currentQuestion.number}/{questions.length}
                  </strong>
                </div>
                <h3 className="mt-6 text-2xl font-bold leading-tight tracking-[-0.02em] text-[#050505]">
                  {currentQuestion.text}
                </h3>
              </div>

              <div className="mt-5 grid gap-3">
                {(currentQuestion.block === "riasec"
                  ? affinityScale
                  : agreementScale
                ).map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`flex min-h-16 items-center gap-4 rounded-xl border px-4 py-3 text-left font-normal transition ${
                      selectedAnswer === option.value
                        ? "border-[#1877f2] bg-[#e7f3ff] text-[#050505]"
                        : "border-[#dddfe2] bg-white text-[#050505] hover:bg-[#f0f2f5]"
                    }`}
                    onClick={() => updateAnswer(option.value)}
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#f0f2f5] text-lg font-semibold">
                      {option.value}
                    </span>
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-between">
                <button
                  type="button"
                  className="brand-button brand-button-secondary gap-2"
                  disabled={currentQuestionIndex === 0}
                  onClick={() =>
                    setCurrentQuestionIndex((index) => Math.max(0, index - 1))
                  }
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  Voltar
                </button>
                <button
                  type="button"
                  className="brand-button gap-2 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={!selectedAnswer || finishing}
                  onClick={() => {
                    if (currentQuestionIndex >= questions.length - 1) {
                      finishTest();
                    } else {
                      setCurrentQuestionIndex((index) =>
                        Math.min(questions.length - 1, index + 1)
                      );
                    }
                  }}
                >
                  {currentQuestionIndex >= questions.length - 1
                    ? "Finalizar teste"
                    : "Próxima"}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {stage === "result" && result ? (
        <section className="grid gap-6">
          <div className="rounded-xl border border-[#dddfe2] bg-white p-6 shadow-[0_1px_2px_rgb(0_0_0/0.16)] sm:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="brand-eyebrow">Relatório final</p>
                <h2 className="mt-3 text-3xl font-bold tracking-[-0.02em] text-[#050505]">
                  {profile.name
                    ? `${profile.name}, seu mapa profissional está pronto`
                    : "Seu mapa profissional está pronto"}
                </h2>
                <p className="mt-4 max-w-3xl text-base font-normal leading-7 text-[#050505]">
                  {result.summary}
                </p>
              </div>
              <div className="grid min-w-64 gap-3 rounded-xl bg-[#f0f2f5] p-5">
                <ResultKpi label="RIASEC" value={result.riasecCode} />
                <ResultKpi label="Arquétipo" value={result.dominantArchetypeLabel} />
                <ResultKpi label="Clareza" value={`${result.confidence}/100`} />
              </div>
            </div>
          </div>

          <BehavioralAnalysisSection
            analysis={{
              id: "current-result",
              completedAt: result.completedAt,
              aiReport,
              result,
            }}
          />

          <div className="grid gap-5 lg:grid-cols-2">
            <InsightList
              title="Forças principais"
              items={result.strengths.map((item) => ({
                title: item.title,
                text: item.description,
              }))}
            />
            <InsightList
              title="Pontos de atenção"
              items={result.attentionPoints.map((item) => ({
                title: item.title,
                text: `${item.risk} ${item.development}`,
              }))}
            />
          </div>

          <div className="rounded-xl border border-[#dddfe2] bg-white p-6 shadow-[0_1px_2px_rgb(0_0_0/0.16)] sm:p-8">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-orange" aria-hidden="true" />
              <h3 className="text-2xl font-bold tracking-[-0.02em] text-[#050505]">
                Relatório Gemini
              </h3>
            </div>
            {aiReport ? (
              <div className="prose prose-sm mt-5 max-w-none whitespace-pre-wrap text-ink">
                {aiReport}
              </div>
            ) : (
              <p className="mt-5 text-sm font-normal leading-6 text-[#65676b]">
                O resultado calculado já foi salvo. Para gerar o relatório narrativo por
                IA, configure `GEMINI_API_KEY` no ambiente e refaça a finalização do
                teste.
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="brand-button brand-button-pink gap-2"
              onClick={restart}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Refazer teste
            </button>
            <button
              type="button"
              className="brand-button brand-button-secondary"
              onClick={() => window.print()}
            >
              Imprimir
            </button>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function ResultKpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#dddfe2] pb-2 last:border-b-0 last:pb-0">
      <span className="text-sm font-semibold uppercase text-[#65676b]">{label}</span>
      <strong className="text-lg font-bold text-[#050505]">{value}</strong>
    </div>
  );
}

function InsightList({
  title,
  items,
}: {
  title: string;
  items: Array<{ title: string; text: string }>;
}) {
  return (
    <article className="rounded-xl border border-[#dddfe2] bg-white p-6 shadow-[0_1px_2px_rgb(0_0_0/0.16)]">
      <h3 className="text-2xl font-bold tracking-[-0.02em] text-[#050505]">
        {title}
      </h3>
      <div className="mt-5 grid gap-4">
        {items.map((item) => (
          <div key={item.title} className="border-l-2 border-orange pl-4">
            <h4 className="font-semibold text-[#050505]">{item.title}</h4>
            <p className="mt-1 text-sm font-normal leading-6 text-[#65676b]">
              {item.text}
            </p>
          </div>
        ))}
      </div>
    </article>
  );
}
