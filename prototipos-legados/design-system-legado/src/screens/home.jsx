// AppShell — sidebar + topbar used by all /app screens.

function AppShell({ current, go, children, rightSlot, title, breadcrumb, actions }) {
  const nav = [
    { key: 'home', label: 'Início', icon: '●' },
    { key: 'profile', label: 'Perfil', icon: '◆' },
    { key: 'versions', label: 'Versões', icon: '❏' },
    { key: 'templates', label: 'Templates', icon: '❖' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '240px 1fr', background: 'var(--bg)' }}>
      <aside style={{
        borderRight: '1px solid var(--line)', padding: '22px 18px',
        display: 'flex', flexDirection: 'column', gap: 24, position: 'sticky', top: 0, height: '100vh',
      }}>
        <div style={{ padding: '0 4px' }}><FTLogo size={20} /></div>

        <div>
          <div className="mono" style={{ fontSize: 10, color: 'var(--ink-4)', letterSpacing: '0.12em', margin: '6px 8px 10px' }}>ÁREAS</div>
          {nav.map(n => (
            <button key={n.key} onClick={() => go(n.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                padding: '9px 10px', borderRadius: 10, marginBottom: 2, textAlign: 'left',
                background: current === n.key ? 'var(--ink)' : 'transparent',
                color: current === n.key ? 'var(--bg)' : 'var(--ink-2)',
                fontSize: 14,
              }}>
              <span className="mono" style={{ fontSize: 10, opacity: 0.6, width: 12 }}>{n.icon}</span>
              {n.label}
            </button>
          ))}
        </div>

        <div>
          <div className="mono" style={{ fontSize: 10, color: 'var(--ink-4)', letterSpacing: '0.12em', margin: '6px 8px 10px' }}>VOCÊ</div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
            borderRadius: 10, background: 'var(--bg-soft)',
          }}>
            <div style={{ width: 28, height: 28, borderRadius: 999, background: 'var(--accent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: 'var(--accent-ink)' }}>AC</div>
            <div style={{ lineHeight: 1.2, flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>Ana Corrêa</div>
              <div className="mono" style={{ fontSize: 10, color: 'var(--ink-4)' }}>@anacorrea</div>
            </div>
          </div>
          <button onClick={() => go('public')}
            style={{ fontSize: 12, color: 'var(--ink-3)', padding: '8px 10px', display: 'block', marginTop: 4 }}>
            ↗ Ver minha página
          </button>
          <button onClick={() => go('landing')}
            style={{ fontSize: 12, color: 'var(--ink-3)', padding: '8px 10px', display: 'block' }}>
            ← Sair
          </button>
        </div>

        <div style={{ marginTop: 'auto', padding: 12, border: '1px solid var(--line)', borderRadius: 12 }}>
          <div className="mono" style={{ fontSize: 10, letterSpacing: '0.1em', color: 'var(--ink-4)', marginBottom: 6 }}>ESTRUTURA</div>
          <div style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--ink-2)' }}>
            Perfil → Versões<br/>→ Páginas & Currículos
          </div>
        </div>
      </aside>

      <main style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header style={{
          padding: '18px 36px', borderBottom: '1px solid var(--line)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
          background: 'var(--bg)', position: 'sticky', top: 0, zIndex: 5,
        }}>
          <div>
            {breadcrumb && (
              <div className="mono" style={{ fontSize: 11, color: 'var(--ink-4)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>{breadcrumb}</div>
            )}
            <div className="display" style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.01em' }}>{title}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {actions}
          </div>
        </header>
        <div style={{ padding: '32px 36px 80px', flex: 1 }}>
          {children}
        </div>
      </main>
    </div>
  );
}

// =============== HOME ===============

function Home({ go }) {
  const profile = window.FT_STATE.profile;
  const versions = window.FT_STATE.versions;

  const stats = [
    { label: "Experiências", value: profile.experiences.length },
    { label: "Projetos", value: profile.projects.length },
    { label: "Versões", value: versions.length },
    { label: "Páginas publicadas", value: versions.filter(v => v.status === 'PUBLISHED').length },
  ];

  return (
    <AppShell current="home" go={go}
      breadcrumb="Início"
      title={`Oi, ${profile.user.displayName.split(' ')[0]}.`}
      actions={<>
        <Button variant="ghost" size="sm" onClick={() => go('public')}>Ver página pública ↗</Button>
        <Button variant="accent" size="sm" onClick={() => go('versions-new')}>+ Nova versão</Button>
      </>}
    >
      {/* Flow strip — Perfil → Versões → Páginas/Currículos */}
      <section style={{ marginBottom: 40 }}>
        <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>
          sua plataforma
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <FlowCard n="01" title="Perfil" subtitle="Base de dados"
            body="Seu conteúdo vive aqui. Edite uma vez."
            cta="Editar perfil →" onClick={() => go('profile')} />
          <FlowCard n="02" title="Versões" subtitle={`${versions.length} criadas`}
            body="Recortes por objetivo. Cada versão vira uma página."
            cta="Ver versões →" onClick={() => go('versions')} accent />
          <FlowCard n="03" title="Páginas & Currículos" subtitle="Saídas públicas"
            body="Cada versão publica-se em /@handle/slug. E gera um currículo legível."
            cta="Ver páginas →" onClick={() => go('versions')} />
        </div>
      </section>

      {/* Stats strip */}
      <section style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, marginBottom: 40,
        border: '1px solid var(--line)', borderRadius: 16, overflow: 'hidden', background: 'var(--bg-card)',
      }}>
        {stats.map((s,i) => (
          <div key={i} style={{ padding: '20px 24px', borderRight: i < 3 ? '1px solid var(--line)' : 'none' }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: '0.12em', color: 'var(--ink-4)', textTransform: 'uppercase' }}>{s.label}</div>
            <div className="display" style={{ fontSize: 40, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 6 }}>{s.value}</div>
          </div>
        ))}
      </section>

      {/* Versions grid quick access */}
      <section style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
          <h2 className="display" style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>Suas versões</h2>
          <a onClick={() => go('versions')} style={{ fontSize: 13, color: 'var(--ink-3)', cursor: 'pointer' }}>ver todas →</a>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {versions.map(v => (
            <VersionMiniCard key={v.id} v={v} onClick={() => go(v.pageId ? `editor:${v.pageId}` : 'versions')} />
          ))}
          <button onClick={() => go('versions-new')} style={{
            border: '1px dashed var(--line)', borderRadius: 16, padding: 20, textAlign: 'left',
            color: 'var(--ink-3)', fontSize: 14,
          }}>
            <div className="mono" style={{ fontSize: 10, color: 'var(--ink-4)', letterSpacing: '0.1em', marginBottom: 10 }}>+ NOVA</div>
            <div className="display" style={{ fontSize: 18, color: 'var(--ink)' }}>Criar versão</div>
            <div style={{ marginTop: 6 }}>Recorte pra um novo objetivo.</div>
          </button>
        </div>
      </section>

      {/* Activity */}
      <section>
        <h2 className="display" style={{ fontSize: 22, fontWeight: 600, margin: '0 0 14px' }}>Últimas mudanças</h2>
        <Card style={{ padding: 0 }}>
          {[
            ["publicou", "página Design Lead", "há 2 dias"],
            ["editou", "projeto Ciclo — sistema de crédito", "há 5 dias"],
            ["criou", "versão Palestras", "há 1 semana"],
          ].map(([v,t,when], i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '14px 20px', borderTop: i > 0 ? '1px solid var(--line-2)' : 'none',
            }}>
              <div style={{ fontSize: 14 }}>
                <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)', marginRight: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{v}</span>
                {t}
              </div>
              <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>{when}</span>
            </div>
          ))}
        </Card>
      </section>
    </AppShell>
  );
}

function FlowCard({ n, title, subtitle, body, cta, onClick, accent }) {
  return (
    <button onClick={onClick} style={{
      background: accent ? 'var(--ink)' : 'var(--bg-card)',
      color: accent ? 'var(--bg)' : 'var(--ink)',
      border: '1px solid ' + (accent ? 'var(--ink)' : 'var(--line)'),
      borderRadius: 16, padding: 24, textAlign: 'left', position: 'relative',
      transition: 'transform .2s',
    }}
    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span className="mono" style={{ fontSize: 11, letterSpacing: '0.12em', opacity: 0.6 }}>{n}</span>
        <span className="mono" style={{ fontSize: 11, opacity: 0.6 }}>{subtitle}</span>
      </div>
      <div className="display" style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', marginTop: 20 }}>{title}</div>
      <div style={{ fontSize: 13, opacity: 0.75, marginTop: 6, lineHeight: 1.5 }}>{body}</div>
      <div style={{ marginTop: 24, fontSize: 13, fontWeight: 500 }}>{cta}</div>
    </button>
  );
}

function VersionMiniCard({ v, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: 'var(--bg-card)', border: '1px solid var(--line)',
      borderRadius: 16, padding: 18, textAlign: 'left',
    }}
    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--ink)'}
    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--line)'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Pill tone={v.status === 'PUBLISHED' ? 'live' : 'draft'}>{v.status === 'PUBLISHED' ? 'ao vivo' : 'rascunho'}</Pill>
        {v.isDefault && <span className="mono" style={{ fontSize: 10, color: 'var(--ink-4)' }}>DEFAULT</span>}
      </div>
      <div className="display" style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em' }}>{v.name}</div>
      <div className="mono" style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 4 }}>
        /@anacorrea/{v.slug}
      </div>
      <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 10, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <span>{v.includedExperienceIds.length} exp</span>
        <span>·</span>
        <span>{v.includedProjectIds.length} projetos</span>
      </div>
    </button>
  );
}

Object.assign(window, { AppShell, Home });
