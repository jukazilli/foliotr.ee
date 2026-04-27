export interface HeroCarouselCardItem {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  video: string;
  stageBackground: string;
  stageGlow: string;
  cardSurface: string;
  cardAccent: string;
  cardBorder: string;
  cardShadow: string;
  textColor: string;
  mutedTextColor: string;
  badgeBackground: string;
  badgeColor: string;
}

export const heroCarouselCards: HeroCarouselCardItem[] = [
  {
    id: "hero",
    eyebrow: "Living professional evidence",
    title: "Mostre mais que um perfil.",
    subtitle: "Organize seu perfil, seus projetos e seus resultados em um so lugar.",
    video: "/landing-carousel/videos/video_11.mp4",
    stageBackground: "#2f66d0",
    stageGlow: "#d5f221",
    cardSurface: "#214e1e",
    cardAccent: "#357a2d",
    cardBorder: "rgba(236, 254, 229, 0.28)",
    cardShadow: "rgba(17, 37, 75, 0.38)",
    textColor: "#f8fafc",
    mutedTextColor: "rgba(248, 250, 252, 0.82)",
    badgeBackground: "rgba(236, 254, 229, 0.16)",
    badgeColor: "#f8fafc",
  },
  {
    id: "purpose",
    eyebrow: "Por que existe",
    title: "Menos perfil generico. Mais evidencia entendivel.",
    subtitle:
      "FolioTree nao tenta substituir sua carreira por um template. Ele organiza o que prova seu valor e transforma isso em saidas claras.",
    video: "/landing-carousel/videos/video_12.mp4",
    stageBackground: "#11254b",
    stageGlow: "#d5f221",
    cardSurface: "#535e13",
    cardAccent: "#90a220",
    cardBorder: "rgba(247, 250, 229, 0.24)",
    cardShadow: "rgba(17, 37, 75, 0.52)",
    textColor: "#f8fafc",
    mutedTextColor: "rgba(248, 250, 252, 0.84)",
    badgeBackground: "rgba(247, 250, 229, 0.14)",
    badgeColor: "#f8fafc",
  },
  {
    id: "foundation",
    eyebrow: "Base central",
    title: "Uma base central.",
    subtitle: "Perfil, experiencias, projetos, links e reviews ficam no mesmo lugar.",
    video: "/landing-carousel/videos/video_13.mp4",
    stageBackground: "#98ff7f",
    stageGlow: "#2f66d0",
    cardSurface: "#18356c",
    cardAccent: "#20458d",
    cardBorder: "rgba(234, 240, 250, 0.26)",
    cardShadow: "rgba(53, 122, 45, 0.28)",
    textColor: "#f8fafc",
    mutedTextColor: "rgba(248, 250, 252, 0.82)",
    badgeBackground: "rgba(234, 240, 250, 0.14)",
    badgeColor: "#f8fafc",
  },
  {
    id: "proof",
    eyebrow: "Review com contexto",
    title: "Review com contexto.",
    subtitle:
      "Resultados ganham metrica, papel, link e historia suficiente para serem entendidos.",
    video: "/landing-carousel/videos/video_14.mp4",
    stageBackground: "#19c2ff",
    stageGlow: "#503db8",
    cardSurface: "#281f5e",
    cardAccent: "#503db8",
    cardBorder: "rgba(243, 240, 255, 0.26)",
    cardShadow: "rgba(9, 91, 122, 0.34)",
    textColor: "#f8fafc",
    mutedTextColor: "rgba(248, 250, 252, 0.82)",
    badgeBackground: "rgba(243, 240, 255, 0.14)",
    badgeColor: "#f8fafc",
  },
  {
    id: "cta",
    eyebrow: "Comece pelo essencial",
    title: "Sua trajetoria tem valor.",
    subtitle: "Faca esse valor aparecer.",
    video: "/landing-carousel/videos/video_15.mp4",
    stageBackground: "#d5f221",
    stageGlow: "#ff6b57",
    cardSurface: "#8a2b28",
    cardAccent: "#b93d34",
    cardBorder: "rgba(255, 244, 239, 0.24)",
    cardShadow: "rgba(174, 196, 39, 0.24)",
    textColor: "#fff8f5",
    mutedTextColor: "rgba(255, 248, 245, 0.84)",
    badgeBackground: "rgba(255, 244, 239, 0.14)",
    badgeColor: "#fff8f5",
  },
];
