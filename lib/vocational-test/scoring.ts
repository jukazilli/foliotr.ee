import { careerCatalog } from "./career-catalog";
import { questions } from "./questions";
import {
  archetypeLabels,
  bigFiveLabels,
  dimensionLabels,
  riasecCodes,
  riasecLabels,
} from "./labels";
import type {
  Answers,
  ArchetypeDimension,
  AreaRecommendation,
  BigFiveDimension,
  CareerArea,
  Dimension,
  Question,
  RiasecDimension,
  ScoreMap,
  StrengthItem,
  AttentionItem,
  TestResult,
  UserProfile,
} from "./types";

const bigFiveDimensions: BigFiveDimension[] = [
  "conscienciosidade",
  "amabilidade",
  "estabilidadeEmocional",
  "extroversao",
  "abertura",
];
const riasecDimensions: RiasecDimension[] = [
  "realista",
  "investigativo",
  "artistico",
  "social",
  "empreendedor",
  "convencional",
];
const archetypeDimensions: ArchetypeDimension[] = [
  "estruturador",
  "conectado",
  "explorador",
  "transformador",
];

const readableLabel = (dimension: Dimension) => dimensionLabels[dimension];

function answerScore(question: Question, value: number): number {
  return question.reverse ? 6 - value : value;
}

function normalize(raw: number, questionCount: number): number {
  const min = questionCount;
  const max = questionCount * 5;
  return Math.round(((raw - min) / (max - min)) * 100);
}

function buildScoreMap<T extends Dimension>(
  answers: Answers,
  dimensions: T[],
  labelMap: Record<T, string>
): ScoreMap<T> {
  const raw = {} as Record<T, number>;
  const normalized = {} as Record<T, number>;

  dimensions.forEach((dimension) => {
    const related = questions.filter((question) => question.dimension === dimension);
    const dimensionRaw = related.reduce((sum, question) => {
      const value = answers[question.id] ?? 3;
      return sum + answerScore(question, value);
    }, 0);

    raw[dimension] = dimensionRaw;
    normalized[dimension] = normalize(dimensionRaw, related.length);
  });

  const ranking = dimensions
    .map((key) => ({ key, label: labelMap[key], value: normalized[key] }))
    .sort((a, b) => b.value - a.value);

  return { raw, normalized, ranking };
}

function average(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function scoreArea(
  area: CareerArea,
  riasec: ScoreMap<RiasecDimension>,
  bigFive: ScoreMap<BigFiveDimension>,
  archetype: ScoreMap<ArchetypeDimension>
): AreaRecommendation {
  const riasecScore = average(
    area.riasecFavoravel.map((item) => riasec.normalized[item])
  );
  const bigFiveScore = average(
    area.bigFiveFavoravel.map((item) => bigFive.normalized[item])
  );
  const archetypeScore = average(
    area.arquetiposFavoraveis.map((item) => archetype.normalized[item])
  );
  const score = Math.round(
    riasecScore * 0.55 + bigFiveScore * 0.25 + archetypeScore * 0.2
  );

  const reasons = [
    `Afinidades principais: ${area.riasecFavoravel.map((item) => readableLabel(item)).join(", ")}.`,
    `Comportamentos de apoio: ${area.bigFiveFavoravel.map((item) => readableLabel(item)).join(", ")}.`,
    `Motivação compatível: ${area.arquetiposFavoraveis.map((item) => readableLabel(item)).join(" ou ")}.`,
  ];

  return {
    area,
    score,
    riasecScore: Math.round(riasecScore),
    bigFiveScore: Math.round(bigFiveScore),
    archetypeScore: Math.round(archetypeScore),
    reasons,
  };
}

function getRiasecCode(riasec: ScoreMap<RiasecDimension>): string {
  return riasec.ranking
    .slice(0, 3)
    .map((item) => riasecCodes[item.key])
    .join("");
}

function classifyConfidence(score: number): string {
  if (score >= 80) return "Resultado consistente";
  if (score >= 60) return "Resultado útil, com possíveis nuances";
  if (score >= 40) return "Resultado amplo; vale responder com mais atenção";
  return "Resultado pouco confiável";
}

function calculateConfidence(
  answers: Answers,
  riasec: ScoreMap<RiasecDimension>,
  bigFive: ScoreMap<BigFiveDimension>,
  archetype: ScoreMap<ArchetypeDimension>
): number {
  let confidence = 100;
  const values = Object.values(answers);
  const neutralCount = values.filter((value) => value === 3).length;
  const neutralRatio = values.length ? neutralCount / values.length : 1;

  if (neutralRatio > 0.35) confidence -= 15;

  const allHigh =
    values.length > 0 &&
    values.filter((value) => value >= 4).length / values.length > 0.88;
  const allLow =
    values.length > 0 &&
    values.filter((value) => value <= 2).length / values.length > 0.88;
  if (allHigh || allLow) confidence -= 15;

  const riasecSpread =
    riasec.ranking[0].value - riasec.ranking[riasec.ranking.length - 1].value;
  const bigFiveSpread =
    bigFive.ranking[0].value - bigFive.ranking[bigFive.ranking.length - 1].value;
  const archetypeSpread =
    archetype.ranking[0].value - archetype.ranking[archetype.ranking.length - 1].value;

  if (riasecSpread < 12) confidence -= 10;
  if (bigFiveSpread < 10 && archetypeSpread < 10) confidence -= 10;

  const nearTies = [riasec.ranking, bigFive.ranking, archetype.ranking].flatMap(
    (ranking) =>
      ranking
        .slice(0, -1)
        .filter((item, index) => Math.abs(item.value - ranking[index + 1].value) < 5)
  ).length;
  if (nearTies >= 5) confidence -= 10;

  const answeredRatio = Object.keys(answers).length / questions.length;
  if (answeredRatio < 1) confidence -= 25;

  return Math.max(20, Math.min(100, Math.round(confidence)));
}

function buildSummary(
  profile: UserProfile,
  riasec: ScoreMap<RiasecDimension>,
  bigFive: ScoreMap<BigFiveDimension>,
  archetype: ScoreMap<ArchetypeDimension>,
  topArea: AreaRecommendation
): string {
  const firstName = profile.name?.trim()?.split(" ")[0] || "Seu resultado";
  const topRiasec = riasec.ranking
    .slice(0, 3)
    .map((item) => item.label)
    .join(", ");
  const topBigFive = bigFive.ranking
    .slice(0, 2)
    .map((item) => item.label)
    .join(" e ");
  const topArchetype = archetype.ranking[0].label;

  return `${firstName}, seu perfil mostra maior aproximação com ${topRiasec}. No comportamento, aparecem como forças principais ${topBigFive}. Como motivação, o arquétipo ${topArchetype} indica o tipo de ambiente que tende a gerar mais sentido para você. A área mais compatível neste momento é ${topArea.area.area}, mas o resultado deve ser usado como apoio à reflexão, não como decisão definitiva.`;
}

function buildStrengths(
  riasec: ScoreMap<RiasecDimension>,
  bigFive: ScoreMap<BigFiveDimension>,
  archetype: ScoreMap<ArchetypeDimension>
): StrengthItem[] {
  const strengths: StrengthItem[] = [];

  riasec.ranking.slice(0, 2).forEach((item) => {
    strengths.push({
      title: `Afinidade ${item.label}`,
      description: `Esse resultado indica boa aproximação com atividades ligadas a ${item.label.toLowerCase()}, especialmente quando aparecem oportunidades alinhadas a esse tipo de interesse.`,
    });
  });

  bigFive.ranking.slice(0, 2).forEach((item) => {
    strengths.push({
      title: item.label,
      description: `Pode funcionar como uma força comportamental no seu desenvolvimento profissional, principalmente quando usada de forma consciente.`,
    });
  });

  strengths.push({
    title: `Arquétipo ${archetype.ranking[0].label}`,
    description: `Mostra uma fonte importante de motivação e ajuda a entender quais ambientes tendem a gerar mais energia e sentido.`,
  });

  return strengths.slice(0, 5);
}

function buildAttentionPoints(
  bigFive: ScoreMap<BigFiveDimension>,
  riasec: ScoreMap<RiasecDimension>
): AttentionItem[] {
  const items: AttentionItem[] = [];
  const lowestBigFive = bigFive.ranking.slice().reverse().slice(0, 2);
  const lowestRiasec = riasec.ranking.slice().reverse()[0];

  lowestBigFive.forEach((item) => {
    const title = `Desenvolver ${item.label.toLowerCase()}`;
    const risk = `Quando essa dimensão fica mais baixa, algumas áreas podem exigir adaptação adicional, dependendo da rotina profissional.`;
    const development = `Trabalhe essa habilidade em situações pequenas e progressivas, sem tratar isso como limitação fixa.`;
    items.push({ title, risk, development });
  });

  items.push({
    title: `Baixa atração por atividades ${lowestRiasec.label.toLowerCase()}`,
    risk: `Carreiras muito centradas nesse tipo de atividade podem parecer menos naturais ou exigir maior esforço de adaptação.`,
    development: `Antes de descartar totalmente, vale conhecer a rotina real da área e separar falta de experiência de falta de interesse.`,
  });

  return items;
}

export function calculateResult(answers: Answers, profile: UserProfile): TestResult {
  const bigFive = buildScoreMap(answers, bigFiveDimensions, bigFiveLabels);
  const riasec = buildScoreMap(answers, riasecDimensions, riasecLabels);
  const archetype = buildScoreMap(answers, archetypeDimensions, archetypeLabels);

  const recommendedAreas = careerCatalog
    .map((area) => scoreArea(area, riasec, bigFive, archetype))
    .sort((a, b) => b.score - a.score);

  const dominantArchetype = archetype.ranking[0].key;
  const confidence = calculateConfidence(answers, riasec, bigFive, archetype);

  return {
    bigFive,
    riasec,
    archetype,
    riasecCode: getRiasecCode(riasec),
    dominantArchetype,
    dominantArchetypeLabel: archetypeLabels[dominantArchetype],
    recommendedAreas,
    strengths: buildStrengths(riasec, bigFive, archetype),
    attentionPoints: buildAttentionPoints(bigFive, riasec),
    confidence,
    confidenceLabel: classifyConfidence(confidence),
    summary: buildSummary(profile, riasec, bigFive, archetype, recommendedAreas[0]),
    completedAt: new Date().toISOString(),
  };
}

export function getBlockLabel(block: Question["block"]): string {
  const labels = {
    bigFive: "Comportamento, forças e pontos de atenção",
    riasec: "Afinidades profissionais",
    archetype: "Arquétipos de motivação",
  };
  return labels[block];
}

export function getBlockInstruction(block: Question["block"]): string {
  if (block === "riasec")
    return "Responda pensando no quanto cada atividade combina com você, mesmo que você ainda não tenha experiência nela.";
  if (block === "archetype")
    return "Responda pensando no que mais gera satisfação, motivação e senso de propósito para você.";
  return "Responda pensando em como você normalmente age, decide e se organiza no dia a dia.";
}
