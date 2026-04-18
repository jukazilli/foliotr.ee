"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User,
  Layers,
  Globe,
  FileText,
  Settings,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AvatarRoot, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const mainNavItems: NavItem[] = [
  { label: "Início", href: "/dashboard", icon: LayoutDashboard },
  { label: "Meu Perfil", href: "/profile", icon: User },
  { label: "Versões", href: "/versions", icon: Layers },
  { label: "Páginas", href: "/pages", icon: Globe },
  { label: "Currículos", href: "/resumes", icon: FileText },
];

const bottomNavItems: NavItem[] = [
  { label: "Configurações", href: "/settings", icon: Settings },
];

interface SidebarProps {
  userName?: string;
  userImage?: string;
  userUsername?: string;
}

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors relative",
        isActive
          ? "bg-neutral-100 text-neutral-900 font-semibold before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-5 before:w-0.5 before:rounded-r-full before:bg-lime-500"
          : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {item.label}
    </Link>
  );
}

export function Sidebar({ userName, userImage, userUsername }: SidebarProps) {
  const pathname = usePathname();
  const initials = userName
    ? userName
        .trim()
        .split(/\s+/)
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "FT";

  return (
    <aside className="hidden lg:flex w-60 shrink-0 flex-col border-r border-[rgba(15,17,21,0.08)] bg-white">
      {/* Logo */}
      <div className="flex h-14 items-center px-5 border-b border-[rgba(15,17,21,0.08)]">
        <span className="font-display text-lg font-bold text-neutral-900">
          FolioTree
        </span>
      </div>

      {/* Nav principal */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {mainNavItems.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} />
        ))}
      </nav>

      {/* Nav inferior */}
      <div className="px-3 pb-3 space-y-1">
        {bottomNavItems.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} />
        ))}
      </div>

      {/* Usuário no rodapé */}
      <div className="border-t border-[rgba(15,17,21,0.08)] p-4">
        <div className="flex items-center gap-3 min-w-0">
          <AvatarRoot size="sm">
            {userImage && <AvatarImage src={userImage} alt={userName ?? ""} />}
            <AvatarFallback>{initials}</AvatarFallback>
          </AvatarRoot>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-neutral-900 truncate">
              {userName ?? "Usuário"}
            </p>
            {userUsername && (
              <Link
                href={`https://foliotr.ee/${userUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-600 transition-colors truncate"
              >
                <span className="truncate">foliotr.ee/{userUsername}</span>
                <ExternalLink className="h-3 w-3 shrink-0" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
