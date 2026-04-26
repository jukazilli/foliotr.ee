"use client";

import { FormEvent, useEffect, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const THEME_STORAGE_KEY = "foliotree-theme";

function normalizeUsername(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9-_]/g, "")
    .slice(0, 24);
}

export default function LandingExperience() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [isTopbarHidden, setIsTopbarHidden] = useState(false);
  const [isNoirTheme, setIsNoirTheme] = useState(false);
  const [isResumeActivated, setIsResumeActivated] = useState(false);

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

  useEffect(() => {
    if (isResumeActivated) return;

    let ticking = false;

    function isBlockInView(block: HTMLElement) {
      const rect = block.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

      return rect.top <= viewportHeight * 0.78 && rect.bottom >= viewportHeight * 0.22;
    }

    function checkResumeStack() {
      const block = document.querySelector<HTMLElement>("[data-auto-activate]");

      if (block && isBlockInView(block)) {
        setIsResumeActivated(true);
      }

      ticking = false;
    }

    function queueCheck() {
      if (ticking) return;

      ticking = true;
      window.requestAnimationFrame(checkResumeStack);
    }

    window.addEventListener("scroll", queueCheck, { passive: true });
    window.addEventListener("resize", queueCheck);
    checkResumeStack();

    return () => {
      window.removeEventListener("scroll", queueCheck);
      window.removeEventListener("resize", queueCheck);
    };
  }, [isResumeActivated]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanUsername = normalizeUsername(username.replace(/^@/, ""));
    setUsername(cleanUsername);
    router.push(`/signup${cleanUsername ? `?username=${encodeURIComponent(cleanUsername)}` : ""}`);
  }

  const themeLabel = isNoirTheme ? "Acender a luz" : "Apagar a luz";

  return (
    <>
      <header className={`topbar${isTopbarHidden ? " is-hidden" : ""}`} data-topbar>
        <a className="brand" href="#hero" aria-label="Linkfolio início">
          <span>LINKFOLIO</span>
        </a>

        <nav className="nav-links" aria-label="Navegação principal">
          <a href="#portfolio">PORTFÓLIO</a>
          <a href="#versions">VERSÕES</a>
          <a href="#resume">CURRÍCULOS</a>
          <a href="#community">COMUNIDADE</a>
        </nav>

        <div className="top-actions">
          <Link className="button button-light" href="/login">Entrar</Link>
          <Link className="button button-dark" href="/signup">Criar grátis</Link>
          <button
            className="button theme-toggle"
            id="theme-toggle"
            type="button"
            aria-pressed={isNoirTheme}
            aria-label={themeLabel}
            title={themeLabel}
            onClick={() => setIsNoirTheme((currentTheme) => !currentTheme)}
          >
            <svg className="theme-toggle-icon theme-toggle-icon-moon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M21 12.8A8.5 8.5 0 0 1 11.2 3a7 7 0 1 0 9.8 9.8Z" />
            </svg>
            <svg className="theme-toggle-icon theme-toggle-icon-sun" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
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
        </div>
      </header>

      <main>
        <section className="hero block block-lime" id="hero">
          <div className="block-copy">
            <p className="eyebrow">Portfólio online em minutos</p>
            <h1 className="hero-title">
              <span>Transforme visitas</span>
              <span>em interesse real.</span>
            </h1>
            <p className="lead">
              Crie seu Linkfolio, publique nas redes sociais e entregue para
              recrutadores uma leitura clara do que você faz.
            </p>

            <form className="username-form" id="username-form" onSubmit={handleSubmit}>
              <label className="sr-only" htmlFor="username-input">Seu nome de usuário</label>
              <div className="username-input">
                <span>linkfolio.co/@</span>
                <input
                  id="username-input"
                  name="username"
                  type="text"
                  placeholder="ana"
                  autoComplete="off"
                  spellCheck="false"
                  aria-label="Seu nome de usuário"
                  value={username}
                  onChange={(event) => setUsername(normalizeUsername(event.target.value))}
                />
              </div>
              <button className="button button-submit" type="submit">
                Criar meu Linkfolio
              </button>
            </form>
          </div>

          <div className="hero-media" aria-label="Preview do Linkfolio">
            <div className="browser-card">
              <div className="profile-preview">
                <div className="ana-photo-card" aria-label="Foto de Ana, designer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="ana-portrait"
                    src="/redesign/img/ufo copy.gif"
                    alt="Capture a atenção de recrutadores com um portfólio online"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="feature block block-blue" id="portfolio">
          <div className="feature-art">
            <div className="gif-card" aria-label="Preview com gif de gato">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="feature-gif" src="/redesign/img/cat.gif" alt="Gif de gato" />
            </div>
          </div>

          <div className="feature-copy">
            <p className="eyebrow">Portfólio publicado</p>
            <h2>Crie um portfólio online em minutos.</h2>
            <p>
              Divulgue nas suas redes sociais uma página clara com seu trabalho,
              seus links e as provas que fazem alguém querer conversar com você.
            </p>
            <Link className="button button-rest" href="/signup">Criar agora</Link>
          </div>
        </section>

        <section className="feature block block-rose" id="versions">
          <div className="feature-copy">
            <p className="eyebrow">Versões para vagas</p>
            <h2>Aumente suas chances de contrato e salários melhores.</h2>
            <p>
              Monte versões específicas para cada vaga e mostre primeiro o que
              aquela oportunidade precisa enxergar.
            </p>
            <Link className="button button-soft" href="/signup">Gerar uma versão</Link>
          </div>

          <div className="version-stack" aria-label="Versões específicas">
            <article style={{ "--i": 1 } as CSSProperties}>
              <span>Vaga 01</span>
              <strong>Product Designer</strong>
            </article>
            <article style={{ "--i": 2 } as CSSProperties}>
              <span>Vaga 02</span>
              <strong>UX Research</strong>
            </article>
            <article style={{ "--i": 3 } as CSSProperties}>
              <span>Vaga 03</span>
              <strong>AI Designer</strong>
            </article>
          </div>
        </section>

        <section className="feature block block-cream" id="resume">
          <div
            className={`resume-grid resume-stack${isResumeActivated ? " is-activated" : ""}`}
            data-auto-activate
            aria-label="Templates de currículo"
          >
            <div className="resume-panel resume-main">
              <span>Template ativo</span>
              <strong>Currículo editorial</strong>
            </div>
            <div className="resume-panel resume-small">
              <strong>Experiências</strong>
              <span>4 blocos</span>
            </div>
            <div className="resume-panel resume-small resume-blue">
              <strong>Projetos</strong>
              <span>8 provas</span>
            </div>
            <div className="resume-panel resume-wide">
              <strong>Pronto para recrutador</strong>
              <span>PDF + página pública</span>
            </div>
          </div>

          <div className="feature-copy">
            <p className="eyebrow">Currículo com template</p>
            <h2>Faça seu currículo ficar atrativo.</h2>
            <p>
              Em poucos minutos você preenche seus dados, seleciona um template e
              publica uma versão bonita para cliente ou recrutador.
            </p>
            <Link className="button button-accent" href="/signup">Escolher template</Link>
          </div>
        </section>

        <section className="feature block block-green" id="reading">
          <div className="feature-copy">
            <p className="eyebrow">Leitura rápida ou completa</p>
            <h2>Dê opções para quem está com pressa.</h2>
            <p>
              Deixe as pessoas decidirem se querem ler seu portfólio completo ou
              abrir um currículo mais resumido.
            </p>
            <Link className="button button-soft" href="/signup">Publicar os dois</Link>
          </div>

          <div className="feature-art reading-art">
            <div className="reading-gif-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="reading-gif"
                src="/redesign/img/croco.gif"
                alt="Preview animado da opção de leitura rápida ou completa"
              />
            </div>
          </div>
        </section>

        <section className="community block block-white" id="community">
          <div className="community-intro">
            <div className="community-gif-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/redesign/img/giphy.gif" alt="Comunidade Linkfolio em movimento" />
            </div>

            <div className="community-heading">
              <p className="eyebrow">NOSSA COMUNIDADE</p>
              <h2>Explore portfólios de sucesso e faça parte da nossa comunidade.</h2>
            </div>
          </div>

          <div className="member-strip">
            <div className="member-row" aria-label="Portfólios mais visitados">
              <article className="member-card member-cyan">
                <span>1.8k visitas</span>
                <strong>@marina.design</strong>
              </article>
              <article className="member-card member-photo">
                <span>1.4k visitas</span>
                <strong>@joao.dev</strong>
              </article>
              <article className="member-card member-lime">
                <span>920 visitas</span>
                <strong>@bia.motion</strong>
              </article>
              <article className="member-card member-orange">
                <span>810 visitas</span>
                <strong>@caio.copy</strong>
              </article>
              <article className="member-card member-rose">
                <span>760 visitas</span>
                <strong>@lara.ux</strong>
              </article>
              <article className="member-card member-blank">
                <span>690 visitas</span>
                <strong>@nina.data</strong>
              </article>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-panel">
          <div className="footer-brand">
            <svg className="footer-logo" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9.4 14.6 8 16a3.6 3.6 0 0 1-5.1-5.1l3-3A3.6 3.6 0 0 1 11 7.9" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
              <path d="M14.6 9.4 16 8a3.6 3.6 0 0 1 5.1 5.1l-3 3a3.6 3.6 0 0 1-5.1 0" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
              <path d="m8.8 15.2 6.4-6.4" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3" />
            </svg>
            <strong className="footer-brand-name">LINKFOLIO</strong>
            <p>Uma página viva para mostrar trabalho, currículo e versões.</p>
          </div>

          <nav className="footer-links" aria-label="Rodapé">
            <section className="footer-link-group" aria-labelledby="footer-community">
              <h3 id="footer-community">Community</h3>
              <ul>
                <li><Link href="/blog">Nosso blog</Link></li>
                <li><Link href="/teste-vocacional">Teste vocacional</Link></li>
                <li><a href="#resume">Explore templates</a></li>
                <li><a href="#community">Nossos usuários</a></li>
                <li><a href="#versions">Versões</a></li>
                <li><a href="#portfolio">Portfólio</a></li>
                <li><a href="#hero">Criar agora</a></li>
              </ul>
            </section>

            <section className="footer-link-group" aria-labelledby="footer-support">
              <h3 id="footer-support">Suporte</h3>
              <ul>
                <li><Link href="/login">Ajuda</Link></li>
                <li><a href="#hero">Como começar</a></li>
                <li><a href="#hero">Linkfolio Pro</a></li>
                <li><Link href="/login">Perguntas frequentes</Link></li>
              </ul>
            </section>

            <section className="footer-link-group" aria-labelledby="footer-company">
              <h3 id="footer-company">Company</h3>
              <ul>
                <li><Link href="/login">Meet Tesseria Seed</Link></li>
                <li><Link href="/login">About</Link></li>
                <li><Link href="/login">Carreiras</Link></li>
                <li><Link href="/login">Aprenda</Link></li>
                <li><Link href="/login">Contact</Link></li>
              </ul>
            </section>
          </nav>
        </div>
      </footer>
    </>
  );
}
