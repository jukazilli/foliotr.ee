# Template Editor UI Optimization Plan

Status: slice 2 completed  
Created: 2026-04-19  
Scope: UI/UX refactor for `/pages/[pageId]/editor` only  
Reference material: `editor-otimizacao/editor`  

## Context

The current FolioTree page editor is functional, but the editing experience is too large, card-heavy and inefficient for high-density template work.

The folder `editor-otimizacao/` is reference material only. It must not become a second runtime, a parallel editor or a source of business rules.

The real source of truth remains the current FolioTree implementation:

- route: `app/(app)/pages/[pageId]/editor/page.tsx`
- server actions: `app/(app)/pages/[pageId]/editor/actions.ts`
- client editor: `components/pages/CanonicalPageEditor.tsx`
- renderer: `components/templates/TemplateRenderer.tsx`
- block/domain APIs:
  - `POST /api/pages/[pageId]/blocks`
  - `PATCH /api/pages/[pageId]/blocks/[blockId]`
  - `DELETE /api/pages/[pageId]/blocks/[blockId]`
  - `POST /api/pages/[pageId]/blocks/reorder`
  - `POST /api/assets/upload`
- domain contract: `docs/templates-architecture.md` and `docs/templates-canonical-contract.md`

## Current State Found

The editor currently supports:

- listing existing `PageBlock` records
- selecting a block
- editing whitelisted fields from `TemplateBlockDef.editableFields`
- local draft preview before save
- saving block `config` and `assets`
- image upload
- list/repeater editing
- visibility toggle
- reorder
- add block from available definitions
- remove non-required blocks
- rendering the real page preview through `TemplateRenderer`

The main UX problems are:

- page-level header, style notice and publishing cards consume too much vertical space before the editor starts
- left column and main editor are both card-heavy
- preview is full-width and visually dominant, so it feels like a page view instead of an editing canvas
- editing happens in a separate form area above the preview, not directly in the editing surface
- the hierarchy between block list, active block controls and preview is weak
- repeated rounded cards create low information density
- control placement is scattered across multiple cards instead of a compact editor workspace

## Reference UI Findings

`editor-otimizacao/editor/src/imports/Canvas/Canvas.tsx` is a Figma/Vite export. It should be read as a layout reference, not as production code.

Useful patterns to transplant:

- fixed editor workspace with a thin top header
- left sidebar for adding/selecting elements
- central preview/canvas smaller than the viewport, framed like an editable artifact
- right sidebar/property area for current selection controls
- compact control groups with small buttons and tight spacing
- light neutral canvas background
- clear separation between navigation/header, block list, preview and properties

Patterns to avoid copying directly:

- hardcoded absolute positioning
- arbitrary Figma dimensions
- purple reference palette
- generic graphics/product-launch semantics
- unsupported controls such as free shapes, arbitrary text, free background editing, undo/redo unless already backed by real FolioTree behavior
- new editor features not present in the real domain

## Preserve / Transplant / Defer

### Preserve

- route ownership and auth
- `Profile -> Version -> Page -> Template blocks` flow
- page and resume publish actions
- snapshot sync action
- all block APIs and validation
- `TemplateRenderer` as preview renderer
- `PageBlock` order, visibility, config and assets behavior
- canonical template visual lock rules
- existing FolioTree palette, typography and dense spacing tokens
- current component library unless a small local primitive is needed

### Transplant

- editor-as-workspace layout
- compact top toolbar
- left sidebar as the primary block list and add-block surface
- smaller center preview/canvas with stable scale and frame
- selected-block property panel beside the preview
- tighter block rows with status, visibility and selection affordances
- compact action clusters for save, visibility, reorder and remove
- high-density form fields for text, image and repeater editing

### Defer

- backend changes
- new block types
- freeform canvas editing
- arbitrary drag/drop positioning
- undo/redo stack
- theme/color/font customization for canonical templates
- replacing the public renderer
- changing template manifest semantics
- mobile-specific advanced editor beyond a usable stacked fallback

## Target Experience

The editor should open directly into a dense workspace:

1. Top toolbar:
   - breadcrumb/back
   - page/template identity
   - publish state
   - sync
   - page/resume links
   - primary save status feedback

2. Left rail:
   - list of blocks
   - selected block highlight
   - visibility/required indicators
   - compact add-block section

3. Center canvas:
   - reduced preview width
   - stable frame and scrollable canvas area
   - real `TemplateRenderer`
   - preview fed by current draft for the selected block

4. Right inspector:
   - selected block title and metadata
   - save, visibility, reorder and remove actions
   - editable fields
   - image/repeater editing
   - validation/success messages

No business feature should change. The improvement is the editing ergonomics.

## Implementation Slices

### Slice 0 - Baseline And Safety

Goal: capture current behavior and prepare verification before UI changes.

Checklist:

- [x] Confirm editor route loads with existing seeded page
- [x] Record current editor screenshot or browser observation
- [x] Run focused static checks before edits if practical
- [x] Note any existing type/lint failures before changing UI

Proof expected:

- Browser route observed or blocker documented
- `npm run typecheck` or known blocker recorded

Slice 0 result:

- Branch created: `feat/template-editor-ui-optimization`.
- Initial `npm run typecheck` failed because TypeScript included `editor-otimizacao/`, which is reference material and has its own missing Vite/Radix dependencies.
- Baseline config updated to exclude `editor-otimizacao/` from app checks:
  - `tsconfig.json`
  - `.eslintignore`
  - `.prettierignore`
- `npm run typecheck` passes after excluding the reference folder.
- `npm run lint` passes after excluding the reference folder.
- Dev server started at `http://127.0.0.1:3000`.
- Browser verification:
  - `/pages` loads for the current authenticated user `juliano`.
  - Current user has `0 paginas` and cannot open a real owned editor yet.
  - `/templates/portfolio-community` loads, but "Usar modelo" is disabled because the current profile lacks the minimum data required by eligibility.
  - Existing page `cmo6ej2140002mjddfv52ebh6` belongs to `juliano-zilli`; opening `/pages/cmo6ej2140002mjddfv52ebh6/editor` as `juliano` correctly returns 404 by ownership.
  - Browser console showed no errors; only a Next.js warning about future `scroll-behavior: smooth` handling.
- Baseline screenshot artifact captured by Playwright MCP as `slice0-editor-ownership-404.png` for the ownership 404 state.

### Slice 1 - Workspace Shell

Goal: replace page/card-heavy layout with a compact editor workspace while preserving data props.

Files expected:

- `app/(app)/pages/[pageId]/editor/page.tsx`
- `components/pages/CanonicalPageEditor.tsx`

Work:

- Move non-essential explanatory cards out of the first visual path
- Collapse publish/sync/open actions into a top toolbar pattern
- Keep server actions unchanged
- Introduce a full-width editor workspace container
- Avoid nested cards and oversized rounded panels

Acceptance:

- Editor starts near the actual editing workspace
- Publish/sync/open actions still work
- No API contract changed

Slice 1 result:

- `app/(app)/pages/[pageId]/editor/page.tsx` no longer starts with the large `PageIntro`, style notice card and separate publish card.
- Page identity, template state, page/resume publish states, sync, resume and public links were collapsed into a compact toolbar/workspace header.
- Page and resume publish forms still call the existing server actions:
  - `setPagePublishStateAction`
  - `setResumePublishStateAction`
  - `syncPageSnapshotAction`
- `components/pages/CanonicalPageEditor.tsx` now sits inside a denser neutral workspace frame, preparing the next slices for block rail, preview canvas and inspector work.
- No API route, Prisma model, block contract or renderer source changed.
- Browser validation used a temporary local page for the authenticated `juliano` user, then removed it from the database after verification.
- `/pages/{temporaryPageId}/editor` loaded with the compact toolbar, existing block list, selected block editor and real preview.
- Browser console showed no errors; only the existing Next.js `scroll-behavior: smooth` warning.
- Playwright MCP captured `slice1-workspace-shell.png` as the visual evidence for this slice.

### Slice 2 - Left Block Rail

Goal: make the left column the dense block navigation and add-block surface.

Files expected:

- `components/pages/CanonicalPageEditor.tsx`
- optional local subcomponents in `components/pages/CanonicalPageEditor.tsx` first; split only if the file becomes hard to maintain

Work:

- Convert block cards into compact rows
- Keep selection by `selectedBlockId`
- Show block label, order, visibility and required state
- Keep add-block behavior backed by existing `addBlock`
- Add empty/disabled state when no blocks are available

Acceptance:

- Selecting a block updates inspector and preview
- Add block still creates a real `PageBlock`
- Required and hidden states remain visible

Slice 2 result:

- `components/pages/CanonicalPageEditor.tsx` replaced the two large left-column cards with a single compact `aside` rail.
- Existing block selection still uses `selectedBlockId` and the existing `setSelectedBlockId` flow.
- Each block row now shows order, label, block type, selected state, visibility dot and required `fixo` state in a denser row.
- Add-block still calls the existing `addBlock(blockDef.key)` handler and keeps the real `POST /api/pages/[pageId]/blocks` behavior.
- Empty states were preserved for both no current blocks and no available blocks to add.
- `npm run typecheck` passed.
- `npm run lint` passed.
- Browser validation was attempted, but the local Next dev server listened on `127.0.0.1:3000` and then on `127.0.0.1:3001` without returning HTTP responses within the timeout. No browser screenshot was captured for this slice.

### Slice 3 - Center Preview Canvas

Goal: make the preview smaller and canvas-like, matching the reference direction while keeping real rendering.

Files expected:

- `components/pages/CanonicalPageEditor.tsx`

Work:

- Wrap `TemplateRenderer` in a constrained canvas frame
- Use neutral workspace background from FolioTree palette
- Keep preview fed by `previewBlocks`
- Add stable dimensions/responsive constraints so preview does not dominate the editor
- Ensure preview scrolls inside the workspace instead of pushing all controls down

Acceptance:

- Preview appears as a smaller artifact, not full-page output
- Draft edits still reflect in preview before save
- Template renderer remains the only rendering source

### Slice 4 - Right Inspector

Goal: move selected block editing into a compact inspector beside the preview.

Files expected:

- `components/pages/CanonicalPageEditor.tsx`

Work:

- Move current selected-block form into right-side inspector
- Keep all field renderers and upload flows
- Make text, long text, url, image and repeater controls denser
- Group actions at the top of the inspector
- Keep save explicit unless autosave is separately approved later

Acceptance:

- Editing a selected block is done from the inspector
- Save, upload, visibility, reorder and remove still call existing handlers
- Error/success messages remain visible but compact

### Slice 5 - Interaction Polish And Responsiveness

Goal: refine density, keyboard/accessibility basics and smaller screens.

Files expected:

- `components/pages/CanonicalPageEditor.tsx`
- possibly shared UI primitives only if repeated patterns justify it

Work:

- Add clear focus states
- Use icon-first compact controls where familiar
- Ensure text does not overflow buttons or rows
- Define mobile/tablet fallback as stacked: toolbar, blocks, inspector, preview
- Keep colors from Tailwind/FolioTree tokens

Acceptance:

- No incoherent overlap at desktop and mobile widths
- Sidebar rows and action buttons remain readable
- UI feels dense but not cramped

### Slice 6 - Validation And Documentation Closure

Goal: prove that the refactor preserved behavior and update memory.

Checklist:

- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm run test` if touched behavior risks warrant it
- [ ] Browser verification of editor load
- [ ] Browser verification of select block, edit draft, save, visibility, reorder, add and remove
- [ ] Browser verification of preview scale at desktop and mobile widths
- [ ] Update this plan with final status and known residual risks

## Strategic Checklist

- [x] Context and scope confirmed
  - Proof: source-of-truth files and reference folder identified.
- [x] Current editor explored
  - Proof: `CanonicalPageEditor.tsx`, editor route and editor actions inspected.
- [x] Reference UI explored
  - Proof: `editor-otimizacao/editor/src/imports/Canvas/Canvas.tsx` inspected for layout patterns.
- [x] Preserve/transplant/defer map defined
  - Proof: map documented above.
- [x] Slice 0 completed
- [x] Slice 1 completed
- [x] Slice 2 completed
- [ ] Slice 3 completed
- [ ] Slice 4 completed
- [ ] Slice 5 completed
- [ ] Slice 6 completed

## Risks

- `CanonicalPageEditor.tsx` is already large. The first implementation should avoid over-splitting, but after the layout stabilizes it may need small internal subcomponents for block rail, canvas and inspector.
- The preview renderer may have natural full-page assumptions. The canvas frame must constrain it visually without changing public rendering.
- The reference uses absolute positioning and fixed 1440px assumptions. Implementation must translate the idea into responsive Tailwind layout, not copy the generated structure.
- High density can reduce clarity if labels and action states are compressed too aggressively. Keep status and destructive actions explicit.

## Definition Of Done

The optimization is done when:

- the editor keeps all current functions
- blocks still come from real FolioTree data and APIs
- the UI is organized into block rail, smaller preview canvas and selected-block inspector
- the preview is materially smaller and easier to work around
- FolioTree colors and typography are preserved
- no new editor business feature is introduced
- validation commands and browser checks pass or blockers are documented
