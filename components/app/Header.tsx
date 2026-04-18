"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  ExternalLink,
  User,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { AvatarRoot, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ROUTE_LABELS: Record<string, string> = {
  "/dashboard": "Início",
  "/profile": "Meu Perfil",
  "/versions": "Versões",
  "/pages": "Páginas",
  "/resumes": "Currículos",
  "/settings": "Configurações",
};

function getBreadcrumb(pathname: string): string {
  // exact match first
  if (ROUTE_LABELS[pathname]) return ROUTE_LABELS[pathname];
  // check parent segment
  const segments = pathname.split("/").filter(Boolean);
  const parent = "/" + segments[0];
  return ROUTE_LABELS[parent] ?? segments[0] ?? "FolioTree";
}

interface HeaderProps {
  userName?: string;
  userImage?: string;
  userUsername?: string;
}

export function Header({ userName, userImage, userUsername }: HeaderProps) {
  const pathname = usePathname();
  const breadcrumb = getBreadcrumb(pathname);
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
    <header className="flex h-14 items-center justify-between border-b border-[rgba(15,17,21,0.08)] bg-white px-6 shrink-0">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-neutral-900">{breadcrumb}</span>
      </div>

      {/* Ações direitas */}
      <div className="flex items-center gap-3">
        {userUsername && (
          <Button variant="outline" size="sm" asChild>
            <Link
              href={`https://foliotr.ee/${userUsername}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Ver página pública
            </Link>
          </Button>
        )}

        {/* Dropdown do usuário */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              className={cn(
                "flex items-center gap-2 rounded-xl p-1 pr-2 transition-colors hover:bg-neutral-100",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-500"
              )}
            >
              <AvatarRoot size="sm">
                {userImage && <AvatarImage src={userImage} alt={userName ?? ""} />}
                <AvatarFallback>{initials}</AvatarFallback>
              </AvatarRoot>
              <span className="hidden sm:block text-sm font-medium text-neutral-700 max-w-32 truncate">
                {userName ?? "Usuário"}
              </span>
              <ChevronDown className="h-4 w-4 text-neutral-400" />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="z-50 min-w-48 rounded-2xl border border-[rgba(15,17,21,0.08)] bg-white p-1.5 shadow-lg animate-in fade-in-0 zoom-in-95"
              sideOffset={6}
              align="end"
            >
              <DropdownMenu.Item asChild>
                <Link
                  href="/profile"
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-neutral-700 outline-none hover:bg-neutral-100 cursor-pointer"
                >
                  <User className="h-4 w-4 text-neutral-400" />
                  Perfil
                </Link>
              </DropdownMenu.Item>

              <DropdownMenu.Item asChild>
                <Link
                  href="/settings"
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-neutral-700 outline-none hover:bg-neutral-100 cursor-pointer"
                >
                  <Settings className="h-4 w-4 text-neutral-400" />
                  Configurações
                </Link>
              </DropdownMenu.Item>

              <DropdownMenu.Separator className="my-1.5 h-px bg-[rgba(15,17,21,0.08)]" />

              <DropdownMenu.Item
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-coral-600 outline-none hover:bg-coral-50 cursor-pointer"
                onSelect={() => signOut({ callbackUrl: "/login" })}
              >
                <LogOut className="h-4 w-4" />
                Sair
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  );
}
