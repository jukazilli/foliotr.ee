// UI primitives: Button, Pill, Field, Card, Section, Divider, Tag, EmptyState, ImagePlaceholder

function Button({ children, variant = "primary", size = "md", onClick, type, ...rest }) {
  const base = {
    fontFamily: 'var(--font-ui)',
    fontWeight: 500,
    fontSize: size === 'sm' ? 13 : 14,
    padding: size === 'sm' ? '7px 12px' : '11px 18px',
    borderRadius: 999,
    lineHeight: 1,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: 8, transition: 'transform .1s ease, background .15s ease, border-color .15s ease',
    whiteSpace: 'nowrap',
  };
  const variants = {
    primary: { background: 'var(--ink)', color: 'var(--bg)' },
    accent: { background: 'var(--accent)', color: 'var(--accent-ink)' },
    ghost: { background: 'transparent', color: 'var(--ink)', border: '1px solid var(--line)' },
    subtle: { background: 'var(--bg-soft)', color: 'var(--ink)' },
    danger: { background: 'transparent', color: 'var(--danger)', border: '1px solid var(--line)' },
  };
  return (
    <button type={type||"button"} onClick={onClick} style={{...base, ...variants[variant]}} {...rest}>
      {children}
    </button>
  );
}

function Pill({ children, tone = "neutral" }) {
  const tones = {
    neutral: { background: 'var(--bg-soft)', color: 'var(--ink-2)' },
    accent: { background: 'var(--accent)', color: 'var(--accent-ink)' },
    ink: { background: 'var(--ink)', color: 'var(--bg)' },
    live: { background: '#E8F6EA', color: '#1F6F34' },
    draft: { background: '#F6EEDE', color: '#8A6210' },
  };
  return (
    <span className="mono" style={{
      ...tones[tone],
      padding: '3px 8px', borderRadius: 999, fontSize: 11, letterSpacing: '0.02em',
      textTransform: 'uppercase', fontWeight: 500,
    }}>{children}</span>
  );
}

function Field({ label, meta, children }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 500 }}>{label}</span>
        {meta && <span className="mono" style={{ fontSize: 10, color: 'var(--ink-4)' }}>{meta}</span>}
      </span>
      {children}
    </label>
  );
}

function Input({ value, onChange, placeholder, type = "text", ...rest }) {
  return (
    <input
      type={type}
      value={value || ""}
      placeholder={placeholder}
      onChange={e => onChange && onChange(e.target.value)}
      style={{
        border: '1px solid var(--line)',
        background: 'var(--bg-card)',
        borderRadius: 10,
        padding: '11px 13px',
        fontSize: 14,
        outline: 'none',
        transition: 'border-color .15s',
      }}
      onFocus={e => e.target.style.borderColor = 'var(--ink)'}
      onBlur={e => e.target.style.borderColor = 'var(--line)'}
      {...rest}
    />
  );
}

function Textarea({ value, onChange, placeholder, rows = 3 }) {
  return (
    <textarea
      value={value || ""}
      placeholder={placeholder}
      rows={rows}
      onChange={e => onChange && onChange(e.target.value)}
      style={{
        border: '1px solid var(--line)',
        background: 'var(--bg-card)',
        borderRadius: 10,
        padding: '11px 13px',
        fontSize: 14,
        outline: 'none',
        resize: 'vertical',
        fontFamily: 'inherit',
        lineHeight: 1.5,
      }}
      onFocus={e => e.target.style.borderColor = 'var(--ink)'}
      onBlur={e => e.target.style.borderColor = 'var(--line)'}
    />
  );
}

function Card({ children, style, ...rest }) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--line)',
      borderRadius: 16, ...style,
    }} {...rest}>
      {children}
    </div>
  );
}

function Divider({ label }) {
  if (!label) return <div style={{ height: 1, background: 'var(--line)' }} />;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
      <span className="mono" style={{ fontSize: 10, color: 'var(--ink-4)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
    </div>
  );
}

function Tag({ children }) {
  return (
    <span className="mono" style={{
      fontSize: 11, color: 'var(--ink-3)', border: '1px solid var(--line)',
      padding: '2px 7px', borderRadius: 4,
    }}>{children}</span>
  );
}

// Subtle striped placeholder for any image.
function ImagePlaceholder({ label = "image", w = "100%", h = 180, dark = false }) {
  const bg = dark ? '#18191C' : '#EEEAE0';
  const ink = dark ? '#6A7280' : '#9A9280';
  return (
    <div style={{
      width: w, height: h,
      background: `repeating-linear-gradient(135deg, ${bg} 0 10px, ${dark?'#1F2024':'#E6E1D5'} 10px 11px)`,
      border: `1px solid ${dark?'#242630':'var(--line)'}`,
      borderRadius: 8,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <span className="mono" style={{ fontSize: 11, color: ink, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</span>
    </div>
  );
}

function EmptyState({ title, hint, action }) {
  return (
    <div style={{
      border: '1px dashed var(--line)', borderRadius: 16, padding: '36px 24px',
      textAlign: 'center', color: 'var(--ink-3)',
    }}>
      <div className="display" style={{ fontSize: 18, color: 'var(--ink)', marginBottom: 6 }}>{title}</div>
      {hint && <div style={{ fontSize: 13, marginBottom: 14 }}>{hint}</div>}
      {action}
    </div>
  );
}

function IconBtn({ children, onClick, title }) {
  return (
    <button onClick={onClick} title={title} aria-label={title} style={{
      width: 30, height: 30, borderRadius: 8,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      color: 'var(--ink-3)',
    }}
    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-soft)'}
    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      {children}
    </button>
  );
}

Object.assign(window, {
  Button, Pill, Field, Input, Textarea, Card, Divider, Tag, ImagePlaceholder, EmptyState, IconBtn,
});
