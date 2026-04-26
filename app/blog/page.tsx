import type { Metadata } from "next";
import Link from "next/link";
import { RedesignFooter, RedesignHeader } from "@/components/landing/RedesignShell";

const blogPosts = [
  {
    "@type": "BlogPosting",
    headline: "Como criar um currículo chamativo sem exagerar no visual",
    datePublished: "2026-04-25",
  },
  {
    "@type": "BlogPosting",
    headline: "Como estruturar um portfólio profissional para recrutadores",
    datePublished: "2026-04-25",
  },
  {
    "@type": "BlogPosting",
    headline: "Como usar IA para encontrar novas oportunidades de carreira",
    datePublished: "2026-04-25",
  },
];

export const metadata: Metadata = {
  title: "Nosso Blog | LINKFOLIO",
  description:
    "Dicas práticas para criar currículos chamativos, estruturar portfólios, usar IA na busca por oportunidades e se preparar para processos seletivos.",
  keywords: [
    "currículo chamativo",
    "portfólio profissional",
    "vagas de emprego",
    "inteligência artificial",
    "recolocação profissional",
    "teste de vocação",
    "carreira",
  ],
  alternates: {
    canonical: "/blog",
  },
};

export default function BlogPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Nosso Blog | LINKFOLIO",
    description:
      "Conteúdos sobre currículo, portfólio, carreira, IA e oportunidades profissionais.",
    url: "https://linkfolio.co/blog",
    publisher: {
      "@type": "Organization",
      name: "LINKFOLIO",
    },
    blogPost: blogPosts,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <RedesignHeader />

      <main>
        <section className="blog-hero" aria-labelledby="blog-title">
          <div className="blog-hero-copy">
            <p className="eyebrow">Nosso Blog</p>
            <h1 id="blog-title">Carreira, portfólio e oportunidades reais.</h1>
            <p>
              Guias práticos para quem quer montar um currículo melhor, apresentar
              projetos com clareza e chegar mais preparado às vagas certas.
            </p>
          </div>

          <div className="blog-hero-media" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/redesign/handcomputador.gif" alt="" />
          </div>
        </section>

        <section className="blog-layout" aria-label="Postagens do blog">
          <div className="blog-main">
            <section className="blog-section" aria-labelledby="popular-title">
              <div className="blog-section-heading">
                <p className="eyebrow">Mais acessadas</p>
                <h2 id="popular-title">As leituras que mais ajudam na largada.</h2>
              </div>

              <div className="blog-featured-grid">
                <article className="blog-card blog-card-large">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/redesign/nicetomeet.gif" alt="" aria-hidden="true" />
                  <div>
                    <span>Currículo</span>
                    <h3>Como criar um currículo chamativo sem exagerar no visual</h3>
                    <p>
                      Aprenda a destacar resultados, palavras-chave e experiências
                      sem transformar o currículo em uma peça difícil de ler.
                    </p>
                    <Link href="/blog/curriculo-chamativo">Ler guia</Link>
                  </div>
                </article>

                <article className="blog-card">
                  <span>Portfólio</span>
                  <h3>Como estruturar um portfólio profissional para recrutadores</h3>
                  <p>
                    Uma ordem simples para apresentar contexto, processo, resultado
                    e impacto de cada projeto.
                  </p>
                  <Link href="/blog/portfolio-profissional">Ler artigo</Link>
                </article>

                <article className="blog-card">
                  <span>IA e carreira</span>
                  <h3>Como usar IA para encontrar novas oportunidades de carreira</h3>
                  <p>
                    Use IA para mapear vagas, adaptar seu discurso e preparar
                    respostas mais consistentes para entrevistas.
                  </p>
                  <Link href="/blog/ia-oportunidades-carreira">Ler artigo</Link>
                </article>
              </div>
            </section>

            <section className="blog-section" aria-labelledby="searched-title">
              <div className="blog-section-heading">
                <p className="eyebrow">Mais procuradas</p>
                <h2 id="searched-title">Temas para alcançar a oportunidade que você quer.</h2>
              </div>

              <div className="blog-post-grid">
                <article className="blog-post">
                  <span>Vocação</span>
                  <h3>Teste rápido de vocação: perguntas para encontrar padrões</h3>
                  <p>
                    Um roteiro de reflexão para identificar interesses, habilidades
                    e ambientes de trabalho que combinam com você.
                  </p>
                </article>

                <article className="blog-post">
                  <span>Processo seletivo</span>
                  <h3>Como se preparar para entrevistas sem decorar respostas</h3>
                  <p>
                    Monte histórias profissionais com problema, ação e resultado
                    para responder com segurança.
                  </p>
                </article>

                <article className="blog-post">
                  <span>LinkedIn</span>
                  <h3>Perfil profissional: o que recrutadores procuram primeiro</h3>
                  <p>
                    Headline, resumo, experiências e links que ajudam sua página a
                    aparecer para oportunidades melhores.
                  </p>
                </article>

                <article className="blog-post">
                  <span>Recolocação</span>
                  <h3>Plano de 7 dias para organizar sua busca por vagas</h3>
                  <p>
                    Uma rotina leve para pesquisar empresas, adaptar materiais e
                    acompanhar candidaturas sem se perder.
                  </p>
                </article>
              </div>
            </section>
          </div>

          <aside className="blog-sidebar" aria-labelledby="recent-title">
            <p className="eyebrow">Recentes</p>
            <h2 id="recent-title">Últimas postagens</h2>

            <ol className="recent-posts">
              <li>
                <Link href="/blog/palavras-chave-curriculo">
                  Palavras-chave que ajudam seu currículo a passar por filtros
                </Link>
                <span>6 min de leitura</span>
              </li>
              <li>
                <Link href="/blog/portfolio-sem-experiencia">
                  Como montar portfólio mesmo com pouca experiência profissional
                </Link>
                <span>8 min de leitura</span>
              </li>
              <li>
                <Link href="/blog/carta-apresentacao">
                  Carta de apresentação: quando vale escrever e como começar
                </Link>
                <span>5 min de leitura</span>
              </li>
              <li>
                <Link href="/blog/salario-pretendido">
                  Como responder salário pretendido sem travar a negociação
                </Link>
                <span>7 min de leitura</span>
              </li>
            </ol>
          </aside>
        </section>
      </main>

      <RedesignFooter />
    </>
  );
}
