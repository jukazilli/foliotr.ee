// Versions screen — list + detail (metadata + what's included).
// The version is a *recorte* (selection) over the profile. This screen shows:
// list view by default; clicking a version opens a detail editor with checkbox
// selections per profile item.

function Versions({ go, selected }) {
  const versions = window.FT_STATE.versions;
  const active = selected ? versions.find(v => v.id === selected) : null;

  if (active) return <VersionDetail v={active} go={go} />;

  return (
    <AppShell current="versions" go={go}
      breadcrumb="Versões"
      title="Suas versões"
      actions={<Button variant="accent" size="sm" onClick={() => go('versions-new')}>+ Nova versão</Button>}
    >
      <p style={{ fontSize: 15, color: 'var(--ink-3)', maxWidth: 560, marginTop: 0, marginBottom: 28 }}>
        Versões são recortes do seu perfil por objetivo. Cada uma vira uma página própria e um currículo.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        {versions.map(v => (
          <VersionBigCard key={v.id} v={v} go={go} />
        ))}
      </div>
    </AppShell>
  );
}

function VersionBigCard({ v, go }) {
  const resolved = window.resolveVersion(v.id);
  return (
    <Card style={{ padding: 24, cursor: 'pointer' }}
      onClick={() => go(`version:${v.id}`)}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--ink)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--line)'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <Pill tone={v.status === 'PUBLISHED' ? 'live' : 'draft'}>{v.status === 'PUBLISHED' ? 'ao vivo' : 'rascunho'}</Pill>
          {v.isDefault && <Pill tone="ink">default</Pill>}
        </div>
        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>/@anacorrea/{v.slug}</span>
      </div>
      <h3 className="display" style={{ fontSize: 30, fontWeight: 600, letterSpacing: '-0.02em', margin: 0 }}>{v.name}</h3>
      <p style={{ fontSize: 14, color: 'var(--ink-2)', marginTop: 8, lineHeight: 1.5 }}>{resolved.headline}</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: 20 }}>
        {[
          ['exp', resolved.experiences.length],
          ['projetos', resolved.projects.length],
          ['reconh.', resolved.achievements.length],
          ['links', resolved.links.length],
        ].map(([l,n]) => (
          <div key={l} style={{ textAlign: 'left' }}>
            <div className="mono" style={{ fontSize: 10, color: 'var(--ink-4)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{l}</div>
            <div className="display" style={{ fontSize: 22, fontWeight: 500 }}>{n}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
        {v.pageId ? (
          <Button size="sm" variant="primary" onClick={(e) => { e.stopPropagation(); go(`editor:${v.pageId}`); }}>Editar página</Button>
        ) : (
          <Button size="sm" variant="primary" onClick={(e) => { e.stopPropagation(); go('templates'); }}>Escolher template</Button>
        )}
        <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); go(`cv:${v.id}`); }}>Ver currículo</Button>
      </div>
    </Card>
  );
}

function VersionDetail({ v, go }) {
  const p = window.FT_STATE.profile;
  const resolved = window.resolveVersion(v.id);
  const [headline, setHeadline] = React.useState(v.headline || '');
  const [selExp, setSelExp] = React.useState(v.includedExperienceIds);
  const [selProj, setSelProj] = React.useState(v.includedProjectIds);

  function toggle(arr, setArr, id) {
    setArr(arr.includes(id) ? arr.filter(x => x !== id) : [...arr, id]);
  }

  return (
    <AppShell current="versions" go={go}
      breadcrumb={<><a onClick={() => go('versions')} style={{cursor:'pointer'}}>Versões</a> / {v.name}</>}
      title={v.name}
      actions={<>
        <Button variant="ghost" size="sm" onClick={() => go(`cv:${v.id}`)}>Currículo</Button>
        {v.pageId
          ? <Button variant="accent" size="sm" onClick={() => go(`editor:${v.pageId}`)}>Editar página →</Button>
          : <Button variant="accent" size="sm" onClick={() => go('templates')}>Criar página →</Button>
        }
      </>}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 40 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <section>
            <h3 className="display" style={{ fontSize: 18, fontWeight: 600, margin: '0 0 12px' }}>Identidade da versão</h3>
            <Card style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Field label="Nome"><Input value={v.name} /></Field>
              <Field label="Slug" meta={`/@${p.user.handle}/${v.slug}`}><Input value={v.slug} /></Field>
              <Field label="Headline" meta="sobrescreve a do perfil"><Input value={headline} onChange={setHeadline} placeholder={p.headline} /></Field>
            </Card>
          </section>

          <section>
            <h3 className="display" style={{ fontSize: 18, fontWeight: 600, margin: '0 0 12px' }}>O que entra nessa versão</h3>
            <Card style={{ padding: 0 }}>
              <SelectGroup title="Experiências" items={p.experiences.map(e => ({ id: e.id, label: `${e.role} · ${e.company}`, meta: e.start.slice(0,4) }))} selected={selExp} toggle={id => toggle(selExp, setSelExp, id)} />
              <SelectGroup title="Projetos" items={p.projects.map(x => ({ id: x.id, label: x.title, meta: String(x.year) }))} selected={selProj} toggle={id => toggle(selProj, setSelProj, id)} />
            </Card>
          </section>
        </div>

        <aside style={{ position: 'sticky', top: 100, alignSelf: 'start' }}>
          <Card style={{ padding: 20 }}>
            <div className="mono" style={{ fontSize: 10, color: 'var(--ink-4)', letterSpacing: '0.12em', marginBottom: 14 }}>SAÍDAS DESSA VERSÃO</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
              <div>
                <div style={{ fontWeight: 500 }}>Página pública</div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>/@{p.user.handle}/{v.slug}</div>
              </div>
              <Pill tone={v.status === 'PUBLISHED' ? 'live' : 'draft'}>{v.status === 'PUBLISHED' ? 'ao vivo' : 'rascunho'}</Pill>
            </div>
            <div style={{ height: 1, background: 'var(--line)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
              <div>
                <div style={{ fontWeight: 500 }}>Modo currículo</div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>/@{p.user.handle}/{v.slug}/cv</div>
              </div>
              <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>SEMPRE DISPONÍVEL</span>
            </div>

            <Divider />
            <div className="mono" style={{ fontSize: 10, color: 'var(--ink-4)', letterSpacing: '0.12em', margin: '14px 0 10px' }}>PREVIEW</div>
            <div style={{ background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 10, padding: 16 }}>
              <div className="display" style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.015em', lineHeight: 1.1 }}>
                {resolved.headline}
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 8 }}>{resolved.bio}</div>
            </div>
          </Card>
        </aside>
      </div>
    </AppShell>
  );
}

function SelectGroup({ title, items, selected, toggle }) {
  return (
    <div style={{ padding: '8px 0' }}>
      <div className="mono" style={{ fontSize: 10, color: 'var(--ink-4)', letterSpacing: '0.12em', padding: '10px 20px 6px', textTransform: 'uppercase' }}>
        {title} · {selected.length}/{items.length}
      </div>
      {items.map(it => {
        const on = selected.includes(it.id);
        return (
          <button key={it.id} onClick={() => toggle(it.id)} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            width: '100%', padding: '10px 20px', textAlign: 'left',
            background: on ? 'var(--bg-soft)' : 'transparent',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{
                width: 16, height: 16, borderRadius: 4,
                border: '1.5px solid ' + (on ? 'var(--ink)' : 'var(--line)'),
                background: on ? 'var(--ink)' : 'transparent',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--bg)', fontSize: 11,
              }}>{on ? '✓' : ''}</span>
              <span style={{ fontSize: 14 }}>{it.label}</span>
            </div>
            <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>{it.meta}</span>
          </button>
        );
      })}
    </div>
  );
}

Object.assign(window, { Versions });
