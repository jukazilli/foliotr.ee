"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { FolioTreeLogo } from "@/components/brand/FolioTreeLogo";
import { cn } from "@/lib/utils";

const links = [
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#provas", label: "Provas" },
  { href: "/templates", label: "Templates" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-3 z-50 px-3 sm:px-5">
      <div
        className={cn(
          "glass-nav mx-auto flex h-16 max-w-7xl items-center justify-between rounded-2xl px-4 transition-transform sm:px-5",
          scrolled && "translate-y-0"
        )}
      >
        <FolioTreeLogo href="/" />

        <nav
          className="hidden items-center gap-6 md:flex"
          aria-label="Navegação pública"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-neutral-700 transition-colors hover:text-neutral-950"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/login"
            className="rounded-full border border-white/70 bg-white/58 px-4 py-2 text-sm font-semibold text-neutral-900 backdrop-blur transition-colors hover:bg-white"
          >
            Entrar
          </Link>
          <Link
            href="/register"
            className="liquid-button rounded-full px-4 py-2 text-sm font-bold text-lime-900 transition-transform hover:-translate-y-0.5"
          >
            Criar conta
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-neutral-800 transition-colors hover:bg-white/72 md:hidden"
          onClick={() => setMenuOpen((value) => !value)}
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {menuOpen && (
        <div className="glass-panel mx-auto mt-2 max-w-7xl rounded-2xl p-3 md:hidden">
          <nav className="flex flex-col gap-1" aria-label="Navegação móvel">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-white/70"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-white/70 pt-3">
              <Link
                href="/login"
                className="rounded-full border border-white/80 bg-white/58 px-4 py-2.5 text-center text-sm font-semibold text-neutral-900"
              >
                Entrar
              </Link>
              <Link
                href="/register"
                className="liquid-button rounded-full px-4 py-2.5 text-center text-sm font-bold text-lime-900"
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
