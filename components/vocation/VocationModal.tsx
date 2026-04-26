"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function VocationModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("has-open-modal");
    } else {
      document.body.classList.remove("has-open-modal");
    }

    return () => document.body.classList.remove("has-open-modal");
  }, [isOpen]);

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, []);

  return (
    <>
      <button
        className="button vocation-cta"
        type="button"
        data-vocation-open
        onClick={() => setIsOpen(true)}
      >
        Iniciar agora
      </button>

      <div
        className="vocation-modal"
        data-vocation-modal
        hidden={!isOpen}
        role="dialog"
        aria-modal="true"
        aria-labelledby="vocation-modal-title"
      >
        <button
          className="vocation-modal-backdrop"
          type="button"
          aria-label="Fechar"
          data-vocation-close
          onClick={() => setIsOpen(false)}
        />
        <section className="vocation-modal-card">
          <button
            className="vocation-modal-close"
            type="button"
            aria-label="Fechar"
            data-vocation-close
            onClick={() => setIsOpen(false)}
          >
            ×
          </button>
          <p className="eyebrow">Antes de começar</p>
          <h2 id="vocation-modal-title">Você já tem uma conta?</h2>
          <p>
            O teste será salvo no seu perfil para continuar depois e comparar
            resultados com seu Linkfolio.
          </p>

          <div className="vocation-modal-actions">
            <Link
              className="button vocation-modal-primary"
              href="/login?redirect=/teste-vocacional/app"
            >
              Já tenho conta
            </Link>
            <Link
              className="button vocation-modal-secondary"
              href="/signup?redirect=/teste-vocacional/app"
            >
              Criar conta
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
