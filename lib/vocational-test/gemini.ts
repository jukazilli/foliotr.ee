import type { Answers, TestResult, UserProfile } from "./types";

const DEFAULT_GEMINI_MODEL = "gemini-2.0-flash";

type GeminiReportInput = {
  profile: UserProfile;
  answers: Answers;
  result: TestResult;
};

type GeminiReportOutput = {
  report: string | null;
  provider: string | null;
  model: string | null;
};

function buildReportPrompt({ profile, result }: GeminiReportInput) {
  const topAreas = result.recommendedAreas.slice(0, 3).map((item, index) => ({
    rank: index + 1,
    area: item.area.area,
    score: item.score,
    careers: item.area.carreiras.slice(0, 6),
    reasons: item.reasons,
    nextSteps: item.area.proximosPassos,
  }));

  return [
    "Você é um orientador profissional. Gere um relatório final em português do Brasil.",
    "Use linguagem clara, cuidadosa e prática. Não apresente o teste como diagnóstico psicológico.",
    "Estruture com: síntese, perfil comportamental, áreas compatíveis, pontos de atenção, próximos passos e aviso responsável.",
    "Não invente notas além dos dados. Use os dados abaixo como fonte de verdade.",
    "",
    JSON.stringify(
      {
        pessoa: {
          nome: profile.name,
          momento: profile.moment,
          objetivo: profile.goal,
        },
        resultado: {
          resumoBase: result.summary,
          codigoRiasec: result.riasecCode,
          arquetipoDominante: result.dominantArchetypeLabel,
          confianca: `${result.confidence}/100 - ${result.confidenceLabel}`,
          bigFive: result.bigFive.ranking,
          riasec: result.riasec.ranking,
          arquetipos: result.archetype.ranking,
          areas: topAreas,
          forcas: result.strengths,
          pontosDeAtencao: result.attentionPoints,
        },
      },
      null,
      2
    ),
  ].join("\n");
}

function extractText(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;

  const candidates = (payload as { candidates?: unknown }).candidates;
  if (!Array.isArray(candidates)) return null;

  const first = candidates[0] as
    | { content?: { parts?: Array<{ text?: string }> } }
    | undefined;
  const text = first?.content?.parts
    ?.map((part) => part.text)
    .filter(Boolean)
    .join("\n")
    .trim();

  return text || null;
}

export async function generateGeminiReport(
  input: GeminiReportInput
): Promise<GeminiReportOutput> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const model = process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;

  if (!apiKey) {
    return {
      report: null,
      provider: null,
      model: null,
    };
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: buildReportPrompt(input) }],
          },
        ],
        generationConfig: {
          temperature: 0.45,
          topP: 0.9,
          maxOutputTokens: 2200,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini report request failed with status ${response.status}.`);
  }

  const payload: unknown = await response.json();

  return {
    report: extractText(payload),
    provider: "gemini",
    model,
  };
}
