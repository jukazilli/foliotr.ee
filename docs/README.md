# FolioTree Documentation Index

Status: active working documentation  
Version: v0.0.1  
Last updated: 2026-04-17

## Purpose

This `/docs` folder stores the current source-of-truth documentation for the FolioTree brand discovery and MVP foundation work completed so far.

The goal is to make the project understandable for humans and AIs with minimal ambiguity.

These files are intentionally written in a stable, explicit style to reduce inference errors and hallucinations.

## Documents

### 1. `brand-core.md`
Use this file first.

It contains the compact and approved brand foundation:
- essence
- purpose
- positioning
- archetype
- personality
- tone of voice
- slogans
- visual direction
- messaging guardrails

Recommended use:
- onboarding a new AI assistant
- writing homepage copy
- writing product copy
- checking whether a concept fits the current brand

### 2. `brand-deck.md`
Use this file second.

It expands the brand core into a broader strategic deck:
- mission
- vision
- values
- audience
- problem framing
- messaging house
- homepage messaging
- design direction
- product language recommendations
- landing page guidance

Recommended use:
- strategic review
- marketing alignment
- design direction
- product/brand coherence checks

### 3. `tonal system.md`
Use this file when implementing color foundations.

It contains the current tonal family prototype and application rules for:
- neutral surfaces
- landing page color usage
- product color usage
- same-family overlay rules
- recommended contrast pairs

### 4. `tipografia-system.md`
Use this file when implementing typography foundations.

It contains the current typography system:
- Display: Sora
- UI: Inter
- Data/Meta: IBM Plex Mono
- landing page type scale
- product UI type scale
- typography usage rules

## Reading order for AI systems

1. Read `brand-core.md`
2. Read `brand-deck.md`
3. Read `tonal system.md`
4. Read `tipografia-system.md`
5. Treat unresolved topics as unresolved
6. Do not invent product features, visual assets, or business decisions that are not explicitly documented

## AI Operating Rules

When using this documentation, an AI assistant should follow these rules:

1. Treat documented decisions as approved until replaced by a newer version.
2. Treat hypotheses, examples, and suggestions as non-final unless marked approved.
3. Do not reinterpret FolioTree as only a resume builder.
4. Do not reinterpret FolioTree as only a portfolio builder.
5. Preserve the idea that FolioTree is a central source of professional identity that can generate multiple outputs.
6. Preserve the idea that the brand should feel vibrant, clear, energetic, and easy to understand.
7. When uncertain, state uncertainty instead of filling gaps with invented details.

## Current Project Truths

The current documented truths are:
- FolioTree is not positioned as just a resume tool.
- FolioTree is not positioned as just a page builder.
- FolioTree is a structured professional identity layer.
- The product direction favors a central profile that can produce pages, resumes, portfolios, and versions for different contexts.
- The brand direction favors energy, clarity, speed of understanding, and strong visual presence.
- The conceptual distinction from LinkedIn is based on evidence, clarity, and fast value perception.

## Documentation Style Notes

This documentation is intentionally:
- explicit
- repetitive where useful
- stable in terminology
- low on metaphor density
- high on semantic clarity

This is intentional and should be preserved when updating these files.

## Known Gaps

These topics are not fully finalized yet and should not be treated as approved facts:
- final visual identity system
- final color palette values
- final logo system
- final UI system
- final feature scope and roadmap
- final category naming in the market

## Current MVP Direction

The active MVP direction is:
- public landing, auth screens, and a light logged-in product shell
- `Profile -> Versions -> Pages / Resumes` as the core navigation model
- PostgreSQL with Prisma for persistence
- data-oriented templates with editable, reorderable, removable, hidable blocks
- resume mode generated from the same profile/version source as public pages

## Update Policy

When updating these docs:
- prefer additive updates over rewriting core meaning
- keep naming consistent across files
- mark major changes with a new version number
- keep a clear line between approved decisions and open questions
