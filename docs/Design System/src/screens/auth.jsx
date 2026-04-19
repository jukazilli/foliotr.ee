// Auth screens: login, register, forgot-password, reset.
// Shared shell: split screen — canvas editorial à esquerda, formulário à direita.

function AuthShell({ title, subtitle, children, aside, footer }) {
  return (
    <div style={{
      minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr',
      background: 'var(--bg)',
    }}>
      {/* editorial side */}
      <div style={{
        background: 'var(--ink)', color: 'var(--bg)', padding: 40,
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        position: 'relative', overflow: 'hidden',
      }}>
        <FTLogo tone="bg" />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="mono" style={{ fontSize: 11, opacity: 0.5, letterSpacing: '0.1em', marginBottom: 20 }}>FOLIOTREE · MANIFESTO</div>
          <h2 className="display" style={{ fontSize: 56, fontWeight: 500, lineHeight: 1.02, letterSpacing: '-0.025em', margin: 0 }}>
            LinkedIn mostra. <br/><span style={{ background: 'var(--accent)', color: 'var(--accent-ink)', padding: '0 10px' }}>FolioTree prova.</span>
          </h2>
          {aside || (
            <p style={{ fontSize: 16, opacity: 0.7, marginTop: 28, maxWidth: 420 }}>
              Um lugar só pra sua vida profissional. Preencha uma vez, multiplique em páginas, versões e currículos.
            </p>
          )}
        </div>
        <div className="mono" style={{ fontSize: 11, opacity: 0.4, letterSpacing: '0.1em' }}>
          ↳ Perfil → Versões → Páginas → Currículo
        </div>

        {/* decorative bg */}
        <div style={{
          position: 'absolute', right: -80, bottom: -80, width: 320, height: 320, borderRadius: '50%',
          background: 'var(--accent)', opacity: 0.14, filter: 'blur(20px)', pointerEvents: 'none',
        }} />
      </div>

      {/* form side */}
      <div style={{ padding: '56px 48px', display: 'flex', flexDirection: 'column', maxWidth: 560, width: '100%', justifySelf: 'center' }}>
        <div style={{ flex: 1 }}>
          <div className="mono" style={{ fontSize: 11, color: 'var(--ink-4)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 20 }}>{title}</div>
          {subtitle && (
            <h1 className="display" style={{ fontSize: 40, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05, margin: '0 0 36px' }}>{subtitle}</h1>
          )}
          {children}
        </div>
        {footer && <div style={{ marginTop: 32, fontSize: 13, color: 'var(--ink-3)' }}>{footer}</div>}
      </div>
    </div>
  );
}

function Login({ go }) {
  const [email, setEmail] = React.useState("ana@folio.tree");
  const [password, setPassword] = React.useState("••••••••");
  return (
    <AuthShell
      title="Entrar"
      subtitle="Bem-vinda de volta."
      footer={<>
        Não tem conta? <a onClick={() => go('register')} style={link}>Criar conta</a>
        <span style={{ margin: '0 10px', color: 'var(--ink-4)' }}>·</span>
        <a onClick={() => go('landing')} style={link}>Voltar para a home</a>
      </>}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Field label="Email"><Input type="email" value={email} onChange={setEmail} /></Field>
        <Field label="Senha" meta={<a onClick={() => go('forgot')} style={link}>esqueci</a>}>
          <Input type="password" value={password} onChange={setPassword} />
        </Field>
        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="primary" onClick={() => go('home')}>Entrar →</Button>
        </div>
      </div>
    </AuthShell>
  );
}

function Register({ go }) {
  const [step, setStep] = React.useState(0);
  const [name, setName] = React.useState("");
  const [handle, setHandle] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [headline, setHeadline] = React.useState("");

  if (step === 0) {
    return (
      <AuthShell
        title="Criar conta"
        subtitle="Comece pelo básico."
        footer={<>Já tem conta? <a onClick={() => go('login')} style={link}>Entrar</a></>}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field label="Seu nome"><Input value={name} onChange={setName} placeholder="Ana Corrêa" /></Field>
          <Field label="Email"><Input type="email" value={email} onChange={setEmail} placeholder="voce@email.com" /></Field>
          <Field label="Senha" meta="mínimo 8 caracteres"><Input type="password" value={password} onChange={setPassword} /></Field>
          <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="primary" onClick={() => setStep(1)}>Continuar →</Button>
          </div>
        </div>
      </AuthShell>
    );
  }

  // Onboarding step: handle + headline.
  return (
    <AuthShell
      title="Passo 2 de 2"
      subtitle="Escolha seu endereço."
      aside={<p style={{ fontSize: 16, opacity: 0.7, marginTop: 28, maxWidth: 420 }}>
        Seu @handle vira sua URL pública. Fica visível em tudo que você publicar — dá pra mudar depois.
      </p>}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Field label="@handle" meta="3-24 caracteres">
          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--line)', borderRadius: 10, background: 'var(--bg-card)', paddingLeft: 13 }}>
            <span className="mono" style={{ color: 'var(--ink-4)', fontSize: 13 }}>foliotree.com/@</span>
            <input value={handle} onChange={e => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g,''))}
              placeholder="seunome"
              style={{ border: 0, outline: 0, padding: '11px 13px', fontSize: 14, background: 'transparent', flex: 1 }} />
          </div>
        </Field>
        <Field label="Sua headline" meta="você edita depois"><Input value={headline} onChange={setHeadline} placeholder="Product designer focada em sistemas" /></Field>

        <div style={{ background: 'var(--bg-soft)', padding: 14, borderRadius: 12, marginTop: 8 }}>
          <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.1em', marginBottom: 6 }}>VOCÊ ESTÁ CRIANDO</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
            <div>
              <div style={{ fontWeight: 500 }}>{name || "Seu nome"}</div>
              <div className="mono" style={{ fontSize: 12, color: 'var(--ink-3)' }}>foliotree.com/@{handle || "handle"}</div>
            </div>
            <Pill tone="accent">1ª versão: Default</Pill>
          </div>
        </div>

        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
          <Button variant="ghost" onClick={() => setStep(0)}>← Voltar</Button>
          <Button variant="accent" onClick={() => go('home')}>Criar conta</Button>
        </div>
      </div>
    </AuthShell>
  );
}

function Forgot({ go }) {
  const [sent, setSent] = React.useState(false);
  return (
    <AuthShell
      title="Esqueci a senha"
      subtitle={sent ? "Cheque seu email." : "Sem problema."}
      footer={<a onClick={() => go('login')} style={link}>← Voltar ao login</a>}
    >
      {sent ? (
        <div style={{ color: 'var(--ink-2)', lineHeight: 1.55 }}>
          <p>Enviamos um link pra <b>ana@folio.tree</b>. O link expira em 30 minutos.</p>
          <p style={{ color: 'var(--ink-3)', fontSize: 13 }}>Não recebeu? <a onClick={() => setSent(false)} style={link}>Tentar de novo</a></p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field label="Email"><Input type="email" placeholder="voce@email.com" /></Field>
          <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="primary" onClick={() => setSent(true)}>Enviar link</Button>
          </div>
        </div>
      )}
    </AuthShell>
  );
}

const link = { color: 'var(--ink)', cursor: 'pointer', borderBottom: '1px solid var(--ink)', paddingBottom: 1 };

Object.assign(window, { Login, Register, Forgot });
