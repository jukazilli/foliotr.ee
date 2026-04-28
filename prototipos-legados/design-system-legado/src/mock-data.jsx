// Mock data simulating Prisma schema.
// Single source of truth: Profile -> Version (selection + overrides) -> Page (blocks) / CV (view)

const mockProfile = {
  user: {
    id: "u_1",
    handle: "anacorrea",
    email: "ana@folio.tree",
    displayName: "Ana Corrêa",
    avatar: null,
  },
  headline: "Product designer focada em sistemas complexos",
  bio: "Há oito anos desenhando produtos onde a clareza importa mais que o brilho. Antes do design, engenharia. Uso os dois lados.",
  location: "São Paulo, Brasil",
  pronouns: "ela/dela",
  availability: "open-to-work",

  experiences: [
    { id: "e1", company: "Nubank", role: "Senior Product Designer", start: "2022-01", end: null, summary: "Liderança de design em Crédito. Reestruturação do fluxo de limite.", tags: ["fintech","systems","research"] },
    { id: "e2", company: "iFood", role: "Product Designer", start: "2019-03", end: "2021-12", summary: "Checkout e pagamentos. +12% de conversão em pedidos novos.", tags: ["marketplace","checkout"] },
    { id: "e3", company: "Resultados Digitais", role: "UX Designer", start: "2016-07", end: "2019-02", summary: "Primeiro design system da empresa.", tags: ["b2b","design-system"] },
  ],
  projects: [
    { id: "p1", title: "Ciclo — sistema de crédito", year: 2024, role: "Design lead", summary: "Redesign ponta-a-ponta do fluxo de limite para 40M de clientes.", url: "", tags: ["fintech","systems"] },
    { id: "p2", title: "Atlas — design system", year: 2023, role: "Maintainer", summary: "Fundação de tokens, componentes e padrões de conteúdo.", url: "", tags: ["design-system"] },
    { id: "p3", title: "Checkout 2.0", year: 2021, role: "Designer", summary: "Novo checkout do iFood, +12% conversão em novos pedidos.", url: "", tags: ["checkout"] },
    { id: "p4", title: "Monograph", year: 2022, role: "Solo", summary: "Publicação de ensaios sobre design de sistemas.", url: "", tags: ["writing"] },
  ],
  achievements: [
    { id: "a1", title: "Prêmio Brasil Design Award", year: 2023, issuer: "ABEDESIGN" },
    { id: "a2", title: "Palestra — Config 2024", year: 2024, issuer: "Figma" },
  ],
  links: [
    { id: "l1", label: "Site", kind: "site", url: "anacorrea.xyz" },
    { id: "l2", label: "LinkedIn", kind: "linkedin", url: "linkedin.com/in/ana" },
    { id: "l3", label: "Read.cv", kind: "custom", url: "read.cv/ana" },
  ],
};

const mockVersions = [
  {
    id: "v1",
    slug: "design-lead",
    name: "Design Lead",
    headline: "Designer de sistemas para produtos com milhões de usuários",
    bio: null,
    includedExperienceIds: ["e1","e2","e3"],
    includedProjectIds: ["p1","p2","p3"],
    includedAchievementIds: ["a1","a2"],
    includedLinkIds: ["l1","l2","l3"],
    isDefault: true,
    pageId: "pg1",
    templateKey: "portfolio-community",
    status: "PUBLISHED",
  },
  {
    id: "v2",
    slug: "writer",
    name: "Autora",
    headline: "Escrevo sobre design, sistemas e clareza",
    bio: "Ensaios, palestras e publicações independentes sobre design de produto.",
    includedExperienceIds: ["e1"],
    includedProjectIds: ["p4"],
    includedAchievementIds: ["a2"],
    includedLinkIds: ["l1","l3"],
    isDefault: false,
    pageId: "pg2",
    templateKey: "portfolio-community",
    status: "DRAFT",
  },
  {
    id: "v3",
    slug: "palestras",
    name: "Palestras",
    headline: "Palestras sobre design de sistemas",
    bio: null,
    includedExperienceIds: [],
    includedProjectIds: ["p2"],
    includedAchievementIds: ["a2"],
    includedLinkIds: ["l1"],
    isDefault: false,
    pageId: null,
    templateKey: null,
    status: "DRAFT",
  },
];

// Template definition — the "Portfolio Community" template from Figma.
const mockTemplate = {
  key: "portfolio-community",
  name: "Portfolio Community",
  version: 1,
  description: "Template editorial, blocos modulares. Acento de cor e tipografia grande.",
  themeSchema: {
    accent: { type: "color", label: "Acento" },
    layout: { type: "enum", options: ["default","tight","airy"], label: "Densidade" },
  },
  blocks: [
    { key: "hero", name: "Hero", required: true, max: 1,
      fields: { eyebrow: "text", title: "text", subtitle: "longtext", cta: "text" },
      bindings: { title: "version.headline", subtitle: "profile.bio" },
      defaultProps: { eyebrow: "Portfolio", cta: "Ver currículo" } },
    { key: "about", name: "Sobre", required: false, max: 1,
      fields: { title: "text", body: "longtext" },
      bindings: { body: "profile.bio" },
      defaultProps: { title: "Sobre" } },
    { key: "projectsGrid", name: "Projetos", required: false, max: 1,
      fields: { title: "text", cols: "number" },
      bindings: { items: "version.projects" },
      defaultProps: { title: "Selecionados", cols: 2 } },
    { key: "experienceList", name: "Experiência", required: false, max: 1,
      fields: { title: "text" },
      bindings: { items: "version.experiences" },
      defaultProps: { title: "Experiência" } },
    { key: "achievements", name: "Conquistas", required: false, max: 1,
      fields: { title: "text" },
      bindings: { items: "version.achievements" },
      defaultProps: { title: "Reconhecimentos" } },
    { key: "contact", name: "Contato", required: false, max: 1,
      fields: { title: "text", note: "text" },
      bindings: { links: "version.links" },
      defaultProps: { title: "Contato", note: "Disponível para novos projetos." } },
  ],
};

// Block instances on page pg1 (the published page of version v1).
const mockPages = {
  pg1: {
    id: "pg1",
    versionId: "v1",
    templateKey: "portfolio-community",
    status: "PUBLISHED",
    theme: { accent: "#C6FF3D", layout: "default" },
    blocks: [
      { id: "b1", defKey: "hero", order: 0, visible: true, props: {} },
      { id: "b2", defKey: "about", order: 1, visible: true, props: {} },
      { id: "b3", defKey: "projectsGrid", order: 2, visible: true, props: { cols: 2 } },
      { id: "b4", defKey: "experienceList", order: 3, visible: true, props: {} },
      { id: "b5", defKey: "achievements", order: 4, visible: true, props: {} },
      { id: "b6", defKey: "contact", order: 5, visible: true, props: {} },
    ],
  },
  pg2: {
    id: "pg2",
    versionId: "v2",
    templateKey: "portfolio-community",
    status: "DRAFT",
    theme: { accent: "#C6FF3D", layout: "airy" },
    blocks: [
      { id: "b1", defKey: "hero", order: 0, visible: true, props: {} },
      { id: "b2", defKey: "about", order: 1, visible: true, props: {} },
      { id: "b3", defKey: "projectsGrid", order: 2, visible: true, props: { cols: 1 } },
      { id: "b4", defKey: "contact", order: 3, visible: true, props: {} },
    ],
  },
};

// Resolve a version (selection applied on top of profile)
function resolveVersion(versionId) {
  const profile = window.FT_STATE.profile;
  const version = window.FT_STATE.versions.find(v => v.id === versionId);
  if (!version) return null;
  return {
    version,
    headline: version.headline || profile.headline,
    bio: version.bio || profile.bio,
    experiences: profile.experiences.filter(e => version.includedExperienceIds.includes(e.id)),
    projects: profile.projects.filter(p => version.includedProjectIds.includes(p.id)),
    achievements: profile.achievements.filter(a => version.includedAchievementIds.includes(a.id)),
    links: profile.links.filter(l => version.includedLinkIds.includes(l.id)),
    user: profile.user,
    profile,
  };
}

window.FT_STATE = {
  profile: mockProfile,
  versions: mockVersions,
  templates: [mockTemplate],
  pages: mockPages,
};
window.resolveVersion = resolveVersion;
