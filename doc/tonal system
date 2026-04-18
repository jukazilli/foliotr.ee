import React from "react";
import { motion } from "framer-motion";

type ToneScale = {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
};

const tones: {
  neutral: ToneScale;
  lime: ToneScale;
  blue: ToneScale;
  green: ToneScale;
  violet: ToneScale;
  cyan: ToneScale;
  brown: ToneScale;
  coral: ToneScale;
} = {
  neutral: {
    50: "#F8FAFC",
    100: "#F4F7FB",
    200: "#E8EEF5",
    300: "#D9E0EA",
    400: "#B7C0CC",
    500: "#8691A0",
    600: "#5E6878",
    700: "#3D4757",
    800: "#1A1F29",
    900: "#0F1115",
  },
  lime: {
    50: "#F7FAE5",
    100: "#EFF5CC",
    200: "#E5EEAA",
    300: "#DAE788",
    400: "#CDDF5D",
    500: "#D5F221",
    600: "#AEC427",
    700: "#90A220",
    800: "#718019",
    900: "#535E13",
  },
  blue: {
    50: "#EAF0FA",
    100: "#CDDAF4",
    200: "#ACC2EC",
    300: "#8BA9E5",
    400: "#618BDB",
    500: "#2F66D0",
    600: "#2756AF",
    700: "#20458D",
    800: "#18356C",
    900: "#11254B",
  },
  green: {
    50: "#ECFEE5",
    100: "#D5FFC7",
    200: "#B5FFA1",
    300: "#98FF7F",
    400: "#88FF67",
    500: "#7DFF5A",
    600: "#63D94A",
    700: "#4BA93B",
    800: "#357A2D",
    900: "#214E1E",
  },
  violet: {
    50: "#F3F0FF",
    100: "#E7E0FF",
    200: "#D6CAFF",
    300: "#C0B0FF",
    400: "#9A7DFF",
    500: "#7B61FF",
    600: "#654DE0",
    700: "#503DB8",
    800: "#3B2E88",
    900: "#281F5E",
  },
  cyan: {
    50: "#E8F9FF",
    100: "#CBF3FF",
    200: "#9DEAFF",
    300: "#6DDEFF",
    400: "#3ED0FF",
    500: "#19C2FF",
    600: "#11A1DA",
    700: "#0C7DAA",
    800: "#095B7A",
    900: "#063C52",
  },
  brown: {
    50: "#F9EEF1",
    100: "#F0D7DE",
    200: "#E2B8C5",
    300: "#D094A8",
    400: "#B96F8B",
    500: "#9A4F6D",
    600: "#833F5B",
    700: "#6D334C",
    800: "#57283C",
    900: "#421D2D",
  },
  coral: {
    50: "#FFF4EF",
    100: "#FFE2D6",
    200: "#FFC8B4",
    300: "#FFAB8E",
    400: "#FF8B6C",
    500: "#FF6B57",
    600: "#E05143",
    700: "#B93D34",
    800: "#8A2B28",
    900: "#5E1B1E",
  },
};

const semantic = {
  page: {
    background: tones.neutral[100],
    surface: "#FFFFFF",
    border: "rgba(15,17,21,0.08)",
    text: tones.neutral[900],
    textSoft: "rgba(15,17,21,0.68)",
    caption: "rgba(15,17,21,0.48)",
  },
};

const tonalFamilies = [
  {
    name: "Neutral",
    key: "neutral",
    scale: tones.neutral,
    note: "Base light/dark do sistema. Usada para background, superfície, borda e tipografia.",
    recommendedPair: `${tones.neutral[100]} + ${tones.neutral[900]}`,
  },
  {
    name: "Lime",
    key: "lime",
    scale: tones.lime,
    note: "Família energética principal. Boa para hero, CTA e seções vibrantes com dark da própria família.",
    recommendedPair: `${tones.lime[500]} + ${tones.lime[900]}`,
  },
  {
    name: "Blue",
    key: "blue",
    scale: tones.blue,
    note: "Família fria de estrutura e confiança. Boa para landing, contraste e base de comunicação.",
    recommendedPair: `${tones.blue[500]} + #FFFFFF`,
  },
  {
    name: "Green",
    key: "green",
    scale: tones.green,
    note: "Família de ação. Boa para botões, seleção ativa e estados positivos.",
    recommendedPair: `${tones.green[500]} + ${tones.green[900]}`,
  },
  {
    name: "Cyan",
    key: "cyan",
    scale: tones.cyan,
    note: "Família de info. Light = informação suave. Dark = tipografia em blocos informativos.",
    recommendedPair: `${tones.cyan[100]} + ${tones.cyan[900]}`,
  },
  {
    name: "Violet",
    key: "violet",
    scale: tones.violet,
    note: "Família de versão, camada criativa e diferenciação controlada.",
    recommendedPair: `${tones.violet[100]} + ${tones.violet[900]}`,
  },
  {
    name: "Brown",
    key: "brown",
    scale: tones.brown,
    note: "Família marrom-vinho-bordô. Light tende ao vinho suave. Dark aprofunda para bordô fechado.",
    recommendedPair: `${tones.brown[100]} + ${tones.brown[900]}`,
  },
  {
    name: "Coral Sparkle",
    key: "coral",
    scale: tones.coral,
    note: "Família coral. Light caminha para pêssego/laranja suave. Dark aprofunda para vermelho intenso.",
    recommendedPair: `${tones.coral[100]} + ${tones.coral[900]}`,
  },
] as const;

const fontDarkPairs = [
  { name: "Blue / dark font", value: tones.blue[900] },
  { name: "Green / dark font", value: tones.green[900] },
  { name: "Lime / dark font", value: tones.lime[900] },
  { name: "Brown / dark font", value: tones.brown[900] },
  { name: "Coral / dark font", value: tones.coral[900] },
  { name: "Info / dark font", value: tones.cyan[900] },
  { name: "Version / dark font", value: tones.violet[900] },
  { name: "Neutral / dark font", value: tones.neutral[900] },
];

const keyPairs = [
  {
    title: "Info / Light",
    bg: tones.cyan[100],
    text: tones.cyan[900],
  },
  {
    title: "Version / Light",
    bg: tones.violet[100],
    text: tones.violet[900],
  },
  {
    title: "Neutral / Light",
    bg: tones.neutral[100],
    text: tones.neutral[900],
  },
  {
    title: "Coral / Light",
    bg: tones.coral[100],
    text: tones.coral[900],
  },
  {
    title: "Brown / Light",
    bg: tones.brown[100],
    text: tones.brown[900],
  },
];

const applicationSystemMarkdown = `# FolioTree — Color Application System v0.0.1

## 1. Core rule
Each main color must have a tonal family from 50 to 900.
Use the same family in light and dark tones to create overlays, typography, badges, buttons, and sections without breaking visual coherence.

## 2. Neutral system
- Background / Light: ${tones.neutral[100]}
- Surface / White: #FFFFFF
- Border / Soft: ${tones.neutral[300]}
- Main text / Dark: ${tones.neutral[900]}
- Secondary text: ${tones.neutral[700]}

## 3. Landing page application
- Use Blue 500 as a cold structural hero background.
- Use Lime 500 as energetic headline and primary CTA color.
- When a section is Lime 500, prefer Lime 900 for typography.
- Avoid black text on expressive sections when a dark tone from the same family exists.
- Keep the hero structure simple: image left, text right, one main CTA.

## 4. Logged-in product application
- Use Neutral 100 as the default background.
- Use white surfaces for cards and work areas.
- Use Neutral 900 for titles and primary text.
- Use color only as accent, never as full-screen background.
- Use Green for action.
- Use Cyan for info.
- Use Violet for versions.
- Use Coral Sparkle for warm highlights.
- Use Brown for editorial accents, premium tags, or deeper warm emphasis.

## 5. Same-family overlay rule
- Light tones (50–200): soft surfaces, chips, info blocks, subtle highlights.
- Mid tones (300–500): main accent, CTA, category color, stronger visual cue.
- Dark tones (600–900): text, icons, strong borders, pressed states, monochrome sections.

## 6. Recommended contrast pairs
- Info / Light: ${tones.cyan[100]} + ${tones.cyan[900]}
- Version / Light: ${tones.violet[100]} + ${tones.violet[900]}
- Neutral / Light: ${tones.neutral[100]} + ${tones.neutral[900]}
- Coral / Light: ${tones.coral[100]} + ${tones.coral[900]}
- Brown / Light: ${tones.brown[100]} + ${tones.brown[900]}
- Lime / Hero: ${tones.lime[500]} + ${tones.lime[900]}
- Green / Action: ${tones.green[500]} + ${tones.green[900]}
- Blue / Hero: ${tones.blue[500]} + #FFFFFF

## 7. Dark font palette
- Blue dark font: ${tones.blue[900]}
- Green dark font: ${tones.green[900]}
- Lime dark font: ${tones.lime[900]}
- Brown dark font: ${tones.brown[900]}
- Coral dark font: ${tones.coral[900]}
- Info dark font: ${tones.cyan[900]}
- Version dark font: ${tones.violet[900]}
- Neutral dark font: ${tones.neutral[900]}

## 8. Important rule
The product should not feel overloaded with color.
Color should organize meaning, not dominate the interface.
The landing can be more expressive.
The logged-in product must remain light, fast, and easy to scan.`;

function SectionTitle({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <div className="max-w-3xl space-y-3">
      <div className="text-xs font-semibold uppercase tracking-[0.24em]" style={{ color: semantic.page.caption }}>
        {eyebrow}
      </div>
      <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl" style={{ color: semantic.page.text }}>
        {title}
      </h2>
      <p className="text-sm leading-7 sm:text-base" style={{ color: semantic.page.textSoft }}>
        {body}
      </p>
    </div>
  );
}

function ToneRamp({ name, scale, note, recommendedPair }: { name: string; scale: ToneScale; note: string; recommendedPair: string }) {
  const order = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;
  return (
    <div className="rounded-[28px] border bg-white p-5 shadow-sm" style={{ borderColor: semantic.page.border }}>
      <div className="mb-5 flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="text-base font-semibold" style={{ color: semantic.page.text }}>{name}</div>
          <div className="mt-1 max-w-2xl text-sm leading-6" style={{ color: semantic.page.textSoft }}>{note}</div>
        </div>
        <div className="rounded-2xl px-3 py-2 text-xs font-medium" style={{ background: tones.neutral[50], color: semantic.page.text }}>
          Recommended pair: {recommendedPair}
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 xl:grid-cols-10">
        {order.map((key) => {
          const value = scale[key];
          const dark = key >= 600;
          return (
            <div key={key} className="overflow-hidden rounded-2xl border" style={{ borderColor: semantic.page.border }}>
              <div className="h-20" style={{ background: value }} />
              <div className="space-y-1 bg-white p-3 text-center">
                <div className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: semantic.page.caption }}>
                  {key}
                </div>
                <div className="text-[11px] font-semibold" style={{ color: semantic.page.text }}>
                  {value}
                </div>
                <div
                  className="rounded-lg px-2 py-1 text-[10px] font-semibold"
                  style={{
                    background: dark ? value : tones.neutral[50],
                    color: dark ? "#FFFFFF" : semantic.page.text,
                    border: dark ? "1px solid transparent" : `1px solid ${semantic.page.border}`,
                  }}
                >
                  {dark ? "dark" : "light"}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PairCard({ title, bg, text }: { title: string; bg: string; text: string }) {
  return (
    <div className="rounded-[24px] border bg-white p-4" style={{ borderColor: semantic.page.border }}>
      <div className="mb-3 text-sm font-semibold" style={{ color: semantic.page.text }}>{title}</div>
      <div className="rounded-[18px] border p-4" style={{ background: bg, borderColor: semantic.page.border }}>
        <div className="text-[11px] uppercase tracking-[0.16em]" style={{ color: text, opacity: 0.72 }}>
          Background
        </div>
        <div className="mt-1 text-sm font-semibold" style={{ color: text }}>{bg}</div>
        <div className="mt-4 text-[11px] uppercase tracking-[0.16em]" style={{ color: text, opacity: 0.72 }}>
          Text pair
        </div>
        <div className="mt-1 text-sm font-semibold" style={{ color: text }}>{text}</div>
      </div>
    </div>
  );
}

function FontDarkCard({ name, value }: { name: string; value: string }) {
  return (
    <div className="rounded-[22px] border bg-white p-4" style={{ borderColor: semantic.page.border }}>
      <div className="text-[11px] uppercase tracking-[0.16em]" style={{ color: semantic.page.caption }}>
        {name}
      </div>
      <div className="mt-3 flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl border" style={{ background: value, borderColor: semantic.page.border }} />
        <div>
          <div className="text-sm font-semibold" style={{ color: semantic.page.text }}>{value}</div>
          <div className="text-xs" style={{ color: semantic.page.textSoft }}>Recommended dark typography tone</div>
        </div>
      </div>
    </div>
  );
}

export default function FolioTreeBrandMoodBoard() {
  return (
    <div className="min-h-screen w-full" style={{ background: semantic.page.background }}>
      <div className="mx-auto max-w-7xl px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="rounded-[36px] border bg-white p-8 shadow-[0_20px_60px_rgba(15,17,21,0.06)] sm:p-10"
          style={{ borderColor: semantic.page.border }}
        >
          <SectionTitle
            eyebrow="Tonal system"
            title="FolioTree color system with complete tonal families"
            body="Each family now has light and dark tones so the same color can work over itself with stronger hierarchy, cleaner overlays and better contrast logic."
          />
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.04 }}
          className="mt-8 grid gap-4"
        >
          {tonalFamilies.map((family) => (
            <ToneRamp
              key={family.key}
              name={family.name}
              scale={family.scale}
              note={family.note}
              recommendedPair={family.recommendedPair}
            />
          ))}
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08 }}
          className="mt-8 rounded-[36px] border bg-white p-8 shadow-[0_20px_60px_rgba(15,17,21,0.06)] sm:p-10"
          style={{ borderColor: semantic.page.border }}
        >
          <SectionTitle
            eyebrow="Key pairs"
            title="Recommended light backgrounds and text pairs"
            body="These pairs are the most useful for cards, badges, panels, tags and lightweight UI surfaces."
          />

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {keyPairs.map((pair) => (
              <PairCard key={pair.title} title={pair.title} bg={pair.bg} text={pair.text} />
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.12 }}
          className="mt-8 rounded-[36px] border bg-white p-8 shadow-[0_20px_60px_rgba(15,17,21,0.06)] sm:p-10"
          style={{ borderColor: semantic.page.border }}
        >
          <SectionTitle
            eyebrow="Dark font palette"
            title="Dark tones recommended for typography"
            body="These are the deep tones that should be used when a family needs its own dark text instead of default black or neutral text."
          />

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {fontDarkPairs.map((item) => (
              <FontDarkCard key={item.name} name={item.name} value={item.value} />
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.16 }}
          className="mt-8 rounded-[36px] border bg-white p-8 shadow-[0_20px_60px_rgba(15,17,21,0.06)] sm:p-10"
          style={{ borderColor: semantic.page.border }}
        >
          <SectionTitle
            eyebrow="Application system"
            title="Markdown spec for AI and team usage"
            body="This section replaces visual mockups with direct written guidance so the system is easier for AI models and humans to parse consistently."
          />

          <div className="mt-8 overflow-hidden rounded-[28px] border" style={{ borderColor: semantic.page.border }}>
            <pre
              className="overflow-x-auto p-6 text-sm leading-7"
              style={{
                background: tones.neutral[50],
                color: semantic.page.text,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace",
              }}
            >
              {applicationSystemMarkdown}
            </pre>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
