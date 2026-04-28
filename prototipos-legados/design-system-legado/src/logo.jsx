// Logo: geometric mark (stacked square + circle) + wordmark "foliotree"

function FTLogo({ size = 22, wordmark = true, tone = "ink" }) {
  const fg = tone === "ink" ? "var(--ink)" : "var(--bg)";
  const acc = "var(--accent)";
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, color: fg }}>
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
        <rect x="2" y="2" width="12" height="12" fill={fg} />
        <circle cx="16" cy="16" r="6" fill={acc} />
      </svg>
      {wordmark && (
        <span className="display" style={{
          fontWeight: 700, letterSpacing: '-0.02em', fontSize: size * 0.82,
        }}>foliotree</span>
      )}
    </span>
  );
}

window.FTLogo = FTLogo;
