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
  return (
    <span className="relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full border-2 border-line bg-gray-100 text-xs font-extrabold text-ink">
      {userImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={userImage}
          alt={userName ?? ""}
          className="h-full w-full object-cover"
        />
      ) : (
        <svg
          viewBox="0 0 64 64"
          role="img"
          aria-label={userName ?? "Avatar"}
          className="h-full w-full"
        >
          <rect width="64" height="64" fill="#f3f4f6" />
          <circle cx="32" cy="24" r="12" fill="#111827" opacity="0.9" />
          <path
            d="M12 58c3.5-14 13-22 20-22s16.5 8 20 22"
            fill="#ffcce6"
            stroke="#111827"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
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
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full px-1 py-1 font-bold text-ink hover:bg-gray-100">
        <AccountAvatar userName={userName} userImage={userImage} />
        <span className="hidden max-w-36 truncate text-sm sm:block">
          {userName ?? "Sua conta"}
        </span>
      </summary>

      <div className="absolute right-0 top-full z-50 mt-2 min-w-56 rounded-xl border-2 border-line bg-white p-2 shadow-app">
        <Link
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold hover:bg-gray-100"
          href="/profile"
        >
          <UserRound className="h-4 w-4" aria-hidden="true" />
          Perfil
        </Link>
        <Link
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold hover:bg-gray-100"
          href="/settings"
        >
          <Settings className="h-4 w-4" aria-hidden="true" />
          Configurações
        </Link>
        <div className="my-2 h-px bg-line/20" />
        <form action={signOutAction}>
          <button
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-bold text-rose hover:bg-red-50"
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
      className={`inline-flex h-10 min-w-10 items-center justify-center rounded-full border-2 transition hover:-translate-y-0.5 ${
        active
          ? "border-line bg-pink text-ink"
          : "border-transparent bg-white text-muted hover:bg-gray-100 hover:text-ink"
      }`}
    >
      <item.icon className="h-5 w-5" aria-hidden="true" />
    </Link>
  );
}

export function Header({ userName, userImage, userUsername }: HeaderProps) {
  const pathname = usePathname();
  const homeHref = userUsername ? `/${userUsername}` : "/home";
  const navItems: SocialNavItem[] = [
    {
      href: homeHref,
      label: "Início",
      icon: Home,
      match: [homeHref, "/dashboard"],
    },
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
    <>
      <header className="fixed left-0 right-0 top-0 z-40 hidden border-b-2 border-line bg-white px-3 py-2 md:block">
        <div className="mx-auto grid max-w-[1560px] grid-cols-[auto_minmax(260px,520px)_minmax(340px,1fr)_auto] items-center gap-3">
          <FolioTreeLogo
            href={homeHref}
            compact
            className="shrink-0 rounded-full bg-white p-2"
          />

          <div className="flex h-10 min-w-0 items-center gap-2 rounded-full border-2 border-line bg-white px-4">
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
            className="flex min-w-0 items-center justify-center gap-2 overflow-x-auto px-1"
            aria-label="Navegação principal"
          >
            {navItems.map((item) => (
              <NavIcon key={item.href} item={item} active={Boolean(isActive(item))} />
            ))}
          </nav>

          <div className="flex shrink-0 items-center justify-end">
            <AccountMenu userName={userName} userImage={userImage} />
          </div>
        </div>
      </header>

      <nav
        className="fixed bottom-0 left-0 right-0 z-40 border-t-2 border-line bg-white/95 px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 backdrop-blur md:hidden"
        aria-label="Navegação principal"
      >
        <div className="mx-auto flex max-w-md items-center justify-around gap-1">
          {navItems.map((item) => (
            <NavIcon key={item.href} item={item} active={Boolean(isActive(item))} />
          ))}
        </div>
      </nav>
    </>
  );
}
