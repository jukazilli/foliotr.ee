"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 h-16 w-full bg-white transition-shadow duration-200 ${
        scrolled ? "shadow-sm border-b border-neutral-200" : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="font-display text-xl font-bold text-neutral-900 tracking-tight">
          FolioTree
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          <a
            href="#como-funciona"
            className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            Como funciona
          </a>
          <a
            href="#exemplos"
            className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            Exemplos
          </a>
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50 transition-colors"
          >
            Entrar
          </Link>
          <Link
            href="/cadastro"
            className="rounded-lg bg-lime-500 px-4 py-2 text-sm font-medium text-lime-900 hover:bg-lime-400 transition-colors"
          >
            Criar conta
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="flex items-center justify-center rounded-lg p-2 text-neutral-700 hover:bg-neutral-100 transition-colors md:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Menu"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="absolute left-0 right-0 top-16 border-b border-neutral-200 bg-white px-4 pb-4 shadow-md md:hidden">
          <nav className="flex flex-col gap-1 pt-2">
            <a
              href="#como-funciona"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
            >
              Como funciona
            </a>
            <a
              href="#exemplos"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
            >
              Exemplos
            </a>
            <div className="mt-3 flex flex-col gap-2 border-t border-neutral-100 pt-3">
              <Link
                href="/login"
                className="rounded-lg border border-neutral-300 px-4 py-2.5 text-center text-sm font-medium text-neutral-700"
              >
                Entrar
              </Link>
              <Link
                href="/cadastro"
                className="rounded-lg bg-lime-500 px-4 py-2.5 text-center text-sm font-bold text-lime-900"
              >
                Criar conta
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
