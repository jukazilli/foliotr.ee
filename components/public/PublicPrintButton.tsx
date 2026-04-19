"use client";

import { Printer } from "lucide-react";

interface PublicPrintButtonProps {
  compact?: boolean;
}

export default function PublicPrintButton({ compact = false }: PublicPrintButtonProps) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={`inline-flex items-center gap-2 rounded-full border border-white/45 bg-white/18 text-sm font-semibold text-neutral-900 shadow-[0_10px_30px_rgba(15,17,21,0.12)] backdrop-blur-xl transition hover:bg-white/28 ${
        compact ? "px-3 py-2" : "px-4 py-2.5"
      }`}
    >
      <Printer className="h-4 w-4" aria-hidden="true" />
      <span className={compact ? "hidden sm:inline" : ""}>Imprimir</span>
    </button>
  );
}
