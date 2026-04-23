"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { FolioTreeLogo } from "@/components/brand/FolioTreeLogo";
import { cn } from "@/lib/utils";

const links = [
  { href: "/templates", label: "Templates" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [desktopVisible, setDesktopVisible] = useState(false);

  const isDesktopMenuVisible = useMemo(
    () => desktopVisible || menuOpen,
    [desktopVisible, menuOpen],
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let hideTimer: ReturnType<typeof setTimeout> | null = null;

    function revealDesktopMenu(event: MouseEvent) {
      if (window.innerWidth < 768) {
        return;
      }

      if (event.clientY > 200) {
        return;
      }

      setDesktopVisible(true);

      if (hideTimer) {
        clearTimeout(hideTimer);
      }

      hideTimer = setTimeout(() => {
        setDesktopVisible(false);
      }, 1400);
    }

    window.addEventListener("mousemove", revealDesktopMenu, { passive: true });

    return () => {
      window.removeEventListener("mousemove", revealDesktopMenu);
      if (hideTimer) {
        clearTimeout(hideTimer);
      }
    };
  }, []);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6 sm:pt-5 lg:px-8 lg:pt-6">
      <div
        className={cn(
          "pointer-events-auto mx-auto flex h-[4.65rem] max-w-[97rem] items-center justify-between rounded-full border border-white/85 bg-white/88 px-5 shadow-[0_16px_48px_rgba(15,17,21,0.08)] backdrop-blur-xl transition-all duration-300 sm:h-[5rem] sm:px-7",
          scrolled && "shadow-[0_20px_60px_rgba(15,17,21,0.12)]",
          "md:translate-y-0 md:opacity-100",
          !isDesktopMenuVisible && "md:pointer-events-none md:-translate-y-5 md:opacity-0"
        )}
      >
        <FolioTreeLogo
          href="/"
          className="text-neutral-900"
          wordmarkClassName="text-[1.95rem] font-[800] tracking-[-0.05em]"
          markClassName="h-7 w-7"
        />

        <nav className="hidden items-center gap-6 md:flex" aria-label="Navegacao publica">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[1.05rem] font-semibold text-neutral-900 transition-colors hover:text-neutral-700"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="rounded-2xl bg-neutral-100 px-6 py-4 text-[1.05rem] font-semibold text-neutral-900 transition-colors hover:bg-neutral-200"
          >
            Entrar
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-neutral-900 px-7 py-4 text-[1.05rem] font-semibold text-white transition-colors hover:bg-neutral-800"
          >
            Criar conta
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl text-neutral-800 transition-colors hover:bg-neutral-100 md:hidden"
          onClick={() => setMenuOpen((value) => !value)}
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {menuOpen && (
        <div className="pointer-events-auto mx-auto mt-3 max-w-[97rem] rounded-[2rem] border border-white/90 bg-white p-3 shadow-[0_16px_48px_rgba(15,17,21,0.08)] md:hidden">
          <nav className="flex flex-col gap-1" aria-label="Navegacao movel">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-2xl px-4 py-3 text-base font-semibold text-neutral-700 hover:bg-neutral-100"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-neutral-200 pt-3">
              <Link
                href="/login"
                className="rounded-2xl bg-neutral-100 px-4 py-3 text-center text-sm font-semibold text-neutral-900"
              >
                Entrar
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-neutral-900 px-4 py-3 text-center text-sm font-semibold text-white"
              >
                Criar conta
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
