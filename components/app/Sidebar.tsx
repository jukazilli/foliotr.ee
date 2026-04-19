"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, type LucideIcon } from "lucide-react";
import { FolioTreeLogo } from "@/components/brand/FolioTreeLogo";
import {
  getAppNavItem,
  libraryAppNavigation,
  primaryAppNavigation,
} from "@/components/app/navigation";
import { cn } from "@/lib/utils";

function SidebarLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-3 rounded-2xl px-3 py-3 transition-all",
        active
          ? "bg-green-100 text-green-900 shadow-sm shadow-green-900/10"
          : "text-neutral-700 hover:bg-neutral-100/90 hover:text-neutral-950"
      )}
    >
      <span
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border",
          active
            ? "border-green-200 bg-green-500 text-green-900"
            : "border-neutral-200 bg-white text-neutral-500"
        )}
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1 truncate text-sm font-semibold">{label}</span>
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const activeItem = getAppNavItem(pathname);

  return (
    <aside className="hidden w-72 shrink-0 lg:block xl:w-80">
      <div className="sticky top-3 flex h-[calc(100vh-1.5rem)] flex-col overflow-hidden rounded-[30px] border border-white/70 bg-white/88 px-4 py-5 shadow-sm backdrop-blur">
        <div className="px-2">
          <FolioTreeLogo href="/" />
        </div>

        <div className="mt-8 min-h-0 flex-1 overflow-y-auto pr-1">
          <div className="space-y-2">
            {primaryAppNavigation.map((item) => (
              <SidebarLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                active={activeItem.href === item.href}
              />
            ))}
          </div>

          <div className="mt-4 border-t border-neutral-200/80 pt-4">
            <div className="space-y-2">
              {libraryAppNavigation.map((item) => (
                <SidebarLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  active={activeItem.href === item.href}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 border-t border-neutral-200/80 pt-4">
          <Link
            href="/settings"
            className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-100/90 hover:text-neutral-950"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-neutral-200 bg-white text-neutral-500">
              <Settings className="h-4 w-4" aria-hidden="true" />
            </span>
            Ajustes
          </Link>
        </div>
      </div>
    </aside>
  );
}
