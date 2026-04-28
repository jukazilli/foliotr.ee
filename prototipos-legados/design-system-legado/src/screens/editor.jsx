// Editor — the core block-based page editor.
// Layout: left = block list + field editor, right = live preview.
// Operations: reorder (↑↓), hide, remove, add (from available defs), edit props.

function Editor({ go, pageId }) {
  const page = window.FT_STATE.pages[pageId || 'pg1'];
  const version = window.FT_STATE.versions.find(v => v.id === page.versionId);
  const template = window.FT_STATE.templates.find(t => t.key === page.templateKey);
  const resolved = window.resolveVersion(version.id);

  const [blocks, setBlocks] = React.useState(page.blocks);
  const [selected, setSelected] = React.useState(blocks[0].id);
  const [showAdd, setShowAdd] = React.useState(false);

  const sel = blocks.find(b => b.id === selected);
  const selDef = template.blocks.find(d => d.key === sel?.defKey);

  function move(id, dir) {
    const idx = blocks.findIndex(b => b.id === id);
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= blocks.length) return;
    const next = [...blocks];
    [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
    setBlocks(next.map((b, i) => ({ ...b, order: i })));
  }

  function toggleVisible(id) {
    setBlocks(blocks.map(b => b.id === id ? { ...b, visible: !b.visible } : b));
  }

  function remove(id) {
    const b = blocks.find(x => x.id === id);
    const def = template.blocks.find(d => d.key === b.defKey);
    if (def.required) return;
    setBlocks(blocks.filter(x => x.id !== id));
  }

  function addBlock(defKey) {
    const id = 'b_' + Math.random().toString(36).slice(2, 8);
    setBlocks([...blocks, { id, defKey, order: blocks.length, visible: true, props: {} }]);
    setSelected(id);
    setShowAdd(false);
  }

  function updateProps(id, patch) {
    setBlocks(blocks.map(b => b.id === id ? { ...b, props: { ...b.props, ...patch } } : b));
  }

  // blocks usable but not yet at max
  const addableDefs = template.blocks.filter(def => {
    const count = blocks.filter(b => b.defKey === def.key).length;
    return count < def.max;
  });

  return (
    <AppShell current="versions" go={go}
      breadcrumb={<><a onClick={() => go('versions')} style={{cursor:'pointer'}}>Versões</a> / {version.name} / Editor</>}
      title="Editor de página"
      actions={<>
        <Button variant="ghost" size="sm" onClick={() => go(`cv:${version.id}`)}>Modo currículo</Button>
        <Button variant="ghost" size="sm" onClick={() => go('public')}>Preview público</Button>
        <Button variant="accent" size="sm">Publicar</Button>
      </>}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '280px 340px 1fr', gap: 20, minHeight: 'calc(100vh - 180px)' }}>
        {/* block list */}
        <Card style={{ padding: 12, height: 'fit-content', position: 'sticky', top: 100 }}>
          <div className="mono" style={{ fontSize: 10, color: 'var(--ink-4)', letterSpacing: '0.12em', padding: '4px 8px 10px', textTransform: 'uppercase' }}>
            Blocos · {blocks.length}
          </div>
          {blocks.map((b, i) => {
            const def = template.blocks.find(d => d.key === b.defKey);
            const on = selected === b.id;
            return (
              <div key={b.id} style={{
                padding: '8px 10px', borderRadius: 8, marginBottom: 2,
                background: on ? 'var(--ink)' : 'transparent',
                color: on ? 'var(--bg)' : 'var(--ink-2)',
                opacity: b.visible ? 1 : 0.5,
                display: 'flex', alignItems: 'center', gap: 8,
                cursor: 'pointer',
              }} onClick={() => setSelected(b.id)}>
                <span className="mono" style={{ fontSize: 10, opacity: 0.6, width: 14 }}>{String(i+1).padStart(2,'0')}</span>
                <span style={{ fontSize: 13, flex: 1 }}>{def.name}</span>
                {def.required && <span className="mono" style={{ fontSize: 9, opacity: 0.5 }}>REQ</span>}
                <div style={{ display: 'flex', gap: 2 }}>
                  <MiniBtn on={on} onClick={e => { e.stopPropagation(); move(b.id, -1); }} title="Subir">↑</MiniBtn>
                  <MiniBtn on={on} onClick={e => { e.stopPropagation(); move(b.id, 1); }} title="Descer">↓</MiniBtn>
                  <MiniBtn on={on} onClick={e => { e.stopPropagation(); toggleVisible(b.id); }} title="Ocultar">{b.visible ? '●' : '○'}</MiniBtn>
                  {!def.required && <MiniBtn on={on} onClick={e => { e.stopPropagation(); remove(b.id); }} title="Remover">×</MiniBtn>}
                </div>
              </div>
            );
          })}

          {!showAdd ? (
            <button onClick={() => setShowAdd(true)} style={{
              width: '100%', padding: '10px', marginTop: 8,
              border: '1px dashed var(--line)', borderRadius: 8,
              color: 'var(--ink-3)', fontSize: 13,
            }}>+ Adicionar bloco</button>
          ) : (
            <div style={{ marginTop: 8, padding: 10, border: '1px solid var(--line)', borderRadius: 8 }}>
              <div className="mono" style={{ fontSize: 10, color: 'var(--ink-4)', letterSpacing: '0.1em', marginBottom: 6 }}>DISPONÍVEIS</div>
              {addableDefs.length === 0 && <div style={{ fontSize: 12, color: 'var(--ink-4)' }}>Todos adicionados.</div>}
              {addableDefs.map(def => (
                <button key={def.key} onClick={() => addBlock(def.key)} style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '6px 8px', fontSize: 13, borderRadius: 6,
                }} onMouseEnter={e => e.currentTarget.style.background='var(--bg-soft)'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                  + {def.name}
                </button>
              ))}
              <button onClick={() => setShowAdd(false)} style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 6 }}>cancelar</button>
            </div>
          )}
        </Card>

        {/* field editor */}
        <Card style={{ padding: 20, height: 'fit-content', position: 'sticky', top: 100 }}>
          {sel && selDef ? <BlockEditor def={selDef} block={sel} onUpdate={patch => updateProps(sel.id, patch)} resolved={resolved} /> : null}
        </Card>

        {/* preview */}
        <div>
          <div className="mono" style={{ fontSize: 10, color: 'var(--ink-4)', letterSpacing: '0.12em', marginBottom: 10, display: 'flex', justifyContent: 'space-between' }}>
            <span>PREVIEW · /@{resolved.user.handle}/{version.slug}</span>
            <span>{blocks.filter(b => b.visible).length} blocos visíveis</span>
          </div>
          <div style={{ background: 'white', border: '1px solid var(--line)', borderRadius: 16, overflow: 'hidden' }}>
            {blocks.filter(b => b.visible).map(b => {
              const def = template.blocks.find(d => d.key === b.defKey);
              return (
                <div key={b.id}
                  onClick={() => setSelected(b.id)}
                  style={{
                    outline: selected === b.id ? '2px solid var(--accent)' : 'none',
                    outlineOffset: -2, cursor: 'pointer', position: 'relative',
                  }}>
                  <BlockRenderer def={def} block={b} resolved={resolved} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function MiniBtn({ children, onClick, title, on }) {
  return (
    <button onClick={onClick} title={title} style={{
      width: 20, height: 20, borderRadius: 4,
      fontSize: 11,
      color: on ? 'rgba(255,255,255,0.7)' : 'var(--ink-3)',
    }} onMouseEnter={e => e.currentTarget.style.background = on ? 'rgba(255,255,255,0.15)' : 'var(--bg-soft)'}
       onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
      {children}
    </button>
  );
}

// Auto-generate form from def.fields
function BlockEditor({ def, block, onUpdate, resolved }) {
  const merged = { ...def.defaultProps, ...block.props };
  const bindings = def.bindings || {};

  return (
    <div>
      <div className="mono" style={{ fontSize: 10, color: 'var(--ink-4)', letterSpacing: '0.12em', marginBottom: 4, textTransform: 'uppercase' }}>{def.key}</div>
      <h3 className="display" style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.015em', margin: '0 0 4px' }}>{def.name}</h3>
      <div style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 16 }}>
        {Object.keys(bindings).length > 0
          ? `Bindado a ${Object.values(bindings).join(', ')}`
          : 'Conteúdo livre'}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {Object.entries(def.fields).map(([key, type]) => {
          const bound = bindings[key];
          return (
            <Field key={key} label={cap(key)} meta={bound ? `← ${bound}` : type}>
              {type === 'longtext' ? (
                <Textarea value={merged[key] || ''} onChange={val => onUpdate({ [key]: val })} rows={3} placeholder={bound ? `(de ${bound})` : ''} />
              ) : type === 'number' ? (
                <Input type="number" value={merged[key] || ''} onChange={val => onUpdate({ [key]: Number(val) })} />
              ) : (
                <Input value={merged[key] || ''} onChange={val => onUpdate({ [key]: val })} placeholder={bound ? `(de ${bound})` : ''} />
              )}
            </Field>
          );
        })}

        {/* image slot for hero / projects */}
        {(def.key === 'hero' || def.key === 'projectsGrid') && (
          <div>
            <div className="mono" style={{ fontSize: 10, color: 'var(--ink-4)', letterSpacing: '0.1em', marginBottom: 6 }}>IMAGEM</div>
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 10, alignItems: 'center' }}>
              <ImagePlaceholder label="img" h={56} />
              <Button variant="ghost" size="sm">Trocar imagem →</Button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <Button size="sm" variant="subtle">Reset padrão</Button>
          {Object.keys(bindings).length > 0 && <Button size="sm" variant="ghost">Desvincular</Button>}
        </div>
      </div>
    </div>
  );
}

function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

// ==================== BLOCK RENDERERS ====================
// These are the "template implementation" — one React component per block.key

function BlockRenderer({ def, block, resolved }) {
  const merged = { ...def.defaultProps, ...block.props };
  const bindings = def.bindings || {};

  // resolve bound fields
  const data = {};
  for (const [k, v] of Object.entries(bindings)) {
    data[k] = getPath(resolved, v.replace(/^version\./,'').replace(/^profile\./,''));
  }

  switch (def.key) {
    case 'hero':
      return <HeroBlock title={merged.title || resolved.headline} subtitle={merged.subtitle || resolved.bio} eyebrow={merged.eyebrow} cta={merged.cta} />;
    case 'about':
      return <AboutBlock title={merged.title} body={merged.body || resolved.bio} />;
    case 'projectsGrid':
      return <ProjectsBlock title={merged.title} items={resolved.projects} cols={merged.cols} />;
    case 'experienceList':
      return <ExpBlock title={merged.title} items={resolved.experiences} />;
    case 'achievements':
      return <AchBlock title={merged.title} items={resolved.achievements} />;
    case 'contact':
      return <ContactBlock title={merged.title} note={merged.note} links={resolved.links} handle={resolved.user.handle} />;
    default:
      return <div style={{ padding: 40, color: 'var(--ink-4)' }}>{def.name}</div>;
  }
}

function getPath(obj, path) {
  return path.split('.').reduce((o,k) => o && o[k], obj);
}

function HeroBlock({ title, subtitle, eyebrow, cta }) {
  return (
    <section style={{ padding: '72px 56px 56px', borderBottom: '1px solid var(--line-2)' }}>
      <div className="mono" style={{ fontSize: 11, letterSpacing: '0.12em', color: 'var(--ink-3)', textTransform: 'uppercase', marginBottom: 24 }}>{eyebrow}</div>
      <h1 className="display" style={{ fontSize: 'clamp(36px, 5vw, 64px)', lineHeight: 1, letterSpacing: '-0.03em', fontWeight: 600, margin: 0, textWrap: 'balance' }}>
        {title}
      </h1>
      <p style={{ fontSize: 17, color: 'var(--ink-2)', marginTop: 20, maxWidth: 560, lineHeight: 1.5 }}>{subtitle}</p>
      {cta && <button style={{ marginTop: 28, background: 'var(--accent)', color: 'var(--accent-ink)', padding: '10px 18px', borderRadius: 999, fontSize: 14, fontWeight: 500 }}>{cta}</button>}
    </section>
  );
}

function AboutBlock({ title, body }) {
  return (
    <section style={{ padding: '56px 56px', borderBottom: '1px solid var(--line-2)', display: 'grid', gridTemplateColumns: '200px 1fr', gap: 40 }}>
      <h2 className="display" style={{ fontSize: 18, fontWeight: 600, margin: 0, letterSpacing: '-0.01em' }}>{title}</h2>
      <div style={{ fontSize: 17, lineHeight: 1.55, color: 'var(--ink-2)', maxWidth: 640 }}>{body}</div>
    </section>
  );
}

function ProjectsBlock({ title, items, cols = 2 }) {
  return (
    <section style={{ padding: '56px 56px', borderBottom: '1px solid var(--line-2)' }}>
      <h2 className="display" style={{ fontSize: 18, fontWeight: 600, margin: '0 0 24px', letterSpacing: '-0.01em' }}>{title}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols},1fr)`, gap: 20 }}>
        {items.map(p => (
          <div key={p.id}>
            <ImagePlaceholder label={p.title.split(' ')[0].toLowerCase()} h={200} />
            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div className="display" style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em' }}>{p.title}</div>
              <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>{p.year}</span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 4 }}>{p.summary}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ExpBlock({ title, items }) {
  return (
    <section style={{ padding: '56px 56px', borderBottom: '1px solid var(--line-2)', display: 'grid', gridTemplateColumns: '200px 1fr', gap: 40 }}>
      <h2 className="display" style={{ fontSize: 18, fontWeight: 600, margin: 0, letterSpacing: '-0.01em' }}>{title}</h2>
      <div>
        {items.map((e, i) => (
          <div key={e.id} style={{
            display: 'grid', gridTemplateColumns: '120px 1fr', gap: 20,
            padding: '16px 0', borderTop: i > 0 ? '1px solid var(--line-2)' : 'none',
          }}>
            <div className="mono" style={{ fontSize: 12, color: 'var(--ink-3)' }}>
              {e.start.slice(0,4)} — {e.end ? e.end.slice(0,4) : 'hoje'}
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 500 }}>{e.role} <span style={{ color: 'var(--ink-3)', fontWeight: 400 }}>· {e.company}</span></div>
              <div style={{ fontSize: 14, color: 'var(--ink-2)', marginTop: 4, lineHeight: 1.5 }}>{e.summary}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function AchBlock({ title, items }) {
  return (
    <section style={{ padding: '56px 56px', borderBottom: '1px solid var(--line-2)', display: 'grid', gridTemplateColumns: '200px 1fr', gap: 40 }}>
      <h2 className="display" style={{ fontSize: 18, fontWeight: 600, margin: 0, letterSpacing: '-0.01em' }}>{title}</h2>
      <div>
        {items.map((a, i) => (
          <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: i > 0 ? '1px solid var(--line-2)' : 'none' }}>
            <div style={{ fontSize: 15 }}>{a.title}</div>
            <div className="mono" style={{ fontSize: 12, color: 'var(--ink-3)' }}>{a.issuer} · {a.year}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ContactBlock({ title, note, links, handle }) {
  return (
    <section style={{ padding: '72px 56px', background: 'var(--ink)', color: 'var(--bg)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'end' }}>
        <div>
          <h2 className="display" style={{ fontSize: 48, fontWeight: 600, letterSpacing: '-0.02em', margin: 0 }}>{title}</h2>
          <p style={{ fontSize: 16, opacity: 0.7, marginTop: 12, maxWidth: 380 }}>{note}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {links.map(l => (
            <a key={l.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
              <span>{l.label}</span>
              <span className="mono" style={{ opacity: 0.6, fontSize: 12 }}>{l.url} ↗</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { Editor, BlockRenderer });
