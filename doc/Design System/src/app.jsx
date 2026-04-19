// App entrypoint — router + state + Tweaks.

const LS_KEY = 'ft_current_screen';

function App() {
  const [screen, setScreen] = React.useState(() => {
    try { return localStorage.getItem(LS_KEY) || 'landing'; }
    catch { return 'landing'; }
  });
  const [tweaksOpen, setTweaksOpen] = React.useState(false);

  function go(s) {
    setScreen(s);
    try { localStorage.setItem(LS_KEY, s); } catch {}
    window.scrollTo(0, 0);
  }

  // ---- Tweaks / edit-mode protocol ----
  React.useEffect(() => {
    function handler(e) {
      if (!e.data || typeof e.data !== 'object') return;
      if (e.data.type === '__activate_edit_mode') setTweaksOpen(true);
      if (e.data.type === '__deactivate_edit_mode') setTweaksOpen(false);
    }
    window.addEventListener('message', handler);
    // announce after listener registered
    try { window.parent.postMessage({ type: '__edit_mode_available' }, '*'); } catch {}
    return () => window.removeEventListener('message', handler);
  }, []);

  // parse param-style screen keys: "editor:pg1", "cv:v1", "version:v2"
  const [route, param] = screen.split(':');

  let page;
  switch (route) {
    case 'landing':     page = <Landing go={go} />; break;
    case 'login':       page = <Login go={go} />; break;
    case 'register':    page = <Register go={go} />; break;
    case 'forgot':      page = <Forgot go={go} />; break;
    case 'home':        page = <Home go={go} />; break;
    case 'profile':     page = <Profile go={go} />; break;
    case 'versions':    page = <Versions go={go} />; break;
    case 'versions-new':page = <Versions go={go} />; break;
    case 'version':     page = <Versions go={go} selected={param} />; break;
    case 'templates':   page = <Templates go={go} />; break;
    case 'editor':      page = <Editor go={go} pageId={param} />; break;
    case 'cv':          page = <CV go={go} versionId={param} />; break;
    case 'public':      page = <PublicPage go={go} />; break;
    default:            page = <Landing go={go} />;
  }

  return (
    <>
      {page}
      {/* Screen switcher — persistent, lightweight, top-right */}
      <ScreenSwitcher current={screen} go={go} />
      {tweaksOpen && <TweaksPanel />}
    </>
  );
}

function ScreenSwitcher({ current, go }) {
  const [open, setOpen] = React.useState(false);
  const groups = [
    { label: 'Público', items: [
      ['landing', 'Landing'],
      ['login', 'Login'],
      ['register', 'Registro'],
      ['forgot', 'Esqueci senha'],
      ['public', 'Página pública /@anacorrea'],
    ]},
    { label: 'Autenticado', items: [
      ['home', 'Início'],
      ['profile', 'Perfil'],
      ['versions', 'Versões (lista)'],
      ['version:v1', 'Versão · Design Lead'],
      ['editor:pg1', 'Editor · Design Lead'],
      ['editor:pg2', 'Editor · Autora'],
      ['templates', 'Templates'],
      ['cv:v1', 'Currículo · Design Lead'],
      ['cv:v2', 'Currículo · Autora'],
    ]},
  ];

  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
      {open && (
        <div style={{
          position: 'absolute', bottom: 52, right: 0,
          width: 280, background: 'var(--bg-card)', border: '1px solid var(--line)',
          borderRadius: 14, padding: 12, boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
          maxHeight: '70vh', overflowY: 'auto',
        }}>
          <div className="mono" style={{ fontSize: 10, color: 'var(--ink-4)', letterSpacing: '0.12em', padding: '4px 8px 8px' }}>NAVEGAR ENTRE TELAS</div>
          {groups.map(g => (
            <div key={g.label} style={{ marginBottom: 8 }}>
              <div className="mono" style={{ fontSize: 9, color: 'var(--ink-4)', letterSpacing: '0.1em', padding: '6px 8px' }}>{g.label.toUpperCase()}</div>
              {g.items.map(([k, l]) => (
                <button key={k} onClick={() => { go(k); setOpen(false); }} style={{
                  display: 'block', width: '100%', textAlign: 'left', padding: '7px 10px',
                  borderRadius: 6, fontSize: 13,
                  background: current === k ? 'var(--ink)' : 'transparent',
                  color: current === k ? 'var(--bg)' : 'var(--ink-2)',
                }} onMouseEnter={e => { if (current!==k) e.currentTarget.style.background = 'var(--bg-soft)'; }}
                  onMouseLeave={e => { if (current!==k) e.currentTarget.style.background = 'transparent'; }}>
                  {l}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
      <button onClick={() => setOpen(!open)} style={{
        background: 'var(--ink)', color: 'var(--bg)',
        padding: '10px 16px', borderRadius: 999, fontSize: 13, fontWeight: 500,
        boxShadow: '0 6px 20px rgba(0,0,0,0.18)',
        display: 'inline-flex', alignItems: 'center', gap: 8,
      }}>
        <span className="mono" style={{ fontSize: 10, opacity: 0.7, letterSpacing: '0.1em' }}>TELAS</span>
        {open ? '×' : '↗'}
      </button>
    </div>
  );
}

// ---------- Tweaks ----------

function TweaksPanel() {
  const [t, setT] = React.useState({ ...window.FT_TOKENS });

  function set(patch) {
    const next = { ...t, ...patch };
    setT(next);
    window.applyTokens(patch);
    try {
      window.parent.postMessage({ type: '__edit_mode_set_keys', edits: patch }, '*');
    } catch {}
  }

  const accents = [
    ['#C6FF3D', '#0E1116', 'Lime'],
    ['#FF5A1F', '#FFFFFF', 'Laranja'],
    ['#2A3DFF', '#FFFFFF', 'Azul'],
    ['#FF3D80', '#FFFFFF', 'Magenta'],
    ['#1B3A2F', '#FFFFFF', 'Mata'],
    ['#0E1116', '#FBFAF7', 'Preto'],
  ];

  return (
    <div style={{
      position: 'fixed', bottom: 20, left: 20, zIndex: 1000,
      width: 300, background: 'var(--bg-card)', border: '1px solid var(--line)',
      borderRadius: 14, padding: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div>
          <div className="display" style={{ fontSize: 16, fontWeight: 600 }}>Tweaks</div>
          <div className="mono" style={{ fontSize: 10, color: 'var(--ink-4)', letterSpacing: '0.1em' }}>AJUSTES DO PROTÓTIPO</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.1em', marginBottom: 8 }}>COR DE ACENTO</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6 }}>
            {accents.map(([c, ci, name]) => (
              <button key={c} title={name} onClick={() => set({ accent: c, accentInk: ci })} style={{
                height: 34, borderRadius: 8, background: c,
                border: '2px solid ' + (t.accent === c ? 'var(--ink)' : 'transparent'),
              }} />
            ))}
          </div>
        </div>

        <div>
          <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.1em', marginBottom: 8 }}>HEADLINE DA LANDING</div>
          <Textarea value={t.landingHeadline} onChange={v => set({ landingHeadline: v })} rows={3} />
        </div>

        <div>
          <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.1em', marginBottom: 8 }}>FUNDO DO PRODUTO</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              ['#FBFAF7', 'Off-white'],
              ['#F5F2EC', 'Areia'],
              ['#FFFFFF', 'Branco puro'],
            ].map(([c, n]) => (
              <button key={c} onClick={() => set({ bg: c })} style={{
                padding: '8px 10px', fontSize: 11, borderRadius: 8,
                background: c, border: '1px solid ' + (t.bg === c ? 'var(--ink)' : 'var(--line)'),
              }}>{n}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="mono" style={{ fontSize: 10, color: 'var(--ink-4)', marginTop: 16, textAlign: 'center', letterSpacing: '0.1em' }}>
        PERSISTE NO ARQUIVO
      </div>
    </div>
  );
}

// Mount
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
