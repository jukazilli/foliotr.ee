import type {
  ArchetypeDimension,
  BigFiveDimension,
  Dimension,
  RiasecDimension,
} from "./types";

export const bigFiveLabels: Record<BigFiveDimension, string> = {
  conscienciosidade: "Conscienciosidade",
  amabilidade: "Amabilidade",
  estabilidadeEmocional: "Estabilidade emocional",
  extroversao: "Extroversão",
  abertura: "Abertura",
};

export const riasecLabels: Record<RiasecDimension, string> = {
  realista: "Realista",
  investigativo: "Investigativo",
  artistico: "Artístico",
  social: "Social",
  empreendedor: "Empreendedor",
  convencional: "Convencional",
};

export const bigFiveDescriptions: Record<BigFiveDimension, string> = {
  abertura: "buscar novas ideias e experiências",
  conscienciosidade: "ser organizado e focado em metas",
  extroversao: "ganhar energia interagindo com outras pessoas",
  amabilidade: "priorizar a harmonia e o bem-estar do grupo",
  estabilidadeEmocional: "lidar bem com o estresse e a pressão",
};

export const riasecDescriptions: Record<RiasecDimension, string> = {
  realista: "atividades práticas, manuais e lidar com objetos ou ferramentas",
  investigativo:
    "observar, aprender e resolver problemas teóricos ou científicos",
  artistico: "atividades criativas, originais e sem rotinas rígidas",
  social: "ajudar, ensinar, curar e interagir com outras pessoas",
  empreendedor: "liderar, influenciar e gerir projetos ou negócios",
  convencional: "organização, dados, regras claras e tarefas sistemáticas",
};

export const riasecCodes: Record<RiasecDimension, string> = {
  realista: "R",
  investigativo: "I",
  artistico: "A",
  social: "S",
  empreendedor: "E",
  convencional: "C",
};

export const archetypeLabels: Record<ArchetypeDimension, string> = {
  estruturador: "Estruturador",
  conectado: "Conectado",
  explorador: "Explorador",
  transformador: "Transformador",
};

export const dimensionLabels: Record<Dimension, string> = {
  ...bigFiveLabels,
  ...riasecLabels,
  ...archetypeLabels,
};
