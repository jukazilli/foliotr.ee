import Link from "next/link";
import { FolioTreeLogo } from "@/components/brand/FolioTreeLogo";

export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div>
          <FolioTreeLogo />
          <p className="mt-3 max-w-sm text-sm font-medium leading-6 text-neutral-500">
            Evidência profissional viva, organizada para páginas, versões e currículos.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-5 text-sm font-semibold text-neutral-600">
          <Link href="/templates" className="hover:text-neutral-950">
            Templates
          </Link>
          <Link href="/login" className="hover:text-neutral-950">
            Entrar
          </Link>
          <Link href="/register" className="hover:text-neutral-950">
            Criar conta
          </Link>
          <span className="font-data text-xs uppercase text-neutral-400">
            2026 FolioTree
          </span>
        </div>
      </div>
    </footer>
  );
}
