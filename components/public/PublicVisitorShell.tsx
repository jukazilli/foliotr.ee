"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const THEME_STORAGE_KEY = "linkfolio-theme";

function VisitorThemeToggle() {
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

export function PublicVisitorShell({ children }: { children: React.ReactNode }) {
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
    <div className="min-h-screen bg-[#f2f4f7] text-neutral-950">
      <header className={`topbar${isTopbarHidden ? " is-hidden" : ""}`} data-topbar>
        <Link className="brand" href="/" aria-label="LINKFOLIO inicio">
          <span>LINKFOLIO</span>
        </Link>

        <div className="top-actions">
          <Link className="button button-light" href="/login">
            Entrar
          </Link>
          <Link className="button button-dark" href="/signup">
            Criar gratis
          </Link>
          <VisitorThemeToggle />
        </div>
      </header>

      <div className="pt-[136px] sm:pt-[150px]">{children}</div>
    </div>
  );
}
