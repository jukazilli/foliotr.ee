# FolioTree Typography System

Status: working design system specification  
Version: v0.0.1  
Last updated: 2026-04-18

## Document Purpose

This file defines the current typography system for FolioTree.

It was created from the typography prototype located at:

- `C:\Users\juliano.pedroso\Downloads\tipografia`

The goal is to turn the visual prototype into a stable written rule set that can be used by humans and AI systems when designing or implementing FolioTree interfaces.

## Source Files Read

Primary sources:

- `README.md`
- `index.html`
- `package.json`
- `metadata.json`
- `tsconfig.json`
- `vite.config.ts`
- `src/main.tsx`
- `src/index.css`
- `src/App.tsx`

Generated dependency source:

- `package-lock.json`

`package-lock.json` was treated as dependency metadata, not as a design source.

## Core Typography Principle

FolioTree typography should feel like a platform for presence, connection, networking, and professional evidence.

It should not feel like a cold operational system.

The typography must communicate:

- openness
- contemporary presence
- fast reading
- clear circulation
- publishability
- energetic professionalism

It must avoid:

- excessive corporate weight
- ERP-like administration
- dense dashboard language
- cold blocks of text
- generic SaaS neutrality

## Relationship With Brand

The typography supports the approved FolioTree brand direction:

- vibrant
- clear
- bold
- close
- intelligent
- current

The type system should preserve the strategic idea that FolioTree is not just a resume builder, not just a portfolio builder, and not just a public profile page.

Typography should help professional value appear quickly.

## Font Stack

### Display

Font: `Sora`

Role:

- hero headlines
- large statements
- expressive section titles
- major onboarding moments
- empty states with brand presence
- large proof or impact numbers when they need strong visual identity

Behavior:

- expressive
- bold
- editorial
- high presence
- used in short text only

Tailwind token:

```css
--font-display: 'Sora', ui-sans-serif, system-ui, sans-serif;
```

### UI

Font: `Inter`

Role:

- navigation
- buttons
- forms
- cards
- descriptions
- labels
- product interface text
- long-running user flows

Behavior:

- readable
- fast
- flexible
- neutral enough for product
- lively enough to avoid an ERP feel

Tailwind tokens:

```css
--font-ui: 'Inter', ui-sans-serif, system-ui, sans-serif;
--font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
```

### Data

Font: `IBM Plex Mono`

Role:

- metrics
- raw links
- technical validation
- analytics
- numbers
- proof snippets
- system evidence

Behavior:

- precise
- factual
- technical without dominating the interface

Tailwind token:

```css
--font-data: 'IBM Plex Mono', monospace;
```

## Font Loading

Current prototype source:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@100;200;300;400;500;600;700&family=Inter:wght@100;200;300;400;500;600;700;800;900&family=Sora:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet">
```

Production may later choose local font hosting, but the current design source uses Google Fonts.

## Weight Scale

### 900 / Black

Use for:

- strongest brand headlines
- special hero statements
- giant impact numbers
- campaign-like compositions

Rule:

- Use only with short text.
- Do not use for long sentences.
- Use when FolioTree needs a strong editorial or Linktree-like impact.

Example behavior:

```tsx
className="font-display font-[900] leading-[0.88] tracking-[-0.04em]"
```

### 700 / Bold

Use for:

- primary landing page headlines
- section headlines
- CTAs
- short action statements

Rule:

- This is the default expressive weight for the landing page hierarchy.
- Use it when 900 would feel too heavy.

### 650 / Semibold-Plus

Use for:

- product page titles
- major platform section titles
- strong but controlled hierarchy

Rule:

- This is the preferred internal product weight.
- It keeps the interface stable without becoming bland.

### 600 / Semibold

Use for:

- card titles
- repeated item titles
- metrics
- data labels
- compact hierarchy inside UI modules

### 500 / Medium

Use for:

- lead text
- paragraph support
- body copy that still needs presence
- user-facing descriptions

### 400 / Regular

Use for:

- long reading
- secondary descriptions
- low-pressure support text

Rule:

- Use when readability matters more than brand presence.
- Avoid making the full interface too light or passive.

### 200 / Extra Light

Use for:

- strict editorial contrast
- background numbers
- decorative watermarks
- elegant graphic moments paired with strong 900 text

Rule:

- Use rarely.
- Do not use for functional product text.

## Landing Page Type Scale

Landing pages can be more expressive than the logged-in product.

They should use large, short, high-contrast text to make the value of FolioTree obvious in seconds.

### Display XL

Role: main first-fold headline.

Spec:

- family: `Display / Sora`
- weight: `700`
- size: `clamp(3.25rem, 7vw, 5rem)`
- line-height: `0.94`
- tracking: `-0.06em`
- color: `Neutral 900` by default

Example:

```tsx
className="font-display font-bold leading-[0.94] tracking-[-0.06em] text-[clamp(3.25rem,7vw,5rem)]"
```

Use for:

- `Show more than a profile.`
- `Mostre mais que um perfil.`
- short campaign-like hero statements

Do not use for:

- long explanations
- product forms
- administrative pages

### Display L

Role: large section titles in landing pages.

Spec:

- family: `Display / Sora`
- weight: `700`
- size: `clamp(2.25rem, 4vw, 3.5rem)`
- line-height: `0.98`
- tracking: `-0.05em`

Example:

```tsx
className="font-display font-bold leading-[0.98] tracking-[-0.05em] text-[clamp(2.25rem,4vw,3.5rem)]"
```

Use for:

- value sections
- proof sections
- CTA blocks
- major product narrative blocks

### Heading 1

Role: smaller landing page block titles.

Spec:

- family: `Display / Sora`
- weight: `650`
- size: `clamp(1.875rem, 3vw, 2.5rem)`
- line-height: `1.05`
- tracking: `-0.035em`

Example:

```tsx
className="font-display font-[650] leading-[1.05] tracking-[-0.035em] text-[clamp(1.875rem,3vw,2.5rem)]"
```

Use for:

- feature grids
- proof modules
- small editorial sections
- "how it works" blocks

### Lead

Role: hero support text and primary section support.

Spec:

- family: `UI / Inter`
- weight: `500`
- size: `1.125rem - 1.25rem`
- line-height: `1.5`
- tracking: `-0.01em`
- max width: `40ch` or close to `420px`

Example:

```tsx
className="font-ui font-medium leading-[1.5] tracking-[-0.01em] text-[1.25rem] max-w-[40ch]"
```

Rule:

- Keep it short.
- Prefer two to three visual lines.
- Do not explain the whole product before showing value.

### Body Landing

Role: supporting landing page paragraph.

Spec:

- family: `UI / Inter`
- weight: `500`
- size: `0.875rem`
- line-height: `1.65`
- max width: `500px`

Example:

```tsx
className="font-ui font-medium leading-[1.65] text-[0.875rem] max-w-[500px]"
```

### Eyebrow

Role: small contextual marker above a larger section.

Spec:

- family: `UI / Inter`
- weight: `700`
- size: `0.75rem`
- line-height: `1.2`
- tracking: `0.08em`
- case: uppercase

Example:

```tsx
className="font-ui font-bold leading-[1.2] tracking-[0.08em] text-[0.75rem] uppercase"
```

Use for:

- section context
- category setup
- short orientation labels

### CTA Text

Role: button and action text.

Spec:

- family: `UI / Inter`
- weight: `600`
- size: `0.9375rem`
- line-height: `1`

Example:

```tsx
className="font-ui font-semibold leading-none text-[0.9375rem]"
```

## Product UI Type Scale

The logged-in product should be controlled, stable, and easy to scan.

The product UI should use color and type to organize meaning, not to dominate the interface.

### Page Title

Role: main title for internal product pages.

Spec:

- family: `Display / Sora`
- weight: `650`
- size: `2rem - 2.25rem`
- line-height: `1.05`
- tracking: `-0.03em`

Example:

```tsx
className="font-display font-[650] leading-[1.05] tracking-[-0.03em] text-[2.25rem]"
```

Use for:

- Profile overview
- Versions
- Public page settings
- Resume output
- Portfolio output

### Section Title

Role: title for large sections inside a product page.

Spec:

- family: `UI / Inter`
- weight: `650`
- size: `1.25rem - 1.5rem`
- line-height: `1.2`

Example:

```tsx
className="font-ui font-[650] leading-[1.2] text-[1.5rem]"
```

### Card Title

Role: title for repeated items, cards, dense forms, and compact modules.

Spec:

- family: `UI / Inter`
- weight: `600`
- size: `1rem - 1.125rem`
- line-height: `1.3`

Example:

```tsx
className="font-ui font-semibold leading-[1.3] text-[1.125rem]"
```

### Body UI

Role: default product text.

Spec:

- family: `UI / Inter`
- weight: `500`
- size: `0.875rem`
- line-height: `1.6`

Example:

```tsx
className="font-ui font-medium leading-[1.6] text-[0.875rem]"
```

### Meta

Role: secondary product metadata.

Spec:

- family: `UI / Inter`
- weight: `500`
- size: `0.875rem`
- line-height: `1.5`

Example:

```tsx
className="font-ui font-medium leading-[1.5] text-[0.875rem]"
```

### Label / Status

Role: tags, chips, categories, status badges, and micro-navigation.

Spec:

- family: `UI / Inter`
- weight: `700`
- standard size: `0.75rem`
- compact size: `0.625rem`
- tracking: `0.06em`
- case: uppercase

Example:

```tsx
className="font-ui font-bold tracking-[0.06em] text-[0.75rem] uppercase"
```

Rule:

- Use compact size for small nav badges and dense chips.
- Use standard size for readable status labels inside cards.

### Data / Stat

Role: metrics, raw links, analytics, technical validation, and proof snippets.

Spec:

- family: `Data / IBM Plex Mono`
- weight: `600`
- line size: `0.875rem`
- highlight size: `1.25rem - 1.5rem`

Example:

```tsx
className="font-data font-semibold text-[0.875rem]"
```

Highlight example:

```tsx
className="font-data font-semibold text-[1.5rem]"
```

Use for:

- `+38% Views`
- raw profile URLs
- performance labels
- validated proof counts

## Special Hero Treatment

The prototype includes a high-impact Linktree-like case study.

Use this only when the screen needs campaign impact.

Spec:

- family: `Display / Sora`
- weight: `900`
- size: `58px - 96px`
- line-height: `0.88`
- tracking: `-0.04em`

Pair it with:

- `Inter Medium`
- `20px - 22px`
- line-height `1.4`
- tight or slightly negative tracking

Rule:

- This is an exception, not the everyday product scale.
- Do not bring this treatment into dense product UI.

## Typography And Color

Typography should use the tonal system already present in the prototype.

Default text colors:

- primary text: `Neutral 900 / #0F1115`
- support text: `Neutral 600 - 700`
- soft captions: neutral text with reduced opacity

Landing page combinations:

- `Blue 500 / #2F66D0` with `Lime 500 / #D5F221` for structural energy.
- `Cyan 100 / #CBF3FF` with `Coral 900 / #5E1B1E` for informational warmth.
- `Brown 100 / #F0D7DE` with `Blue 900 / #11254B` or source-specific `#0F2A5D` for editorial depth.
- `Coral 100 / #FFE2D6` with `Cyan 900 / #063C52` for onboarding and human blocks.

Product UI combinations:

- `Violet 100 / #E7E0FF` with `Violet 900 / #281F5E` for versions.
- `Cyan 100 / #CBF3FF` with `Cyan 900 / #063C52` for info and data.
- `Coral 100 / #FFE2D6` with `Coral 900 / #5E1B1E` for community or testimonials.
- `Brown 100 / #F0D7DE` with `Brown 900 / #421D2D` for premium/editorial highlights.

Rule:

- Prefer dark tones from the same color family for typography on colored surfaces.
- Avoid default black on expressive color surfaces when a family-specific dark tone exists.

## Implementation Tokens

Current Tailwind theme source:

```css
@theme {
  --font-display: 'Sora', ui-sans-serif, system-ui, sans-serif;
  --font-ui: 'Inter', ui-sans-serif, system-ui, sans-serif;
  --font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
  --font-data: 'IBM Plex Mono', monospace;
}
```

Recommended semantic mapping:

```ts
const typography = {
  display: "font-display",
  ui: "font-ui",
  sans: "font-sans",
  data: "font-data",
};
```

## Usage Rules

1. Use `Sora` to create presence, not to fill dense UI.
2. Use `Inter` as the default product reading layer.
3. Use `IBM Plex Mono` only where data, proof, links, metrics, or validation need emphasis.
4. Keep landing headlines short and visually strong.
5. Keep product UI text stable, readable, and modular.
6. Do not use `900` weight as the default across the interface.
7. Do not use `200` weight for functional content.
8. Do not create long paragraphs with display typography.
9. Prefer max-width constraints for lead and body text.
10. Use uppercase tracking only for small labels, eyebrows, and badges.

## AI Operating Rules

When generating FolioTree UI:

1. Use this document as the typography source of truth.
2. Use `brand-core.md` and `brand-deck.md` for brand meaning.
3. Use the tonal system for color pairing.
4. Treat landing typography and product typography as separate modes.
5. Do not flatten the product into a cold admin dashboard.
6. Do not make the product look like generic SaaS.
7. Keep typography energetic but controlled.
8. If a use case is not covered here, state the gap instead of inventing a final rule.

## Current Decisions

Approved as working decisions:

- Display font: `Sora`
- UI font: `Inter`
- Data font: `IBM Plex Mono`
- Landing can use stronger editorial scale.
- Product UI must remain controlled and readable.
- `900` is a special-impact weight, not the default hierarchy.
- `650` is the preferred controlled weight for product hierarchy.
- Mono typography should signal proof and system evidence.

## Open Questions

These topics are not final:

- whether fonts will be loaded from Google Fonts or self-hosted in production
- exact mobile-specific type ramps for every breakpoint
- exact token names in the final application codebase
- whether `docs/` will replace `/doc` as the canonical documentation folder

