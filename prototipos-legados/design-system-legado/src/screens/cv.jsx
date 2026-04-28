// CV mode — derived view over Profile + Version. Typographic, single column.
// Print-friendly.

function CV({ go, versionId }) {
  const v = window.FT_STATE.versions.find(x => x.id === (versionId || 'v1'));
  const resolved = window.resolveVersion(v.id);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-soft)' }}>
      {/* floating toolbar */}
      <div className="no-print" style={{
        position: 'sticky', top: 0, zIndex: 10,
        padding: '14px 24px', background: 'var(--bg)',
        borderBottom: '1px solid var(--line)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => go(v.pageId ? `editor:${v.pageId}` : 'versions')} style={{ color: 'var(--ink-3)', fontSize: 13 }}>← Voltar</button>
          <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>MODO CURRÍCULO · {v.name}</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button size="sm" variant="ghost" onClick={() => window.print()}>Exportar PDF</Button>
          <Button size="sm" variant="primary">Copiar link</Button>
        </div>
      </div>

      {/* sheet */}
      <div style={{ maxWidth: 760, margin: '40px auto', padding: '64px 72px',
        background: 'white', border: '1px solid var(--line)', borderRadius: 4,
        boxShadow: '0 20px 80px rgba(0,0,0,0.06)',
      }}>
        <header style={{ marginBottom: 32 }}>
          <div className="display" style={{ fontSize: 44, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1 }}>
            {resolved.user.displayName}
          </div>
          <div className="mono" style={{ fontSize: 12, color: 'var(--ink-3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 8 }}>
            {resolved.headline}
          </div>
          <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--ink-2)', marginTop: 16, flexWrap: 'wrap' }}>
            <span>{resolved.profile.location}</span>
            <span style={{ color: 'var(--ink-4)' }}>·</span>
            <span>{resolved.user.email}</span>
            <span style={{ color: 'var(--ink-4)' }}>·</span>
            <span>foliotree.com/@{resolved.user.handle}</span>
          </div>
        </header>

        {resolved.bio && (
          <section style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--ink-2)', maxWidth: 620 }}>{resolved.bio}</div>
          </section>
        )}

        <CVSection title="Experiência">
          {resolved.experiences.map(e => (
            <div key={e.id} style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 24, padding: '12px 0' }}>
              <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', paddingTop: 2 }}>
                {e.start.slice(0,4)} — {e.end ? e.end.slice(0,4) : 'hoje'}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 500 }}>{e.role} <span style={{ color: 'var(--ink-3)', fontWeight: 400 }}>· {e.company}</span></div>
                <div style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 4, lineHeight: 1.55 }}>{e.summary}</div>
              </div>
            </div>
          ))}
        </CVSection>

        <CVSection title="Projetos selecionados">
          {resolved.projects.map(p => (
            <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 24, padding: '10px 0' }}>
              <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', paddingTop: 2 }}>{p.year}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{p.title} <span style={{ color: 'var(--ink-3)', fontWeight: 400 }}>· {p.role}</span></div>
                <div style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 2, lineHeight: 1.55 }}>{p.summary}</div>
              </div>
            </div>
          ))}
        </CVSection>

        <CVSection title="Reconhecimentos">
          {resolved.achievements.map(a => (
            <div key={a.id} style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 24, padding: '8px 0' }}>
              <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', paddingTop: 2 }}>{a.year}</div>
              <div style={{ fontSize: 14 }}>{a.title} <span style={{ color: 'var(--ink-3)' }}>· {a.issuer}</span></div>
            </div>
          ))}
        </CVSection>

        <CVSection title="Links">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {resolved.links.map(l => (
              <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0' }}>
                <span>{l.label}</span>
                <span className="mono" style={{ color: 'var(--ink-3)' }}>{l.url}</span>
              </div>
            ))}
          </div>
        </CVSection>
      </div>

      <div className="no-print" style={{ textAlign: 'center', color: 'var(--ink-4)', fontSize: 11, padding: 32 }}>
        <span className="mono">MESMA BASE DE DADOS · OUTRA LEITURA</span>
      </div>
    </div>
  );
}

function CVSection({ title, children }) {
  return (
    <section style={{ marginBottom: 28 }}>
      <div className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', color: 'var(--ink-4)', textTransform: 'uppercase', marginBottom: 8, paddingBottom: 6, borderBottom: '1px solid var(--line)' }}>{title}</div>
      {children}
    </section>
  );
}

window.CV = CV;
