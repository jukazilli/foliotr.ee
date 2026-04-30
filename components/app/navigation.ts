import type { LucideIcon } from "lucide-react";
import {
  BriefcaseBusiness,
  Images,
  Library,
  Settings,
  Sparkles,
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
    href: "/portfolios",
    label: "Portfolios",
    shortLabel: "Portfolios",
    icon: BriefcaseBusiness,
    section: "principal",
    description: "Publique versoes do seu trabalho.",
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
    description: "Entenda forcas e caminhos.",
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
  "/dashboard": "/profile",
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
