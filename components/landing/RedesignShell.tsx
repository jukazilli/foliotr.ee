"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const THEME_STORAGE_KEY = "foliotree-theme";

function ThemeToggle() {
  const [isNoirTheme, setIsNoirTheme] = useState(false);

  useEffect(() => {
    try {
      setIsNoirTheme(window.localStorage.getItem(THEME_STORAGE_KEY) === "noir");
    } catch {
      setIsNoirTheme(false);
    }
  }, []);

  useEffect(() => {
    if (isNoirTheme) {
      document.body.dataset.theme = "noir";
    } else {
      delete document.body.dataset.theme;
    }

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, isNoirTheme ? "noir" : "default");
    } catch {
      // Keep the in-memory theme when localStorage is unavailable.
    }
  }, [isNoirTheme]);

  const themeLabel = isNoirTheme ? "Acender a luz" : "Apagar a luz";

  return (
    <button
      className="button theme-toggle"
      id="theme-toggle"
      type="button"
      aria-pressed={isNoirTheme}
      aria-label={themeLabel}
      title={themeLabel}
      onClick={() => setIsNoirTheme((currentTheme) => !currentTheme)}
    >
      <svg
        className="theme-toggle-icon theme-toggle-icon-moon"
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M21 12.8A8.5 8.5 0 0 1 11.2 3a7 7 0 1 0 9.8 9.8Z" />
      </svg>
      <svg
        className="theme-toggle-icon theme-toggle-icon-sun"
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="m4.93 4.93 1.41 1.41" />
        <path d="m17.66 17.66 1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="m6.34 17.66-1.41 1.41" />
        <path d="m19.07 4.93-1.41 1.41" />
      </svg>
    </button>
  );
}

export function RedesignHeader() {
  const [isTopbarHidden, setIsTopbarHidden] = useState(false);

  useEffect(() => {
    let ticking = false;

    function updateTopbar() {
      setIsTopbarHidden(window.scrollY > 12);
      ticking = false;
    }

    function queueUpdate() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateTopbar);
    }

    window.addEventListener("scroll", queueUpdate, { passive: true });
    window.addEventListener("resize", queueUpdate);
    updateTopbar();

    return () => {
      window.removeEventListener("scroll", queueUpdate);
      window.removeEventListener("resize", queueUpdate);
    };
  }, []);

  return (
    <header className={`topbar${isTopbarHidden ? " is-hidden" : ""}`} data-topbar>
      <Link className="brand" href="/" aria-label="Voltar para o início">
        <span>LINKFOLIO</span>
      </Link>

      <nav className="nav-links" aria-label="Navegação principal">
        <Link href="/#portfolio">PORTFÓLIO</Link>
        <Link href="/#versions">VERSÕES</Link>
        <Link href="/#resume">CURRÍCULOS</Link>
        <Link href="/#community">COMUNIDADE</Link>
      </nav>

      <div className="top-actions">
        <Link className="button button-light" href="/login">
          Entrar
        </Link>
        <Link className="button button-dark" href="/signup">
          Criar grátis
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}

export function RedesignFooter() {
  return (
    <footer className="footer">
      <div className="footer-panel">
        <div className="footer-brand">
          <svg
            className="footer-logo"
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M9.4 14.6 8 16a3.6 3.6 0 0 1-5.1-5.1l3-3A3.6 3.6 0 0 1 11 7.9"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
            />
            <path
              d="M14.6 9.4 16 8a3.6 3.6 0 0 1 5.1 5.1l-3 3a3.6 3.6 0 0 1-5.1 0"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
            />
            <path
              d="m8.8 15.2 6.4-6.4"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="3"
            />
          </svg>
          <strong className="footer-brand-name">LINKFOLIO</strong>
          <p>Uma página viva para mostrar trabalho, currículo e versões.</p>
        </div>

        <nav className="footer-links" aria-label="Rodapé">
          <section className="footer-link-group" aria-labelledby="footer-community">
            <h3 id="footer-community">Community</h3>
            <ul>
              <li>
                <Link href="/blog">Nosso blog</Link>
              </li>
              <li>
                <Link href="/teste-vocacional">Teste vocacional</Link>
              </li>
              <li>
                <Link href="/#resume">Explore templates</Link>
              </li>
              <li>
                <Link href="/#community">Nossos usuários</Link>
              </li>
              <li>
                <Link href="/#versions">Versões</Link>
              </li>
              <li>
                <Link href="/#portfolio">Portfólio</Link>
              </li>
              <li>
                <Link href="/#hero">Criar agora</Link>
              </li>
            </ul>
          </section>

          <section className="footer-link-group" aria-labelledby="footer-support">
            <h3 id="footer-support">Suporte</h3>
            <ul>
              <li>
                <Link href="/login">Ajuda</Link>
              </li>
              <li>
                <Link href="/#hero">Como começar</Link>
              </li>
              <li>
                <Link href="/#hero">Linkfolio Pro</Link>
              </li>
              <li>
                <Link href="/login">Perguntas frequentes</Link>
              </li>
            </ul>
          </section>

          <section className="footer-link-group" aria-labelledby="footer-company">
            <h3 id="footer-company">Company</h3>
            <ul>
              <li>
                <Link href="/login">Meet Tesseria Seed</Link>
              </li>
              <li>
                <Link href="/login">About</Link>
              </li>
              <li>
                <Link href="/login">Carreiras</Link>
              </li>
              <li>
                <Link href="/login">Aprenda</Link>
              </li>
              <li>
                <Link href="/login">Contact</Link>
              </li>
            </ul>
          </section>
        </nav>
      </div>
    </footer>
  );
}
