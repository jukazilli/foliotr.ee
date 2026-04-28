"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BriefcaseBusiness,
  Home,
  Images,
  LayoutTemplate,
  LogOut,
  Search,
  Settings,
  Sparkles,
  UserRound,
} from "lucide-react";
import { signOutAction } from "@/components/app/actions";
import { FolioTreeLogo } from "@/components/brand/FolioTreeLogo";
import { getInitials } from "@/lib/utils";

interface HeaderProps {
  userName?: string;
  userImage?: string;
  userUsername?: string | null;
}

interface SocialNavItem {
  href: string;
  label: string;
  icon: typeof Home;
  match?: string[];
}

function AccountAvatar({
  userName,
  userImage,
}: {
  userName?: string;
  userImage?: string;
}) {
  const initials = getInitials(userName ?? "FolioTree") || "FT";

  return (
    <span className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-line bg-pink text-xs font-extrabold text-ink">
      {userImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={userImage}
          alt={userName ?? ""}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center">
          {initials}
        </span>
      )}
    </span>
  );
}

function AccountMenu({
  userName,
  userImage,
}: {
  userName?: string;
  userImage?: string;
}) {
  return (
    <details className="group relative">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full px-1 py-1 font-bold text-ink hover:bg-cream">
        <AccountAvatar userName={userName} userImage={userImage} />
        <span className="hidden max-w-36 truncate text-sm sm:block">
          {userName ?? "Sua conta"}
        </span>
      </summary>

      <div className="absolute right-0 top-full z-50 mt-2 min-w-56 rounded-[18px] border-2 border-line bg-white p-2 shadow-app">
        <Link
          className="flex items-center gap-2 rounded-[16px] px-3 py-3 text-sm font-bold hover:bg-cream"
          href="/profile"
        >
          <UserRound className="h-4 w-4" aria-hidden="true" />
          Perfil
        </Link>
        <Link
          className="flex items-center gap-2 rounded-[16px] px-3 py-3 text-sm font-bold hover:bg-cream"
          href="/settings"
        >
          <Settings className="h-4 w-4" aria-hidden="true" />
          Configuracoes
        </Link>
        <div className="my-2 h-px bg-line/20" />
        <form action={signOutAction}>
          <button
            className="flex w-full items-center gap-2 rounded-[16px] px-3 py-3 text-left text-sm font-bold text-rose hover:bg-peach"
            type="submit"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sair
          </button>
        </form>
      </div>
    </details>
  );
}

function NavIcon({ item, active }: { item: SocialNavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      aria-label={item.label}
      title={item.label}
      className={`inline-flex h-11 min-w-11 items-center justify-center rounded-full border-2 transition hover:-translate-y-0.5 ${
        active
          ? "border-line bg-pink text-ink shadow-app"
          : "border-transparent bg-white text-muted hover:border-line hover:text-ink"
      }`}
    >
      <item.icon className="h-5 w-5" aria-hidden="true" />
    </Link>
  );
}

export function Header({ userName, userImage, userUsername }: HeaderProps) {
  const pathname = usePathname();
  const homeHref = "/home";
  const navItems: SocialNavItem[] = [
    { href: homeHref, label: "Inicio", icon: Home, match: [homeHref, "/dashboard"] },
    {
      href: "/portfolios",
      label: "Portfolios",
      icon: BriefcaseBusiness,
      match: ["/portfolios", "/pages", "/versions", "/resumes"],
    },
    { href: "/profile", label: "Perfil", icon: UserRound, match: ["/profile"] },
    { href: "/gallery", label: "Galeria", icon: Images, match: ["/gallery"] },
    {
      href: "/templates",
      label: "Templates",
      icon: LayoutTemplate,
      match: ["/templates"],
    },
    {
      href: "/teste-vocacional/app",
      label: "Teste vocacional",
      icon: Sparkles,
      match: ["/teste-vocacional/app"],
    },
  ];

  function isActive(item: SocialNavItem) {
    return item.match?.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    );
  }

  return (
    <header className="fixed left-0 right-0 top-0 z-40 border-b-2 border-line bg-cream/95 px-3 py-2 backdrop-blur">
      <div className="mx-auto flex max-w-[1560px] items-center gap-3">
        <FolioTreeLogo
          href={homeHref}
          compact
          className="shrink-0 rounded-full bg-white p-2 shadow-app"
        />

        <div className="hidden h-11 min-w-48 max-w-md flex-1 items-center gap-2 rounded-full border-2 border-line bg-white px-4 shadow-app md:flex">
          <Search className="h-4 w-4 text-muted" aria-hidden="true" />
          <input
            id="app-header-search"
            name="appHeaderSearch"
            type="search"
            placeholder="Buscar no FolioTree"
            className="min-w-0 flex-1 bg-transparent text-sm font-bold text-ink outline-none placeholder:text-muted"
            aria-label="Buscar no FolioTree"
          />
        </div>

        <nav
          className="flex min-w-0 flex-1 items-center justify-center gap-1 overflow-x-auto px-1 md:flex-none md:gap-2"
          aria-label="Navegacao principal"
        >
          {navItems.map((item) => (
            <NavIcon key={item.href} item={item} active={Boolean(isActive(item))} />
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center">
          <AccountMenu userName={userName} userImage={userImage} />
        </div>
      </div>
    </header>
  );
}
