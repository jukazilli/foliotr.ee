export type TestStage = "intro" | "profile" | "test" | "result";

export type Block = "bigFive" | "riasec" | "archetype";

export type BigFiveDimension =
  | "conscienciosidade"
  | "amabilidade"
  | "estabilidadeEmocional"
  | "extroversao"
  | "abertura";

export type RiasecDimension =
  | "realista"
  | "investigativo"
  | "artistico"
  | "social"
  | "empreendedor"
  | "convencional";

export type ArchetypeDimension =
  | "estruturador"
  | "conectado"
  | "explorador"
  | "transformador";

export type Dimension = BigFiveDimension | RiasecDimension | ArchetypeDimension;

export interface Question {
  number: number;
  id: string;
  block: Block;
  dimension: Dimension;
  text: string;
  reverse?: boolean;
}

export type Answers = Record<string, number>;

export interface UserProfile {
  name: string;
  moment:
    | "escolhendoFaculdade"
    | "migracaoCarreira"
    | "insatisfacaoProfissional"
    | "autoconhecimento"
    | "outro";
  goal: string;
}

export interface ScoreMap<T extends string = string> {
  raw: Record<T, number>;
  normalized: Record<T, number>;
  ranking: Array<{ key: T; label: string; value: number }>;
}

export interface CareerArea {
  id: string;
  area: string;
  description: string;
  riasecFavoravel: RiasecDimension[];
  bigFiveFavoravel: BigFiveDimension[];
  arquetiposFavoraveis: ArchetypeDimension[];
  carreiras: string[];
  proximosPassos: string[];
}

export interface AreaRecommendation {
  area: CareerArea;
  score: number;
  riasecScore: number;
  bigFiveScore: number;
  archetypeScore: number;
  reasons: string[];
}

export interface StrengthItem {
  title: string;
  description: string;
}

export interface AttentionItem {
  title: string;
  risk: string;
  development: string;
}

export interface TestResult {
  bigFive: ScoreMap<BigFiveDimension>;
  riasec: ScoreMap<RiasecDimension>;
  archetype: ScoreMap<ArchetypeDimension>;
  riasecCode: string;
  dominantArchetype: ArchetypeDimension;
  dominantArchetypeLabel: string;
  recommendedAreas: AreaRecommendation[];
  strengths: StrengthItem[];
  attentionPoints: AttentionItem[];
  confidence: number;
  confidenceLabel: string;
  summary: string;
  completedAt: string;
}

export interface PersistedState {
  stage: TestStage;
  currentQuestionIndex: number;
  answers: Answers;
  profile: UserProfile;
  result?: TestResult;
  startedAt?: string;
  updatedAt?: string;
}
