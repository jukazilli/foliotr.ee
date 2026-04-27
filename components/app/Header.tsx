"use client";

import Link from "next/link";
import { ExternalLink, LogOut, Menu, Search, Settings, UserRound } from "lucide-react";
import { signOutAction } from "@/components/app/actions";
import {
  appNavigation,
  libraryAppNavigation,
  primaryAppNavigation,
} from "@/components/app/navigation";
import { FolioTreeLogo } from "@/components/brand/FolioTreeLogo";
import { getInitials } from "@/lib/utils";

interface HeaderProps {
  userName?: string;
  userImage?: string;
  userUsername?: string | null;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

function AccountAvatar({
  userName,
  userImage,
  size = "md",
}: {
  userName?: string;
  userImage?: string;
  size?: "sm" | "md";
}) {
  const initials = getInitials(userName ?? "LINKFOLIO") || "LF";

  return (
    <span
      className={`relative flex shrink-0 overflow-hidden rounded-full border-2 border-line bg-pink font-extrabold text-ink ${
        size === "sm" ? "h-9 w-9 text-[0.68rem]" : "h-10 w-10 text-xs"
      }`}
    >
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
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full px-2 py-1 font-bold text-ink hover:bg-cream">
        <AccountAvatar userName={userName} userImage={userImage} />
        <span className="hidden max-w-36 truncate sm:block">
          {userName ?? "Sua conta"}
        </span>
      </summary>

      <div className="absolute right-0 top-full z-50 mt-2 min-w-56 rounded-[18px] border-2 border-line bg-white p-2 shadow-app lg:left-0 lg:right-auto">
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
          Configurações
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

function CollapsedAccountActions() {
  return (
    <div className="flex items-center justify-center">
      <form action={signOutAction}>
        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-line bg-pink text-ink transition hover:-translate-y-0.5 hover:bg-cream"
          type="submit"
          aria-label="Sair"
          title="Sair"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}

function NavLink({
  item,
  compact = false,
  collapsed = false,
}: {
  item: (typeof appNavigation)[number];
  compact?: boolean;
  collapsed?: boolean;
}) {
  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={
        compact
          ? "inline-flex h-11 shrink-0 items-center gap-2 rounded-full border-2 border-line bg-white px-3 text-sm font-bold shadow-app transition hover:-translate-y-0.5 hover:bg-pink"
          : `group flex min-h-11 items-center gap-3 rounded-[14px] px-3 py-2 text-sm font-bold text-ink transition hover:bg-pink ${
              collapsed ? "justify-center px-2" : ""
            }`
      }
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cream text-ink group-hover:bg-white">
        <item.icon className="h-4 w-4" aria-hidden="true" />
      </span>
      {collapsed ? null : <span>{compact ? item.shortLabel : item.label}</span>}
    </Link>
  );
}

function DesktopNavGroup({
  title,
  items,
  collapsed = false,
}: {
  title: string;
  items: typeof appNavigation;
  collapsed?: boolean;
}) {
  return (
    <section className="grid gap-2">
      {collapsed ? null : (
        <h2 className="px-3 text-[0.68rem] font-extrabold uppercase tracking-[0.18em] text-muted">
          {title}
        </h2>
      )}
      <nav className="grid gap-1" aria-label={title}>
        {items.map((item) => (
          <NavLink key={item.href} item={item} collapsed={collapsed} />
        ))}
      </nav>
    </section>
  );
}

export function Header({
  userName,
  userImage,
  userUsername,
  sidebarOpen,
  onToggleSidebar,
}: HeaderProps) {
  return (
    <>
      <aside
        className={`fixed bottom-0 left-0 top-0 z-40 hidden overflow-hidden border-r-2 border-line bg-white transition-[width] duration-200 ease-out lg:flex lg:flex-col ${
          sidebarOpen ? "w-[17rem]" : "w-[5.25rem]"
        }`}
      >
        <div
          className={`flex h-20 items-center border-b-2 border-line px-4 ${
            sidebarOpen ? "justify-start" : "justify-center"
          }`}
        >
          <button
            type="button"
            onClick={onToggleSidebar}
            className={`inline-flex min-w-0 items-center text-ink transition hover:text-muted focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink/70 ${
              sidebarOpen
                ? "h-12 rounded-[14px] px-2"
                : "h-12 w-12 justify-center rounded-full"
            }`}
            aria-label={sidebarOpen ? "Recolher menu lateral" : "Abrir menu lateral"}
            aria-expanded={sidebarOpen}
          >
            {sidebarOpen ? (
              <FolioTreeLogo markClassName="h-7 w-7" wordmarkClassName="text-lg" />
            ) : (
              <FolioTreeLogo compact markClassName="h-7 w-7" />
            )}
          </button>
        </div>

        <div className="app-sidebar-scroll flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overflow-x-hidden px-3 py-5">
          <DesktopNavGroup
            title="Principal"
            items={primaryAppNavigation}
            collapsed={!sidebarOpen}
          />
          <DesktopNavGroup
            title="Biblioteca"
            items={libraryAppNavigation}
            collapsed={!sidebarOpen}
          />
          <DesktopNavGroup
            title="Conta"
            items={appNavigation.filter((item) => item.section === "conta")}
            collapsed={!sidebarOpen}
          />
        </div>

        <div className="overflow-visible border-t-2 border-line p-3">
          {sidebarOpen ? (
            <AccountMenu userName={userName} userImage={userImage} />
          ) : (
            <CollapsedAccountActions />
          )}

          {userUsername && sidebarOpen ? (
            <Link
              href={`/${userUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex h-11 items-center justify-center gap-2 border-2 border-line bg-pink px-4 text-sm font-extrabold uppercase text-ink transition-transform hover:-translate-y-0.5"
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              Abrir página
            </Link>
          ) : null}
        </div>
      </aside>

      <header className="fixed left-0 right-0 top-0 z-40 border-b-2 border-line bg-cream/95 px-3 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-line bg-white shadow-app"
            aria-label="Menu"
          >
            <Menu className="h-4 w-4" aria-hidden="true" />
          </button>
          <FolioTreeLogo
            href="/dashboard"
            compact
            className="rounded-full bg-white p-2 shadow-app"
          />

          <div
            className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto"
            aria-label="Navegação principal"
          >
            {primaryAppNavigation.slice(0, 6).map((item) => (
              <NavLink key={item.href} item={item} compact />
            ))}
          </div>

          <AccountMenu userName={userName} userImage={userImage} />
        </div>
      </header>

      <div
        className={`fixed right-0 top-0 z-30 hidden border-b-2 border-line bg-cream/95 px-4 py-3 backdrop-blur transition-[left] duration-200 ease-out lg:block xl:px-5 ${
          sidebarOpen ? "left-[17rem]" : "left-[5.25rem]"
        }`}
      >
        <div className="mx-auto flex max-w-[1560px] flex-wrap items-center justify-between gap-3 xl:flex-nowrap xl:gap-5">
          <div className="order-2 flex h-11 w-full items-center gap-3 rounded-full border-2 border-line bg-white px-4 shadow-app xl:order-1 xl:max-w-xl">
            <Search className="h-4 w-4 text-muted" aria-hidden="true" />
            <input
              id="app-header-search"
              name="appHeaderSearch"
              type="search"
              placeholder="Buscar no Linkfolio"
              className="min-w-0 flex-1 bg-transparent text-sm font-bold text-ink outline-none placeholder:text-muted"
              aria-label="Buscar no Linkfolio"
            />
          </div>

          <div className="order-1 ml-auto flex items-center gap-2 xl:order-2 xl:ml-0">
            {userUsername ? (
              <Link
                href={`/${userUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 shrink-0 items-center gap-2 border-2 border-line bg-pink px-3 text-sm font-extrabold uppercase text-ink transition-transform hover:-translate-y-0.5 xl:px-4"
              >
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                Ver público
              </Link>
            ) : null}
            <AccountMenu userName={userName} userImage={userImage} />
          </div>
        </div>
      </div>
    </>
  );
}
