import Link from "next/link";
import { ExternalLink, LogOut, Search, Settings, UserRound } from "lucide-react";
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
}

function AccountAvatar({ userName, userImage }: { userName?: string; userImage?: string }) {
  const initials = getInitials(userName ?? "LINKFOLIO") || "LF";

  return (
    <span className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-line bg-pink text-xs font-extrabold text-ink">
      {userImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={userImage} alt={userName ?? ""} className="h-full w-full object-cover" />
      ) : (
        <span className="flex h-full w-full items-center justify-center">{initials}</span>
      )}
    </span>
  );
}

function AccountMenu({ userName, userImage }: { userName?: string; userImage?: string }) {
  return (
    <details className="group relative">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full px-2 py-1 font-extrabold text-ink hover:bg-cream">
        <AccountAvatar userName={userName} userImage={userImage} />
        <span className="hidden max-w-36 truncate sm:block">{userName ?? "Sua conta"}</span>
      </summary>

      <div className="absolute right-0 top-full z-50 mt-2 min-w-56 rounded-[22px] border-2 border-line bg-white p-2 shadow-hard-sm lg:left-0 lg:right-auto">
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

function NavLink({ item, compact = false }: { item: (typeof appNavigation)[number]; compact?: boolean }) {
  return (
    <Link
      href={item.href}
      className={
        compact
          ? "inline-flex h-11 shrink-0 items-center gap-2 rounded-full border-2 border-line bg-white px-3 text-sm font-extrabold shadow-hard-sm transition hover:-translate-y-0.5 hover:bg-pink"
          : "group flex min-h-12 items-center gap-3 rounded-[18px] px-3 py-2 text-sm font-extrabold text-ink transition hover:bg-pink"
      }
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cream text-ink group-hover:bg-white">
        <item.icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <span>{compact ? item.shortLabel : item.label}</span>
    </Link>
  );
}

function DesktopNavGroup({
  title,
  items,
}: {
  title: string;
  items: typeof appNavigation;
}) {
  return (
    <section className="grid gap-2">
      <h2 className="px-3 text-[0.68rem] font-extrabold uppercase tracking-[0.24em] text-muted">
        {title}
      </h2>
      <nav className="grid gap-1" aria-label={title}>
        {items.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </nav>
    </section>
  );
}

export function Header({ userName, userImage, userUsername }: HeaderProps) {
  return (
    <>
      <aside className="fixed bottom-0 left-0 top-0 z-40 hidden w-[292px] border-r-2 border-line bg-white lg:flex lg:flex-col">
        <div className="flex h-20 items-center border-b-2 border-line px-6">
          <FolioTreeLogo href="/dashboard" markClassName="h-7 w-7" />
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-8 overflow-y-auto px-4 py-5">
          <DesktopNavGroup title="Principal" items={primaryAppNavigation} />
          <DesktopNavGroup title="Biblioteca" items={libraryAppNavigation} />
          <DesktopNavGroup title="Conta" items={appNavigation.filter((item) => item.section === "conta")} />
        </div>

        <div className="border-t-2 border-line p-4">
          <AccountMenu userName={userName} userImage={userImage} />

          {userUsername ? (
            <Link
              href={`/${userUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex h-11 items-center justify-center gap-2 bg-orange px-4 text-sm font-extrabold uppercase text-white transition-transform hover:-translate-y-0.5"
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              Abrir página
            </Link>
          ) : null}
        </div>
      </aside>

      <header className="fixed left-0 right-0 top-0 z-40 border-b-2 border-line bg-cream/95 px-3 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-3">
          <FolioTreeLogo href="/dashboard" compact className="rounded-full bg-white p-2 shadow-hard-sm" />

          <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto" aria-label="Navegação principal">
            {primaryAppNavigation.slice(0, 6).map((item) => (
              <NavLink key={item.href} item={item} compact />
            ))}
          </div>

          <AccountMenu userName={userName} userImage={userImage} />
        </div>
      </header>

      <div className="fixed left-[292px] right-0 top-0 z-30 hidden border-b-2 border-line bg-cream/95 px-8 py-4 backdrop-blur lg:block">
        <div className="mx-auto flex max-w-[1560px] items-center justify-between gap-5">
          <div className="flex h-11 w-full max-w-xl items-center gap-3 rounded-full border-2 border-line bg-white px-4 shadow-hard-sm">
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

          <div className="flex items-center gap-2">
            {userUsername ? (
              <Link
                href={`/${userUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 shrink-0 items-center gap-2 bg-orange px-4 text-sm font-extrabold uppercase text-white transition-transform hover:-translate-y-0.5"
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
