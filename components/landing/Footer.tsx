import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-neutral-900 py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          {/* Logo */}
          <span className="font-display text-xl font-bold text-white tracking-tight">
            FolioTree
          </span>

          {/* Links */}
          <nav className="flex items-center gap-6">
            <Link
              href="/sobre"
              className="text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              Sobre
            </Link>
            <Link
              href="/privacidade"
              className="text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              Privacidade
            </Link>
            <Link
              href="/termos"
              className="text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              Termos
            </Link>
          </nav>

          {/* Copyright */}
          <p className="text-sm text-neutral-500">
            &copy; 2026 FolioTree. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
