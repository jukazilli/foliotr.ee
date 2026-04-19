// Landing page — editorial modern, tipografia grande, acento lime.
// Primeira dobra: imagem placeholder + texto + CTA (como briefado).

function Landing({ go }) {
  const headline = window.FT_TOKENS.landingHeadline || "Uma vida profissional. Muitas formas de mostrar.";

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* top bar */}
      <header style={{
        padding: '22px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid var(--line)',
      }}>
        <FTLogo />
        <nav style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
          <a onClick={() => go('templates')} style={nav}>Templates</a>
          <a onClick={() => go('public')} style={nav}>Exemplo ao vivo</a>
          <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>MANIFESTO</span>
          <Button variant="ghost" size="sm" onClick={() => go('login')}>Entrar</Button>
          <Button variant="accent" size="sm" onClick={() => go('register')}>Criar conta →</Button>
        </nav>
      </header>

      {/* hero */}
      <section style={{
        display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 0,
        borderBottom: '1px solid var(--line)',
      }}>
        <div style={{ padding: '88px 40px 64px', borderRight: '1px solid var(--line)' }}>
          <div className="mono" style={{ fontSize: 11, letterSpacing: '0.14em', color: 'var(--ink-3)', textTransform: 'uppercase', marginBottom: 28 }}>
            FolioTree · v1.0 · São Paulo
          </div>
          <h1 className="display" style={{
            fontSize: 'clamp(48px, 7vw, 104px)', lineHeight: 0.98, letterSpacing: '-0.035em',
            fontWeight: 600, margin: 0, textWrap: 'balance',
          }}>
            {headline}
          </h1>
          <p style={{
            maxWidth: 520, fontSize: 18, lineHeight: 1.5, color: 'var(--ink-2)',
            marginTop: 28,
          }}>
            Preencha seu perfil uma vez. Gere páginas, currículos e recortes por objetivo —
            sem copiar e colar, sem perder coerência.
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 36, flexWrap: 'wrap' }}>
            <Button variant="accent" onClick={() => go('register')}>Comece agora — grátis</Button>
            <Button variant="ghost" onClick={() => go('public')}>Ver uma página ao vivo</Button>
          </div>

          <div className="mono" style={{
            display: 'flex', gap: 24, marginTop: 56, fontSize: 11, color: 'var(--ink-4)',
            textTransform: 'uppercase', letterSpacing: '0.12em',
          }}>
            <span>↳ Perfil</span><span>→ Versões</span><span>→ Páginas</span><span>→ Currículo</span>
          </div>
        </div>

        <div style={{ position: 'relative', background: 'var(--bg-soft)', padding: 40 }}>
          <PreviewCollage go={go} />
        </div>
      </section>

      {/* thesis strip */}
      <section style={{
        padding: '28px 40px', display: 'flex', gap: 32, alignItems: 'baseline',
        borderBottom: '1px solid var(--line)', overflow: 'hidden', whiteSpace: 'nowrap',
      }}>
        <span className="display" style={{ fontSize: 22, fontWeight: 500 }}>LinkedIn mostra.</span>
        <span className="display" style={{ fontSize: 22, fontWeight: 500, background: 'var(--accent)', color: 'var(--accent-ink)', padding: '2px 10px' }}>FolioTree prova.</span>
        <span className="mono" style={{ fontSize: 12, color: 'var(--ink-3)', marginLeft: 'auto' }}>— tese fundadora</span>
      </section>

      {/* three-part */}
      <section style={{ padding: '88px 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 40 }}>
          <ValueCol n="01" title="Uma base" body="Seu perfil é a fonte da verdade. Experiências, projetos, provas, links. Você edita num lugar, muda em todos." />
          <ValueCol n="02" title="Muitas versões" body="Crie recortes por objetivo — design lead, palestrante, consultor. Escolha o que entra em cada um." />
          <ValueCol n="03" title="Saídas coerentes" body="Gere uma página pública, um currículo leitura-recrutador ou um link pronto para mensagem. Tudo a partir da mesma base." />
        </div>
      </section>

      {/* feature row: editor mock */}
      <section style={{ padding: '40px 40px 88px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', gap: 48, alignItems: 'center' }}>
          <div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 14 }}>Sistema de blocos</div>
            <h2 className="display" style={{ fontSize: 48, lineHeight: 1.02, letterSpacing: '-0.02em', margin: 0, fontWeight: 600 }}>
              Editar sem quebrar. <br/>Mover sem medo.
            </h2>
            <p style={{ fontSize: 17, color: 'var(--ink-2)', marginTop: 20, maxWidth: 480 }}>
              Templates feitos de blocos. Reordene, oculte, adicione. O conteúdo vem do seu perfil —
              ou você escreve livre. Troca de template sem perder dado.
            </p>
            <div style={{ marginTop: 28 }}>
              <Button variant="primary" onClick={() => go('editor')}>Ver o editor</Button>
            </div>
          </div>
          <div>
            <EditorMock />
          </div>
        </div>
      </section>

      {/* CV row */}
      <section style={{ padding: '80px 40px', background: 'var(--bg-soft)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
          <CVMock />
          <div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 14 }}>Modo Currículo</div>
            <h2 className="display" style={{ fontSize: 48, lineHeight: 1.02, letterSpacing: '-0.02em', margin: 0, fontWeight: 600 }}>
              Bonito pra você. <br/>Legível pra recrutador.
            </h2>
            <p style={{ fontSize: 17, color: 'var(--ink-2)', marginTop: 20, maxWidth: 480 }}>
              Mesmo conteúdo. Outra leitura. O modo currículo reorganiza sua versão em estrutura
              de leitura rápida e exporta em PDF.
            </p>
            <div style={{ marginTop: 28 }}>
              <Button variant="ghost" onClick={() => go('cv')}>Abrir o modo currículo</Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '96px 40px', textAlign: 'center' }}>
        <h2 className="display" style={{ fontSize: 'clamp(40px, 6vw, 88px)', lineHeight: 0.98, letterSpacing: '-0.03em', fontWeight: 600, margin: 0 }}>
          Sua carreira merece <br/>um lugar de verdade.
        </h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 40 }}>
          <Button variant="accent" onClick={() => go('register')}>Criar conta</Button>
          <Button variant="ghost" onClick={() => go('login')}>Já tenho conta</Button>
        </div>
      </section>

      <footer style={{
        padding: '24px 40px', borderTop: '1px solid var(--line)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: 12, color: 'var(--ink-3)',
      }}>
        <FTLogo size={16} />
        <span className="mono">© 2026 FolioTree · feito com clareza</span>
      </footer>
    </div>
  );
}

const nav = {
  fontSize: 14, color: 'var(--ink-2)', cursor: 'pointer',
};

function ValueCol({ n, title, body }) {
  return (
    <div>
      <div className="mono" style={{ fontSize: 11, color: 'var(--ink-4)', marginBottom: 20 }}>{n}</div>
      <h3 className="display" style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.01em', margin: 0 }}>{title}</h3>
      <p style={{ fontSize: 15, color: 'var(--ink-2)', marginTop: 10, lineHeight: 1.55 }}>{body}</p>
    </div>
  );
}

// A small collage showing page + cv + version cards stacked.
function PreviewCollage({ go }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: 560 }}>
      {/* big page preview */}
      <div style={{
        position: 'absolute', left: 0, top: 0, right: 60, bottom: 110,
        background: 'white', border: '1px solid var(--line)', borderRadius: 14,
        padding: 28, overflow: 'hidden',
      }}>
        <div className="mono" style={{ fontSize: 10, color: 'var(--ink-4)', marginBottom: 18, display: 'flex', justifyContent: 'space-between' }}>
          <span>foliotree.com/@anacorrea</span>
          <Pill tone="live">ao vivo</Pill>
        </div>
        <div className="display" style={{ fontSize: 42, lineHeight: 0.98, letterSpacing: '-0.03em', fontWeight: 600 }}>
          Designer de<br/>sistemas.
        </div>
        <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 14, maxWidth: 280 }}>
          Reestruturação do fluxo de limite no Nubank. Atlas Design System. +12% checkout iFood.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 20 }}>
          <ImagePlaceholder label="ciclo" h={84} />
          <ImagePlaceholder label="atlas" h={84} />
        </div>
      </div>

      {/* cv preview */}
      <div style={{
        position: 'absolute', right: 0, top: 90, width: 200, bottom: 200,
        background: 'white', border: '1px solid var(--line)', borderRadius: 8,
        padding: 16, transform: 'rotate(3deg)', boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
      }}>
        <div className="mono" style={{ fontSize: 9, color: 'var(--ink-4)', letterSpacing: '0.1em', marginBottom: 8 }}>CURRÍCULO</div>
        <div className="display" style={{ fontSize: 14, fontWeight: 600 }}>ANA CORRÊA</div>
        <div style={{ fontSize: 9, color: 'var(--ink-3)' }}>Senior Product Designer</div>
        <div style={{ height: 1, background: 'var(--line)', margin: '10px 0' }} />
        {["Nubank — 2022","iFood — 2019","Resultados — 2016"].map((x,i) => (
          <div key={i} style={{ fontSize: 9, color: 'var(--ink-2)', marginBottom: 6 }}>{x}</div>
        ))}
      </div>

      {/* version chip */}
      <div style={{
        position: 'absolute', left: 40, bottom: 0,
        background: 'var(--ink)', color: 'var(--bg)', borderRadius: 12, padding: '14px 18px',
      }}>
        <div className="mono" style={{ fontSize: 10, opacity: 0.6, letterSpacing: '0.1em', marginBottom: 6 }}>VERSÃO ATIVA</div>
        <div style={{ fontWeight: 500 }}>Design Lead</div>
        <div style={{ fontSize: 11, opacity: 0.6, marginTop: 2 }}>3 de 5 experiências · 4 projetos</div>
      </div>

      <div style={{
        position: 'absolute', right: 10, bottom: 30,
        background: 'var(--accent)', color: 'var(--accent-ink)', padding: '8px 12px',
        borderRadius: 999, fontWeight: 500, fontSize: 12,
      }}>+ nova versão</div>
    </div>
  );
}

function EditorMock() {
  return (
    <div style={{
      border: '1px solid var(--line)', borderRadius: 16, overflow: 'hidden',
      display: 'grid', gridTemplateColumns: '220px 1fr', background: 'white',
    }}>
      <div style={{ borderRight: '1px solid var(--line)', padding: 16, background: 'var(--bg)' }}>
        <div className="mono" style={{ fontSize: 10, color: 'var(--ink-4)', marginBottom: 10, letterSpacing: '0.1em' }}>BLOCOS</div>
        {["Hero","Sobre","Projetos","Experiência","Reconhecimentos","Contato"].map((b,i) => (
          <div key={i} style={{
            padding: '8px 10px', borderRadius: 8, fontSize: 13, marginBottom: 4,
            background: i===2?'var(--ink)':'transparent',
            color: i===2?'var(--bg)':'var(--ink-2)',
            display: 'flex', justifyContent: 'space-between',
          }}>
            <span>{b}</span>
            <span className="mono" style={{ fontSize: 10, opacity: 0.6 }}>{i+1}</span>
          </div>
        ))}
      </div>
      <div style={{ padding: 24 }}>
        <div className="display" style={{ fontSize: 28, letterSpacing: '-0.02em', fontWeight: 600, marginBottom: 4 }}>Projetos</div>
        <div className="mono" style={{ fontSize: 10, color: 'var(--ink-4)', marginBottom: 14 }}>bindado a · versão.projetos</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <ImagePlaceholder label="ciclo" h={100} />
          <ImagePlaceholder label="atlas" h={100} />
          <ImagePlaceholder label="checkout" h={100} />
          <ImagePlaceholder label="monograph" h={100} />
        </div>
      </div>
    </div>
  );
}

function CVMock() {
  return (
    <div style={{
      background: 'white', border: '1px solid var(--line)', borderRadius: 6,
      padding: '40px 44px', fontFamily: 'var(--font-ui)',
      maxWidth: 440, boxShadow: '0 20px 60px rgba(0,0,0,0.06)',
    }}>
      <div className="display" style={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.02em' }}>Ana Corrêa</div>
      <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 4 }}>SENIOR PRODUCT DESIGNER · SÃO PAULO</div>
      <div style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 12, lineHeight: 1.55 }}>
        Designer de sistemas com 8 anos em produto. Líder de design em Crédito no Nubank.
      </div>
      <div style={{ height: 1, background: 'var(--line)', margin: '20px 0' }} />
      <div className="mono" style={{ fontSize: 10, letterSpacing: '0.12em', color: 'var(--ink-4)', marginBottom: 10 }}>EXPERIÊNCIA</div>
      {[
        ['Nubank', 'Senior Product Designer', '2022 —'],
        ['iFood', 'Product Designer', '2019 — 2021'],
        ['Resultados Digitais', 'UX Designer', '2016 — 2019'],
      ].map(([a,b,c],i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
          <div><b style={{ fontWeight: 600 }}>{a}</b><span style={{ color: 'var(--ink-3)' }}> · {b}</span></div>
          <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{c}</span>
        </div>
      ))}
    </div>
  );
}

window.Landing = Landing;
