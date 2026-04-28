// Public page — what a visitor sees at /@handle or /@handle/slug
// Renders the same block system as the editor.

function PublicPage({ go }) {
  const page = window.FT_STATE.pages.pg1;
  const version = window.FT_STATE.versions.find(v => v.id === page.versionId);
  const template = window.FT_STATE.templates.find(t => t.key === page.templateKey);
  const resolved = window.resolveVersion(version.id);

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* public nav */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'var(--bg)', borderBottom: '1px solid var(--line-2)',
        padding: '14px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <div style={{ width: 28, height: 28, borderRadius: 999, background: 'var(--accent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: 'var(--accent-ink)' }}>AC</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{resolved.user.displayName}</div>
            <div className="mono" style={{ fontSize: 10, color: 'var(--ink-4)' }}>foliotree.com/@{resolved.user.handle}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {/* Version switcher */}
          <div style={{ display: 'flex', gap: 4, padding: 3, background: 'var(--bg-soft)', borderRadius: 999 }}>
            {window.FT_STATE.versions.map(v => (
              <button key={v.id} style={{
                padding: '6px 12px', borderRadius: 999, fontSize: 12,
                background: v.id === version.id ? 'var(--bg-card)' : 'transparent',
                color: 'var(--ink-2)',
                boxShadow: v.id === version.id ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
              }}>{v.name}</button>
            ))}
          </div>
          <Button size="sm" variant="ghost" onClick={() => go(`cv:${version.id}`)}>Currículo ↗</Button>
          <Button size="sm" variant="primary" onClick={() => go('landing')}>Criar o seu →</Button>
        </div>
      </div>

      {/* page content */}
      <div style={{ background: 'white', borderBottom: '1px solid var(--line)' }}>
        {page.blocks.filter(b => b.visible).map(b => {
          const def = template.blocks.find(d => d.key === b.defKey);
          return <BlockRenderer key={b.id} def={def} block={b} resolved={resolved} />;
        })}
      </div>

      <footer style={{ padding: '40px 56px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: 'var(--ink-3)' }}>
        <span className="mono">Publicado com FolioTree · v1</span>
        <a onClick={() => go('landing')} style={{ cursor: 'pointer' }}>← foliotree.com</a>
      </footer>
    </div>
  );
}

window.PublicPage = PublicPage;
