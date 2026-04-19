import type { LucideIcon } from "lucide-react";
import {
  FileText,
  Globe,
  LayoutDashboard,
  Layers3,
  Library,
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
    href: "/versions",
    label: "Versoes",
    shortLabel: "Versoes",
    icon: Layers3,
    section: "principal",
    description: "Crie versoes para objetivos diferentes.",
  },
  {
    href: "/pages",
    label: "Paginas",
    shortLabel: "Paginas",
    icon: Globe,
    section: "principal",
    description: "Edite e publique suas paginas.",
  },
  {
    href: "/resumes",
    label: "Curriculos",
    shortLabel: "Curriculos",
    icon: FileText,
    section: "principal",
    description: "Veja uma versao mais facil de ler.",
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

export function getAppNavItem(pathname: string) {
  return (
    appNavigation.find(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
    ) ?? appNavigation[0]
  );
}
