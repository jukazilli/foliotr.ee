// Design tokens as a JS module exposed on window.
// Tweakable via postMessage edits.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#C6FF3D",
  "accentInk": "#0E1116",
  "bg": "#FBFAF7",
  "ink": "#0E1116",
  "density": "comfortable",
  "landingHeadline": "Uma vida profissional. Muitas formas de mostrar.",
  "showMono": true
}/*EDITMODE-END*/;

window.FT_TOKENS = {
  ...TWEAK_DEFAULTS,
};

window.applyTokens = function(t) {
  const root = document.documentElement;
  if (t.accent) root.style.setProperty('--accent', t.accent);
  if (t.accentInk) root.style.setProperty('--accent-ink', t.accentInk);
  if (t.bg) root.style.setProperty('--bg', t.bg);
  if (t.ink) root.style.setProperty('--ink', t.ink);
  window.FT_TOKENS = { ...window.FT_TOKENS, ...t };
  window.dispatchEvent(new CustomEvent('ft-tokens-changed'));
};

window.applyTokens(TWEAK_DEFAULTS);
