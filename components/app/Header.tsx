import Link from "next/link";
import { ChevronDown, ExternalLink, Home, LogOut, Search, Settings, UserRound } from "lucide-react";
import { signOutAction } from "@/components/app/actions";
import { appNavigation, type AppNavItem } from "@/components/app/navigation";
import { FolioTreeLogo } from "@/components/brand/FolioTreeLogo";
import { cn, getInitials } from "@/lib/utils";

interface HeaderProps {
  userName?: string;
  userImage?: string;
  userUsername?: string | null;
}

type MenuGroup = {
  label: string;
  items: AppNavItem[];
};

const menuGroups: MenuGroup[] = [
  {
    label: "Inicio",
    items: appNavigation.filter((item) => item.href === "/dashboard"),
  },
  {
    label: "Conteudo",
    items: appNavigation.filter((item) => ["/profile", "/versions"].includes(item.href)),
  },
  {
    label: "Publicacao",
    items: appNavigation.filter((item) => ["/pages", "/resumes"].includes(item.href)),
  },
  {
    label: "Biblioteca",
    items: appNavigation.filter((item) => item.href === "/templates"),
  },
  {
    label: "Conta",
    items: appNavigation.filter((item) => item.href === "/settings"),
  },
];

function AccountAvatar({
  userName,
  userImage,
}: {
  userName?: string;
  userImage?: string;
}) {
  const initials = getInitials(userName ?? "FolioTree") || "FT";

  return (
    <span className="relative flex h-7 w-7 shrink-0 overflow-hidden rounded-full bg-red-500 text-[11px] font-medium text-white">
      {userImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={userImage} alt={userName ?? ""} className="h-full w-full object-cover" />
      ) : (
        <span className="flex h-full w-full items-center justify-center">{initials}</span>
      )}
    </span>
  );
}

function TopMenuGroup({ group }: { group: MenuGroup }) {
  return (
    <details className="group relative">
      <summary
        className={cn(
          "flex h-[32px] cursor-pointer list-none items-center gap-1 rounded-lg px-2.5 text-[13px] font-normal tracking-[0.005em] text-neutral-900 transition-colors",
          "hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-500"
        )}
      >
        {group.label}
        <ChevronDown
          className="h-3 w-3 text-neutral-600 transition-transform group-open:rotate-180"
          strokeWidth={1.8}
          aria-hidden="true"
        />
      </summary>

      <div className="absolute left-0 top-full z-50 mt-1.5 min-w-56 rounded-xl border border-neutral-200 bg-white p-1.5 shadow-xl shadow-neutral-950/10">
        {group.items.map((item) => (
          <Link
            href={item.href}
            key={item.href}
            className="flex items-start gap-2.5 rounded-lg px-2.5 py-2 text-neutral-700 outline-none transition-colors hover:bg-neutral-100 hover:text-neutral-950"
          >
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-500">
              <item.icon className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block text-[13px] font-normal tracking-[0.005em]">{item.label}</span>
              <span className="mt-0.5 block text-xs font-normal leading-4 text-neutral-500">
                {item.description}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </details>
  );
}

export function Header({ userName, userImage, userUsername }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200/80 bg-white/92 shadow-sm backdrop-blur-xl">
      <div className="flex min-h-[56px] items-center gap-2.5 px-3 sm:px-4">
        <details className="group relative shrink-0">
          <summary
            className={cn(
              "flex h-[32px] min-w-0 cursor-pointer list-none items-center gap-2 rounded-lg px-2 text-[13px] font-normal tracking-[0.005em] text-neutral-950 transition-colors",
              "hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-500"
            )}
          >
            <AccountAvatar userName={userName} userImage={userImage} />
            <span className="hidden max-w-36 truncate sm:block">{userName ?? "Sua conta"}</span>
            <ChevronDown
              className="hidden h-3 w-3 text-neutral-600 transition-transform group-open:rotate-180 sm:block"
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </summary>

          <div className="absolute left-0 top-full z-50 mt-1.5 min-w-48 rounded-xl border border-neutral-200 bg-white p-1.5 shadow-xl shadow-neutral-950/10">
            <Link
              href="/profile"
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-normal text-neutral-700 outline-none transition-colors hover:bg-neutral-100 hover:text-neutral-950"
            >
              <UserRound className="h-4 w-4 text-neutral-500" aria-hidden="true" />
              Perfil
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-normal text-neutral-700 outline-none transition-colors hover:bg-neutral-100 hover:text-neutral-950"
            >
              <Settings className="h-4 w-4 text-neutral-500" aria-hidden="true" />
              Configuracoes
            </Link>
            <div className="my-2 h-px bg-neutral-100" />
            <form action={signOutAction}>
              <button
                type="submit"
                className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-normal text-coral-700 outline-none transition-colors hover:bg-coral-50"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Sair
              </button>
            </form>
          </div>
        </details>

        <div className="h-[32px] w-px shrink-0 bg-neutral-200" />

        <FolioTreeLogo
          href="/dashboard"
          compact
          className="hidden h-[32px] shrink-0 rounded-lg px-2.5 transition-colors hover:bg-neutral-100 sm:inline-flex"
          markClassName="h-4 w-4 text-neutral-950"
        />

        <nav aria-label="Navegacao principal" className="hidden min-w-0 flex-1 items-center gap-3 lg:flex">
          {menuGroups.map((group) => (
            <TopMenuGroup key={group.label} group={group} />
          ))}
        </nav>

        <nav
          aria-label="Navegacao principal mobile"
          className="flex min-w-0 flex-1 gap-2 overflow-x-auto lg:hidden"
        >
          {appNavigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex h-[32px] shrink-0 items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 text-[13px] font-normal tracking-[0.005em] text-neutral-700 transition-colors hover:bg-neutral-200 hover:text-neutral-950"
            >
                <item.icon className="h-3.5 w-3.5" aria-hidden="true" />
              {item.shortLabel}
            </Link>
          ))}
        </nav>

        <div className="hidden h-[32px] w-[230px] shrink-0 items-center gap-2 rounded-full bg-neutral-100 px-3 xl:flex">
          <Search className="h-3.5 w-3.5 text-neutral-500" aria-hidden="true" />
          <input
            type="search"
            placeholder="Buscar"
            className="min-w-0 flex-1 bg-transparent text-[13px] font-normal text-neutral-900 outline-none placeholder:text-neutral-500"
            aria-label="Buscar"
          />
        </div>

        {userUsername ? (
          <Link
            href={`/${userUsername}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden h-[32px] shrink-0 items-center justify-center gap-1.5 rounded-lg border border-white/78 bg-white/62 px-3 text-[13px] font-medium text-neutral-900 backdrop-blur transition-colors hover:bg-white md:inline-flex"
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            Abrir pagina
          </Link>
        ) : null}

        <Link
          href="/pages"
          className="inline-flex h-[32px] shrink-0 items-center justify-center gap-1.5 rounded-lg bg-blue-500 px-3 text-[13px] font-medium text-white transition-colors hover:bg-blue-600"
        >
          Publicar
        </Link>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto border-t border-neutral-200/70 bg-neutral-50/80 px-3 py-1.5 text-xs font-normal tracking-[0.005em] text-neutral-500">
        <Link
          href="/dashboard"
          className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-white hover:text-neutral-900"
          aria-label="Area inicial"
        >
          <Home className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
        <span aria-hidden="true">›</span>
        <span className="shrink-0">FolioTree</span>
      </div>
    </header>
  );
}
