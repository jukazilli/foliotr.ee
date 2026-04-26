import type { ArchetypeDimension, BigFiveDimension, Dimension, RiasecDimension } from './test';

export const bigFiveLabels: Record<BigFiveDimension, string> = {
  conscienciosidade: 'Conscienciosidade',
  amabilidade: 'Amabilidade',
  estabilidadeEmocional: 'Estabilidade emocional',
  extroversao: 'Extroversão',
  abertura: 'Abertura'
};

export const riasecLabels: Record<RiasecDimension, string> = {
  realista: 'Realista',
  investigativo: 'Investigativo',
  artistico: 'Artístico',
  social: 'Social',
  empreendedor: 'Empreendedor',
  convencional: 'Convencional'
};

export const riasecCodes: Record<RiasecDimension, string> = {
  realista: 'R',
  investigativo: 'I',
  artistico: 'A',
  social: 'S',
  empreendedor: 'E',
  convencional: 'C'
};

export const archetypeLabels: Record<ArchetypeDimension, string> = {
  estruturador: 'Estruturador',
  conectado: 'Conectado',
  explorador: 'Explorador',
  transformador: 'Transformador'
};

export const dimensionLabels: Record<Dimension, string> = {
  ...bigFiveLabels,
  ...riasecLabels,
  ...archetypeLabels
};
