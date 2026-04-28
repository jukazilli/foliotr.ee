// Profile screen: tabs for Dados | Experiências | Projetos | Reconhecimentos | Links
// Keep it feeling like a social profile editor, not a database form.

function Profile({ go }) {
  const [tab, setTab] = React.useState('dados');
  const p = window.FT_STATE.profile;

  const tabs = [
    ['dados', 'Dados básicos'],
    ['exp', 'Experiências'],
    ['proj', 'Projetos'],
    ['rec', 'Reconhecimentos'],
    ['links', 'Links & provas'],
  ];

  return (
    <AppShell current="profile" go={go}
      breadcrumb="Perfil base"
      title="Seu perfil"
      actions={<>
        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>salvo · há 4 min</span>
        <Button variant="ghost" size="sm" onClick={() => go('versions')}>Versões →</Button>
      </>}
    >
      <div style={{ marginBottom: 24, display: 'flex', gap: 4, borderBottom: '1px solid var(--line)' }}>
        {tabs.map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            padding: '10px 14px', fontSize: 14,
            color: tab === k ? 'var(--ink)' : 'var(--ink-3)',
            borderBottom: '2px solid ' + (tab === k ? 'var(--ink)' : 'transparent'),
            marginBottom: -1, fontWeight: tab === k ? 500 : 400,
          }}>{label}</button>
        ))}
      </div>

      {tab === 'dados' && <DadosTab p={p} />}
      {tab === 'exp' && <ListTab items={p.experiences} renderItem={ExperienceRow} title="Experiências" addLabel="+ Experiência" />}
      {tab === 'proj' && <ListTab items={p.projects} renderItem={ProjectRow} title="Projetos" addLabel="+ Projeto" />}
      {tab === 'rec' && <ListTab items={p.achievements} renderItem={AchRow} title="Reconhecimentos" addLabel="+ Reconhecimento" />}
      {tab === 'links' && <ListTab items={p.links} renderItem={LinkRow} title="Links" addLabel="+ Link" />}
    </AppShell>
  );
}

function DadosTab({ p }) {
  const [headline, setHeadline] = React.useState(p.headline);
  const [bio, setBio] = React.useState(p.bio);
  const [loc, setLoc] = React.useState(p.location);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 40 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 560 }}>
        <Field label="Nome de exibição"><Input value={p.user.displayName} /></Field>
        <Field label="Handle" meta="único · usado na URL">
          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--line)', borderRadius: 10, background: 'var(--bg-card)', paddingLeft: 13 }}>
            <span className="mono" style={{ color: 'var(--ink-4)', fontSize: 13 }}>foliotree.com/@</span>
            <input defaultValue={p.user.handle} style={{ border: 0, outline: 0, padding: '11px 13px', fontSize: 14, background: 'transparent', flex: 1 }} />
          </div>
        </Field>
        <Field label="Headline" meta="aparece no topo de toda página"><Input value={headline} onChange={setHeadline} /></Field>
        <Field label="Bio curta" meta="2-3 frases">
          <Textarea value={bio} onChange={setBio} rows={4} />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Localização"><Input value={loc} onChange={setLoc} /></Field>
          <Field label="Pronomes"><Input value={p.pronouns} /></Field>
        </div>
        <Field label="Disponibilidade" meta="visível nas páginas">
          <div style={{ display: 'flex', gap: 6 }}>
            {[['open-to-work','Aberta'],['freelance','Freela'],['closed','Fechada']].map(([k,l]) => (
              <button key={k} style={{
                padding: '8px 14px', borderRadius: 999, fontSize: 13,
                background: p.availability === k ? 'var(--ink)' : 'var(--bg-soft)',
                color: p.availability === k ? 'var(--bg)' : 'var(--ink-2)',
              }}>{l}</button>
            ))}
          </div>
        </Field>
      </div>

      <aside style={{ position: 'sticky', top: 100, alignSelf: 'start' }}>
        <Card style={{ padding: 20 }}>
          <div className="mono" style={{ fontSize: 10, color: 'var(--ink-4)', letterSpacing: '0.12em', marginBottom: 10 }}>PREVIEW DA HEADLINE</div>
          <div className="display" style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            {headline}
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 10 }}>{bio}</div>
          <Divider />
          <div className="mono" style={{ fontSize: 10, color: 'var(--ink-4)', letterSpacing: '0.12em', margin: '12px 0 8px' }}>ESSES DADOS ALIMENTAM</div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.6 }}>
            3 versões · 2 páginas publicadas · modo currículo
          </div>
        </Card>
      </aside>
    </div>
  );
}

function ListTab({ items, renderItem, title, addLabel }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          {items.length} {title.toLowerCase()}
        </div>
        <Button size="sm" variant="ghost">{addLabel}</Button>
      </div>
      <Card style={{ padding: 0 }}>
        {items.map((it, i) => (
          <div key={it.id} style={{ borderTop: i > 0 ? '1px solid var(--line-2)' : 'none' }}>
            {renderItem(it)}
          </div>
        ))}
      </Card>
    </div>
  );
}

function ExperienceRow(e) {
  const period = `${e.start.slice(0,4)} — ${e.end ? e.end.slice(0,4) : 'hoje'}`;
  return (
    <div style={{ padding: '18px 20px', display: 'grid', gridTemplateColumns: '120px 1fr auto', gap: 20, alignItems: 'start' }}>
      <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', paddingTop: 3 }}>{period}</div>
      <div>
        <div style={{ fontSize: 15, fontWeight: 500 }}>{e.role} <span style={{ color: 'var(--ink-3)', fontWeight: 400 }}>· {e.company}</span></div>
        <div style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 4, lineHeight: 1.5 }}>{e.summary}</div>
        <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
          {e.tags.map(t => <Tag key={t}>{t}</Tag>)}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        <IconBtn title="Editar">✎</IconBtn>
        <IconBtn title="Remover">×</IconBtn>
      </div>
    </div>
  );
}

function ProjectRow(p) {
  return (
    <div style={{ padding: '18px 20px', display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: 20, alignItems: 'center' }}>
      <ImagePlaceholder label={p.title.split(' ')[0].toLowerCase()} h={60} w={80} />
      <div>
        <div style={{ fontSize: 15, fontWeight: 500 }}>{p.title}</div>
        <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 2 }}>{p.role} · {p.year}</div>
        <div style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 6 }}>{p.summary}</div>
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        <IconBtn title="Editar">✎</IconBtn>
        <IconBtn title="Remover">×</IconBtn>
      </div>
    </div>
  );
}

function AchRow(a) {
  return (
    <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 500 }}>{a.title}</div>
        <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>{a.issuer} · {a.year}</div>
      </div>
      <IconBtn title="Editar">✎</IconBtn>
    </div>
  );
}

function LinkRow(l) {
  return (
    <div style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.08em', width: 70 }}>{l.kind}</span>
        <div>
          <div style={{ fontSize: 14, fontWeight: 500 }}>{l.label}</div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{l.url}</div>
        </div>
      </div>
      <IconBtn title="Editar">✎</IconBtn>
    </div>
  );
}

window.Profile = Profile;
