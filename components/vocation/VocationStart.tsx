"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function VocationStart() {
  const [open, setOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeButtonRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <button type="button" className="brand-button mt-8" onClick={() => setOpen(true)}>
        Iniciar agora
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-line/55 px-5">
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            aria-label="Fechar modal"
            onClick={() => setOpen(false)}
          />
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="vocation-modal-title"
            className="relative w-full max-w-xl rounded-[28px] border-2 border-line bg-cream p-7 shadow-hard"
          >
            <button
              ref={closeButtonRef}
              type="button"
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl font-extrabold"
              onClick={() => setOpen(false)}
              aria-label="Fechar"
            >
              ×
            </button>
            <p className="brand-eyebrow">Antes de começar</p>
            <h2
              id="vocation-modal-title"
              className="mt-4 text-4xl font-extrabold tracking-[-0.05em]"
            >
              Você já tem uma conta?
            </h2>
            <p className="brand-copy mt-4">
              O teste será salvo no seu perfil para continuar depois e comparar
              resultados com seu Linkfolio.
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <Link
                className="brand-button text-center"
                href="/login?callbackUrl=/teste-vocacional/app"
              >
                Já tenho conta
              </Link>
              <Link
                className="brand-button brand-button-pink text-center"
                href="/register?redirect=/teste-vocacional/app"
              >
                Criar conta
              </Link>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
