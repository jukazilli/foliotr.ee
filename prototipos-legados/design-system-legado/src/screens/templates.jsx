// Templates library.
function Templates({ go }) {
  const templates = [
    { key: 'portfolio-community', name: 'Portfolio Community', tags: ['editorial','default'], status: 'ativo' },
    { key: 'monograph', name: 'Monograph', tags: ['writing','1-col'], status: 'em breve' },
    { key: 'ledger', name: 'Ledger', tags: ['dense','data'], status: 'em breve' },
    { key: 'showcase', name: 'Showcase', tags: ['image-first'], status: 'em breve' },
  ];
  return (
    <AppShell current="templates" go={go} breadcrumb="Templates" title="Biblioteca">
      <p style={{ fontSize: 15, color: 'var(--ink-3)', maxWidth: 560, marginTop: 0, marginBottom: 28 }}>
        Cada template é feito de blocos editáveis. Você pode trocar de template sem perder conteúdo.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
        {templates.map(t => (
          <Card key={t.key} style={{ overflow: 'hidden' }}>
            <div style={{ position: 'relative' }}>
              <ImagePlaceholder label={t.key} h={220} />
              <div style={{ position: 'absolute', top: 12, left: 12 }}>
                <Pill tone={t.status === 'ativo' ? 'live' : 'draft'}>{t.status}</Pill>
              </div>
            </div>
            <div style={{ padding: 20 }}>
              <div className="display" style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em' }}>{t.name}</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                {t.tags.map(x => <Tag key={x}>{x}</Tag>)}
              </div>
              <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                {t.status === 'ativo'
                  ? <Button size="sm" variant="primary" onClick={() => go('editor:pg1')}>Abrir exemplo</Button>
                  : <Button size="sm" variant="subtle" disabled>Em breve</Button>}
                <Button size="sm" variant="ghost">Detalhes</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
window.Templates = Templates;
