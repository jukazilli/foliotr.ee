import type { LucideIcon } from "lucide-react";
import {
  Images,
  LayoutDashboard,
  Layers3,
  Library,
  Sparkles,
  Settings,
  UserRound,
} from "lucide-react";

export interface AppNavItem {
  href: string;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  section: "principal" | "biblioteca" | "conta";
  description: string;
}

export const appNavigation: AppNavItem[] = [
  {
    href: "/dashboard",
    label: "Area inicial",
    shortLabel: "Inicio",
    icon: LayoutDashboard,
    section: "principal",
    description: "Veja o que fazer agora.",
  },
  {
    href: "/profile",
    label: "Perfil",
    shortLabel: "Perfil",
    icon: UserRound,
    section: "principal",
    description: "Complete suas informacoes.",
  },
  {
    href: "/portfolios",
    label: "Portfolios",
    shortLabel: "Portfolios",
    icon: Layers3,
    section: "principal",
    description: "Publique versoes do seu trabalho.",
  },
  {
    href: "/gallery",
    label: "Galeria",
    shortLabel: "Galeria",
    icon: Images,
    section: "principal",
    description: "Reutilize imagens enviadas.",
  },
  {
    href: "/teste-vocacional/app",
    label: "Teste vocacional",
    shortLabel: "Teste",
    icon: Sparkles,
    section: "principal",
    description: "Entenda forças e caminhos.",
  },
  {
    href: "/templates",
    label: "Templates",
    shortLabel: "Templates",
    icon: Library,
    section: "biblioteca",
    description: "Escolha um modelo.",
  },
  {
    href: "/settings",
    label: "Configuracoes",
    shortLabel: "Ajustes",
    icon: Settings,
    section: "conta",
    description: "Ajuste sua conta.",
  },
];

export const primaryAppNavigation = appNavigation.filter(
  (item) => item.section === "principal"
);

export const libraryAppNavigation = appNavigation.filter(
  (item) => item.section === "biblioteca"
);

const TECHNICAL_ROUTE_NAV_ALIASES: Record<string, string> = {
  "/pages": "/portfolios",
  "/versions": "/portfolios",
  "/resumes": "/portfolios",
};

export function getAppNavItem(pathname: string) {
  const alias = Object.entries(TECHNICAL_ROUTE_NAV_ALIASES).find(
    ([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (alias) {
    return appNavigation.find((item) => item.href === alias[1]) ?? appNavigation[0];
  }

  return (
    appNavigation.find(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
    ) ?? appNavigation[0]
  );
}
